"""Build the paper-first Pythagorean unit from shared, editable sources."""
import argparse,html,json,re
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from fontTools.ttLib import TTFont as Font
from pythagorean_figures import scene,svg,INK,BLUE,GRAY,LIGHT
R=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--font',required=True);args=p.parse_args()
pdfmetrics.registerFont(TTFont('JP',args.font));cmap=Font(args.font).getBestCmap()
D=json.loads((R/'materials/pythagorean/content.json').read_text());L=[D['intro'],*D['lessons']];Q=D['questions'];N=len(Q);W,H=595.276,841.89
class Book:
 def __init__(self,kind,name):
  self.c=canvas.Canvas(str(R/f'print/pythagorean-{kind}.pdf'),pagesize=(W,H),invariant=1);self.c.setTitle(name);self.c.setAuthor('家族のまなび帳');self.name=name;self.n=0;self.y=0
 def text(self,s,x,y,size=11,col=INK,anchor='start'):
  assert all(ord(t) in cmap for t in s),(s,'missing glyph')
  self.c.setFont('JP',size);self.c.setFillColor(HexColor(col));method={'start':self.c.drawString,'middle':self.c.drawCentredString,'end':self.c.drawRightString}[anchor];method(x,H-y-size,s)
 def para(self,s,x=44,width=507,size=11,leading=19,col=INK):
  atoms=re.findall(r'[A-Za-z0-9∠△∽√²³°=+−×÷/：↔.]+|.',s);line=''
  for i,t in enumerate(atoms):
   extra=atoms[i+1] if i+1<len(atoms) and atoms[i+1] in '。、）」' else ''
   if line and pdfmetrics.stringWidth(line+t+extra,'JP',size)>width:self.text(line,x,self.y,size,col);self.y+=leading;line=t
   else:line+=t
  self.text(line,x,self.y,size,col);self.y+=leading+7
 def page(self,title,lead):
  if self.n:self.c.showPage()
  self.n+=1;self.text(self.name,44,25,9,GRAY);self.text(title,44,55,18);self.text(lead,44,90,9,GRAY);self.rule(112);self.text('中3 数学 | 三平方の定理',44,807,8,GRAY);self.text(str(self.n),535,807,8,GRAY);self.y=129
 def rule(self,y):self.c.setStrokeColor(HexColor(LIGHT));self.c.setLineWidth(.7);self.c.line(44,H-y,551,H-y)
 def fig(self,f,x,y,width=507,answer=False,guide=False,qid=0):
  scale=width/640
  for t in scene(f,answer,guide,qid):
   if t[0]=='text':
    _,xx,yy,s,size,c,anchor=t;size=max(size,21) if width<300 else size;self.text(s,x+xx*scale,y+(yy-size)*scale,size*scale,c,anchor)
   else:
    kind,pts,c,w,dash,fill=t;self.c.setStrokeColor(HexColor(c));self.c.setLineWidth(w*scale);self.c.setDash([float(v)*scale for v in dash.split()] if dash else [])
    if fill:self.c.setFillColor(HexColor(fill))
    path=self.c.beginPath()
    for i,(xx,yy) in enumerate(pts):(path.moveTo if i==0 else path.lineTo)(x+xx*scale,H-y-yy*scale)
    if kind=='polygon':path.close()
    self.c.drawPath(path,fill=int(bool(fill)));self.c.setDash([])
 def save(self):self.c.save();print(self.name,self.n,'pages')
b=Book('guide','三平方 ① 解説')
for l in L:
 b.page(l['title'],'はじめに：何が分かる定理なのか、図と式で見てみよう。' if l['id']=='intro' else '対応する問題：'+ '・'.join(str(n) for n in l['questions'])+'。必要な辺・角を図でたどろう。')
 b.para(l['focus'],size=12,leading=22);top=b.y+9;b.fig(l['figure'],44,top,507,guide=True);b.y=top+339
 for i,note in enumerate(l['notes']):b.text(str(i+1),44,b.y,12,BLUE);b.para(note,x=69,width=480,size=11.5,leading=21);b.y+=5
 b.rule(b.y+5);b.y+=19;b.para(l['take'],size=10.5,leading=19);assert b.y<788,(l['id'],b.y)
