"""Run with Python + IPython + ipywidgets to verify the supplied lesson code."""
from pathlib import Path
import contextlib
import importlib.util
import io
import json
import os
import subprocess
import tempfile
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('dice_tools', ROOT/'materials/python-dice/dice_tools.py')
tools = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tools)
import sys
sys.modules['dice_tools'] = tools
missions = json.loads(subprocess.check_output(['node', '-e', "const fs=require('fs'),vm=require('vm');console.log(JSON.stringify(vm.runInNewContext(fs.readFileSync('assets/python-dice-jupyter/content.js','utf8')+';JUPYTER_MISSIONS')));"], cwd=ROOT, text=True))
outputs=[]
with tempfile.TemporaryDirectory() as td:
    old=os.getcwd();os.chdir(td)
    try:
        scope={}
        with patch('IPython.display.display', side_effect=outputs.append), contextlib.redirect_stdout(io.StringIO()):
            for mission in missions:
                for cell in mission['cells']:
                    if cell['code'].startswith('%pip'):continue
                    exec(compile(cell['code'], 'dice_lab.ipynb', 'exec'), scope)
            assert Path('my_dice_game.html').exists()
        print('PASS all Jupyter lesson cells in sequence, graph helpers and game construction')
        ui=outputs[-1]
        assert hasattr(ui,'children')
        chart,buttons,choice,answer_row,message=ui.children
        buttons.children[0].click()
        assert '調査 10 / 200回' in chart.value
        for _ in range(3):buttons.children[2].click()
        assert '調査 200 / 200回' in chart.value
        assert all(b.disabled for b in buttons.children)
        choice.value='保留';answer_row.children[0].click()
        assert '仕込まれていた正体' in message.value
        assert answer_row.children[0].disabled
        answer_row.children[1].click()
        assert '調査 0 / 200回' in chart.value
        print('PASS real ipywidgets callbacks: sampling, cap, hold, answer lock, restart')
        g=tools._Detective('bad',lambda _:7,200)
        try:g.sample(10);raise AssertionError('bad roll accepted')
        except ValueError:assert g.counts==[0]*6
        g=tools._Detective('deterministic',lambda _:6,25);g.sample(100);assert g.counts==[0,0,0,0,0,25]
        g.guess('6が好き');g.sample(10);assert sum(g.counts)==25
        for bad in [{'ふつう':[1]},dict.fromkeys(tools.KINDS,[7])]:
            try:tools.save_game('bad',bad);raise AssertionError('bad bag accepted')
            except ValueError:pass
        with contextlib.redirect_stdout(io.StringIO()):
            tools.save_game('</script><img src=x onerror=alert(1)>',scope['dice_faces'],'escaped.html')
        exported=Path('escaped.html').read_text()
        assert '<img src=x' not in exported
        assert exported.count('<script>')==1 and exported.count('</script>')==1
        assert 'src="http' not in exported and 'fetch(' not in exported
        out=ROOT/'test-results';out.mkdir(exist_ok=True)
        (out/'dice-export.html').write_text(Path('my_dice_game.html').read_text())
        print('PASS invalid rolls/bags, transactional counts, HTML escaping, standalone export')
    finally:os.chdir(old)
