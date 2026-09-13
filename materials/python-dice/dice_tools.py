"""サイコロ探偵の完成部品。dice_lab.ipynbと同じフォルダに置こう。

自分で書くのは、サイコロのルール・集計・関数。
このファイルは、グラフ・ボタン・HTML書き出しを受け持つ。
標準ライブラリ + JupyterのIPythonで動き、ボタン版だけipywidgetsが必要。
"""
import html
import json
import math
import random
from pathlib import Path

KINDS = ("ふつう", "6が好き", "偶数が好き")


def _counts(values):
    values = list(values)
    if len(values) != 6 or any(type(x) is not int or x < 0 for x in values):
        raise ValueError("0以上の整数が6つ入ったリストを渡そう")
    return values


def _chart_html(counts):
    counts = _counts(counts)
    total, peak = sum(counts), max(1, *counts)
    rows = []
    for face, count in enumerate(counts, 1):
        percent = count / total * 100 if total else 0
        rows.append(
            f'<div style="display:grid;grid-template-columns:30px 1fr 120px;gap:10px;align-items:center;margin:8px 0">'
            f'<b>{face}</b><div style="background:#edf0f8;border-radius:5px"><div style="width:{count/peak*100:.2f}%;height:18px;background:#6554ce;border-radius:5px"></div></div>'
            f'<span>{count:,}回 / {percent:.1f}%</span></div>'
        )
    return '<div style="max-width:640px;color:#1b2440;background:#fff;padding:18px;border:1px solid #dce1ed;border-radius:12px;font:16px/1.8 sans-serif">' + f'<b>合計 {total:,}回</b>' + ''.join(rows) + '<small>公平なら各目の目安は約16.7%。棒の高さではなく、割合で比べよう。</small></div>'


def show_graph(counts):
    """6つの回数を横棒グラフで表示する。"""
    from IPython.display import HTML, display
    display(HTML(_chart_html(counts)))


class _Detective:
    """ボタンから呼ぶゲーム本体。"""
    def __init__(self, title, roller, budget):
        if not callable(roller):
            raise TypeError("2番目にはrollを渡そう。roll()ではなく、関数の名前だけだよ")
        if type(budget) is not int or not 10 <= budget <= 10000:
            raise ValueError("budgetは10〜10000の整数にしよう")
        self.title, self.roller, self.budget = str(title)[:80], roller, budget
        self.new_case()

    def new_case(self):
        self.kind = random.choice(KINDS)
        self.counts = [0] * 6
        self.ended = False
        self.verdict = None

    def sample(self, n):
        if self.ended:
            return
        if type(n) is not int or n < 0:
            raise ValueError("回数は0以上の整数にしよう")
        updated = self.counts[:]
        for _ in range(min(n, self.budget - sum(updated))):
            face = self.roller(self.kind)
            if type(face) is not int or not 1 <= face <= 6:
                raise ValueError("rollは1〜6の整数をreturnしよう")
            updated[face - 1] += 1
        self.counts = updated

    def guess(self, choice):
        if choice not in (*KINDS, "保留"):
            raise ValueError("3つの候補か『保留』から選ぼう")
        if self.ended:
            return
        if not sum(self.counts):
            raise ValueError("まず10回調べてみよう")
        self.ended = True
        self.verdict = (choice, self.kind, choice == self.kind)


