# 二次方程式：紙とWebの共通教材

- 対象：中3。平方根・因数分解の復習から、平方完成、解の公式、文章題へ。
- 解説8ページ、問題集40問・12ページ、解答解説12ページ。A4。本文は日本語フォントを埋め込み、数式は250 dpi以上の画像で収録。
- 初回は問1〜24・29〜30。問25〜28・31〜36は追加練習、37〜40は翌日の再挑戦。
- `guide.json` は解説の共通原稿。`questions.json` は紙・Web双方の問題番号、問題、ヒント、解答、途中式、注意点。
- `labs.json` はWebだけの6実験。単元ページは生成物。編集後はビルダーを実行する。

## 再生成

```sh
python -m pip install reportlab matplotlib latex2mathml==3.78.1 fonttools
python scripts/build-quadratic-equations.py --font /path/to/NotoSansJP-Regular.ttf
```

日本語の静的TrueTypeフォントを指定する。フォント自体はリポジトリに複製していない。`--font` を省略するとWebのみ生成する。PDF生成は印刷可能領域と各問の高さを検査する。新しいPDFはページ画像にして、数式・改行・余白を目視確認すること。

## 確認

```sh
node tests/quadratic-equations.cjs
python -m pip install sympy
python tests/quadratic-equations-math.py
node tests/quadratic-equations-smoke.cjs
```

代数検算では実数解の集合を独立に計算し、記載した解の欠落も検査する。操作テストは係数845通りの正確なMathML解を読み取り、代入・和・積を検査。PC/モバイルの表示、同一縮尺、紙へのリンク、オフライン動作、保存不可環境をブラウザで確認する。

解なしは実数の範囲での意味。文章題の根は方程式としての全解を持たせ、採否を解説で示す。平方完成の面積図は正の長さで描くが、式の恒等性は負のxにも成り立つ。一般形の放物線を必修として導入せず、グラフ実験は既習の y=x² と水平線で行う。
