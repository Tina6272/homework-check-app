import { CheckCircle2, ClipboardCheck, Home, ListChecks, Medal, RefreshCw, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ParentDashboard } from "./components/ParentDashboard";
import { StudentPanel } from "./components/StudentPanel";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { isFirebaseReady } from "./lib/firebase";
import type { Assignment, AssignmentTemplate, StudentStats, Submission, ViewMode } from "./types";

const templates: AssignmentTemplate[] = [
  {
    id: "math-workbook",
    name: "數學習作",
    subject: "數學",
    defaultMinutes: 25,
    selfCheckItems: ["每一題都有作答", "圈出不確定題目", "檢查單位與格式", "至少重看 2 題"],
  },
  {
    id: "chinese-workbook",
    name: "國語甲本",
    subject: "國語",
    defaultMinutes: 30,
    selfCheckItems: ["檢查是否漏字", "確認標點符號", "圈出不會的語詞", "訂正錯字"],
  },
  {
    id: "english-vocabulary",
    name: "英文單字",
    subject: "英文",
    defaultMinutes: 20,
    selfCheckItems: ["每個單字都寫完", "遮住中文測一次", "圈出不熟的單字", "訂正拼錯的字"],
  },
];

const initialAssignments: Assignment[] = [
  {
    id: "a-math-0616",
    classCode: "A",
    templateId: "math-workbook",
    subject: "數學",
    title: "數學習作 p.32-33",
    description: "完成 1-12 題，先寫紙本，再進 App 自查。",
    questionRange: "1-12",
    suggestedMinutes: 25,
    selfCheckItems: templates[0].selfCheckItems,
    requiresPeerCheck: true,
    status: "open",
  },
  {
    id: "b-math-0616",
    classCode: "B",
    templateId: "math-workbook",
    subject: "數學",
    title: "數學習作 p.28-29",
    description: "完成 1-8 題，標記不確定題號。",
    questionRange: "1-8",
    suggestedMinutes: 20,
    selfCheckItems: templates[0].selfCheckItems,
    requiresPeerCheck: false,
    status: "open",
  },
  {
    id: "c-chinese-0616",
    classCode: "C",
    templateId: "chinese-workbook",
    subject: "國語",
    title: "國語甲本第 8 課",
    description: "完成 p.14-15，檢查漏字與標點。",
    questionRange: "p.14-15",
    suggestedMinutes: 30,
    selfCheckItems: templates[1].selfCheckItems,
    requiresPeerCheck: false,
    status: "open",
  },
];

const initialSubmissions: Submission[] = [
  {
    id: "demo-a-08",
    classCode: "A",
    studentSeat: "08",
    assignmentId: "a-math-0616",
    status: "needsCorrection",
    targetMinutes: 25,
    actualMinutes: 18,
    checkedItems: templates[0].selfCheckItems,
    confidence: "someUncertain",
    uncertainQuestions: ["5", "8"],
    correctedQuestions: ["5"],
    stuckQuestions: ["8"],
    riskFlags: ["有未完成訂正題"],
    updatedAt: "今天 16:20",
  },
  {
    id: "demo-a-12",
    classCode: "A",
    studentSeat: "12",
    assignmentId: "a-math-0616",
    status: "teacherReview",
    targetMinutes: 25,
    actualMinutes: 7,
    checkedItems: templates[0].selfCheckItems.slice(0, 2),
    confidence: "high",
    uncertainQuestions: [],
    correctedQuestions: [],
    stuckQuestions: [],
    riskFlags: ["完成過快", "自查未完成"],
    updatedAt: "今天 16:12",
  },
  {
    id: "demo-b-03",
    classCode: "B",
    studentSeat: "03",
    assignmentId: "b-math-0616",
    status: "done",
    targetMinutes: 20,
    actualMinutes: 23,
    checkedItems: templates[0].selfCheckItems,
    confidence: "high",
    uncertainQuestions: ["4"],
    correctedQuestions: ["4"],
    stuckQuestions: [],
    riskFlags: [],
    updatedAt: "今天 16:35",
  },
];

const tabs: Array<{ id: ViewMode; label: string; icon: typeof ListChecks }> = [
  { id: "student", label: "學生端", icon: ListChecks },
  { id: "teacher", label: "老師端", icon: ClipboardCheck },
  { id: "parent", label: "家長端", icon: Home },
];

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("student");
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [studentStats, setStudentStats] = useState<StudentStats>({
    seat: "08",
    classCode: "A",
    points: 14,
    streak: 4,
    pending: 1,
  });

  const summary = useMemo(() => {
    const openAssignments = assignments.filter((assignment) => assignment.status === "open").length;
    return {
      openAssignments,
      done: submissions.filter((item) => item.status === "done").length,
      needsAction: submissions.filter((item) =>
        ["needsCorrection", "teacherReview", "stuck"].includes(item.status),
      ).length,
      risk: submissions.filter((item) => item.riskFlags.length > 0).length,
    };
  }, [assignments, submissions]);

  function upsertSubmission(nextSubmission: Submission) {
    setSubmissions((current) => {
      const exists = current.some((submission) => submission.id === nextSubmission.id);
      if (exists) {
        return current.map((submission) => (submission.id === nextSubmission.id ? nextSubmission : submission));
      }
      return [nextSubmission, ...current];
    });
    setStudentStats((current) => ({
      ...current,
      points: nextSubmission.status === "done" ? current.points + 2 : current.points,
      pending: nextSubmission.status === "done" ? Math.max(0, current.pending - 1) : current.pending + 1,
    }));
  }

  function updateSubmission(id: string, patch: Partial<Submission>) {
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id
          ? {
              ...submission,
              ...patch,
              updatedAt: "剛剛",
            }
          : submission,
      ),
    );
  }

  function publishAssignments(nextAssignments: Assignment[]) {
    setAssignments((current) => [...nextAssignments, ...current]);
  }

  const ActivePanel =
    viewMode === "student" ? (
      <StudentPanel
        assignments={assignments}
        stats={studentStats}
        submissions={submissions}
        onStudentChanged={setStudentStats}
        onSubmitted={upsertSubmission}
      />
    ) : viewMode === "teacher" ? (
      <TeacherDashboard
        assignments={assignments}
        submissions={submissions}
        summary={summary}
        templates={templates}
        onPublishAssignments={publishAssignments}
        onUpdateSubmission={updateSubmission}
      />
    ) : (
      <ParentDashboard assignments={assignments} submissions={submissions} stats={studentStats} />
    );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">第一階段測試版</p>
          <h1>紙本作業自主訂正與風險抽查系統</h1>
          <p className="topbar-note">Firestore-only 流程版：不拍照、不 OCR，先測作業派發、自查、訂正與風險抽查。</p>
        </div>
        <div className={isFirebaseReady ? "sync-pill online" : "sync-pill"}>
          <RefreshCw size={16} />
          {isFirebaseReady ? "Firebase 設定已載入" : "本機展示模式"}
        </div>
      </header>

      <section className="quick-stats" aria-label="測試版摘要">
        <div>
          <CheckCircle2 size={22} />
          <strong>{summary.done}</strong>
          <span>已完成</span>
        </div>
        <div>
          <Users size={22} />
          <strong>{summary.needsAction}</strong>
          <span>待訂正 / 待老師看</span>
        </div>
        <div>
          <Medal size={22} />
          <strong>{summary.risk}</strong>
          <span>風險提示</span>
        </div>
      </section>

      <nav className="tabs" aria-label="切換角色">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={viewMode === tab.id ? "active" : ""}
              type="button"
              onClick={() => setViewMode(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {ActivePanel}
    </main>
  );
}
