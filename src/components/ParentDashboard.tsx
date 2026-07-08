import { Clock, HeartHandshake, ShieldCheck } from "lucide-react";
import type { Assignment, StudentStats, Submission } from "../types";

type ParentDashboardProps = { assignments: Assignment[]; submissions: Submission[]; stats: StudentStats };

export function ParentDashboard({ assignments, submissions, stats }: ParentDashboardProps) {
  const visibleItems = submissions.filter((submission) => submission.studentSeat === stats.seat && submission.classCode === stats.classCode);
  return (
    <section className="workspace single-column">
      <div className="panel board-header">
        <div><h2>家長端：看進度，不代替孩子完成</h2><p>目前先呈現家長需要知道的狀態：是否完成、是否卡住、是否需要鼓勵或提醒。</p></div>
        <div className="mini-stats"><span><ShieldCheck size={15} />{stats.classCode} 班 {stats.seat} 號</span><span><HeartHandshake size={15} />連續 {stats.streak} 天</span></div>
      </div>
      <div className="timeline">
        {visibleItems.map((submission) => {
          const assignment = assignments.find((item) => item.id === submission.assignmentId);
          return (
            <article key={submission.id} className="timeline-item parent-item">
              <Clock size={18} />
              <div>
                <strong>{assignment?.title ?? submission.assignmentId}</strong>
                <p>{statusText(submission.status)} / 更新：{submission.updatedAt}</p>
                <p>自我檢查 {submission.checkedItems.length} 項，不確定題號：{submission.uncertainQuestions.join(", ") || "無"}</p>
                <p>家長建議：{parentAdvice(submission)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function statusText(status: Submission["status"]) {
  return { notStarted: "尚未開始", inProgress: "進行中", selfCheck: "自我檢查中", needsCorrection: "需要修正", teacherReview: "等待老師確認", assistedDone: "已協助完成", done: "已完成", stuck: "卡住了" }[status];
}

function parentAdvice(submission: Submission) {
  if (submission.status === "assistedDone") return "老師已在現場協助完成，回家只要確認孩子理解修正內容。";
  if (submission.status === "done") return "可以肯定孩子完成了自我檢查，簡短鼓勵即可。";
  if (submission.status === "teacherReview" || submission.stuckQuestions.length > 0) return "孩子有卡住的地方，請先鼓勵他說出哪一題不懂，再由老師確認。";
  if (submission.status === "needsCorrection") return "提醒孩子回到題目修正，不需要直接告訴答案。";
  return "提醒孩子依照 App 步驟完成，不急著催答案。";
}
