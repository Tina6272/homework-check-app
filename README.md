# 作業檢查 App

這個專案用來建立「學生自主完成作業」的作業檢查工具。第一階段重點是讓學生完成紙本作業後，依照 App 流程自我檢查、回報卡住題目、完成訂正；老師端用來派作業與追蹤風險，家長端只做提醒與進度查看。

## 工作模式

- 固定入口規則：`AGENTS.md`
- 進度與下一步：Obsidian `作業檢查 App/專案工作流程.md`
- 短期交接：`交接工作/下一階段-預覽討論交接.md`
- 版本管理：GitHub repo `Tina6272/homework-check-app`
- repo 可見性：公開
- 部署目標：GitHub Pages `https://tina6272.github.io/homework-check-app/`
- Firebase project id：`paper-homework-self-check`
- Firebase Web App：`homework-check-app` / `1:216321180189:web:2f92206c3397425adc3cf4`

## 目前 App 骨架

已建立 React/Vite 前端原型，包含：

- 學生端：班級代號、座號、作業選擇、自我檢查、修正狀態與送出流程
- 老師端：派發 A/B/C 班作業、查看提交狀態、標記老師確認與風險追蹤
- 家長端：查看作業狀態、提醒學生自主完成，不取代學生管理
- 第一階段資料方向：Firestore-only，不使用學生姓名，不先接照片/OCR/Storage
- Firebase 設定入口：Firestore、Hosting 設定檔與安全規則

目前原型仍以假資料呈現三端流程；介面文字、狀態名稱與資料模型要先討論定案，再接 Firestore。

## 本機預覽

最新實測預覽：http://127.0.0.1:5174/homework-check-app/。如果 port 被占用，Vite 會自動換 port，實際網址以終端機顯示為準。

不要在 Google Drive 專案資料夾直接執行 `npm install` 或建立 `node_modules`。需要預覽時，先把必要檔案同步到本機暫存資料夾，例如：

```text
C:\Users\tinad\AppData\Local\Temp\homework-check-preview-20260702
```

若 npm 出現憑證錯誤，先在同一個 PowerShell session 設定：

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm.cmd install
npm.cmd run build
npm.cmd run dev -- --host 127.0.0.1
```

## Firebase 設定

目前已放入：

- `.firebaserc`：default project 為 `paper-homework-self-check`
- `firebase.json`：Hosting + Firestore，不部署 Storage
- `firestore.rules`
- `firestore.indexes.json`
- `docs/firebase-data-model.md`

確認可讀取 Firebase 專案：

```powershell
$env:NODE_OPTIONS='--use-system-ca'
firebase.cmd projects:list
```

部署前端前，仍需先確認介面流程與資料模型已定案。

## 開工與收工

開始工作時，在 Codex 開啟本專案資料夾後輸入「開工」。Codex 會讀取 `AGENTS.md`、Obsidian 駕駛艙、交接檔並檢查 Git 狀態。

結束工作時輸入「收工」。Codex 會整理本次變更、更新 Obsidian 駕駛艙，並依需要提交與推送。

## 安全原則

- 不提交 `.env`、API key、token、密碼或 Firebase Admin 憑證
- 學生資料只使用座號與班級代號，不存真名
- 第一階段不使用學生照片、OCR 或 AI 判題作為正式資料流程
- `.codex/` 與其他本機 AI agent 設定不納入 Git

