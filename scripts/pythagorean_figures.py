"""Exact planar constructions and explicitly separated solid projections.
Scene units are 640 by 400. SVG and print share every primitive.
"""
import math, html
BLUE='#3566a0'; BROWN='#98502f'; INK='#253b39'; GRAY='#77857e'; LIGHT='#d8dfd6'
PALE_BLUE='#edf3f9'; PALE_BROWN='#f7eee6'; PALE_GREEN='#edf2e7'; WHITE='#ffffff'
def fmt(x):return str(round(x)) if abs(x-round(x))<1e-8 else f'{x:.2f}'
def layout(a,b,second=False):
 l=a+b
 origins=[(0,a),(l,0),(a,l),(a,a)] if second else [(0,0),(l,0),(l,l),(0,l)]
 out=[]
 for i,(x,y) in enumerate(origins):
  t=i*math.pi/2;u=(a*math.cos(t),a*math.sin(t));v=(-b*math.sin(t),b*math.cos(t))
  out.append([(x,y),(x+u[0],y+u[1]),(x+v[0],y+v[1])])
 return out
class Scene:
 def __init__(self):self.out=[]
 def line(self,a,b,c=GRAY,w=1.6,dash=''):self.out.append(('line',[a,b],c,w,dash,None))
 def poly(self,pts,c=GRAY,fill=None,w=1.6,dash=''):self.out.append(('polygon',pts,c,w,dash,fill))
 def path(self,pts,c=GRAY,w=1.6,dash=''):self.out.append(('line',pts,c,w,dash,None))
 def text(self,x,y,s,size=18,c=INK,anchor='start'):self.out.append(('text',x,y,str(s),size,c,anchor))
 def arrow(self,a,b,c=GRAY):
  self.line(a,b,c,1.2);t=math.atan2(b[1]-a[1],b[0]-a[0]);self.path([(b[0]-8*math.cos(t-.4),b[1]-8*math.sin(t-.4)),b,(b[0]-8*math.cos(t+.4),b[1]-8*math.sin(t+.4))],c,1.2)
 def circle(self,p,r):self.path([(p[0]+r*math.cos(i*math.pi/36),p[1]+r*math.sin(i*math.pi/36)) for i in range(73)],GRAY,1.4)
 def right(self,a,o,b,size=12,c=GRAY):
  u=(a[0]-o[0],a[1]-o[1]);v=(b[0]-o[0],b[1]-o[1]);nu=math.hypot(*u);nv=math.hypot(*v)
  u=tuple(x/nu*size for x in u);v=tuple(x/nv*size for x in v)
  self.path([(o[0]+u[0],o[1]+u[1]),(o[0]+u[0]+v[0],o[1]+u[1]+v[1]),(o[0]+v[0],o[1]+v[1])],c,1.3)
 def mid(self,a,b,t,offset=(0,0),c=INK,size=20):self.text((a[0]+b[0])/2+offset[0],(a[1]+b[1])/2+offset[1],t,size,c,'middle')
 def fit(self,points,box):
  x,y,w,h=box;xs=[p[0] for p in points];ys=[p[1] for p in points];dx=max(xs)-min(xs);dy=max(ys)-min(ys);k=min(w/(dx or 1),h/(dy or 1));ox=x+(w-k*dx)/2-min(xs)*k;oy=y+(h-k*dy)/2+max(ys)*k
  return lambda p:(ox+k*p[0],oy-k*p[1]),k
 def tag(self,p,t,dx=0,dy=0):self.text(p[0]+dx,p[1]+dy,t,20)

