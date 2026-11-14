"""Flag blue pointer highlights in the warm product captures.

This palette-specific heuristic supplements visual review; it is not a general
cursor detector. Review every flagged crop before replacing an asset.
Requires Pillow; run from any directory with python scripts/review-captures.py.
"""
from pathlib import Path
from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[1]
files = sorted((root / 'docs/screenshots').rglob('*.jpg'))
files += [root / 'docs/media/overview.jpg', root / 'dist/media/walkthrough-poster.jpg']
flagged = []
for path in files:
    with Image.open(path) as image:
        red, green, blue = image.convert('RGB').split()
        mask = ImageChops.multiply(
            ImageChops.subtract(blue, red).point(lambda v: 255 if v > 20 else 0),
            ImageChops.subtract(green, red).point(lambda v: 255 if v > 7 else 0),
        )
        mask = ImageChops.multiply(mask, blue.point(lambda v: 255 if v > 100 else 0))
        count = mask.histogram()[255]
        if count > 3:
            flagged.append(path)
            print(f'{path.relative_to(root)}: {count} blue pixels at {mask.getbbox()}')
if flagged:
    raise SystemExit(1)
print(f'Checked {len(files)} captures: no unexpected blue highlights.')
