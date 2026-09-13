# サイコロ探偵：編集するファイルと置く場所

## 公開ページを編集する人向け

| 変えたいもの | 編集するファイル |
| --- | --- |
| 家族トップの案内 | `index.html` |
| 勉強一覧 | `study/index.html` |
| プログラミング一覧 | `study/programming/index.html` |
| JupyterLab版の各ミッション・短いコード | `assets/python-dice-jupyter/content.js` |
| JupyterLab版の準備・保存・再開・救急箱 | `assets/python-dice-jupyter/app.js` |
| JupyterLab版の見た目 | `assets/python-dice-jupyter/style.css` |
| JupyterLabで使う完成部品 | `materials/python-dice/dice_tools.py` |
| 見出しだけのNotebook | `materials/python-dice/dice_lab.ipynb` |
| ブラウザ版のミッション内容 | `assets/python-dice/lessons.js` |
| ブラウザ版の画面・保存・エラー案内 | `assets/python-dice/app.js` |
| ブラウザ版のPython実行部品 | `assets/python-dice/worker.js` |
| ブラウザ版の見た目 | `assets/python-dice/style.css` |
| 持ち出し用ブラウザ教材 | `study/programming/python-dice/dice-lab.html`（生成物。直接編集しない） |

ブラウザ版を直したら `python3 scripts/build-python-dice-portable.py` で単体HTMLを再生成します。その後 `npm test`。JupyterLab版は生成コマンド不要です。

公開ページは `study/<subject>/<topic>/index.html`。単元固有の資産は `assets/<topic>/`。ユーザーの名前や学年でフォルダを分けず、学年は表示ラベルで示します。ここには本人の学習記録や個人名入りの作品を自動アップロードしません。

## 学習者の作業フォルダ

JupyterLab左の一覧で `python_games` を作成し、その中に `dice_detective` を作ります。`dice_lab.ipynb` と `dice_tools.py` を同じ階層に配置。最後に `my_dice_game.html` が生成されます。

`dice_tools.py` は完成部品です。グラフはIPython.display、ボタンはipywidgets。もしipywidgetsがない場合だけ、Notebookで `%pip install ipywidgets` → Kernel再起動。JupyterLabサーバーとKernelが分離された環境ではサーバー側のjupyterlab_widgetsも必要です。

保存の仕様:
- NotebookはJupyterLabの保存操作。再開時は必要なセルを上から実行します。
- HTMLは `save_game(title, dice_faces, "my_dice_game.html", budget=budget)`。同名は上書きされるため、前版を残すなら `_v2` 等を付けます。
- HTMLはくじ配置に基づくブラウザ版です。任意のPython処理は変換しません。外部通信なしで遊べます。
- `.html` はJupyterLabのプレビューでなく、PCにダウンロードして通常のブラウザで開きます。
- `.ipynb` と `.py` のバックアップは2ファイルとも保存。ゲームHTMLだけでは学習コードを再編集できません。

## 通信と公開

説明サイトの文章・スタイルはリポジトリ内だけで完結します。ブラウザ実行版のみ、Pyodideの固定バージョンをjsDelivrから読み込みます。単体のブラウザ教材もこの通信が必要です。JupyterLab版から生成する完成ゲームHTMLは完全な1ファイルで、ネット不要です。
