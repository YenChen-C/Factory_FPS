## S1.14 — 手機操作重設計

- 左搖桿支援類比方向與速度，向前推遠奔跑；右射擊鍵可按住開火並滑動瞄準。
- 瞄準、蹲下改點按切換；跳躍長按噴射。另可啟用左射擊鍵支援三／四指。
- 附近物件才顯示拾取／開門，投擲物與技能分組收合；換彈及切槍按可用狀態顯示。
- 手機操作設定可調整一般／瞄準靈敏度、按鈕大小，瀏覽器自動保存。
- 更新橫直向、平板及安全邊界排版；暫停、離場、失焦、旋轉與觸控取消清除按住狀態。
- 遊戲入口：`Factory_Defense_S1.14.html`；排版檢查頁：`mobile-preview.html`；觸控測試：`node test-mobile.cjs`。

## S1.13 — 機台爆炸調整

機台燃燒 30 秒後爆炸，最高傷害 400。遊戲入口：`Factory_Defense_S1.13.html`。

## S1.12 — 每十波苦力怕

- 第 10、20、30…波額外出現一隻綠色方塊苦力怕，不取代一般敵人或 BOSS。
- 發現玩家後靠近；3m 內且視線無阻擋時啟動 2 秒倒數，停止移動並閃動提示；暫停時凍結倒數。
- 爆炸半徑 6m，障礙物可阻擋；命中直接將爆炸當下生命值除以 10，不扣防彈衣，不套用減傷或無敵。可提前擊殺或逃離。
- 波次以原有敵人清除為準，苦力怕不阻擋通關；未爆炸者在波末清除，重開與離場亦清除。練習場不出現。

## S1.11 — 射擊練習場

- 主頁新增射擊練習場，直接進入 3F 地圖。
- 固定五名巡邏敵人，不偵測、追擊或攻擊玩家；死亡立即在隨機可通行位置重生。
- 新增離開練習場按鈕，清除場內狀態並返回主頁；暫停與重新開始支援練習模式。
- 練習不推進波次，不累積金錢或永久武器經驗。

# S1.10（2026-09-17）

- 機台燃燒滿 60 秒後爆炸：半徑 6m、最高傷害 200，沿用距離衰減與遮蔽物判定，可傷害人物、牆門、機台、櫃子、AGV 和燃料桶。
- 燃燒計時跨波保留、暫停停止。爆炸機台及其未拾取補給永久移除，後續波次不再刷新，重新開始恢復。
- 門被破壞時連門框、自動門軌道與上方碰撞一起移除。
- 置物櫃 100 HP；摧毀後移除外觀與碰撞，獨立 25% 機率掉落一件補給，重新開始恢復。
- 音樂面板縮小、預設收合，展開後仍保留影片播放控制。
- 自動辨識觸控裝置：搖桿、滑動視角、多指按鍵、橫直向介面、安全區；降低手機像素比與抗鋸齒負擔。
- 手機長按射擊、瞄準、跳躍／噴射、繩索和蹲下；提供切槍、換彈、拾取、開門、投擲與技能按鈕。取消觸控或暫停時清除按住狀態。

# Changelog

## S1.9 — 2026-09-16

Background music: https://www.youtube.com/watch?v=n2bKLqUKb9w (official embed, user-initiated playback).
Added synthesized gunshot, grenade and flashbang sounds.
Flashbangs clear enemy pursuit memory and suppress hearing while blind.
Added persistent 300 HP destructible doors, including sliding doors.
Renamed current standalone game to Factory_Defense_S1.9.html and updated index.html.

## S1.8

Expanded enemy search, burning-machine proximity damage, paid weapon upgrades, grip corrections and reduced rack loot.
