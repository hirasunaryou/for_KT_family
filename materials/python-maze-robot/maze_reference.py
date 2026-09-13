"""迷路メーカー＆脱出ロボット・完成例。描画なしでルールを試せる。"""

grid = (
    "#############",
    "#.....#.....#",
    "#.###.#.###.#",
    "#...#...#...#",
    "###.#####.#.#",
    "#...#.....#.#",
    "#.###.#####.#",
    "#.....#.....#",
    "#.#####.###.#",
    "#...........#",
    "#############",
)
start = (1, 1)
goal = (11, 1)
robot = (1, 9)

def can_walk(grid, pos):
    x, y = pos
    height = len(grid)
    width = len(grid[0])
    return 0 <= x < width and 0 <= y < height and grid[y][x] == "."

def neighbors(grid, pos):
    x, y = pos
    result = []
    for dx, dy in [(1, 0), (0, 1), (-1, 0), (0, -1)]:
        candidate = (x + dx, y + dy)
        if can_walk(grid, candidate):
            result.append(candidate)
    return result

def move_player(grid, pos, direction):
    moves = {"right": (1, 0), "down": (0, 1), "left": (-1, 0), "up": (0, -1)}
    dx, dy = moves[direction]
    candidate = (pos[0] + dx, pos[1] + dy)
    if can_walk(grid, candidate):
        return candidate
    return pos

import random

def wander(grid, start, goal, seed=0, max_steps=200):
    rng = random.Random(seed)
    pos = start
    seen = {start}
    history = [start]
    for step in range(max_steps):
        if pos == goal:
            break
        choices = neighbors(grid, pos)
        if not choices:
            break
        fresh = []
        for candidate in choices:
            if candidate not in seen:
                fresh.append(candidate)
        pos = rng.choice(fresh if fresh else choices)
        seen.add(pos)
        history.append(pos)
    return history, seen

from collections import deque

def find_path(grid, start, goal):
    if not can_walk(grid, start) or not can_walk(grid, goal):
        return [], []
    queue = deque([start])
    parents = {start: None}
    order = []
    while queue:
        pos = queue.popleft()
        order.append(pos)
        if pos == goal:
            path = []
            while pos is not None:
                path.append(pos)
                pos = parents[pos]
            path.reverse()
            return path, order
        for candidate in neighbors(grid, pos):
            if candidate not in parents:
                parents[candidate] = pos
                queue.append(candidate)
    return [], order

import random

def make_maze(width=13, height=11, wall_rate=0.30, seed=0):
    if type(width) is not int or type(height) is not int or not 7 <= width <= 41 or not 7 <= height <= 41:
        raise ValueError("幅と高さは7〜41の整数にしよう")
    if not 0 <= wall_rate <= 1:
        raise ValueError("壁の割合は0〜1にしよう")
    rng = random.Random(seed)
    start = (1, 1)
    goal = (width - 2, 1)
    robot = (1, height - 2)
    for attempt in range(200):
        rows = []
        for y in range(height):
            row = []
            for x in range(width):
                if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                    row.append("#")
                else:
                    row.append("#" if rng.random() < wall_rate else ".")
            rows.append(row)
        for x, y in [start, goal, robot]:
            rows[y][x] = "."
        candidate = tuple("".join(row) for row in rows)
        path, _ = find_path(candidate, start, goal)
        robot_path, _ = find_path(candidate, robot, start)
        if path and robot_path:
            return candidate
    raise RuntimeError("200回作ってもつながらない。壁の割合を下げてみよう")

def new_game(grid, start, goal, robot, robot_every=2):
    return {"grid": tuple(grid), "player": start, "goal": goal, "robot": robot,
            "steps": 0, "robot_every": robot_every, "status": "playing",
            "message": "ゴールへ向かおう！"}

def take_turn(state, direction):
    s = dict(state)
    if s["status"] != "playing":
        return s
    if direction == "wait":
        pos = s["player"]
    else:
        pos = move_player(s["grid"], s["player"], direction)
        if pos == s["player"]:
            s["message"] = "壁には進めない。手数は増えないよ"
            return s
    s["player"] = pos
    s["steps"] += 1
    if pos == s["robot"]:
        s["status"] = "lost"
        s["message"] = "ロボットにぶつかった！"
        return s
    if pos == s["goal"]:
        s["status"] = "won"
        s["message"] = "脱出成功！"
        return s
    if s["steps"] % s["robot_every"] == 0:
        path, _ = find_path(s["grid"], s["robot"], pos)
        if len(path) >= 2:
            s["robot"] = path[1]
    if s["robot"] == pos:
        s["status"] = "lost"
        s["message"] = "つかまった！ 次はルートを変えよう"
    else:
        s["message"] = "次はどう動く？"
    return s
