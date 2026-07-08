import { Check, ClipboardList, CopyPlus, Flag, HelpCircle, Plus, RotateCcw, SearchCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { Assignment, AssignmentTemplate, Submission } from "../types";

type TeacherDashboardProps = {
  assignments: Assignment[];
  submissions: Submission[];
  summary: { openAssignments: number; done: number; needsAction: number; risk: number };
  templates: AssignmentTemplate[];
  onPublishAssignments: (assignments: Assignment[]) => void;
  onUpdateSubmission: (id: string, patch: Partial<Submission>) => void;
};

type StudentDayStatus = "present" | "leave" | "club";
type AssignmentProgress = "pending" | "done" | "needsHelp" | "assistedDone";
type StudentMarker = { seat: string; dayStatus: StudentDayStatus; assignmentStatus: Record<string, AssignmentProgress> };
type HomeworkDraft = { id: string; type: string; version: string; subject: string; lesson: string; pages: string; questions: string; note: string; suggestedMinutes: number };
type ClassBatch = { id: string; classCode: string; date: string; seatStart: number; seatEnd: number; homework: HomeworkDraft[]; students: StudentMarker[] };

const homeworkTypes = ["課本", "習作", "作業簿", "練習簿", "重點複習", "隨堂演練", "課堂練習", "國語甲本", "國語乙本", "國語語詞簿", "國語造句簿", "考試簿訂正", "測驗卷", "測驗卷訂正", "閱讀分享單", "閱讀護照", "其他"];
const versions = ["康軒版", "翰林版", "南一版"];
const subjects = ["國語", "數學", "英文", "生活", "社會", "自然"];
const reviewLessonOptions = ["期中考複習", "期末考複習"];
const chineseLessonOptions = [...Array.from({ length: 12 }, (_, index) => `第${index + 1}課`), ...reviewLessonOptions];
const unitLessonOptions = [...Array.from({ length: 7 }, (_, unitIndex) => {
  const unit = unitIndex + 1;
  return [`第${unit}單元`, ...Array.from({ length: 4 }, (_, sectionIndex) => `${unit}-${sectionIndex + 1}`)];
}).flat(), ...reviewLessonOptions];
const today = new Date().toISOString().slice(0, 10);

const defaultHomework: HomeworkDraft[] = [
  { id: "hw-1", type: "習作", version: "康軒版", subject: "數學", lesson: "第6單元", pages: "p.32-33", questions: "1-12", note: "先圈出不確定題", suggestedMinutes: 25 },
  { id: "hw-2", type: "國語甲本", version: "康軒版", subject: "國語", lesson: "第8課", pages: "p.14-15", questions: "全部", note: "字跡與標點要自我檢查", suggestedMinutes: 30 },
];

function emptyHomework(): HomeworkDraft {
  return { id: "hw-" + Date.now() + "-" + Math.random().toString(36).slice(2), type: "", version: "", subject: "", lesson: "", pages: "", questions: "", note: "", suggestedMinutes: 0 };
}

export function TeacherDashboard({ assignments, submissions, summary, onPublishAssignments, onUpdateSubmission }: TeacherDashboardProps) {
  const [classCode, setClassCode] = useState("101 班");
  const [date, setDate] = useState(today);
  const [seatStart, setSeatStart] = useState(1);
  const [seatEnd, setSeatEnd] = useState(10);
  const [studentStatuses, setStudentStatuses] = useState<Record<string, StudentDayStatus>>({ "03": "leave", "08": "club" });
  const [homeworkRows, setHomeworkRows] = useState<HomeworkDraft[]>(defaultHomework);
  const [batches, setBatches] = useState<ClassBatch[]>([buildDemoBatch()]);

  const seats = useMemo(() => buildSeatRange(seatStart, seatEnd), [seatStart, seatEnd]);
  const attendance = useMemo(() => {
    const leave = seats.filter((seat) => studentStatuses[seat] === "leave").length;
    return { present: seats.length - leave, leave, club: seats.filter((seat) => studentStatuses[seat] === "club").length };
  }, [seats, studentStatuses]);

  function updateHomework(id: string, patch: Partial<HomeworkDraft>) {
    setHomeworkRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function changeHomeworkType(id: string, type: string) {
    setHomeworkRows((current) => current.map((row) => {
      if (row.id !== id) return row;
      return { ...row, type, subject: fixedSubject(type), version: "", lesson: "", pages: "", questions: "" };
    }));
  }

  function changeHomeworkSubject(id: string, subject: string) {
    updateHomework(id, { subject, lesson: "" });
  }

  function addHomework() {
    setHomeworkRows((current) => [...current, emptyHomework()]);
  }

  function removeHomework(id: string) {
    setHomeworkRows((current) => current.length === 1 ? [emptyHomework()] : current.filter((row) => row.id !== id));
  }

  function toggleStudentStatus(seat: string, nextStatus: StudentDayStatus) {
    setStudentStatuses((current) => ({ ...current, [seat]: current[seat] === nextStatus ? "present" : nextStatus }));
  }

  function publishClassBatch() {
    const publishableHomework = homeworkRows.filter((row) => row.type.trim());
    if (publishableHomework.length === 0) return;
    const batchId = classCode.replace(/\s+/g, "") + "-" + date + "-" + Date.now();
    const publishedAssignments = publishableHomework.map((row, index) => toAssignment(batchId, row, index, classCode));
    const students = seats.map((seat, index) => ({
      seat,
      dayStatus: studentStatuses[seat] ?? "present",
      assignmentStatus: Object.fromEntries(publishableHomework.map((row, homeworkIndex) => [row.id, seedProgress(index, homeworkIndex, studentStatuses[seat] ?? "present")])) as Record<string, AssignmentProgress>,
    }));
    const nextBatch = { id: batchId, classCode, date, seatStart, seatEnd, homework: publishableHomework, students };
    setBatches((current) => [nextBatch, ...current.filter((batch) => !(batch.classCode === classCode && batch.date === date))]);
    onPublishAssignments(publishedAssignments);
  }

  function startNextClass() {
    const match = classCode.match(/(\d+)/);
    setClassCode(match ? `${Number(match[1]) + 1} 班` : "下一班");
    setStudentStatuses({});
    setHomeworkRows([emptyHomework()]);
  }

  function editBatch(batch: ClassBatch) {
    setClassCode(batch.classCode);
    setDate(batch.date);
    setSeatStart(batch.seatStart);
    setSeatEnd(batch.seatEnd);
    setHomeworkRows(batch.homework.map((row) => ({ ...row })));
    setStudentStatuses(Object.fromEntries(batch.students.filter((student) => student.dayStatus !== "present").map((student) => [student.seat, student.dayStatus])) as Record<string, StudentDayStatus>);
  }

  function updateBatchProgress(batchId: string, seat: string, homeworkId: string, progress: AssignmentProgress) {
    setBatches((current) => current.map((batch) => batch.id !== batchId ? batch : {
      ...batch,
      students: batch.students.map((student) => student.seat !== seat ? student : { ...student, assignmentStatus: { ...student.assignmentStatus, [homeworkId]: progress } }),
    }));
  }

  const riskSubmissions = submissions.filter((submission) => submission.riskFlags.length > 0 || ["needsCorrection", "teacherReview", "stuck"].includes(submission.status));

  return (
    <section className="workspace single-column teacher-workspace">
      <div className="panel board-header">
        <div>
          <h2>老師端：逐班派發與當日追蹤</h2>
          <p>每次只處理一個班級、一個日期。派發後先在頂端確認全班作業與進度，必要時可修正，再進入監控。</p>
        </div>
        <div className="mini-stats"><span>開放作業 {summary.openAssignments}</span><span>待處理 {summary.needsAction}</span><span>關注 {summary.risk}</span></div>
      </div>

      <DispatchOverview batches={batches} onEditBatch={editBatch} />

      <div className="panel dispatch-builder">
        <div className="section-title"><CopyPlus size={22} /><h2>單班單日派發</h2></div>
        <div className="class-form-grid">
          <label>班級<input value={classCode} onChange={(event) => setClassCode(event.target.value)} /></label>
          <label>日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label>起始座號<input min="1" type="number" value={seatStart} onChange={(event) => setSeatStart(Number(event.target.value))} /></label>
          <label>結束座號<input min={seatStart} type="number" value={seatEnd} onChange={(event) => setSeatEnd(Number(event.target.value))} /></label>
        </div>
        <div className="attendance-row"><span><Users size={15} />出席 {attendance.present}</span><span>請假 {attendance.leave}</span><span>社團 {attendance.club}</span></div>
        <div className="seat-grid" aria-label="學生座號狀態">
          {seats.map((seat) => {
            const status = studentStatuses[seat] ?? "present";
            return <div key={seat} className={"seat-tile " + status}><strong>{seat}</strong><button type="button" onClick={() => toggleStudentStatus(seat, "leave")}>請假</button><button type="button" onClick={() => toggleStudentStatus(seat, "club")}>社團</button></div>;
          })}
        </div>
      </div>

      <div className="panel template-panel">
        <div className="section-title"><ClipboardList size={22} /><h2>作業模板</h2></div>
        <div className="homework-list">
          {homeworkRows.map((row, index) => (
            <article key={row.id} className="homework-row">
              <div className="homework-row-header"><h3>作業 {index + 1}</h3><button type="button" onClick={() => removeHomework(row.id)}>移除</button></div>
              <div className="homework-fields">
                <label>作業種類<select value={row.type} onChange={(event) => changeHomeworkType(row.id, event.target.value)}><option value="">請選擇作業種類</option>{homeworkTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                {hasVersion(row.type) && <label>版本<select value={row.version} onChange={(event) => updateHomework(row.id, { version: event.target.value })}><option value="">請選擇版本</option>{versions.map((version) => <option key={version} value={version}>{version}</option>)}</select></label>}
                {hasSubject(row.type) && <label>科目<select value={row.subject} onChange={(event) => changeHomeworkSubject(row.id, event.target.value)}><option value="">請選擇科目</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label>}
                {showLesson(row.type) && <LessonPicker row={row} onChange={(lesson) => updateHomework(row.id, { lesson })} />}
                {showPagesAndQuestions(row.type) && <label>頁碼<input value={row.pages} onChange={(event) => updateHomework(row.id, { pages: event.target.value })} /></label>}
                {showPagesAndQuestions(row.type) && <label>題號<input value={row.questions} onChange={(event) => updateHomework(row.id, { questions: event.target.value })} /></label>}
                <label>補充說明<input value={row.note} onChange={(event) => updateHomework(row.id, { note: event.target.value })} /></label>
                <label>建議分鐘<input min="5" type="number" value={row.suggestedMinutes || ""} onChange={(event) => updateHomework(row.id, { suggestedMinutes: Number(event.target.value) })} /></label>
              </div>
            </article>
          ))}
        </div>
        <div className="teacher-actions"><button className="choice" type="button" onClick={addHomework}><Plus size={17} />新增作業</button><button className="primary-action compact" type="button" onClick={publishClassBatch}><CopyPlus size={18} />派發這一班</button><button className="choice" type="button" onClick={startNextClass}>新增下一班</button></div>
      </div>

      <div className="panel">
        <div className="section-title"><SearchCheck size={22} /><h2>當日班級儀錶板</h2></div>
        <div className="class-dashboard-list">
          {batches.map((batch) => <ClassDashboard key={batch.id} batch={batch} onProgressChanged={updateBatchProgress} />)}
        </div>
      </div>

      <div className="panel">
        <div className="section-title"><HelpCircle size={22} /><h2>需要關注的提交</h2></div>
        <div className="submission-list">
          {riskSubmissions.map((submission) => { const assignment = assignments.find((item) => item.id === submission.assignmentId); return <article key={submission.id} className="submission-card"><div><span className={"status " + submission.status}>{statusText(submission.status)}</span><h3>{submission.classCode} 班 {submission.studentSeat} 號：{assignment?.title ?? submission.assignmentId}</h3><p>不確定：{submission.uncertainQuestions.join(", ") || "無"} / 卡住：{submission.stuckQuestions.join(", ") || "無"}</p><p className="risk-line"><Flag size={15} />{submission.riskFlags.join("、") || "無特別風險"}</p></div><div className="card-actions"><button type="button" onClick={() => onUpdateSubmission(submission.id, { status: "assistedDone", riskFlags: [], teacherNote: "老師已現場協助完成" })} title="已協助完成"><Check size={18} /></button><button type="button" onClick={() => onUpdateSubmission(submission.id, { status: "needsCorrection", riskFlags: ["老師要求再修正"] })} title="退回修正"><RotateCcw size={18} /></button></div></article>; })}
        </div>
      </div>
    </section>
  );
}

function DispatchOverview({ batches, onEditBatch }: { batches: ClassBatch[]; onEditBatch: (batch: ClassBatch) => void }) {
  return (
    <div className="panel dispatch-overview-panel">
      <div className="section-title"><SearchCheck size={22} /><h2>今日派發總覽</h2></div>
      <div className="dispatch-overview-list">
        {batches.map((batch) => {
          const totals = progressTotals(batch);
          return (
            <article key={batch.id} className="dispatch-overview-card">
              <div className="dispatch-overview-main">
                <div>
                  <h3>{batch.classCode} / {batch.date}</h3>
                  <p>{batch.seatStart}-{batch.seatEnd} 號，作業 {batch.homework.length} 項</p><p>出席 {attendanceTotals(batch).present} / 請假 {attendanceTotals(batch).leave} / 社團 {attendanceTotals(batch).club}</p>
                </div>
                <button className="choice" type="button" onClick={() => onEditBatch(batch)}>修正</button>
              </div>
              <div className="overview-homework-list">{batch.homework.map((homework) => <span key={homework.id}>{formatHomeworkTitle(homework)}</span>)}</div>
              <div className="overview-progress-row"><span>完成 {totals.done}</span><span>待完成 {totals.pending}</span><span>需協助 {totals.needsHelp}</span><span>已協助 {totals.assistedDone}</span></div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function LessonPicker({ row, onChange }: { row: HomeworkDraft; onChange: (lesson: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const options = lessonOptionsFor(row);
  const selected = parseLessonValues(row.lesson);

  function setSelected(nextSelected: string[]) {
    onChange(Array.from(new Set(nextSelected.map((item) => item.trim()).filter(Boolean))).join("、"));
  }

  function toggleLesson(lesson: string) {
    setSelected(selected.includes(lesson) ? selected.filter((item) => item !== lesson) : [...selected, lesson]);
  }

  function addDraft() {
    const next = draft.trim();
    if (!next) return;
    setSelected([...selected, next]);
    setDraft("");
  }

  function removeLesson(lesson: string) {
    setSelected(selected.filter((item) => item !== lesson));
  }

  return (
    <div className="lesson-picker compact-lesson-picker">
      <span className="field-label">課次</span>
      <div className="lesson-combo">
        <div className="lesson-entry-row">
          <div className="lesson-chip-box" onClick={() => setIsOpen(true)}>
            {selected.map((lesson) => <button key={lesson} type="button" onClick={(event) => { event.stopPropagation(); removeLesson(lesson); }}>{lesson}</button>)}
            <input placeholder={selected.length ? "自填或繼續選" : "自填課次，或選課次"} value={draft} onChange={(event) => setDraft(event.target.value)} onFocus={() => setIsOpen(true)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addDraft(); } }} />
          </div>
          <button className="choice lesson-menu-button" type="button" onClick={() => setIsOpen((current) => !current)}>{isOpen ? "收合" : "選課次"}</button>
        </div>
        {isOpen && <div className="lesson-option-panel">{options.map((lesson) => <button key={lesson} className={selected.includes(lesson) ? "selected" : ""} type="button" onClick={() => toggleLesson(lesson)}>{lesson}</button>)}</div>}
      </div>
    </div>
  );
}

function ClassDashboard({ batch, onProgressChanged }: { batch: ClassBatch; onProgressChanged: (batchId: string, seat: string, homeworkId: string, progress: AssignmentProgress) => void }) {
  const totals = progressTotals(batch);
  return <article className="class-dashboard"><div className="class-dashboard-header"><div><h3>{batch.classCode} / {batch.date}</h3><p>{batch.homework.map(formatHomeworkTitle).join("、")}</p></div><div className="mini-stats"><span>完成 {totals.done}</span><span>待完成 {totals.pending}</span><span>需協助 {totals.needsHelp}</span><span>已協助 {totals.assistedDone}</span></div></div><div className="student-progress-grid">{batch.students.map((student) => <StudentProgressCard key={student.seat} batch={batch} student={student} onProgressChanged={onProgressChanged} />)}</div></article>;
}

function StudentProgressCard({ batch, student, onProgressChanged }: { batch: ClassBatch; student: StudentMarker; onProgressChanged: (batchId: string, seat: string, homeworkId: string, progress: AssignmentProgress) => void }) {
  const counts = batch.homework.reduce((acc, homework) => { acc[student.assignmentStatus[homework.id]] += 1; return acc; }, { pending: 0, done: 0, needsHelp: 0, assistedDone: 0 });
  const trackedTotal = batch.homework.length || 1;
  const doneTotal = counts.done + counts.assistedDone;
  const isLeave = student.dayStatus === "leave";
  return <article className={"student-progress-card " + student.dayStatus}><div className="student-progress-head"><strong>{student.seat} 號</strong>{student.dayStatus === "leave" && <span>請假</span>}{student.dayStatus === "club" && <span>社團</span>}</div>{isLeave ? <p className="muted">仍保留作業內容，老師端今日不追蹤完成度。</p> : <><div className="ratio-bar" aria-label={`完成 ${doneTotal} / 待完成 ${counts.pending} / 協助 ${counts.needsHelp}`}><i className="done" style={{ width: `${(doneTotal / trackedTotal) * 100}%` }} /><i className="pending" style={{ width: `${(counts.pending / trackedTotal) * 100}%` }} /><i className="help" style={{ width: `${(counts.needsHelp / trackedTotal) * 100}%` }} /></div><p className="student-counts">完成 {doneTotal} / 待完成 {counts.pending} / 協助 {counts.needsHelp}</p><div className="mini-task-list">{batch.homework.map((homework) => <button key={homework.id} className={"mini-task " + student.assignmentStatus[homework.id]} type="button" onClick={() => onProgressChanged(batch.id, student.seat, homework.id, nextProgress(student.assignmentStatus[homework.id]))}>{shortHomeworkLabel(homework)}<span>{progressText(student.assignmentStatus[homework.id])}</span></button>)}</div></>}</article>;
}

function attendanceTotals(batch: ClassBatch) {
  return batch.students.reduce((acc, student) => {
    if (student.dayStatus === "leave") acc.leave += 1;
    else {
      acc.present += 1;
      if (student.dayStatus === "club") acc.club += 1;
    }
    return acc;
  }, { present: 0, leave: 0, club: 0 });
}

function progressTotals(batch: ClassBatch) {
  return batch.students.reduce((acc, student) => {
    if (student.dayStatus === "leave") return acc;
    Object.values(student.assignmentStatus).forEach((status) => { acc[status] += 1; });
    return acc;
  }, { pending: 0, done: 0, needsHelp: 0, assistedDone: 0 });
}

function buildSeatRange(start: number, end: number) {
  const safeStart = Math.max(1, Math.min(start || 1, end || 1));
  const safeEnd = Math.max(safeStart, end || safeStart);
  return Array.from({ length: safeEnd - safeStart + 1 }, (_, index) => String(safeStart + index).padStart(2, "0"));
}

function toAssignment(batchId: string, row: HomeworkDraft, index: number, classCode: string): Assignment {
  const fallback = templatesFallback(displaySubject(row));
  return { id: `${batchId}-${row.id}-${index}`, classCode, templateId: row.type, subject: displaySubject(row) || fallback.subject, title: formatHomeworkTitle(row), description: row.note || "學生完成後，先依 App 步驟自我檢查，再標記不確定或卡住的題目。", questionRange: [row.lesson, row.pages, row.questions].filter(Boolean).join(" / "), suggestedMinutes: row.suggestedMinutes, selfCheckItems: fallback.selfCheckItems, requiresPeerCheck: false, status: "open" };
}

function templatesFallback(subject: string) {
  if (subject === "數學") return { subject: "數學", selfCheckItems: ["題號都有寫到", "每題都有檢查算式", "不確定的題目有標記"] };
  if (subject === "英文") return { subject: "英文", selfCheckItems: ["單字都有寫完", "拼字有再看一次", "不熟的單字有圈起來"] };
  return { subject: subject || "國語", selfCheckItems: ["題目都有作答", "字跡清楚", "不會的地方有標記"] };
}

function buildDemoBatch(): ClassBatch {
  const homework = defaultHomework;
  return { id: "demo-101", classCode: "101 班", date: today, seatStart: 1, seatEnd: 10, homework, students: buildSeatRange(1, 10).map((seat, index) => ({ seat, dayStatus: seat === "03" ? "leave" : seat === "08" ? "club" : "present", assignmentStatus: Object.fromEntries(homework.map((row, homeworkIndex) => [row.id, seedProgress(index, homeworkIndex, seat === "03" ? "leave" : seat === "08" ? "club" : "present")])) as Record<string, AssignmentProgress> })) };
}

function seedProgress(studentIndex: number, homeworkIndex: number, dayStatus: StudentDayStatus): AssignmentProgress {
  if (dayStatus === "leave") return "pending";
  const seed = (studentIndex + homeworkIndex) % 5;
  if (seed === 0) return "needsHelp";
  if (seed === 1) return "assistedDone";
  if (seed <= 3) return "done";
  return "pending";
}

function hasVersion(type: string) {
  return !isMinimalType(type) && ["課本", "習作", "作業簿", "練習簿", "重點複習", "隨堂演練", "課堂練習", "國語甲本", "國語乙本"].includes(type);
}

function hasSubject(type: string) {
  return !!type && !isMinimalType(type) && !["國語甲本", "國語乙本", "國語語詞簿", "國語造句簿"].includes(type);
}

function showLesson(type: string) {
  return !!type && !isMinimalType(type);
}

function showPagesAndQuestions(type: string) {
  return !!type && !isMinimalType(type);
}

function isMinimalType(type: string) {
  return ["閱讀分享單", "閱讀護照", "其他"].includes(type);
}

function fixedSubject(type: string) {
  return ["國語甲本", "國語乙本", "國語語詞簿", "國語造句簿"].includes(type) ? "國語" : "";
}

function displaySubject(row: HomeworkDraft) {
  return fixedSubject(row.type) || row.subject;
}

function lessonOptionsFor(row: HomeworkDraft) {
  const subject = displaySubject(row);
  if (subject === "國語") return chineseLessonOptions;
  if (["數學", "生活", "社會", "自然"].includes(subject)) return unitLessonOptions;
  return chineseLessonOptions;
}

function parseLessonValues(value: string) {
  return value.split(/[、,，\n]+/).map((item) => item.trim()).filter(Boolean);
}

function formatHomeworkTitle(row: HomeworkDraft) {
  if (isMinimalType(row.type)) return [row.type, row.note].filter(Boolean).join(" ");
  return [displaySubject(row), row.type, row.version, row.lesson, row.pages, row.questions].filter(Boolean).join(" ");
}

function shortHomeworkLabel(row: HomeworkDraft) {
  return row.type.slice(0, 4);
}

function nextProgress(progress: AssignmentProgress): AssignmentProgress {
  return { pending: "done", done: "needsHelp", needsHelp: "assistedDone", assistedDone: "pending" }[progress] as AssignmentProgress;
}

function progressText(progress: AssignmentProgress) {
  return { pending: "待完成", done: "完成", needsHelp: "協助", assistedDone: "已協助" }[progress];
}

function statusText(status: Submission["status"]) {
  return { notStarted: "尚未開始", inProgress: "進行中", selfCheck: "自我檢查中", needsCorrection: "需要修正", teacherReview: "等待老師確認", assistedDone: "已協助完成", done: "已完成", stuck: "卡住了" }[status];
}


