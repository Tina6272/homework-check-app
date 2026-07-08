import { AlertCircle, CheckCircle2, CircleHelp, Clock, Flag, ListChecks, Send } from "lucide-react";
import { useMemo, useState } from "react";
import type { Assignment, ConfidenceLevel, StudentStats, Submission } from "../types";

type StudentPanelProps = {
  assignments: Assignment[];
  stats: StudentStats;
  submissions: Submission[];
  onStudentChanged: (stats: StudentStats) => void;
  onSubmitted: (submission: Submission) => void;
};

const confidenceOptions: Array<{ id: ConfidenceLevel; label: string }> = [
  { id: "high", label: "我很確定" },
  { id: "someUncertain", label: "有 1-2 題不確定" },
  { id: "manyUncertain", label: "很多題不確定" },
  { id: "needHelp", label: "我需要老師幫忙" },
];

export function StudentPanel({ assignments, stats, submissions, onStudentChanged, onSubmitted }: StudentPanelProps) {
  const visibleAssignments = assignments.filter((assignment) => assignment.classCode === stats.classCode && assignment.status === "open");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(visibleAssignments[0]?.id ?? "");
  const selectedAssignment = visibleAssignments.find((assignment) => assignment.id === selectedAssignmentId);
  const existingSubmission = submissions.find((submission) => submission.assignmentId === selectedAssignmentId && submission.classCode === stats.classCode && submission.studentSeat === stats.seat);
  const [step, setStep] = useState<"ready" | "writing" | "selfCheck" | "questions" | "review">(existingSubmission?.status === "done" ? "review" : "ready");
  const [targetMinutes, setTargetMinutes] = useState(selectedAssignment?.suggestedMinutes ?? 25);
  const [checkedItems, setCheckedItems] = useState<string[]>(existingSubmission?.checkedItems ?? []);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(existingSubmission?.confidence ?? "someUncertain");
  const [uncertainText, setUncertainText] = useState(existingSubmission?.uncertainQuestions.join(", ") ?? "");
  const [correctedText, setCorrectedText] = useState(existingSubmission?.correctedQuestions.join(", ") ?? "");
  const [stuckText, setStuckText] = useState(existingSubmission?.stuckQuestions.join(", ") ?? "");
  const progress = useMemo(() => ["ready", "writing", "selfCheck", "questions", "review"].indexOf(step) + 1, [step]);

  function parseQuestions(value: string) {
    return value.split(/[,，\s]+/).map((item) => item.trim()).filter(Boolean);
  }

  function toggleCheckedItem(item: string) {
    setCheckedItems((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  function buildSubmission(status: Submission["status"]): Submission {
    const uncertainQuestions = parseQuestions(uncertainText);
    const correctedQuestions = parseQuestions(correctedText);
    const stuckQuestions = parseQuestions(stuckText);
    const riskFlags: string[] = [];
    if (selectedAssignment && checkedItems.length < selectedAssignment.selfCheckItems.length) riskFlags.push("自我檢查未完成");
    if (confidence === "needHelp" || stuckQuestions.length > 0) riskFlags.push("需要老師協助");
    if (uncertainQuestions.length === 0 && confidence === "high") riskFlags.push("沒有標記不確定題，建議抽查");
    return { id: existingSubmission?.id ?? stats.classCode + "-" + stats.seat + "-" + selectedAssignmentId, classCode: stats.classCode, studentSeat: stats.seat, assignmentId: selectedAssignmentId, status, startedAt: existingSubmission?.startedAt ?? "剛剛", finishedAt: status === "done" ? "剛剛" : existingSubmission?.finishedAt, targetMinutes, actualMinutes: existingSubmission?.actualMinutes, checkedItems, confidence, uncertainQuestions, correctedQuestions, stuckQuestions, riskFlags, updatedAt: "剛剛" };
  }

  function submit(status: Submission["status"]) {
    onSubmitted(buildSubmission(status));
    setStep("review");
  }

  return (
    <section className="workspace">
      <div className="panel flow-panel">
        <div className="section-title"><ListChecks size={22} /><h2>學生自我檢查流程</h2></div>
        <div className="student-identity">
          <label>班級<select value={stats.classCode} onChange={(event) => { onStudentChanged({ ...stats, classCode: event.target.value }); setSelectedAssignmentId(""); setStep("ready"); }}><option value="A">A 班</option><option value="B">B 班</option><option value="C">C 班</option></select></label>
          <label>座號<input value={stats.seat} onChange={(event) => onStudentChanged({ ...stats, seat: event.target.value })} /></label>
        </div>
        <div className="flow-meter"><span>進度 {progress}/5</span><progress value={progress} max="5" /></div>
        <label>選擇作業<select value={selectedAssignmentId} onChange={(event) => { const nextAssignment = visibleAssignments.find((assignment) => assignment.id === event.target.value); setSelectedAssignmentId(event.target.value); setTargetMinutes(nextAssignment?.suggestedMinutes ?? 25); setCheckedItems([]); setStep("ready"); }}><option value="">請選擇今天的作業</option>{visibleAssignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}</select></label>
        {selectedAssignment ? <article className="assignment-summary"><strong>{selectedAssignment.subject}：{selectedAssignment.title}</strong><p>{selectedAssignment.description}</p><span>題目範圍：{selectedAssignment.questionRange}</span><span>建議時間：{selectedAssignment.suggestedMinutes} 分鐘</span></article> : <p className="muted">選擇班級與作業後，就可以開始走自我檢查流程。</p>}
        {selectedAssignment && step === "ready" && <div className="step-card"><h3>1. 先設定目標</h3><p>先想好這份作業大概需要多久，完成後再回來檢查自己有沒有照步驟做。</p><div className="choice-row">{[selectedAssignment.suggestedMinutes - 5, selectedAssignment.suggestedMinutes, selectedAssignment.suggestedMinutes + 10].filter((minutes) => minutes > 0).map((minutes) => <button key={minutes} className={targetMinutes === minutes ? "choice active" : "choice"} type="button" onClick={() => setTargetMinutes(minutes)}>{minutes} 分鐘</button>)}</div><button className="primary-action" type="button" onClick={() => setStep("writing")}><Clock size={18} />開始寫作業</button></div>}
        {selectedAssignment && step === "writing" && <div className="step-card"><h3>2. 專心完成作業</h3><p className="timer-display">{targetMinutes}:00</p><p>這裡先用靜態倒數呈現，之後可以再討論是否要做真正計時器。</p><div className="action-row"><button type="button" onClick={() => submit("stuck")}><CircleHelp size={18} />我卡住了</button><button className="primary-action compact" type="button" onClick={() => setStep("selfCheck")}><CheckCircle2 size={18} />我寫完了</button></div></div>}
        {selectedAssignment && step === "selfCheck" && <div className="step-card"><h3>3. 自我檢查</h3><p>請學生逐項勾選，讓 App 引導他先自己檢查，而不是直接交給老師。</p><div className="check-list">{selectedAssignment.selfCheckItems.map((item) => <label key={item} className="check-item"><input checked={checkedItems.includes(item)} type="checkbox" onChange={() => toggleCheckedItem(item)} />{item}</label>)}</div><button className="primary-action" disabled={checkedItems.length === 0} type="button" onClick={() => setStep("questions")}>下一步：標記不確定題目</button></div>}
        {selectedAssignment && step === "questions" && <div className="step-card"><h3>4. 記錄不確定與修正</h3><div className="choice-row">{confidenceOptions.map((option) => <button key={option.id} className={confidence === option.id ? "choice active" : "choice"} type="button" onClick={() => setConfidence(option.id)}>{option.label}</button>)}</div><div className="field-grid"><label>不確定題號<input placeholder="例如：5, 8" value={uncertainText} onChange={(event) => setUncertainText(event.target.value)} /></label><label>已修正題號<input placeholder="例如：5" value={correctedText} onChange={(event) => setCorrectedText(event.target.value)} /></label><label>還卡住的題號<input placeholder="例如：8" value={stuckText} onChange={(event) => setStuckText(event.target.value)} /></label></div><button className="primary-action" type="button" onClick={() => submit(stuckText ? "teacherReview" : "done")}><Send size={18} />送出作業狀態</button></div>}
        {selectedAssignment && step === "review" && existingSubmission && <div className="step-card success"><h3>5. 狀態已更新</h3><p>目前狀態：{statusText(existingSubmission.status)}</p><p>不確定題號：{existingSubmission.uncertainQuestions.join(", ") || "無"}</p><p>需要關注：{existingSubmission.riskFlags.join("、") || "無"}</p></div>}
      </div>
      <aside className="panel reward-panel"><div className="section-title"><Flag size={22} /><h2>學生進度</h2></div><div className="reward-number">{stats.points}</div><p>連續完成 {stats.streak} 天，目前還有 {stats.pending} 份作業需要追蹤。</p><div className="badge-row"><span><CheckCircle2 size={14} />完成</span><span><AlertCircle size={14} />待修正</span><span><ListChecks size={14} />自我檢查</span></div></aside>
    </section>
  );
}

function statusText(status: Submission["status"]) {
  return { notStarted: "尚未開始", inProgress: "進行中", selfCheck: "自我檢查中", needsCorrection: "需要修正", teacherReview: "等待老師確認", assistedDone: "已協助完成", done: "已完成", stuck: "卡住了" }[status];
}

