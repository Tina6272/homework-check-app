# 作業檢查 App — AGENTS.md

## 專案入口

專案名稱：作業檢查 App
專案用途：學生自主完成作業
主要工作目錄：G:\我的雲端硬碟\Codex\02專案-作業檢查app
GitHub repo：https://github.com/Tina6272/homework-check-app
GitHub Pages：https://tina6272.github.io/homework-check-app/
repo 可見性：公開
預設 branch：main

## Obsidian 對應筆記

Obsidian vault：G:\我的雲端硬碟\Codex\2nd Brain
專案駕駛艙：作業檢查 App/專案工作流程.md
收工時優先更新：同上

> 注意：專案駕駛艙是 Obsidian vault 裡的一篇筆記，不是工作資料夾裡的 Markdown 檔。

## 工作桌 + 三個家

- 工作桌：G:\我的雲端硬碟\Codex\02專案-作業檢查app
- GitHub：https://github.com/Tina6272/homework-check-app
- Obsidian：G:\我的雲端硬碟\Codex\2nd Brain + 作業檢查 App/專案工作流程.md
- Firebase：會使用；project id 未設定

## 同步規則

開工時：
- 使用 `startup-sync` 流程
- 讀本檔
- 讀 Obsidian 駕駛艙
- 檢查 Git 狀態
- 不自動 pull / commit / push
- 若啟動摘要或終端機顯示中文路徑亂碼，先判斷是「摘要亂碼」還是「原檔亂碼」：用固定路徑讀回 `AGENTS.md` 與 Obsidian 駕駛艙，確認原檔是否正常中文；不要因摘要亂碼就重整整份文件。

收工時：
- 使用 `shutdown-sync` 流程
- 收工摘要固定用「作業檢查 App 專案」代稱，不依賴終端機顯示的中文路徑。
- 更新 Obsidian 駕駛艙
- 寫入任何 `.md` 後，必須立刻讀回原檔，確認內容仍是正常中文且沒有 mojibake / 亂碼，再回報完成。
- 如規則、路徑、專案邊界改變才更新本檔
- 需要時 commit + push GitHub

新專案初始化時：
- 使用 `project-init-sync` 流程

## 主要檔案

入口檔：README.md
設定檔：AGENTS.md、.gitignore
部署位置：GitHub Pages（main branch / root）
既有素材：claude對話/、密涅瓦大學思考習慣HC完整清單.md

## 已知環境坑

- 轉 HTML/SVG 成 PDF 時，優先用 Codex runtime 內的 Playwright + Chromium 產出，PDF 成品可放在新的 `PDF閱覽檔/`。
- 如果 Playwright 缺 Chromium，執行安裝時可能遇到 Windows 憑證錯誤 `unable to verify the first certificate`；先設定 `NODE_OPTIONS=--use-system-ca` 再重跑 Playwright browser install。
- Codex runtime 的 `pdfinfo.cmd` / `pdftoppm.cmd` 包裝器在某些 PowerShell 執行模式下可能顯示 `The system cannot find the path specified.`；改用實際執行檔：
  - `C:\Users\tinad\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdfinfo.exe`
  - `C:\Users\tinad\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe`
- 在 Google Drive 同步資料夾裡 commit 後，Git 可能留下 `.git/packed-refs.lock` 並顯示 `task 'pack-refs' failed`；若 commit 已成功、工作區乾淨，可刪除這個 stale lock 檔再繼續。
- 不要直接在 `G:\我的雲端硬碟\...` 專案資料夾執行 `npm install` 來建立 `node_modules`；Google Drive 同步會造成大量 `TAR_ENTRY_ERROR`、`EBADF`、`EPERM`、`unknown error, write`。需要驗證時，先複製必要檔案到 `C:\Users\tinad\AppData\Local\Temp\homework-check-build` 之類的本機暫存資料夾，再安裝與建置。
- npm / Vite / Firebase 相關下載若出現 `unable to verify the first certificate` 或 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`，先在同一個 PowerShell session 設定 `$env:NODE_OPTIONS='--use-system-ca'` 再重跑。
- `apply_patch`、Node REPL 或一般 sandbox 寫入 Google Drive 工作區時，可能出現 `windows sandbox failed: helper_unknown_error: setup refresh had errors`；若是必要專案檔修復，可改用經授權的非沙盒 PowerShell 多行文字寫入，完成後務必用 build 或讀回驗證。

## 不要做

- 不要把每日進度寫進 AGENTS.md
- 不要自動納入無關 git 變更
- 不要把 API key、token、密碼寫進 repo
- 不要儲存學生姓名；正式資料只用座號與班級代號
- 不要把 Obsidian 駕駛艙複製到專案工作資料夾


