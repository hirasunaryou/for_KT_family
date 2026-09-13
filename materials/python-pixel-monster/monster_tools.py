"""モンスター工房の完成部品。表示・GIFの色変換・設計図の読込を担当。
自分で書く部分はNotebook側の描画、色変更、変形、合成、生成、フレーム制作。
"""
import io
import json
from pathlib import Path
from PIL import Image, ImageDraw


def _image(image):
    if not isinstance(image, Image.Image):
        raise TypeError('Pillowの画像を渡そう')
    if not 1 <= image.width <= 1024 or not 1 <= image.height <= 1024:
        raise ValueError('表示する画像は幅・高さ1〜1024ピクセルにしよう')
    return image.convert('RGBA')


def _checker(size, cell=8):
    background = Image.new('RGBA', size, (246, 247, 252, 255))
    draw = ImageDraw.Draw(background)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x+cell-1, y+cell-1), fill=(208, 216, 231, 255))
    return background


def show_pixels(image, scale=16, grid=True):
    """元画像を変更せず、市松背景の上で拡大表示する。背景は保存されない。"""
    from IPython.display import display
    image = _image(image)
    if type(scale) is not int or not 1 <= scale <= 32 or max(image.size)*scale > 2048:
        raise ValueError('表示倍率を下げよう。表示の一辺は2048ピクセルまで')
    enlarged = image.resize((image.width*scale, image.height*scale), Image.Resampling.NEAREST)
    view = _checker(enlarged.size)
    view.alpha_composite(enlarged)
    if grid and scale >= 8:
        draw = ImageDraw.Draw(view)
        for x in range(0, view.width, scale): draw.line((x,0,x,view.height), fill=(145,155,178,100))
        for y in range(0, view.height, scale): draw.line((0,y,view.width,y), fill=(145,155,178,100))
    display(view)


def show_gallery(images, columns=3, scale=8):
    """画像を並べて見せる。合成を学ぶ回では、自分で配置計算を書こう。"""
    images = [_image(image) for image in images]
    if not images or len(images)>64 or type(columns) is not int or not 1 <= columns <= 16:
        raise ValueError('画像は1〜64枚、列数は1〜16にしよう')
    w, h = max(i.width for i in images), max(i.height for i in images)
    sheet = Image.new('RGBA', (columns*(w+2)+2, ((len(images)+columns-1)//columns)*(h+2)+2), (0,0,0,0))
    for index, image in enumerate(images):
        sheet.alpha_composite(image, dest=(2+(index%columns)*(w+2), 2+(index//columns)*(h+2)))
    show_pixels(sheet, scale=scale, grid=False)


def _gif_data(frames, durations, scale=16):
    frames = [_image(frame) for frame in frames]
    if not frames or len(frames)>32:
        raise ValueError('フレームは1〜32枚にしよう')
    if len(durations)!=len(frames) or any(type(t) is not int or not 20<=t<=5000 or t%10 for t in durations):
        raise ValueError('各フレームに、20〜5000msの10ms単位の時間を指定しよう')
    size = frames[0].size
    if any(frame.size!=size for frame in frames):
        raise ValueError('全フレームの幅と高さをそろえよう')
    if type(scale) is not int or not 1<=scale<=32 or size[0]*size[1]*scale*scale*len(frames)>16000000:
        raise ValueError('フレーム数か保存倍率を小さくしよう')
    colors = set()
    for frame in frames:
        for y in range(frame.height):
            for x in range(frame.width):
                r,g,b,a = frame.getpixel((x,y))
                if a not in (0,255):
                    raise ValueError('GIF用の透明度は0か255にしよう。半透明の作品はPNGで保存できる')
                if a: colors.add((r,g,b))
    if len(colors)>255:
        raise ValueError('このGIF部品は透明色を除いて255色まで。元のドット絵から作ろう')
    ordered = sorted(colors)
    indices = {color:i+1 for i,color in enumerate(ordered)}
    palette = [0,0,0]+[channel for color in ordered for channel in color]
    palette += [0]*(768-len(palette))
    encoded=[]
    for frame in frames:
        indexed=Image.new('P',size,0)
        indexed.putpalette(palette)
        values=[]
        for y in range(frame.height):
            for x in range(frame.width):
                r,g,b,a=frame.getpixel((x,y))
                values.append(indices[(r,g,b)] if a else 0)
        indexed.putdata(values)
        encoded.append(indexed.resize((size[0]*scale,size[1]*scale),Image.Resampling.NEAREST))
    stream=io.BytesIO()
    encoded[0].save(stream,format='GIF',save_all=True,append_images=encoded[1:],duration=list(durations),
                    loop=0,transparency=0,background=0,disposal=2,optimize=False)
    return stream.getvalue()


def preview_animation(frames, durations, scale=16):
    """Notebook内でGIFを再生。ファイルには保存しない。"""
    from IPython.display import Image as NotebookImage, display
    display(NotebookImage(data=_gif_data(frames,durations,scale),format='gif'))


def save_gif(frames, filename='monster_blink.gif', durations=None, scale=16):
    """透明背景を保つGIFを書き出す。同名ファイルは上書き。"""
    frames=list(frames)
    if durations is None: durations=[200]*len(frames)
    data=_gif_data(frames,durations,scale)
    path=Path(filename)
    path.write_bytes(data)
    print('保存した場所:',path.resolve())


def load_project(filename='monster_project.json'):
    """サイトで保存した16×16設計図から、Pillow画像のリストと表示時間を返す。"""
    data=json.loads(Path(filename).read_text(encoding='utf-8'))
    if not isinstance(data,dict) or type(data.get('version')) is not int or data.get('version')!=1 or data.get('size')!=[16,16]:
        raise ValueError('この教材の16×16設計図JSONを選ぼう')
    palette=data.get('palette'); designs=data.get('frames'); durations=data.get('durations')
    if not isinstance(palette,dict) or not 1<=len(palette)<=16:
        raise ValueError('パレットは1〜16色にしよう')
    for symbol,color in palette.items():
        if not isinstance(symbol,str) or len(symbol)!=1 or not isinstance(color,list) or len(color)!=4 or any(type(n) is not int or not 0<=n<=255 for n in color):
            raise ValueError('色は1文字の名前と、0〜255のRGBA値4つで指定しよう')
    if '.' not in palette or palette['.'][3] != 0:
        raise ValueError('透明色の.はA=0にしよう')
    if not isinstance(designs,list) or not 1<=len(designs)<=8:
        raise ValueError('設計図は1〜8枚にしよう')
    if not isinstance(durations,list) or len(durations)!=len(designs) or any(type(t) is not int or not 20<=t<=5000 or t%10 for t in durations):
        raise ValueError('各絵の表示時間を20〜5000msの10ms単位にしよう')
    frames=[]
    for design in designs:
        if not isinstance(design,list) or len(design)!=16 or any(not isinstance(row,str) or len(row)!=16 or any(s not in palette for s in row) for row in design):
            raise ValueError('各設計図は16行×16文字で、パレットにある文字だけにしよう')
        image=Image.new('RGBA',(16,16))
        for y,row in enumerate(design):
            for x,symbol in enumerate(row):image.putpixel((x,y),tuple(palette[symbol]))
        frames.append(image)
    return frames,list(durations)
