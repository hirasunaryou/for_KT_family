"""迷路の描画・再生・ボタンの完成部品。探索とゲームのルールはNotebookに書く。
maze_lab.ipynbと同じフォルダへ。描画はmatplotlib、ボタンはipywidgetsを使用。
"""
import html
import io
import json
from pathlib import Path


def _grid(grid):
    rows = tuple(grid)
    if not rows or len(rows) > 61 or not isinstance(rows[0], str) or not 1 <= len(rows[0]) <= 61:
        raise ValueError('地図は1〜61行、各行1〜61文字にしよう')
    if any(not isinstance(r, str) or len(r) != len(rows[0]) or set(r) - {'#', '.'} for r in rows):
        raise ValueError('地図の行の長さをそろえ、#と.だけで書こう')
    return rows


def _position(grid, value):
    if not isinstance(value, (list, tuple)) or len(value) != 2 or any(type(n) is not int for n in value):
        raise ValueError('座標は(x, y)の2つの整数にしよう')
    x, y = value
    if not (0 <= y < len(grid) and 0 <= x < len(grid[0]) and grid[y][x] == '.'):
        raise ValueError(f'{value}は地図の通路ではないよ')
    return (x, y)


def draw_maze(grid, player=None, goal=None, robot=None, visited=(), path=(), show=True):
    """同縮尺の地図を表示し、MatplotlibのAxesを返す。xは右、yは下。"""
    import matplotlib.pyplot as plt
    from matplotlib.colors import ListedColormap
    from IPython.display import display
    grid = _grid(grid)
    fig, ax = plt.subplots(figsize=(6.5, max(3, min(7, len(grid) / len(grid[0]) * 6.5))))
    pixels = [[0 if tile == '#' else 1 for tile in row] for row in grid]
    for values, color_index in [(visited, 2), (path, 3)]:
        for value in values:
            x, y = _position(grid, value)
            pixels[y][x] = color_index
    ax.imshow(pixels, cmap=ListedColormap(['#193249', '#f2f7fb', '#3ac1dc', '#bddd49']), vmin=0, vmax=3, origin='upper')
    markers = {}
    for pos, label, color in [(goal, 'G', '#34802f'), (robot, 'R', '#b83a47'), (player, 'P', '#245cff')]:
        if pos is not None:
            point = _position(grid, pos)
            labels = markers.get(point, ([], color))[0] + [label]
            markers[point] = (labels, color)
    for (x, y), (labels, color) in markers.items():
        multiple = len(labels) > 1
        ax.scatter([x], [y], c=color, s=270 if multiple else 160, zorder=3)
        ax.text(x, y, '/'.join(labels), color='white', ha='center', va='center', fontsize=7 if multiple else 9, weight='bold', zorder=4)
    ax.set_aspect('equal')
    ax.set_xticks(range(len(grid[0])))
    ax.set_yticks(range(len(grid)))
    ax.tick_params(labelsize=8)
    ax.set_xlabel('x →')
    ax.set_ylabel('y ↓')
    fig.tight_layout()
    if show:
        display(fig)
    plt.close(fig)
    return ax


def _picture(grid, **kwargs):
    ax = draw_maze(grid, show=False, **kwargs)
    stream = io.BytesIO()
    ax.figure.savefig(stream, format='png', dpi=100)
    return stream.getvalue()


def _widgets():
    try:
        import ipywidgets as widgets
        from IPython.display import display
    except ImportError:
        raise ImportError('新しいセルで %pip install matplotlib ipywidgets を実行し、Kernel再起動後に関数セルから実行しよう') from None
    return widgets, display


class _SearchViewer:
    def __init__(self, grid, order, path, goal, label):
        w, display = _widgets()
        self.grid = _grid(grid)
        self.order = [_position(self.grid, p) for p in order]
        self.path = [_position(self.grid, p) for p in path]
        self.goal, self.label = goal, label
        self.image = w.Image(format='png', layout=w.Layout(max_width='100%', width='650px'))
        self.caption = w.HTML()
        self.slider = w.IntSlider(min=0, max=len(order), value=0, description='段階:', continuous_update=False)
        self.play = w.Play(min=0, max=len(order), value=0, interval=250, disabled=not order)
        self.link = w.jslink((self.play, 'value'), (self.slider, 'value'))
        self.slider.observe(lambda change: self.render(), names='value')
        self.widget = w.VBox([self.caption, self.image, w.HBox([self.play, self.slider])])
        self.render()
        display(self.widget)

    def render(self):
        n = self.slider.value
        visited = self.order[:n]
        finished = n == len(self.order)
        self.image.value = _picture(self.grid, player=visited[-1] if visited else None, goal=self.goal,
                                    visited=visited, path=self.path if finished else [])
        text = f'{self.label}: {n} / {len(self.order)}　水色=調べた場所 / P=今注目している場所'
        if finished and self.label != 'WALK':
            text += f'　最短 {len(self.path)-1}歩 / 黄緑=経路' if self.path else '　道なし'
        self.caption.value = '<p>' + html.escape(text) + '</p>'


