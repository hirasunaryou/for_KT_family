let py, scope;
const setup = `
import random as _random, json as _json, math as _math
from js import postMessage as _post

def _emit(kind, data):
    _post(_json.dumps({"type": kind, "data": data}, ensure_ascii=False))

def show_graph(counts):
    values = list(counts)
    if len(values) != 6 or any(not isinstance(x, (int, float)) or not _math.isfinite(x) or x < 0 for x in values):
        raise ValueError("show_graphには、0以上の数が6つ入ったリストを渡そう")
    _emit("graph", values)

_game = None

def create_game(title, roller, budget=200):
    global _game
    if not callable(roller):
        raise TypeError("2番目にはroll関数を渡そう。roll()ではなくrollだよ")
    if type(budget) is not int or not 10 <= budget <= 10000:
        raise ValueError("budgetは10〜10000の整数にしよう")
    _game = {"title": str(title)[:80], "roller": roller, "budget": budget, "kind": _random.choice(["ふつう", "6が好き", "偶数が好き"]), "counts": [0]*6, "ended": False}
    _emit("game", {"title": _game["title"], "budget": budget, "counts": _game["counts"], "ended": False})

def _action(action, value):
    global _game
    if _game is None:
        raise ValueError("先にcreate_gameを実行しよう")
    g = _game
    if action == "new":
        create_game(g["title"], g["roller"], g["budget"])
    elif action == "sample":
        if g["ended"]:
            return
        n = min(int(value), g["budget"] - sum(g["counts"]))
        if not 0 <= n <= 10000:
            raise ValueError("回数を確かめよう")
        updated = g["counts"][:]
        for _ in range(n):
            face = g["roller"](g["kind"])
            if type(face) is not int or not 1 <= face <= 6:
                raise ValueError("rollは1〜6の整数をreturnしよう")
            updated[face-1] += 1
        g["counts"] = updated
        _emit("game", {"title":g["title"], "budget":g["budget"], "counts":updated, "ended":False})
    elif action == "guess":
        if g["ended"]:
            return
        if value not in ["ふつう", "6が好き", "偶数が好き", "保留"]:
            raise ValueError("候補から選ぼう")
        g["ended"] = True
        _emit("verdict", {"kind": g["kind"], "guess":value, "correct": value == g["kind"]})
`;
let lines=0;
function send(type,data){postMessage(JSON.stringify({type,data}));}
onmessage = async ({data:m}) => {
  try {
    if(m.type==='init'){
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
      py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
      py.setStdout({batched:s=>{if(lines++<200)send('stdout',s);else if(lines===201)send('stdout','…表示は200行まで。処理は続いているよ。');}});
      py.setStderr({batched:s=>send('stderr',s)});
      py.setStdin({stdin:()=>{throw Error('このページではinput()の代わりに、コードの変数に値を入れて使おう。');}});
      send('ready',null);
    }else if(m.type==='run'){
      lines=0;
      if(scope)scope.destroy();
      scope=py.toPy({});
      py.runPython(setup,{globals:scope});
      await py.runPythonAsync(m.code,{globals:scope,filename:'my_game.py'});
      send('done',null);
    }else if(m.type==='action'){
      lines=0;
      scope.set('_action_name',m.action);scope.set('_action_value',m.value??'');
      await py.runPythonAsync('_action(_action_name, _action_value)',{globals:scope});
      send('done',null);
    }
  }catch(e){send('error',String(e.message||e));}
};
