"""Build the similarity lesson and three PDFs from one source.
Usage: python scripts/build-similarity.py --font /path/to/static-Japanese.ttf
Dependencies: reportlab, fonttools. No network or browser dependencies.
"""
from pathlib import Path
import argparse,json,math,html
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from fontTools.ttLib import TTFont as Font
R=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--font',required=True);args=parser.parse_args()
pdfmetrics.registerFont(TTFont('JP',args.font));cmap=Font(args.font).getBestCmap()
D=json.loads((R/'materials/similarity/content.json').read_text());Q=D['questions'];C=D['chapters']
INK='#253b39';GREEN='#285c50';GRAY='#61716b';LINE='#d8dfd6';BLUE='#3566a0';ORANGE='#b6502f'
def esc(s):return html.escape(str(s))
# All static drawings use the same primitive list for browser SVG and PDF vectors.
def drawing(kind,qid=0):
 out=[]
 def line(a,b,color=GRAY):out.append(('line',a,b,color))
 def polygon(p,fill='#eaf0df',color=GREEN):out.append(('polygon',p,fill,color))
 def text(x,y,s,size=14):out.append(('text',x,y,s,size))
 def labels(p,n):
  cx=sum(x for x,y in p)/len(p);cy=sum(y for x,y in p)/len(p)
  for (x,y),s in zip(p,n):text(x+(10 if x>=cx else -18),y+(19 if y>=cy else -12),s,15)
 if kind=='stretch':
  for x,w,h,title in [(25,60,60,'もとの形'),(180,120,120,'縦横2倍'),(390,120,60,'横だけ2倍')]:
   polygon([(x,180),(x+w,180),(x+w,180-h),(x,180-h)])
   text(x,210,title,13)
 elif kind=='pair':
  b=4*math.sin(math.radians(60))/math.sin(math.radians(80));base=[(0,0),(4,0),(b*math.cos(math.radians(40)),b*math.sin(math.radians(40)))];p=[(45+x*38,160-y*38) for x,y in base]
  ang=math.radians(155);p2=[(470+40*(x*math.cos(ang)-y*math.sin(ang)),110-40*(x*math.sin(ang)+y*math.cos(ang))) for x,y in base]
  polygon(p);polygon(p2,'#e3edf6',BLUE);labels(p,'ABC');labels(p2,'DEF')
  text(47,205,'A=40° / B=60° / C=80°',12);text(302,205,'D=40° / E=60° / F=80°',12)
 elif kind=='conditions':
  v=math.sqrt(6**2-5.25**2);polygon([(45,170),(189,170),(45+5.25*18,170-v*18)]);polygon([(290,170),(506,170),(290+5.25*27,170-v*27)],'#e3edf6',BLUE)
  text(100,198,'4 / 6 / 8',15);text(355,198,'6 / 9 / 12',15);text(72,225,'3組の辺の比が 2：3 にそろう',14)
 elif kind=='nested':
  t={13:.6,14:.4,15:.5,16:.4,17:.6,27:2/3,30:.4}.get(qid,.6)
  a=(235,26);b=(80,194);c=(425,194);d=tuple(a[i]+t*(b[i]-a[i]) for i in [0,1]);e=tuple(a[i]+t*(c[i]-a[i]) for i in [0,1])
  polygon([a,b,c]);polygon([a,d,e],'#e3edf6',BLUE);labels([a,b,c],'ABC');text(d[0]-25,d[1]+2,'D',15);text(e[0]+12,e[1]+2,'E',15)
 elif kind=='cross':
  a=(180,40);b=(115,40);o=(250,95);d=(355,177.5);c=(452.5,177.5)
  polygon([a,o,b]);polygon([d,o,c],'#e3edf6',BLUE);labels([a,o,b],'AOB');text(d[0]-18,d[1]+20,'D',15);text(c[0]+10,c[1]+20,'C',15);text(75,224,'A・O・D と B・O・C が一直線。AB ∥ CD。',13)
 elif kind=='squares':
  for x,n in [(55,1),(280,2)]:
   u=55;polygon([(x,190),(x+n*u,190),(x+n*u,190-n*u),(x,190-n*u)])
   for a in range(1,n):line((x+a*u,190),(x+a*u,190-n*u));line((x,190-a*u),(x+n*u,190-a*u))
   text(x,218,f'1辺{n} → 面積{n*n}',14)
 elif kind=='shadow':
  line((40,196),(510,196))
  for x,w,h,name in [(55,45,33.75,'棒'),(270,180,135,'木')]:
   polygon([(x,194),(x+w,194),(x,194-h)]);line((x,194),(x,194-h),INK)
   text(x-24,194-h-12,name,14);text(x+w/2-20,220,'影',13)
   line((x+8,194),(x+8,186));line((x,186),(x+8,186))
 else:raise ValueError(kind)
 return out

