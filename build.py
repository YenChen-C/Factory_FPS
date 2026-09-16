from pathlib import Path
import json
P=Path(__file__).resolve().parent
(P/'dist').mkdir(exist_ok=True)
(P/'evidence').mkdir(exist_ok=True)
scripts=[(P/'src/three.min.js').read_text(),'window.FLOOR_DATA='+json.dumps(json.loads((P/'src/floor3.json').read_text()),ensure_ascii=False,separators=(',',':'))+';']+[(P/'src'/f).read_text() for f in ['config.js','models.js','factory.js','space.js','action.js','look.js','destruction.js','blessings.js','tactics.js','audio.js','game.js']]
html=(P/'src/page.html').read_text().replace('<!--SCRIPTS-->','\n'.join('<script>'+s.replace('</script','<\\/script')+'</script>' for s in scripts))
(P/'dist/Factory_Defense_S1.9.html').write_text(html.replace('S1.1','S1.9'))
print('Built',len(html.encode()),'bytes')
viewer=(P/'src/viewer.html').read_text().replace('<!--SCRIPTS-->',''.join('<script>'+(P/'src'/f).read_text().replace('</script','<\\/script')+'</script>' for f in ['three.min.js','config.js','models.js']))
(P/'dist/Factory_Models_S1.9.html').write_text(viewer)

(P/'Factory_Defense_S1.9.html').write_bytes((P/'dist/Factory_Defense_S1.9.html').read_bytes())
(P/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=Factory_Defense_S1.9.html"><title>Factory Defense</title><a href="Factory_Defense_S1.9.html">Play Factory Defense S1.9</a></html>')
