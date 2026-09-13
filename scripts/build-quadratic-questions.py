"""Build offline MathML data from print-aligned questions.
Install authoring dependency: python3 -m pip install latex2mathml==3.78.1
Run: python3 scripts/build-quadratic-questions.py
The published site itself has no dependencies.
"""
from pathlib import Path
import json, re
from latex2mathml.converter import convert
r=Path(__file__).resolve().parents[1]
questions=json.loads((r/'materials/quadratic/questions.json').read_text())
def mm(s):
 if not s:return ''
 s=re.sub(r'\\frac([0-9])',r'\\frac{\1}',s);s=re.sub(r'(\\frac\{[0-9]\})([0-9])',r'\1{\2}',s)
 return convert(s)
for q in questions:
 for k in ['expression','answer','working']:q[k+'HTML']=mm(q[k])
 if q['id'] in [3,31,41]:q['answerHTML']='下向き'
 if q['id']==12:q['answerHTML']='正しくない'
 if q['id'] in [6,10,34,44]:q['answerHTML']+=' 倍'
 if q['id']==28:q['answerHTML']='面積は4倍、周の長さは2倍'
 if q['id']==27:q['answerHTML']='① '+mm(r'27\ \mathrm{m}')+'　② '+mm(r'12\ \mathrm{m/s}')
 if q['id']==38:q['workingHTML']+='<br>'+mm(r'S=\frac{1}{2}\times6a\times(2+3)=15a=15\Rightarrow a=1')
(r/'assets/quadratic/questions.js').write_text('/* Aligned with the 44-item printed workbook. No network required. */\nwindow.QUADRATIC_QUESTIONS = '+json.dumps(questions,ensure_ascii=False,indent=2)+';\n')
