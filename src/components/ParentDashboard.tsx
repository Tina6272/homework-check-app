import { Clock, HeartHandshake, ShieldCheck } from "lucide-react";
import type { Assignment, StudentStats, Submission } from "../types";

type ParentDashboardProps = {
  assignments: Assignment[];
  submissions: Submission[];
  stats: StudentStats;
};

export function ParentDashboard({ assignments, submissions, stats }: ParentDashboardProps) {
  const visibleItems = submissions.filter(
    (submission) => submission.studentSeat === stats.seat && submission.classCode === stats.classCode,
  );

  return (
    <section className="workspace single-column">
      <div className="panel board-header">
        <div>
          <h2>家長端：透明同步，不製造焦慮</h2>
          <p>家長只看孩子今天作業走到哪裡、是否有自查訂正、是否需要陪伴協助。</p>
        </div>
        <div className="mini-stats">
          <span><ShieldCheck size={15} />{stats.classCode} 班 {stats.seat} 號</span>
          <span><HeartHandshake size={15} />連續 {stats.streak} 天</span>
        </div>
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
                <p>自查 {submission.checkedItems.length} 項，不確定題號：{submission.uncertainQuestions.join(", ") || "無"}</p>
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

function parentAdvice(submission: Submission) {
  if (submission.status === "done") {
    return "確認孩子已把訂正寫回紙本即可，不需要重新批改整份作業。";
  }
  if (submission.status === "teacherReview" || submission.stuckQuestions.length > 0) {
    return "孩子有題目需要協助，請先陪伴，不急著直接給答案。";
  }
  if (submission.status === "needsCorrection") {
    return "請提醒孩子完成訂正流程，再回 App 更新狀態。";
  }
  return "請提醒孩子依照 App 步驟完成紙本、自查與訂正。";
}
