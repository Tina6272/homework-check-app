# 本機設定與排錯

這份文件記錄作業檢查 App 專案在 Tina 的 Windows + Google Drive 工作環境中最容易踩到的問題。

## 不要在 Google Drive 專案資料夾安裝 node_modules

工作資料夾：

```text
G:\我的雲端硬碟\Codex\02專案-作業檢查app
```

這個位置是 Google Drive 同步資料夾，不適合直接執行 `npm install`。大量小檔與同步鎖定容易造成：

```text
TAR_ENTRY_ERROR
EBADF
EPERM
unknown error, write
```

正確做法：把必要檔案複製到本機暫存資料夾後再安裝與建置。

最新實測暫存位置：

```text
C:\Users\tinad\AppData\Local\Temp\homework-check-preview-20260702
```

需要同步的檔案與資料夾：

```text
package.json
package-lock.json
index.html
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
src/
```

## npm 憑證錯誤

如果 npm 出現以下錯誤：

```text
UNABLE_TO_VERIFY_LEAF_SIGNATURE
unable to verify the first certificate
```

在同一個 PowerShell session 先設定系統憑證，再重跑：

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm.cmd install
npm.cmd run build
```

## 本機預覽

第一階段預覽使用 Vite。若要讓網址固定在專案的 GitHub Pages base path，開啟：

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm.cmd run dev -- --host 127.0.0.1
```

最新實測網址：http://127.0.0.1:5174/homework-check-app/。

常見網址格式：

```text
http://127.0.0.1:<port>/homework-check-app/
```

實際 port 以終端機顯示為準；舊紀錄裡的 `5173` 或 `5176` 只能當參考，不能當最新事實。

## Firebase CLI

Firebase project id：

```text
paper-homework-self-check
```

Firebase Web App：

```text
homework-check-app
1:216321180189:web:2f92206c3397425adc3cf4
```

在 PowerShell 優先使用 `firebase.cmd`，並搭配系統憑證：

```powershell
$env:NODE_OPTIONS='--use-system-ca'
firebase.cmd projects:list
```

目前第一階段只部署 Hosting + Firestore，不部署 Storage。`firebase.json` 已移除 Storage 部署設定。

## Markdown 與中文路徑

如果終端機或啟動摘要顯示中文路徑亂碼，先讀回原檔確認內容是否正常。不要因為摘要或終端顯示亂碼，就重寫整份文件。

如果原檔已經出現 mojibake / 亂碼，才需要修復原檔。寫入任何 `.md` 後，必須立刻讀回確認中文正常。

## sandbox helper 錯誤

在 Google Drive 工作區使用 `apply_patch`、Node REPL 或一般 sandbox 寫入時，可能出現：

```text
windows sandbox failed: helper_unknown_error: setup refresh had errors
```

若是必要文件或專案檔修復，可改用經授權的非沙盒 PowerShell 窄範圍寫入。完成後必須讀回或 build 驗證。


