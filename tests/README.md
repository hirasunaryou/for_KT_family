# 教材の検証

閲覧するだけなら依存ライブラリは不要です。開発テストにはNode.js 22.12以降を使います。

```bash
npm install
npx playwright install --with-deps chromium
npm test
```

`npm run test:dom` はブラウザを起動せず、DOM上で判定・保存・図の計算を確認します。`npm test` はそれに加えてChromeで実際の操作を行い、デスクトップ・モバイルのスクリーンショットを `test-results/` に保存します。

ブラウザテストは独立したテスト用ブラウザで実行し、利用者の学習記録を触りません。テスト用の記録ファイルと画像はGit管理の対象外です。

確認対象は、初回と解き直し後の判定の区別、ヒント使用、自己評価、再読み込み、全46問の表示、正方形の縮尺、数直線、入力の境界値、記録の書き出し・読み込み・リセット、390px幅でのはみ出し、PDF、保存不可時の動作、ローカルファイルでの起動、外部リクエストがないことです。

GitHub Actionsでもpushとpull request時に実行します。Actionsの `browser-test-results` に画面画像が残ります。

## 家族サイトと二次関数

`family.cjs` は家族サイト全体の相対リンク、44問と印刷原稿の一致、グラフの境界、変域の全許可入力、変化の割合、自己評価の保存・再読み込み・リセット、平方根との保存分離を確認します。

`quadratic-smoke.cjs` はブラウザで3つの動く図、44問の切替、作図問題の解答、自己評価、再挑戦リンク、旧トップの平方根リンクの転送、PDF、保存不可とオフラインを確認します。390pxの画面とデスクトップのスクリーンショットを残します。

平方根の既存テストも新しいURLで継続します。新旧どちらの教材も通ることを確認してから変更を完了します。

## Python教材

`python-dice.cjs` はJupyterLab説明サイトの準備＋7ミッション、直接リンク、チェックの保存と分離、保存不可時、相対リンク、Notebookのひな形、ブラウザ実行版の資産の場所を確認します。`npm test` と `npm run test:dom` に含まれます。

完成部品と説明中のPythonは、IPythonとipywidgetsを用意した環境で次のように確認できます。

```bash
python3 -m pip install ipython ipywidgets
python3 tests/python-dice-tools.py
```

全ミッションのセルを順番に実行し、実物のipywidgetsボタンのコールバック、上限、保留、答え合わせ後の停止、再挑戦、不正な出目、HTMLへの安全なタイトル埋め込みを確認します。実際のJupyterLabフロントエンドでの表示確認とは別です。生成したゲームは `test-results/dice-export.html` に残ります。