def animate_search(grid, order, path, goal=None, label='SEARCH'):
    """Notebook内に再生・一時停止・段階スライダーを表示。orderとpathは学習者の計算結果。"""
    return _SearchViewer(grid, order, path, goal, label)


def _state(s):
    if not isinstance(s, dict):
        raise TypeError('ルール関数は状態の辞書をreturnしよう')
    result = dict(s)
    result['grid'] = _grid(s['grid'])
    for key in ('player', 'goal'):
        result[key] = _position(result['grid'], s[key])
    result['robot'] = None if s.get('robot') is None else _position(result['grid'], s['robot'])
    if type(s.get('steps')) is not int or s['steps'] < 0:
        raise ValueError('stepsは0以上の整数にしよう')
    if type(s.get('robot_every')) is not int or s['robot_every'] < 1:
        raise ValueError('robot_everyは1以上の整数にしよう')
    if s.get('status') not in ('playing', 'won', 'lost'):
        raise ValueError('statusはplaying / won / lost')
    return result


class _Panel:
    def __init__(self, initial, transition, wait):
        w, display = _widgets()
        self.initial = _state(initial)
        self.state = dict(self.initial)
        self.transition = transition
        self.image = w.Image(format='png', layout=w.Layout(max_width='100%', width='650px'))
        self.caption, self.error = w.HTML(), w.HTML()
        self.buttons = {}
        for action, text in [('up', '↑ 上'), ('left', '← 左'), ('down', '↓ 下'), ('right', '→ 右'), ('wait', 'その場で待つ')]:
            if action == 'wait' and not wait:
                continue
            button = w.Button(description=text, layout=w.Layout(width='auto'))
            button.on_click(lambda _, a=action: self.act(a))
            self.buttons[action] = button
        again = w.Button(description='最初から')
        again.on_click(lambda _: self.restart())
        self.widget = w.VBox([self.caption, self.image, w.HBox(list(self.buttons.values()), layout=w.Layout(flex_flow='row wrap')), again, self.error])
        self.render()
        display(self.widget)

    def render(self):
        s = self.state
        self.image.value = _picture(s['grid'], player=s['player'], goal=s['goal'], robot=s['robot'])
        self.caption.value = '<p>' + html.escape(f'P=自分 / R=敵 / G=ゴール　{s["steps"]}手　{s.get("message", "")}') + '</p>'
        for b in self.buttons.values():
            b.disabled = s['status'] != 'playing'

    def act(self, action):
        if self.state['status'] != 'playing':
            return
        try:
            self.state = _state(self.transition(dict(self.state), action))
            self.error.value = ''
            self.render()
        except Exception as error:
            self.error.value = '<p style="color:#ad263d">' + html.escape(type(error).__name__ + ': ' + str(error)) + '<br>関数セルを直して実行し、画面セルも実行し直そう。</p>'

    def restart(self):
        self.state = dict(self.initial)
        self.error.value = ''
        self.render()


def show_game(initial_state, take_turn):
    """initial_stateと学習者の1手の関数を使ってゲームを表示する。"""
    if not callable(take_turn):
        raise TypeError('take_turn()ではなくtake_turnという関数を渡そう')
    return _Panel(initial_state, take_turn, True)


def show_walker(grid, start, goal, mover):
    """MISSION 2の移動練習。壁判定は学習者のmoverを呼ぶ。"""
    initial = dict(grid=tuple(grid), player=start, goal=goal, robot=None, steps=0, robot_every=2,
                   status='won' if start == goal else 'playing', message='ボタンで動こう')
    def transition(s, action):
        pos = mover(s['grid'], s['player'], action)
        s['steps'] += int(pos != s['player'])
        s['player'] = pos
        s['status'] = 'won' if pos == s['goal'] else 'playing'
        s['message'] = 'ゴール！' if s['status'] == 'won' else '次はどちら？'
        return s
    return _Panel(initial, transition, False)


def save_maze(grid, filename='my_maze.json'):
    rows = _grid(grid)
    path = Path(filename)
    path.write_text(json.dumps({'version': 1, 'grid': rows}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('保存した場所:', path.resolve())


def load_maze(filename='my_maze.json'):
    data = json.loads(Path(filename).read_text(encoding='utf-8'))
    if not isinstance(data, dict) or data.get('version') != 1:
        raise ValueError('この版で読める地図ではない')
    return _grid(data.get('grid', []))
