"""Build the offline, single-file Factory Strike release; retain defense releases."""
from pathlib import Path
import json, html
P=Path(__file__).resolve().parent
D=json.loads((P/'src/floor3.json').read_text())
# CAD strokes are a redundant survey overlay; all authored walls/objects stay.
D['plan']=[]
scripts=[(P/'src/three.min.js').read_text(),'window.FLOOR_DATA='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';']
scripts += [(P/'src'/f).read_text() for f in ['config.js','models.js','factory.js','space.js']]
scripts += [(P/'strike'/f).read_text() for f in ['core.js','navigation.js','audio.js','viewmodel.js','visuals.js','input.js','game.js']]
page=(P/'strike/page.html').read_text().replace('<!--SCRIPTS-->','\n'.join('<script>'+s.replace('</script','<\\/script')+'</script>' for s in scripts))
(P/'Factory_Strike_V2.1.html').write_text(page)
source_files=['src/'+f for f in ['three.min.js','config.js','models.js','factory.js','space.js']]+['strike/'+f for f in ['core.js','navigation.js','audio.js','viewmodel.js','visuals.js','input.js','game.js']]
(P/'Factory_Strike_Preview.html').write_text((P/'strike/page.html').read_text().replace('<!--SCRIPTS-->', '\n'.join('<script src="'+f+'"></script>' for f in source_files)))
(P/'index.html').write_text('<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=Factory_Strike_V2.1.html"><title>Factory Strike</title><a href="Factory_Strike_V2.1.html">開啟 Factory Strike V2.1</a> · <a href="Factory_Defense_S1.14.html">舊版防線</a></html>')
preview='''<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>Factory Strike Layout QA</title><style>body{font:14px system-ui;background:#16232e;color:white}button{padding:10px;margin:4px}iframe{display:block;border:2px solid #698294;margin-top:15px}</style><h2>Factory Strike · 同版介面預覽（不渲染 3D）</h2><button onclick="size(1366,900)">桌面</button><button onclick="size(844,390)">手機橫向</button><button onclick="size(667,375)">小型手機</button><button onclick="size(390,844)">手機直向</button><button onclick="size(1024,768)">平板</button><iframe id="preview" title="Factory Strike preview" width="1366" height="900" src="Factory_Strike_V2.1.html?ui=1&touch=1"></iframe><script>function size(w,h){let p=document.getElementById('preview');p.width=w;p.height=h}</script></html>'''
(P/'strike-preview.html').write_text(preview)
print('Factory_Strike_V2.1.html:',len(page.encode()),'bytes')
