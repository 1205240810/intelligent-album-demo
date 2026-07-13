import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env.local"))


# 百度地图 API Key。未配置时后端仍可启动，GPS 反查只会跳过。
BAIDU_AK = os.environ.get("BAIDU_AK", "").strip()


def _positive_int(name, default):
    try:
        value = int(os.environ.get(name, default))
    except (TypeError, ValueError):
        return default
    return value if value > 0 else default


MAX_UPLOAD_MB = _positive_int("MAX_UPLOAD_MB", 20)
