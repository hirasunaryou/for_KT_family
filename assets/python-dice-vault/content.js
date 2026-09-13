const VAULT_LESSONS = [
  {
    "title": "宝を覚える、状態の設計",
    "tag": "辞書 / コピー / 関数の分担",
    "goal": "「今どうなっているか」を辞書にまとめ、出目で次の状態を作る。",
    "brief": "最初は乱数を使わない。4、6、1を順に渡して、宝が4→10→0になる小さなエンジンを作ろう。出目を指定できると、直したい場面を何度でも再現できる。",
    "spec": [
      "new_game()は新しいゲームの辞書を返す。下の設計図を使ってよい。",
      "collect(state, face)は1ならpotを0にし、2〜6ならpotへ加算する。",
      "渡したstateは変えず、新しい辞書を返す。元の結果と次の結果を比べられるようにする。"
    ],
    "ideas": [
      [
        "状態はゲームの記憶",
        "scoreは金庫、potは持ち歩いている宝。turnは今の挑戦番号。limit回まで挑戦でき、持ち帰るか失敗すると次の挑戦へ進む。shieldsは装備数。statusはplaying / won / lost。"
      ],
      [
        "a = stateではコピーにならない",
        "同じ辞書に別名をつけているだけ。dict(state)で別の辞書を作る。今回は値が整数と文字列なのでこれで十分。リストの持ち物を入れる改造では、その中身までコピーされない点に注意。"
      ]
    ],
    "tools": [
      [
        "dict(state)",
        "辞書の浅いコピー。元の辞書を直接書き換えないために使う。"
      ],
      [
        "s[\"pot\"] += face",
        "名前で値を取り出して増やす。リストの番号ではなく辞書のキー。"
      ],
      [
        "return s",
        "更新した結果を返す。呼び出し側でもstate = collect(...)と受け取る。"
      ]
    ],
    "starter": "def new_game(target=60, limit=8):\n    return {\n        \"score\": 0, \"pot\": 0, \"turn\": 1,\n        \"target\": target, \"limit\": limit,\n        \"shields\": 0, \"status\": \"playing\",\n        \"message\": \"宝を集めよう！\",\n    }\n\ndef collect(state, face):\n    # コピー → 出目で更新 → 結果を返す\n    raise NotImplementedError(\"ここを自分で作ろう\")",
    "hints": [
      "コピーした辞書をresultとする。face == 1かどうかで分けよう。",
      "returnはif/elseの外。呼び出し元でも結果を受け取る。"
    ],
    "answer": "def collect(state, face):\n    result = dict(state)\n    if face == 1:\n        result[\"pot\"] = 0\n    else:\n        result[\"pot\"] += face\n    return result\n\nstate = new_game()\nstate = collect(state, 4)\nstate = collect(state, 6)\nprint(state[\"pot\"])  # 10\nbefore = dict(state)\nafter = collect(state, 1)\nassert after[\"pot\"] == 0\nassert state == before  # 渡した元の辞書は変えない",
    "tests": "assert collect(new_game(), 4)[\"pot\"] == 4\ns = new_game()\ns[\"pot\"] = 10\nassert collect(s, 1)[\"pot\"] == 0\nassert s[\"pot\"] == 10\nprint(\"宝の更新と、元の状態の保存 OK\")",
    "remix": "6のときだけボーナスをつけるなら、どの行を変える？ 予想する結果を先にassertへ書いてから改造しよう。"
  },
  {
    "title": "持ち帰る？ まだ欲張る？",
    "tag": "状態の遷移 / 終了条件 / ボタン",
    "goal": "持ち帰り・失敗・勝敗を作り、ボタンで遊べるゲームにする。",
    "brief": "1回の操作を受け取り、次の状態を返すnext_stateを作る。画面のボタンは、この関数を呼ぶだけ。勝ち負けを決めるのは君のPythonだ。",
    "spec": [
      "rollで2〜6ならpotに加算。1ならpotを失いturnを1増やす。scoreは守られる。",
      "bankはpotをscoreへ移し、potを0、turnを1増やす。potが0なら挑戦を消費しない。",
      "scoreがtarget以上ならwon。それ以外でturnがlimitを超えたらlost。終了後は操作しても変化しない。"
    ],
    "ideas": [
      [
        "最後の挑戦の判定順が大事",
        "最後に持ち帰るとturnはlimit+1になる。同時に目標達成することもある。勝利を先に判定し、その次に時間切れを判定しよう。"
      ],
      [
        "画面とルールを分ける",
        "完成部品vault_ui.pyは、ボタン・表示・乱数を担当。next_state(state, action, face)へ渡すので、ルールは画面なしでも試せる。最初は2つのボタンだけ使う。"
      ]
    ],
    "tools": [
      [
        "elif action == \"bank\":",
        "行動名で分岐。文字列のつづりをそろえよう。"
      ],
      [
        "face=None",
        "省略したときの値。bankではサイコロの目が要らない。"
      ],
      [
        "assert 条件",
        "条件がFalseならAssertionErrorで停止。何も出なければ、その確認は通った。"
      ]
    ],
    "starter": "def next_state(state, action, face=None):\n    s = dict(state)\n    # 終了済み → roll / bank → 勝敗 → returnの順\n    raise NotImplementedError(\"ここにゲームのルールを書く\")",
    "hints": [
      "まず終了済みをreturn。次に行動別の処理を書き、最後に共通の勝敗判定。",
      "bankでscoreを増やしてからpotを0へ。逆だと宝を失う。"
    ],
    "answer": "def next_state(state, action, face=None):\n    s = dict(state)\n    if s[\"status\"] != \"playing\":\n        return s\n    if action == \"roll\":\n        if type(face) is not int or not 1 <= face <= 6:\n            raise ValueError(\"出目は1〜6の整数にしよう\")\n        if face == 1:\n            s[\"pot\"] = 0\n            s[\"turn\"] += 1\n            s[\"message\"] = \"1が出た！ 持ち歩いていた宝を失った\"\n        else:\n            s[\"pot\"] += face\n            s[\"message\"] = f\"{face}個の宝を発見！\"\n    elif action == \"bank\":\n        if s[\"pot\"] == 0:\n            s[\"message\"] = \"宝を集めてから持ち帰ろう\"\n            return s\n        s[\"score\"] += s[\"pot\"]\n        s[\"pot\"] = 0\n        s[\"turn\"] += 1\n        s[\"message\"] = \"宝を金庫に入れた！\"\n    else:\n        raise ValueError(\"行動はroll / bankのどれか\")\n    if s[\"score\"] >= s[\"target\"]:\n        s[\"status\"] = \"won\"\n        s[\"message\"] = \"目標達成！ 金庫破り成功！\"\n    elif s[\"turn\"] > s[\"limit\"]:\n        s[\"status\"] = \"lost\"\n        s[\"message\"] = \"時間切れ！ 次は作戦を変えてみよう\"\n    return s\n\nfrom vault_ui import show_game\npanel = show_game(new_game, next_state, allow_buy=False)",
    "tests": "s = new_game(target=10, limit=1)\ns = next_state(s, \"roll\", 6)\ns = next_state(s, \"roll\", 4)\ns = next_state(s, \"bank\")\nassert s[\"status\"] == \"won\"\nassert next_state(s, \"roll\", 1) == s\nassert next_state(new_game(limit=1), \"roll\", 1)[\"status\"] == \"lost\"\nassert next_state(new_game(), \"bank\")[\"turn\"] == 1\nprint(\"最終挑戦・終了後・空の持ち帰り OK\")",
    "remix": "目標60個・8挑戦を、目標80個・10挑戦へ変更して遊ぼう。new_gameの初期値を変え、関数セル→画面セルの順で再実行する。"
  },
  {
    "title": "シールド屋を開店せよ",
    "tag": "条件の組み合わせ / 所持数 / 経済",
    "goal": "宝を使って失敗を防ぐ。買い物が得になるとは限らない。",
    "brief": "「安全」を買えると選択が増える。金庫の宝8個でシールド1個。1を一度だけ防ぎ、そのときpotもturnも変わらない。シールドは持ち帰っても次の挑戦へ持ち越す。",
    "spec": [
      "buyはscoreが8以上、かつshieldsが0のときだけ購入。scoreを8減らしshieldsを1にする。",
      "装備があるとき1が出たらshieldsだけ0にする。装備がなければ前回と同じ失敗。",
      "購入自体で挑戦回数は消費しない。買えない操作で宝や装備数を変えない。"
    ],
    "ideas": [
      [
        "失敗する購入も確かめる",
        "残高7、残高8、すでに装備あり。この境目を試すと「残高がマイナス」「無限に装備」のバグを見つけやすい。"
      ],
      [
        "目標と買い物はつながる",
        "シールドの代金でscoreが下がり、目標が遠ざかる。勝利後は買えない。装備を買えば必ず有利、とはまだ言えないね。"
      ]
    ],
    "tools": [
      [
        "or / and",
        "orはどちらかが成り立つ。andは両方が成り立つ。「残高不足or装備済み」なら購入を断る。"
      ],
      [
        "s[\"shields\"] > 0",
        "装備の有無を判定。使ったら1減らす。"
      ],
      [
        "panel = show_game(...)",
        "戻り値は画面の操作用オブジェクト。後の回でpanel.stateから現在の状態を読む。"
      ]
    ],
    "starter": "# MISSION 2のnext_stateセルを編集する\n# 1の分岐へシールドの判定を追加\n# bankの後へbuyの分岐を追加\n# 最後の勝敗判定は残す",
    "hints": [
      "買えない条件を先に調べてreturnすると、その下には購入成功の処理だけを書ける。",
      "1が出たとき、装備あり/なしをif/elseで分ける。装備ありならturnを増やさない。"
    ],
    "answer": "def next_state(state, action, face=None):\n    s = dict(state)\n    if s[\"status\"] != \"playing\":\n        return s\n    if action == \"roll\":\n        if type(face) is not int or not 1 <= face <= 6:\n            raise ValueError(\"出目は1〜6の整数にしよう\")\n        if face == 1:\n            if s[\"shields\"] > 0:\n                s[\"shields\"] -= 1\n                s[\"message\"] = \"シールドで1を防いだ！ 宝はそのまま\"\n            else:\n                s[\"pot\"] = 0\n                s[\"turn\"] += 1\n                s[\"message\"] = \"1が出た！ 持ち歩いていた宝を失った\"\n        else:\n            s[\"pot\"] += face\n            s[\"message\"] = f\"{face}個の宝を発見！\"\n    elif action == \"bank\":\n        if s[\"pot\"] == 0:\n            s[\"message\"] = \"宝を集めてから持ち帰ろう\"\n            return s\n        s[\"score\"] += s[\"pot\"]\n        s[\"pot\"] = 0\n        s[\"turn\"] += 1\n        s[\"message\"] = \"宝を金庫に入れた！\"\n    elif action == \"buy\":\n        if s[\"score\"] < 8 or s[\"shields\"] > 0:\n            s[\"message\"] = \"購入には金庫の宝8個と、空の装備枠が必要\"\n            return s\n        s[\"score\"] -= 8\n        s[\"shields\"] = 1\n        s[\"message\"] = \"宝8個でシールドを買った！\"\n    else:\n        raise ValueError(\"行動はroll / bank / buyのどれか\")\n    if s[\"score\"] >= s[\"target\"]:\n        s[\"status\"] = \"won\"\n        s[\"message\"] = \"目標達成！ 金庫破り成功！\"\n    elif s[\"turn\"] > s[\"limit\"]:\n        s[\"status\"] = \"lost\"\n        s[\"message\"] = \"時間切れ！ 次は作戦を変えてみよう\"\n    return s\n\nfrom vault_ui import show_game\n\npanel = show_game(new_game, next_state)",
    "tests": "s = new_game()\ns[\"score\"] = 7\nassert next_state(s, \"buy\")[\"score\"] == 7\ns[\"score\"] = 8\ns = next_state(s, \"buy\")\nassert (s[\"score\"], s[\"shields\"]) == (0, 1)\ns[\"score\"] = 8\nassert next_state(s, \"buy\")[\"score\"] == 8\ns[\"pot\"] = 12\ns = next_state(s, \"roll\", 1)\nassert (s[\"pot\"], s[\"turn\"], s[\"shields\"]) == (12, 1, 0)\ns = next_state(s, \"roll\", 1)\nassert (s[\"pot\"], s[\"turn\"]) == (0, 2)\nprint(\"購入の境目・連続の1 OK\")",
    "remix": "シールド価格を4・8・12に変えて試そう。コード内の価格表示もそろえる。後のCPUが買う作戦も作り、有利か実験しよう。"
  },
  {
    "title": "自分より強いCPUを作れ",
    "tag": "関数を渡す / whileの代わりの上限 / Random",
    "goal": "判断を関数にし、1試合を自動で最後まで遊ばせる。",
    "brief": "CPUはチャットAIではなく、君が書いた作戦で動くプレイヤー。まず「14個で持ち帰る」。ただし、今持ち帰れば目標達成するときは14個未満でも帰る。",
    "spec": [
      "choose(state, stop_at=14)はrollかbankという行動名を返す。stateを書き換えない。",
      "play_cpu(policy, seed)はゲームを開始し、判断→必要なら乱数→状態更新を繰り返す。終了状態の辞書を返す。",
      "2000手で終わらなければRuntimeError。空の持ち帰りばかり選ぶCPUでも、Notebookが動き続けないようにする。"
    ],
    "ideas": [
      [
        "関数を材料として渡す",
        "play_cpu(choose)はchooseという関数を渡す。choose()とその場で実行する書き方とは違う。実行側が毎手policy(state)として呼ぶ。"
      ],
      [
        "乱数の種を決める",
        "random.Random(42)で専用の乱数発生器を作る。同じコード・同じseedなら結果を再現でき、バグを追いやすい。rng.randintはその発生器のメソッド。"
      ]
    ],
    "tools": [
      [
        "random.Random(seed)",
        "乱数発生器のオブジェクトを作る。全体のrandom.seedを書き換えずに実験を分けられる。"
      ],
      [
        "policy(dict(state))",
        "CPUへ状態のコピーを渡す。判断のために元の状態を壊さない。"
      ],
      [
        "raise RuntimeError(\"理由\")",
        "続けられないとき、理由を付けて止める。無限ループを隠さない。"
      ]
    ],
    "starter": "def choose(state, stop_at=14):\n    # 勝てるならbank → 基準以上ならbank → それ以外roll\n    raise NotImplementedError(\"CPUの作戦を書こう\")\n\ndef play_cpu(policy, seed=0):\n    # 準備 → 最大2000手 → 終了なら結果を返す\n    raise NotImplementedError(\"自動プレイを書こう\")",
    "hints": [
      "目標まで残り5個なら、potが5になった時点で帰るべき。勝てる条件を最初に置く。",
      "乱数を使うのはrollのときだけ。bankやbuyのときはface=None。"
    ],
    "answer": "def choose(state, stop_at=14):\n    if state[\"score\"] + state[\"pot\"] >= state[\"target\"]:\n        return \"bank\"\n    if state[\"pot\"] >= stop_at:\n        return \"bank\"\n    return \"roll\"\n\n# CPUの1手ボタンも使える画面\nfrom vault_ui import show_game\npanel = show_game(new_game, next_state, policy=choose)\n\nimport random\n\ndef play_cpu(policy, seed=0):\n    rng = random.Random(seed)\n    state = new_game()\n    for step in range(2000):\n        if state[\"status\"] != \"playing\":\n            return state\n        action = policy(dict(state))\n        face = rng.randint(1, 6) if action == \"roll\" else None\n        state = next_state(state, action, face)\n    raise RuntimeError(\"2000手でも終わらない。CPUが同じ行動を続けていない？\")\n\nresult = play_cpu(choose, seed=42)\nprint(result[\"status\"], result[\"score\"])",
    "tests": "s = new_game()\ns[\"pot\"] = 14\nassert choose(s) == \"bank\"\ns[\"score\"], s[\"pot\"] = 58, 2\nassert choose(s) == \"bank\"\nassert choose(new_game()) == \"roll\"\nassert play_cpu(choose, 42) == play_cpu(choose, 42)\nprint(\"判断の境目・同じ種の再現 OK\")",
    "remix": "残高が16以上、装備なし、potが10以上ならbuyを選ぶCPUも作ろう。購入条件を満たさないのにbuyを繰り返すと2000手エラーになる。"
  },
  {
    "title": "1000試合で作戦大会",
    "tag": "シミュレーション / リストと辞書 / 公平な比較",
    "goal": "慎重・中間・大胆の3作戦を、自分の実験で比べる。",
    "brief": "1試合で勝った作戦が一番強いとは限らない。8個・14個・20個で帰る3作戦を各1000試合。目標や回数は同じにして、勝率・平均の宝・平均挑戦数を比べよう。",
    "spec": [
      "stop_atごとにseed=0〜999を使って1000試合。全作戦で同じseedの一覧を使う。",
      "勝ち数と最終score、使った挑戦数を記録する。終了時のturnは次の番号なので使用回数はturn - 1。",
      "結果を辞書にし、3つの辞書をreportsというリストに入れて返す。まずgames=10で動作確認し、1000へ。"
    ],
    "ideas": [
      [
        "同じseedなら同じ試合？",
        "同じ乱数列の開始点をそろえられる。ただし持ち帰るタイミングが違えば挑戦ごとの出目の区切りも変わる。全く同じ展開になるという意味ではない。"
      ],
      [
        "勝率と平均得点は違う",
        "60個に届いたら勝ちなので、勝ちやすさを知りたいなら勝率を見る。平均得点や早さも別の評価軸。少しの差は偶然かもしれない。条件や別のseed範囲でも試そう。"
      ]
    ],
    "tools": [
      [
        "reports.append({...})",
        "1作戦の集計を1つの辞書にし、一覧へ追加する。"
      ],
      [
        "sum(scores) / games",
        "平均。gamesは1以上の整数で試す。"
      ],
      [
        "def policy(state): ...",
        "各stop_at専用の作戦を、その実験の直前に定義してすぐ使う。"
      ]
    ],
    "starter": "def compare(games=1000):\n    reports = []\n    # stop_atごとに、wins・scores・turnsを最初から数える\n    # seedを変えてplay_cpuを呼ぶ\n    # 1作戦分の集計をreportsに追加する\n    return reports",
    "hints": [
      "wins、scores、turnsはstop_atのforの中、seedのforの前で初期化する。",
      "各試合のresult[\"status\"]がwonならwins += 1。勝率はwins / games * 100。"
    ],
    "answer": "def compare(games=1000):\n    reports = []\n    for stop_at in [8, 14, 20]:\n        def policy(state):\n            return choose(state, stop_at=stop_at)\n        wins = 0\n        scores = []\n        turns = []\n        for seed in range(games):\n            result = play_cpu(policy, seed=seed)\n            if result[\"status\"] == \"won\":\n                wins += 1\n            scores.append(result[\"score\"])\n            turns.append(result[\"turn\"] - 1)\n        reports.append({\n            \"stop_at\": stop_at,\n            \"win_percent\": round(wins / games * 100, 1),\n            \"mean_score\": round(sum(scores) / games, 1),\n            \"mean_turns\": round(sum(turns) / games, 1),\n        })\n    return reports\n\nreports = compare(games=1000)\nfor row in reports:\n    print(row)",
    "tests": "reports = compare(games=10)\nassert len(reports) == 3\nfor row in reports:\n    assert 0 <= row[\"win_percent\"] <= 100\n    assert 1 <= row[\"mean_turns\"] <= 8\nprint(\"3作戦の集計 OK\")",
    "remix": "順位を出すならsorted(reports, key=lambda row: row[\"win_percent\"], reverse=True)。keyは「どの値で並べるか」、lambdaは短い関数。勝率が同じ作戦は同率として読もう。"
  },
  {
    "title": "セーブして、作品として渡す",
    "tag": "JSON / Path / 属性とメソッド / 入力の検証",
    "goal": "途中のゲームを保存し、翌日同じ宝の数から再開する。",
    "brief": "Notebookの保存だけでは、再起動後のPythonはゲームの状態を覚えていない。今の状態をJSONへ書き、読み戻して新しい画面につなごう。",
    "spec": [
      "save_state(state, filename)でversionとstateをJSON保存。load_state(filename)は辞書を読み戻す。",
      "ファイルから読んだ値を点検する。宝が負、シールド2個、終了条件と状態が矛盾するデータはValueError。",
      "panel.stateを保存し、load_stateで読んだ状態をshow_gameのinitial_stateへ渡して再開する。"
    ],
    "ideas": [
      [
        "属性は情報、メソッドは動作",
        "panel.stateは画面が持つ現在の状態を読む属性。panel.snapshot()はコピーを返すメソッド。Path(\"vault_save.json\").nameは名前の属性、.read_text(...)は読むメソッド。括弧の有無も道具カードで確かめよう。"
      ],
      [
        "どこまで再開する？",
        "金庫・持ち物・挑戦番号は戻る。このセーブには乱数発生器の内部状態を入れないので、次に出る目まで同じにはならない。"
      ],
      [
        "仕上げるのは自分のNotebook",
        "友達へ渡すのはvault_lab.ipynbとvault_ui.py。相手もJupyterLabとipywidgetsを使う。この続編の自作PythonをHTMLへ自動変換する仕組みはない。サイトのお手本はブラウザで遊べるが、Notebookの改造は自動反映されない。"
      ]
    ],
    "tools": [
      [
        "Path(filename).write_text(text, encoding=\"utf-8\")",
        "指定した名前へ保存。同名は上書き。print(path.resolve())で実際の保存先を確認する。"
      ],
      [
        "json.dumps / json.loads",
        "辞書をJSON文字列へ / JSON文字列をPythonの値へ。読み戻した後は中身を確かめる。"
      ],
      [
        "try / except ValueError",
        "想定した失敗を受け取る。全部のエラーを黙って消すのではなく、理由を表示する。"
      ]
    ],
    "starter": "import json\nfrom pathlib import Path\n\n# まず辞書を文字列にして戻す実験\ntext = json.dumps(new_game(), ensure_ascii=False)\nrestored = json.loads(text)\nassert restored == new_game()\n\n# 次にsave_state / load_stateを作る。\n# validate_stateの長い点検部分は完成例からコピーしてOK。",
    "hints": [
      "保存するのはコードではなく状態の値。画面のpanelそのものはJSONにしない。",
      "点検は長いのでコピー可。保存と読み込みの関数は自分で書こう。読み込み後にvalidate_stateを呼ぶ。"
    ],
    "answer": "import json\nfrom pathlib import Path\n\ndef validate_state(s):\n    if not isinstance(s, dict):\n        raise ValueError(\"セーブの中身は辞書が必要\")\n    number_keys = [\"score\", \"pot\", \"turn\", \"target\", \"limit\", \"shields\"]\n    for key in number_keys:\n        if key not in s or type(s[key]) is not int:\n            raise ValueError(f\"{key}は整数が必要\")\n    if s[\"score\"] < 0 or s[\"pot\"] < 0:\n        raise ValueError(\"宝の数は0以上\")\n    if s[\"target\"] < 1 or s[\"limit\"] < 1:\n        raise ValueError(\"目標と挑戦回数は1以上\")\n    if not 1 <= s[\"turn\"] <= s[\"limit\"] + 1:\n        raise ValueError(\"挑戦回数が範囲外\")\n    if s[\"shields\"] not in [0, 1]:\n        raise ValueError(\"シールドは0か1\")\n    status = s.get(\"status\")\n    if status not in [\"playing\", \"won\", \"lost\"]:\n        raise ValueError(\"ゲームの状態が不明\")\n    if status == \"playing\" and (s[\"turn\"] > s[\"limit\"] or s[\"score\"] >= s[\"target\"]):\n        raise ValueError(\"終了条件と状態が合わない\")\n    if status == \"won\" and s[\"score\"] < s[\"target\"]:\n        raise ValueError(\"勝利なのに宝が足りない\")\n    if status == \"lost\" and (s[\"turn\"] != s[\"limit\"] + 1 or s[\"score\"] >= s[\"target\"]):\n        raise ValueError(\"時間切れの条件が合わない\")\n    if not isinstance(s.get(\"message\"), str):\n        raise ValueError(\"messageは文字列が必要\")\n    return dict(s)\n\ndef save_state(state, filename=\"vault_save.json\"):\n    payload = {\"version\": 1, \"state\": validate_state(state)}\n    path = Path(filename)\n    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding=\"utf-8\")\n    print(\"保存した場所:\", path.resolve())\n\ndef load_state(filename=\"vault_save.json\"):\n    payload = json.loads(Path(filename).read_text(encoding=\"utf-8\"))\n    if not isinstance(payload, dict) or payload.get(\"version\") != 1:\n        raise ValueError(\"この版で読めるセーブではない\")\n    return validate_state(payload.get(\"state\"))\n\n# ゲーム画面を作り、何手か遊んでから実行\nsave_state(panel.snapshot())\nrestored = load_state()\npanel = show_game(new_game, next_state, policy=choose, initial_state=restored)",
    "tests": "s = new_game()\ns[\"pot\"] = 9\nsave_state(s, \"vault_test.json\")\nassert load_state(\"vault_test.json\") == s\nbad = dict(s)\nbad[\"shields\"] = 2\ntry:\n    validate_state(bad)\nexcept ValueError as error:\n    print(\"壊れたデータを止めた:\", error)\nelse:\n    raise AssertionError(\"シールド2個を受け入れてしまった\")",
    "remix": "友達用にルールを3行で説明し、変えた部分をNotebookの最初に書こう。別版はvault_lab_v2.ipynbに保存。シールド価格やCPUを変えて対決しよう。"
  }
];

// UI glue is available independently of the hidden rule solutions.
VAULT_LESSONS[1].connect = 'from vault_ui import show_game\n\npanel = show_game(new_game, next_state, allow_buy=False)';
VAULT_LESSONS[2].connect = 'from vault_ui import show_game\n\npanel = show_game(new_game, next_state)';
VAULT_LESSONS[3].connect = 'from vault_ui import show_game\n\npanel = show_game(new_game, next_state, policy=choose)';
VAULT_LESSONS[5].connect = '# 何手か遊んでから、保存するセル\nsave_state(panel.snapshot(), "vault_save.json")\n\n# 再開するセル（保存セルとは分ける）\nrestored = load_state("vault_save.json")\npanel = show_game(new_game, next_state, policy=choose, initial_state=restored)';
