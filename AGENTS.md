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

收工時：
- 使用 `shutdown-sync` 流程
- 更新 Obsidian 駕駛艙
- 如規則、路徑、專案邊界改變才更新本檔
- 需要時 commit + push GitHub

新專案初始化時：
- 使用 `project-init-sync` 流程

## 主要檔案

入口檔：README.md
設定檔：AGENTS.md、.gitignore
部署位置：GitHub Pages（main branch / root）
既有素材：claude對話/、密涅瓦大學思考習慣HC完整清單.md

## 不要做

- 不要把每日進度寫進 AGENTS.md
- 不要自動納入無關 git 變更
- 不要把 API key、token、密碼寫進 repo
- 不要儲存學生姓名；正式資料只用座號與班級代號
- 不要把 Obsidian 駕駛艙複製到專案工作資料夾
