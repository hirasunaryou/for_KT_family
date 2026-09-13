"""ドット絵モンスター工房・描画と加工の完成例。実行時にファイルを上書きしない。"""

from PIL import Image

design = (
    '................',
    '....##....##....',
    '...#HH#..#HH#...',
    '..#BBBB##BBBB#..',
    '.#BBBBBBBBBBBB#.',
    '.#BBBWWBBWWBBB#.',
    '.#BBBWEBBEWBBB#.',
    '.#BBCBBBBBBCBB#.',
    '.#BBBBB##BBBBB#.',
    '..#BBBBBBBBBB#..',
    '...#BBBBBBBB#...',
    '..#BB######BB#..',
    '.#BBB#....#BBB#.',
    '.####......####.',
    '................',
    '................',
)
palette = {
    '.': (0, 0, 0, 0),
    '#': (32, 44, 71, 255),
    'B': (113, 87, 223, 255),
    'H': (186, 169, 255, 255),
    'W': (250, 250, 255, 255),
    'E': (20, 25, 40, 255),
    'C': (255, 120, 165, 255),
}

def draw_monster(design, palette):
    height = len(design)
    width = len(design[0])
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for y, row in enumerate(design):
        for x, symbol in enumerate(row):
            image.putpixel((x, y), palette[symbol])
    return image


def replace_color(image, old, new):
    result = image.copy()
    for y in range(result.height):
        for x in range(result.width):
            if result.getpixel((x, y)) == old:
                result.putpixel((x, y), new)
    return result


import random

def make_monster(seed=0):
    rng = random.Random(seed)
    body = (rng.randint(50, 220), rng.randint(50, 220), rng.randint(50, 220), 255)
    outline = (32, 44, 71, 255)
    image = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for y in range(3, 12):
        left = rng.randint(2, 5)
        for x in range(left, 8):
            image.putpixel((x, y), body)
            image.putpixel((15 - x, y), body)
        image.putpixel((left - 1, y), outline)
        image.putpixel((16 - left, y), outline)
    for x in [5, 6, 9, 10]:
        for y in [5, 6]:
            image.putpixel((x, y), (250, 250, 255, 255))
    for x in [6, 9]:
        image.putpixel((x, 6), (20, 25, 40, 255))
    for x in [7, 8]:
        image.putpixel((x, 9), outline)
    for x in [5, 6, 9, 10]:
        image.putpixel((x, 12), outline)
    return image
