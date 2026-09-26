"""Paper-first exercise layout. Diagrams show givens, never worked answers."""
import math
from reportlab.lib.colors import HexColor

INK='#253b39'; BLUE='#3566a0'; GRAY='#61716b'; LINE='#d8dfd6'


def exercise_figure(b,q,x,y):
    """230 × 142 pt figures; all labels >= 9 pt. Return whether drawn."""
    n=q['id'];c=b.c;H=841.89
    def text(px,py,s,size=10,color=INK):b.text(s,x+px,y+py,size,color)
    def line(a,z,col=GRAY,w=.9):
        c.setStrokeColor(HexColor(col));c.setLineWidth(w)
        c.line(x+a[0],H-y-a[1],x+z[0],H-y-z[1])
    def poly(pts,fill='#f5f8f7'):
        c.setFillColor(HexColor(fill));c.setStrokeColor(HexColor(GRAY));c.setLineWidth(.9)
        p=c.beginPath()
        for i,(a,z) in enumerate(pts):(p.moveTo if i==0 else p.lineTo)(x+a,H-y-z)
        p.close();c.drawPath(p,stroke=1,fill=1)
    def arrow(a,z):
        line(a,z,BLUE);ang=math.atan2(z[1]-a[1],z[0]-a[0])
        for d in [-.5,.5]:line(z,(z[0]-5*math.cos(ang+d),z[1]-5*math.sin(ang+d)),BLUE)
    def arc(cx,cy,r,a,z):
        pts=[(cx+r*math.cos(math.radians(a+(z-a)*i/24)),cy-r*math.sin(math.radians(a+(z-a)*i/24))) for i in range(25)]
        for u,v in zip(pts,pts[1:]):line(u,v)
    def chevron(px,py):line((px-3,py-3),(px+2,py));line((px+2,py),(px-3,py+3))
    if n in (13,14,15,16,17,27,30):
        t={13:.6,14:.4,15:.5,16:.4,17:.6,27:2/3,30:.4}[n]
        A=(92,15);B=(32,123);C=(210,123)
        if n==13:A=(60,123-math.sqrt(89**2-28**2))
        if n==30:A=(92,123-math.sqrt((178/1.5)**2-60**2))
        D=tuple(A[i]+t*(B[i]-A[i]) for i in (0,1));E=tuple(A[i]+t*(C[i]-A[i]) for i in (0,1))
        poly([A,B,C]);line(D,E)
        for p,s,dx,dy in [(A,'A',-4,-16),(B,'B',-13,-1),(C,'C',5,-1),(D,'D',-16,-7),(E,'E',7,-6)]:text(p[0]+dx,p[1]+dy,s)
        if n!=15:
            chevron((D[0]+E[0])/2,D[1]);chevron(124,123)
            text(144,0,'DE ∥ BC',9,GRAY)
        if n in (13,30):
            a,z,base=(3,2,10) if n==13 else (4,6,15)
            text((A[0]+D[0])/2-31,(A[1]+D[1])/2-7,f'{a} cm')
            text((D[0]+B[0])/2-32,(D[1]+B[1])/2-6,f'{z} cm')
            text(105,127,f'{base} cm')
        if n==13:text(72,D[1]-18,'DE = ?',10,BLUE)
        if n in (14,16):
            text(1,0,'AD：DB = 2：3',9)
            if n==14:text(161,62,'AC = 15 cm',9)
        if n==15:
            for p,r in [(A,D),(D,B),(A,E),(E,C)]:
                mx=(p[0]+r[0])/2;my=(p[1]+r[1])/2
                line((mx-3,my-2),(mx+3,my+2))
                if p in (A,E) and r in (E,C):line((mx-1,my-5),(mx+5,my-1))
            text(102,127,'14 cm')
        if n==27:
            text(0,0,'AD：AB = 2：3',9)
            text(107,99,'求める台形',9,BLUE);arrow((101,110),(82,113))
            text(116,24,'全体：45 cm²',9)
        return True
    if n in (1,2,23):
        if n==23:
            sides=[48,48*math.sqrt(2)];names=['もと','面積2倍'];bottom=['1辺：1','1辺：? 倍']
        else:
            sides=[30,90] if n==1 else [54,108];names=['もと','縦横3倍' if n==1 else '比べる形'];bottom=['横 3 cm','横 ? cm' if n==1 else '横 6 cm']
        for i,xx in enumerate([25,126]):
            w=sides[i];h=w if n==23 else (w*2/3 if n==1 else 36)
            poly([(xx,100),(xx+w,100),(xx+w,100-h),(xx,100-h)])
            text(xx,6,names[i],10,BLUE if i else INK);text(xx-3,108,bottom[i],9)
            if n!=23:text(xx-20,72,'2 cm' if i==0 or n==2 else '? cm',9)
        return True
    if n==25:
        line((9,118),(226,118))
        for xx,w,h,name,height,shadow in [(25,30,22.5,'棒','1.5 m','2 m'),(100,120,90,'木','? m','8 m')]:
            poly([(xx,116),(xx+w,116),(xx,116-h)])
            line((xx,116),(xx,116-h),INK,1.6)
            text(xx-8,116-h-20,name);text(xx-29,116-h/2-5,height,9)
            text(xx+w/2-10,123,shadow,9)
        return True
    if n in (18,19):
        A=(60,20);B=(10,20);O=(84,52);D=(120,100);C=(195,100)
        poly([A,O,B]);poly([D,O,C])
        for p,s,dx,dy in [(A,'A',-2,-17),(B,'B',-12,-15),(O,'O',2,-15),(D,'D',-12,2),(C,'C',4,-3)]:text(p[0]+dx,p[1]+dy,s)
        chevron(35,20);chevron(158,100);text(127,2,'AB ∥ CD',9,GRAY)
        if n==19:text(76,24,'4 cm',9);text(113,69,'6 cm',9);text(18,2,'5 cm',9)
        return True
    if n==28:
        # Equal x/y units, original coordinates only; no transformed answers.
        ox,oy,u=102,118,23
        for k in range(-2,4):line((ox+k*u,oy+u),(ox+k*u,oy-5*u),LINE,.4)
        for k in range(-1,6):line((ox-2*u,oy-k*u),(ox+3*u,oy-k*u),LINE,.4)
        line((ox-2*u,oy),(ox+3*u,oy),GRAY);line((ox,oy+u),(ox,oy-5*u),GRAY)
        poly([(ox,oy),(ox-u,oy-u),(ox+2*u,oy-4*u)])
        text(ox-14,oy+1,'O',9);text(ox-u-44,oy-u-15,'A(−1,1)',9);text(ox+2*u+5,oy-4*u-10,'B(2,4)',9)
        text(ox+3*u+4,oy,'x',9);text(ox+4,oy-5*u-4,'y',9)
        text(ox+u-3,oy+3,'1',9);text(ox+4,oy-u-5,'1',9)
        return True
    if n in (6,29):
        for i,xx in enumerate([23,150]):
            ratio=(2/3 if n==6 else .6)
            w,h=(72,48) if i==0 else (72*ratio,48*ratio)
            A=(xx,110);B=(xx,110-h);C=(xx+w,110-h)
            poly([A,B,C])
            for p,s,dx,dy in [(A,'A' if i==0 else 'P',-4,3),(B,'B' if i==0 else 'Q',-5,-17),(C,'C' if i==0 else 'R',4,-5)]:text(p[0]+dx,p[1]+dy,s)
            vals=([('6 cm','9 cm'),('4 cm','? cm')] if n==6 else [('10 cm','? cm'),('6 cm','9 cm')])[i]
            text(xx-24,110-h/2-4,vals[0],9);text(xx+12,110-h-18,vals[1],9)
        return True
    if n in (9,10,11):
        for i,xx in enumerate([24,145]):
            if n==9:
                # A-B = 8, A-C = 6, B-C = 4; all three ratios are faithful.
                u=6.5 if i==0 else 9.75
                pts=[(xx,107),(xx+8*u,107),(xx+5.25*u,107-math.sqrt(36-5.25**2)*u)]
                poly(pts)
                for px,py,t in [(xx+24,114,'8' if i==0 else '12'),(xx+2,73,'6' if i==0 else '9'),(xx+57,78,'4' if i==0 else '6')]:text(px,py,t+' cm',9)
            elif n==10:
                u=9 if i==0 else 13.5
                A=(xx,110);B=(xx+4*u,110);C=(xx+6*u*math.cos(math.radians(50)),110-6*u*math.sin(math.radians(50)))
                poly([A,B,C])
                for p,t,dx,dy in [(A,'A' if i==0 else 'D',-13,-3),(B,'B' if i==0 else 'E',4,-3),(C,'C' if i==0 else 'F',0,-18)]:text(p[0]+dx,p[1]+dy,t)
                text(xx+14,115,'4' if i==0 else '6',9);text(xx+1,73,'6' if i==0 else '9',9);text(xx+15,94,'50°',9);arc(xx,110,12,0,50)
            else:
                u=67;h=u*math.sin(math.radians(70))/math.sin(math.radians(65))/math.sqrt(2)
                A=(xx,112);B=(xx+u,112);C=(xx+h,112-h)
                poly([A,B,C])
                for p,t,dx,dy in [(A,'A' if i==0 else 'D',-13,-3),(B,'B' if i==0 else 'E',5,-3),(C,'C' if i==0 else 'F',-4,-19)]:text(p[0]+dx,p[1]+dy,t)
                text(xx+9,96,'45°',9);arc(xx,112,11,0,45)
                if i==0:text(xx+43,96,'70°',9);arc(xx+u,112,11,110,180)
                else:text(C[0]-10,C[1]+14,'65°',9);arc(C[0],C[1],11,225,290)
        return True
    if n in (21,22,31):
        for i,xx in enumerate([19,143]):
            small,large={21:(52,78),22:(54,72),31:(30,75)}[n]
            w=small if i==0 else large;h=w*.75
            poly([(xx,110),(xx+w,110),(xx+w*.35,110-h)])
            text(xx+17,18,'小' if i==0 else '大',10)
            if n==21:text(xx-4,43,'20 cm²' if i==0 else '? cm²',9);arrow((xx+12,58),(xx+w*.4,99))
            elif n==22:text(xx+6,117,'? cm' if i==0 else '20 cm',9)
            else:text(xx+6,117,'6 cm' if i==0 else '? cm',9)
        text(11,0,('辺の比 2：3' if n==21 else '面積比 9：16' if n==22 else '面積比 4：25'),9,BLUE)
        return True
    if n==5:
        base=[(0,0),(4,0),(4*math.sin(math.radians(60))/math.sin(math.radians(80))*math.cos(math.radians(40)),4*math.sin(math.radians(60))/math.sin(math.radians(80))*math.sin(math.radians(40)))]
        for i in (0,1):
            a=0 if i==0 else math.radians(155);scale=21
            pts=[((14 if i==0 else 222)+scale*(px*math.cos(a)-py*math.sin(a)),(95 if i==0 else 45)-scale*(px*math.sin(a)+py*math.cos(a))) for px,py in base]
            poly(pts)
            cx=sum(p[0] for p in pts)/3;cy=sum(p[1] for p in pts)/3
            for p,s in zip(pts,'ABC' if i==0 else 'DEF'):text(p[0]+(4 if p[0]>cx else -12),p[1]+(3 if p[1]>cy else -17),s)
        return True
    return False


