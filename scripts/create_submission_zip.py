from pathlib import Path
import sys
import zipfile


def build_zip(source_dir: Path, output_path: Path) -> None:
    source_dir = source_dir.resolve()
    output_path = output_path.resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(
        output_path,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=6,
    ) as archive:
        for path in sorted(source_dir.rglob("*")):
            if not path.is_file():
                continue
            archive_name = path.relative_to(source_dir.parent).as_posix()
            archive.write(path, archive_name)

    with zipfile.ZipFile(output_path) as archive:
        unicode_entries = [
            info
            for info in archive.infolist()
            if any(ord(character) > 127 for character in info.filename)
        ]
        if unicode_entries and not all(info.flag_bits & 0x800 for info in unicode_entries):
            raise RuntimeError("ZIP 中仍有中文文件名缺少 UTF-8 标记")
        bad_entry = archive.testzip()
        if bad_entry:
            raise RuntimeError(f"ZIP 完整性检查失败: {bad_entry}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("用法: create_submission_zip.py <source_dir> <output_zip>")
    build_zip(Path(sys.argv[1]), Path(sys.argv[2]))
