#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "frontend" / "public" / "data.json"
IMAGE_DIR = ROOT / "frontend" / "public" / "images" / "real"
TYPES = {
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
}
TIMES = {"白天", "黑夜"}
SEASONS = {"春", "夏", "秋", "冬"}


def fail(errors):
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    raise SystemExit(1)


def main():
    errors = []
    try:
        photos = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail([f"无法读取 {DATA_PATH}: {error}"])

    if not isinstance(photos, list):
        fail(["data.json 顶层必须是数组"])

    ids = []
    referenced = set()
    for index, photo in enumerate(photos, start=1):
        prefix = f"第 {index} 条"
        if not isinstance(photo, dict):
            errors.append(f"{prefix}不是对象")
            continue
        ids.append(str(photo.get("id")))
        if photo.get("type") not in TYPES:
            errors.append(f"{prefix} type 非法: {photo.get('type')}")
        if photo.get("time") not in TIMES:
            errors.append(f"{prefix} time 非法: {photo.get('time')}")
        if photo.get("season") not in SEASONS:
            errors.append(f"{prefix} season 非法: {photo.get('season')}")

        features = photo.get("features")
        if not isinstance(features, dict):
            errors.append(f"{prefix}缺少 features")
        else:
            for name in ("color_score", "texture_complexity"):
                value = features.get(name)
                if not isinstance(value, (int, float)) or isinstance(value, bool) or not 0 <= value <= 1:
                    errors.append(f"{prefix} {name} 必须在 0 到 1 之间")

        url = photo.get("url")
        if not isinstance(url, str) or not url.startswith("/images/real/"):
            errors.append(f"{prefix} url 必须指向 /images/real/")
            continue
        referenced.add(Path(url).name)

    duplicate_ids = [item for item, count in Counter(ids).items() if count > 1]
    if duplicate_ids:
        errors.append(f"重复 id: {', '.join(duplicate_ids)}")

    image_names = {path.name for path in IMAGE_DIR.glob("*.jpg")}
    if referenced - image_names:
        errors.append(f"缺失图片: {', '.join(sorted(referenced - image_names))}")
    if image_names - referenced:
        errors.append(f"未引用图片: {', '.join(sorted(image_names - referenced))}")

    for image_path in sorted(IMAGE_DIR.glob("*.jpg")):
        try:
            with Image.open(image_path) as image:
                image.verify()
            with Image.open(image_path) as image:
                if image.getexif():
                    errors.append(f"公开图片仍含 EXIF: {image_path.name}")
        except (OSError, SyntaxError) as error:
            errors.append(f"图片损坏 {image_path.name}: {error}")

    if errors:
        fail(errors)

    print(
        json.dumps(
            {
                "records": len(photos),
                "images": len(image_names),
                "types": dict(Counter(photo["type"] for photo in photos)),
                "times": dict(Counter(photo["time"] for photo in photos)),
                "seasons": dict(Counter(photo["season"] for photo in photos)),
                "exif": "clean",
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
