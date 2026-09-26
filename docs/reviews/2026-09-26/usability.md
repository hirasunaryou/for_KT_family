# 家族のまなび帳：使いやすさ・Python教材の点検

調査日: 2026-09-26。対象のローカル基準は `bc92b41`。この担当では製品ファイルを変更していない。三平方の定理の修正と並行して実施した読み取り専用レビュー。

## 調べた範囲と結果

- ホーム、勉強、プログラミング一覧、日々の疑問、Python 5教材の入口を、Chromiumで幅1280 / 390 / 320 pxで表示（9ページ×3幅）。
- Jupyter版サイコロ・金庫破り・迷路・ドット絵の全8画面（準備/遊ぶ/各ミッション。サイコロは準備＋7回）を3幅で表示（32画面×3幅）。ページ全体の横はみ出し・JavaScript例外は検出しなかった。
- Python 5教材のJavaScript無効時、4つのJupyter教材の保存不可時、ブラウザPythonの保存不可と再読み込み、キーボード移動、ゲーム操作、ブラウザの戻るを実測。
- `tests/python-dice.cjs`、`tests/python-vault.cjs`、`tests/python-maze.cjs`、`tests/python-pixel.cjs` は成功。Pythonとブラウザの金庫ルール/BFS/ピクセル・表示時間の一致もこのテスト内で確認。
- Jupyter版の準備とMISSION 1、3つの続編の見本/準備/MISSION 1をスクリーンショットで目視。読み始めの階層、コードと仕様の区切り、配布ファイルと保存先の説明は整っている。無理に装飾・文章量の問題を作らず、以下は再現できた支障に絞った。
- 公開URLへのWeb取得はこの担当のツールではアクセス不可、直接取得も完了しなかった。したがって以下はローカルで再現した所見であり、公開版にも同じ修正が必要かは、親レビューの公開版照合に従う。

優先度: P1=内容の誤認/主要学習を止める緊急課題、P2=具体的な操作・保存の支障、P3=使いやすさ/一貫性の改善。本担当で新規P1はなし。

## 課題一覧

| ID | 優先度 | 場所 | 再現した問題 | 利用者への影響 |
|---|---|---|---|---|
| U01 | P2 | ブラウザ版サイコロのコード入力 | Tab / Shift+Tabとも字下げになり、入力欄からキーボードで抜けられない | 実行後の停止・保存・ヘルプ等へ移動できず、意図せずコードも変わる |
| U02 | P2 | 同教材の自動保存説明 | 保存不可でも5秒後には警告が消え、「自動保存」の説明だけが残る | 保存できたと誤認し、再読み込みで自作コードを失う |
| U03 | P2 | 金庫のゲーム操作、Python 4教材の章移動 | DOMの作り直しで操作位置のフォーカスが消える | Enterで連続操作できない。章移動のたびに目次の最初から辿り直す |
| U04 | P3 | Jupyter版サイコロのミッション移動 | 履歴を置き換えるため「戻る」で前のミッションへ戻れない | 復習しようとして教材一覧へ出てしまう。続編の挙動とも異なる |
| U05 | P2 | Python全5教材のJavaScript無効時 | 本文と素材へのリンクが消える。ブラウザ実行版は完全な白紙 | 実行にJSが必要でも、Jupyter用ファイル取得や代替教材への退避までできなくなる |
| U06 | P3 | ドット絵のマス操作 | 256マスすべてが独立したTab停止点 | グリッドに入ると色変更・保存まで大量のTabが必要 |

## U01：コード入力欄のキーボード閉じ込め

- ページ: `study/programming/python-dice/index.html`
- 根拠: `assets/python-dice/app.js:31`。`e.key==='Tab'`の時に常に`preventDefault()`と4スペース挿入。ShiftやEscによる抜け道なし。案内は同ファイル23行目の「Tabで4マス字下げ / Ctrl・⌘ + Enterで実行」のみ。
- 再現: コード欄にフォーカス → Tab → Shift+Tab → Esc → Tab。フォーカスはすべて`#editor`に残り、元の64文字が76文字になった。
- 提案: 字下げは維持しつつ、EscでTabを一時的に移動操作へ切り替える、または明示的なショートカットでエディタから出られるようにする。Shift+Tabは逆字下げ又は移動という意味を持たせ、短い操作説明を添える。
- 再検証条件: マウスを使わず、入力→実行→停止/保存→入力へ往復できる。移動操作でコードが変わらない。
- 証拠: `test-results/audit-usability/probe.json` の `editor keyboard escape`、`dice-keyboard-trap.png`。

