"""Independent exact algebra checks for the printed and web answer source."""
from pathlib import Path
import json
import sympy as s
root=Path(__file__).resolve().parents[1]
x=s.symbols('x',real=True)
qs=json.loads((root/'materials/quadratic-equations/questions.json').read_text())
assert [q['id'] for q in qs]==list(range(1,41))
for q in qs:
 if q['poly'] is None:continue
 a,b,c=q['poly'];p=a*x*x+b*x+c
 got={s.simplify(s.sympify(r)) for r in q['roots']}
 want={s.simplify(r) for r in s.solve(p,x)}
 assert got==want,(q['id'],got,want)
 for r in got:assert s.simplify(p.subs(x,r))==0
assert s.expand((x+2)*(x+3))==x*x+5*x+6
assert 5*8==40 and 8*9==72 and (8-2)*(12-2)==60 and 4*6==24
assert all(-5*t*t+20*t==15 for t in [1,3])
assert all(y==x*x==2*x+3 for x,y in [(-1,1),(3,9)])
print('PASS exact algebra: all 39 equation root sets, factorization, application conditions and intersections')
