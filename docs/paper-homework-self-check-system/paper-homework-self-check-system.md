# 紙本作業自主訂正與風險抽查系統

## 1. 產品定位

這套 App 的定位是：

> 幫課後班老師管理學生自己完成、檢查、訂正紙本作業的流程，並用風險訊號協助老師抽查。

它不是完整 AI 批改工具，也不是單純家校聯絡簿。第一版的核心價值是把原本看不見的作業過程變成可追蹤資料：

- 學生是否開始作業
- 是否完成紙本
- 是否做自查
- 哪些題目不會或不確定
- 是否訂正
- 是否需要同儕、老師或家長協助
- 哪些學生或題目值得老師優先抽查

### 第一版不做事項

- 不要求學生重新輸入整份答案
- 不把照片上傳與 AI 批改當作主流程
- 不讓家長看到排名或造成焦慮的全班比較
- 不把 App 設計成「直接看解答」工具
- 不儲存學生姓名；正式資料只用班級代號與座號

## 2. 使用者角色與權限

### 學生端

學生只需要看到自己班級的今日作業。學生端主要完成：

- 接收老師派發的作業
- 開始作業並計時
- 回報紙本完成
- 完成自查清單
- 標記不會或不確定的題號
- 使用題庫進行分段核對與訂正
- 必要時進入互查或老師抽查

### 老師端

老師端負責設定與判斷，不需要逐題批改所有作業：

- 建立作業模板
- 針對 A/B/C 不同班級一鍵派發不同作業內容
- 查看全班進度與風險名單
- 查看多人卡關題號
- 抽查高風險學生或題目
- 退回訂正或標記完成

### 家長端

家長端只做透明同步，不做細節監控：

- 今日狀態：未開始、進行中、待訂正、完成、需要協助
- 自主習慣：是否準時開始、是否自查、是否訂正
- 需要家長知道的提醒：是否需要陪伴、簽名或確認紙本訂正

家長端不顯示全班排名，不給「孩子很差」這類評語，也不鼓勵家長取代老師批改。

## 3. 多班級作業模板與一鍵派發

學生可能來自 A、B、C 等不同班級，各班作業內容不同。因此作業設計分成兩層：

### 作業模板

模板是可重複使用的作業格式，不是每天完整作業內容。

範例模板：

- 數學習作
- 國語甲本
- 英文單字
- 閱讀紀錄

模板可包含：

- 科目
- 預設作業名稱
- 預設建議時間
- 預設自查清單
- 是否需要互查
- 是否需要家長確認
- 題號輸入方式

### 班級派發內容

每天派發時，老師選模板後填入各班差異：

| 班級 | 模板 | 內容 | 建議時間 |
|---|---|---|---|
| A 班 | 數學習作 | p.32-33，1-12 題 | 25 分鐘 |
| B 班 | 數學習作 | p.28-29，1-8 題 | 20 分鐘 |
| C 班 | 國語甲本 | 第 8 課 p.14-15 | 30 分鐘 |

老師按「一鍵派發」後，系統將作業寫入各班自己的 assignments。學生只讀取自己班級的作業資料。

## 4. 學生端詳細流程

### 4.1 接收今日作業

學生進入 App 後，不需要自己輸入今日作業。App 依班級代號與座號顯示老師派發的作業卡。

作業卡顯示：

- 科目
- 作業名稱
- 頁碼或題號
- 老師建議時間
- 是否需要自查
- 是否需要互查
- 是否有題庫答案可核對

### 4.2 開始作業與計時

學生按「開始作業」後進入計時畫面。

計時建議採用：

> 老師設定建議時間，學生可在合理範圍內選自己的目標時間。

低年級可直接使用老師建議時間；中高年級可選「挑戰、標準、穩穩完成」三種時間。

超時不視為失敗，但會記錄為學習節奏資料。完成過快也不直接視為成功，會進入風險判斷。

### 4.3 紙本完成回報

學生按「我寫完紙本了」後，不能直接完成作業，必須進入自查。

### 4.4 自查清單

自查不是單一勾選框，而是逐項確認。

範例：

- 我有每一題都寫
- 我有圈出不確定的題目
- 我有檢查題號與頁碼
- 我有檢查單位、格式或標點
- 我有重看老師提醒的地方

如果學生勾選「沒有」，App 引導回紙本修正後再繼續。

### 4.5 標記不會或不確定題號

學生用題號按鈕標記：

- 不會
- 不確定
- 已訂正但想請老師看

這些資料會在老師端形成卡關題號統計與風險名單。

