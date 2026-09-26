"""Generate circle lesson and three print books from reviewed shared content."""
import json,re,html,argparse
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from fontTools.ttLib import TTFont as Font
from circle_figures import scene,svg,INK,BLUE,BROWN,GRAY,LIGHT
R=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--font',required=True);args=p.parse_args()
pdfmetrics.registerFont(TTFont('JP',args.font));cmap=Font(args.font).getBestCmap()
D=json.loads((R/'materials/circle/content.json').read_text());L=D['lessons'];Q=D['questions'];W,H=595.276,841.89
class Book:
 def __init__(self,kind,name):self.c=canvas.Canvas(str(R/f'print/circle-{kind}.pdf'),pagesize=(W,H),invariant=1);self.c.setTitle(name);self.c.setAuthor('家族のまなび帳');self.name=name;self.n=0;self.y=0
 def text(self,s,x,y,size=11,col=INK):
  assert all(ord(t) in cmap for t in s),(s,'missing glyph');self.c.setFont('JP',size);self.c.setFillColor(HexColor(col));self.c.drawString(x,H-y-size,s)
 def para(self,s,x=44,width=507,size=11,leading=19,col=INK):
  atoms=re.findall(r'[A-Za-z0-9∠△∽√²°=+−×÷/：↔.]+|.',s);line=''
  for i,t in enumerate(atoms):
   extra=atoms[i+1] if i+1<len(atoms) and atoms[i+1] in '。、）」' else ''
   if line and pdfmetrics.stringWidth(line+t+extra,'JP',size)>width:self.text(line,x,self.y,size,col);self.y+=leading;line=t
   else:line+=t
  self.text(line,x,self.y,size,col);self.y+=leading+7
 def page(self,title,lead):
  if self.n:self.c.showPage()
  self.n+=1;self.text(self.name,44,25,9,GRAY);self.text(title,44,55,19);self.text(lead,44,90,9,GRAY);self.rule(112);self.text('中3 数学 | 円',44,807,8,GRAY);self.text(str(self.n),535,807,8,GRAY);self.y=129
 def rule(self,y):self.c.setStrokeColor(HexColor(LIGHT));self.c.setLineWidth(.7);self.c.line(44,H-y,551,H-y)
 def fig(self,f,x,y,width=507,answer=False,guide=False,qid=0):
  scale=width/550
  for t in scene(f,answer,guide,qid):
   if t[0]=='text':
    _,xx,yy,s,size,c=t;size=max(size,18) if width<300 else size;self.text(s,x+xx*scale,y+(yy-size)*scale,size*scale,c)
   else:
    if t[0]=='line':_,a,z,c,w,dash=t;pts=[a,z]
    else:_,pts,c,w,dash=t
    self.c.setStrokeColor(HexColor(c));self.c.setLineWidth(w*scale);self.c.setDash([float(v)*scale for v in dash.split()] if dash else [])
    path=self.c.beginPath()
    for i,(xx,yy) in enumerate(pts):(path.moveTo if i==0 else path.lineTo)(x+xx*scale,H-y-yy*scale)
    self.c.drawPath(path);self.c.setDash([])
 def save(self):self.c.save();print(self.name,self.n,'pages')
b=Book('guide','円 ① 解説')
for l in L:
 b.page(l['title'],'対応する問題：'+ '・'.join(str(n) for n in l['questions'])+'。図の対象をたどりながら読もう。')
 b.para(l['focus'],size=12,leading=22);top=b.y+10;b.fig(l['figure'],44,top,507,guide=True);b.y=top+322
 for i,note in enumerate(l['notes']):b.text(str(i+1),44,b.y,12,BLUE);b.para(note,x=69,width=480,size=12,leading=22);b.y+=7
 b.rule(b.y+5);b.y+=19;b.para(l['take'],size=11,leading=20);assert b.y<787,(l['id'],b.y)
