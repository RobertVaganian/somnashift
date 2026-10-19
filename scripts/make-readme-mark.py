"""Render the existing two-path mark as a small, looping README GIF."""
from pathlib import Path
from PIL import Image, ImageDraw
import math

ROOT = Path(__file__).resolve().parents[1]
SIZE, SCALE = 128, 4
PAPER, COPPER, QUIET = '#f6f1eb', '#854e40', '#d3bdb2'


def mix(a, b, progress):
    a, b = tuple(bytes.fromhex(a[1:])), tuple(bytes.fromhex(b[1:]))
    return tuple(round(x + (y - x) * progress) for x, y in zip(a, b))


def paths():
    # Same straight segments and 7-unit semicircles as docs/media/mark.svg.
    first = [(10, 29), (10, 17)]
    first += [(17 + 7 * math.cos(math.pi + i * math.pi / 80), 17 + 7 * math.sin(math.pi + i * math.pi / 80)) for i in range(81)]
    first += [(24, 19)]
    second = [(30, 11), (30, 23)]
    second += [(23 + 7 * math.cos(i * math.pi / 80), 23 + 7 * math.sin(i * math.pi / 80)) for i in range(81)]
    second += [(16, 21)]
    return first, second


def stroke(draw, points, progress, color):
    lengths = [math.dist(a, b) for a, b in zip(points, points[1:])]
    remaining, result = sum(lengths) * progress, [points[0]]
    for a, b, length in zip(points, points[1:], lengths):
        if remaining <= 0:
            break
        if remaining >= length:
            result.append(b)
            remaining -= length
        else:
            t = remaining / length
            result.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
            break
    unit = SIZE * SCALE / 40
    coords = [(x * unit, y * unit) for x, y in result]
    width = round(2.6 * unit)
    if len(coords) > 1:
        draw.line(coords, fill=color, width=width, joint='curve')
        radius = width / 2
        for x, y in (coords[0], coords[-1]):
            draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=color)


def frame(t):
    im = Image.new('RGB', (SIZE*SCALE, SIZE*SCALE), PAPER)
    draw = ImageDraw.Draw(im)
    # Hold a complete mark, soften it, then pass the two strokes in sequence.
    if t < .16:
        strength, a, b = 1, 1, 1
    elif t < .30:
        strength, a, b = 1-(t-.16)/.14, 1, 1
    else:
        strength = 1
        ease = lambda x: 1-(1-max(0,min(1,x)))**3
        a, b = ease((t-.30)/.27), ease((t-.39)/.27)
    for path, progress in zip(paths(), (a,b)):
        stroke(draw, path, 1, QUIET)
        stroke(draw, path, progress, mix(QUIET,COPPER,strength))
    im = im.resize((SIZE,SIZE),Image.Resampling.LANCZOS).convert('RGBA')
    mask = Image.new('L',(SIZE*SCALE,SIZE*SCALE),0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,SIZE*SCALE-1,SIZE*SCALE-1),radius=SIZE*SCALE/4,fill=255)
    im.putalpha(mask.resize((SIZE,SIZE),Image.Resampling.LANCZOS))
    return im


if __name__ == '__main__':
    destination = ROOT/'docs/media'
    destination.mkdir(parents=True,exist_ok=True)
    frames = [frame(i/95) for i in range(96)]
    frames[0].save(destination/'mark-still.png')
    palette = frames[0].convert('RGB').quantize(colors=255)
    indexed = []
    for image in frames:
        rgb = Image.new('RGB',image.size,PAPER)
        rgb.paste(image,mask=image.getchannel('A'))
        converted = rgb.quantize(palette=palette,dither=Image.Dither.NONE)
        converted.paste(255,mask=image.getchannel('A').point(lambda a:255 if a<128 else 0))
        converted.info['transparency'] = 255
        indexed.append(converted)
    indexed[0].save(destination/'mark-animated.gif', save_all=True, append_images=indexed[1:], duration=40, loop=0, transparency=255, disposal=2, optimize=False)
    print('Rendered mark-animated.gif and mark-still.png.')
