"""Visual worked answers: the same question numbering and source explanations."""
import math,re
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.colors import HexColor
from similarity_workbook import exercise_figure
INK='#253b39';BLUE='#3566a0';BROWN='#98502f';GRAY='#61716b';LINE='#d8dfd6'
CAPTIONS={1:'縦も横も3倍。角はそのまま。',2:'縦は1倍、横は2倍。そろわない。',5:'角を手がかりに、A↔D、B↔E、C↔F。',6:'AB → PQ と同じ倍率で、BC → QR。',9:'短い辺から、3組すべてを比べる。',10:'比べた2辺が作る「間の角」。',11:'残りの角Eを求めると、70°。',13:'AD：AB = 3：5。比べる相手は全体。',14:'AE：AC = 2：5。残りがEC。',15:'左右とも中点 → 平行で長さは半分。',16:'AD：DB と AD：AB は別の比。',17:'共通の角と、平行線の同位角。',18:'Oの対頂角と、平行線の錯角。',19:'AO → OD と同じ倍率で、AB → DC。',21:'底辺も高さも3/2倍 → 面積は9/4倍。',22:'面積比9：16 → 辺の比3：4。',23:'面積は k × k。だから k² = 2。',25:'影が4倍なら、高さも4倍。',27:'全体45 − 上の三角形20 = 台形25。',28:'OCが2倍。横の距離は変わらない。',29:'PQ → AB と同じ倍率で、QR → BC。',30:'AB = 4 + 6 = 10。AD：AB = 4：10。',31:'面積比4：25 → 辺の比2：5。'}


