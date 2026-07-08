import { CheckCircle2, ClipboardCheck, Home, ListChecks, Medal, RefreshCw, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ParentDashboard } from "./components/ParentDashboard";
import { StudentPanel } from "./components/StudentPanel";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { isFirebaseReady } from "./lib/firebase";
import type { Assignment, AssignmentTemplate, StudentStats, Submission, ViewMode } from "./types";

const templates: AssignmentTemplate[] = [
  { id: "math-workbook", name: "數學習作", subject: "數學", defaultMinutes: 25, selfCheckItems: ["題號都有寫到", "每題都有檢查算式", "錯題已圈起來", "不確定的題目有標記"] },
  { id: "chinese-workbook", name: "國語習作", subject: "國語", defaultMinutes: 30, selfCheckItems: ["字跡清楚", "題目都有作答", "標點符號有檢查", "不會的地方有標記"] },
  { id: "english-vocabulary", name: "英文單字", subject: "英文", defaultMinutes: 20, selfCheckItems: ["單字都有寫完", "拼字有再看一次", "不熟的單字有圈起來", "已經念過一遍"] },
];

const initialAssignments: Assignment[] = [
  { id: "a-math-0616", classCode: "A", templateId: "math-workbook", subject: "數學", title: "數學習作 p.32-33", description: "完成第 1-12 題，寫完後先照 App 步驟自我檢查。", questionRange: "1-12", suggestedMinutes: 25, selfCheckItems: templates[0].selfCheckItems, requiresPeerCheck: true, status: "open" },
  { id: "b-math-0616", classCode: "B", templateId: "math-workbook", subject: "數學", title: "數學習作 p.28-29", description: "完成第 1-8 題，遇到不確定的題目要標記。", questionRange: "1-8", suggestedMinutes: 20, selfCheckItems: templates[0].selfCheckItems, requiresPeerCheck: false, status: "open" },
  { id: "c-chinese-0616", classCode: "C", templateId: "chinese-workbook", subject: "國語", title: "國語習作第 8 課", description: "完成 p.14-15，寫完後檢查字跡與標點。", questionRange: "p.14-15", suggestedMinutes: 30, selfCheckItems: templates[1].selfCheckItems, requiresPeerCheck: false, status: "open" },
];

const initialSubmissions: Submission[] = [
  { id: "demo-a-08", classCode: "A", studentSeat: "08", assignmentId: "a-math-0616", status: "needsCorrection", targetMinutes: 25, actualMinutes: 18, checkedItems: templates[0].selfCheckItems, confidence: "someUncertain", uncertainQuestions: ["5", "8"], correctedQuestions: ["5"], stuckQuestions: ["8"], riskFlags: ["還有卡住題目"], updatedAt: "今天 16:20" },
  { id: "demo-a-12", classCode: "A", studentSeat: "12", assignmentId: "a-math-0616", status: "teacherReview", targetMinutes: 25, actualMinutes: 7, checkedItems: templates[0].selfCheckItems.slice(0, 2), confidence: "high", uncertainQuestions: [], correctedQuestions: [], stuckQuestions: [], riskFlags: ["完成太快", "自我檢查不足"], updatedAt: "今天 16:12" },
  { id: "demo-b-03", classCode: "B", studentSeat: "03", assignmentId: "b-math-0616", status: "done", targetMinutes: 20, actualMinutes: 23, checkedItems: templates[0].selfCheckItems, confidence: "high", uncertainQuestions: ["4"], correctedQuestions: ["4"], stuckQuestions: [], riskFlags: [], updatedAt: "今天 16:35" },
];

const tabs: Array<{ id: ViewMode; label: string; icon: typeof ListChecks }> = [
  { id: "teacher", label: "老師端", icon: ClipboardCheck },
  { id: "student", label: "學生端", icon: ListChecks },
  { id: "parent", label: "家長端", icon: Home },
];

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("teacher");
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [studentStats, setStudentStats] = useState<StudentStats>({ seat: "08", classCode: "A", points: 14, streak: 4, pending: 1 });

  const summary = useMemo(() => ({
    openAssignments: assignments.filter((assignment) => assignment.status === "open").length,
    done: submissions.filter((item) => item.status === "done").length,
    needsAction: submissions.filter((item) => ["needsCorrection", "teacherReview", "stuck"].includes(item.status)).length,
    risk: submissions.filter((item) => item.riskFlags.length > 0).length,
  }), [assignments, submissions]);

  function upsertSubmission(nextSubmission: Submission) {
    setSubmissions((current) => current.some((item) => item.id === nextSubmission.id) ? current.map((item) => item.id === nextSubmission.id ? nextSubmission : item) : [nextSubmission, ...current]);
    setStudentStats((current) => ({ ...current, points: nextSubmission.status === "done" ? current.points + 2 : current.points, pending: nextSubmission.status === "done" ? Math.max(0, current.pending - 1) : current.pending + 1 }));
  }

  function updateSubmission(id: string, patch: Partial<Submission>) {
    setSubmissions((current) => current.map((item) => item.id === id ? { ...item, ...patch, updatedAt: "剛剛" } : item));
  }

  const activePanel = viewMode === "student" ? (
    <StudentPanel assignments={assignments} stats={studentStats} submissions={submissions} onStudentChanged={setStudentStats} onSubmitted={upsertSubmission} />
  ) : viewMode === "teacher" ? (
    <TeacherDashboard assignments={assignments} submissions={submissions} summary={summary} templates={templates} onPublishAssignments={(next) => setAssignments((current) => [...next, ...current])} onUpdateSubmission={updateSubmission} />
  ) : (
    <ParentDashboard assignments={assignments} submissions={submissions} stats={studentStats} />
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">課後班作業自我檢查工具</p>
          <h1>讓學生自己完成、檢查、修正作業</h1>
          <p className="topbar-note">目前是可討論的前端原型，先用假資料呈現學生、老師、家長三個視角。Firebase 有設定入口，但資料流程尚未定案。</p>
        </div>
        <div className={isFirebaseReady ? "sync-pill online" : "sync-pill"}><RefreshCw size={16} />{isFirebaseReady ? "Firebase 已連線" : "本機假資料模式"}</div>
      </header>
      <section className="quick-stats" aria-label="作業狀態摘要">
        <div><CheckCircle2 size={22} /><strong>{summary.done}</strong><span>已完成</span></div>
        <div><Users size={22} /><strong>{summary.needsAction}</strong><span>待修正或老師確認</span></div>
        <div><Medal size={22} /><strong>{summary.risk}</strong><span>需要關注</span></div>
      </section>
      <nav className="tabs" aria-label="切換介面">
        {tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} className={viewMode === tab.id ? "active" : ""} type="button" onClick={() => setViewMode(tab.id)}><Icon size={18} />{tab.label}</button>; })}
      </nav>
      {activePanel}
    </main>
  );
}
