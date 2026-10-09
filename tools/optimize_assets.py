"""Create web-sized copies without modifying the original Raw artwork."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FOLDERS = [ROOT / "MetamaxWeb" / "assets", ROOT / "Exbots-Revolution" / "assets"]

for folder in FOLDERS:
    images = list(folder.glob("*.png"))
    for index in range(len(images)):
        source = images[index]
        with Image.open(source) as image:
            image.thumbnail((1600, 1200))
            image.save(source.with_suffix(".webp"), "WEBP", quality=86, method=6)
        print(source.with_suffix(".webp").relative_to(ROOT))