def scene(f,answer=False,guide=False,qid=0):
 s=Scene();k=f.get('kind');shown=answer or guide
 if k=='intro':
  C,A,B=(220,275),(220,95),(460,275)
  s.poly([C,A,B],INK,PALE_GREEN);s.line(C,A,BROWN,2.4);s.line(C,B,BLUE,2.4);s.line(A,B,INK,2.6);s.right(A,C,B,13)
  s.text(190,188,'b',24,BROWN,'middle');s.text(340,310,'a',24,BLUE,'middle');s.text(365,173,'c',24,INK,'middle')
  s.text(42,251,'ここが90°',19);s.arrow((158,249),(228,264))
  s.text(392,42,'斜辺 c',20);s.text(392,72,'直角の向かい',18);s.arrow((410,86),(298,150))
  for x,label,color in [(243,'a²',BLUE),(282,'＋',INK),(321,'b²',BROWN),(361,'＝',INK),(400,'c²',INK)]:s.text(x,376,label,28,color,'middle')
 elif k=='triangle':
  a,b=f['a'],f['b'];ang=math.radians(f.get('angle',90));pts=[(0,0),(b*math.cos(ang),b*math.sin(ang)),(a,0)];t=math.radians(f.get('rotate',0));pts=[(x*math.cos(t)-y*math.sin(t),x*math.sin(t)+y*math.cos(t)) for x,y in pts];cv,_=s.fit(pts,(195,85,245,215));C,A,B=map(cv,pts)
  s.poly([C,A,B],fill=PALE_GREEN);s.line(C,A,BROWN,2);s.line(C,B,BLUE,2);s.line(A,B,INK,2.5)
  if f.get('angle',90)==90 and (not f.get('noRight') or shown):s.right(A,C,B)
  if f.get('angle')==60:s.text(C[0]+28,C[1]-16,'60°',17)
  center=((A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3)
  def edge(p,z,label,color):
   m=((p[0]+z[0])/2,(p[1]+z[1])/2);dx,dy=m[0]-center[0],m[1]-center[1];n=math.hypot(dx,dy);s.mid(p,z,label,(dx/n*27,dy/n*27+6),color)
  al,bl,cl=f.get('al','a'),f.get('bl','b'),f.get('cl','c')
  if shown and 'sol' in f:
   if f.get('unknown')=='a':al=f['sol']
   else:cl=f['sol']
  edge(C,B,al,BLUE);edge(C,A,bl,BROWN);edge(A,B,cl,INK)
  if qid==1:
   for p,name in [(A,'A'),(B,'B'),(C,'C')]:
    dx,dy=p[0]-center[0],p[1]-center[1];n=math.hypot(dx,dy);s.tag(p,name,dx/n*24-5,dy/n*24+6)
  if guide:
   if f.get('mode')=='root':s.text(34,35,'2²＋3²＝13',21,INK);s.text(448,237,'c²からcへ',18,BLUE);s.text(448,267,'√13 を使う',20,BLUE);s.arrow((433,235),(A[0]*.3+B[0]*.7+5,A[1]*.3+B[1]*.7))
   else:s.text(30,105,'直角の向かい',19);s.text(30,135,'この辺が斜辺',19);s.arrow((159,147),(A[0]*.7+B[0]*.3-5,A[1]*.7+B[1]*.3));s.text(300,372,'x²＋3²＝5² → x＝4',21,INK,'middle')
 elif k=='squares':
  a,b=f['a'],f['b'];C=(0,0);A=(0,b);B=(a,0);polys=[[(0,0),(a,0),(a,-a),(0,-a)],[(0,0),(0,b),(-b,b),(-b,0)],[A,B,(a+b,a),(b,a+b)]];cv,sc=s.fit(sum(polys,[]),(160,50,330,290))
  for poly,c,fill,label in zip(polys,[BLUE,BROWN,INK],[PALE_BLUE,PALE_BROWN,PALE_GREEN],[f'{fmt(a*a)}',f'{fmt(b*b)}','?' if f.get('unknown') and not shown else fmt(a*a+b*b)]):
   ps=list(map(cv,poly));s.poly(ps,c,fill);s.text(sum(p[0] for p in ps)/4,sum(p[1] for p in ps)/4+7,label,23,c,'middle')
  s.poly(list(map(cv,[C,A,B])),INK,WHITE);s.right(cv(A),cv(C),cv(B));
  if not f.get('unknown') or shown:s.mid(cv(C),cv(B),'a' if qid==3 else fmt(a),(0,-7),BLUE,18);s.mid(cv(C),cv(A),'b' if qid==3 else fmt(b),(12,5),BROWN,18)
  if guide:s.text(26,36,'数字は正方形の面積',18);s.arrow((195,52),cv((-b/2,b*.75)));s.text(336,375,'9＋16＝25',23,INK,'middle')
 elif k=='rearrange':
  a,b=f['a'],f['b'];l=a+b;z=215/l
  for j,ox in enumerate([45,375]):
   oy=75;s.poly([(ox,oy),(ox+215,oy),(ox+215,oy+215),(ox,oy+215)],INK,WHITE)
   for i,pts in enumerate(layout(a,b,bool(j))):
    ps=[(ox+x*z,oy+y*z) for x,y in pts];s.poly(ps,GRAY,['#edf3f9','#f7eee6','#edf2e7','#f2f0f7'][i]);s.text(sum(p[0] for p in ps)/3,sum(p[1] for p in ps)/3+4,str(i+1),15,GRAY,'middle')
   s.text(ox+107,48,'一辺 a＋b',18,INK,'middle')
   if j==0:
    s.text(ox+107,oy+112,'c²' if shown else '空き',22,INK,'middle');s.mid((ox+a*z,oy),(ox+215,oy+a*z),'c',(-13,15),INK,18)
   else:
    s.text(ox+a*z/2,oy+a*z/2+6,'a²' if shown else '空き',20,BLUE,'middle');s.text(ox+(a+b/2)*z,oy+(a+b/2)*z+6,'b²' if shown else '空き',20,BROWN,'middle')
    s.text(ox+a*z/2,oy-9,'a',18,BLUE,'middle');s.text(ox+(a+b/2)*z,oy+232,'b',18,BROWN,'middle')
  s.arrow((282,182),(353,182));s.text(318,146,'同じ4枚',16,INK,'middle')
  if guide:s.text(320,353,'大きい面積も、引く面積も同じ。',20,INK,'middle')
 elif k=='condition':
  for i,(a,b,c) in enumerate([(5,12,13),(4,5,6)]):
   ang=math.acos((a*a+b*b-c*c)/(2*a*b));sub=scene(dict(kind='triangle',a=a,b=b,al=str(a),bl=str(b),cl=str(c),angle=ang*180/math.pi,noRight=True),False,False)
   transform(s,sub,.65,(-65 if i==0 else 255),20)
  s.text(167,320,'25＋144＝169',20,BLUE,'middle');s.text(478,320,'16＋25 ≠ 36',20,BROWN,'middle');s.text(167,357,'直角になる',19,BLUE,'middle');s.text(478,357,'直角ではない',19,BROWN,'middle')
 elif k=='rectangle':
  a,b=f['a'],f['b'];cv,_=s.fit([(0,0),(a,b)],(195,80,245,230));A,B,C,D=map(cv,[(0,0),(a,0),(a,b),(0,b)]);s.poly([A,B,C,D],fill=WHITE);s.line(A,C,BLUE,2,'5 3');s.right(A,B,C);s.mid(A,B,fmt(a) if answer and 'x' in f['al'] else f['al'],(0,29));s.mid(A,D,fmt(b) if answer and f['bl']=='x' else f['bl'],(-33,7));s.mid(A,C,f.get('sol',f['cl']) if shown else f['cl'],(-22,-22),BLUE)
  if guide:
   s.line(A,D,BROWN,2);s.text(20,253,'短い辺を',18,BROWN);s.text(20,281,'x と置く',18,BROWN);s.arrow((142,251),(A[0]-5,A[1]-42),BROWN);s.text(320,375,'x²＋(x＋1)²＝5²',23,INK,'middle')
 elif k in ['isosceles','special']:
  if k=='special':
   transform(s,scene(dict(kind='rectangle',a=1,b=1,al='1',bl='1',cl='√2'),True),.60,-50,25)
   transform(s,scene(dict(kind='isosceles',side=2,base=2,ratio=True),True),.68,250,0)
   s.text(145,338,'45°・45°・90°',18,BLUE,'middle');s.text(468,338,'30°・60°・90°',18,BROWN,'middle');s.text(145,375,'1：1：√2',22,BLUE,'middle');s.text(468,375,'1：√3：2',22,BROWN,'middle')
  else:
   a,b=f['side'],f['base'];h=math.sqrt(a*a-b*b/4);cv,_=s.fit([(-b/2,0),(b/2,0),(0,h)],(185,65,275,235));A,B,C,H=map(cv,[(0,h),(-b/2,0),(b/2,0),(0,0)]);s.poly([A,B,C],fill=PALE_GREEN);s.mid(A,B,fmt(a),(-20,-4));s.mid(A,C,fmt(a),(20,-4));s.mid(B,C,fmt(b),(0,30));
   if shown:
    s.line(A,H,BLUE,2,'5 3');s.right(A,H,C);s.mid(B,H,fmt(b/2),(0,-10),BROWN);label='√3' if f.get('ratio') else '3√3' if a==b==6 else fmt(h);s.mid(A,H,label,(27,5),BLUE)
   if guide:s.text(30,35,'ここから高さを下ろす',19,BLUE);s.arrow((238,42),A);s.text(30,367,'底辺も半分に',18,BROWN);s.arrow((167,344),((B[0]+H[0])/2,H[1]+5))
 elif k in ['diameter','chord','tangent']:
  circle_scene(s,f,shown,guide)
 elif k=='circle-pair':
  transform(s,scene(dict(kind='chord',r=5,half=4,mode='height'),True),.64,-45,15)
  transform(s,scene(dict(kind='tangent',r=5,t=12),True),.73,238,8)
  s.text(157,335,'弦の半分を使う',20,BLUE,'middle');s.text(466,335,'半径と接線は垂直',20,BROWN,'middle');s.text(157,372,'OH²＋4²＝5²',20,INK,'middle');s.text(466,372,'PA²＋5²＝13²',20,INK,'middle')
 elif k=='coords':
  A=f['a'];B=f['b'];par=f.get('parabola');xmin,xmax,ymin,ymax=(-3,5,0,10) if not par else (-3,3,-1,4);sc=min(300/(xmax-xmin),255/(ymax-ymin));cv=lambda p:(310+(p[0]-(xmin+xmax)/2)*sc,187- (p[1]-(ymin+ymax)/2)*sc)
  for x in range(xmin,xmax+1):s.line(cv((x,ymin)),cv((x,ymax)),LIGHT,.7)
  for y in range(ymin,ymax+1):s.line(cv((xmin,y)),cv((xmax,y)),LIGHT,.7)
  s.line(cv((xmin,0)),cv((xmax,0)),GRAY,1.4);s.line(cv((0,ymin)),cv((0,ymax)),GRAY,1.4)
  s.tag(cv((xmax,0)),'x',12,6);s.tag(cv((0,ymax)),'y',6,-10);s.tag(cv((0,0)),'O',-22,22)
  for x in range(xmin,xmax+1):
   if x!=0 and (par or x%2==0):s.text(cv((x,0))[0],cv((x,0))[1]+17,str(x),12,GRAY,'middle')
  for y in range(ymin,ymax+1):
   if y!=0 and (par or y%2==0):s.text(cv((0,y))[0]-10,cv((0,y))[1]+4,str(y),12,GRAY,'end')
  if par:s.path([cv((x/20,x*x/800)) for x in range(-54,55)],BROWN,2);s.text(445,110,'y＝x²/2',17,BROWN)
  if shown:
   H=(B[0],A[1]);s.line(cv(A),cv(H),BLUE,2,'5 3');s.line(cv(H),cv(B),BROWN,2,'5 3');s.right(cv(A),cv(H),cv(B));s.mid(cv(A),cv(H),fmt(B[0]-A[0]),(0,-9),BLUE);s.mid(cv(H),cv(B),fmt(B[1]-A[1]),(20,5),BROWN)
  s.line(cv(A),cv(B),INK,2);s.tag(cv(A),'O' if par else 'A',-25,-12) if not par else None;s.tag(cv(B),'A' if par else 'B',10,-8)
  if guide:s.text(20,30,'横6、縦8を使える',19);s.text(320,375,'斜め²＝横²＋縦²',23,INK,'middle')
 elif k in ['similarity','scaled']:
  if k=='scaled':
   transform(s,scene(triangle_data(3,4)),.5,-10,55)
   right_data=dict(kind='triangle',a=6,b=8,al='6' if shown else '?',bl='8' if shown else '?',cl='10')
   transform(s,scene(right_data),1,150,0)
   s.text(153,355,'斜辺5',19,BLUE,'middle');s.text(475,355,'斜辺10 → 全辺2倍' if shown else '斜辺10に拡大',19,BROWN,'middle')
  else:
   cv,_=s.fit([(0,0),(0,3),(4,0)],(175,65,285,235));C,A,B,H=map(cv,[(0,0),(0,3),(4,0),(1.44,1.92)]);s.poly([A,B,C],fill=WHITE);s.right(A,C,B);s.line(C,H,BLUE,2,'5 3');s.right(C,H,A)
   for p,t,dx,dy in [(A,'A',-22,-8),(B,'B',15,12),(C,'C',-22,20),(H,'H',11,-12)]:s.tag(p,t,dx,dy)
   s.mid(C,B,'a',(0,30),BLUE);s.mid(C,A,'b',(-28,5),BROWN);s.mid(A,H,'p',(-2,-13),BROWN);s.mid(H,B,'q',(11,-8),BLUE)
   # c is the full sloping side, shown on a parallel dimension line.
   v=(B[0]-A[0],B[1]-A[1]);n=math.hypot(*v);off=(v[1]/n*42,-v[0]/n*42);AA=(A[0]+off[0],A[1]+off[1]);BB=(B[0]+off[0],B[1]+off[1]);s.line(AA,BB,GRAY,1,'4 3');s.mid(AA,BB,'c',(8,-6))
   if guide:s.text(301,248,'斜辺へ',18,BLUE);s.text(301,276,'高さを下ろす',18,BLUE);s.arrow((290,244),((C[0]+H[0])/2+5,(C[1]+H[1])/2));s.text(320,375,'p＋q＝c。部分を足すと全体。',20,INK,'middle')
 elif k=='box':box_scene(s,f,shown,guide)
 elif k=='cone':
  r=f['r'];h=math.sqrt(f['s']**2-r*r);sc=48;O=(315,294);V=(315,294-h*sc);A=(315+r*sc,294);B=(315-r*sc,294)
  s.poly([V,A,B],GRAY,WHITE);s.path([(315+r*sc*math.cos(i*math.pi/36),294+23*math.sin(i*math.pi/36)) for i in range(73)],LIGHT,1)
  if shown:s.poly([V,O,A],BLUE,PALE_BLUE);s.line(V,O,BLUE,2,'5 3');s.right(V,O,A);s.mid(V,O,fmt(h),(-23,5),BLUE)
  s.line(O,A,BROWN,2);s.mid(O,A,fmt(r),(0,29),BROWN);s.mid(V,A,fmt(f['s']),(25,-4));s.tag(O,'O',-23,20);s.tag(V,'V',-5,-14);s.tag(A,'A',13,6)
  if guide:s.text(25,35,'軸を通る断面の半分',19,BLUE);s.arrow((228,45),(343,210));s.text(320,375,'半径²＋高さ²＝母線²',22,INK,'middle')
 elif k=='nets':
  specs=[(3,2,4),(3,4,2),(4,2,3)];sc=22
  for i,(u,v,h) in enumerate(specs):
   x=28+i*209;y=130;w=(u+v)*sc;hh=h*sc;s.poly([(x,y),(x+w,y),(x+w,y+hh),(x,y+hh)],INK,PALE_BLUE);s.poly([(x+u*sc,y),(x+w,y),(x+w,y+hh),(x+u*sc,y+hh)],INK,PALE_BROWN);s.line((x+u*sc,y),(x+u*sc,y+hh),GRAY,1,'4 3');s.line((x,y+hh),(x+w,y),INK,2)
   s.text(x+w/2,90,['①','②','③'][i],22,INK,'middle');s.text(x+u*sc/2,y-12,str(u),19,BLUE,'middle');s.text(x+(u+v/2)*sc,y-12,str(v),19,BROWN,'middle');s.text(x+w+8,y+hh/2+6,str(h),19);s.text(x+w/2,278,['√41','√53','3√5'][i] if shown else '?',22,INK,'middle')
  if guide:s.text(320,351,'表面を開く → 平面の直線で比べる',20,INK,'middle')
 elif k=='recap':
  # Three actual miniature constructions, not topic names alone.
  s.text(30,35,'平方根',20,BLUE);s.poly([(55,65),(135,65),(135,145),(55,145)],BLUE,PALE_BLUE);s.text(95,110,'面積13',17,BLUE,'middle');s.text(165,97,'辺の長さは√13',22);s.arrow((153,130),(135,130));s.line((30,174),(610,174),LIGHT)
  s.text(30,212,'円 → 三平方',20,BLUE);s.circle((100,282),48);A=(52,282);B=(148,282);P=(86.56,235.92);s.poly([A,P,B],INK,PALE_GREEN);s.right(A,P,B,8);s.text(62,257,'6',17,BLUE,'middle');s.text(130,251,'x',17,BROWN,'middle');s.text(100,307,'10',17,INK,'middle');s.text(188,270,'直径から直角を見つける',20);s.text(188,305,'6²＋x²＝10² → x＝8',22);s.line((30,340),(610,340),LIGHT);s.text(320,380,'分かる条件を集めて、使える三角形へ。',20,INK,'middle')
 else:raise ValueError(k)
 return s.out

def triangle_data(a,b):return dict(kind='triangle',a=a,b=b,al=str(a),bl=str(b),cl=fmt(math.hypot(a,b)))
def transform(s,primitives,k,dx,dy):
 for t in primitives:
  if t[0]=='text':_,x,y,text,size,c,anchor=t;s.text(x*k+dx,y*k+dy,text,max(size*k,16),c,anchor)
  else:
   kind,pts,c,w,dash,fill=t;s.out.append((kind,[(x*k+dx,y*k+dy) for x,y in pts],c,w*k,dash,fill))

def circle_scene(s,f,shown,guide):
 k=f['kind']
 if k=='diameter':
  cv=lambda p:(315+23*p[0],225-23*p[1]);O=cv((0,0));A=cv((-5,0));B=cv((5,0));P=cv((-1.4,4.8));s.circle(O,115);s.poly([A,P,B],GRAY,None);s.line(A,B,INK,2);s.mid(A,B,'10',(0,26));s.mid(A,P,'6',(-23,-3),BLUE);s.mid(B,P,'8' if shown else '?',(24,0),BROWN);s.tag(A,'A',-24,9);s.tag(B,'B',14,9);s.tag(P,'P',-9,-15);s.tag(O,'O',-5,-12)
  if shown:s.right(A,P,B)
  if guide:s.text(24,35,'直径に対する円周角',19,BLUE);s.arrow((235,45),P);s.text(320,379,'直角が見つかった。斜辺はAB。',20,INK,'middle')
 elif k=='chord':
  r=f['r'];half=f['half'];h=math.sqrt(r*r-half*half);sc=117/r;cv=lambda p:(315+p[0]*sc,190-p[1]*sc);O=cv((0,0));A=cv((-half,-h));B=cv((half,-h));H=cv((0,-h));s.circle(O,117);s.line(A,B,INK,2);s.line(O,A,BROWN,2);s.tag(O,'O',-8,-14);s.tag(A,'A',-24,12);s.tag(B,'B',14,12);s.mid(O,A,fmt(r),(-26,-5),BROWN)
  if not f.get('hideAltitude') or shown:
   s.line(O,H,BLUE,2,'5 3');s.right(O,H,B);s.tag(H,'H',-6,26)
   hh=fmt(h) if shown or f['mode']=='chord' else '?';s.mid(O,H,hh,(24,3),BLUE)
  if shown:s.mid(A,H,'√21' if abs(half*half-21)<1e-8 else fmt(half),(0,26),BROWN)
  else:s.mid(A,B,fmt(2*half) if f['mode']=='height' else 'AB＝?',(0,50))
  if guide:s.text(35,35,'弦を半分に分ける垂線',19,BLUE);s.arrow((268,43),H);s.text(320,375,'半径が斜辺になる',20,INK,'middle')
 else:
  r,t=f['r'],f['t'];cv,sc=s.fit([(-r,-r),(r,max(r,t))],(220,50,235,270));O=cv((0,0));A=cv((r,0));P=cv((r,t));s.circle(O,r*sc);s.line(O,A,BROWN,2);s.line(O,P,INK,2);s.line(P,(A[0],A[1]+22),BLUE,2);s.tag(O,'O',-8,22);s.tag(A,'A',11,14);s.tag(P,'P',-5,-14);s.mid(O,A,fmt(r),(0,23),BROWN);s.mid(O,P,fmt(math.hypot(r,t)),(-22,-4));s.mid(A,P,fmt(t) if shown else '?',(27,5),BLUE)
  if shown:s.right(O,A,P)
  if guide:s.text(20,35,'半径と接線は垂直',19,BLUE);s.arrow((219,43),A)

def box_scene(s,f,shown,guide):
 a,b,h=f['a'],f['b'],f['h'];proj=lambda p:(p[0]+.55*p[1],p[2]+.32*p[1]);verts=[(0,0,0),(a,0,0),(a,b,0),(0,b,0),(0,0,h),(a,0,h),(a,b,h),(0,b,h)];raw=list(map(proj,verts));cv,sc=s.fit(raw,(40,68,210,242) if shown else (190,60,260,260));p=list(map(cv,raw));A,B,C,D,E,F,G,H=p
 # Paint the two sections first; the wireframe in front must remain visible.
 if shown:
  s.poly([A,C,G],BLUE,PALE_BLUE,w=1);s.poly([A,B,C],BROWN,PALE_BROWN,w=1)
 edges=[(0,1),(1,2),(2,3),(3,0),(4,5),(5,6),(6,7),(7,4),(0,4),(1,5),(2,6),(3,7)]
 for i,j in edges:s.line(p[i],p[j],GRAY,1.5,'4 3' if (i,j) in [(2,3),(3,0),(3,7)] else '')
 if shown:
  s.line(A,B,BROWN,2);s.line(B,C,BROWN,2);s.line(A,C,BLUE,2.6);s.line(C,G,INK,2);s.line(A,G,INK,2)
 else:s.line(A,G,INK,2,'6 3')
 # A thin white underlay distinguishes the front edge where it crosses AG.
 s.line(B,F,WHITE,4.2);s.line(B,F,GRAY,1.6)
 s.mid(A,B,fmt(a),(0,28),BROWN if shown else INK);s.mid(B,C,fmt(b),(27,27),BROWN if shown else INK);s.mid(C,G,fmt(h),(26,5));s.tag(A,'A',-22,12);s.tag(C,'C',13,6);s.tag(G,'G',10,-14)
 if shown:
  s.tag(B,'B',-4,15);d=math.hypot(a,b);diag=math.hypot(d,h)
  dl=fmt(d) if abs(d-round(d))<1e-9 else '2√2';ll=fmt(diag) if abs(diag-round(diag))<1e-9 else '2√3'
  # A common scale is used for BOTH extracted triangles, separate from projection.
  unit=min(38,185/max(h,b),88/max(a,d));u=a*unit;v=b*unit
  P,Q,T=(318,216),(318+u,216),(318+u,216-v)
  s.text(305,59,'① 底面 ABC',19,BROWN);s.poly([P,Q,T],BROWN,PALE_BROWN);s.line(P,T,BLUE,2.6);s.right(P,Q,T,9)
  s.mid(P,Q,fmt(a),(0,27),BROWN);s.mid(Q,T,fmt(b),(25,5),BROWN);s.mid(P,T,dl,(-25,-8),BLUE)
  for pt,label,dx,dy in [(P,'A',-19,3),(Q,'B',10,21),(T,'C',7,-10)]:s.tag(pt,label,dx,dy)
  u=d*unit;v=h*unit;P,Q,T=(458,344),(458+u,344),(458+u,344-v)
  s.text(442,114,'② 断面 ACG',19,BLUE);s.poly([P,Q,T],INK,PALE_BLUE);s.line(P,Q,BLUE,2.6);s.right(P,Q,T,9)
  s.mid(P,Q,dl,(0,29),BLUE);s.mid(Q,T,fmt(h),(26,5));s.mid(P,T,ll,(-24,-8))
  for pt,label,dx,dy in [(P,'A',-20,7),(Q,'C',11,17),(T,'G',10,-11)]:s.tag(pt,label,dx,dy)
  if guide:s.text(142,370,'箱の見取り図',16,GRAY,'middle')
  s.text(299,280,'共通の辺 AC',18,BLUE);s.text(299,311,'①の斜辺が',17,BLUE);s.text(299,338,'②の底辺に',17,BLUE)
 else:s.text(320,378,'見取り図。長さは数値を使う。',17,GRAY,'middle')

def svg(primitives,title='三平方の図'):
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="{html.escape(title)}">']
 for t in primitives:
  if t[0]=='text':
   _,x,y,txt,size,c,anchor=t;parts.append(f'<text x="{x:.3f}" y="{y:.3f}" fill="{c}" font-size="{size}" text-anchor="{anchor}" font-family="sans-serif">{html.escape(txt)}</text>')
  else:
   kind,pts,c,w,dash,fill=t;tag='polygon' if kind=='polygon' else 'polyline';points=' '.join(f'{x:.3f},{y:.3f}' for x,y in pts);parts.append(f'<{tag} points="{points}" fill="{fill or "none"}" stroke="{c}" stroke-width="{w:.3f}" stroke-dasharray="{dash}" stroke-linejoin="round"/>')
 return ''.join(parts)+'</svg>'
