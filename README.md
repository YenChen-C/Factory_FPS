# Factory Strike V2.0 — 廠區戰術行動

[直接遊玩](https://yenchen-c.github.io/Factory_FPS/Factory_Strike_V2.0.html) · [原本的防線模式](https://yenchen-c.github.io/Factory_FPS/Factory_Defense_S1.14.html)

以 Urban Terror 的快節奏戰術 FPS 玩法為靈感，使用既有 3F 廠區配置製作的獨立瀏覽器遊戲。玩家加入一支 AI 隊伍，可選 3 vs 3、5 vs 5、8 vs 8；隊伍人數包含玩家。此版本是單機 AI 對戰，沒有真人連線、帳號或後端伺服器；規則數值與素材為本專案實作，並非官方移植。

直接開啟網址，或下載 `Factory_Strike_V2.0.html` 後以瀏覽器開啟；所有遊戲程式、地圖、Three.js 與音效產生器均包含在單一檔案，不需安裝 Python，也不需要 CDN。瀏覽器須支援 WebGL。手機自動啟用觸控介面，建議橫向遊玩。

| 模式 | 勝利條件 | 重生 / 回合 |
|---|---|---|
| 團隊死鬥 TDM | 50 擊殺，或 8 分鐘後分數較高 | 陣亡 4 秒後重生 |
| 回合殲滅 TS | 先取得 5 回合勝利 | 每回合 150 秒，一次生命；全滅判負，逾時平手 |
| 奪旗 CTF | 3 次交旗，或 10 分鐘後分數較高 | 陣亡 8 秒後重生；自己的旗須在基地才能交旗 |
| 爆破 BOMB | 先取得 5 回合勝利 | 150 秒；安裝 3 秒、拆除 5 秒、引爆 40 秒；逐回合交換攻守 |
| 射擊練習 | 五名移動、不攻擊的目標 | 目標死亡立即重新出現 |

CTF 落地旗幟可由本隊觸碰歸還，或 20 秒後自動歸位。旗點設在出生區前方，避免敵人必須穿過重生位置才能搶旗。爆破安裝後，即使攻方全滅仍須完成拆除；守方全滅則攻方勝利。兩種回合模式陣亡後自動觀戰隊友，下一回合重新配發裝備。

## 戰鬥與場景

- 保留 189 台機台、73 座貨架、93 段牆、77 扇門及原廠區物件配置；雙方出生點與爆破區位於連通的可行走區。
- 七種主要武器，加上手槍與戰鬥刀；有限彈匣與備彈、換彈、射程衰減、霰彈、瞄準鏡、後座力、命中部位、防彈衣與頭盔。
- 傷口流血、腿傷減速、包紮與隊友治療。醫療包縮短包紮時間並提高治療上限；偵察裝備較輕，衝刺體力消耗較低。
- 衝刺、蹲下、滑鏟、空中蹬牆（落地前最多三次）與低障礙翻越判定。
- 手榴彈、閃光彈、煙霧彈。煙霧遮蔽 AI 感知而不擋子彈；閃光使 AI 遺失追蹤記憶。
- AI 巡邏、視線與聲音搜索、受傷包紮、隊友治療、開門、換彈、彈藥耗盡切換武器、搶旗／護旗、安裝／拆除炸彈。暫停選單可下達跟隨、守點或進攻指令。
- 原創程序化戰術角色、武器、雙手持槍與換彈動畫、射擊／受傷回饋、彈痕、粒子、雷達、戰術地圖、戰績與結算。
- Web Audio 合成槍聲、腳步與爆炸，具距離衰減和左右聲像；4 檔畫質、FOV、靈敏度與觸控設定自動保存。
- 固定 60 Hz 模擬；機台使用實例化，牆、門框、角色與武器按材質合併幾何；限制特效數量與解析度。這是設計目標，不代表實機保證達到 60 FPS。

## 操作

| 電腦 | 功能 |
|---|---|
| WASD / Shift / Alt | 移動 / 衝刺 / 安靜行走 |
| 滑鼠左鍵 / 右鍵 | 射擊 / 瞄準 |
| Space / Ctrl 或 C | 跳躍與蹬牆 / 蹲下與滑鏟 |
| R / 1、2、3 / 滾輪 | 換彈 / 主武器、手槍、刀 / 切槍 |
| G / H / J | 手榴彈 / 閃光彈 / 煙霧彈 |
| B / F | 包紮 / 開門、拾槍、按住治療或處理炸彈 |
| Tab / M / Esc | 戰績 / 戰術地圖 / 暫停 |

桌面開始後需取得滑鼠鎖定；若未鎖定，點擊場景。手機左搖桿移動、前推外圈衝刺，右側滑動畫面轉向；射擊鍵可按住並拖曳瞄準，瞄準與蹲下採點按切換，可另啟用左射擊鍵。失焦、暫停、旋轉或取消觸控會解除按住狀態。

## 原始碼、建置與驗證

新的戰術模式位於 `strike/`。`src/` 與 `build.py` 保留舊版防線的實作。

```bash
python build_strike.py
node strike/test-matches.cjs
node strike/test-input.cjs
node strike/test-visuals.cjs
```

`test-matches.cjs` 同時執行 36 項核心測試與四種完整 AI 對戰。其他測試涵蓋 8 項輸入情境、9 種武器與角色模型／換彈姿態。測試範圍與實際結果見 [strike/VALIDATION.md](strike/VALIDATION.md)。

`Factory_Strike_Preview.html` 是使用分離原始碼的開發頁，需透過 HTTP 開啟。`strike-preview.html` 是相同 HTML/CSS 的響應式介面檢查工具，刻意停用 3D；`?ui=1` 亦只供介面驗證，不能作為 GPU 效能證據。正式遊玩請使用沒有此參數的版本網址。

目前已驗證模擬邏輯、完整比賽、程序化模型建立與瀏覽器介面。測試瀏覽器不能建立 WebGL context，因此尚未完成實際 GPU 畫面、聲音主觀品質、硬體滑鼠鎖定或真實手機效能驗收。陰影、瞄準視覺與不同裝置手感仍需實機檢查。

---

# 舊版防線紀錄

## S1.14 — 手機操作重設計

- 左搖桿支援類比方向與速度，向前推遠奔跑；右射擊鍵可按住開火並滑動瞄準。
- 瞄準、蹲下改點按切換；跳躍長按噴射。另可啟用左射擊鍵支援三／四指。
- 附近物件才顯示拾取／開門，投擲物與技能分組收合；換彈及切槍按可用狀態顯示。
- 手機操作設定可調整一般／瞄準靈敏度、按鈕大小，瀏覽器自動保存。
- 更新橫直向、平板及安全邊界排版；暫停、離場、失焦、旋轉與觸控取消清除按住狀態。
- 遊戲入口：`Factory_Defense_S1.14.html`；排版檢查頁：`mobile-preview.html`；觸控測試：`node test-mobile.cjs`。

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