## U02：保存できていないのに自動保存と表示し続ける

- ページ: `study/programming/python-dice/index.html`
- 根拠: `assets/python-dice/app.js:5,11–12,16,21`。読込失敗は黙って無視、保存失敗は最初の一度だけ5秒のトースト。サイド欄とメモ欄の保存説明は常時固定。
- 再現: LocalStorageが`SecurityError`を返す状態で開く → コードを変更 → 5.5秒後。警告は0個だが「コードと進み具合は、このブラウザに保存されるよ」「このブラウザに自動保存」が残る。再読み込み後は初期コードへ戻った。
- 良い点: この状態でも「Python保存」は使える。ここを常設の回避導線として使える。
- 提案: エディタ近くに「このブラウザへ保存できていません。Python保存で残してください」を維持し、自動保存の説明を状態と一致させる。保存可能になれば成功状態へ戻す。
- 再検証条件: 保存不可の間は常に状態が分かり、手動保存でコードとメモを保持できる。
- 証拠: `test-results/audit-usability/edge-cases.json`、`dice-storage-denied-after-toast.png`。

## U03：ゲームと章移動で操作位置を見失う

### 金庫破りの1手ごと

- ページ: `study/programming/python-dice-vault/index.html#play`
- 根拠: `assets/python-dice-vault/app.js:8–10`。ゲームのボタンを含む`#demo`全体を毎回再生成し、フォーカスを戻していない。
- 再現: 「振って宝を探す」にフォーカスしてEnter → ゲームは進むが`document.activeElement`が`BODY`へ移る → 続けてEnterを押しても何も起きない。
- 提案: 数値と状態だけ更新するか、再生成前の操作ボタンを記録し、終了時を除いて同じボタンへ戻す。ゲーム終了時は結果へ自然に移す。
- 証拠: `probe.json` の `vault focus after roll` / `vault second enter`、`vault-lost-focus.png`。

### 4つのJupyter教材の章切替

- 根拠: `assets/python-dice-jupyter/app.js:22,29`、`assets/python-dice-vault/app.js:14,20`、`assets/python-maze-robot/app.js:22,25`、`assets/python-pixel-monster/app.js:21,24`。
- 再現: 目次のMISSION 1ボタンをキーボードで選ぶ → 新章は出るがフォーカスは`BODY` → 次のTabは目次の準備/遊ぶボタン。新しい本文へ移らない。
- 提案: 章変更後のh1又はmainに`tabindex=-1`でフォーカスを移す。直接操作した図の更新と章切替を区別する。
- 証拠: `test-results/audit-usability/routes.json` の4件の `route keyboard focus`。

## U04：ブラウザの「戻る」が復習に使えない

- ページ: `study/programming/python-dice-jupyter/index.html`
- 根拠: `assets/python-dice-jupyter/app.js:29`の`history.replaceState`。
- 再現: プログラミング一覧から本教材へ → MISSION 1 → MISSION 2 → ブラウザの戻る。MISSION 1ではなくプログラミング一覧へ戻る。
- 他3続編は`location.hash`で遷移履歴を追加しており、同シリーズで挙動が違う。
- 提案: ユーザーによる章移動は通常のハッシュ履歴として残し、初期URLの補正だけreplaceを使う。戻る/進むで章・目次選択を一致させる。
- 証拠: `test-results/audit-usability/routes.json` の `jupyter browser back`。

## U05：JS無効/読込失敗時に、素材まで取り出せない

