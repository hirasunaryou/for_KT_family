const MAZE_LESSONS = [
  {
    "title": "文字の地図が、迷路になる",
    "tag": "Matplotlib / 二次元データ / 座標",
    "goal": "壁と通路のデータから、自分の迷路を描く。",
    "spec": [
      "地図の#を壁、.を通路にする。全ての行を同じ長さにそろえる。",
      "壁を0、通路を1へ変換し、Matplotlibのimshowで表示する。",
      "1マスを正方形で表示し、xとyのラベルを付ける。地図の壁を1か所変えて描き直す。"
    ],
    "ideas": [
      [
        "位置は(x, y)、取り出しはgrid[y][x]",
        "xは右へ、yは下へ増える。grid[y]で横1行を取り出し、その行の[x]で1文字を選ぶ。左上は(0, 0)。数学のグラフとyの向きが違うので、origin=\"upper\"を指定する。"
      ],
      [
        "画像にする前のデータを見よう",
        "pixelsは「数のリスト」をさらに並べた二次元リスト。print(pixels[1])で1行だけ確かめる。描くための数値と、ゲームの壁判定に使う文字は役割が違う。"
      ]
    ],
    "tools": [
      [
        "plt.subplots()",
        "図全体figと、描く場所axを返す。fig, ax = ...で2つを受け取る。"
      ],
      [
        "ax.imshow(pixels, ...)",
        "二次元データを色で表示するメソッド。今回は0が黒、1が白になるgrayを使う。"
      ],
      [
        "ax.set_aspect(\"equal\")",
        "xとyの1の長さをそろえる。ax.set_title(...)でタイトルも変更できる。"
      ]
    ],
    "starter": "grid = (\n    \"#############\",\n    \"#.....#.....#\",\n    \"#.###.#.###.#\",\n    \"#...#...#...#\",\n    \"###.#####.#.#\",\n    \"#...#.....#.#\",\n    \"#.###.#####.#\",\n    \"#.....#.....#\",\n    \"#.#####.###.#\",\n    \"#...........#\",\n    \"#############\",\n)\nstart = (1, 1)\ngoal = (11, 1)\nrobot = (1, 9)\n\n# pixelsへ1行ずつ数値のリストを追加しよう\npixels = []",
    "hints": [
      "for row in grid: の中でvalues = []。その中でfor tile in row:。1行できたらpixelsへ追加。",
      "ax.imshow(pixels, cmap=\"gray\", vmin=0, vmax=1, origin=\"upper\")で数と色を対応させる。"
    ],
    "answer": "import matplotlib.pyplot as plt\n\npixels = []\nfor row in grid:\n    values = []\n    for tile in row:\n        if tile == \"#\":\n            values.append(0)\n        else:\n            values.append(1)\n    pixels.append(values)\n\nfig, ax = plt.subplots()\nax.imshow(pixels, cmap=\"gray\", vmin=0, vmax=1, origin=\"upper\")\nax.set_aspect(\"equal\")\nax.set_title(\"My first maze\")\nax.set_xlabel(\"x\")\nax.set_ylabel(\"y\")\nplt.show()",
    "tests": "assert len(pixels) == len(grid)\nassert len(pixels[0]) == len(grid[0])\nassert pixels[1][1] == 1\nassert pixels[0][0] == 0\nprint(\"壁と通路の変換 OK\")",
    "connect": "from maze_tools import draw_maze\n\n# 目印と座標を整える完成部品。ここはコピー可\ndraw_maze(grid, player=start, goal=goal, robot=robot)",
    "remix": "地図の文字列は一部分だけを書き換えられない。行の文字を編集して地図セルを再実行しよう。幅13×高さ11のまま、壁の配置だけを変えてみる。"
  },
  {
    "title": "壁をすり抜けないプレイヤー",
    "tag": "タプル / 境界 / 隣接マス",
    "goal": "座標を渡すと、移動先を返す関数を作る。",
    "spec": [
      "can_walk(grid, pos)は、範囲内の通路ならTrue。それ以外ならFalse。",
      "neighbors(grid, pos)は、右・下・左・上の順で進める座標だけをリストで返す。斜めには進まない。",
      "move_playerは方向名を受け取り、進めるなら新しい座標、壁なら元の座標を返す。"
    ],
    "ideas": [
      [
        "タプルで場所をひとまとめにする",
        "pos = (1, 2)なら、x, y = posで2つの値へ分けられる。タプルは中身を変更しない値の組なので、後でsetや辞書のキーにも使える。"
      ],
      [
        "範囲の確認を先にする理由",
        "Pythonの-1は最後の要素を指す。範囲外を調べずにgrid[y][x]を読むと、左へ出たつもりが右端を調べてしまう。andは左から調べ、Falseなら右側を調べない。"
      ]
    ],
    "tools": [
      [
        "x, y = pos",
        "組になった値を別々の変数で受け取る。"
      ],
      [
        "0 <= x < width",
        "0以上、幅より小さいかを調べる。"
      ],
      [
        "(x + dx, y + dy)",
        "方向の変化量を足し、新しい座標を作る。"
      ]
    ],
    "starter": "def can_walk(grid, pos):\n    x, y = pos\n    # 範囲内？ そのマスは通路？\n    raise NotImplementedError(\"壁判定を書こう\")\n\ndef neighbors(grid, pos):\n    # 4方向を調べてリストを返す\n    raise NotImplementedError(\"進める隣の場所を集めよう\")\n\ndef move_player(grid, pos, direction):\n    raise NotImplementedError(\"移動先を返そう\")",
    "hints": [
      "まずcan_walkだけ完成させ、範囲外も試す。それを他の2つの関数から使う。",
      "壁のときはNoneではなく、元のposをreturnする。"
    ],
    "answer": "def can_walk(grid, pos):\n    x, y = pos\n    height = len(grid)\n    width = len(grid[0])\n    return 0 <= x < width and 0 <= y < height and grid[y][x] == \".\"\n\ndef neighbors(grid, pos):\n    x, y = pos\n    result = []\n    for dx, dy in [(1, 0), (0, 1), (-1, 0), (0, -1)]:\n        candidate = (x + dx, y + dy)\n        if can_walk(grid, candidate):\n            result.append(candidate)\n    return result\n\ndef move_player(grid, pos, direction):\n    moves = {\"right\": (1, 0), \"down\": (0, 1), \"left\": (-1, 0), \"up\": (0, -1)}\n    dx, dy = moves[direction]\n    candidate = (pos[0] + dx, pos[1] + dy)\n    if can_walk(grid, candidate):\n        return candidate\n    return pos",
    "tests": "assert can_walk(grid, (1, 1))\nassert not can_walk(grid, (-1, 1))\nassert not can_walk(grid, (len(grid[0]), 1))\nassert move_player(grid, start, \"left\") == start\nassert move_player(grid, start, \"right\") == (2, 1)\nassert neighbors(grid, start) == [(2, 1), (1, 2)]\nprint(\"座標・壁・範囲外 OK\")",
    "connect": "from maze_tools import show_walker\n\npanel = show_walker(grid, start, goal, move_player)",
    "remix": "壁にぶつかった回数を数える改造を考えよう。移動先の座標だけでは何が足りない？ 最後のゲームの状態辞書につながる考え方だよ。"
  },
  {
    "title": "足跡を覚えるロボット",
    "tag": "set / 記録 / 上限を決める",
    "goal": "まだ行っていない場所を優先して歩くロボットを作る。",
    "spec": [
      "historyへ通った順を全て記録。seenには通った場所を重複なしで記録する。",
      "未訪問の隣があれば、そこからランダムに選ぶ。なければ通れる隣から選び直す。",
      "ゴール・動ける場所なし・200歩のいずれかで停止。historyとseenを返す。"
    ],
    "ideas": [
      [
        "履歴と集合は違う",
        "historyには同じ場所が何度入ってもよい。seenは重複を持たない集合。同じ場所に10回来ても、seenでは1か所。"
      ],
      [
        "覚えても、まだ最短とは限らない",
        "この作戦は遠回りするし、200歩で出口に着かないこともある。出口に行けない証明にはならない。次の回では、探し方そのものを変える。"
      ]
    ],
    "tools": [
      [
        "seen = {start} / seen.add(pos)",
        "集合を作り、場所を加える。空の集合はset()。{}だけなら辞書になる。"
      ],
      [
        "candidate not in seen",
        "まだ訪問していないかを調べる。"
      ],
      [
        "rng.choice(fresh if fresh else choices)",
        "freshが空でなければfresh、空ならchoicesから選ぶ条件式。"
      ]
    ],
    "starter": "def wander(grid, start, goal, seed=0, max_steps=200):\n    # 乱数・今の場所・履歴・集合を用意\n    # 歩ける隣を調べ、未訪問を優先して歩く\n    raise NotImplementedError(\"足跡を覚えるロボットを作ろう\")",
    "hints": [
      "初めからhistory=[start]、seen={start}。最初の場所も記録する。",
      "移動後にseen.add(pos)とhistory.append(pos)。choicesが空ならchoiceを呼ぶ前にbreak。"
    ],
    "answer": "import random\n\ndef wander(grid, start, goal, seed=0, max_steps=200):\n    rng = random.Random(seed)\n    pos = start\n    seen = {start}\n    history = [start]\n    for step in range(max_steps):\n        if pos == goal:\n            break\n        choices = neighbors(grid, pos)\n        if not choices:\n            break\n        fresh = []\n        for candidate in choices:\n            if candidate not in seen:\n                fresh.append(candidate)\n        pos = rng.choice(fresh if fresh else choices)\n        seen.add(pos)\n        history.append(pos)\n    return history, seen",
    "tests": "history, seen = wander(grid, start, goal, seed=3)\nassert history[0] == start\nassert seen == set(history)\nassert len(history) <= 201\nfor a, b in zip(history, history[1:]):\n    assert b in neighbors(grid, a)\nprint(\"歩数:\", len(history) - 1, \"訪問した場所:\", len(seen))",
    "connect": "from maze_tools import animate_search\n\nhistory, seen = wander(grid, start, goal, seed=3)\nviewer = animate_search(grid, history, [], goal=goal, label=\"WALK\")",
    "remix": "記憶を使わず毎回choicesから選ぶ版も作ろう。同じseedを何種類か使い、ゴールに着いた割合と歩数を比べる。zipは2つの並びから値をペアで取り出す関数。"
  },
  {
    "title": "最短経路が光る探索",
    "tag": "deque / 幅優先探索 / 経路の復元",
    "goal": "近い場所から順に調べ、ゴールまでの最短経路を見つける。",
    "spec": [
      "find_pathはpath（経路）とorder（調べた順）を返す。調べる順番待ちにdequeを使う。",
      "parentsに、各場所へどこから来たかを保存。同じ場所を2回順番待ちに入れない。",
      "ゴールに着いたら親を逆にたどって経路を復元。行けなければpathは空。startとgoalが同じなら経路は[start]。"
    ],
    "ideas": [
      [
        "待っている列の先頭から調べる",
        "queueへ隣を後ろに追加し、先頭をpopleftで取り出す。この順なら1歩先、2歩先…と調べるので、上下左右の1歩の費用が全て同じ場合、最少歩数の経路が見つかる。これを幅優先探索という。"
      ],
      [
        "発見済みと、調査済み",
        "parentsへ入れた場所は「発見して予約した場所」。orderへ入れるのは先頭から取り出して調べたとき。発見時に予約することで、同じ場所が何度も列に入るのを防ぐ。"
      ],
      [
        "足跡を逆にたどる",
        "parents[隣] = 今いる場所を保存しておく。ゴール→親→その親→スタートの順に集まり、最後にreverseで逆順にする。orderは探索の記録で、実際に歩ける1本の道とは限らない。"
      ]
    ],
    "tools": [
      [
        "deque([start]) / queue.popleft()",
        "順番待ちを作る・先頭を取り出す。通常のlistのpop()は末尾を取り出すので探す順番が変わる。"
      ],
      [
        "parents = {start: None}",
        "スタートには親がいないのでNone。辞書のキーが発見済みの印にもなる。"
      ],
      [
        "path.reverse()",
        "リストそのものを逆順にする。path = path.reverse()にするとNoneが入るので注意。"
      ]
    ],
    "starter": "from collections import deque\n\ndef find_path(grid, start, goal):\n    queue = deque([start])\n    parents = {start: None}\n    order = []\n    # 先頭を調べる → ゴールなら復元 → 未発見の隣を予約\n    raise NotImplementedError(\"探索と経路の復元を書こう\")",
    "hints": [
      "候補をqueueへ入れる前にparents[candidate] = pos。予約を遅らせない。",
      "最後までゴールがなければreturn [], order。経路復元のwhileはpos is not Noneを条件にする。"
    ],
    "answer": "from collections import deque\n\ndef find_path(grid, start, goal):\n    if not can_walk(grid, start) or not can_walk(grid, goal):\n        return [], []\n    queue = deque([start])\n    parents = {start: None}\n    order = []\n    while queue:\n        pos = queue.popleft()\n        order.append(pos)\n        if pos == goal:\n            path = []\n            while pos is not None:\n                path.append(pos)\n                pos = parents[pos]\n            path.reverse()\n            return path, order\n        for candidate in neighbors(grid, pos):\n            if candidate not in parents:\n                parents[candidate] = pos\n                queue.append(candidate)\n    return [], order",
    "tests": "tiny = (\"#####\", \"#...#\", \"###.#\", \"#...#\", \"#####\")\npath, order = find_path(tiny, (1, 1), (3, 3))\nassert len(path) - 1 == 4\nassert len(order) == len(set(order))\nassert find_path(tiny, (1, 1), (1, 1))[0] == [(1, 1)]\nblocked = (\"#####\", \"#.#.#\", \"#####\")\nassert find_path(blocked, (1, 1), (3, 1))[0] == []\nprint(\"最短・重複・同じ場所・出口なし OK\")",
    "connect": "from maze_tools import animate_search\n\npath, order = find_path(grid, start, goal)\nprint(\"調べたマス:\", len(order))\nprint(\"最短歩数:\", len(path) - 1 if path else \"道なし\")\nviewer = animate_search(grid, order, path, goal=goal)",
    "remix": "popleft()をpop()へ変えて同じ迷路を調べよう。深く先へ進む探し方になる。出口に着けても最短とは限らない。1つの迷路で同じ結果でも、別の配置でも比較しよう。"
  },
  {
    "title": "遊べる迷路だけを自動生成",
    "tag": "生成と検査 / join / seed / 保存",
    "goal": "壁をランダムに置き、つながる地図だけ採用する。",
    "spec": [
      "外周を壁にし、内側は指定割合で壁を置く。スタート・ゴール・ロボットの場所は通路に戻す。",
      "find_pathでスタート→ゴール、ロボット→スタートがつながるか確認。両方つながれば返す。",
      "最大200案で止める。完成した地図はmy_maze.jsonへ保存し、再読込して同じ配置になるか確かめる。"
    ],
    "ideas": [
      [
        "作る処理と検査を分ける",
        "ランダムに壁を置くだけでは出口に行けないことがある。次々に案を作り、前の回の探索関数を検査に使う。全通路がつながることや、逃走ゲームに必ず勝てることまでは保証しない。"
      ],
      [
        "列を編集してから文字列へ",
        "文字列の1文字だけは代入できない。まず1行をリストにして編集し、\"\".join(row)でつなげて文字列に戻す。"
      ],
      [
        "保存は再現のため",
        "seedは作った手順の再現に便利。ただし作り方のコードを変えると同じseedでも別の地図になる。地図自体を保存すれば、あとで同じ壁配置を使える。"
      ]
    ],
    "tools": [
      [
        "rng.random() < wall_rate",
        "0以上1未満の乱数で壁を置くか決める。実際の壁の割合が毎回ぴったり一致するわけではない。"
      ],
      [
        "\"\".join(row)",
        "文字のリストを区切りなしでつなげる。"
      ],
      [
        "path, _ = find_path(...)",
        "2つ目の戻り値を今回は使わないので、_という名前で受け取る。"
      ]
    ],
    "starter": "def make_maze(width=13, height=11, wall_rate=0.30, seed=0):\n    # 最大200案: 壁を置く → 3か所を開ける → つながりを調べる\n    raise NotImplementedError(\"自動生成を書こう\")",
    "hints": [
      "幅と高さのチェック部分は完成例からコピーでOK。まず固定13×11で1案作るところから。",
      "壁の密度を上げすぎると200案でもつながらない。無限にやり直さずRuntimeErrorで止める。"
    ],
    "answer": "import random\n\ndef make_maze(width=13, height=11, wall_rate=0.30, seed=0):\n    if type(width) is not int or type(height) is not int or not 7 <= width <= 41 or not 7 <= height <= 41:\n        raise ValueError(\"幅と高さは7〜41の整数にしよう\")\n    if not 0 <= wall_rate <= 1:\n        raise ValueError(\"壁の割合は0〜1にしよう\")\n    rng = random.Random(seed)\n    start = (1, 1)\n    goal = (width - 2, 1)\n    robot = (1, height - 2)\n    for attempt in range(200):\n        rows = []\n        for y in range(height):\n            row = []\n            for x in range(width):\n                if x == 0 or y == 0 or x == width - 1 or y == height - 1:\n                    row.append(\"#\")\n                else:\n                    row.append(\"#\" if rng.random() < wall_rate else \".\")\n            rows.append(row)\n        for x, y in [start, goal, robot]:\n            rows[y][x] = \".\"\n        candidate = tuple(\"\".join(row) for row in rows)\n        path, _ = find_path(candidate, start, goal)\n        robot_path, _ = find_path(candidate, robot, start)\n        if path and robot_path:\n            return candidate\n    raise RuntimeError(\"200回作ってもつながらない。壁の割合を下げてみよう\")",
    "tests": "generated = make_maze(seed=7)\nassert generated == make_maze(seed=7)\nassert find_path(generated, (1, 1), (11, 1))[0]\nassert find_path(generated, (1, 9), (1, 1))[0]\nassert all(len(row) == 13 for row in generated)\nprint(\"再現できる・出口とロボットにつながる OK\")",
    "connect": "from maze_tools import draw_maze, save_maze, load_maze\n\ngenerated = make_maze(seed=7)\ndraw_maze(generated, player=(1, 1), goal=(11, 1), robot=(1, 9))\nsave_maze(generated, \"my_maze.json\")\nloaded = load_maze(\"my_maze.json\")\nassert loaded == generated",
    "remix": "壁の割合を0.15・0.30・0.45で試し、最短歩数や調べたマス数を比べよう。「壁が多いほど難しい」と言い切れる？ 保存名をmy_maze_v2.jsonにすれば前の地図を残せる。"
  },
  {
    "title": "追跡ロボットから脱出せよ",
    "tag": "探索を敵に使う / 状態と手番 / 完成作品",
    "goal": "自分の最短経路探索を、プレイヤーを追う敵に使う。",
    "spec": [
      "プレイヤーが通路へ移動、またはwaitすると手数を1増やす。壁にぶつかったときは手数も敵も進まない。",
      "2手ごとに敵がプレイヤーまでの最短経路を探し、1マス近づく。path[0]は敵自身なので次はpath[1]。",
      "プレイヤーが敵へ入ると負け。ゴールへ入ったら敵が動く前に勝ち。終了後は状態を変えない。"
    ],
    "ideas": [
      [
        "新しい仕事のために関数を再利用",
        "以前はスタートからゴールを探した。今度は「スタート=敵」「ゴール=プレイヤー」として同じfind_pathを呼ぶ。中身を書き直さず、渡す材料を変えて使える。"
      ],
      [
        "マスの数と歩数は違う",
        "経路には最初のマスも含む。2マスの経路なら移動は1歩。len(path)>=2を確認してからpath[1]へ進める。"
      ],
      [
        "この地図なら勝てる、は別の問題",
        "地図のつながりはMISSION 5で確認できる。でも動く敵を避けて勝てるかは、配置と速さにもよる。robot_everyを3にして緩めたり、初期位置を変えたりして遊びながら調整しよう。"
      ]
    ],
    "tools": [
      [
        "steps % robot_every == 0",
        "割った余りで敵の手番を判定。2なら2・4・6手目。robot_everyは1以上の整数にする。"
      ],
      [
        "dict(state)",
        "今回の状態の値はタプル・数・文字列なので浅いコピーで元を守れる。リストを追加する改造では中身の共有に注意。"
      ],
      [
        "panel.state / panel.restart()",
        "stateは現在の情報を読む属性。restart()はゲームを最初に戻すメソッド。括弧の有無にも意味がある。"
      ]
    ],
    "starter": "from maze_tools import show_game\n\ndef new_game(grid, start, goal, robot, robot_every=2):\n    # 状態の設計図は完成例からコピー可\n    raise NotImplementedError(\"ゲームの記憶を用意しよう\")\n\ndef take_turn(state, direction):\n    # プレイヤー → 接触/ゴール → 敵の手番 → 接触\n    raise NotImplementedError(\"1手の順番を作ろう\")",
    "hints": [
      "移動した先が敵か、ゴールかを先に判定。勝利を決めた後に敵を動かさない。",
      "敵の経路が空のときは動かさない。path[1]を無条件に読むとIndexErrorになる。"
    ],
    "answer": "def new_game(grid, start, goal, robot, robot_every=2):\n    return {\"grid\": tuple(grid), \"player\": start, \"goal\": goal, \"robot\": robot,\n            \"steps\": 0, \"robot_every\": robot_every, \"status\": \"playing\",\n            \"message\": \"ゴールへ向かおう！\"}\n\ndef take_turn(state, direction):\n    s = dict(state)\n    if s[\"status\"] != \"playing\":\n        return s\n    if direction == \"wait\":\n        pos = s[\"player\"]\n    else:\n        pos = move_player(s[\"grid\"], s[\"player\"], direction)\n        if pos == s[\"player\"]:\n            s[\"message\"] = \"壁には進めない。手数は増えないよ\"\n            return s\n    s[\"player\"] = pos\n    s[\"steps\"] += 1\n    if pos == s[\"robot\"]:\n        s[\"status\"] = \"lost\"\n        s[\"message\"] = \"ロボットにぶつかった！\"\n        return s\n    if pos == s[\"goal\"]:\n        s[\"status\"] = \"won\"\n        s[\"message\"] = \"脱出成功！\"\n        return s\n    if s[\"steps\"] % s[\"robot_every\"] == 0:\n        path, _ = find_path(s[\"grid\"], s[\"robot\"], pos)\n        if len(path) >= 2:\n            s[\"robot\"] = path[1]\n    if s[\"robot\"] == pos:\n        s[\"status\"] = \"lost\"\n        s[\"message\"] = \"つかまった！ 次はルートを変えよう\"\n    else:\n        s[\"message\"] = \"次はどう動く？\"\n    return s",
    "tests": "room = (\"#######\", \"#.....#\", \"#.....#\", \"#.....#\", \"#######\")\ns = new_game(room, (1, 1), (2, 1), (5, 3))\nassert take_turn(s, \"left\")[\"steps\"] == 0\nwon = take_turn(s, \"right\")\nassert won[\"status\"] == \"won\"\nassert take_turn(won, \"wait\") == won\ns = new_game(room, (1, 1), (5, 3), (2, 1))\nassert take_turn(s, \"right\")[\"status\"] == \"lost\"\ns = take_turn(s, \"wait\")\nassert s[\"robot\"] == (2, 1)\ns = take_turn(s, \"wait\")\nassert s[\"status\"] == \"lost\"\nprint(\"壁・勝利・終了後・敵の手番 OK\")",
    "connect": "from maze_tools import show_game\n\n# 関数セルを先に実行。接続部分はコピー可\ninitial = new_game(grid, start, goal, robot, robot_every=2)\npanel = show_game(initial, take_turn)\n\n# 自動生成した地図を使うなら別のセルで\n# board = load_maze(\"my_maze.json\")\n# initial = new_game(board, (1, 1), (len(board[0])-2, 1), (1, len(board)-2))\n# panel = show_game(initial, take_turn)",
    "remix": "敵を2体にするなら、stateに何を入れる？ 1体ずつ動かす順番で難しさは変わる？ まず別名のNotebookに保存し、1体版を残してから挑戦しよう。"
  }
];