### 4.6 題庫核對與訂正

如果作業有題庫，App 不一次顯示整份答案，而是單題分段解鎖。

流程：

1. 顯示第 N 題
2. 提醒學生先看紙本答案
3. 學生按「顯示答案」
4. App 顯示標準答案或檢查重點
5. 學生選擇：
   - 我原本答對
   - 我原本答錯，已訂正
   - 我看不懂，需要幫忙

對隨機抽查題，顯示答案前需要學生輸入紙本上的原答案，再由 App 用題庫比對。

### 4.7 互查或老師抽查

互查不要求同學批改整份作業，只做指定範圍：

- 檢查是否每題都有寫
- 檢查標記題是否已訂正
- 檢查老師指定的 2-3 題
- 確認格式、單位、漏題

互查者要輸入自己的座號，App 記錄誰幫誰看、看了哪些題、結果如何。

## 5. 老師端詳細流程

### 5.1 建立模板

老師建立常用作業模板，減少每天輸入負擔。

### 5.2 多班級一鍵派發

老師在一個畫面設定 A/B/C 各班作業內容，按一次派發。系統把作業分別寫入各班。

### 5.3 查看班級進度

老師端應顯示：

- 未開始
- 進行中
- 待自查
- 待訂正
- 待互查
- 待老師看
- 已完成

### 5.4 風險名單

App 自動標記值得抽查的情況：

- 完成時間異常短
- 自查時間異常短
- 沒有標任何不確定題
- 大量快速查看答案但沒有訂正
- 抽查題輸入錯誤
- 同一題多人標記不會
- 學生連續多天需要訂正
- 互查者過去常放過錯誤

### 5.5 老師抽查

老師端不需要全批，而是依風險訊號抽查：

- 抽查高風險學生
- 抽查多人卡關題
- 抽查完成過快者
- 抽查自評很確定但歷史抽查常錯者

老師可標記：

- 通過
- 需訂正
- 需要老師講解
- 需要家長知道

## 6. 家長端呈現原則

家長端目標是透明同步，不是壓力監控。

建議顯示：

- 今日作業狀態
- 完成時間與大致用時
- 是否完成自查
- 是否有訂正
- 是否仍需要協助
- 老師給家長的簡短提醒

不建議顯示：

- 全班排名
- 詳細錯題排行
- 負面標籤
- 會引發責罵的比較資料

## 7. 題庫運用方式

題庫能提供標準答案，但 App 仍需要知道學生紙本上寫了什麼，才能自動判斷正確性。因此題庫主要用於：

### 7.1 學生自主核對

學生不重打一整份答案，而是逐題看答案或檢查重點，自行標記答對、已訂正或不會。

### 7.2 互查答案卡

互查者使用 App 顯示的標準答案或檢查重點，降低憑感覺亂看。

### 7.3 老師抽查輔助

老師抽查時不必另翻解答，App 直接顯示該題答案與檢查重點。

### 7.4 隨機抽題輸入

學生只需輸入少數抽查題的原答案。App 用題庫比對，取得部分真實正確率資料。

## 8. 防抄答案設計

題庫不能做成「整份答案頁」。第一版採用以下機制：

- 完成紙本與自查後才可解鎖答案
- 一次只顯示一題
- 隨機 2-3 題顯示答案前要輸入原答案
- 記錄看答案的時間、題號與後續狀態
- 大量快速看答案但沒有訂正，進入老師風險名單
- 低年級可只顯示提示與檢查重點，完整答案由老師或互查者查看

## 9. 防胡亂檢查設計

半自動版本無法 100% 保證答案正確，但可以降低亂勾、漏看、假互查：

- 自查拆成具體行為
- 學生標記信心等級
- 必須標記不會或不確定題號
- 互查者輸入座號
- 互查只檢查指定範圍，不批整份
- 老師端依風險訊號抽查
- 歷史抽查結果回饋到風險判斷

正確性分三層：

| 等級 | 做法 | 正確性 |
|---|---|---|
| 流程確認 | 自查、互查、訂正回報 | 只能確認有做流程 |
| 抽樣確認 | 老師抽查高風險學生或題目 | 可提高正確性 |
| 自動判斷 | 答案庫 + 抽題輸入 / OCR / AI | 成本與複雜度較高 |

## 10. 低規格平板模式

舊平板如 ASUS ZenPad 8.0 可嘗試低規格模式，但不建議作為正式主設備。

### 可保留功能

