"""Core game boundaries, deterministic experiments, and save validation; stdlib only."""
import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('vault', ROOT / 'materials/python-dice-vault/vault_reference.py')
vault = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vault)
new, step = vault.new_game, vault.next_state
s = new(target=10, limit=1)
s = step(step(s, 'roll', 6), 'roll', 4)
s = step(s, 'bank')
assert (s['status'], s['score']) == ('won', 10)
assert step(s, 'roll', 1) == s
assert step(new(limit=1), 'roll', 1)['status'] == 'lost'
assert step(new(), 'bank')['turn'] == 1
before = new()
after = step(before, 'roll', 4)
assert before['pot'] == 0 and after['pot'] == 4
s = new(); s['score'] = 7
assert step(s, 'buy')['score'] == 7
s['score'] = 8
s = step(s, 'buy')
assert (s['score'], s['shields']) == (0, 1)
s['score'] = 8
assert step(s, 'buy')['score'] == 8
s['pot'] = 12
s = step(s, 'roll', 1)
assert (s['pot'], s['turn'], s['shields']) == (12, 1, 0)
s = step(s, 'roll', 1)
assert (s['pot'], s['turn']) == (0, 2)
for face in [0, 7, None, True]:
    try: step(new(), 'roll', face)
    except ValueError: pass
    else: raise AssertionError('invalid face accepted')
assert vault.play_cpu(vault.choose, 42) == vault.play_cpu(vault.choose, 42)
try: vault.play_cpu(lambda s: 'bank', 1)
except RuntimeError: pass
else: raise AssertionError('stalled strategy did not stop')
assert len(vault.compare(20)) == 3
with tempfile.TemporaryDirectory() as folder:
    path = str(Path(folder) / 'save.json')
    s = new(); s['pot'] = 9
    vault.save_state(s, path)
    assert vault.load_state(path) == s
    for patch in [{'shields':2}, {'pot':-1}, {'status':'won'}, {'turn':9}, {'score':True}, {'message':None}]:
        try: vault.validate_state({**s, **patch})
        except ValueError: pass
        else: raise AssertionError(f'invalid save accepted: {patch}')
    Path(path).write_text(json.dumps({'version':2,'state':s}))
    try: vault.load_state(path)
    except ValueError: pass
    else: raise AssertionError('unknown version accepted')
print('PASS vault: final-turn victory, terminal freeze, shield economy, source copy, CPU termination/replay, JSON validation')
