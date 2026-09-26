"""Exact circle geometry, shared SVG/PDF vector scene primitives."""
import math,html
BLUE='#3566a0';BROWN='#98502f';INK='#253b39';GRAY='#7a8781';LIGHT='#d8dfd6'
def point(deg,c=(260,166),r=105):return(c[0]+r*math.cos(math.radians(deg)),c[1]-r*math.sin(math.radians(deg)))
def angle(a,o,b):
 u=[a[i]-o[i] for i in (0,1)];v=[b[i]-o[i] for i in (0,1)]
 return math.degrees(math.atan2(abs(u[0]*v[1]-u[1]*v[0]),u[0]*v[0]+u[1]*v[1]))
def scene(f,answer=False,guide=False,qid=0):
 out=[]
 def line(a,b,c=GRAY,w=1.5,dash=''):out.append(('line',a,b,c,w,dash))
 def text(x,y,s,size=15,c=INK):out.append(('text',x,y,s,size,c))
 def arc(center,r,start,end,c=BLUE,w=2.5,dash=''):
  pts=[point(start+(end-start)*i/72,center,r) for i in range(73)]
  out.append(('polyline',pts,c,w,dash))
 def mark(a,o,b,label='',c=BLUE,r=23):
  start=math.degrees(math.atan2(o[1]-a[1],a[0]-o[0]));end=math.degrees(math.atan2(o[1]-b[1],b[0]-o[0]));d=(end-start+180)%360-180
  arc(o,r,start,start+d,c,1.5)
  if label:
   x,y=point(start+d/2,o,r+20);text(x-9,y+5,label,14,c)
 def tag(p,name,center=(260,166)):
  dx,dy=p[0]-center[0],p[1]-center[1];n=math.hypot(dx,dy) or 1
  text(p[0]+17*dx/n-5,p[1]+17*dy/n+5,name,16)
 def arrow(a,b,c=GRAY):
  line(a,b,c,1)
  t=math.atan2(b[1]-a[1],b[0]-a[0])
  for d in [-.45,.45]:line(b,(b[0]-7*math.cos(t+d),b[1]-7*math.sin(t+d)),c,1)
 O=(260,166);r=105;kind=f.get('kind','circle')
 if not f:
  text(85,125,'同じ側の点P・Q',18);text(85,175,'55° ≠ 50°',22,BLUE);text(85,224,'同じ円なら、等しくなるはず。',16)
  return out
 if kind=='cross':
  c=(2.5,-math.sqrt(27)/2);rr=math.sqrt(37);k=r/rr
  cv=lambda p:(260+(p[0]-c[0])*k,166-(p[1]-c[1])*k)
  A,B,C,D,X=map(cv,[(-3,0),(2,math.sqrt(12)),(8,0),(-3,-math.sqrt(27)),(0,0)])
  arc(O,r,0,360,GRAY,1.2)
  for a,b in [(A,B),(C,D),(A,C),(B,D)]:line(a,b)
  for p,s in [(A,'A'),(B,'B'),(C,'C'),(D,'D')]:tag(p,s)
  text(X[0]+7,X[1]+19,'X',16)
  if answer or guide:
   mark(X,A,B,'',BLUE,24);mark(X,D,C,'',BLUE,24);mark(A,X,B,'',BROWN,16);mark(D,X,C,'',BROWN,16)
   text(34,35,'同じ弧BCを見る',16,BLUE);arrow((180,42),A)
  if qid==20 or guide:
   for a,b,t in [(A,X,'3'),(D,X,'6'),(B,X,'4'),(C,X,'8' if answer or guide else '?')]:text((a[0]+b[0])/2+4,(a[1]+b[1])/2-8,t,16)
  return out
 if kind=='quad':
  v=f.get('angle',72);B=point(0);D=point(2*v);A=point((2*v+360)/2);C=point(v)
  arc(O,r,0,360,GRAY,1.2)
  for a,b in [(A,B),(B,C),(C,D),(D,A)]:line(a,b)
  for p,s in [(A,'A'),(B,'B'),(C,'C'),(D,'D')]:tag(p,s)
  mark(D,A,B,str(v)+'°',BLUE);mark(B,C,D,str(180-v)+'°' if answer or guide else '?',BROWN)
  if answer or guide:arc(O,r+4,0,2*v,BLUE,3);arc(O,r+4,2*v,360,BROWN,3,'5 4')
  return out
 if kind=='tangent':
  A=point(180);B=point(80)
  arc(O,r,0,360,GRAY,1.2);line(A,O,BROWN,2,'5 3');line(A,B);line((A[0],35),(A[0],300),BLUE,2)
  tag(A,'A');tag(B,'B');text(263,182,'O');text(A[0]-20,40,'l')
  line((A[0]+10,A[1]),(A[0]+10,A[1]-10));line((A[0]+10,A[1]-10),(A[0],A[1]-10))
  mark(O,A,B,'40°',BROWN,30)
  if answer or guide:mark((A[0],35),A,B,'50°',BLUE,50)
  return out
 a,b,p=f.get('a',210),f.get('b',330),f.get('p',90);A,B,P=point(a),point(b),point(p)
 showcircle=not f.get('noCircle') or answer or guide
 if showcircle:arc(O,r,0,360,GRAY,1.2,'4 4' if f.get('noCircle') else '')
 start,end=a,b
 if end<=start:end+=360
 pp=p
 while pp<start:pp+=360
 if pp<end:start,end=end,start+360
 if showcircle and not f.get('noCircle') and not(qid==1 and not answer):arc(O,r,start,end,BLUE,3)
 for z in (A,B):line(P,z,INK)
 line(A,B,LIGHT,1,'4 4')
 for z,s in [(A,'A'),(B,'B'),(P,'P')]:tag(z,s)
 theta=angle(A,P,B)
 label=str(round(theta))+'°' if answer or guide else str(f['inscribed'])+'°' if 'inscribed' in f else '?' if qid not in (1,9,10,11,12,16) else ''
 if qid==1 or f.get('vocabulary'):label=''
 if not f.get('proof'):mark(A,P,B,label,BLUE,25)
 if 'q' in f:
  Q=point(f['q']);tag(Q,'Q')
  for z in (A,B):line(Q,z,BROWN,1.5,'5 3')
  mark(A,Q,B,str(round(angle(A,Q,B)))+'°' if answer or guide else str(f['qKnown'])+'°' if 'qKnown' in f else '?',BROWN,21)
  if guide and (a<f['q']<b):arc(O,r+4,b,a+360,BROWN,2,'5 4')
 central=(any(k in f for k in ['central','minor','diameter','proof']) or guide or qid in (4,7)) and not f.get('vocabulary') and not f.get('noCircle') and not (guide and 'q' in f)
 if central:
  for z in (A,B):line(O,z,BROWN,1.4,'5 3')
  text(264,161,'O',15)
  if not f.get('proof'):
   arc(O,30,start,end,BROWN,1.4,'4 3')
   if 'central' in f or answer or guide:
    mid=point((start+end)/2,O,58);text(mid[0]-17,mid[1]+5,str(round(end-start))+'°',14,BROWN)
   if 'minor' in f:
    mark(A,O,B,'',BROWN,30);text(377,194,str(f['minor'])+'°',16,BROWN);arrow((370,189),point(270,O,30),BROWN)
 if f.get('atA'):
  mark(P,A,B,str(f['atA'])+'°',BROWN,28)
  if answer:mark(P,B,A,str(round(angle(P,B,A)))+'°',BLUE,28)
 proof=f.get('proof')
 if proof:
  line(P,O,BLUE,1.7)
  C=point(p+180)
  if proof in ('single','symbol'):
   mark(O,P,B,'x' if proof=='symbol' else '30°',BLUE,30)
   mark(P,B,O,('x' if proof=='symbol' else '30°') if answer or guide else '?',BLUE,30)
   mark(A,O,B,('2x' if proof=='symbol' else '60°') if answer or guide else '?',BROWN,25)
  else:
   line(O,C,BLUE,1.5,'4 3');tag(C,'C')
   if proof=='inside':
    mark(A,P,C,'',BLUE,35);mark(C,P,B,'',BROWN,49);text(P[0]-51,P[1]+65,'22°',15,BLUE);text(P[0]+23,P[1]+86,'35°',15,BROWN)
   else:
    mark(A,P,C,'80°',BLUE,39);mark(B,P,C,'20°',BROWN,68)
 if qid==22 or (guide and f.get('diameter') and abs(p-106.26)<1):
  text((A[0]+P[0])/2-30,(A[1]+P[1])/2,'6 cm',15);text((B[0]+P[0])/2+8,(B[1]+P[1])/2,'8 cm',15)
 if guide:
  if proof:
   text(25,35,'半径OP = OB',17,BLUE);text(25,61,'二等辺三角形。',17);arrow((180,45),((O[0]+P[0])/2,(O[1]+P[1])/2),BLUE);arrow((420,145),((O[0]+B[0])/2,(O[1]+B[1])/2),BROWN);text(419,132,'半径OB',15,BROWN)
  elif f.get('noCircle'):
   text(28,30,'角が等しいことから',17);text(28,56,'この円を考えられる。',17);arrow((193,60),point(150))
  else:
   text(25,28,'円周上の頂点P',17,BLUE);arrow((157,38),P,BLUE)
   text(370,292,'Pを含まない弧',16,BLUE);arrow((377,274),point(start+(end-start)*.2 if 'q' in f else (start+end)/2),BLUE)
 return out

def svg(primitives,title='円の図'):
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 340" role="img" aria-label="{html.escape(title)}">']
 for p in primitives:
  if p[0]=='line':
   _,a,b,c,w,dash=p;parts.append(f'<line x1="{a[0]:.3f}" y1="{a[1]:.3f}" x2="{b[0]:.3f}" y2="{b[1]:.3f}" stroke="{c}" stroke-width="{w}" stroke-dasharray="{dash}"/>')
  elif p[0]=='polyline':
   _,pts,c,w,dash=p;parts.append('<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)+f'" fill="none" stroke="{c}" stroke-width="{w}" stroke-dasharray="{dash}"/>')
  else:
   _,x,y,s,size,c=p;parts.append(f'<text x="{x}" y="{y}" fill="{c}" font-size="{size}" font-family="sans-serif">{html.escape(s)}</text>')
 return ''.join(parts)+'</svg>'