def exercise(b,q,start,end):
    n=q['id'];c=b.c;H=841.89
    b.text(f'問 {n:02d}',44,start,12,BLUE)
    b.text('条件を整理 → 自分の式・理由を書く',102,start+2,8.5,GRAY)
    b.y=start+25
    # Preserve question content, splitting sentence boundaries without rewriting it.
    import re
    for s in re.split(r'(?<=[。？])|(?=[①②③])',q['prompt']):
        if not s.strip():continue
        b.para(s,10.5,leading=16.5);b.y-=4
    top=b.y+5
    has=exercise_figure(b,q,44,top)
    if has:
        b.text('途中式・理由',300,top,8.5,GRAY)
        c.setStrokeColor(HexColor(LINE));c.setLineWidth(.5)
        c.line(285,H-top,285,H-(end-39))
        # Large blank area, rather than ruled lines crossing a drawing.
        assert top+142<end-32,(n,top,end)
    else:
        b.text('図・途中式・理由',44,top+3,8.5,GRAY)
        assert top+65<end-32,(n,top,end)
    b.text('答え：',300 if has else 44,end-37,10)
    c.setStrokeColor(HexColor(LINE));c.setLineWidth(.5)
    c.line(44,H-(end-13),551,H-(end-13))
    b.text('□ 自力でできた    □ ヒントでできた    □ もう一度',44,end-6,8,GRAY)
    b.y=end+7
