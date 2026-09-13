# 家族のまなび帳

学校の勉強や日々の疑問を、読んで、動かして、考える家族用サイトです。

**[家族の入口](https://hirasunaryou.github.io/for_KT_family/)**

- [二次関数：中3 y = ax²](https://hirasunaryou.github.io/for_KT_family/study/math/quadratic-functions/)
- [平方根：中3](https://hirasunaryou.github.io/for_KT_family/study/math/square-roots/)
- [日々の疑問](https://hirasunaryou.github.io/for_KT_family/questions/)：記事を追加するための入口。現在は記事なし。

## ページの階層

| 場所 | 役割 |
| --- | --- |
| `index.html` | 家族全体の入口・おすすめ教材 |
| `study/index.html` | 勉強の入口・教科一覧 |
| `study/math/index.html` | 数学の単元一覧 |
| `study/math/square-roots/index.html` | 平方根の教材 |
| `study/math/quadratic-functions/index.html` | 二次関数の教材 |
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
6. 外部CDNに依存せず、リポジトリ内の相対リンクを使います。`/assets/...` のような先頭スラッシュはGitHub PagesのプロジェクトURLで壊れるため避けます。
7. `npm test` で既存教材の操作も確認します。新しい操作は対応するテストを追加します。

小規模な教材なので、現在はビルド不要のHTML/CSS/JavaScriptで構成しています。一覧は手動更新です。教材が大幅に増えた時点で一覧生成を導入できます。

## 二次関数の使い方

3つの図で「予想 → 操作 → 結果の説明」を行います。

- 係数a：−10〜10を0.05刻みで変更。スライダー・数値入力・プリセット・符号反転、y = x²との比較、対称点と表を連動表示。a = 0は比較用の直線として説明。縦軸±20と±100を切替でき、範囲外の点は描かず案内します。
- 変域：左右の端とaを変更。0を含むかを判定し、区間とyの範囲を強調。左右が同じ値のときも扱います。
- 変化の割合：異なる2つのxを変更。2点を結ぶ直線、増加量、計算結果を連動表示。分母が0にならないよう最小間隔0.5を保ちます。

放物線の形・変域・変化の割合は、選択した範囲内で固定した目盛りを使いますが、縦横の縮尺は異なります（画面に明記）。三角形と問題の方眼は縦横同縮尺です。

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

ログイン、APIキー、ビルドは不要。Code → Download ZIPから取得し、展開して `index.html` を新しいブラウザで開けば、オフラインでも教材を利用できます。MathML対応の新しいChrome / Edge / Safari / Firefoxを使ってください。

学習記録は各ブラウザのlocalStorage内だけに保存し、GitHubやサーバーへ送信しません。広告・アクセス解析・外部フォント・外部JavaScriptは使いません。配信時の通常のアクセスはGitHub側に発生します。記録は端末・ブラウザ・オリジンごとで自動同期されず、閲覧データの削除で消えます。保存不可時は画面に案内して、その画面内では利用を継続できます。

## 開発

```bash
python3 -m http.server 8000
```

`http://localhost:8000/` を開きます。操作検証は [tests/README.md](tests/README.md) を参照してください。
