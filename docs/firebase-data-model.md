# Firebase Data Model

本專案正式資料不儲存學生姓名，只使用班級代號與座號。

## Firestore

```text
classes/{classCode}
  assignments/{assignmentId}
  students/{studentSeat}
  submissions/{submissionId}
```

### classes/{classCode}/assignments/{assignmentId}

| 欄位 | 型別 | 說明 |
|---|---|---|
| title | string | 作業名稱 |
| subject | string | 科目 |
| dueDate | timestamp | 到期時間 |
| status | string | open / closed |

### classes/{classCode}/students/{studentSeat}

| 欄位 | 型別 | 說明 |
|---|---|---|
| seat | string | 座號 |
| points | number | 獎勵點數 |
| streak | number | 連續完成次數 |
| updatedAt | timestamp | 最近更新 |

### classes/{classCode}/submissions/{submissionId}

| 欄位 | 型別 | 說明 |
|---|---|---|
| classCode | string | 班級代號 |
| studentSeat | string | 座號 |
| assignmentId | string | 作業 ID |
| status | string | queued / uploaded / checked / needsFix |
| photoPath | string | Storage 路徑 |
| photoUrl | string | 顯示用下載網址 |
| rewardPoints | number | 本次獎勵點數 |
| createdAt | timestamp | 建立時間 |
| updatedAt | timestamp | 更新時間 |

## Storage

```text
homework/{classCode}/{assignmentId}/{studentSeat}/{timestamp-fileName}
```

照片上傳前會在前端壓縮，目標寬度 1600px、JPEG 品質 0.78，避免全班同時上傳時卡住。
