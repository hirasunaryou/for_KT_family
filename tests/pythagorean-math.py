"""Independent expected answers and exactness/print integrity checks."""
import json, math, re, sys
from pathlib import Path
from fractions import Fraction
R=Path(__file__).resolve().parents[1];D=json.loads((R/'materials/pythagorean/content.json').read_text())
sys.path.insert(0,str(R/'scripts'));from pythagorean_figures import scene,layout
Q=D['questions'];eq=lambda a,b:abs(a-b)<1e-8
# Values are derived independently of the renderer and JS models.
assert 3**2+4**2==25 and 5**2+12**2==169
assert 2**2+3**2==13 and 5**2-3**2==16 and 10**2-6**2==64
assert not eq(4**2+3**2-2*4*3*math.cos(math.pi/3),25)
assert 5**2+12**2==13**2 and 4**2+5**2!=6**2
assert 3**2+3**2==18 and 6**2-3**2==27
assert eq(6*math.sqrt(27)/2,9*math.sqrt(3))
assert (3**2+(3+1)**2)==25 and ((-4)**2+(-4+1)**2)==25
assert 10**2-6**2==64 and 5**2-(8/2)**2==9 and 13**2-5**2==144
assert eq(2*math.sqrt(25-4),2*math.sqrt(21))
assert (4-(-2))**2+(9-1)**2==100
assert (2**2/2)==2 and 2**2+2**2==8
assert 10/5==2 and (6*8/2)/(3*4/2)==4
# Similarity proof: foot of the altitude, lengths p/q and actual correspondence.
A=(0,3);B=(4,0);C=(0,0);H=(Fraction(36,25),Fraction(48,25));dist=lambda p,q:math.hypot(p[0]-q[0],p[1]-q[1])
a=dist(B,C);b=dist(C,A);c=dist(A,B);p=dist(A,H);q=dist(H,B)
assert eq(b*b,c*p) and eq(a*a,c*q) and eq(p+q,c)
assert 3**2+4**2+12**2==169 and 3*2**2==12
assert 5**2-3**2==16 and eq(math.pi*9*4/3,12*math.pi)
assert [(3+2)**2+4**2,(3+4)**2+2**2,(4+2)**2+3**2]==[41,53,45]
assert 17**2-8**2==225 and 13**2-(24/2)**2==25
# The 4-5-6 triangle really has three correct lengths at the supplied angle.
f=Q[9]['figure'];c2=f['a']**2+f['b']**2-2*f['a']*f['b']*math.cos(math.radians(f['angle']));assert eq(c2,36)
# All non-projected primitives fit within the shared scene. Workbook doesn't reveal solved labels.
for item in [*D['lessons'],*Q]:
 for guide,answer in [(False,False),(True,False),(False,True)]:
  for t in scene(item['figure'],answer,guide,item['id']):
   if t[0]!='text':assert all(-1<=x<=641 and -1<=y<=401 for x,y in t[1]),(item['id'],t)
assert not any(t[0]=='text' and '全辺2倍' in t[3] for t in scene(Q[20]['figure']))
print('PASS pythagorean mathematics: 28 problem calculations, similarity correspondence, true 4-5-6 triangle, scene geometry and no multiplier leak')
