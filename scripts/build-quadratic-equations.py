"""Generate the static lesson, shared question data, and three print PDFs.
Author dependencies: reportlab, matplotlib, latex2mathml, fonttools.
Usage: python scripts/build-quadratic-equations.py --font /path/to/NotoSansJP-Regular.ttf
The font must be a static TrueType font with Japanese glyphs. No web dependencies.
"""
from pathlib import Path
import argparse,json,html,hashlib,math,tempfile
from latex2mathml.converter import convert
R=Path(__file__).resolve().parents[1]
M=R/'materials/quadratic-equations'; A=R/'assets/quadratic-equations'
Q=json.loads((M/'questions.json').read_text()); C=json.loads((M/'guide.json').read_text())
def mm(s):return '<div class="math-wrap">'+convert(s)+'</div>' if s else ''
def esc(s):return html.escape(s).replace('\n','<br>')
for q in Q:
 q['expressionHTML']=mm(q['expression']);q['answerHTML']=esc(q['answerText']) if q.get('answerText') else mm(q['answer']);q['stepsHTML']=''.join(mm(s) for s in q['steps'])
(A/'questions.js').write_text('/* Generated from the same source as the printed workbook. */\nwindow.EQUATION_QUESTIONS = '+json.dumps(Q,ensure_ascii=False,indent=2)+';\n')
# Paper diagrams and Web SVGs share their underlying geometric construction.
def diagram(kind):
 if kind=='roots':return '<svg viewBox="0 0 500 115" role="img" aria-label="0から距離3の場所はマイナス3とプラス3"><path d="M35 65H465" stroke="#61716b"/><path d="M100 60V70M250 60V70M400 60V70" stroke="#61716b"/><circle cx="100" cy="65" r="5" fill="#b6502f"/><circle cx="400" cy="65" r="5" fill="#285c50"/><g text-anchor="middle" font-size="17" fill="#253b39"><text x="100" y="98">−3</text><text x="250" y="98">0</text><text x="400" y="98">3</text><text x="175" y="40">距離3</text><text x="325" y="40">距離3</text></g></svg>'
 if kind=='complete':return '<svg viewBox="0 0 500 155" role="img" aria-label="xの正方形と2つの3xの長方形に、3かける3の角を足す"><g stroke="#61716b"><rect x="110" y="15" width="90" height="90" fill="#eaf0df"/><rect x="200" y="15" width="45" height="90" fill="#d5e5f6"/><rect x="110" y="105" width="90" height="45" fill="#d5e5f6"/><rect x="200" y="105" width="45" height="45" fill="#f4cbae"/></g><g font-size="17" fill="#253b39" text-anchor="middle"><text x="155" y="68">x²</text><text x="222" y="68">3x</text><text x="155" y="135">3x</text><text x="222" y="135">9</text></g><g font-size="15" fill="#253b39"><text x="285" y="65">角の面積 3 × 3 = 9</text><text x="285" y="95">1辺は x + 3</text></g></svg>'
 if kind=='path':return '<svg viewBox="0 0 500 160" role="img" aria-label="12メートルかける8メートルの土地の四辺の内側に幅xの道"><rect x="70" y="15" width="210" height="140" fill="#e5e8e1" stroke="#61716b"/><rect x="95" y="40" width="160" height="90" fill="#eaf0df" stroke="#285c50"/><g font-size="15" fill="#253b39"><text x="140" y="34">12 m</text><text x="30" y="95">8 m</text><text x="150" y="84">中央</text><text x="73" y="85">x</text><text x="300" y="80">縦：8 − 2x</text><text x="300" y="110">横：12 − 2x</text></g></svg>'
 # Equal x/y unit length, static y=x² and y=4.
 pts=' '.join(f'{250+x*23},{145-x*x*23}' for x in [i/50 for i in range(-120,121)])
 return f'<svg viewBox="0 0 500 170" role="img" aria-label="y=xの2乗とy=4の交点のx座標はマイナス2と2"><path d="M165 145H335M250 158V8" stroke="#61716b"/><path d="M165 53H335" stroke="#b6502f" stroke-dasharray="5 3"/><polyline points="{pts}" fill="none" stroke="#285c50" stroke-width="2"/><g fill="#b6502f"><circle cx="204" cy="53" r="4"/><circle cx="296" cy="53" r="4"/></g><g font-size="14" fill="#253b39"><text x="193" y="165">−2</text><text x="292" y="165">2</text><text x="340" y="56">y = 4</text><text x="285" y="23">y = x²</text><text x="235" y="162">O</text></g></svg>'