b.save()
for kind,name in [('workbook','三平方 ② 問題集'),('answers','三平方 ③ 解答と解説')]:
 b=Book(kind,name)
 for k in range(0,N,2):
  b.page(f'問{k+1}〜{k+2} | '+Q[k]['group'],'単位は本文の指定に従います。図に印を付け、式と理由を書こう。' if kind=='workbook' else '同じページ番号の問題集と見比べよう。図・途中式・理由をつなぐ。')
  for j,q in enumerate(Q[k:k+2]):
   start=129+j*326;b.y=start;b.text(f'問 {q["id"]:02d}',44,start,12,BLUE);b.y+=24
   if kind=='workbook':
    b.para(q['prompt'],size=10.5,leading=18)
    top=b.y+3;b.fig(q['figure'],24,top,288,qid=q['id']);b.text('途中式・理由',325,top,9,GRAY)
    assert top+180<start+282,(q['id'],top,start)
    b.text('答え：',325,start+281,10);b.rule(start+305);b.text('□ 自力でできた    □ ヒントでできた    □ もう一度',44,start+312,8,GRAY)
   else:
    b.para(q['answer'],size=11.5,leading=19);top=b.y+5;b.fig(q['figure'],24,top,288,answer=True,qid=q['id']);b.y=top
    for i,st in enumerate(q['steps']):b.text(str(i+1),308,b.y,10,BLUE);b.para(st,x=327,width=224,size=10.5,leading=17)
    b.y=max(b.y,top+180)+4;b.rule(b.y);b.y+=8;b.para('確認：'+q['note'],size=9.5,leading=16);assert b.y<start+319,(q['id'],b.y,start)
 if kind=='workbook':
  memos=[('体験1：同じ4枚を並べ替える','空きの面積は変わる？ 同じと言える理由は？'),('体験2：直角を崩す','2辺は同じでも、何が変わった？'),('体験3：使える三角形を見つける','補助線の目的は？ 斜辺はどれ？'),('体験4：箱の三角形を取り出す','1回目で求めた辺を、2回目でどう使った？')]
  for k in range(0,4,2):
   b.page('予想して、動かして、説明する',f'Web体験メモ {k//2+1}/2。図と一言で、気づきを残そう。')
   for j,(title,prompt) in enumerate(memos[k:k+2]):
    b.y=135+j*326;b.para(title,size=13);b.para(prompt);b.para('予想：');b.y+=47;b.para('操作して気づいたこと・その理由：');b.y+=100;b.para('次に紙で確かめたいこと：');b.rule(438+j*326)
 b.save()
esc=html.escape;cards=[]
for page_number,l in enumerate(L,1):
 fig=svg(scene(l['figure'],guide=True),l['title'])
 cards.append(f'<article class="concept-card" id="lesson-{l["id"]}"><p class="eyebrow">解説PDF {page_number}ページ</p><h2>{esc(l["title"])}</h2><p>{esc(l["focus"])}</p><figure>{fig}</figure><ol>'+''.join('<li>'+esc(t)+'</li>' for t in l['notes'])+f'</ol><p class="take">{esc(l["take"])}</p></article>')
qs=[]
for q in Q:
 fig=svg(scene(q['figure'],qid=q['id']),f'問{q["id"]}の図');ans=svg(scene(q['figure'],answer=True,qid=q['id']),f'問{q["id"]}の解答図')
 qs.append(f'<article class="q-card" id="q{q["id"]}" tabindex="-1"><div class="q-head"><b>問{q["id"]} · {esc(q["group"])}</b><span class="q-status">未記録</span></div><div class="q-prompt">'+''.join('<p>'+esc(t)+'</p>' for t in re.split(r'(?<=[。？])',q['prompt']) if t)+f'</div><figure>{fig}</figure><details><summary>ヒントを1つ見る</summary><p>{esc(q["hint"])}</p></details><details class="solution"><summary>解答と理由を確認する</summary><p><strong>{esc(q["answer"])}</strong></p><figure>{ans}</figure><ol>'+''.join('<li>'+esc(st)+'</li>' for st in q['steps'])+f'</ol><p>{esc(q["note"])}</p></details><div class="grade interactive">'+''.join(f'<button data-grade="{key}" aria-pressed="false">{label}</button>' for key,label in [('own','自力でできた'),('hint','ヒントでできた'),('review','もう一度')])+'</div></article>')
