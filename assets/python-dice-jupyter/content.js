const JUPYTER_MISSIONS = [
{title:'100回しゃべるロボット',goal:'繰り返しの回数とせりふを、自分で変える。',concept:'for / print / インデント',predict:'最初の番号は0？ 1？ 最後の番号は？',answer:'range(5)は0、1、2、3、4。5は入らない。i + 1を表示すると1から数えられるよ。',read:[['Scratchの「○回繰り返す」','for i in range(5): は、iを0から4まで変えながら、下の処理を5回する。最後のコロン : を忘れずに。'],['4マス右は「同じ仲間」','printの前に半角スペースを4個置く。これをインデントという。左端に戻したprintは、繰り返しが終わってから1回だけ動く。Tabでも字下げできる。']],cells:[{role:'type',title:'自分で打つ',where:'Notebookのいちばん下に、新しいコードセルを1つ作る。',code:'for i in range(5):\n    print(i, "ピピッ！ぼくはサイコロ係")\n\nprint("案内おわり！")',after:'Shift + Enterで実行。セルのすぐ下に、番号つきの5行と最後の1行が出ればOK。'}],task:'同じセルの5を100に変える。せりふを変え、番号を i + 1 にして、もう一度Shift + Enter。',hints:['回数はrangeの括弧の中。せりふは引用符の中。','forの行は左端。中のprintは4マス右。最後のprintは左端。'],solution:'for i in range(100):\n    print(i + 1, "サイコロが逃げたぞー！")\n\nprint("つかまえた！")',challenge:'最後のprintを右に4マスずらすと？ 予想してから試し、元に戻そう。',done:'せりふと回数を変えた。どこが繰り返されるか説明できる。'},
{title:'サイコロ連打マシン',goal:'乱数と変数を使って、コンピューターに振ってもらう。',concept:'import / 変数 / random',predict:'同じセルを2回実行したら、出目の並びも同じになる？',answer:'ふつうは違う並び。毎回新しく選ぶから。偶然、同じ並びになることもあるよ。',read:[['randomは道具箱','import randomで、ランダムに選ぶ道具を使えるようにする。random.randint(1, 6)は1から6の整数を1つ選ぶ。1も6も含む。'],['=は、値を入れる命令','n = 10はnに10を入れる。faceには毎回、新しい出目を入れる。大文字と小文字は別の名前として扱われるよ。']],cells:[{role:'type',title:'10回振るコードを書く',where:'MISSION 1の下に、新しいコードセルを1つ追加。前のコードは残しておく。',code:'import random\n\nn = 10\nfor i in range(n):\n    face = random.randint(1, 6)\n    print(face)',after:'1〜6の数字が10行出る。もう一度実行すると、前の出力が新しい結果に入れ替わる。'}],task:'nを100に変更。それから12面体に改造してみよう。',hints:['回数を変えるならn。出る目の範囲を変えるならrandintの括弧。','random.randint(1, 12)なら1〜12。次のミッションでは6面体に戻すよ。'],solution:'import random\n\nn = 100\nfor i in range(n):\n    face = random.randint(1, 12)\n    print(face)',challenge:'いきなり1万行を表示するとNotebookが重くなる。1万回の実験は、次の「数えてまとめる」方法で試そう。',done:'回数と、出る目の範囲をそれぞれ変えられた。'},
{title:'ついに、1万回の実験',goal:'6つのカウンターで数え、グラフにする。',concept:'リスト / += / 関数を使う',predict:'1万回振れば、全部の目がぴったり同じ回数になる？',answer:'ならないよ。10000は6で割り切れない。6000回でも1000回ずつになるとは限らない。「同じ確率」は「いつも同じ回数」という意味ではないんだ。',read:[['6つの箱を並べる','counts = [0, 0, 0, 0, 0, 0] は6個の数を並べたリスト。場所の番号は0から。counts[0]が1の目、counts[5]が6の目の回数になる。'],['なぜface - 1？','出目は1〜6、場所の番号は0〜5。だから1を引く。+= 1は「今の数を1増やす」という省略形だよ。'],['見せ方は完成部品に任せる','グラフの長い処理はdice_tools.pyに入っている。読み込む1行と、使う1行だけ書けばよい。どの目が何回出たか数える部分は自分で作る。']],cells:[{role:'copy',title:'完成部品を読み込む',where:'新しいコードセルを1つ追加。この1行はコピーでOK。',code:'from dice_tools import show_graph',after:'何も表示されず、左の [ ] に数字が入れば成功。ModuleNotFoundErrorなら、準備ページで2つのファイルの場所を確かめよう。'},{role:'type',title:'数えるプログラムを書く',where:'その下に、もう1つコードセルを追加。',code:'import random\n\nn = 100\ncounts = [0, 0, 0, 0, 0, 0]\nfor i in range(n):\n    face = random.randint(1, 6)\n    counts[face - 1] += 1\n\nprint("合計:", sum(counts))\nshow_graph(counts)',after:'合計100回のグラフが出る。同じセルのnを10000に変えて実行すれば、1万回の研究ができる！'}],task:'nを10000に変えて、合計が10000か確認。グラフのどの目が多いか見てみよう。',hints:['回数を変えるのは n = 100 の行。','countsを作る行はforの外。forの中に置くと毎回0に戻ってしまう。'],solution:'import random\nfrom dice_tools import show_graph\n\nn = 10000\ncounts = [0, 0, 0, 0, 0, 0]\nfor i in range(n):\n    face = random.randint(1, 6)\n    counts[face - 1] += 1\n\nprint("合計:", sum(counts))\nshow_graph(counts)',challenge:'1回目のグラフを見て、次も同じ目が1位か予想。もう一度実行して確かめよう。',done:'1万回の合計を確かめた。どの目が何回出たか読めた。'},
{title:'確率を、割合で調べる',goal:'100回と1万回を、同じ物差しで比べる。',concept:'割り算 / % / 実験メモ',predict:'100回中20回と、10000回中1700回。6の目の16.7%に近いのはどちら？',answer:'20%と17%なので後者。回数の差ではなく、割合で比べるのがポイント。',read:[['6の回数 ÷ 全部の回数','counts[5] / sum(counts) * 100で、6が出た割合を%で表せる。/が割り算、*が掛け算。sum(counts)は6つの数の合計。'],['多く振れば毎回近づく？','回数が多いほど割合のばらつきは小さくなりやすい。でも追加するたび必ず16.7%に近づくわけではない。回数の差そのものが小さくなるとも限らない。'],['出力は上書きされる','同じセルを実行すると、前の結果が入れ替わる。残したい数字は、下のメモセルに書いてから次の実験をしよう。']],cells:[{role:'type',title:'割合を表示する',where:'MISSION 3の集計セルを実行した後、下に新しいコードセルを作る。',code:'percent = counts[5] / sum(counts) * 100\nprint("6の割合:", round(percent, 1), "%")',after:'round(percent, 1)は小数第1位までに丸める道具。前のセルで集計した結果を使っている。'},{role:'type',title:'結果を残すメモセル',where:'その下に新しいコードセルを1つ作り、#で始まるメモを書く。実行しなくても保存できる。',code:'# 実験メモ\n# 100回・1回目: ここに割合を書く\n# 100回・2回目:\n# 1000回・1回目:\n# 1000回・2回目:\n# 10000回・1回目:\n# 10000回・2回目:',after:'nを変える → 集計セルを実行 → 割合セルを実行 → メモ。nだけ書き換えて実行を忘れると、出目は前の実験のままだよ。'}],task:'MISSION 3のnを100・1000・10000に変え、それぞれ2回試してメモしよう。',hints:['割合セルだけを何回動かしても、新しくサイコロは振られない。','まずfor文のある集計セルを実行し、その後で割合のセルを実行する。'],solution:'percent = counts[5] / sum(counts) * 100\nprint("合計:", sum(counts), "回")\nprint("6の割合:", round(percent, 1), "%")',challenge:'「1万回なら必ず100回より近い」と言い切れるかな？ 1回の結果で決めず、試した結果を全部眺めよう。',done:'集計と割合のセルを順に実行し、比較のメモを残した。'},
{title:'イカサマを仕込め！',goal:'くじの枚数で、出やすさを設計する。',concept:'random.choice / if / ==',predict:'[1,2,3,4,5,6,6]の6の確率は、2/6？ 2/7？',answer:'2/7。リストの場所は7つ。そのうち2つが6だから。種類の数ではなく、くじの枚数を分母にするよ。',read:[['サイコロを、くじの箱にする','random.choice(faces)はリストの場所を同じ確率で選ぶ。6を3個入れた8枚の箱なら、6の確率は3/8で37.5%。'],['もし6なら、もし多ければ','ifはScratchの「もし」。>は「より大きい」、==は「同じか」を調べる。=は値を入れる記号で、意味が違う。']],cells:[{role:'type',title:'くじの箱から1枚ずつ選ぶ',where:'新しいコードセル。MISSION 3の集計をコピーして改造してもOK。',code:'import random\nfrom dice_tools import show_graph\n\nfaces = [1, 2, 3, 4, 5, 6, 6, 6]\ncounts = [0, 0, 0, 0, 0, 0]\nfor i in range(1000):\n    face = random.choice(faces)\n    counts[face - 1] += 1\n\nif counts[5] > 300:\n    print("6があやしい！")\nshow_graph(counts)',after:'6が多くなったかな？ 「300回より多い」は調べる目安で、インチキの証明ではないよ。'}],task:'2・4・6を1個ずつ多く入れて、偶数が出やすいサイコロに改造しよう。',hints:['変えるのはfacesのリスト。1〜6の各目を残しておこう。','偶数の回数は counts[1] + counts[3] + counts[5] でまとめられる。'],solution:'import random\nfrom dice_tools import show_graph\n\nfaces = [1, 2, 2, 3, 4, 4, 5, 6, 6]\ncounts = [0, 0, 0, 0, 0, 0]\nfor i in range(1000):\n    face = random.choice(faces)\n    counts[face - 1] += 1\n\neven = counts[1] + counts[3] + counts[5]\nprint("偶数:", even, "回")\nshow_graph(counts)',challenge:'1のくじを全部消すと、1は絶対出ない。見破りやすい？ 気づきにくいインチキはどう作る？',done:'リストを変えて、出やすさを変えられた。'},
{title:'自分の関数を作ろう',goal:'処理に名前をつけ、ゲームから呼べるようにする。',concept:'def / return / 呼び出し',predict:'def roll():と書いただけで、サイコロは振られる？',answer:'まだ振られない。roll()と呼び出したときに動く。レシピを書くだけでは料理はできないのと似ているね。',read:[['Scratchの「ブロック定義」','def roll():で、rollという道具を作る。関数の中も4マス字下げする。関数の外に戻る行は左端へ。'],['printとreturnは違う','printは画面に表示する。returnは結果を呼び出した場所に渡す。ゲーム側が出目を数えるには、表示するだけでなく結果を返す必要がある。']],cells:[{role:'type',title:'振る処理に名前をつける',where:'新しいコードセルを1つ作る。',code:'import random\n\ndef roll():\n    faces = [1, 2, 3, 4, 5, 6, 6, 6]\n    return random.choice(faces)\n\nprint(roll())',after:'1〜6の数が1つ出れば、関数を呼べた。定義だけでは表示されないよ。'}],task:'最後のprintをfor文に入れて、roll()を10回呼ぼう。',hints:['for i in range(10): は関数の外なので左端から。','その下に4マス字下げして print(roll()) を置く。'],solution:'import random\n\ndef roll():\n    faces = [1, 2, 3, 4, 5, 6, 6, 6]\n    return random.choice(faces)\n\nfor i in range(10):\n    print(roll())',challenge:'returnをprintに変えると、外側のprintにはNoneも出る。「結果を返していない」という印。試したらreturnに戻そう。',done:'関数を作り、呼び出して、結果を受け取れた。'},
{title:'完成！ 友達に渡せるゲーム',goal:'自分のPythonをボタン付きゲームにつなぎ、作品を保存する。',concept:'辞書 / 引数 / 完成部品',predict:'同じサイコロを選んでも、友達の結果が違っていたら故障？',answer:'同じ仕掛けでも出目は毎回変わる。少ない回数から必ず見抜けるゲームではないよ。迷ったら追加で調査し、最後は保留でもOK。',read:[['くじ箱に名前をつける「辞書」','dice_facesは、名前とリストを組にする辞書。{ }の中に「名前: 中身」を並べる。dice_faces["6が好き"]で、その名前のくじ箱を取り出せる。'],['kindは関数に渡す材料','roll(kind)にはゲーム側から「ふつう」などの名前が渡される。その名前のくじ箱から1枚選び、returnで出目を返す。'],['君が作る部分・借りる部分','title・dice_faces・budget・rollが君のルール。ボタンやグラフの長い処理はcreate_gameに任せる。まず構造をコピーし、くじ配置やタイトルは自分で変えよう。']],cells:[{role:'copy',title:'ボタンの準備（必要なときだけ）',where:'まず下のゲームセルを実行。ipywidgetsがないと言われた場合だけ、新しいセルでこの1行を実行。',code:'%pip install ipywidgets',after:'完了したら上のKernelメニュー → Restart Kernel。その後、下のゲームセルを実行。学校や家庭でインストールが制限されていたら、おうちの人に相談しよう。'},{role:'mix',title:'自分のゲームを作る',where:'新しいコードセルにこの骨組みを置く。タイトルとくじ配置は自分で変えよう。',code:'import random\nfrom dice_tools import create_game, save_game\n\ntitle = "サイコロ探偵・ひみつの工場"\nbudget = 200\ndice_faces = {\n    "ふつう": [1, 2, 3, 4, 5, 6],\n    "6が好き": [1, 2, 3, 4, 5, 6, 6, 6],\n    "偶数が好き": [1, 2, 2, 3, 4, 4, 5, 6, 6],\n}\n\ndef roll(kind):\n    return random.choice(dice_faces[kind])\n\ncreate_game(title, roll, budget=budget)',after:'セルの下にボタンが出る。「+10回 調べる」を押して記録が増えれば、君のPythonがゲームを動かしている！'},{role:'type',title:'友達に渡すHTMLを作る',where:'ゲームのセルを実行してから、その下に新しいコードセルを1つ作る。',code:'save_game(title, dice_faces, "my_dice_game.html", budget=budget)',after:'左側の一覧を更新するとmy_dice_game.htmlが増える。右クリック → DownloadでPCに取り出し、ChromeやEdgeなどのブラウザから開こう。JupyterLab内のHTMLプレビューではゲームが動かないことがあるよ。'}],task:'タイトルと「6が好き」のくじ配置を変える → ゲームセルを実行 → 遊んで確認 → HTML保存セルを実行。友達にはHTMLだけ渡そう。',hints:['「6が好き」のリストに6を1個増やしてみよう。名前はそのままにして中身を変える。','前の作品も残すなら、保存セルのファイル名を my_dice_game_v2.html に変える。同じ名前は上書きになる。'],solution:'save_game(title, dice_faces, "my_dice_game_v2.html", budget=budget)',challenge:'6の枚数を減らしたら難しくなる？ budgetを50と500に変えたら？ 1回に1か所だけ変えて、友達に難しさを聞いてみよう。',done:'JupyterLabでゲームを動かし、保存したHTMLをブラウザでも開けた。'}
];