# Lab HTML is authored separately for readable labels and progressive enhancement.
LABS=json.loads((M/'labs.json').read_text())
body=[]
for i,ch in enumerate(C):
 blocks=''
 for b in ch['blocks']:
  typ,s=b['type'],b['text']
  blocks+=mm(s) if typ=='math' else '<div class="reading-figure">'+diagram(s)+'</div>' if typ=='diagram' else f'<h3>{esc(s)}</h3>' if typ=='heading' else f'<div class="note">{esc(s)}</div>' if typ=='note' else f'<p>{esc(s)}</p>'
 body.append(f'<section class="chapter" id="{ch["id"]}"><span class="number">{i+1:02d}</span><h2>{ch["title"]}</h2><p class="muted">{ch["lead"]}</p>{blocks}{LABS.get(ch["id"],"")}</section>')
toc=''.join(f'<a href="#{ch["id"]}">{i+1}. {ch["title"].split("：")[0]}</a>' for i,ch in enumerate(C))
pdfs=''.join(f'<a class="button" href="../../../print/quadratic-equations-{k}.pdf">{label} PDF</a>' for k,label in [('guide','① 解説（8ページ）'),('workbook','② 問題集（12ページ）'),('answers','③ 解答と解説（12ページ）')])
page=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#285c50"><title>二次方程式 | 家族のまなび帳</title><meta name="description" content="二次方程式を、読んで、動かして、紙で解く。平方根・因数分解・平方完成・解の公式・文章題を40問で学ぶ中3教材。"><link rel="icon" href="../../../assets/icon.svg"><link rel="stylesheet" href="../../../assets/family/style.css"><link rel="stylesheet" href="../../../assets/quadratic-equations/style.css?v={hashlib.sha256((A/'style.css').read_bytes()).hexdigest()[:12]}"></head><body><a class="skip" href="#main">本文へスキップ</a><header class="masthead"><a class="brand" href="../../../index.html"><span class="brand-icon">f.</span>家族のまなび帳</a><nav aria-label="家族サイト"><a href="../../index.html">勉強</a><a href="../../../questions/index.html">日々の疑問</a></nav></header><main class="wrap" id="main"><div class="crumbs"><a href="../../../index.html">ホーム</a> / <a href="../index.html">数学</a> / 二次方程式</div><div class="equation-hero"><div><span class="eyebrow">MATHEMATICS / 中3</span><h1>二次方程式。<br>「解けた」に、理由を。</h1><p>平方根と因数分解が、ひとつにつながる。<br>予想して、動かして、最後は自分の手で解こう。</p><div class="actions"><a class="button primary" href="#print">紙の3冊を開く</a><a class="button" href="#roots-lab">まず±を動かす</a></div></div><div class="equation-visual" aria-hidden="true"><span>x² − x − 6 = 0</span><small>積にすると、道が見える</small><span>(x − 3)(x + 2) = 0</span><div><b>x = 3</b><b>x = −2</b></div></div></div><section class="section" id="print"><h2>読む → 紙で解く → 確かめる</h2><p>A4・白黒で印刷できます。問題集だけを先に渡し、解答は別に置くと自力で考えやすくなります。紙とWebは同じ問題番号です。</p><div class="actions">{pdfs}</div><p class="overview">初回は問1〜24と29〜30が目安。残りは別の日でも大丈夫。問題集は片面印刷がおすすめです。<br>前の単元へ：<a href="../square-roots/index.html">平方根</a> · つながりを見る：<a href="../quadratic-functions/index.html">二次関数</a></p></section><div class="lesson-layout"><nav class="toc" aria-label="この教材の目次"><strong>二次方程式の道しるべ</strong>{toc}<a href="#practice">9. 紙と同じ40問</a><a href="#record">10. 振り返り</a></nav><div class="lesson-body">{''.join(body)}<section class="chapter" id="practice"><h2>紙と同じ40問</h2><p>まずノートに途中式を書こう。詰まったらヒントだけを開き、もう一度考えます。答えは自分の解答と比べて確認してください。</p><div class="practice-tabs" id="question-tabs" aria-label="問題のグループ"></div><p id="question-count" class="muted"></p><div id="questions"></div></section><section class="chapter" id="record"><h2>「できた」を、次につなげよう</h2><p id="progress-text" role="status"></p><progress id="progress" max="40" value="0" aria-label="自力でできた問題数"></progress><div id="review-links" class="actions"></div><p id="storage-notice" class="notice" hidden>この環境では記録を保存できません。ページを開いている間は記録できます。</p><p class="muted">記録はこのブラウザ内に保存されます。自動採点ではなく、自分で解答を確かめてつける記録です。</p></section><noscript><div class="notice">解説と印刷PDFはそのまま読めます。動く実験・Web問題・記録にはJavaScriptを有効にしてください。</div></noscript></div></div></main><footer class="footer"><span>家族のまなび帳<br>読んで、動かして、考える。</span><a href="../index.html">数学の教材へ</a></footer><script src="../../../assets/quadratic-equations/questions.js"></script><script src="../../../assets/quadratic-equations/app.js?v={hashlib.sha256((A/'app.js').read_bytes()).hexdigest()[:12]}"></script></body></html>'''
(R/'study/math/quadratic-equations/index.html').write_text(page)

