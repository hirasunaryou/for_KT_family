"""金庫破りの画面部品。ルールはNotebookから渡された関数を呼び出す。

vault_lab.ipynbと同じフォルダに置く。show_gameの戻り値はpanel。
panel.stateは現在の辞書、panel.snapshot()は保存用のコピー。
"""
import html
import random


def _check(state):
    if not isinstance(state, dict):
        raise TypeError('ルール関数は辞書をreturnしよう')
    for key in ('score', 'pot', 'turn', 'target', 'limit', 'shields'):
        if key not in state or type(state[key]) is not int:
            raise ValueError(f'状態の{key}には整数が必要')
    if state.get('status') not in ('playing', 'won', 'lost'):
        raise ValueError('statusはplaying / won / lostのどれか')
    if state['target'] < 1 or state['limit'] < 1:
        raise ValueError('targetとlimitは1以上')
    if min(state['score'], state['pot'], state['shields']) < 0:
        raise ValueError('宝・装備の数がマイナスになっているよ')
    return dict(state)


class _Panel:
    def __init__(self, factory, transition, policy, initial_state, allow_buy):
        import ipywidgets as w
        self.factory, self.transition, self.policy = factory, transition, policy
        self.rng = random.Random()
        self.state = _check(initial_state if initial_state is not None else factory())
        self.board, self.error = w.HTML(), w.HTML()
        self.buttons = {}
        for action, label in [('roll', '振って宝を探す'), ('bank', '持ち帰る'), ('buy', 'シールドを買う')]:
            if action == 'buy' and not allow_buy:
                continue
            button = w.Button(description=label, layout=w.Layout(width='auto'))
            button.on_click(lambda _, a=action: self.act(a))
            self.buttons[action] = button
        if policy is not None:
            self.buttons['cpu'] = w.Button(description='CPUの1手', button_style='info')
            self.buttons['cpu'].on_click(lambda _: self.act('cpu'))
        restart = w.Button(description='新しいゲーム')
        restart.on_click(lambda _: self.restart())
        self.widget = w.VBox([self.board, w.HBox(list(self.buttons.values()), layout=w.Layout(flex_flow='row wrap')), restart, self.error])
        self.render()

    def snapshot(self):
        """現在の状態のコピーを返す。値が整数・文字列の教材用状態に対応。"""
        return dict(self.state)

    def render(self):
        s = self.state
        message = html.escape(str(s.get('message', '')))
        self.board.value = (
            '<div style="max-width:700px;padding:24px;background:#15243b;color:#f4f7ff;border-radius:16px;font:16px/1.9 sans-serif">'
            '<strong style="color:#dafa69">サイコロ金庫破り</strong>'
            f'<h3>金庫 {s["score"]} / {s["target"]}個　手持ち {s["pot"]}個</h3>'
            f'<p>挑戦 {min(s["turn"],s["limit"])} / {s["limit"]}　シールド {s["shields"]}個</p>'
            f'<p>{message}</p></div>'
        )
        for button in self.buttons.values():
            button.disabled = s['status'] != 'playing'

    def act(self, action):
        if self.state['status'] != 'playing':
            return
        try:
            if action == 'cpu':
                action = self.policy(self.snapshot())
            face = self.rng.randint(1, 6) if action == 'roll' else None
            updated = self.transition(self.snapshot(), action, face)
            self.state = _check(updated)
            self.error.value = ''
            self.render()
        except Exception as error:
            self.error.value = '<p style="color:#9d2030">' + html.escape(type(error).__name__ + ': ' + str(error)) + '<br>ルールのセルを直し、実行してから画面セルを作り直そう。</p>'

    def restart(self):
        try:
            self.state = _check(self.factory())
            self.error.value = ''
            self.render()
        except Exception as error:
            self.error.value = '<p>' + html.escape(type(error).__name__ + ': ' + str(error)) + '</p>'


def show_game(factory, transition, policy=None, initial_state=None, allow_buy=True):
    """new_gameとnext_stateを渡す。初回2章ではallow_buy=Falseを指定。"""
    if not callable(factory) or not callable(transition):
        raise TypeError('new_game()ではなくnew_game、next_state()ではなくnext_stateを渡そう')
    if policy is not None and not callable(policy):
        raise TypeError('policyにはchooseなどの関数を渡そう')
    try:
        import ipywidgets
        from IPython.display import display
    except ImportError:
        raise ImportError('新しいセルで %pip install ipywidgets を実行し、Kernel再起動後に関数セルから実行しよう') from None
    panel = _Panel(factory, transition, policy, initial_state, allow_buy)
    display(panel.widget)
    return panel