// Substantial projects for learners already comfortable with loops and lists.
const JUPYTER_WORKSHOPS = [
  {
    "title": "実況つき・サイコロ記録マシン",
    "goal": "30回の出目を記録し、6だけ特別な実況を出す。",
    "brief": "forとリストを使って、小さな機能を組み合わせよう。全出目を覚えるhistoryと、実況を出す条件を自分で作る。",
    "steps": [
      "historyという空のリストを用意する。30回振り、毎回の出目を追加する。",
      "6なら特別なせりふ、それ以外なら普通の実況を出す。番号は1から。",
      "最後に「何回振ったか」「6が何回出たか」「最後の5回」を表示する。"
    ],
    "refs": [
      [
        "random.randint(1, 6)",
        "1と6を含む整数を1つ返す。最初にimport randomが必要。"
      ],
      [
        "history.append(face)",
        "リストの末尾に1つ追加するメソッド。history = history.append(face)とは書かない。appendの戻り値はNone。"
      ],
      [
        "len(history) / history.count(6)",
        "lenは要素の数を返す関数。countは指定した値の個数を返すリストのメソッド。"
      ],
      [
        "history[-5:]",
        "末尾から5個を取り出すスライス。元のリストは変わらない。"
      ],
      [
        "f\"{i + 1}回目: {face}\"",
        "f文字列。{ }の中の値を文字に埋め込む。"
      ]
    ],
    "hints": [
      "記録を入れる箱はforの前で1回だけ作る。appendはforの中。",
      "if face == 6: の下に特別な実況、else: の下に普通の実況を書く。"
    ],
    "code": "import random\n\nhistory = []\nfor i in range(30):\n    face = random.randint(1, 6)\n    history.append(face)\n    if face == 6:\n        print(f\"{i + 1}回目: 6！大当たり！\")\n    else:\n        print(f\"{i + 1}回目: {face}。調査を続けよう\")\n\nprint(\"記録数:\", len(history))\nprint(\"6の回数:\", history.count(6))\nprint(\"最後の5回:\", history[-5:])",
    "check": "記録数が30。もう一度実行しても60にならず30。6が出ない実験でもエラーにならない。",
    "remix": "6かどうかの条件を「前と同じ目」に変更して、連続したら実況しよう。最初の1回には前の目がないことに注意。"
  },
  {
    "title": "連続記録を見つけるハンター",
    "goal": "出目の履歴から、同じ目が続いた最長記録を見つける。",
    "brief": "「今の連続回数」と「これまでの最高記録」は別の変数。ゲームのコンボにも使える考え方だよ。まず決まった出目で正しさを確かめ、その後でランダムにする。",
    "steps": [
      "history = [2, 2, 5, 6, 6, 6, 1] を使う。期待する最長記録は3回。",
      "前の目previous、今の連続streak、最高bestを用意する。同じ目ならstreakを増やし、違ったら1に戻す。",
      "bestを更新する。確認後は100回振った履歴に差し替える。"
    ],
    "refs": [
      [
        "None",
        "まだ値がないことを表す。前の出目がない最初はprevious = Noneにする。"
      ],
      [
        "== / =",
        "==は同じかを調べる。=は変数に値を入れる。"
      ],
      [
        "max(best, streak)",
        "2つのうち大きい値を返す。bestへ代入して最高記録を残す。"
      ],
      [
        "history.append(random.randint(1, 6))",
        "内側で選んだ数を、外側のappendへ渡す。"
      ]
    ],
    "hints": [
      "出目が変わった回も、その新しい目の1回目。streakを0に戻すと1回少なくなる。",
      "if/elseの後でbestを更新し、previousに今回のfaceを入れる。"
    ],
    "code": "history = [2, 2, 5, 6, 6, 6, 1]\nprevious = None\nstreak = 0\nbest = 0\nfor face in history:\n    if face == previous:\n        streak += 1\n    else:\n        streak = 1\n    best = max(best, streak)\n    previous = face\n\nprint(\"最長:\", best, \"回連続\")",
    "check": "[2,2,5,6,6,6,1]なら3、[1,2,3]なら1、[6,6,6,6]なら4、空リストなら0。4種類を同じセルで順に試そう。",
    "remix": "MISSION 1の記録を100回にし、実況を消して、そのhistoryを調べよう。最長3回以上なら「コンボ達成！」を表示。"
  },
  {
    "title": "1万回の集計と出目ランキング",
    "goal": "1万回を集計し、同率1位も見落とさず表示する。",
    "brief": "グラフを呼ぶ前に、自分の集計が正しいか確かめよう。1位が2つあるかもしれないので、最大の数を探す作業と、その数の目を拾う作業を分ける。",
    "steps": [
      "基礎例のカウンターで1万回振る。合計と各目の回数を自分で表示する。",
      "maxで最多回数を求め、enumerateで「目」と「回数」を同時に取り出す。",
      "最多と同じ回数の目をwinnersに追加。グラフと見比べる。"
    ],
    "refs": [
      [
        "sum(counts) / max(counts)",
        "合計と最大値を返す。maxは出目ではなく、回数を返す。"
      ],
      [
        "enumerate(counts, start=1)",
        "1から始まる番号と要素をペアで取り出す。for face, count in ...: と受け取る。"
      ],
      [
        "winners.append(face)",
        "1位の目を追加する。同率なら複数の目が入る。"
      ],
      [
        "counts[face - 1] += 1",
        "出目1〜6をリストの場所0〜5に対応させる。"
      ]
    ],
    "hints": [
      "集計forが終わってからmost = max(counts)。winnersは空のリストから始める。",
      "if count == most: のときだけwinnersへfaceを追加する。"
    ],
    "code": "import random\nfrom dice_tools import show_graph\n\nn = 10000\ncounts = [0, 0, 0, 0, 0, 0]\nfor i in range(n):\n    face = random.randint(1, 6)\n    counts[face - 1] += 1\n\nmost = max(counts)\nwinners = []\nfor face, count in enumerate(counts, start=1):\n    print(face, \"の目:\", count, \"回\")\n    if count == most:\n        winners.append(face)\nprint(\"合計:\", sum(counts))\nprint(\"1位の目:\", winners, \"最多回数:\", most)\nshow_graph(counts)",
    "check": "合計が10000。別の確認セルにランキング部分だけコピーし、counts = [3, 1, 3, 0, 2, 1]で1位が[1, 3]になるか確認。",
    "remix": "最下位も同じ方法で探そう。min(counts)が使える。全て同じ回数ならどう表示される？"
  },
  {
    "title": "実験を自動で20回くり返す",
    "goal": "100・1000・10000回の実験を各20回実行し、ぶれを比べる。",
    "brief": "手で何度もセルを動かす仕事をPythonへ渡そう。外側は実験回数の条件、真ん中は20回の再実験、内側は1回ずつのサイコロ。",
    "steps": [
      "nを[100, 1000, 10000]から順に取り出す。各nで20回ずつ新しい実験をする。",
      "毎回カウンターを0に戻す。6の割合を求め、percentsというリストに残す。",
      "各nについて最小・最大・平均を表示し、全結果を実験ノートに残す。"
    ],
    "refs": [
      [
        "for n in [100, 1000, 10000]:",
        "回数の条件を順に変える。外側のforの中に、別のforを書ける。"
      ],
      [
        "min(percents) / max(percents)",
        "その20実験で観測した最小・最大。今後の結果が必ず収まる範囲ではない。"
      ],
      [
        "sum(percents) / len(percents)",
        "数値リストの平均。この例ではリストに20個入っているので割り算できる。"
      ],
      [
        "round(value, 2)",
        "表示用に小数第2位まで丸める。計算途中の元の値は残しておこう。"
      ]
    ],
    "hints": [
      "percentsはnが変わるたび空にする。countsは1実験が始まるたび0にする。",
      "percents.append(...)は1回ずつ振るforの外、20実験のforの中。表示は20実験の外。"
    ],
    "code": "import random\n\nfor n in [100, 1000, 10000]:\n    percents = []\n    for trial in range(20):\n        counts = [0, 0, 0, 0, 0, 0]\n        for i in range(n):\n            face = random.randint(1, 6)\n            counts[face - 1] += 1\n        percent = counts[5] / sum(counts) * 100\n        percents.append(percent)\n    average = sum(percents) / len(percents)\n    print(\"1実験\", n, \"回 / 実験数\", len(percents))\n    print(\"最小:\", round(min(percents), 2))\n    print(\"最大:\", round(max(percents), 2))\n    print(\"平均:\", round(average, 2))\n    print(\"20回の記録:\", percents)",
    "check": "条件ごとに20個の割合がある。目標は100 / 6 ≒ 16.67%。大きいnほど広がりが小さくなる傾向を探そう。今回の20回で必ずそうなるとは限らない。",
    "remix": "最大と最小の差も表示しよう。同じ実験をもう一度行い、結論がどのくらい安定しているかメモする。"
  },
  {
    "title": "イカサマ設計図と理論値",
    "goal": "3種類のくじ箱を辞書にまとめ、設計上の確率と実測を比べる。",
    "brief": "1つの結果だけで判断せず、仕組みから計算した確率と、実際に出た割合を並べよう。この設計図は最後のゲームにも使える。",
    "steps": [
      "3種類の名前とくじ箱をdice_facesという辞書へ入れる。",
      "itemsで名前と中身を順に取り出し、各種類を1000回振る。",
      "6のくじ枚数÷全部の枚数を計算。実測との差も表示する。"
    ],
    "refs": [
      [
        "{\"ふつう\": [1, 2, 3, 4, 5, 6]}",
        "辞書は名前（キー）と中身（値）の組。ここでは名前が文字列、中身がリスト。"
      ],
      [
        "dice_faces.items()",
        "キーと値の組を取り出す。for kind, faces in dice_faces.items(): と使う。"
      ],
      [
        "faces.count(6) / len(faces)",
        "くじの全枚数のうち6が占める割合。6が3枚、全部8枚なら3/8。"
      ],
      [
        "abs(measured - expected)",
        "差の大きさ。absは負の数も正の大きさにする。"
      ]
    ],
    "hints": [
      "くじ箱が変わるたびcountsを0に戻す。random.choice(faces)で、その種類の箱から選ぶ。",
      "理論値はfacesから、実測はcountsから求める。両方を100倍して%で比較。"
    ],
    "code": "import random\n\ndice_faces = {\n    \"ふつう\": [1, 2, 3, 4, 5, 6],\n    \"6が好き\": [1, 2, 3, 4, 5, 6, 6, 6],\n    \"偶数が好き\": [1, 2, 2, 3, 4, 4, 5, 6, 6],\n}\nfor kind, faces in dice_faces.items():\n    counts = [0, 0, 0, 0, 0, 0]\n    for i in range(1000):\n        face = random.choice(faces)\n        counts[face - 1] += 1\n    expected = faces.count(6) / len(faces) * 100\n    measured = counts[5] / sum(counts) * 100\n    print(kind)\n    print(\"6の理論値:\", round(expected, 2), \"%\")\n    print(\"6の実測:\", round(measured, 2), \"%\")\n    print(\"差:\", round(abs(measured - expected), 2), \"ポイント\")",
    "check": "6の理論値は、ふつう約16.67%、6が好き37.5%、偶数が好き約22.22%。実測は毎回違ってよい。",
    "remix": "偶数の理論値と実測も追加。くじの2・4・6の枚数を合計する。「6だけを見る」と「偶数をまとめる」で何が見えやすい？"
  },
  {
    "title": "調査と推理を関数にする",
    "goal": "引数を受け取る調査関数と、理由つきの推理関数を自分で作る。",
    "brief": "関数は短くするためだけでなく、仕事を分ける道具。調査は回数リストを返し、推理はそのリストを受け取って文章を返す。",
    "steps": [
      "investigate(faces, n)を定義し、n回振ったcountsをreturnする。",
      "judge(counts)を定義。0回なら未調査、6が30%以上なら6が好き、偶数が60%以上なら偶数が好き、それ以外は保留。",
      "決まったcountsで分岐を確認してから、調査結果をjudgeへ渡す。"
    ],
    "refs": [
      [
        "def investigate(faces, n):",
        "facesとnは引数。呼び出すときに材料を渡す。関数内のcountsは外から直接使わずreturnで受け取る。"
      ],
      [
        "return counts",
        "結果を呼び出し元へ返し、その回の関数を終える。forの内側だと1回で終わるので注意。"
      ],
      [
        "if / elif / else",
        "上から条件を確認。最初に当てはまった枝が選ばれる。"
      ],
      [
        "judge(counts)",
        "ここで作る独自の道具。Pythonに最初から入っている関数ではない。"
      ]
    ],
    "hints": [
      "n=0でもcountsを返せる。judgeでは合計0を先に調べ、0で割らないようにする。",
      "6の割合はcounts[5] / total。偶数はcounts[1] + counts[3] + counts[5]。"
    ],
    "code": "import random\n\ndef investigate(faces, n):\n    counts = [0, 0, 0, 0, 0, 0]\n    for i in range(n):\n        face = random.choice(faces)\n        counts[face - 1] += 1\n    return counts\n\ndef judge(counts):\n    total = sum(counts)\n    if total == 0:\n        return \"未調査\"\n    six_rate = counts[5] / total\n    even_rate = (counts[1] + counts[3] + counts[5]) / total\n    if six_rate >= 0.30:\n        return \"6が好き？ 6が30%以上\"\n    elif even_rate >= 0.60:\n        return \"偶数が好き？ 偶数が60%以上\"\n    else:\n        return \"保留。まだ決めない\"\n\ncounts = investigate([1, 2, 3, 4, 5, 6, 6, 6], 200)\nprint(counts)\nprint(judge(counts))",
    "check": "judge([0,0,0,0,0,0])は未調査、[0,0,0,0,0,10]は6が好き？、[0,5,0,5,0,0]は偶数が好き？、[1,1,1,1,1,1]は保留。これは自作の目安で、証明や正解保証ではない。",
    "remix": "30%と60%を変えると、公平なサイコロを疑う回数は変わる？ investigateを20回呼んで誤判定を調べよう。保留は「公平と証明した」という意味ではない。"
  },
  {
    "title": "ルールを調整して、友達に挑戦状",
    "goal": "自作の調査関数で難しさを調べ、遊べるゲームに仕上げる。",
    "brief": "画面は完成部品に任せ、くじ配置と調査予算は自分で設計する。まず50回と200回で何度も調査してから、友達に渡すルールを決めよう。",
    "steps": [
      "MISSION 6の関数セルを実行。下の比較コードで各種類を20試合ずつ、予算50回・200回で調べる。",
      "表示された推理を見て、くじ配置を調整する。保留や間違いが出ることも含めて難しさを考える。",
      "この下の「ゲームを作る」手順で、決めたdice_facesとbudgetをゲームセルへ反映。実行し、HTML保存セルも再実行する。"
    ],
    "refs": [
      [
        "dice_faces.items()",
        "3種類の設計を順番に試す。ゲーム側の名前は「ふつう」「6が好き」「偶数が好き」を使う。"
      ],
      [
        "results.append(judge(counts))",
        "調査結果を推理関数へ渡し、その文章をリストに保存する。"
      ],
      [
        "results.count(\"保留。まだ決めない\")",
        "同じ文章がいくつあるかを数える。結果の正解数ではなく、保留した回数。"
      ],
      [
        "create_game(title, roll, budget=budget)",
        "rollは関数そのものを渡す。roll()と書いて今呼ぶのとは違う。budget=は引数名を指定して渡す書き方。"
      ]
    ],
    "hints": [
      "比較コードはMISSION 6の後に新しいセルで実行。NameErrorならinvestigateとjudgeの定義セルを実行する。",
      "HTMLにはdice_facesとbudgetが保存される。judgeの自動推理は書き出されない。友達自身が推理するゲームだよ。"
    ],
    "code": "# 先にMISSION 6の関数セルを実行する\n# この設計を下のゲームセルにも使う\n\ndice_faces = {\n    \"ふつう\": [1, 2, 3, 4, 5, 6],\n    \"6が好き\": [1, 2, 3, 4, 5, 6, 6, 6],\n    \"偶数が好き\": [1, 2, 2, 3, 4, 4, 5, 6, 6],\n}\nfor budget in [50, 200]:\n    for kind, faces in dice_faces.items():\n        results = []\n        for trial in range(20):\n            counts = investigate(faces, budget)\n            results.append(judge(counts))\n        print(\"予算:\", budget, \"仕掛け:\", kind)\n        print(results)\n        print(\"保留:\", results.count(\"保留。まだ決めない\"), \"試合\")",
    "check": "各予算×3種類で6組の結果、それぞれ20試合。HTML完成後は新しい事件・追加調査・推理・答え合わせを試す。Notebookも保存する。",
    "remix": "友達に「どの記録を根拠に推理した？」と聞こう。1人の1試合だけで難しさを決めず、くじ配置を1か所ずつ変えてv2を作ろう。"
  }
];
JUPYTER_MISSIONS.forEach((mission, i) => { mission.foundationTitle = mission.title; mission.title = JUPYTER_WORKSHOPS[i].title; mission.goal = JUPYTER_WORKSHOPS[i].goal; mission.workshop = JUPYTER_WORKSHOPS[i]; mission.done = JUPYTER_WORKSHOPS[i].check; });
