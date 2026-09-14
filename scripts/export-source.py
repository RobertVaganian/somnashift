"""Export the project for local evaluation or static hosting, without Git metadata."""
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FILES = (
    'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'package.json',
    '.editorconfig', '.gitattributes', '.gitignore',
)
DIRECTORIES = ('dist', 'docs', 'scripts', 'tests', '.github')
EXCLUDED = {'node_modules', '__pycache__', '.venv', '.DS_Store', 'Thumbs.db'}


def export(destination):
    destination = Path(destination).expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    paths = [ROOT / name for name in FILES]
    for name in DIRECTORIES:
        paths.extend((ROOT / name).rglob('*'))
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for source in sorted(set(paths)):
            relative = source.relative_to(ROOT)
            if source.is_symlink() or not source.is_file() or source == destination:
                continue
            if any(part in EXCLUDED or part.startswith('.env') for part in relative.parts):
                continue
            if source.suffix in {'.log', '.zip', '.pyc'} or source.name.startswith('__'):
                continue
            archive.write(source, Path('somnashift') / relative)
    print(f'Exported {destination} ({destination.stat().st_size:,} bytes)')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python scripts/export-source.py /path/somnashift-source.zip')
    export(sys.argv[1])