def answer_figure(b,q,x,y):
    n=q['id'];c=b.c;H=841.89
    def text(a,z,s,size=10,col=INK):b.text(s,x+a,y+z,size,col)
    def line(a,z,col=BLUE,w=1.5,dash=False):
        c.setStrokeColor(HexColor(col));c.setLineWidth(w);c.setDash([3,2] if dash else [])
        c.line(x+a[0],H-y-a[1],x+z[0],H-y-z[1]);c.setDash([])
    def arrow(a,z,col=BLUE):
        line(a,z,col,.8);ang=math.atan2(z[1]-a[1],z[0]-a[0])
        for d in (-.5,.5):line(z,(z[0]-4*math.cos(ang+d),z[1]-4*math.sin(ang+d)),col,.8)
    def arc(o,a,z,r,col=BLUE):
        aa=math.atan2(a[1]-o[1],a[0]-o[0]);zz=math.atan2(z[1]-o[1],z[0]-o[0]);delta=(zz-aa+math.pi)%(2*math.pi)-math.pi
        pts=[(o[0]+r*math.cos(aa+delta*i/24),o[1]+r*math.sin(aa+delta*i/24)) for i in range(25)]
        for a,z in zip(pts,pts[1:]):line(a,z,col,1)
    def rows(items):
        for i,(left,right) in enumerate(items):
            yy=12+i*40;text(6,yy,left,11,BLUE);arrow((96,yy+9),(119,yy+9));text(134,yy,right,11)
    # Replace only the unknown labels; the question PDF stays unchanged.
    substitutions={1:{'横 ? cm':'横 9 cm','? cm':'6 cm'},6:{'? cm':'6 cm'},13:{'DE = ?':'DE = 6'},21:{'? cm²':'45 cm²'},22:{'? cm':'15 cm'},23:{'1辺：? 倍':'1辺：√2倍'},25:{'? m':'6 m'},29:{'? cm':'15 cm'},31:{'? cm':'15 cm'}}
    class Labels:
        def __init__(self):self.c=b.c
        def text(self,s,xx,yy,size=10.5,color=INK):
            changed=s in substitutions.get(n,{})
            b.text(substitutions.get(n,{}).get(s,s),xx,yy,size,BLUE if changed else color)
    if n==28:
        for i,ox in enumerate((42,159)):
            u=13;oy=119;factor=1 if i==0 else 2
            O=(ox,oy);A=(ox-u,oy-u*factor);B=(ox+2*u,oy-4*u*factor);C=(ox,oy-2*u*factor)
            for a,z in [(O,A),(A,B),(B,O)]:line(a,z,GRAY,.9)
            line((ox,oy+4),(ox,8),GRAY,.5);line((ox-20,oy),(ox+36,oy),GRAY,.5)
            line(O,C,BLUE,2.2)
            line(A,(ox,A[1]),BROWN,1,True);line(B,(ox,B[1]),BROWN,1,True)
            for p,s,dx,dy in [(O,'O',-13,0),(A,'A',-12,-8),(B,'B',4,-8),(C,'C',-12,-8)]:text(p[0]+dx,p[1]+dy,s,9)
            text(ox-27,131,'もと' if i==0 else 'yだけ2倍',9)
        text(2,0,'青：共通の底辺OC',9,BLUE)
        return
    if n in (3,8,32):
        rows({3:[('A','D'),('B','E'),('C','F')],8:[('AB：DE','ABC：DEF'),('BC：EF','ABC：DEF'),('比の向き','そろえる')],32:[('35°','35°'),('65°','65°'),('80°','80°')]}[n]);return
    if n in (4,7,20,24,26):
        rows({4:[('辺の比 2：3','3/2倍'),('8 cm','12 cm')],7:[('大 → 小','3/5倍'),('周 40 cm','周 24 cm')],20:[('平行など','角が等しい'),('相似条件','相似と結論')],24:[('辺 2：3','2：3'),('面積 2²：3²','4：9'),('体積 2³：3³','8：27')],26:[('地図 6 cm','×25000'),('150000 cm','1500 m'),('1500 m','1.5 km')]}[n]);return
    if n==12:
        for i,ox in enumerate((20,146)):
            a=math.radians(60 if i==0 else 90);O=(ox,115);A=(ox+48,115);B=(ox+72*math.cos(a),115-72*math.sin(a))
            line(O,A,BLUE,2);line(O,B,BROWN,2,True);line(A,B,GRAY,.8);arc(O,A,B,13)
            text(ox+14,119,'2',9,BLUE);text(ox-10,63,'3',9,BROWN);text(ox+15,94,'60°' if i==0 else '90°',9)
        text(5,8,'同じ2辺でも、開き方が違う。',10);return
    assert exercise_figure(Labels(),q,x,y),n
    if n in (13,14,15,16,17,27,30):
        t={13:.6,14:.4,15:.5,16:.4,17:.6,27:2/3,30:.4}[n];A=(92,15);B=(32,123);C=(210,123)
        if n==13:A=(60,123-math.sqrt(89**2-28**2))
        if n==30:A=(92,123-math.sqrt((178/1.5)**2-60**2))
        D=tuple(A[i]+t*(B[i]-A[i]) for i in (0,1));E=tuple(A[i]+t*(C[i]-A[i]) for i in (0,1))
        if n==14:
            line(A,E,BLUE,2);line(E,C,BROWN,2,True)
        else:
            line(D,E,BLUE,2);line(B,C,BROWN,2,True)
        if n in (17,30):
            arc(A,B,C,15);arc(D,A,E,13,BROWN);arc(B,A,C,13,BROWN)
        if n==14:text(116,42,'AE = 6',9,BLUE);text(162,96,'EC = 9',9,BROWN)
        if n==15:text(99,D[1]-17,'DE = 7',9,BLUE)
        if n==27:text(89,61,'20 cm²',9,BLUE)
    if n==5:
        v=4*math.sin(math.radians(60))/math.sin(math.radians(80));base=[(0,0),(4,0),(v*math.cos(math.radians(40)),v*math.sin(math.radians(40)))]
        for i in (0,1):
            a=0 if i==0 else math.radians(155)
            pts=[((14 if i==0 else 222)+21*(px*math.cos(a)-py*math.sin(a)),(95 if i==0 else 45)-21*(px*math.sin(a)+py*math.cos(a))) for px,py in base]
            line(pts[1],pts[2],BLUE,2)
    if n in (6,29):
        for i,xx in enumerate((23,150)):
            ratio=2/3 if n==6 else .6;w,h=(72,48) if i==0 else (72*ratio,48*ratio)
            line((xx,110),(xx,110-h),BROWN,2,True);line((xx,110-h),(xx+w,110-h),BLUE,2)
    if n==25:
        for xx,w,h in [(25,30,22.5),(100,120,90)]:
            line((xx+5,116),(xx+5,111),GRAY,.7);line((xx,111),(xx+5,111),GRAY,.7)
            arc((xx+w,116),(xx,116),(xx,116-h),9)
    if n==18:
        A=(60,20);B=(10,20);O=(84,52);D=(120,100);C=(195,100)
        arc(O,A,B,14);arc(O,D,C,14);arc(A,O,B,11,BROWN);arc(D,O,C,11,BROWN)


