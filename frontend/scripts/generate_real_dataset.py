#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

CODEX_PYTHON_ROOT = (
    Path.home()
    / ".cache"
    / "codex-runtimes"
    / "codex-primary-runtime"
    / "dependencies"
    / "python"
)
CODEX_PYTHON = CODEX_PYTHON_ROOT / "bin" / "python3"

try:
    from PIL import Image, ImageFilter, ImageOps, ImageStat
except ModuleNotFoundError:
    if CODEX_PYTHON.exists() and Path(sys.executable).resolve() != CODEX_PYTHON.resolve():
        os.execv(str(CODEX_PYTHON), [str(CODEX_PYTHON), *sys.argv])
    raise


FRONTEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = FRONTEND_ROOT.parent
SOURCE_ROOTS = [
    REPO_ROOT / "data" / "raw" / "photo-album-test",
    REPO_ROOT / "backend" / "photo_album" / "users",
]
OUTPUT_DIR = FRONTEND_ROOT / "public" / "images" / "real"
DATA_PATH = FRONTEND_ROOT / "public" / "data.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_EDGE = 1800

TYPE_ORDER = [
    "山景",
    "海景",
    "河湖景观",
    "森林绿植",
    "古镇小镇",
    "现代化大都市",
    "乡村田园",
    "雪山冰川",
    "瀑布溪流",
    "历史古迹",
]


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def iter_source_images() -> list[Path]:
    images: list[Path] = []
    for root in SOURCE_ROOTS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
                images.append(path)
    return sorted(images, key=lambda item: str(item.relative_to(REPO_ROOT)))


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_datetime_from_name(path: Path) -> datetime | None:
    match = re.search(r"IMG_(\d{8})_(\d{6})", path.name)
    if not match:
        return None
    try:
        return datetime.strptime("".join(match.groups()), "%Y%m%d%H%M%S")
    except ValueError:
        return None


def parse_datetime_from_exif(image: Image.Image) -> datetime | None:
    try:
        exif = image.getexif()
    except Exception:
        return None
    for tag in (36867, 306, 36868):
        value = exif.get(tag)
        if not value:
            continue
        try:
            return datetime.strptime(str(value), "%Y:%m:%d %H:%M:%S")
        except ValueError:
            continue
    return None


def season_from_datetime(value: datetime | None) -> str:
    if value is None:
        return "春"
    if value.month in (3, 4, 5):
        return "春"
    if value.month in (6, 7, 8):
        return "夏"
    if value.month in (9, 10, 11):
        return "秋"
    return "冬"


def time_from_datetime(value: datetime | None) -> str:
    if value is None:
        return "白天"
    return "白天" if 6 <= value.hour < 18 else "黑夜"


def image_stats(image: Image.Image) -> dict[str, float]:
    sample = image.convert("RGB")
    sample.thumbnail((128, 128))
    hsv = sample.convert("HSV")
    hue, saturation_band, value_band = hsv.split()

    saturation = ImageStat.Stat(saturation_band).mean[0] / 255
    brightness = ImageStat.Stat(value_band).mean[0] / 255
    edge = ImageStat.Stat(sample.convert("L").filter(ImageFilter.FIND_EDGES)).mean[0] / 255

    if hasattr(hsv, "get_flattened_data"):
        pixels = list(hsv.get_flattened_data())
    else:
        pixels = list(hsv.getdata())
    total = max(1, len(pixels))
    green = sum(1 for h, s, v in pixels if 48 <= h <= 112 and s > 42 and v > 45) / total
    blue = sum(1 for h, s, v in pixels if 130 <= h <= 182 and s > 35 and v > 55) / total
    warm = sum(1 for h, s, v in pixels if (h <= 24 or 18 <= h <= 42) and s > 38 and v > 55) / total
    pale = sum(1 for _h, s, v in pixels if s < 32 and v > 168) / total
    dark = sum(1 for _h, _s, v in pixels if v < 64) / total

    return {
        "saturation": saturation,
        "brightness": brightness,
        "edge": edge,
        "green": green,
        "blue": blue,
        "warm": warm,
        "pale": pale,
        "dark": dark,
    }


def infer_type(stats: dict[str, float], time_label: str) -> str:
    if time_label == "黑夜" or (stats["dark"] > 0.46 and stats["edge"] > 0.08):
        return "现代化大都市"
    if stats["blue"] > 0.22 and stats["blue"] > stats["green"] * 1.2:
        return "海景" if stats["brightness"] > 0.48 else "河湖景观"
    if stats["green"] > 0.18 and stats["green"] > stats["blue"]:
        return "森林绿植" if stats["edge"] > 0.13 else "乡村田园"
    if stats["pale"] > 0.38 and stats["saturation"] < 0.2 and stats["brightness"] > 0.58:
        return "雪山冰川"
    if stats["warm"] > 0.18 and stats["edge"] > 0.16:
        return "古镇小镇"
    if stats["edge"] > 0.24 and stats["brightness"] > 0.34:
        return "山景"
    if stats["warm"] > 0.1:
        return "历史古迹"
    return "现代化大都市"


def safe_slug(path: Path) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", path.stem.lower()).strip("-")
    return slug[:54] or "photo"


def save_public_image(image: Image.Image, output_path: Path) -> None:
    exported = ImageOps.exif_transpose(image).convert("RGB")
    exported.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
    exported.save(output_path, "JPEG", quality=84, optimize=True, progressive=True)


def build_dataset() -> list[dict]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for old_image in OUTPUT_DIR.glob("*.jpg"):
        old_image.unlink()

    seen_hashes: set[str] = set()
    photos: list[dict] = []

    for source_path in iter_source_images():
        digest = file_hash(source_path)
        if digest in seen_hashes:
            continue
        seen_hashes.add(digest)

        try:
            with Image.open(source_path) as raw:
                image = ImageOps.exif_transpose(raw)
                captured_at = parse_datetime_from_name(source_path) or parse_datetime_from_exif(raw)
                stats = image_stats(image)
                time_label = time_from_datetime(captured_at)
                season = season_from_datetime(captured_at)
                scene_type = infer_type(stats, time_label)

                index = len(photos) + 1
                output_name = f"photo-{index:03d}-{safe_slug(source_path)}.jpg"
                output_path = OUTPUT_DIR / output_name
                save_public_image(image, output_path)

                photos.append(
                    {
                        "id": index,
                        "url": f"/images/real/{output_name}",
                        "type": scene_type,
                        "time": time_label,
                        "season": season,
                        "features": {
                            "color_score": round(
                                clamp(0.68 * stats["saturation"] + 0.24 * stats["brightness"] + 0.08 * (1 - stats["dark"])),
                                2,
                            ),
                            "texture_complexity": round(clamp(stats["edge"] * 3.1), 2),
                        },
                    }
                )
        except Exception as error:
            print(f"skip {source_path}: {error}")

    return photos


def main() -> None:
    photos = build_dataset()
    DATA_PATH.write_text(json.dumps(photos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"wrote {len(photos)} photos to {DATA_PATH.relative_to(REPO_ROOT)}")
    print("types:", dict(Counter(photo["type"] for photo in photos)))
    print("times:", dict(Counter(photo["time"] for photo in photos)))
    print("seasons:", dict(Counter(photo["season"] for photo in photos)))


if __name__ == "__main__":
    main()
