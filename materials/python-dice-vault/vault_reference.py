"""サイコロ金庫破り・完成例。自分の答えと比べるための参考ファイル。"""

def new_game(target=60, limit=8):
    return {
        "score": 0, "pot": 0, "turn": 1,
        "target": target, "limit": limit,
        "shields": 0, "status": "playing",
        "message": "宝を集めよう！",
    }

def next_state(state, action, face=None):
    s = dict(state)
    if s["status"] != "playing":
        return s
    if action == "roll":
        if type(face) is not int or not 1 <= face <= 6:
            raise ValueError("出目は1〜6の整数にしよう")
        if face == 1:
            if s["shields"] > 0:
                s["shields"] -= 1
                s["message"] = "シールドで1を防いだ！ 宝はそのまま"
            else:
                s["pot"] = 0
                s["turn"] += 1
                s["message"] = "1が出た！ 持ち歩いていた宝を失った"
        else:
            s["pot"] += face
            s["message"] = f"{face}個の宝を発見！"
    elif action == "bank":
        if s["pot"] == 0:
            s["message"] = "宝を集めてから持ち帰ろう"
            return s
        s["score"] += s["pot"]
        s["pot"] = 0
        s["turn"] += 1
        s["message"] = "宝を金庫に入れた！"
    elif action == "buy":
        if s["score"] < 8 or s["shields"] > 0:
            s["message"] = "購入には金庫の宝8個と、空の装備枠が必要"
            return s
        s["score"] -= 8
        s["shields"] = 1
        s["message"] = "宝8個でシールドを買った！"
    else:
        raise ValueError("行動はroll / bank / buyのどれか")
    if s["score"] >= s["target"]:
        s["status"] = "won"
        s["message"] = "目標達成！ 金庫破り成功！"
    elif s["turn"] > s["limit"]:
        s["status"] = "lost"
        s["message"] = "時間切れ！ 次は作戦を変えてみよう"
    return s

def choose(state, stop_at=14):
    if state["score"] + state["pot"] >= state["target"]:
        return "bank"
    if state["pot"] >= stop_at:
        return "bank"
    return "roll"

import random

def play_cpu(policy, seed=0):
    rng = random.Random(seed)
    state = new_game()
    for step in range(2000):
        if state["status"] != "playing":
            return state
        action = policy(dict(state))
        face = rng.randint(1, 6) if action == "roll" else None
        state = next_state(state, action, face)
    raise RuntimeError("2000手でも終わらない。CPUが同じ行動を続けていない？")


def compare(games=1000):
    reports = []
    for stop_at in [8, 14, 20]:
        def policy(state):
            return choose(state, stop_at=stop_at)
        wins = 0
        scores = []
        turns = []
        for seed in range(games):
            result = play_cpu(policy, seed=seed)
            if result["status"] == "won":
                wins += 1
            scores.append(result["score"])
            turns.append(result["turn"] - 1)
        reports.append({
            "stop_at": stop_at,
            "win_percent": round(wins / games * 100, 1),
            "mean_score": round(sum(scores) / games, 1),
            "mean_turns": round(sum(turns) / games, 1),
        })
    return reports


import json
from pathlib import Path

def validate_state(s):
    if not isinstance(s, dict):
        raise ValueError("セーブの中身は辞書が必要")
    number_keys = ["score", "pot", "turn", "target", "limit", "shields"]
    for key in number_keys:
        if key not in s or type(s[key]) is not int:
            raise ValueError(f"{key}は整数が必要")
    if s["score"] < 0 or s["pot"] < 0:
        raise ValueError("宝の数は0以上")
    if s["target"] < 1 or s["limit"] < 1:
        raise ValueError("目標と挑戦回数は1以上")
    if not 1 <= s["turn"] <= s["limit"] + 1:
        raise ValueError("挑戦回数が範囲外")
    if s["shields"] not in [0, 1]:
        raise ValueError("シールドは0か1")
    status = s.get("status")
    if status not in ["playing", "won", "lost"]:
        raise ValueError("ゲームの状態が不明")
    if status == "playing" and (s["turn"] > s["limit"] or s["score"] >= s["target"]):
        raise ValueError("終了条件と状態が合わない")
    if status == "won" and s["score"] < s["target"]:
        raise ValueError("勝利なのに宝が足りない")
    if status == "lost" and (s["turn"] != s["limit"] + 1 or s["score"] >= s["target"]):
        raise ValueError("時間切れの条件が合わない")
    if not isinstance(s.get("message"), str):
        raise ValueError("messageは文字列が必要")
    return dict(s)

def save_state(state, filename="vault_save.json"):
    payload = {"version": 1, "state": validate_state(state)}
    path = Path(filename)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("保存した場所:", path.resolve())

def load_state(filename="vault_save.json"):
    payload = json.loads(Path(filename).read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or payload.get("version") != 1:
        raise ValueError("この版で読めるセーブではない")
    return validate_state(payload.get("state"))