def create_game(title, roller, budget=200):
    """JupyterLabにボタン付きのゲームを表示。出目は渡されたPython関数で決まる。"""
    try:
        import ipywidgets as widgets
    except ImportError:
        raise ImportError("新しいセルで %pip install ipywidgets を実行し、Kernel → Restart Kernel の後に上からセルを実行しよう") from None
    from IPython.display import HTML, display
    game = _Detective(title, roller, budget)
    chart = widgets.HTML()
    message = widgets.HTML()
    sample_buttons = [widgets.Button(description=f"+{n}回 調べる") for n in (10, 50, 100)]
    choices = widgets.Dropdown(options=(*KINDS, "保留"), description="推理:")
    answer = widgets.Button(description="答え合わせ", button_style="primary")
    again = widgets.Button(description="新しい事件")

    def render():
        total = sum(game.counts)
        even = (game.counts[1] + game.counts[3] + game.counts[5]) / total * 100 if total else 0
        chart.value = f'<h3>{html.escape(game.title)}</h3><p>調査 {total} / {game.budget}回。偶数の割合 {even:.1f}%</p>' + _chart_html(game.counts)
        for button in sample_buttons:
            button.disabled = game.ended or total >= game.budget
        answer.disabled = game.ended or total == 0
        choices.disabled = game.ended
        if game.verdict:
            chosen, kind, correct = game.verdict
            result = "保留も大切な判断。" if chosen == "保留" else "正体を見抜いた！" if correct else "今回は予想と違った！"
            message.value = f'<p><b>{result}</b> 仕込まれていた正体は「{html.escape(kind)}」。</p><p>公平でも偶然偏る。少ない結果から必ず見抜けるとは限らないよ。</p>'

    def sample(n):
        try:
            game.sample(n)
            message.value = ""
        except Exception as exc:
            message.value = f'<p style="color:#a3322a">{html.escape(type(exc).__name__ + ": " + str(exc))}</p><p>roll関数を確認して、ゲームのセルをもう一度実行しよう。</p>'
        render()

    for button, n in zip(sample_buttons, (10, 50, 100)):
        button.on_click(lambda _, n=n: sample(n))

    def guess(_):
        game.guess(choices.value)
        render()

    def new(_):
        game.new_case()
        message.value = ""
        render()

    answer.on_click(guess)
    again.on_click(new)
    render()
    display(widgets.VBox([chart, widgets.HBox(sample_buttons), choices, widgets.HBox([answer, again]), message]))
    return None


def save_game(title, dice_faces, filename="my_dice_game.html", budget=200):
    """くじ配置をブラウザ用ゲームに書き出す。ファイル1つでオフラインでも遊べる。

    roll関数の任意のPython処理を変換する機能ではない。
    この教材の『dice_facesから1枚を均等に選ぶ』ルールをHTML版に保存する。
    """
    if type(budget) is not int or not 10 <= budget <= 10000:
        raise ValueError("budgetは10〜10000の整数にしよう")
    if not isinstance(dice_faces, dict) or set(dice_faces) != set(KINDS):
        raise ValueError("dice_facesには『ふつう』『6が好き』『偶数が好き』の3つを用意しよう")
    bags = {}
    for kind in KINDS:
        bag = list(dice_faces[kind])
        if not 1 <= len(bag) <= 10000 or any(type(x) is not int or not 1 <= x <= 6 for x in bag):
            raise ValueError("各くじ箱には1〜6の整数を1〜10000個入れよう")
        bags[kind] = bag
    path = Path(filename)
    if path.suffix.lower() != '.html':
        raise ValueError("ファイル名は .html で終わる名前にしよう")
    if not path.parent.exists():
        raise ValueError("保存先フォルダが見つからないよ。まず my_dice_game.html の名前だけで保存しよう")
    data = json.dumps({"title": str(title)[:80], "bags": bags, "budget": budget}, ensure_ascii=False).replace('<', '\\u003c')
    page = _GAME_HTML.replace('/*__DICE_DATA__*/', data)
    path.write_text(page, encoding='utf-8')
    print("保存できたよ:", path.resolve())
    print("JupyterLab左側の一覧を更新して、このHTMLを右クリック → Download。PCでChromeやEdgeなどのブラウザから開こう。")
    print("同じ名前で実行すると上書き。前の作品を残すなら my_dice_game_v2.html のように名前を変えよう。")
    return None


