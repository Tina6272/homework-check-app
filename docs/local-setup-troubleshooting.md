# Local Setup Troubleshooting

## Firebase CLI 重新授權

目前 Firebase CLI 可看到登入帳號，但憑證已失效。請在本機終端機執行：

```powershell
firebase login --reauth
firebase projects:list
```

如果瀏覽器跳出 Google 登入畫面，請選擇專案使用的帳號。

目前專案已綁定：

```text
teacherstudy-9ce77
```

Firebase Web App 已建立：

```text
homework-check-app
1:174357235043:web:a116d03b023c88ec823f56
```

Firestore 規則已可部署。Storage 仍需要先到 Firebase Console 啟用：

```text
https://console.firebase.google.com/project/teacherstudy-9ce77/storage
```

進入後點選 `Get Started`，完成後再部署 Storage 規則。

## npm 憑證錯誤

本機 npm 目前連線 registry 時出現：

```text
UNABLE_TO_VERIFY_LEAF_SIGNATURE
```

短期測試可用：

```powershell
npm view react version --strict-ssl=false
```

正式建議是修正 Windows / Node 的憑證信任設定，而不是長期關閉 SSL 驗證。

## npm install 超時

本專案位於 Google Drive 同步資料夾，`node_modules` 會產生大量小檔案，可能被同步程序拖慢或鎖住。

建議處理順序：

1. 暫停 Google Drive 同步。
2. 關閉可能殘留的 `node.exe` / `npm.cmd` 程序。
3. 刪除未完成的 `node_modules`。
4. 重新執行：

```powershell
npm install --strict-ssl=false --no-audit --no-fund
npm run build
```

若安裝仍超時，建議把專案暫時複製到非雲端同步路徑完成安裝與建置，再把原始碼同步回此工作區。
