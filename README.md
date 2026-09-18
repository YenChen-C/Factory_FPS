## S1.13 — 機台爆炸調整

機台燃燒 30 秒後爆炸，最高傷害 400。遊戲入口：`Factory_Defense_S1.13.html`。

## S1.12 苦力怕

最新入口：`index.html` 或 `Factory_Defense_S1.12.html`。每十波額外一隻苦力怕，靠近 3m 後倒數 2 秒；爆炸半徑 6m，命中使當前生命值剩 1/10（例如 70 → 7）。可利用掩體、逃出範圍或先擊殺。未爆炸者在當波結束時消失，不需要擊殺它才能通關。練習場維持原本五名被動敵人。

測試：`node test-creeper.cjs`。瀏覽器視覺與實機效能尚未驗證。

## S1.11 射擊練習場

開啟 `index.html` 或 `Factory_Defense_S1.11.html`，在主頁選「射擊練習場」。場上固定五名只會行走的敵人，死亡立即隨機重生。上方控制區的「離開練習場」可返回主頁，手機若已收合控制區請先展開。練習不計入波次、金錢或永久武器經驗。

驗證：`node test-practice.cjs`，涵蓋巡邏、不攻擊、重生與模式切換；其餘測試命令見下方。

# Factory Defense S1.10

[Play online](https://yenchen-c.github.io/Factory_FPS/)

Download `Factory_Defense_S1.10.html` and open it directly, or play through GitHub Pages. No Python is needed to play. Background music uses the requested YouTube embed and needs an internet connection; click **啟用背景音樂** and, if necessary, the video play button. Offline sound effects use Web Audio.

## S1.10 changes

- Added distinct synthesized weapon fire, grenade explosions and flashbang sounds, with volume/mute controls and distance attenuation.
- Flashbangs clear pursuit memory and routes. Blinded enemies ignore sounds and must reacquire the player after recovering.
- Doors have 300 HP, matching walls. Gunfire, melee, shockwaves and explosions can destroy them. Broken doors no longer render, block movement/projectiles, or offer interaction. Door damage persists between waves and resets with a new game.
- English release filename; `index.html` points to the latest version. S1.8 remains in Git history.

## Build and verify

Run `python build.py` to produce the standalone release and update the homepage. The build uses only Python's standard library; all game code and Three.js are bundled into the output. Run each `test*.cjs` with Node.js to verify gameplay logic. Tests use a mocked renderer, so they do not measure GPU performance or subjective sound quality.

See `VERSION_CONTROL.md` for the version-control workflow. Keep changes in `src/`, rebuild, run checks, and commit source plus release together.


### S1.10 手機操作

手機／平板自動使用觸控介面，建議橫向遊玩。左下搖桿移動，推到外圈跑步；在場景畫面滑動瞄準。右下提供射擊、瞄準、換彈、切槍、拾取、開門、投擲、近戰技能、閃避、蹲下與繩索。長按跳躍可使用噴射器。上方可開商店或暫停。音樂設定預設收合。

機台燃燒計時會跨波延續；爆炸後本局不會重生。全部機台耗盡後，不再提供機台補給。重新開始會恢復全部建物。

驗證：執行 `python build.py` 後，逐一執行 `node test*.cjs`（每個測試檔單獨執行）。手機已做多指輸入邏輯測試，尚未完成實機效能與視覺驗證。