_GAME_HTML = r'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>サイコロ探偵</title><style>
*{box-sizing:border-box}body{margin:0;background:#f0f3fa;color:#1b2440;font:17px/1.8 system-ui,sans-serif}main{max-width:740px;margin:auto;padding:24px 18px}header{background:#1b2440;color:white;padding:22px;border-radius:16px}h1{font-size:27px;line-height:1.5;overflow-wrap:anywhere}header small{color:#e4ff66}.card{background:white;border:1px solid #dce1ed;border-radius:16px;padding:22px;margin-top:18px}button,select{font:inherit;padding:10px 14px;border:1px solid #c9cede;background:white;border-radius:9px;cursor:pointer;color:#1b2440}button:hover:enabled{background:#e4ff66}button:disabled{opacity:.45;cursor:not-allowed}.buttons{display:flex;flex-wrap:wrap;gap:10px;margin:15px 0}.row{display:grid;grid-template-columns:22px 1fr 115px;gap:10px;align-items:center;margin:10px 0}.track{background:#edf0f8;border-radius:5px}.bar{height:22px;background:#6554ce;border-radius:5px}.row span{font-size:14px}.note{font-size:14px;color:#5b6580}.verdict{background:#eff8d6;padding:18px;border-radius:12px;margin-top:16px}button:focus-visible,select:focus-visible{outline:3px solid #6554ce;outline-offset:2px}@media(max-width:440px){.card{padding:17px}.row{grid-template-columns:20px 1fr 96px;gap:7px}.row span{font-size:13px}}
</style></head><body><main><header><small>PYTHONで作った / DICE DETECTIVE</small><h1 id="title"></h1><p>出目を調べて、サイコロの正体を見抜こう。</p></header><section class="card"><p id="stats" role="status"></p><div id="chart"></div><div class="buttons" id="samples"></div><p class="note">公平なら各目の目安は約16.7%。同じ確率でも、出る回数は毎回変わるよ。</p><label for="choice">君の推理：</label><select id="choice"><option>ふつう</option><option>6が好き</option><option>偶数が好き</option><option>保留</option></select><div class="buttons"><button id="answer">答え合わせ</button><button id="new">新しい事件</button></div><div id="verdict" role="status"></div></section><p class="note">仕掛けは作者が決めたくじ配置。HTML版はその配置から選ぶブラウザ用ゲームです。インストール・ネット接続・ログインは不要。仕掛けはファイルに入っているので、本気の秘密を守る仕組みではありません。</p></main><script>
const DATA = /*__DICE_DATA__*/;
const kinds=Object.keys(DATA.bags),$=s=>document.querySelector(s);
let secret,counts,ended;
$('#title').textContent=DATA.title;document.title=DATA.title;
for(const n of [10,50,100]){const b=document.createElement('button');b.textContent=`+${n}回 調べる`;b.onclick=()=>{if(ended)return;const times=Math.min(n,DATA.budget-counts.reduce((a,b)=>a+b,0)),bag=DATA.bags[secret];for(let i=0;i<times;i++)counts[bag[Math.floor(Math.random()*bag.length)]-1]++;render();};$('#samples').append(b);}
function render(){const total=counts.reduce((a,b)=>a+b,0),max=Math.max(1,...counts),even=total?(counts[1]+counts[3]+counts[5])/total*100:0;$('#stats').textContent=`調査 ${total} / ${DATA.budget}回 ｜ 偶数 ${even.toFixed(1)}%`;$('#chart').innerHTML=counts.map((n,i)=>`<div class="row"><b>${i+1}</b><div class="track"><div class="bar" style="width:${n/max*100}%"></div></div><span>${n}回 / ${total?(n/total*100).toFixed(1):'0.0'}%</span></div>`).join('');$('#samples').querySelectorAll('button').forEach(b=>b.disabled=ended||total>=DATA.budget);$('#answer').disabled=ended||total===0;$('#choice').disabled=ended;}
function newCase(){secret=kinds[Math.floor(Math.random()*kinds.length)];counts=[0,0,0,0,0,0];ended=false;$('#verdict').textContent='';$('#verdict').className='';render();}
$('#answer').onclick=()=>{if(ended)return;ended=true;const choice=$('#choice').value;$('#verdict').className='verdict';$('#verdict').textContent=(choice==='保留'?'保留も大切な判断。':choice===secret?'正体を見抜いた！':'今回は予想と違った！')+` 仕込まれていた正体は「${secret}」。公平でも偶然偏るので、必ず見抜けるわけではないよ。`;render();};$('#new').onclick=newCase;newCase();
</script></body></html>'''
