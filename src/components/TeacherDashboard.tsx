import { AlertTriangle, Check, CopyPlus, RotateCcw, SearchCheck } from "lucide-react";
import { useState } from "react";
import type { Assignment, AssignmentTemplate, Submission } from "../types";

type TeacherDashboardProps = {
  assignments: Assignment[];
  submissions: Submission[];
  summary: { openAssignments: number; done: number; needsAction: number; risk: number };
  templates: AssignmentTemplate[];
  onPublishAssignments: (assignments: Assignment[]) => void;
  onUpdateSubmission: (id: string, patch: Partial<Submission>) => void;
};

const classCodes = ["A", "B", "C"];
const assignmentSlots = [
  { templateId: "math-workbook", label: "數學習作", defaultContent: "p.32-33，第 1-12 題", defaultMinutes: 25 },
  { templateId: "chinese-workbook", label: "國語習作", defaultContent: "第 8 課 p.14-15", defaultMinutes: 30 },
  { templateId: "english-vocabulary", label: "英文單字", defaultContent: "單字 1-10", defaultMinutes: 20 },
];

export function TeacherDashboard({ assignments, submissions, summary, templates, onPublishAssignments, onUpdateSubmission }: TeacherDashboardProps) {
  const [rows, setRows] = useState(classCodes.flatMap((classCode) => assignmentSlots.map((slot) => ({ classCode, templateId: slot.templateId, label: slot.label, enabled: true, title: slot.label + " " + slot.defaultContent, description: "學生完成後，先依 App 步驟自我檢查，再標記不確定或卡住的題目。", questionRange: slot.defaultContent, suggestedMinutes: slot.defaultMinutes }))));

  function updateRow(classCode: string, templateId: string, patch: Partial<(typeof rows)[number]>) {
    setRows((current) => current.map((row) => row.classCode === classCode && row.templateId === templateId ? { ...row, ...patch } : row));
  }

  function publish() {
    const now = Date.now();
    const nextAssignments: Assignment[] = rows.filter((row) => row.enabled).map((row, index) => {
      const template = templates.find((item) => item.id === row.templateId);
      return { id: row.classCode + "-" + row.templateId + "-" + now + "-" + index, classCode: row.classCode, templateId: row.templateId, subject: template?.subject ?? row.label, title: row.title, description: row.description, questionRange: row.questionRange, suggestedMinutes: row.suggestedMinutes, selfCheckItems: template?.selfCheckItems ?? [], requiresPeerCheck: row.classCode === "A", status: "open" };
    });
    onPublishAssignments(nextAssignments);
  }

  const riskSubmissions = submissions.filter((submission) => submission.riskFlags.length > 0 || submission.status !== "done");

  return (
    <section className="workspace single-column">
      <div className="panel board-header">
        <div><h2>老師端：派作業與追蹤狀態</h2><p>目前先用前端假資料呈現，重點是確認老師要看哪些學生需要協助，而不是取代學生的自我檢查。</p></div>
        <div className="mini-stats"><span>開放作業 {summary.openAssignments}</span><span>待處理 {summary.needsAction}</span><span>關注 {summary.risk}</span></div>
      </div>
      <div className="panel">
        <div className="section-title"><CopyPlus size={22} /><h2>批次派作業</h2></div>
        <p className="muted">這裡先做成可討論的原型：老師可以依班級快速建立作業，之後再接 Firestore。</p>
        <div className="dispatch-grid">
          {classCodes.map((classCode) => <article key={classCode} className="dispatch-card class-column"><h3>{classCode} 班</h3>{rows.filter((row) => row.classCode === classCode).map((row) => <div key={row.templateId} className="subject-dispatch"><label className="check-item"><input checked={row.enabled} type="checkbox" onChange={() => updateRow(row.classCode, row.templateId, { enabled: !row.enabled })} />{row.label}</label><label>作業名稱<input value={row.title} onChange={(event) => updateRow(row.classCode, row.templateId, { title: event.target.value })} /></label><label>題目範圍<input value={row.questionRange} onChange={(event) => updateRow(row.classCode, row.templateId, { questionRange: event.target.value })} /></label><label>建議分鐘<input type="number" value={row.suggestedMinutes} onChange={(event) => updateRow(row.classCode, row.templateId, { suggestedMinutes: Number(event.target.value) })} /></label></div>)}</article>)}
        </div>
        <button className="primary-action" type="button" onClick={publish}><CopyPlus size={18} />發布到學生端</button>
      </div>
      <div className="panel">
        <div className="section-title"><SearchCheck size={22} /><h2>需要關注的提交</h2></div>
        <div className="submission-list">
          {riskSubmissions.map((submission) => { const assignment = assignments.find((item) => item.id === submission.assignmentId); return <article key={submission.id} className="submission-card"><div><span className={"status " + submission.status}>{statusText(submission.status)}</span><h3>{submission.classCode} 班 {submission.studentSeat} 號：{assignment?.title ?? submission.assignmentId}</h3><p>不確定：{submission.uncertainQuestions.join(", ") || "無"} / 卡住：{submission.stuckQuestions.join(", ") || "無"}</p><p className="risk-line"><AlertTriangle size={15} />{submission.riskFlags.join("、") || "無特別風險"}</p></div><div className="card-actions"><button type="button" onClick={() => onUpdateSubmission(submission.id, { status: "done", riskFlags: [] })} title="標記完成"><Check size={18} /></button><button type="button" onClick={() => onUpdateSubmission(submission.id, { status: "needsCorrection", riskFlags: ["老師要求再修正"] })} title="退回修正"><RotateCcw size={18} /></button></div></article>; })}
        </div>
      </div>
    </section>
  );
}

function statusText(status: Submission["status"]) {
  return { notStarted: "尚未開始", inProgress: "進行中", selfCheck: "自我檢查中", needsCorrection: "需要修正", teacherReview: "等待老師確認", done: "已完成", stuck: "卡住了" }[status];
}
