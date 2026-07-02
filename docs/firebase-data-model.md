# Firebase Data Model

本文件是作業檢查 App 第一階段的 Firestore-only 資料模型草案。正式接 Firebase 前，仍要先用目前前端原型討論三端流程與狀態名稱。

## 設計原則

- 不儲存學生姓名，只使用班級代號與座號。
- 第一階段不使用 Storage、照片、OCR 或 AI 判題。
- 學生端重點是自我檢查與訂正流程，不是讓老師或家長代替學生管理。
- 老師端用來派作業、追蹤風險、抽查與確認。
- 家長端只查看進度與提醒，不顯示過細的控制功能。

## Collection 草案

```text
classes/{classCode}
  assignments/{assignmentId}
  students/{studentSeat}
  submissions/{submissionId}
    questionChecks/{questionId}

assignmentTemplates/{templateId}
```

## assignmentTemplates/{templateId}

作業模板，例如數學習作、國語習作、英文單字。

| 欄位 | 型別 | 說明 |
|---|---|---|
| templateName | string | 模板名稱 |
| subject | string | 科目 |
| defaultSuggestedMinutes | number | 預設建議完成時間 |
| defaultSelfCheckItems | string[] | 預設自我檢查清單 |
| defaultRequiresPeerCheck | boolean | 是否預設需要同儕檢查 |
| defaultRequiresParentConfirm | boolean | 是否預設需要家長確認 |
| createdAt | timestamp | 建立時間 |
| updatedAt | timestamp | 更新時間 |

## classes/{classCode}

班級或課後班群組。

| 欄位 | 型別 | 說明 |
|---|---|---|
| classCode | string | 班級代號，例如 A、B、C |
| displayName | string | 顯示名稱，可不含真實班名 |
| status | string | active / archived |
| createdAt | timestamp | 建立時間 |
| updatedAt | timestamp | 更新時間 |

## classes/{classCode}/assignments/{assignmentId}

老師派給特定班級的作業。

| 欄位 | 型別 | 說明 |
|---|---|---|
| classCode | string | 班級代號 |
| templateId | string | 對應作業模板 |
| subject | string | 科目 |
| title | string | 作業標題 |
| description | string | 作業說明 |
| pageRange | string | 頁碼範圍 |
| questionRange | string | 題號範圍 |
| suggestedMinutes | number | 建議完成分鐘數 |
| selfCheckItems | string[] | 本次作業自我檢查清單 |
| requiresPeerCheck | boolean | 是否需要同儕檢查 |
| requiresParentConfirm | boolean | 是否需要家長確認 |
| hasAnswerKey | boolean | 是否有答案庫 |
| status | string | draft / open / closed |
| publishDate | timestamp | 派發時間 |
| createdAt | timestamp | 建立時間 |
| updatedAt | timestamp | 更新時間 |

## classes/{classCode}/students/{studentSeat}

學生統計資料。文件 id 使用座號，不使用姓名。

| 欄位 | 型別 | 說明 |
|---|---|---|
| seat | string | 座號 |
| points | number | 獎勵點數 |
| streak | number | 連續完成次數 |
| pending | number | 待完成或待修正數 |
| updatedAt | timestamp | 更新時間 |

## classes/{classCode}/submissions/{submissionId}

學生對某份作業的提交與修正狀態。

| 欄位 | 型別 | 說明 |
|---|---|---|
| classCode | string | 班級代號 |
| studentSeat | string | 座號 |
| assignmentId | string | 作業 id |
| status | string | notStarted / inProgress / selfCheck / needsCorrection / peerCheck / teacherReview / done / stuck |
| targetMinutes | number | 建議分鐘數 |
| actualMinutes | number | 學生回報實際花費分鐘數 |
| confidence | string | high / someUncertain / manyUncertain / needHelp |
| checkedItems | string[] | 已完成的自我檢查項目 |
| uncertainQuestions | string[] | 不確定題號 |
| correctedQuestions | string[] | 已訂正題號 |
| stuckQuestions | string[] | 仍卡住題號 |
| riskFlags | string[] | 系統或老師標記的風險 |
| peerCheckerSeat | string | 同儕檢查座號，若沒有則空白 |
| teacherReviewStatus | string | none / queued / passed / needsFix / needsTeaching |
| startedAt | timestamp | 開始時間 |
| finishedPaperAt | timestamp | 紙本完成時間 |
| selfCheckedAt | timestamp | 自我檢查時間 |
| completedAt | timestamp | 完成時間 |
| createdAt | timestamp | 建立時間 |
| updatedAt | timestamp | 更新時間 |

## classes/{classCode}/submissions/{submissionId}/questionChecks/{questionId}

逐題檢查紀錄，第一階段可延後實作；若介面討論後需要更細的題號追蹤，再加入。

| 欄位 | 型別 | 說明 |
|---|---|---|
| questionNumber | string | 題號 |
| studentMark | string | correct / corrected / dontKnow / needsTeacher |
| originalAnswerInput | string | 學生輸入的答案或簡短註記 |
| autoCheckResult | string | notChecked / matched / notMatched / manualOnly |
| answerViewedAt | timestamp | 查看答案時間 |
| correctedAt | timestamp | 訂正時間 |
| peerCheckedBy | string | 同儕檢查者座號 |
| teacherCheckedAt | timestamp | 老師確認時間 |

## 第一階段先不做

- Storage 照片上傳
- OCR
- AI 判題
- 儲存學生姓名
- 家長直接代替學生改狀態

這些功能等三端流程與 Firestore 狀態穩定後，再評估是否進入第二階段。
