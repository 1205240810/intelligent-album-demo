#!/usr/bin/env python3
import base64
import io
import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "frontend" / "public"
SOURCE_DATA = PUBLIC_DIR / "data.json"
OUTPUT_DATA = ROOT / "output" / "single-data.json"
MAX_EDGE = 1000
JPEG_QUALITY = 58


def main():
    photos = json.loads(SOURCE_DATA.read_text(encoding="utf-8"))
    compact_photos = []

    for photo in photos:
        image_path = PUBLIC_DIR / photo["url"].lstrip("/")
        with Image.open(image_path) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            image.save(
                buffer,
                "JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )

        compact_photo = dict(photo)
        compact_photo["source_url"] = photo["url"]
        compact_photo["url"] = "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")
        compact_photos.append(compact_photo)

    OUTPUT_DATA.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_DATA.write_text(
        json.dumps(compact_photos, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"wrote {len(compact_photos)} compact images ({OUTPUT_DATA.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