b.save()
for kind,name in [('workbook','円 ② 問題集'),('answers','円 ③ 解答と解説')]:
 b=Book(kind,name)
 for k in range(0,24,2):
  b.page(Q[k]['group']+f' | 問{k+1}〜{k+2}','紙の図に印を付け、途中式と理由を書こう。' if kind=='workbook' else '同じページ番号の問題集と見比べよう。図・途中式・理由をつなぐ。')
  for j,q in enumerate(Q[k:k+2]):
   start=129+j*326;b.y=start;b.text(f'問 {q["id"]:02d}',44,start,12,BLUE);b.y+=24
   if kind=='workbook':
    for s in re.split(r'(?<=[。？])',q['prompt']):
     if s:b.para(s,size=10.5,leading=17);b.y-=3
    top=b.y+6
    if q['figure']:b.fig(q['figure'],24,top,280,qid=q['id']);b.text('途中式・理由',321,top,9,GRAY)
    else:b.text('図・途中式・理由',44,top,9,GRAY)
    assert top+(174 if q['figure'] else 70)<start+276,(q['id'],top,start)
    b.text('答え：',321 if q['figure'] else 44,start+281,10);b.rule(start+305);b.text('□ 自力でできた    □ ヒントでできた    □ もう一度',44,start+312,8,GRAY)
   else:
    b.para(q['answer'],size=12,leading=19);top=b.y+5;b.fig(q['figure'],24,top,280,answer=True,qid=q['id']);b.y=top
    for i,s in enumerate(q['steps']):b.text(str(i+1),306,b.y,10,BLUE);b.para(s,x=325,width=226,size=10.5,leading=17)
    b.y=max(b.y,top+174)+4;b.rule(b.y);b.y+=8;b.para('確認：'+q['note'],size=9.5,leading=16);assert b.y<start+319,(q['id'],b.y,start)
 if kind=='workbook':
  b.page('予想して、動かして、説明する','Web体験メモ。数字が合うだけでなく、理由を一言残そう。')
  for i,(title,prompt) in enumerate([('体験1：同じ弧・反対側','Pを動かすと？ 反対側へ移すと？'),('体験2：半径を引いて理由を探す','足す配置・引く配置では、どの角を使う？'),('体験3：直角の点が集まる場所','内側・円周上・外側では、90°と比べてどうなる？')]):
   b.y=130+i*213;b.para(title,size=13);b.para(prompt);b.para('予想：');b.y+=32;b.para('操作して気づいたこと・その理由：')
 b.save()
esc=html.escape
cards=[]
for l in L:
 fig=svg(scene(l['figure'],guide=True),l['title'])
 cards.append(f'<article class="concept-card" id="lesson-{l["id"]}"><p class="eyebrow">解説PDF {l["id"]}ページ</p><h2>{esc(l["title"])}</h2><p>{esc(l["focus"])}</p><figure>{fig}</figure><ol>'+''.join('<li>'+esc(t)+'</li>' for t in l['notes'])+f'</ol><p class="take">{esc(l["take"])}</p></article>')
qs=[]
for q in Q:
 fig=svg(scene(q['figure'],qid=q['id']),f'問{q["id"]}の図') if q['figure'] else ''
 ans=svg(scene(q['figure'],answer=True,qid=q['id']),f'問{q["id"]}の解答図')
 qs.append(f'<article class="q-card" id="q{q["id"]}" tabindex="-1"><div class="q-head"><b>問{q["id"]} · {esc(q["group"])}</b><span class="q-status">未記録</span></div><div class="q-prompt">'+''.join('<p>'+esc(t)+'</p>' for t in re.split(r'(?<=[。？])',q['prompt']) if t)+f'</div><figure>{fig}</figure><details><summary>ヒントを1つ見る</summary><p>{esc(q["hint"])}</p></details><details class="solution"><summary>解答と理由を確認する</summary><p><strong>{esc(q["answer"])}</strong></p><figure>{ans}</figure><ol>'+''.join('<li>'+esc(s)+'</li>' for s in q['steps'])+f'</ol><p>{esc(q["note"])}</p></details><div class="grade interactive">'+''.join(f'<button data-grade="{key}" aria-pressed="false">{label}</button>' for key,label in [('own','自力でできた'),('hint','ヒントでできた'),('review','もう一度')])+'</div></article>')
