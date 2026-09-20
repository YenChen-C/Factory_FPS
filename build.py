from pathlib import Path
import json
P=Path(__file__).resolve().parent
(P/'dist').mkdir(exist_ok=True)
(P/'evidence').mkdir(exist_ok=True)
scripts=[(P/'src/three.min.js').read_text(),'window.FLOOR_DATA='+json.dumps(json.loads((P/'src/floor3.json').read_text()),ensure_ascii=False,separators=(',',':'))+';']+[(P/'src'/f).read_text() for f in ['config.js','models.js','factory.js','space.js','action.js','look.js','destruction.js','blessings.js','tactics.js','audio.js','mobile.js','game.js']]
html=(P/'src/page.html').read_text().replace('<!--SCRIPTS-->','\n'.join('<script>'+s.replace('</script','<\\/script')+'</script>' for s in scripts))
(P/'dist/Factory_Defense_S1.14.html').write_text(html)
print('Built',len(html.encode()),'bytes')
viewer=(P/'src/viewer.html').read_text().replace('<!--SCRIPTS-->',''.join('<script>'+(P/'src'/f).read_text().replace('</script','<\\/script')+'</script>' for f in ['three.min.js','config.js','models.js']))
(P/'dist/Factory_Models_S1.14.html').write_text(viewer)

(P/'Factory_Defense_S1.14.html').write_bytes((P/'dist/Factory_Defense_S1.14.html').read_bytes())
(P/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=Factory_Defense_S1.14.html"><title>Factory Defense</title><a href="Factory_Defense_S1.14.html">Play Factory Defense S1.14</a></html>')

# Browser layout QA uses the same CSS, markup and touch controller without WebGL.
import html as html_escape
preview=(P/'src/page.html').read_text().replace('<body>','<body class="mobile">')
preview=preview.replace('<!--SCRIPTS-->','<script>'+(P/'src/mobile.js').read_text()+'</script><script>'+r'''
const $=id=>document.getElementById(id);for(const id of ['menu','shop','pause','loading'])$(id).hidden=true;
$('leavePractice').hidden=false;$('shopBtn').hidden=true;
$('title').textContent='手機介面預覽';$('phase').textContent='排版檢查 · 不執行 3D';$('playTime').textContent='同版介面與觸控程式';
for(const [id,text]of Object.entries({healthText:'生命 100 / 100',armorText:'防彈衣 100 / 100',fuelText:'噴射器 100%',actionEnergy:'行動能量 100 / 100',money:'$ 2400',structureHP:'',gunName:'P9 手槍'}))$(id).textContent=text;
for(const id of ['healthBar','armorBar','fuelBar','energyBar'])$(id).style.width='100%';
$('canvas').style.background='radial-gradient(ellipse at 50% 55%,#475963,#182735 75%)';
const surface=document.createElement('div');surface.style.cssText='position:absolute;inset:0';$('canvas').append(surface);
let paused=false,aiming=false;const controller=makeMobileControls({$,canvas:surface,allowed:()=>!paused,key:()=>{},move:()=>{},look:()=>{},fireHeld:()=>{},aim:v=>aiming=v,aiming:()=>aiming,fire:()=>{},action:()=>{},unlock:()=>{},pause:()=>{paused=true;$('pause').hidden=false},resume:()=>{paused=false;$('pause').hidden=true;refresh()}});
function refresh(){controller.update({interaction:'開門',ammo:12,mag:12,gun:'P9 手槍',hasMain:true,grenades:2,flashes:2,combat:true,reloading:false})}refresh();
$('pauseBtn').onclick=()=>{paused=true;controller.reset();$('pause').hidden=false;refresh()};$('resume').onclick=()=>{paused=false;$('pause').hidden=true;refresh()};addEventListener('resize',refresh);
'''+'</script>')
(P/'mobile-preview.html').write_text('''<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>手機介面排版檢查</title><style>body{background:#28303a;color:white;font:14px system-ui}button{padding:10px;margin:4px}iframe{display:block;border:4px solid #708080;border-radius:12px;margin:12px 0;box-sizing:content-box}</style><h2>手機介面排版檢查</h2><p>使用遊戲同版 HTML、CSS 與觸控程式；此頁僅預覽介面，不執行 3D 或戰鬥。</p><button onclick="size(844,390)">844 × 390 橫向</button><button onclick="size(667,375)">667 × 375 小螢幕</button><button onclick="size(390,844)">390 × 844 直向</button><button onclick="size(1024,768)">1024 × 768 平板</button><iframe id="game" title="遊戲手機介面預覽" width="844" height="390" srcdoc="'''+html_escape.escape(preview,quote=True)+'''"></iframe><script>function size(w,h){document.getElementById('game').width=w;document.getElementById('game').height=h}</script></html>''')
