# 版本控制方式

目前最新入口為 **Factory Strike V2.0**。舊版防線 S1.14 保留於原網址。

1. 新戰術玩法修改 `strike/`，執行 `python build_strike.py` 產生單檔 release、開發預覽與首頁。
2. 舊防線修改 `src/`，使用 `build.py`；該舊建置器也會改寫首頁，若仍要以 Strike 為首頁，最後需再執行 `build_strike.py`。
3. 新戰術版執行 `node strike/test-matches.cjs`、`node strike/test-input.cjs`、`node strike/test-visuals.cjs`。修改共用 `src/` 時，亦需執行根目錄相關 `test*.cjs`。
4. 每項修改從最新 main 建立功能分支，提交原始碼、建置檔案、說明與驗證結果，再透過 PR 檢查；已明確授權的發佈可直接更新 main。
5. main 是 GitHub Pages 的發佈來源；提交成功後須確認 Pages 工作流程完成，並開啟正式版本網址。
6. 不覆寫舊 release。修正版本使用新檔名並更新首頁；回退使用 git revert，避免 force push。

倉庫：https://github.com/YenChen-C/Factory_FPS
正式遊玩：https://yenchen-c.github.io/Factory_FPS/Factory_Strike_V2.0.html