- 対象: `study/programming/python-dice/index.html:1`、`python-dice-jupyter/index.html:1`、`python-dice-vault/index.html:1`、`python-maze-robot/index.html:1`、`python-pixel-monster/index.html:1`。
- 再現: JavaScript無効のChromiumコンテキストで開く。全ページでダウンロードリンク0件。ブラウザ版は本文のテキストが空、Jupyterサイコロはヘッダーのみ、続編3つはJS必要という注意書きのみ。
- 影響: Web内ゲームの動作停止は当然でも、Jupyterで使うNotebook/補助Pythonファイルや説明までJSに依存する必要はない。`AGENTS.md` 6節の「JS無効時も教材への導線を保つ」に未達。
- 提案: 最低限、静的なタイトル・概要、Jupyter用2ファイル、教材一覧へ戻るリンクをHTMLに残す。中期的には説明本文の事前生成を検討。ブラウザ版はJSが必要な理由とJupyter版への案内を静的に表示。
- 注意: Python実行版のPyodide外部依存は既に明記された例外であり、外部依存自体を問題とはしていない。
- 証拠: `test-results/audit-usability/probe.json` の全5件 `noJS`、`pixel-nojs.png`。

## U06：256回Tabを押さないと次の操作へ行けない

- ページ: `study/programming/python-pixel-monster/index.html#play`
- 根拠: `assets/python-pixel-monster/app.js:13`。16×16の全buttonが通常のTab順に入る。
- 再現: (0,0)のマスへフォーカス → Tabを反復。グリッドを抜けて「ドットを打つ」へ移るまで256回。マス内の矢印キー移動はない。
- 提案: グリッド全体をTab 1停止点にし、内部は矢印キー移動、Enter/Spaceで描く方式。描画後の現在マスへのフォーカス復帰は既にできているので、その良さを残す。
- 証拠: `test-results/audit-usability/edge-cases.json` の `pixel keyboard exit grid`。

## 良い点として残すもの

- Python/Jupyter/配布HTMLの役割、保存と実行の違い、翌日の変数復元を具体的に説明している。
- 仕様→必要な道具→ヒント→完成例の順序。完成例は最初から開いていない。
- 迷路は探索順と実際に歩く経路の違いを図の近くで説明し、通路を閉じたときの「道がない」も扱う。
- ドット絵の透明市松模様は表示用で画像には入らない点、JSON/PNG/GIFの違い、半透明GIFの制約まで示している。
- 4つのJupyter教材は保存拒否でも教材/チェック操作が止まらず、保存不可の説明が残る。ブラウザPythonもこの一貫性へ合わせたい。

## 未確認・限界

- 実機Safari/Firefox、スクリーンリーダー、OSの高コントラストモード、タッチ端末は未検証。PC中心の前提に従い、モバイル幅だけで優先度を上げていない。
- JupyterLabアプリ実機で全セルを一から手入力する体験、およびPyodide本体を外部CDNから読む実行はこの担当では未完走。既存テストのルール/ピクセル一致を、実アプリでの全操作確認とは扱わない。
- 紙教材のページ視認性と数学的内容は別担当。ブラウザ印刷はPDFの代替として全ページ検査していない。
- ヘッダーや一覧の古い教材数などは別担当へ委譲し、重複指摘を避けた。

## 検証資料

- `test-results/audit-usability/probe.json`：入口/画面幅/キーボード/JS無効。
- `test-results/audit-usability/routes.json`：全32ルート×3幅/章移動/戻る/保存拒否。
- `test-results/audit-usability/edge-cases.json`：保存拒否表示と再読み込み/グリッド256停止点。
- 同フォルダのPNG：入口・準備・MISSION 1の画面、各所見の再現画面。
- 再現用調査スクリプト（製品コードではない）: `（点検時の作業フォルダ）/review/audit-usability.cjs`、`audit-usability-routes.cjs`、`audit-usability-edge.cjs`。


保存した代表証跡と全体の優先順は [全体レポート](site-audit.md) を参照。本文中の全ページ画像・調査ログの名前は点検時の識別子で、代表証跡以外は一時生成物です。PDFの現物とページ番号、記載した操作から再確認できます。
