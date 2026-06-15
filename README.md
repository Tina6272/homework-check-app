# 作業檢查 App

這個專案用來建立「學生自主完成作業」的作業檢查工具工作區。

## 工作模式

- 固定入口規則：`AGENTS.md`
- 進度與下一步：Obsidian `作業檢查 App/專案工作流程.md`
- 版本管理：GitHub repo `Tina6272/homework-check-app`
- 部署目標：GitHub Pages
- 資料服務：Firebase（project id 待設定）

## 既有資料

- `claude對話/`：前期對話與原型素材
- `密涅瓦大學思考習慣HC完整清單.md`：教學素材

## 安全原則

- 不提交 `.env`、API key、token、密碼或 Firebase Admin 憑證
- 學生資料只使用座號與班級代號，不存真名
- `.codex/` 與其他本機 AI agent 設定不納入 Git
