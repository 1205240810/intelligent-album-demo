import os


# 百度地图 API Key。未配置时后端仍可启动，GPS 反查只会跳过。
BAIDU_AK = os.environ.get("BAIDU_AK", "").strip()