labs=(R/'materials/pythagorean/labs.html').read_text();labparts=re.findall(r'<section.*?</section>',labs,re.S);assert len(labparts)==4
sections=''.join(card+(labparts[{2:0,5:1,10:2,13:3}[i]] if i in (2,5,10,13) else '') for i,card in enumerate(cards))
nav=''.join(f'<a href="#lesson-{l["id"]}">{i}. {esc(l["title"])}</a>' for i,l in enumerate(L,1))
page=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>三平方の定理 | 家族のまなび帳</title><meta name="description" content="面積から長さへ。平方根・相似・円・二次関数がつながる三平方の定理。紙の3冊・28問と4つの動く体験。"><link rel="icon" href="../../../assets/icon.svg"><link rel="stylesheet" href="../../../assets/family/style.css"><link rel="stylesheet" href="../../../assets/pythagorean/style.css"><script defer src="../../../assets/pythagorean/model.js"></script><script defer src="../../../assets/pythagorean/app.js"></script></head><body><a class="skip" href="#main">本文へスキップ</a><header class="masthead"><a class="brand" href="../../../index.html">家族のまなび帳</a><nav><a href="../../index.html">勉強</a><a href="../../../questions/index.html">日々の疑問</a></nav></header><main class="wrap" id="main"><div class="crumbs"><a href="../index.html">数学</a> / 三平方の定理</div><section class="pythagorean-hero"><p class="eyebrow">MATHEMATICS / 中3</p><h1>三平方。前の学びが、ここでつながる。</h1><p>面積を足して、長さを知る。円の角から、直角を見つける。<br>平方根・方程式・相似・関数が、新しい問題を解く道具になる。</p><div class="actions"><a class="button primary" href="#print">紙の3冊を開く</a><a class="button" href="#rearrange-lab">予想して、動かす</a></div></section><section class="section" id="print"><h2>紙で考え、Webで確かめる</h2><div class="pdf-grid">'''+''.join(f'<a class="button" href="../../../print/pythagorean-{kind}.pdf">{name}<small>{count}ページ</small></a>' for kind,name,count in [('guide','① 解説',17),('workbook','② 問題集 · 28問＋体験メモ',16),('answers','③ 解答・解説',14)])+f'''</div><p class="plan">1回目：問1〜10と体験1・2 ／ 2回目：問11〜20と体験3 ／ 3回目：問21〜25と体験4。問22・26は挑戦問題。問27・28は翌日以降に再挑戦。量は理解に合わせて調整しよう。</p><p class="connection">前の学びへ戻る：<a href="../square-roots/index.html">平方根</a> · <a href="../quadratic-equations/index.html">二次方程式</a> · <a href="../quadratic-functions/index.html">二次関数</a> · <a href="../similarity/index.html">相似</a> · <a href="../circle/index.html">円</a></p></section><noscript><p class="notice">解説・28問・解答・PDFはこのまま使えます。動く体験と学習記録にはJavaScriptが必要です。</p></noscript><div class="lesson-layout"><nav class="toc" aria-label="三平方の目次"><strong>三平方の道しるべ</strong>{nav}<a href="#practice">紙と同じ28問</a><a href="#records">振り返り</a></nav><div class="lesson-body">{sections}<section class="chapter" id="practice"><h2>紙と同じ28問</h2><p>先に紙で考えてから、ヒントや解答を開こう。図の長さの単位は本文の指定に従います。</p>{''.join(qs)}</section><section id="records" class="chapter interactive"><h2>次に確かめたい問題</h2><p id="progress-text"></p><div id="review-links"></div><p id="storage-notice" class="notice" hidden>記録を保存できません。この画面を開いている間は自己評価できます。</p><p class="muted">記録はこの端末・ブラウザだけに保存されます。他の単元とは別です。</p></section></div></div></main><footer class="footer"><span>家族のまなび帳</span><a href="../index.html">数学へ戻る</a></footer></body></html>'''
(R/'study/math/pythagorean/index.html').write_text(page)
