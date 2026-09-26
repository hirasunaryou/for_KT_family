"""Whiteboard-style annotated diagrams. Callout arrow tips target the geometry."""
import math
BLUE='#3566a0';BROWN='#98502f';INK='#253b39';GRAY='#61716b'
BOARD_HEIGHT=570

def board_scene(kind):
    out=[]
    def text(x,y,s,size=18,c=INK):out.append(('label',x,y,s,size,c))
    def line(a,b,c=GRAY,w=1.6,dash=''):out.append(('segment',a,b,c,w,dash))
    def poly(p,fill='#f7f9f5'):out.append(('polygon',p,fill,GRAY))
    def arrow(points,c=GRAY):
        # Open arrowheads distinguish annotations from parallel marks on the sides.
        for a,b in zip(points,points[1:]):line(a,b,c,1.5)
        a,b=points[-2:];theta=math.atan2(b[1]-a[1],b[0]-a[0])
        for delta in [-.45,.45]:line(b,(b[0]-9*math.cos(theta+delta),b[1]-9*math.sin(theta+delta)),c,1.5)
    def arc(v,a,b,n=1,c=BLUE,r=22):
        aa=math.atan2(a[1]-v[1],a[0]-v[0]);bb=math.atan2(b[1]-v[1],b[0]-v[0]);d=(bb-aa+math.pi)%(2*math.pi)-math.pi
        for j in range(n):
            p=[(v[0]+(r+6*j)*math.cos(aa+d*i/24),v[1]+(r+6*j)*math.sin(aa+d*i/24)) for i in range(25)]
            for a,b in zip(p,p[1:]):line(a,b,c,2.3)
    def nested(a,b,c,t):
        d=tuple(a[i]+t*(b[i]-a[i]) for i in (0,1));e=tuple(a[i]+t*(c[i]-a[i]) for i in (0,1))
        poly([a,b,c]);poly([a,d,e],'#edf3f9')
        for p,n,dx,dy in [(a,'A',-7,-14),(b,'B',-17,24),(c,'C',9,24),(d,'D',-24,3),(e,'E',10,3)]:text(p[0]+dx,p[1]+dy,n,18)
        return d,e
    def parallel_mark(x,y):
        line((x-5,y-5),(x+3,y),INK,1.8);line((x+3,y),(x-5,y+5),INK,1.8)
    if kind=='parallel-angles':
        a=(270,150);b=(120,352);c=(440,352);d,e=nested(a,b,c,.6)
        arc(d,a,e);arc(b,a,c);arc(e,a,d,2,BROWN);arc(c,a,b,2,BROWN)
        parallel_mark(300,d[1]);parallel_mark(300,b[1])
        text(12,37,'① ここと、ここ。',21,BLUE);text(12,65,'1本の弧が同じ角。',17,BLUE);text(12,94,'∠ADE = ∠ABC',17,BLUE)
        arrow([(70,112),(70,242),(188,258)],BLUE);arrow([(47,112),(47,325),(135,340)],BLUE)
        text(331,37,'② こちらも同じ。',21,BROWN);text(331,65,'2本の弧を見てね。',17,BROWN);text(331,94,'∠AED = ∠ACB',17,BROWN)
        arrow([(476,112),(476,244),(361,259)],BROWN);arrow([(503,112),(503,328),(422,339)],BROWN)
        text(172,407,'この2本が平行だから。',19);arrow([(318,394),(324,360)],GRAY)
        text(93,462,'平行線の「同位角」が等しい。',21)
        line((91,476),(456,476),'#d8dfd6',1)
        text(52,517,'2組の角が等しい → 相似と言える！',23)
        text(174,550,'△ADE ∽ △ABC',21)
    elif kind=='part-whole':
        a=(220,114);b=(90,314);c=(408,314);d,e=nested(a,b,c,.6)
        line(a,d,BLUE,4);line(d,b,BROWN,4,'8 5');text(154,171,'3',25,BLUE);text(80,265,'2',25,BROWN)
        text(13,40,'① ここまでが3。',21,BLUE);text(13,68,'残りが2。',21,BROWN)
        arrow([(71,88),(71,155),(167,190)],BLUE);arrow([(34,89),(34,278),(104,287)],BROWN)
        text(198,224,'DE = ?',19);text(211,344,'BC = 10',19)
        parallel_mark(280,d[1]);parallel_mark(280,b[1]);text(358,367,'DE ∥ BC',17)
        text(319,40,'まとめると……',19);text(319,74,'全体は 3+2=5',23)
        x=480;line((x,114),(x,234),BLUE,4);line((x,234),(x,314),BROWN,4,'8 5')
        text(449,119,'A');text(449,239,'D');text(449,320,'B')
        arrow([(486,86),(486,103)],GRAY)
        line((511,114),(511,314),GRAY,1.6,'2 4');line((505,114),(518,114));line((505,314),(518,314));text(521,225,'5',23)
        text(26,389,'② 比べる相手は「全体」！',21)
        text(86,435,'AD',25,BLUE);text(132,435,'：',25);text(163,435,'AB',25);text(213,435,'= 3：5',25)
        text(81,465,'上だけ',15,BLUE);text(165,465,'全部',15)
        text(55,511,'だから DE：BC も 3：5。',22)
        text(102,551,'DE = 10 × 3/5 = 6',23)
    elif kind=='midpoint':
        a=(270,134);b=(115,350);c=(435,350);d,e=nested(a,b,c,.5)
        for p,q,n,col in [(a,d,1,BLUE),(d,b,1,BLUE),(a,e,2,BROWN),(e,c,2,BROWN)]:
            mx=(p[0]+q[0])/2;my=(p[1]+q[1])/2
            for i in range(n):line((mx-5+i*5,my-4),(mx+5+i*5,my+4),col,2.3)
        arc(a,b,c,c=GRAY,r=30)
        text(14,37,'左も、半分ずつ。',20,BLUE);text(14,67,'AD = DB',20,BLUE)
        arrow([(61,83),(61,175),(227,188)],BLUE);arrow([(40,83),(40,302),(149,300)],BLUE)
        text(343,37,'右も、半分ずつ。',20,BROWN);text(343,67,'AE = EC',20,BROWN)
        arrow([(481,83),(481,175),(316,187)],BROWN);arrow([(503,83),(503,307),(396,300)],BROWN)
        text(192,103,'ここの角は共通。',17);arrow([(335,107),(284,162)],GRAY)
        text(210,285,'この辺も半分！',20,BLUE);arrow([(335,264),(325,247)],BLUE);text(221,316,'DE = BC ÷ 2',19,BLUE)
        parallel_mark(288,d[1]);parallel_mark(288,b[1])
        text(139,405,'2辺の比が、どちらも1/2。',20)
        text(155,436,'その間の角も、同じ。',20)
        text(47,491,'だから、小さい三角形は全体の1/2倍。',22)
        text(125,538,'DE ∥ BC、長さは半分。',22)
    else:raise ValueError(kind)
    return out
