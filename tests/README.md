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
