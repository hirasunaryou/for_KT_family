"""Run the published lesson code and verify exported image data, not just file existence."""
import contextlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import os
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MATERIALS = ROOT / 'materials/python-pixel-monster'
sys.path.insert(0, str(MATERIALS))
import monster_reference as ref
import monster_tools as tools

# Notebook-only display functions can be exercised in CI without a Jupyter server.
try:
    import IPython.display
except ImportError:
    raise SystemExit('Run: python -m pip install pillow ipython')


def pixels(image):
    return [image.getpixel((x, y)) for y in range(image.height) for x in range(image.width)]


class PixelCourse(unittest.TestCase):
    def test_lessons_and_notebook(self):
        code = "const fs=require('fs'),vm=require('vm');process.stdout.write(JSON.stringify(vm.runInNewContext(fs.readFileSync('assets/python-pixel-monster/content.js','utf8')+';PIXEL_LESSONS')));"
        lessons = json.loads(subprocess.check_output(['node', '-e', code], cwd=ROOT))
        previous = Path.cwd()
        try:
            with tempfile.TemporaryDirectory() as tmp, contextlib.redirect_stdout(io.StringIO()):
                os.chdir(tmp)
                env = {}
                exec(lessons[0]['starter'], env)
                for lesson in lessons:
                    exec(lesson['answer'], env)
                    exec(lesson['connect'], env)
                    exec(lesson['tests'], env)
                with Image.open('monster.png') as image:
                    self.assertEqual(image.size, (16, 16))
                with Image.open('monster_large.png') as image:
                    self.assertEqual(image.size, (320, 320))
                with Image.open('monster_ghost.png') as ghost:
                    self.assertEqual(ghost.getpixel((2, 4))[3], 90)
                with Image.open('monster_blink.gif') as movie:
                    self.assertEqual(movie.n_frames, 2)
                    self.assertEqual(movie.size, (256, 256))
                    for i, duration in enumerate([650, 140]):
                        movie.seek(i)
                        self.assertEqual(movie.info['duration'], duration)
                        decoded = movie.convert('RGBA').resize((16, 16), Image.Resampling.NEAREST)
                        for got, expected in zip(pixels(decoded), pixels(env['frames'][i])):
                            self.assertEqual(got[3], expected[3])
                            if expected[3]:
                                self.assertEqual(got, expected)
                # Full answer notebook runs independently and does not export/overwrite files.
                before = {p.name: p.read_bytes() for p in Path(tmp).iterdir()}
                env = {}
                notebook = json.loads((MATERIALS / 'monster_answers.ipynb').read_text())
                for cell in notebook['cells']:
                    if cell['cell_type'] == 'code':
                        exec(''.join(cell['source']), env)
                self.assertEqual(before, {p.name: p.read_bytes() for p in Path(tmp).iterdir()})
        finally:
            os.chdir(previous)

    def test_preserve_original_and_generate(self):
        original = ref.draw_monster(ref.design, ref.palette)
        before = original.tobytes()
        new = (50, 220, 80, 90)
        changed = ref.replace_color(original, ref.palette['B'], new)
        self.assertEqual(original.tobytes(), before)
        for old, got in zip(pixels(original), pixels(changed)):
            self.assertEqual(got, new if old == ref.palette['B'] else old)
        generated = [ref.make_monster(i) for i in range(12)]
        self.assertGreater(len({m.tobytes() for m in generated}), 1)
        for i, monster in enumerate(generated):
            self.assertEqual(monster.tobytes(), ref.make_monster(i).tobytes())
            self.assertEqual(monster.tobytes(), monster.transpose(Image.Transpose.FLIP_LEFT_RIGHT).tobytes())
        backdrop = Image.new('RGBA', (16, 16), (24, 35, 58, 255))
        backdrop.alpha_composite(changed)
        expected = tuple(round(n * 90 / 255 + b * (1 - 90 / 255)) for n, b in zip(new[:3], (24, 35, 58)))
        self.assertEqual(backdrop.getpixel((2, 4)), (*expected, 255))

    def test_gif_clears_previous_frame_and_rejects_half_alpha(self):
        a = Image.new('RGBA', (4, 4), (0, 0, 0, 0))
        a.putpixel((0, 0), (0, 0, 0, 255))
        b = Image.new('RGBA', (4, 4), (0, 0, 0, 0))
        b.putpixel((3, 3), (255, 0, 0, 255))
        with Image.open(io.BytesIO(tools._gif_data([a, b], [200, 400], 2))) as gif:
            self.assertEqual(gif.info['loop'], 0)
            gif.seek(0)
            self.assertEqual(gif.convert('RGBA').getpixel((0, 0)), (0, 0, 0, 255))
            gif.seek(1)
            self.assertEqual(gif.convert('RGBA').getpixel((0, 0))[3], 0)
            self.assertEqual(gif.convert('RGBA').getpixel((7, 7)), (255, 0, 0, 255))
        b.putpixel((2, 2), (100, 200, 100, 90))
        with self.assertRaisesRegex(ValueError, 'PNG'):
            tools._gif_data([a, b], [200, 200])
        with self.assertRaises(ValueError):
            tools._gif_data([a], [25])
        with self.assertRaises(ValueError):
            tools._gif_data([a, Image.new('RGBA', (5, 5))], [100, 100])

    def test_json_loader(self):
        frames, durations = tools.load_project(MATERIALS / 'monster_project.json')
        self.assertEqual(frames[0].tobytes(), ref.draw_monster(ref.design, ref.palette).tobytes())
        self.assertEqual(durations, [650])
        data = json.loads((MATERIALS / 'monster_project.json').read_text())
        invalid = []
        for key, value in [('version', True), ('size', [17, 16]), ('durations', [25]), ('frames', [['.' * 15] * 16])]:
            obj = json.loads(json.dumps(data)); obj[key] = value; invalid.append(obj)
        obj = json.loads(json.dumps(data)); obj['palette']['.'][3] = 255; invalid.append(obj)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'invalid.json'
            for obj in invalid:
                path.write_text(json.dumps(obj))
                with self.assertRaises(ValueError): tools.load_project(path)


if __name__ == '__main__':
    unittest.main()