- 查看今日作業
- 接收多班級派發結果
- 開始計時
- 自查清單
- 標記題號
- 訂正狀態回報
- 單題答案分段解鎖
- 家長端簡單狀態查看

### 不建議功能

- 拍照上傳
- 圖片壓縮
- OCR / AI 判讀
- 語音輸入
- 推播通知
- 離線暫存與背景同步
- 老師端即時大看板
- 大量題庫一次載入

低規格模式應採用大按鈕、少動畫、分段載入、單頁單任務。

## 11. 建議 Firestore 資料結構草案

```text
classes/{classCode}
  assignments/{assignmentId}
  students/{studentSeat}
  submissions/{submissionId}

assignmentTemplates/{templateId}
```

### assignmentTemplates/{templateId}

```text
templateName: string
subject: string
defaultSuggestedMinutes: number
defaultSelfCheckItems: string[]
defaultRequiresPeerCheck: boolean
defaultRequiresParentConfirm: boolean
createdAt: timestamp
updatedAt: timestamp
```

### classes/{classCode}/assignments/{assignmentId}

```text
classCode: string
templateId: string
subject: string
title: string
description: string
pageRange: string
questionRange: string
suggestedMinutes: number
requiresSelfCheck: boolean
requiresPeerCheck: boolean
requiresParentConfirm: boolean
hasAnswerKey: boolean
status: "draft" | "open" | "closed"
publishDate: timestamp
createdAt: timestamp
updatedAt: timestamp
```

### classes/{classCode}/assignments/{assignmentId}/answerKey/{questionId}

```text
questionNumber: string
answer: string
type: "choice" | "shortAnswer" | "numeric" | "teacherReview"
checkNote: string
requiresManualReview: boolean
```

### classes/{classCode}/submissions/{submissionId}

```text
classCode: string
studentSeat: string
assignmentId: string
status: "notStarted" | "inProgress" | "selfCheck" | "needsCorrection" | "peerCheck" | "teacherReview" | "done" | "stuck"
startedAt: timestamp
finishedPaperAt: timestamp
selfCheckedAt: timestamp
completedAt: timestamp
targetMinutes: number
actualMinutes: number
confidence: "high" | "someUncertain" | "manyUncertain" | "needHelp"
uncertainQuestions: string[]
correctedQuestions: string[]
stuckQuestions: string[]
riskFlags: string[]
peerCheckerSeat: string
teacherReviewStatus: "none" | "queued" | "passed" | "needsFix" | "needsTeaching"
createdAt: timestamp
updatedAt: timestamp
```

### classes/{classCode}/submissions/{submissionId}/questionChecks/{questionId}

```text
questionNumber: string
studentMark: "correct" | "corrected" | "dontKnow" | "needsTeacher"
originalAnswerInput: string
autoCheckResult: "notChecked" | "matched" | "notMatched" | "manualOnly"
answerViewedAt: timestamp
correctedAt: timestamp
peerCheckedBy: string
teacherCheckedAt: timestamp
```

## 12. 分階段導入路線

### 第 1 階段：Firestore-only 流程版

目標是先驗證流程是否能減少老師追作業的負擔。

包含：

- 作業模板
- 多班級派發
- 學生開始計時
- 自查清單
- 題號標記
- 訂正回報
- 老師風險名單
- 家長簡易狀態

不包含：

- 照片上傳
- OCR
- AI 批改
- 推播

### 第 2 階段：題庫輔助自主訂正版

加入答案題庫，但仍避免直接抄答案。

包含：

- 單題答案解鎖
- 檢查重點
- 抽查題先輸入原答案
- 題庫輔助互查
- 老師抽查答案卡

### 第 3 階段：小規模拍照 / OCR / AI 試辦

只挑少數作業、少數學生測試：

- Firebase Storage 或暫存圖片方案
- Mathpix / Google Vision / OpenAI Vision / Gemini 的辨識效果
- 家長授權與資料保護流程

### 第 4 階段：完整 AI 輔助批改版

在流程與成本都驗證後，再考慮：

- 拍照上傳
- OCR 擷取
- AI 標記疑似錯誤
- 老師人工覆核
- 訂正後再拍
- 長期錯題趨勢

## 13. 下一步建議

第一版實作建議採用：

> 半自動互查 / 抽查 + 題庫預留 + Firestore-only

優先做：

1. 作業模板
2. 多班級派發
3. 學生自查與題號標記
4. 訂正回報
5. 老師風險抽查
6. 家長端簡易透明同步

題庫、答案解鎖與抽查題輸入可作為第二小版接上。