parser=argparse.ArgumentParser();parser.add_argument('--font');args=parser.parse_args()
if not args.font:
 print('Web built. Pass --font to also build print PDFs.');raise SystemExit(0)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from matplotlib.mathtext import math_to_image
from matplotlib.font_manager import FontProperties
from fontTools.ttLib import TTFont as FTFont
font=FTFont(args.font); cmap=font.getBestCmap();pdfmetrics.registerFont(TTFont('JP',args.font))
W,H=595.276,841.89
INK='#243b39';GRAY='#60706a'; LINE='#ccd5cc'
tmp=Path(tempfile.mkdtemp(prefix='equation-math-'));cache={}
def math_image(s,size):
 if (s,size) not in cache:
  p=tmp/(hashlib.sha256((s+str(size)).encode()).hexdigest()+'.png')
  math_to_image('$'+s+'$',str(p),prop=FontProperties(size=size),dpi=250,color=INK)
  im=ImageReader(str(p));w,h=im.getSize();cache[s,size]=(im,w*72/250,h*72/250)
 return cache[s,size]
class Book:
 def __init__(self,kind,title):
  self.c=canvas.Canvas(str(R/f'print/quadratic-equations-{kind}.pdf'),pagesize=(W,H));self.c.setTitle(title);self.c.setAuthor('家族のまなび帳');self.title=title;self.n=0;self.y=0
 def text(self,s,x,y,size=10.5,color=INK):
  assert all(ord(ch) in cmap for ch in s),(s,[ch for ch in s if ord(ch) not in cmap])
  self.c.setFont('JP',size);self.c.setFillColor(HexColor(color));self.c.drawString(x,H-y-size,s)
 def page(self,title,sub=''):
  if self.n:self.c.showPage()
  self.n+=1;self.text(self.title,42,28,9,GRAY);self.text(title,42,56,20);self.text(sub,42,91,9,GRAY)
  self.c.setStrokeColor(HexColor(LINE));self.c.line(42,H-114,W-42,H-114)
  self.text('中3 数学 | 二次方程式',42,803,9,GRAY);self.text(str(self.n),W-55,803,9,GRAY);self.y=130
 def para(self,s,size=12,x=42,width=511,leading=21):
  for para in s.split('\n'):
   line=''
   for ch in para:
    if pdfmetrics.stringWidth(line+ch,'JP',size)>width:
     self.text(line,x,self.y,size);self.y+=leading;line=ch
    else:line+=ch
   self.text(line,x,self.y,size);self.y+=leading
  self.y+=6
 def heading(self,s):self.y+=8;self.para(s,14,leading=23)
 def math(self,s,size=16):
  im,w,h=math_image(s,size)
  if w>490:
   factor=490/w;w*=factor;h*=factor
  self.c.drawImage(im,52,H-self.y-h,width=w,height=h,mask='auto');self.y+=h+getattr(self,"mathgap",13)
 def note(self,s):
  start=self.y;self.para(s,10.5,x=54,width=483,leading=19)
  self.c.setStrokeColor(HexColor('#285c50'));self.c.setLineWidth(2);self.c.line(44,H-start,44,H-self.y+5)
 def diagram(self,kind):
  c=self.c;top=self.y
  def rect(x,y,w,h,col):c.setFillColor(HexColor(col));c.setStrokeColor(HexColor(GRAY));c.setLineWidth(.6);c.rect(x,H-top-y-h,w,h,stroke=1,fill=1)
  def line(x,y,x2,y2):c.setStrokeColor(HexColor(GRAY));c.line(x,H-top-y,x2,H-top-y2)
  def txt(s,x,y,size=10):self.text(s,x,top+y,size)
  if kind=='complete':
   rect(108,0,74,74,'#eef2e5');rect(182,0,37,74,'#e2e9ee');rect(108,74,74,37,'#e2e9ee');rect(182,74,37,37,'#f4e1d2')
   for s,x,y in [('x²',136,29),('3x',192,29),('3x',136,85),('9',196,85)]:txt(s,x,y)
   txt('角の面積 3 × 3 = 9',270,35);txt('1辺は x + 3',270,61);self.y+=125
  elif kind=='roots':
   line(85,39,510,39)
   for x,s in [(150,'−3'),(297,'0'),(444,'3')]:
    line(x,34,x,44);txt(s,x-6,48)
    if s!='0':c.setFillColor(HexColor(INK));c.circle(x,H-top-39,3,stroke=0,fill=1)
   txt('距離3',205,13);txt('距離3',352,13);self.y+=83
  elif kind=='path':
   rect(99,3,174,116,'#eeeeee');rect(121,25,130,72,'#edf2e5');txt('12 m',171,5,9);txt('8 m',66,51);txt('中央',174,54);txt('x',104,53);txt('縦：8 − 2x',314,35);txt('横：12 − 2x',314,63);self.y+=130
  else:
   ox,oy,unit=288,126,20
   line(ox-78,oy,ox+78,oy);line(ox,oy+13,ox,4)
   line(ox-78,oy-4*unit,ox+78,oy-4*unit)
   c.setLineWidth(1.2);p=c.beginPath()
   for i in range(241):
    x=-2.4+i*.02;px=ox+x*unit;py=H-top-(oy-x*x*unit)
    p.moveTo(px,py) if i==0 else p.lineTo(px,py)
   c.drawPath(p);txt('y = x²',345,8);txt('y = 4',374,oy-4*unit-6)
   for x in [-2,2]:
    c.circle(ox+x*unit,H-top-(oy-4*unit),3,fill=1);txt(str(x),ox+x*unit-5,oy+4)
   self.y+=155
 def check(self):assert self.y<787,(self.title,self.n,self.y)
 def save(self):self.c.save();print(self.title,self.n,'pages')
