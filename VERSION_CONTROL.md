# 版本控制方式

目前遊戲版本為 S1.9，建議下一版使用 S1.10，修正版本使用 S1.9.1。

1. main 保持可遊玩版本。每次修改先從最新 main 建立 feature/功能名稱 或 fix/問題名稱 分支。
2. 修改 src 原始碼，不要只修改 index.html。執行 python build.py 重新產生 Factory_Defense_S1.9.html 與 index.html；玩家仍不需 Python。
3. 用 Node.js 執行全部 test*.cjs，並在瀏覽器確認移動、射擊、商店與畫面正常。
4. git add 後 git commit 留下修改說明，再 git push 上傳分支。
5. 在 GitHub 建立 Pull Request，比對差異，確認後合併到 main。
6. 穩定版建立 Tag（例如 v1.9.0）與 Release，填寫更新內容。Tag 是固定版本，不要移動既有正式版 Tag。
7. 若更新出錯，使用 git revert 問題提交，保留完整歷史；不建議 force push 主分支。

## 常用命令

```bash
git clone https://github.com/YenChen-C/Factory_FPS.git
cd Factory_FPS
git switch main
git pull --ff-only
git switch -c feature/next-update
# 修改原始碼、建置與測試
git add src build.py Factory_Defense_S1.9.html index.html VERSION_CONTROL.md
git commit -m "feat: 說明此次新增功能"
git push -u origin feature/next-update
```

PR 合併後再回到 main 並拉取最新內容，才建立正式 Tag：

```bash
git switch main
git pull --ff-only
git tag v1.9.0
git push origin v1.9.0
```

之後可直接要求 AI：「以 Factory_FPS 最新 main 為基礎，建立分支，修改功能、測試後開 PR。」

GitHub 官方流程：https://docs.github.com/en/get-started/using-github/github-flow
