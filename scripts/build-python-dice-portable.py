"""Rebuild the portable browser lesson; the Jupyter guide is authored directly."""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/python-dice'
PAGE = ROOT / 'study/programming/python-dice'
html = (PAGE/'index.html').read_text()
css = (ASSETS/'style.css').read_text()
lessons = (ASSETS/'lessons.js').read_text().replace('export const ', 'const ')
app = (ASSETS/'app.js').read_text().replace("import {lessons, gameCode} from './lessons.js';", '')
base = 'https://hirasunaryou.github.io/for_KT_family/'
app = app.replace('href="../../../index.html"', f'href="{base}"').replace('href="../python-dice-jupyter/index.html"', f'href="{base}study/programming/python-dice-jupyter/"')
def literal(value):
    return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c')
inline = 'window.__packHTML="<!doctype html>"+document.documentElement.outerHTML;\nwindow.__styleText='+literal(css)+';\nwindow.__workerSource='+literal((ASSETS/'worker.js').read_text())+';\n'+lessons+'\n'+app
inline = inline.replace('</script', '<\\/script')
html = html.replace('<link rel="stylesheet" href="../../../assets/python-dice/style.css">', '<style>'+css+'</style>').replace('<script type="module" src="../../../assets/python-dice/app.js"></script>', '<script type="module">'+inline+'</script>')
(PAGE/'dice-lab.html').write_text(html)
print('Portable browser lesson rebuilt.')
