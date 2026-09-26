"""Shared, accurately scaled vector scenes for the PDF and the static web lesson."""
import math
BLUE='#3566a0';BROWN='#98502f';GRAY='#61716b';INK='#253b39'
def scene(kind):
    out=[]
    def line(a,b,c=GRAY,w=2,dash=''):out.append(('segment',a,b,c,w,dash))
    def text(x,y,s,size=17,c=INK):out.append(('label',x,y,s,size,c))
    def poly(p,fill='#f3f5ef'):out.append(('polygon',p,fill,GRAY))
    def edge(a,b,n):line(a,b,[BLUE,BROWN,GRAY][n],[3,3,2.5][n],['','8 5','2 5'][n])
    def names(p,ns):
        cx=sum(x for x,y in p)/len(p);cy=sum(y for x,y in p)/len(p)
        for (x,y),n in zip(p,ns):text(x+(9 if x>=cx else -21),y+(23 if y>=cy else -10),n)
    def triangle(p,ns,edges=False):
        poly(p);names(p,ns)
        if edges:
            for i in range(3):edge(p[i],p[(i+1)%3],i)
    def arc(v,a,b,n=1,c=BLUE,r=20):
        aa=math.atan2(a[1]-v[1],a[0]-v[0]);bb=math.atan2(b[1]-v[1],b[0]-v[0]);d=(bb-aa+math.pi)%(2*math.pi)-math.pi
        for j in range(n):
            pts=[(v[0]+(r+5*j)*math.cos(aa+d*i/20),v[1]+(r+5*j)*math.sin(aa+d*i/20)) for i in range(21)]
            for a,b in zip(pts,pts[1:]):line(a,b,c,2)
    def nested(t=.6):
        a=(220,36);b=(75,211);c=(445,211);d=tuple(a[i]+t*(b[i]-a[i]) for i in (0,1));e=tuple(a[i]+t*(c[i]-a[i]) for i in (0,1))
        triangle([a,b,c],'ABC');poly([a,d,e],'#edf3f9');text(d[0]-26,d[1],'D');text(e[0]+12,e[1],'E');return a,b,c,d,e
    if kind in ('rectangles','coordinate-stretch'):
        configs=[(40,65,65,'もと'),(205,130,130,'縦横2倍'),(390,130,65,'横だけ2倍' if kind=='rectangles' else 'yだけ2倍')]
        for i,(x,w,h,cap) in enumerate(configs):
            if kind=='coordinate-stretch' and i==2:w,h=65,130
            poly([(x,205),(x+w,205),(x+w,205-h),(x,205-h)]);edge((x,205),(x+w,205),0);edge((x,205),(x,205-h),1);text(x,248,cap,17)
            text(x+w/2-12,226,'1' if i==0 or (kind=='coordinate-stretch' and i==2) else '2',15,BLUE);text(x-20,205-h/2,'2' if i==1 or (kind=='coordinate-stretch' and i==2) else '1',15,BROWN)
    elif kind in ('edge-pairs','ratio-pairs'):
        p=[(50,85),(50,189),(206,189)];q=[(296,45),(296,201),(530,201)];triangle(p,'ABC',True);triangle(q,'DEF',True)
        # Right is a uniform 1.5 enlargement, same correspondence despite translation.
        if kind=='ratio-pairs':text(10,140,'4',20,BLUE);text(252,135,'6',20,BLUE);text(110,247,'6',20,BROWN);text(405,248,'9',20,BROWN)
        else:text(98,260,'小さい図',16);text(360,265,'大きい図',16)
    elif kind=='three-tests':
        for j in range(3):
            x=25+j*183;p=[(x+58,55),(x,195),(x+135,195)];poly(p)
            if j==0:
                for i in range(3):edge(p[i],p[(i+1)%3],i)
            elif j==1:edge(p[0],p[1],0);edge(p[0],p[2],1);arc(p[0],p[1],p[2],r=31)
            else:arc(p[1],p[0],p[2],r=29);arc(p[2],p[0],p[1],2,BROWN,r=29)
            text(x+6,239,['① 3辺','② 2辺と間の角','③ 2つの角'][j],16)
    elif kind=='hinge':
        for x,ang in [(45,60),(320,90)]:
            a=(x,210);b=(x+120,210);c=(x+90*math.cos(math.radians(ang)),210-90*math.sin(math.radians(ang)))
            poly([a,b,c]);edge(a,b,0);edge(a,c,1);arc(a,b,c,r=26);text(x+45,238,'4',18,BLUE);text(x-22,164,'3',18,BROWN);text(x+25,265,f'間の角 {ang}°',17)
    elif kind in ('parallel-angles','proof-path','midpoint','trapezoid'):
        a,b,c,d,e=nested(.5 if kind=='midpoint' else 2/3 if kind=='trapezoid' else .6)
        if kind in ('parallel-angles','proof-path'):
            arc(d,a,e);arc(b,a,c)
            if kind=='parallel-angles':arc(e,a,d,2,BROWN);arc(c,a,b,2,BROWN)
            else:arc(a,b,c,2,BROWN,r=28)
            # Matching chevrons mark the parallel edges.
            for p,q in [(d,e),(b,c)]:
                x=(p[0]+q[0])/2;y=p[1];line((x-5,y-5),(x+3,y),INK);line((x+3,y),(x-5,y+5),INK)
            text(145,268,'DE ∥ BC：同じ矢印が平行の印',16)
        elif kind=='midpoint':
            for p,q,n,col in [(a,d,1,BLUE),(d,b,1,BLUE),(a,e,2,BROWN),(e,c,2,BROWN)]:
                mx=(p[0]+q[0])/2;my=(p[1]+q[1])/2
                for i in range(n):line((mx-5+i*5,my-4),(mx+5+i*5,my+4),col,2)
            text(233,139,'DE',18);text(198,265,'DE = BC ÷ 2',19)
        else:text(180,128,'上：20',20,BLUE);text(219,193,'ほしい部分',18,BROWN);text(155,265,'全体45 − 上20 = 下25',20)
    elif kind=='part-whole':
        # First the geometry; then an adjacent straightened length strip, all proportional.
        a=(120,38);b=(30,198);c=(250,198);d=(66,134);e=(198,134)
        triangle([a,b,c],'ABC');line(d,e);text(42,128,'D');text(206,127,'E');edge(a,d,0);edge(d,b,1);text(68,72,'3',21,BLUE);text(20,163,'2',21,BROWN);text(113,232,'BC=10',18);text(127,124,'DE=?',17)
        x=340;y=45;edge((x,y),(x,y+96),0);edge((x,y+96),(x,y+160),1)
        text(x-25,y+5,'A');text(x-25,y+100,'D');text(x-25,y+165,'B');text(x+15,y+53,'AD=3',19,BLUE);text(x+15,y+141,'DB=2',19,BROWN)
        line((470,y),(470,y+160),GRAY,2,'2 5');line((458,y),(480,y));line((458,y+160),(480,y+160));text(382,245,'全体AB=3+2=5',18)
    elif kind=='cross-angles':
        a=(215,45);b=(65,45);o=(250,115);d=(302.5,220);c=(527.5,220)
        poly([a,o,b]);text(a[0]+8,a[1]-10,'A');text(b[0]-18,b[1]-10,'B');text(o[0]-25,o[1]+6,'O');poly([d,o,c]);text(d[0]-18,d[1]+24,'D');text(c[0]+10,c[1]+24,'C')
        arc(o,a,b,r=28);arc(o,d,c,r=28);arc(a,o,b,2,BROWN,r=23);arc(d,o,c,2,BROWN,r=23);text(190,265,'AB ∥ CD',18)
    elif kind in ('area-grid','root-grid'):
        counts=[1,2] if kind=='area-grid' else [3,4];u=53 if kind=='area-grid' else 39
        for x,n in zip([50,310],counts):
            y=220;poly([(x,y),(x+n*u,y),(x+n*u,y-n*u),(x,y-n*u)])
            for i in range(1,n):line((x+i*u,y),(x+i*u,y-n*u));line((x,y-i*u),(x+n*u,y-i*u))
            text(x,255,f'1辺{n} → {n*n}枚',19)
            edge((x,y),(x+n*u,y),0);edge((x,y),(x,y-n*u),1)
    elif kind=='volume-layers':
        # Top-down layer slices: exact square grids, explicitly not perspective cubes.
        for x in [70,315]:
            y=73;u=55;poly([(x,y),(x+2*u,y),(x+2*u,y+2*u),(x,y+2*u)])
            line((x+u,y),(x+u,y+2*u));line((x,y+u),(x+2*u,y+u));text(x,46,'下の段' if x==70 else '上の段',18);text(x+13,218,'2×2=4個',18)
        text(225,145,'＋',26);text(114,267,'上から見た並び：4個＋4個=8個',18)
    elif kind=='shadow-values':
        line((20,204),(520,204));
        for x,w,h,name in [(65,50,37.5,'棒'),(300,200,150,'木')]:
            a=(x,204);b=(x+w,204);c=(x,204-h);poly([a,b,c]);edge(a,c,0);edge(a,b,1);text(x-12,204-h-15,name,18);text(x-62,204-h/2,'1.5 m' if x==65 else '? m',17,BLUE);text(x+w/2-18,239,'2 m' if x==65 else '8 m',18,BROWN)
            line((x+8,204),(x+8,196));line((x,196),(x+8,196));arc(b,a,c,r=25)
        text(135,274,'影は 8÷2=4倍 → 高さも4倍',18)
    elif kind=='connections':
        for y,title,body in [(40,'平方根・方程式','面積2倍 → k²=2 → k=√2'),(125,'二次関数','xとy、どちらを何倍にした？'),(210,'これから','三平方の定理・高校の三角比へ')]:
            text(30,y,title,18,BLUE);text(45,y+31,body,21);line((30,y+46),(510,y+46),'#d8dfd6',1)
    else:raise ValueError(kind)
    return out