b=Book('guide','二次方程式 ① 解説')
for ch in C:
 b.page(ch['title'],ch['lead'])
 for block in ch['blocks']:
  typ,s=block['type'],block['text']
  {'text':b.para,'heading':b.heading,'math':b.math,'note':b.note,'diagram':b.diagram}[typ](s)
 b.check()
b.save()
# Four problems per page; extended applications get half a page each.
pages=[]
for start in range(0,40,4):
 group=Q[start:start+4]
 if start in [28,32]:pages.extend([group[:2],group[2:]])
 else:pages.append(group)
for kind,title in [('workbook','二次方程式 ② 問題集'),('answers','二次方程式 ③ 解答と解説')]:
 b=Book(kind,title)
 if kind=='answers':b.mathgap=5
 for group in pages:
  first,last=group[0]['id'],group[-1]['id'];b.page(f'{group[0]["group"]} | 問{first}〜{last}','途中式を残そう。 □ 自力でできた  □ ヒントでできた  □ もう一度' if kind=='workbook' else '答えを比べ、どの手順で迷ったかを見つけよう。')
  slot=650/len(group)
  for i,q in enumerate(group):
   start=130+slot*i;b.y=start
   if kind=='workbook':
    b.para(f'問{q["id"]}  '+q['prompt'],10.5,leading=17)
    if q['expression']:b.math(q['expression'],15)
    # A light writing guide at the bottom leaves unruled space for free work.
    if q['id'] in [29,30,31,32,40]:b.para('文字と条件 → 式 → 計算 → 答えの確認',9)
    end=start+slot-17;b.c.setStrokeColor(HexColor(LINE));b.c.setLineWidth(.4);b.c.line(42,H-end,W-42,H-end)
    b.text('答え・確認：',43,end-17,9,GRAY)
   else:
    # Avoid duplicating the prompt and expression on answer pages.
    b.y=start;b.para(f'問{q["id"]}',10,leading=13)
    if q.get('answerText'):b.para(q['answerText'],12)
    else:b.math(q['answer'],15)
    for s in q['steps']:b.math(s,12.5)
    b.para(q['note'],9.5,leading=16)
   assert b.y<start+slot-8,(kind,q['id'],b.y,start+slot)
  b.check()
 b.save()
