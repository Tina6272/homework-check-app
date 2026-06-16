# 作業檢查 App

這個專案用來建立「學生自主完成作業」的作業檢查工具工作區。

## 工作模式

- 固定入口規則：`AGENTS.md`
- 進度與下一步：Obsidian `作業檢查 App/專案工作流程.md`
- 版本管理：GitHub repo `Tina6272/homework-check-app`
- repo 可見性：公開
- 部署目標：GitHub Pages `https://tina6272.github.io/homework-check-app/`
- 資料服務：Firebase（project id 待設定）

## 既有資料

- `claude對話/`：前期對話與原型素材
- `密涅瓦大學思考習慣HC完整清單.md`：教學素材

## 目前 App 骨架

已建立 React/Vite 前端骨架，包含：

- 學生端：班級代號、座號、作業代號、照片選取與上傳佇列
- 老師端：依班級代號與座號檢查提交狀態
- 家長端：查看作業狀態與獎勵點數
- 照片壓縮：前端壓縮成 JPEG，降低全班同時上傳負擔
- Firebase 設定入口：Firestore、Storage、Hosting 設定檔與安全規則

Firebase 尚未綁定正式 project id。完成 Firebase 重新登入後，需替換：

- `.firebaserc` 裡的 `REPLACE_WITH_FIREBASE_PROJECT_ID`
- `.env.example` 複製成 `.env` 後填入 Firebase Web App 設定值

## Firebase 設定

目前已放入：

- `.firebaserc`
- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `docs/firebase-data-model.md`

重新授權 Firebase CLI：

```powershell
firebase login --reauth
```

確認可讀取 Firebase 專案：

```powershell
firebase projects:list
```

部署前端：

```powershell
npm install
npm run build
firebase deploy
```

## 開工與收工

開始工作時，在 Codex 開啟本專案資料夾後輸入「開工」。Codex 會讀取 `AGENTS.md`、Obsidian 駕駛艙並檢查 Git 狀態。

結束工作時輸入「收工」。Codex 會整理本次變更、更新 Obsidian 駕駛艙，並依需要提交與推送。

## 安全原則

- 不提交 `.env`、API key、token、密碼或 Firebase Admin 憑證
- 學生資料只使用座號與班級代號，不存真名
- `.codex/` 與其他本機 AI agent 設定不納入 Git
