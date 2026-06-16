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
  { id: "needHelp", label: "我需要幫忙" },
];

export function StudentPanel({ assignments, stats, submissions, onStudentChanged, onSubmitted }: StudentPanelProps) {
  const visibleAssignments = assignments.filter(
    (assignment) => assignment.classCode === stats.classCode && assignment.status === "open",
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(visibleAssignments[0]?.id ?? "");
  const selectedAssignment = visibleAssignments.find((assignment) => assignment.id === selectedAssignmentId);
  const existingSubmission = submissions.find(
    (submission) =>
      submission.assignmentId === selectedAssignmentId &&
      submission.classCode === stats.classCode &&
      submission.studentSeat === stats.seat,
  );
  const [step, setStep] = useState<"ready" | "writing" | "selfCheck" | "questions" | "review">(
    existingSubmission?.status === "done" ? "review" : "ready",
  );
  const [targetMinutes, setTargetMinutes] = useState(selectedAssignment?.suggestedMinutes ?? 25);
  const [checkedItems, setCheckedItems] = useState<string[]>(existingSubmission?.checkedItems ?? []);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(existingSubmission?.confidence ?? "someUncertain");
  const [uncertainText, setUncertainText] = useState(existingSubmission?.uncertainQuestions.join(", ") ?? "");
  const [correctedText, setCorrectedText] = useState(existingSubmission?.correctedQuestions.join(", ") ?? "");
  const [stuckText, setStuckText] = useState(existingSubmission?.stuckQuestions.join(", ") ?? "");

  const progress = useMemo(() => {
    const order = ["ready", "writing", "selfCheck", "questions", "review"];
    return order.indexOf(step) + 1;
  }, [step]);

  function parseQuestions(value: string) {
    return value
      .split(/[,\s，、]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function toggleCheckedItem(item: string) {
    setCheckedItems((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  function buildSubmission(status: Submission["status"]): Submission {
    const uncertainQuestions = parseQuestions(uncertainText);
    const correctedQuestions = parseQuestions(correctedText);
    const stuckQuestions = parseQuestions(stuckText);
    const riskFlags: string[] = [];

    if (selectedAssignment && checkedItems.length < selectedAssignment.selfCheckItems.length) {
      riskFlags.push("自查未完成");
    }
    if (confidence === "needHelp" || stuckQuestions.length > 0) {
      riskFlags.push("需要協助");
    }
    if (uncertainQuestions.length === 0 && confidence === "high") {
      riskFlags.push("未標不確定題，建議抽查");
    }

    return {
      id: existingSubmission?.id ?? `${stats.classCode}-${stats.seat}-${selectedAssignmentId}`,
      classCode: stats.classCode,
      studentSeat: stats.seat,
      assignmentId: selectedAssignmentId,
      status,
      startedAt: existingSubmission?.startedAt ?? "剛剛",
      finishedAt: status === "done" ? "剛剛" : existingSubmission?.finishedAt,
      targetMinutes,
      actualMinutes: existingSubmission?.actualMinutes,
      checkedItems,
      confidence,
      uncertainQuestions,
      correctedQuestions,
      stuckQuestions,
      riskFlags,
      updatedAt: "剛剛",
    };
  }

  function submit(status: Submission["status"]) {
    onSubmitted(buildSubmission(status));
    setStep("review");
  }

  return (
    <section className="workspace">
      <div className="panel flow-panel">
        <div className="section-title">
          <ListChecks size={22} />
          <h2>學生自主作業流程</h2>
        </div>

        <div className="student-identity">
          <label>
            班級
            <select
              value={stats.classCode}
              onChange={(event) => {
                onStudentChanged({ ...stats, classCode: event.target.value });
                setSelectedAssignmentId("");
                setStep("ready");
              }}
            >
              <option value="A">A 班</option>
              <option value="B">B 班</option>
              <option value="C">C 班</option>
            </select>
          </label>
          <label>
            座號
            <input value={stats.seat} onChange={(event) => onStudentChanged({ ...stats, seat: event.target.value })} />
          </label>
        </div>

        <div className="flow-meter">
          <span>進度 {progress}/5</span>
          <progress value={progress} max="5" />
        </div>

        <label>
          今日作業
          <select
            value={selectedAssignmentId}
            onChange={(event) => {
              const nextAssignment = visibleAssignments.find((assignment) => assignment.id === event.target.value);
              setSelectedAssignmentId(event.target.value);
              setTargetMinutes(nextAssignment?.suggestedMinutes ?? 25);
              setCheckedItems([]);
              setStep("ready");
            }}
          >
            <option value="">請選擇作業</option>
            {visibleAssignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </label>

        {selectedAssignment ? (
          <article className="assignment-summary">
            <strong>{selectedAssignment.subject}｜{selectedAssignment.title}</strong>
            <p>{selectedAssignment.description}</p>
            <span>題號 / 範圍：{selectedAssignment.questionRange}</span>
            <span>老師建議：{selectedAssignment.suggestedMinutes} 分鐘</span>
          </article>
        ) : (
          <p className="muted">目前這個班級沒有開放中的作業。</p>
        )}

        {selectedAssignment && step === "ready" && (
          <div className="step-card">
            <h3>1. 準備開始</h3>
            <p>選一個今天想挑戰的完成時間。低年級可以直接使用老師建議時間。</p>
            <div className="choice-row">
              {[selectedAssignment.suggestedMinutes - 5, selectedAssignment.suggestedMinutes, selectedAssignment.suggestedMinutes + 10]
                .filter((minutes) => minutes > 0)
                .map((minutes) => (
                  <button
                    key={minutes}
                    className={targetMinutes === minutes ? "choice active" : "choice"}
                    type="button"
                    onClick={() => setTargetMinutes(minutes)}
                  >
                    {minutes} 分鐘
                  </button>
                ))}
            </div>
            <button className="primary-action" type="button" onClick={() => setStep("writing")}>
              <Clock size={18} />
              開始寫紙本作業
            </button>
          </div>
        )}

        {selectedAssignment && step === "writing" && (
          <div className="step-card">
            <h3>2. 寫紙本作業中</h3>
            <p className="timer-display">{targetMinutes}:00</p>
            <p>這裡是測試版計時器示意。正式版會記錄開始與完成時間。</p>
            <div className="action-row">
              <button type="button" onClick={() => submit("stuck")}>
                <CircleHelp size={18} />
                我卡住了
              </button>
              <button className="primary-action compact" type="button" onClick={() => setStep("selfCheck")}>
                <CheckCircle2 size={18} />
                我寫完紙本了
              </button>
            </div>
          </div>
        )}

        {selectedAssignment && step === "selfCheck" && (
          <div className="step-card">
            <h3>3. 自查清單</h3>
            <p>逐項確認，不用重新輸入整份答案。</p>
            <div className="check-list">
              {selectedAssignment.selfCheckItems.map((item) => (
                <label key={item} className="check-item">
                  <input checked={checkedItems.includes(item)} type="checkbox" onChange={() => toggleCheckedItem(item)} />
                  {item}
                </label>
              ))}
            </div>
            <button
              className="primary-action"
              disabled={checkedItems.length === 0}
              type="button"
              onClick={() => setStep("questions")}
            >
              下一步：標記不確定題號
            </button>
          </div>
        )}

        {selectedAssignment && step === "questions" && (
          <div className="step-card">
            <h3>4. 標記不會與訂正狀態</h3>
            <div className="choice-row">
              {confidenceOptions.map((option) => (
                <button
                  key={option.id}
                  className={confidence === option.id ? "choice active" : "choice"}
                  type="button"
                  onClick={() => setConfidence(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="field-grid">
              <label>
                不確定題號
                <input placeholder="例如：5, 8" value={uncertainText} onChange={(event) => setUncertainText(event.target.value)} />
              </label>
              <label>
                已訂正題號
                <input placeholder="例如：5" value={correctedText} onChange={(event) => setCorrectedText(event.target.value)} />
              </label>
              <label>
                仍不會題號
                <input placeholder="例如：8" value={stuckText} onChange={(event) => setStuckText(event.target.value)} />
              </label>
            </div>
            <button className="primary-action" type="button" onClick={() => submit(stuckText ? "teacherReview" : "done")}>
              <Send size={18} />
              送出今日作業狀態
            </button>
          </div>
        )}

        {selectedAssignment && step === "review" && existingSubmission && (
          <div className="step-card success">
            <h3>5. 今日回報已更新</h3>
            <p>狀態：{statusText(existingSubmission.status)}</p>
            <p>不確定題號：{existingSubmission.uncertainQuestions.join(", ") || "無"}</p>
            <p>風險提示：{existingSubmission.riskFlags.join("、") || "無"}</p>
          </div>
        )}
      </div>

      <aside className="panel reward-panel">
        <div className="section-title">
          <Flag size={22} />
          <h2>自主習慣</h2>
        </div>
        <div className="reward-number">{stats.points}</div>
        <p>連續完成 {stats.streak} 天，目前有 {stats.pending} 件作業需要追蹤。</p>
        <div className="badge-row">
          <span><CheckCircle2 size={14} />有開始</span>
          <span><AlertCircle size={14} />有標記</span>
          <span><ListChecks size={14} />有自查</span>
        </div>
      </aside>
    </section>
  );
}

function statusText(status: Submission["status"]) {
  const text = {
    notStarted: "未開始",
    inProgress: "進行中",
    selfCheck: "自查中",
    needsCorrection: "待訂正",
    teacherReview: "待老師看",
    done: "已完成",
    stuck: "卡關",
  };
  return text[status];
}
