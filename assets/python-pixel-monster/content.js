const PIXEL_LESSONS = [
  {
    "title": "1ピクセルから、モンスター誕生",
    "tag": "Pillow / RGBA / 座標 / 属性",
    "goal": "文字の設計図を、透明な背景の16×16画像に変える。",
    "spec": [
      "Image.newで16×16のRGBA画像を作る。設計図の.は透明、他の文字はパレットの色にする。",
      "enumerateでxとyを取り出し、putpixelで1点ずつ塗る。",
      "size・mode・getpixelの値を確かめ、見やすく拡大して表示。元の16×16画像をmonster.pngとして保存する。"
    ],
    "ideas": [
      [
        "画像の正体は、場所ごとの色",
        "左上が(0, 0)、右へx、下へyが増える。16×16なら座標は0〜15。設計図はdesign[y][x]、Pillowの座標は(x, y)で渡す。"
      ],
      [
        "属性とメソッドを使い分ける",
        "monster.sizeは(幅, 高さ)、monster.modeは色の持ち方を読む属性。括弧を付けない。monster.getpixel((x, y))は、その場所の色を取り出すメソッド。こちらは括弧で材料を渡す。"
      ],
      [
        "拡大した絵と、元の画像",
        "resizeは新しい画像を返す。表示を320×320にしても、monster自体は16×16のまま。細かい描き込みが増えるわけではない。"
      ]
    ],
    "tools": [
      [
        "Image.new(\"RGBA\", (16, 16), (0, 0, 0, 0))",
        "RGBAは赤・緑・青・透明度の4つ。最後の0で透明なキャンバスを作る。"
      ],
      [
        "image.putpixel((x, y), color)",
        "画像そのものの1ピクセルを変更するメソッド。戻り値をimageへ代入しない。"
      ],
      [
        "image.size / image.mode",
        "属性。sizeは幅と高さのタプル。RGBAのgetpixelは4つの値を返す。"
      ],
      [
        "enumerate(design) / enumerate(row)",
        "番号と中身を同時に取り出す。外側でyと1行、内側でxと1文字。ここでは番号が0から始まる。"
      ],
      [
        "image.getpixel((x, y))",
        "その場所の色を取り出す。RGBAなら(R, G, B, A)の4つ。printで数値を見る。"
      ],
      [
        "display(image.resize((320, 320), Image.Resampling.NEAREST))",
        "元画像は変えずに拡大し、Notebookに表示する。NEARESTはドットの境目を保つ。"
      ],
      [
        "image.save(\"monster.png\")",
        "作業フォルダへ画像ファイルを保存。同じ名前のファイルは上書き。monsterには元の16×16画像を残して保存しよう。"
      ]
    ],
    "starter": "from PIL import Image\nfrom IPython.display import display\n\ndesign = (\n    '................',\n    '....##....##....',\n    '...#HH#..#HH#...',\n    '..#BBBB##BBBB#..',\n    '.#BBBBBBBBBBBB#.',\n    '.#BBBWWBBWWBBB#.',\n    '.#BBBWEBBEWBBB#.',\n    '.#BBCBBBBBBCBB#.',\n    '.#BBBBB##BBBBB#.',\n    '..#BBBBBBBBBB#..',\n    '...#BBBBBBBB#...',\n    '..#BB######BB#..',\n    '.#BBB#....#BBB#.',\n    '.####......####.',\n    '................',\n    '................',\n)\npalette = {\n    '.': (0, 0, 0, 0),\n    '#': (32, 44, 71, 255),\n    'B': (113, 87, 223, 255),\n    'H': (186, 169, 255, 255),\n    'W': (250, 250, 255, 255),\n    'E': (20, 25, 40, 255),\n    'C': (255, 120, 165, 255),\n}\n\ndef draw_monster(design, palette):\n    # 透明な画像 → 設計図を1点ずつ塗る → return\n    raise NotImplementedError(\"モンスターを描こう\")",
    "hints": [
      "Image.newには(幅, 高さ)。幅はlen(design[0])、高さはlen(design)。",
      "外側for y, row in enumerate(design)、内側for x, symbol in enumerate(row)。色はpalette[symbol]。"
    ],
    "answer": "def draw_monster(design, palette):\n    height = len(design)\n    width = len(design[0])\n    image = Image.new(\"RGBA\", (width, height), (0, 0, 0, 0))\n    for y, row in enumerate(design):\n        for x, symbol in enumerate(row):\n            image.putpixel((x, y), palette[symbol])\n    return image\n\nmonster = draw_monster(design, palette)\nprint(monster.size, monster.mode)\nprint(\"左上:\", monster.getpixel((0, 0)))\ndisplay(monster.resize((320, 320), Image.Resampling.NEAREST))\nmonster.save(\"monster.png\")",
    "tests": "assert monster.size == (16, 16)\nassert monster.mode == \"RGBA\"\nassert monster.getpixel((0, 0))[3] == 0\nassert monster.getpixel((2, 4)) == palette[\"B\"]\nprint(\"サイズ・色・透明な背景 OK\")",
    "connect": "from monster_tools import show_pixels\n\n# 背景の市松模様は、透明な場所を見やすくする表示用\nshow_pixels(monster)",
    "remix": "設計図の目を1ピクセル横へ動かして描き直す。印象はどう変わる？ 標準デザインから変えた場所をメモし、確認コードの座標も必要に応じて変えよう。"
  },
  {
    "title": "色違いと、おばけを作る",
    "tag": "RGB / アルファ / copy / 色の置換",
    "goal": "体の色だけを変え、透明度を持つ画像を作る。",
    "spec": [
      "replace_color(image, old, new)を作る。元の画像を残し、指定色と完全に一致するピクセルだけ置き換える。",
      "赤い体、青い体、半透明の体の3種類を作る。目や輪郭は変えない。",
      "RGBAの4番目を0・90・255で比べる。RGBが同じでも見え方が変わることを確かめる。"
    ],
    "ideas": [
      [
        "RGBは色、Aは透け方",
        "赤・緑・青は0〜255。Aは0なら完全に透明、255なら不透明。白色(255,255,255,255)と透明(0,0,0,0)は違う。"
      ],
      [
        "同じ画像への別名と、コピー",
        "result = imageでは同じ画像を指す。result = image.copy()で別の画像を作る。加工後に元の画像も表示し、変わっていないか確かめよう。"
      ],
      [
        "指定した色だけが変わる",
        "この関数は4つの値が完全一致する色を探す。似た紫でも数値が違えば変わらない。滑らかな拡大後は中間色が増えるので、元の16×16を加工する。"
      ]
    ],
    "tools": [
      [
        "image.copy()",
        "別の画像を作るメソッド。元を残す加工に使う。"
      ],
      [
        "image.width / image.height",
        "幅と高さをそれぞれ読む属性。"
      ],
      [
        "getpixel(...) == old",
        "RGBAのタプルを比べる。RGB画像の3要素と、RGBAの4要素は同じ比較にはならない。"
      ]
    ],
    "starter": "def replace_color(image, old, new):\n    # コピー → 全ピクセルを見る → 同じ色だけ変更 → return\n    raise NotImplementedError(\"色の置換を書こう\")",
    "hints": [
      "コピーしたresultをrange(result.height)とrange(result.width)で調べる。",
      "putpixelするのはgetpixel((x,y)) == oldのときだけ。元画像imageには書き込まない。"
    ],
    "answer": "def replace_color(image, old, new):\n    result = image.copy()\n    for y in range(result.height):\n        for x in range(result.width):\n            if result.getpixel((x, y)) == old:\n                result.putpixel((x, y), new)\n    return result\n\nred = replace_color(monster, palette[\"B\"], (235, 80, 75, 255))\nblue = replace_color(monster, palette[\"B\"], (40, 165, 220, 255))\nghost = replace_color(monster, palette[\"B\"], (113, 87, 223, 90))",
    "tests": "assert monster.getpixel((2, 4)) == palette[\"B\"]\nassert red.getpixel((2, 4)) == (235, 80, 75, 255)\nassert ghost.getpixel((2, 4))[3] == 90\nassert red.getpixel((5, 5)) == monster.getpixel((5, 5))\nprint(\"元の絵・体の色・目・半透明 OK\")",
    "connect": "from monster_tools import show_pixels, show_gallery\n\nshow_gallery([monster, red, blue, ghost], columns=4)\nghost.save(\"monster_ghost.png\")",
    "remix": "体を(0,0,0,0)へ置換すると、目と輪郭が浮いたモンスターになる。色が変わったピクセル数も関数から返す改造に挑戦しよう。"
  },
  {
    "title": "反転・切り抜き・拡大を比べる",
    "tag": "open / crop / transpose / 補間",
    "goal": "保存した画像を読み、加工方法の違いを目で確かめる。",
    "spec": [
      "monster.pngをImage.openで読み、RGBAにそろえる。ファイルの形式・色の持ち方・サイズを表示する。",
      "左右反転、顔の切り抜き、ドットを保つ拡大、滑らかな拡大を作る。",
      "元の画像は16×16のままか確認。顔と拡大版は別のファイル名で保存する。"
    ],
    "ideas": [
      [
        "切り抜く範囲は右と下を含まない",
        "crop((left, top, right, bottom))。ここでは(2,3,14,11)なので、幅14-2=12、高さ11-3=8。最後の座標を含まない範囲は、rangeにも出てきたね。"
      ],
      [
        "ドットを保つか、なめらかにするか",
        "NEARESTは近い元ピクセルの色を使い、ドットの境目を保つ。BILINEARは周囲の色を混ぜるので、中間色が増えて境目がぼける。目的に合わせて使い分ける。"
      ],
      [
        "対称なら反転しても同じ",
        "標準モンスターは左右対称。反転の効果を見るため、片側にほくろを描いたコピーでも試そう。変化が見えないことにも理由がある。"
      ]
    ],
    "tools": [
      [
        "Image.open(\"monster.png\")",
        "ファイルを読む。withで開き、convertで作った画像を外へ持ち出せる。"
      ],
      [
        "image.crop((2, 3, 14, 11))",
        "指定した範囲を新しい画像として取り出す。"
      ],
      [
        "image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)",
        "左右を反転した新しい画像を返す。"
      ]
    ],
    "starter": "with Image.open(\"monster.png\") as file_image:\n    loaded = file_image.convert(\"RGBA\")\n\n# loadedからflipped・face・sharp・smoothを作ろう",
    "hints": [
      "拡大はresize((320,320), Image.Resampling.NEAREST)。比較側はBILINEAR。",
      "反転が分かりにくければ、コピーの(3,4)を白くしてから反転し、反対側へ移るか確かめる。"
    ],
    "answer": "with Image.open(\"monster.png\") as file_image:\n    print(\"ファイル:\", file_image.format, file_image.mode, file_image.size)\n    loaded = file_image.convert(\"RGBA\")\n\nflipped = loaded.transpose(Image.Transpose.FLIP_LEFT_RIGHT)\nface = loaded.crop((2, 3, 14, 11))\nsharp = loaded.resize((320, 320), Image.Resampling.NEAREST)\nsmooth = loaded.resize((320, 320), Image.Resampling.BILINEAR)\nprint(\"顔のサイズ:\", face.size)\nface.save(\"monster_face.png\")\nsharp.save(\"monster_large.png\")",
    "tests": "assert loaded.size == (16, 16)\nassert face.size == (12, 8)\nassert sharp.size == (320, 320)\nassert flipped.getpixel((15 - 2, 4)) == loaded.getpixel((2, 4))\nmarked = loaded.copy()\nmarked.putpixel((3, 4), (255, 0, 0, 255))\nmirror = marked.transpose(Image.Transpose.FLIP_LEFT_RIGHT)\nassert mirror.getpixel((12, 4)) == (255, 0, 0, 255)\nprint(\"切り抜き範囲・拡大・反転の位置 OK\")",
    "connect": "from monster_tools import show_pixels\n\nshow_pixels(flipped)\nshow_pixels(face)\n# 拡大済みの画像をさらに加工せず、そのまま並べて見る\ndisplay(sharp, smooth)",
    "remix": "顔を大きくして、胴体を小さくした進化形を考えよう。次の回では別々の画像を組み合わせられる。"
  },
  {
    "title": "自分のモンスターチーム",
    "tag": "画像の合成 / 座標 / 余白",
    "goal": "色違いを並べたチーム画像と、背景つきの1枚を作る。",
    "spec": [
      "56×20の背景を作り、3体を(2,2)、(20,2)、(38,2)へ並べる。",
      "alpha_compositeで透明度を生かして重ねる。透明な場所は背景が見える。",
      "monster_team.pngへ保存。半透明のおばけを暗い背景にも重ねて比べる。"
    ],
    "ideas": [
      [
        "配置も足し算で決まる",
        "幅16の絵を、間隔2で並べる。x=2+i*18なら、左余白2、絵16、隙間2の繰り返しになる。"
      ],
      [
        "白い四角を貼るのとは違う",
        "透明な場所は下の背景を残す。半透明の場所は背景と色が混ざる。元のRGBだけ見ても、合成後の見え方は決まらない。"
      ],
      [
        "合成で変わるのは背景側",
        "team.alpha_composite(...)はteamそのものを変更する。このメソッドの戻り値をteamへ代入しない。2枚ともRGBAにして使う。"
      ]
    ],
    "tools": [
      [
        "team.alpha_composite(image, dest=(x, y))",
        "透明度を計算して、指定位置へ画像を重ねる。"
      ],
      [
        "enumerate(variants)",
        "画像と、その番号iを同時に取り出す。"
      ],
      [
        "image.save(\"monster_team.png\")",
        "拡張子に合わせて保存。PNGなら透明度を持つ画像を保存できる。"
      ]
    ],
    "starter": "variants = [monster, red, blue]\nteam = Image.new(\"RGBA\", (56, 20), (238, 243, 250, 255))\n# iからxを計算し、1体ずつ合成する",
    "hints": [
      "for i, image in enumerate(variants): の中で、x = 2 + i * 18。",
      "dest=(x, 2)へ合成。保存はforの外に置き、3体がそろってから行う。"
    ],
    "answer": "variants = [monster, red, blue]\nteam = Image.new(\"RGBA\", (56, 20), (238, 243, 250, 255))\nfor i, image in enumerate(variants):\n    x = 2 + i * 18\n    team.alpha_composite(image, dest=(x, 2))\nteam.save(\"monster_team.png\")\n\n# 半透明の体を、違う背景に重ねる\nnight = Image.new(\"RGBA\", (20, 20), (24, 35, 58, 255))\nnight.alpha_composite(ghost, dest=(2, 2))",
    "tests": "assert team.size == (56, 20)\nassert team.getpixel((0, 0)) == (238, 243, 250, 255)\nassert team.getpixel((4, 6)) == monster.getpixel((2, 4))\nassert team.getpixel((22, 6)) == red.getpixel((2, 4))\nassert night.getpixel((4, 6))[3] == 255\nprint(\"配置・余白・合成後の透明度 OK\")",
    "connect": "from monster_tools import show_pixels\n\nshow_pixels(team, scale=8)\nshow_pixels(night)",
    "remix": "2行3列の6体チームに改造しよう。i % 3が列、i // 3が行になる。キャンバスの幅と高さも先に計算しよう。"
  },
  {
    "title": "モンスター自動生成工場",
    "tag": "左右対称 / 乱数 / seed / 図鑑",
    "goal": "色と体形を決めるルールを書き、9体の図鑑を作る。",
    "spec": [
      "make_monster(seed)は16×16のRGBA画像を返す。seedから体色と各行の幅を決める。",
      "左側に描いた色をx=15-xの場所にも描き、左右対称にする。",
      "目と口を最後に描き、同じseedで同じ絵ができるか確認。seed=0〜8の9体を並べる。"
    ],
    "ideas": [
      [
        "ランダムだけでは形にならない",
        "体は3〜11行に置く、目は顔の中、左右は対称、といったルールが形を支える。その範囲で色や幅をランダムにすると、仲間らしさと違いが両立する。"
      ],
      [
        "なぜ16-xではなく15-x？",
        "16ピクセルの座標は0〜15。左端0に対応する右端は15。x=7の相手は8。範囲の端を知っておくと、反転の式を自分で作れる。"
      ],
      [
        "好きな個体を再び作る",
        "同じコード・同じseedなら同じ画像になる。気に入ったseedをメモしよう。生成のコードを変えると同じseedでも変わるので、画像自体も保存しておく。"
      ]
    ],
    "tools": [
      [
        "rng = random.Random(seed)",
        "この生成専用の乱数発生器。"
      ],
      [
        "rng.randint(50, 220)",
        "端を含む整数を選ぶ。色の範囲を絞って雰囲気をそろえる。"
      ],
      [
        "image.putpixel((15 - x, y), body)",
        "左側と同じ色を、右側の対応位置へ描く。"
      ]
    ],
    "starter": "import random\n\ndef make_monster(seed=0):\n    rng = random.Random(seed)\n    image = Image.new(\"RGBA\", (16, 16), (0, 0, 0, 0))\n    # 色 → 左半分と右半分の体 → 目と口 → return\n    raise NotImplementedError(\"自分の生成ルールを書こう\")",
    "hints": [
      "まず1色で左右対称の体だけ描く。行ごとのleftを変えて体の幅を変える。",
      "目と口は体を描き終わってから。順番を逆にすると、体に上書きされる。"
    ],
    "answer": "import random\n\ndef make_monster(seed=0):\n    rng = random.Random(seed)\n    body = (rng.randint(50, 220), rng.randint(50, 220), rng.randint(50, 220), 255)\n    outline = (32, 44, 71, 255)\n    image = Image.new(\"RGBA\", (16, 16), (0, 0, 0, 0))\n    for y in range(3, 12):\n        left = rng.randint(2, 5)\n        for x in range(left, 8):\n            image.putpixel((x, y), body)\n            image.putpixel((15 - x, y), body)\n        image.putpixel((left - 1, y), outline)\n        image.putpixel((16 - left, y), outline)\n    for x in [5, 6, 9, 10]:\n        for y in [5, 6]:\n            image.putpixel((x, y), (250, 250, 255, 255))\n    for x in [6, 9]:\n        image.putpixel((x, 6), (20, 25, 40, 255))\n    for x in [7, 8]:\n        image.putpixel((x, 9), outline)\n    for x in [5, 6, 9, 10]:\n        image.putpixel((x, 12), outline)\n    return image\n\ncollection = [make_monster(seed) for seed in range(9)]",
    "tests": "a = make_monster(42)\nb = make_monster(42)\nassert a.tobytes() == b.tobytes()\nassert a.size == (16, 16)\nfor y in range(16):\n    for x in range(16):\n        assert a.getpixel((x, y)) == a.getpixel((15 - x, y))\nprint(\"同じseedの再現・左右対称 OK\")",
    "connect": "from monster_tools import show_gallery\n\nshow_gallery(collection, columns=3)\nmake_monster(42).save(\"monster_seed42.png\")",
    "remix": "角の数、目の高さ、体の色範囲を変えよう。強さを表す数値から色や大きさを決めれば、ゲームのキャラクター生成にもつながる。"
  },
  {
    "title": "まばたきGIFで、命を吹き込む",
    "tag": "フレーム / copy / 表示時間 / GIF",
    "goal": "2枚の絵をつないで動かし、友達に渡せるGIFを作る。",
    "spec": [
      "monsterをcopyして目を閉じた画像closedを作る。元の目は残す。",
      "通常650ms・閉じた目140msの2枚を繰り返す。時間を変えて、まばたきの印象を比べる。",
      "透明度のあるPNGと、動くGIFを別々に保存。GIFを読み直してフレーム数を確かめる。"
    ],
    "ideas": [
      [
        "動いているのは、絵の切り替え",
        "目だけ変えた2枚でも、速く切り替えるとまばたきに見える。動きの印象は、絵だけでなく表示時間でも変わる。1000msが1秒。"
      ],
      [
        "コピーしないと、両方の目が閉じる",
        "closed = monsterだと同じ画像への別名になる。片方を編集すると元も変わる。ここでもcopyが必要。"
      ],
      [
        "PNGとGIFの違い",
        "PNGは今回の元画像や半透明の作品を保存する。GIFはアニメーションを保存できるが、この部品では透明か不透明の2段階、透明色を除いて255色まで。半透明のおばけはPNGで残そう。"
      ]
    ],
    "tools": [
      [
        "frames = [monster.copy(), closed]",
        "画像を並べたリスト。表示したい順番で入れる。"
      ],
      [
        "durations = [650, 140]",
        "各フレームの表示時間。GIF用は10ms単位で、20〜5000msにする。"
      ],
      [
        "movie.n_frames / movie.seek(1)",
        "GIFのフレーム数を読む属性と、2枚目へ移動するメソッド。先頭は0枚目。"
      ]
    ],
    "starter": "closed = monster.copy()\n# 標準の目はx=5,6,9,10、y=5,6\n# 上の段は体色、下の段は線にして閉じた目を描こう\n\nframes = [monster.copy(), closed]\ndurations = [650, 140]",
    "hints": [
      "標準画像の目は上下2行。上段を体色で消し、下段を輪郭色にする。自作の目なら座標を合わせる。",
      "GIFの色の割り当てと透明背景の処理は完成部品に任せる。自分で作るのはフレームとタイミング。"
    ],
    "answer": "# 目の位置は標準デザインの座標。自分の絵に合わせて変えてよい。\nclosed = monster.copy()\nfor x in [5, 6, 9, 10]:\n    closed.putpixel((x, 5), palette[\"B\"])\n    closed.putpixel((x, 6), palette[\"#\"])\n\nframes = [monster.copy(), closed]\ndurations = [650, 140]",
    "tests": "assert monster.getpixel((5, 5)) == palette[\"W\"]\nassert closed.getpixel((5, 5)) == palette[\"B\"]\nassert closed.getpixel((5, 6)) == palette[\"#\"]\nassert frames[0].tobytes() != frames[1].tobytes()\nprint(\"元の目を残した・2枚が異なる OK\")",
    "connect": "from monster_tools import preview_animation, save_gif\n\npreview_animation(frames, durations)\nsave_gif(frames, \"monster_blink.gif\", durations, scale=16)\nclosed.save(\"monster_closed.png\")\n\n# 作ったファイルを読み直す\nwith Image.open(\"monster_blink.gif\") as movie:\n    print(\"GIFの枚数:\", movie.n_frames)\n    assert movie.n_frames == 2",
    "remix": "閉じた目を500msにすると眠そうになる？ 3枚目に口が開いた画像を加えると？ 同じ絵が続くとGIF保存時にまとめられることがあるので、フレーム数の期待値も見直そう。"
  }
];
