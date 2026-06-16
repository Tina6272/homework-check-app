import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";
import { compressImage } from "./imageCompression";

export type UploadStatus = "queued" | "compressing" | "uploading" | "done" | "error";

export type UploadJob = {
  id: string;
  file: File;
  classCode: string;
  assignmentId: string;
  studentSeat: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  photoPath?: string;
  photoUrl?: string;
};

type Listener = (jobs: UploadJob[]) => void;

export class HomeworkUploadQueue {
  private jobs: UploadJob[] = [];
  private activeCount = 0;
  private listeners = new Set<Listener>();

  constructor(private readonly maxConcurrent = 3) {}

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.jobs);
    return () => this.listeners.delete(listener);
  }

  enqueue(input: Omit<UploadJob, "id" | "status" | "progress">) {
    const job: UploadJob = {
      ...input,
      id: crypto.randomUUID(),
      status: "queued",
      progress: 0,
    };

    this.jobs = [job, ...this.jobs];
    this.emit();
    void this.pump();
    return job.id;
  }

  private async pump() {
    const next = this.jobs.find((job) => job.status === "queued");
    if (!next || this.activeCount >= this.maxConcurrent) return;

    this.activeCount += 1;
    await this.run(next);
    this.activeCount -= 1;
    await this.pump();
  }

  private async run(job: UploadJob) {
    try {
      this.patch(job.id, { status: "compressing", progress: 8 });
      const compressed = await compressImage(job.file);
      const photoPath = `homework/${job.classCode}/${job.assignmentId}/${job.studentSeat}/${Date.now()}-${compressed.name}`;

      if (!storage) {
        const photoUrl = URL.createObjectURL(compressed);
        this.patch(job.id, {
          status: "done",
          progress: 100,
          photoPath,
          photoUrl,
        });
        return;
      }

      this.patch(job.id, { status: "uploading", progress: 18, photoPath });
      const uploadRef = ref(storage, photoPath);
      const task = uploadBytesResumable(uploadRef, compressed, {
        contentType: "image/jpeg",
      });

      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 80) + 18;
            this.patch(job.id, { progress: Math.min(progress, 98) });
          },
          reject,
          () => resolve(),
        );
      });

      const photoUrl = await getDownloadURL(task.snapshot.ref);
      this.patch(job.id, { status: "done", progress: 100, photoUrl });
    } catch (error) {
      this.patch(job.id, {
        status: "error",
        error: error instanceof Error ? error.message : "上傳失敗",
      });
    }
  }

  private patch(id: string, updates: Partial<UploadJob>) {
    this.jobs = this.jobs.map((job) => (job.id === id ? { ...job, ...updates } : job));
    this.emit();
  }

  private emit() {
    const snapshot = [...this.jobs];
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const uploadQueue = new HomeworkUploadQueue();