def paragraph(b,s,size=10.5,x=44,width=507,leading=17,styles=None):
    """Keep math tokens intact and closing punctuation off line starts."""
    styles=styles or {}
    chunks=re.split('('+'|'.join(map(re.escape,sorted(styles,key=len,reverse=True)))+')',s) if styles else [s]
    atoms=[]
    for chunk in chunks:
        if chunk in styles:atoms.append((chunk,styles[chunk]))
        else:
            for t in re.findall(r'[A-Za-z0-9∠△∽∥√²³°=+−×/：↔.]+|.',chunk):
                if t in '。、）」』' and atoms:
                    old,col=atoms.pop();atoms.append((old+t,col))
                else:atoms.append((t,INK))
    xx=x
    for t,col in atoms:
        w=pdfmetrics.stringWidth(t,'JP',size)
        if xx>x and xx+w>x+width:xx=x;b.y+=leading
        assert w<=width,(s,t,w,width)
        b.text(t,xx,b.y,size,col)
        if col!=INK:
            b.c.setStrokeColor(HexColor(col));b.c.setLineWidth(.6);b.c.setDash([3,2] if col==BROWN else [])
            b.c.line(xx,841.89-b.y-size-2,xx+w,841.89-b.y-size-2);b.c.setDash([])
        xx+=w
    b.y+=leading+7


def answer(b,q,start,end):
    n=q['id'];b.text(f'問 {n:02d}',44,start,12,BLUE)
    b.y=start+2;paragraph(b,'ヒント：'+q['hint'],9,x=101,width=450,leading=14)
    b.y=max(b.y+5,start+31);paragraph(b,q['answer'],12,leading=19)
    top=b.y+5
    answer_figure(b,q,44,top)
    styles={}
    if n in (13,15,16,27):styles={'DE':BLUE,'BC':BROWN}
    if n==14:styles={'AE':BLUE,'EC':BROWN}
    if n in (6,29):styles={'AB':BROWN,'PQ':BROWN,'BC':BLUE,'QR':BLUE}
    if n==5:styles={'BC':BLUE,'EF':BLUE}
    if n in (17,30):styles={'∠DAE':BLUE,'∠BAC':BLUE,'∠ADE':BROWN,'∠ABC':BROWN}
    if n==18:styles={'∠AOB':BLUE,'∠DOC':BLUE,'∠OAB':BROWN,'∠ODC':BROWN}
    if n==28:styles={'OC':BLUE}
    b.y=top
    for i,s in enumerate(q['steps']):
        b.text(str(i+1),300,b.y,10,BLUE)
        paragraph(b,s,10.5,x=319,width=232,leading=17,styles=styles)
        b.y+=3
    bottom=max(b.y,top+144)
    if n in CAPTIONS:
        b.y=bottom+5;paragraph(b,CAPTIONS[n],10,x=44,width=507,leading=16)
    else:b.y=bottom+5
    b.c.setStrokeColor(HexColor(LINE));b.c.setLineWidth(.5);b.c.line(44,841.89-b.y,551,841.89-b.y)
    b.y+=7;paragraph(b,'確かめること：'+q['note'],9.5,leading=15)
    assert b.y<=end,(n,b.y,end)
