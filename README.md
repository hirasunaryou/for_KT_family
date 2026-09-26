# 家族のまなび帳

学校の勉強や日々の疑問を、読んで、動かして、考える家族用サイトです。

**[家族の入口](https://hirasunaryou.github.io/for_KT_family/)**

- [Python新テーマ：迷路メーカー＆脱出ロボット](https://hirasunaryou.github.io/for_KT_family/study/programming/python-maze-robot/)
- [Python続編：サイコロ金庫破り](https://hirasunaryou.github.io/for_KT_family/study/programming/python-dice-vault/)
- [Python：JupyterLabでサイコロ探偵を作る](https://hirasunaryou.github.io/for_KT_family/study/programming/python-dice-jupyter/)
- [Python：ブラウザで実行するサイコロ探偵](https://hirasunaryou.github.io/for_KT_family/study/programming/python-dice/)
- [相似：紙の3冊と4つのWeb体験](https://hirasunaryou.github.io/for_KT_family/study/math/similarity/)
- [二次関数：中3 y = ax²](https://hirasunaryou.github.io/for_KT_family/study/math/quadratic-functions/)
- [平方根：中3](https://hirasunaryou.github.io/for_KT_family/study/math/square-roots/)
- [日々の疑問](https://hirasunaryou.github.io/for_KT_family/questions/)：記事を追加するための入口。現在は記事なし。

円教材の原稿・構成・再生成方法は [materials/circle/README.md](materials/circle/README.md) を参照してください。

## 教材を制作・改訂する方へ

[AGENTS.md](AGENTS.md) に、紙とWebの役割、図と式の対応、読みやすさ、良問・解答設計、検証・公開の方針をまとめています。

## ページの階層

| 場所 | 役割 |
| --- | --- |
| `index.html` | 家族全体の入口・おすすめ教材 |
| `study/index.html` | 勉強の入口・教科一覧 |
| `study/math/index.html` | 数学の単元一覧 |
| `study/math/square-roots/index.html` | 平方根の教材 |
| `study/math/quadratic-functions/index.html` | 二次関数の教材 |
| `study/programming/index.html` | プログラミングの入口・2つの学び方 |
| `study/programming/python-dice-jupyter/index.html` | JupyterLabで自分で作る説明サイト |
| `study/programming/python-dice/index.html` | ページ内でPythonを実行する版 |
| `assets/python-dice-jupyter/` | JupyterLab説明版の文章・表示・チェック |
| `assets/python-dice/` | ブラウザ実行版のコード・スタイル・Worker |
| `materials/python-dice/` | 完成部品dice_tools.py・空のNotebook・管理メモ |
| `questions/index.html` | 日々の疑問の一覧 |
| `questions/<topic>/index.html` | 今後追加する読み物の定位置 |
| `assets/family/` | 家族サイト共通のスタイル |
| `assets/quadratic/` | 二次関数の操作・問題データ |
| `assets/app.js`, `assets/questions.js`, `assets/style.css` | 既存の平方根専用資産 |
| `print/` | 既存URLを保つ印刷PDF置き場 |
| `materials/` | 原稿・問題データなどの素材 |

分類は「利用目的 → 教科 → 単元」。人名・学年・作成年をURLに入れず、画面上のラベルで示します。兄弟や別の学年でも同じ教材を使い回せます。日々の疑問はまず1記事1フォルダで追加し、記事が増えたら一覧をテーマ別に整理します。

以前のトップページの `#home`, `#learn/...`, `#practice/...`, `#results` は平方根の新しい場所へ転送します。ハッシュのない旧トップURLは家族の入口になりました。平方根の学習記録は同じオリジン・保存キーを使うため、GitHub Pages上ではそのまま引き継ぎます。

## 新しいページを追加する

1. 学習教材なら `study/<subject>/<topic>/index.html`、読み物なら `questions/<topic>/index.html` を作ります。フォルダ名は英小文字とハイフンで、話題が変わらない名前にします。
2. 共通ヘッダー（ホーム・勉強・日々の疑問）、パンくず、目次、フッターを既存ページに合わせます。共通CSSは `assets/family/style.css`。
3. その親の一覧に、タイトル・対象・短い説明・リンクのカードを追加します。必要なら家族トップにも載せます。未完成のリンクは置きません。
4. CSS・JavaScriptが単元固有なら `assets/<topic>/`、印刷PDFは `print/<topic>-guide.pdf` などへ置きます。
5. 記録を保存する場合は `family-<topic>-v1` のように教材固有のキーを使い、他の教材を上書きしないようにします。
6. 通常の教材UIは外部CDNに依存せず、リポジトリ内の相対リンクを使います。Pythonブラウザ実行版だけは、要求された実行機能のためバージョン固定のPyodideをjsDelivrから読み込みます。この例外と通信要件を画面に明記します。`/assets/...` のような先頭スラッシュはGitHub PagesのプロジェクトURLで壊れるため避けます。
7. `npm test` で既存教材の操作も確認します。新しい操作は対応するテストを追加します。

小規模な教材なので、現在はビルド不要のHTML/CSS/JavaScriptで構成しています。一覧は手動更新です。教材が大幅に増えた時点で一覧生成を導入できます。

## 二次関数の使い方

3つの図で「予想 → 操作 → 結果の説明」を行います。

- 係数a：−10〜10を0.05刻みで変更。スライダー・数値入力・プリセット・符号反転、y = x²との比較、対称点と表を連動表示。a = 0は比較用の直線として説明。縦軸±5・±20・±100を切替でき、範囲外の点は描かず案内します。
- 変域：左右の端とaを変更。0を含むかを判定し、区間とyの範囲を強調。左右が同じ値のときも扱います。
- 変化の割合：異なる2つのxを変更。2点を結ぶ直線、増加量、計算結果を連動表示。分母が0にならないよう最小間隔0.5を保ちます。

すべてのグラフでxとyの1の長さを揃えています。放物線の形・変域・変化の割合は、縦軸の範囲と描画枠の縦横比から横軸の範囲を決め、同縮尺のまま枠全体に描画します。目盛りの間隔も縦横共通で、方眼は正方形です。表示範囲を変更した場合も縦横を同じ倍率で拡大・縮小します。形の比較は初期表示の±5がおすすめです。広い範囲でも原点付近が折れ線にならないよう、放物線は画面内に見える部分を細かくサンプリングします。

三角形OABの実験では、aを−3〜3（0.25刻み）、Aのxを−3〜−0.5、Bのxを0.5〜3（各0.5刻み）で動かせます。Aはy軸の左、Bは右に限定し、OACとOCBの面積を加算します。全体→分割→底辺と高さ→面積の計算の4段階で表示。a = 0では面積0、a < 0でも長さと面積は負にならないことを説明します。最小値の計算も途中の丸めで不一致にならない精度で表示します。

三角形の拡大率は全点が見えるよう自動調整します。「目盛りを固定」で現在の範囲を保持でき、点が外に出た場合は案内と全体表示に戻すボタンを用意しています。「aだけ2倍」は現在の点のxを維持し、2倍のaが範囲内に入るときだけ使えます。

問題は印刷版と同じ44問。問13・14には図・表があり、問13は解答にもグラフを表示します。自動採点ではなく、紙で解き、解答・解説と比較して自己評価をつけます。最初1〜6・最後29〜34・再挑戦39〜44は同じ型。発展35〜38と再挑戦は任意です。

問題文の原稿は `materials/quadratic/questions.json`。表示用データは `python3 scripts/build-quadratic-questions.py` で生成します（原稿編集時のみ `latex2mathml==3.78.1` が必要）。

自己評価は `family-quadratic-functions-v1` に保存。比較表は最新の自己評価です。平方根の「初回回答の点数」とは異なる方式であることを画面に明記しています。

## 平方根の使い方

面積・数直線・ルートの整理の図と、印刷版に対応する46問です。最初と最後の各8問は選択式で自動判定。それ以外は解答と自己評価です。記録は `family-square-roots-v1` に保存し、初回回答と解き直しを区別します。平方根では記録のJSON書き出し・読み込みもできます。

## 印刷教材

| 単元 | 解説 | 問題集 | 解答と解説 |
| --- | --- | --- | --- |
| 平方根 | [5ページ](print/square-roots-guide.pdf) | [7ページ](print/square-roots-workbook.pdf) | [6ページ](print/square-roots-answers.pdf) |
| 二次関数 | [6ページ](print/quadratic-functions-guide.pdf) | [8ページ](print/quadratic-functions-workbook.pdf) | [8ページ](print/quadratic-functions-answers.pdf) |

## 閲覧・公開・記録

GitHub Pagesは main ブランチのルートから配信する設定です。今回の整理で公開範囲・設定は変更していません。URLを知っている人は閲覧できます。公開する教材には氏名・家庭の非公開情報を含めません。

閲覧にはログイン、APIキー、ビルドは不要。Code → Download ZIPから取得し、展開して `index.html` を新しいブラウザで開けば、数学教材とJupyterLab説明サイトはオフラインでも読めます。Pythonブラウザ実行版は公開URL、または単体版の `study/programming/python-dice/dice-lab.html` を使い、Pyodideの読み込みにネット接続が必要です。JupyterLab版はPCのPythonで実行し、ボタン版の初回準備ではipywidgetsのインストールが必要な場合があります。JupyterLabで作る完成ゲームHTMLはオフラインで遊べます。MathML対応の新しいChrome / Edge / Safari / Firefoxを使ってください。

学習記録は各ブラウザのlocalStorage内だけに保存し、GitHubやサーバーへ送信しません。広告・アクセス解析・外部フォントは使いません。数学教材とJupyterLab説明サイトには外部JavaScriptはありません。Pythonブラウザ実行版のみPyodide 0.27.7を `https://cdn.jsdelivr.net/pyodide/v0.27.7/full/` から読み込むため、その配信元にも通常のアクセスが発生します。配信時の通常のアクセスはGitHub側に発生します。記録は端末・ブラウザ・オリジンごとで自動同期されず、閲覧データの削除で消えます。保存不可時は画面に案内して、その画面内では利用を継続できます。

## Python：2つの版とファイルの置き場所

最初に勧めるのは **JupyterLab説明版**。サイトは説明・コピー・ヒントに専念し、本人が自分のJupyterLabでコードを入力して実行します。ブラウザ実行版は、その場で試したいときの別ルートです。

JupyterLabの左側で `python_games/dice_detective/` を作り、以下を同じ場所に置きます。これは**学習者のPCの作業フォルダ**であり、公開リポジトリに個人の実験メモを保存する指示ではありません。

| ファイル名 | 用意・保存 | 開き方 |
| --- | --- | --- |
| `dice_lab.ipynb` | Notebookを新規作成して名前をつける。保存マークで保存 | JupyterLabの左の一覧でダブルクリック |
| `dice_tools.py` | 説明ページからダウンロードし、同じ作業フォルダへUpload Files | Notebookのimportで使う。直接実行不要 |
| `my_dice_game.html` | 最後のsave_gameセルで生成。右クリック→Downloadで取り出す | 通常のブラウザ。友達にはこの1ファイル |

準備ページには、New Folder、Rename、Upload Files、Codeセル、Shift+Enter、保存、次の日の再開を順に記載しています。ダウンロード先、重複名の `(1)`、`.py.txt`、Kernelの実行順、ウィジェット表示、HTMLプレビューで動かない場合も案内します。

完成部品の `create_game` はPythonのroll関数を呼び出し、ipywidgetsで操作画面を出します。`save_game` はタイトル・3種類のくじ配置・調査上限を、外部依存のないHTMLゲームに保存します。任意のPython関数をJavaScriptに自動変換するものではなく、教材の「リストから均等に選ぶ」ルールが対象です。

ブラウザ実行版には独立Worker、15秒実行停止、200行出力上限があります。JupyterLabで本人が実行するコードにはその制限はないため、停止方法と大量出力の注意を説明しています。

進み具合の保存キーは `family-python-dice-jupyter-v1`（説明サイトのチェック）と `family-python-dice-v1`（ブラウザ実行版）。Notebook本体はJupyterLab側で保存し、サイトのチェックとは別です。以前のSites版のブラウザ記録は異なるオリジンなので自動移行しません。

ブラウザ単体HTMLは `python3 scripts/build-python-dice-portable.py` で再生成。JupyterLab説明サイトは手書きの静的HTML/JS/CSSで、ビルドは不要です。配置の詳細は [materials/python-dice/README.md](materials/python-dice/README.md) に記載しています。

## 開発

```bash
python3 -m http.server 8000
```

`http://localhost:8000/` を開きます。操作検証は [tests/README.md](tests/README.md) を参照してください。


## Python続編：サイコロ金庫破り

- 説明サイトとブラウザの完成見本: `study/programming/python-dice-vault/`
- 文章・見本ルール・表示: `assets/python-dice-vault/`
- 配布部品とNotebook: `materials/python-dice-vault/`
- 作業フォルダ: `python_games/dice_vault/`。自作コードは `vault_lab.ipynb`、画面部品は `vault_ui.py`。前編とは別ファイル。
- 全6回: 状態設計、持ち帰りと終了、シールド、CPU、自動実験、JSONセーブ。仕様を先に示し、読み物・道具・ヒント・完成例は段階的に開く。
- ルールは学習者が渡すPython関数で動く。画面部品は乱数とボタンと表示だけを担当。HTMLへのPython変換は提供しない。友達へはNotebookと画面部品を渡し、JupyterLabで実行する。
- 完成見本は別のJavaScript実装。Notebookの変更は自動反映されない。参考Pythonと既定ルールの整合性を検証する。
- セーブは状態だけ。乱数の内部状態は保存しないので再開後の出目までは再現しない。全体の完成例は別名で配布し、学習者のNotebookを上書きしない。
- 学習チェック: `family-python-dice-vault-v1`。前編の記録を保持し、別キーに保存する。


## Python新テーマ：迷路メーカー＆脱出ロボット

- 入口: `study/programming/python-maze-robot/`。資産: `assets/python-maze-robot/`。配布ファイル: `materials/python-maze-robot/`。
- 6回の制作: Matplotlibで地図描画、座標と壁判定、集合で足跡記録、dequeで幅優先探索、候補生成と到達性検査、追跡ロボットからの脱出。
- サイト見本は探索の再生・停止・段階スライダー、壁編集、自動生成、地図JSON保存、脱出ゲームを提供する。P/S=自分・開始、G=ゴール、R=敵。xは右、yは下、縦横同縮尺。
- 学習者は `python_games/maze_robot/maze_lab.ipynb` に自作関数を書く。`maze_tools.py` は描画・再生・ボタン・地図ファイルの読み書きだけを担当し、学習者の移動・探索・手番関数を使用する。Matplotlib・ipywidgetsが必要。
- サイトとNotebookのコードは自動同期しない。共通形式 `my_maze.json` は `{version: 1, grid: [...]}`。壁配置のみで、途中のゲーム状態は含まない。サイトから保存したファイルはJupyterLab側へUpload Filesして使う。
- 自動生成はランダムな壁を配置して、開始→出口・敵→開始の到達性を検査する。全通路の連結や追跡ゲームの勝利を保証するものではない。200案で停止。
- BFSが最短になる前提は上下左右の等コスト移動。探索順と実際の歩行経路は分けて表示する。到達不能・始点終点一致・同率の最短経路も教材に含む。
- 完成例は `maze_answers.ipynb` と `maze_reference.py`。自作Notebookとは別名で配布。地図の保存は自動実行しない。
- チェック保存キーは `family-python-maze-robot-v1`。既存教材と分離。


## Python新テーマ：ドット絵モンスター工房

- 入口: `study/programming/python-pixel-monster/`。資産: `assets/python-pixel-monster/`。配布物: `materials/python-pixel-monster/`。
- 全6回: ピクセルとRGBA、色の置換とコピー、反転・切り抜き・拡大、合成、自動生成、まばたきGIF。各回は仕様・道具カード・骨組み・段階ヒント・非表示の完成例・実験・改造を含む。
- 作業場所は `python_games/pixel_monster/`。自作Notebookは `monster_lab.ipynb`、表示と保存の部品は `monster_tools.py`。JupyterLabで `%pip install pillow` を実行。描画・色の置換・合成・生成・フレーム制作は学習者が書く。
- サイトはJavaScriptの16×16ドット絵見本。色と透明度の編集、座標の確認、フレームの編集・再生、取り消し、PNGと設計図JSONの保存・読込ができる。編集内容は自動保存しない。
- `monster_project.json` は16行×16文字の設計図・RGBAパレット・各絵の表示時間。JupyterLabへUpload Filesし、`load_project` でPillow画像へ変換する。Pythonでの加工結果はPNGへ保存し、設計図には自動同期しない。
- 友達へは `monster_large.png` や `monster_blink.gif` を渡す。PNGは半透明を保持。GIF部品は同じサイズのフレーム、透明度0または255、透明色を除き255色までに対応。共通パレットとdisposal=2でフレーム間の透明背景を保持する。
- 完成例 `monster_answers.ipynb` は画像を表示するだけで、既存画像を自動で上書きしない。`monster_reference.py` は描画・色変更・生成の関数を収録。
- チェック保存キーは `family-python-pixel-monster-v1`。Notebookと絵の保存はチェックとは別。
- 検証: `node tests/python-pixel.cjs` と `python3 tests/python-pixel.py`（Pillow・IPythonが必要）。npm testで既存教材と合わせて実行する。

## 二次方程式：印刷と6つの実験

`study/math/quadratic-equations/` に中3向けの教材を追加。平方根、因数分解、平方完成、解の公式、解法選択、文章題、二次関数とのつながりを扱う。

- `print/quadratic-equations-{guide,workbook,answers}.pdf`：解説8ページ、40問の問題集12ページ、解答解説12ページ。
- 数直線の±、積が0になる瞬間、平方完成の面積図、両辺への同じ操作、解の公式への代入、放物線と横線の交点を動かせる。
- グラフは縦横同一縮尺・固定目盛り。実数解が2つ/1つ/ない場合を区別する。
- 静的な解説とMathMLは外部通信不要。問題と自己評価はJavaScriptで操作。保存キー `family-quadratic-equations-v1` は既存教材と独立。
- 原稿・生成方法は `materials/quadratic-equations/README.md`。紙とWebの問題を別々に編集しない。

二次方程式の実験では、式変形の直前の式と操作も表示する。平方完成の辺長と並べ替えを3段階で説明し、解の公式には係数連動の y=ax²+bx+c のグラフを追加した。x軸との交点と実数解の個数を対応させる。

## 相似：紙で考え、4つの体験で確かめる

`study/math/similarity/` に、対応・相似条件・平行線と比・証明・面積比と体積比・活用を扱う教材を追加。

- 解説18ページ、32問＋体験メモの問題集16ページ、解答解説14ページ。
- 縦横の変形比較、重なった三角形の対応、平行の条件を外す実験、面積と体積の倍率の4体験。
- 予想を紙に書いてから操作し、別の問題で理解を確かめる。問29〜32は時間をおいた再挑戦。
- 紙とWebを同じ原稿から生成。静的な図も共通の図データを使用。
- JavaScript無効時も本文・全問題・解答・PDFを利用可能。自己評価は `family-similarity-v1` に保存。
- 原稿・再生成・検証の手順は [materials/similarity/README.md](materials/similarity/README.md)。