def svg(kind,qid=0):
 parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 245" role="img" aria-label="'+{'stretch':'同じ倍率の拡大と一方向だけの変形','pair':'向きが異なる2つの三角形と角の対応','conditions':'辺の比を比べる2つの三角形','nested':'三角形ABCの辺AB上にD、辺AC上にE','cross':'Oで交差する直線と平行なAB・CD','squares':'1辺と面積の倍率','shadow':'棒と木の高さと影'}[kind]+'">']
 for p in drawing(kind,qid):
  if p[0]=='line':_,a,b,color=p;parts.append(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="{color}" stroke-width="1.5"/>')
  elif p[0]=='polygon':_,pts,fill,color=p;parts.append(f'<polygon points="'+ ' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{fill}" stroke="{color}" stroke-width="1.5"/>')
  else:_,x,y,s,size=p;parts.append(f'<text x="{x}" y="{y}" fill="{INK}" font-size="{size}" font-family="sans-serif">{esc(s)}</text>')
 return ''.join(parts)+'</svg>'

def figure(kind,qid=0):return '<figure class="reading-figure">'+svg(kind,qid)+'<figcaption>図は関係を整理するためのものです。長さや角度は本文の条件を使います。</figcaption></figure>'
raw=(R/'materials/similarity/labs.html').read_text()
# Split complete top-level lab sections, and insert them beside the relevant chapter.
import re
labs=re.findall(r'<section class="lab interactive".*?</section>',raw,re.S)
assert len(labs)==4
labmap={'shape':labs[0],'correspond':labs[1],'parallel':labs[2],'scale':labs[3]}
chapters=[]
for i,ch in enumerate(C):
 blocks=''
 for typ,s in ch['blocks']:
  tag={'text':'p','heading':'h3','example':'div','note':'div'}[typ];cls=f' class="{typ}"' if typ in ['example','note'] else ''
  blocks+=f'<{tag}{cls}>{esc(s).replace(chr(10),"<br>")}</{tag}>'
 chapters.append(f'<section class="chapter" id="{ch["id"]}"><span class="number">{i+1:02d}</span><h2>{ch["title"]}</h2><p class="muted">{ch["lead"]}</p>'+figure(ch['figure'])+blocks+labmap.get(ch['id'],'')+'</section>')
groups=list(dict.fromkeys(q['group'] for q in Q))
questions=[]
for q in Q:
 buttons=''.join(f'<button type="button" data-grade="{v}" aria-pressed="false">{s}</button>' for v,s in [('own','自力でできた'),('hint','ヒントでできた'),('review','もう一度')])
 questions.append(f'<article class="q-card" id="q{q["id"]}" data-group="{q["group"]}" tabindex="-1"><div class="q-head"><b>問{q["id"]}</b><span class="q-status">まだ記録していません</span></div><p>{esc(q["prompt"])}</p>'+(figure(q['figure'],q['id']) if q.get('figure') else '')+f'<details><summary>ヒントを1つ見る</summary><div>{esc(q["hint"])}</div></details><details class="solution"><summary>解答と理由を確認する</summary><div><strong>{esc(q["answer"])}</strong><ol class="answer-steps">'+''.join('<li>'+esc(s)+'</li>' for s in q['steps'])+f'</ol><p>{esc(q["note"])}</p></div></details><div class="grade interactive">{buttons}</div></article>')
nav=''.join(f'<a href="#{ch["id"]}">{i+1}. {ch["title"]}</a>' for i,ch in enumerate(C))
tabs=''.join(f'<button type="button" data-group-button="{g}" aria-pressed="false">{g}</button>' for g in groups)+ '<button type="button" data-group-button="all" aria-pressed="false">全32問</button>'
page=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="{GREEN}"><meta name="description" content="相似を、紙と4つの動く体験で理解する中3数学教材。対応・相似条件・証明・面積比と体積比を32問で学ぶ。"><title>相似 | 家族のまなび帳</title><link rel="icon" href="../../../assets/icon.svg"><link rel="stylesheet" href="../../../assets/family/style.css"><link rel="stylesheet" href="../../../assets/similarity/style.css"><script src="../../../assets/similarity/model.js" defer></script><script src="../../../assets/similarity/app.js" defer></script></head><body>
<a class="skip" href="#main">本文へスキップ</a><header class="masthead"><a class="brand" href="../../../index.html"><span class="brand-icon">f.</span>家族のまなび帳</a><nav aria-label="家族サイト"><a href="../../index.html">勉強</a><a href="../../../questions/index.html">日々の疑問</a></nav></header>
<main class="wrap" id="main"><div class="crumbs"><a href="../../../index.html">ホーム</a> / <a href="../index.html">数学</a> / 相似</div>
<div class="sim-hero"><div><span class="eyebrow">MATHEMATICS / 中3</span><h1>相似。<br>形が同じ、その先へ。</h1><p>向きが違っても、重なっていても。<br>対応を見つけると、測れない長さが見えてくる。</p><div class="actions"><a class="button primary" href="#print">紙の3冊を開く</a><a class="button" href="#shape-lab">予想して、動かす</a></div></div><div class="sim-hero-art">{svg('pair')}</div></div>
<section class="section" id="print"><h2>紙でじっくり。画面で、はっと気づく。</h2><p>解説を読む → 紙に図と途中式を書く → 解答で理由を確認 → Webで予想を確かめる。紙とWebは同じ32問です。A4・白黒印刷に対応しています。</p><div class="pdf-grid"><a class="button" href="../../../print/similarity-guide.pdf">① 解説 <small>8ページ · 考え方を一つずつ</small></a><a class="button" href="../../../print/similarity-workbook.pdf">② 問題集 <small>16ページ · 32問＋体験メモ</small></a><a class="button" href="../../../print/similarity-answers.pdf">③ 解答と解説 <small>14ページ · ヒント・途中式・理由</small></a></div>
<div class="plan-strip">1回目：問1〜12と体験①② ／ 2回目：問13〜20と体験③ ／ 3回目：問21〜28と体験④。問29〜32は翌日以降に、解答を閉じて再挑戦。各回30〜45分を目安に、必要なところだけで大丈夫です。</div><p class="muted">前の単元へ：<a href="../square-roots/index.html">平方根</a> · <a href="../quadratic-equations/index.html">二次方程式</a> · <a href="../quadratic-functions/index.html">二次関数</a></p></section>
<noscript><p class="notice">解説と全32問・解答はこのまま読めます。動く図と学習記録にはJavaScriptが必要です。紙の体験メモは予想や説明の練習にも使えます。</p></noscript>
<div class="lesson-layout"><nav class="toc" aria-label="相似の目次"><strong>相似の道しるべ</strong>{nav}<a href="#practice">9. 紙と同じ32問</a><a href="#records">10. 振り返り</a></nav><div class="lesson-body">{''.join(chapters)}
<section class="chapter" id="practice"><h2>紙で解いて、理由を確かめる</h2><p>図の対応に印を付け、途中式と理由を紙に残そう。答えを見た問題は、閉じてもう一度。自動採点ではなく、自分の解答と比べて記録します。</p><div class="practice-tabs interactive">{tabs}</div>{''.join(questions)}</section>
<section class="chapter interactive" id="records"><h2>できたことを、次につなげよう</h2><p>自力で解けた？ 比の式にした理由も言えた？ 問29〜32は、時間をおいて確かめるための問題です。</p><progress id="progress" max="32" value="0" aria-label="自力でできた問題数"></progress><p id="progress-text"></p><div id="review-links"></div><p id="storage-notice" class="notice" hidden>このブラウザでは記録を保存できません。この画面を開いている間は記録できます。</p><p class="muted">記録はこの端末・ブラウザ内だけに保存されます。他の教材の記録とは別です。端末間では同期せず、閲覧データを消すと記録も消えます。</p></section>
</div></div></main><footer class="footer"><span>家族のまなび帳<br>読んで、動かして、考える。</span><a href="../index.html">数学の教材へ</a></footer></body></html>'''
(R/'study/math/similarity/index.html').write_text(page)
# A4: generous handwriting space and one chapter per guide page.
W,H=595.276,841.89
class Book:
 def __init__(self,kind,title):
  self.c=canvas.Canvas(str(R/f'print/similarity-{kind}.pdf'),pagesize=(W,H),invariant=1);self.c.setTitle(title);self.c.setAuthor('家族のまなび帳');self.title=title;self.n=0;self.y=0
 def text(self,s,x,y,size=10.5,color=INK):
  missing=[ch for ch in s if ord(ch) not in cmap];assert not missing,(s,missing)
  self.c.setFont('JP',size);self.c.setFillColor(HexColor(color));self.c.drawString(x,H-y-size,s)
 def para(self,s,size=10.5,x=44,width=507,leading=18):
  for row in s.split('\n'):
   line=''
   for ch in re.findall(r'[A-Za-z0-9∠△∽∥√²³°=+−×/：↔().]+|.',row):
    if line and pdfmetrics.stringWidth(line+ch,'JP',size)>width:
     self.text(line,x,self.y,size);self.y+=leading;line=ch
    else:line+=ch
   self.text(line,x,self.y,size);self.y+=leading
  self.y+=7
 def page(self,title,lead):
  if self.n:self.c.showPage()
  self.n+=1;self.text(self.title,44,27,9,GRAY);self.text(title,44,55,19);self.text(lead,44,89,9,GRAY);self.c.setStrokeColor(HexColor(LINE));self.c.line(44,H-112,W-44,H-112);self.text('中3 数学 | 相似',44,807,8,GRAY);self.text(str(self.n),535,807,8,GRAY);self.y=126
 def figure(self,kind,qid=0,height=135):
  scale=height/245;ox=(W-550*scale)/2;oy=self.y;c=self.c
  for p in drawing(kind,qid):
   if p[0]=='text':_,x,y,s,size=p;self.text(s,ox+x*scale,oy+(y-size)*scale,size*scale)
   elif p[0]=='line':
    _,a,b,col=p;c.setStrokeColor(HexColor(col));c.setLineWidth(.7);c.line(ox+a[0]*scale,H-oy-a[1]*scale,ox+b[0]*scale,H-oy-b[1]*scale)
   else:
    _,pts,fill,col=p;c.setFillColor(HexColor(fill));c.setStrokeColor(HexColor(col));c.setLineWidth(.9);path=c.beginPath()
    for i,(x,y) in enumerate(pts):
     (path.moveTo if i==0 else path.lineTo)(ox+x*scale,H-oy-y*scale)
    path.close();c.drawPath(path,stroke=1,fill=1)
  self.y+=height+8
 def block(self,typ,s):
  if typ=='heading':self.y+=5;self.para(s,12.5,leading=21)
  elif typ in ['note','example']:
   start=self.y;self.para(s,11.5,x=54,width=487,leading=20)
   self.c.setStrokeColor(HexColor(GREEN if typ=='note' else LINE));self.c.setLineWidth(2 if typ=='note' else .8);self.c.line(44,H-start,44,H-self.y+6)
  else:self.para(s,11.5,leading=20)
 def check(self):assert self.y<787,(self.title,self.n,self.y)
 def save(self):self.c.save();print(self.title,self.n,'pages')
b=Book('guide','相似 ① 解説')
for ch in C:
 b.page(ch['title'],ch['lead']);b.figure(ch['figure'],height=145)
 for typ,s in ch['blocks']:b.block(typ,s)
 b.check()
b.save()
# First twelve short prompts in 4-question pages; remaining geometry/writing in half pages.
pages=[Q[:4],Q[4:6],Q[6:8],Q[8:12]]+[Q[i:i+2] for i in range(12,32,2)]
for kind,title in [('workbook','相似 ② 問題集'),('answers','相似 ③ 解答と解説')]:
 b=Book(kind,title)
 for qs in pages:
  b.page(f'{qs[0]["group"]} | 問{qs[0]["id"]}〜{qs[-1]["id"]}','図に対応を書き、途中式と理由を残そう。図の長さは本文の条件を使います。' if kind=='workbook' else 'まずヒントだけ見る使い方もOK。解答を閉じて、もう一度説明しよう。')
  slot=650/len(qs)
  for i,q in enumerate(qs):
   start=126+i*slot;b.y=start
   if kind=='workbook':
    b.para(f'問{q["id"]}  {q["prompt"]}',10.5,leading=17)
    if q.get('figure'):b.figure(q['figure'],q['id'],height=72 if len(qs)==4 else 115)
    end=start+slot-15;assert b.y<end-28,(q['id'],b.y,end)
    b.c.setStrokeColor(HexColor(LINE));b.c.setLineWidth(.5);b.c.line(44,H-end,W-44,H-end)
    b.text('□ 自力でできた   □ ヒントでできた   □ もう一度',44,end-15,8.5,GRAY)
   else:
    b.para(f'問{q["id"]}  ヒント：{q["hint"]}',9.5,leading=16)
    b.para(q['answer'],12,leading=20)
    for j,s in enumerate(q['steps']):b.para(f'{j+1}. {s}',9.5,leading=16)
    b.para(q['note'],9,leading=15)
    assert b.y<start+slot-5,(kind,q['id'],b.y,start+slot)
  b.check()
 if kind=='workbook':
  memos=[('体験① 同じ形を壊してみる','縦横2倍と横だけ2倍。角と辺の倍率はどうなる？','横だけ2倍で、対応する辺の倍率がそろわない理由を書こう。'),('体験② 対応を見つける','回転・裏返しで、対応する頂点は変わる？','移動・回転・裏返しで変わらないものと、拡大で変わるものを書こう。'),('体験③ 平行の条件を外す','DEを平行に保つ場合と、Eだけずらす場合。3つの比は？','「平行」から「辺の比が等しい」まで、理由を順に書こう。'),('体験④ 面積と体積の倍率','長さ2倍なら、面積と体積は何倍？ 縦だけ2倍なら？','面積比が9：16の相似な図形で、長さの比は？ 理由も書こう。')]
  for i in [0,2]:
   b.page('予想して、動かして、言葉にする','Web体験メモ。予想が外れても大丈夫。何が変わったかを書こう。')
   for j,(title,prompt,after) in enumerate(memos[i:i+2]):
    b.y=126+j*320;b.para(title,13,leading=23);b.para(prompt)
    b.para('① 動かす前の予想：');b.y+=48;b.para('② 操作して、気づいたこと：');b.y+=48;b.para('③ '+after);b.y+=30
   b.check()
 b.save()
