"""Maze algorithm, boundary and game semantics; only the standard library is required."""
import importlib.util
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('maze', ROOT/'materials/python-maze-robot/maze_reference.py')
m = importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert not m.can_walk(m.grid, (-1,1))
assert not m.can_walk(m.grid, (1,-1))
assert not m.can_walk(m.grid, (13,1))
assert m.move_player(m.grid,m.start,'left') == m.start
room=('#######','#.....#','#.....#','#.....#','#######')
p,order=m.find_path(room,(1,1),(5,3))
assert len(p)-1==6 and p[0]==(1,1) and p[-1]==(5,3)
assert len(order)==len(set(order))
for a,b in zip(p,p[1:]): assert b in m.neighbors(room,a)
assert m.find_path(room,(1,1),(1,1))==([(1,1)],[(1,1)])
assert m.find_path(('#####','#.#.#','#####'),(1,1),(3,1))[0]==[]
assert m.find_path(room,(-1,1),(1,1))==([],[])
for seed in range(30):
    g=m.make_maze(seed=seed)
    assert g==m.make_maze(seed=seed)
    assert m.find_path(g,(1,1),(11,1))[0]
    assert m.find_path(g,(1,9),(1,1))[0]
    history,seen=m.wander(g,(1,1),(11,1),seed=seed,max_steps=20)
    assert len(history)<=21 and seen==set(history)
    for a,b in zip(history,history[1:]): assert b in m.neighbors(g,a)
try:m.make_maze(wall_rate=1)
except RuntimeError:pass
else:raise AssertionError('impossible generator did not stop')
s=m.new_game(room,(1,1),(2,1),(5,3));before=dict(s)
assert m.take_turn(s,'left')['steps']==0
assert m.take_turn(s,'right')['status']=='won'
assert s==before
won=m.take_turn(s,'right');assert m.take_turn(won,'wait')==won
s=m.new_game(room,(1,1),(5,3),(2,1))
assert m.take_turn(s,'right')['status']=='lost'
s=m.take_turn(s,'wait');assert s['robot']==(2,1)
s=m.take_turn(s,'wait');assert s['status']=='lost'
print('PASS maze: boundaries, shortest distance, unreachable/same endpoint, path adjacency, generator/replay, walk bound, game terminal and enemy timing')