labs=(R/'materials/circle/labs.html').read_text();labparts=re.findall(r'<section.*?</section>',labs,re.S);assert len(labparts)==3
sections=''.join(card+(labparts[{2:0,5:1,7:2}[i]] if i in (2,5,7) else '') for i,card in enumerate(cards))
nav=''.join(f'<a href="#lesson-{l["id"]}">{l["id"]}. {esc(l["title"])}</a>' for l in L)
page=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>円と円周角 | 家族のまなび帳</title><meta name="description" content="円周角を、弧と二等辺三角形から理解する中3数学教材。紙の3冊・24問と3つの動く体験。"><link rel="icon" href="../../../assets/icon.svg"><link rel="stylesheet" href="../../../assets/family/style.css"><link rel="stylesheet" href="../../../assets/circle/style.css"><script defer src="../../../assets/circle/model.js"></script><script defer src="../../../assets/circle/app.js"></script></head><body><a class="skip" href="#main">本文へスキップ</a><header class="masthead"><a class="brand" href="../../../index.html">家族のまなび帳</a><nav><a href="../../index.html">勉強</a><a href="../../../questions/index.html">日々の疑問</a></nav></header><main class="wrap" id="main"><div class="crumbs"><a href="../index.html">数学</a> / 円</div><section class="circle-hero"><p class="eyebrow">MATHEMATICS / 中3</p><h1>円。動く点、変わらない角。</h1><p>どの弧を見ている？ 半径を引いたら何が見える？<br>相似で育てた「等しい角を探す力」を、円の中で使おう。</p><div class="actions"><a class="button primary" href="#print">紙の3冊を開く</a><a class="button" href="#move-lab">予想して、動かす</a></div></section><section class="section" id="print"><h2>紙で考え、Webで確かめる</h2><div class="pdf-grid">'''+''.join(f'<a class="button" href="../../../print/circle-{kind}.pdf">{name}<small>{count}ページ</small></a>' for kind,name,count in [('guide','① 解説',12),('workbook','② 問題集 · 24問＋体験メモ',13),('answers','③ 解答・解説',12)])+f'''</div><p class="plan">1回目：問1〜8と体験1 ／ 2回目：問9〜16と体験2・3 ／ 3回目：問17〜22。問23・24は翌日以降に再挑戦。各回の量は理解に合わせて調整しよう。</p><p>前の学び：<a href="../similarity/index.html">相似</a> · <a href="../square-roots/index.html">平方根</a> · <a href="../quadratic-equations/index.html">二次方程式</a> · <a href="../quadratic-functions/index.html">二次関数</a></p></section><noscript><p class="notice">解説・24問・解答・PDFはこのまま使えます。動く体験と学習記録にはJavaScriptが必要です。</p></noscript><div class="lesson-layout"><nav class="toc" aria-label="円の目次"><strong>円の道しるべ</strong>{nav}<a href="#practice">紙と同じ24問</a><a href="#records">振り返り</a></nav><div class="lesson-body">{sections}<section class="chapter" id="practice"><h2>紙と同じ24問</h2><p>先に紙で考えてから、ヒントや解答を開こう。</p>{''.join(qs)}</section><section id="records" class="chapter interactive"><h2>次に確かめたい問題</h2><p id="progress-text"></p><div id="review-links"></div><p id="storage-notice" class="notice" hidden>記録を保存できません。この画面を開いている間は自己評価できます。</p><p class="muted">記録はこの端末・ブラウザだけに保存されます。他の単元とは別です。</p></section></div></div></main><footer class="footer"><span>家族のまなび帳</span><a href="../index.html">数学へ戻る</a></footer></body></html>'''
(R/'study/math/circle/index.html').write_text(page)
