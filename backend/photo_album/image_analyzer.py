import logging
import os
import platform
import exifread
import re
from datetime import datetime
from api_baidu import reverse_geocode_to_spot
from utils import get_season_and_timeperiod, get_brand_from_model, infer_scene_type_from_address


logger = logging.getLogger(__name__)


def parse_gps_value(gps_str):
    """将EXIF中度分秒字符串转换为十进制度数"""
    match = re.search(r'\[(.*?)\]', gps_str)
    if not match:
        return None
    parts = match.group(1).replace('/', ',').split(',')
    parts = [p.strip() for p in parts]

    try:
        if len(parts) == 3:
            degrees = float(parts[0])
            minutes = float(parts[1])
            seconds = float(parts[2])
            return degrees + minutes / 60 + seconds / 3600
        elif len(parts) == 4:
            degrees = float(parts[0])
            minutes = float(parts[1])
            seconds = float(parts[2]) / float(parts[3])
            return degrees + minutes / 60 + seconds / 3600
        else:
            return None
    except (ValueError, ZeroDivisionError):
        return None


def get_image_metadata(image_path, baidu_ak=None):
    """提取照片的元数据；调用方负责持久化，避免重复写入。"""
    metadata = {
        "拍摄时间": None,
        "手机型号": None,
        "手机品牌": None,
        "GPS坐标": None,
        "拍摄地址": None,
        "省份": None,
        "季节": None,
        "时段": None,
        "景点类型": None
    }

    logger.debug("正在处理文件: %s", image_path)

    if not os.path.exists(image_path):
        logger.error("文件不存在: %s", image_path)
        metadata["拍摄时间"] = "文件不存在"
        return metadata

    # ========== 1. EXIF 提取 ==========
    try:
        if os.path.splitext(image_path)[1].lower() not in {'.jpg', '.jpeg', '.tif', '.tiff'}:
            tags = {}
        else:
            with open(image_path, 'rb') as f:
                tags = exifread.process_file(f)
        logger.debug("EXIF标签数量: %s", len(tags))
    except Exception as e:
        logger.debug("读取EXIF失败: %s", e)
        tags = {}

    # 拍摄时间
    time_from_exif = None
    for tag_name in ['EXIF DateTimeOriginal', 'Image DateTime', 'EXIF DateTimeDigitized']:
        if tag_name in tags:
            raw = str(tags[tag_name])
            logger.debug("找到时间标签 %s = %s", tag_name, raw)
            time_from_exif = raw
            break

    if time_from_exif:
        if len(time_from_exif) == 10 and ':' in time_from_exif:
            time_from_exif += " 00:00:00"
        metadata["拍摄时间"] = time_from_exif
        logger.debug("使用EXIF时间: %s", metadata['拍摄时间'])

    # 手机型号和品牌
    make = str(tags.get('Image Make', ''))
    model = str(tags.get('Image Model', ''))
    if make and model:
        metadata["手机型号"] = f"{make} {model}".strip()
    elif model:
        metadata["手机型号"] = model
    elif make:
        metadata["手机型号"] = make

    if metadata["手机型号"]:
        metadata["手机品牌"] = get_brand_from_model(metadata["手机型号"])
    logger.debug("手机型号: %s, 品牌: %s", metadata['手机型号'], metadata['手机品牌'])

    # GPS坐标和地址
    try:
        gps_latitude_ref = tags.get('GPS GPSLatitudeRef')
        gps_latitude = tags.get('GPS GPSLatitude')
        gps_longitude_ref = tags.get('GPS GPSLongitudeRef')
        gps_longitude = tags.get('GPS GPSLongitude')

        if gps_latitude and gps_longitude:
            lat = parse_gps_value(str(gps_latitude))
            lon = parse_gps_value(str(gps_longitude))

            if lat is not None and lon is not None:
                if str(gps_latitude_ref).strip() == 'S':
                    lat = -lat
                if str(gps_longitude_ref).strip() == 'W':
                    lon = -lon

                metadata["GPS坐标"] = (lat, lon)
                logger.debug("解析到GPS坐标: (%s, %s)", lat, lon)

                if baidu_ak:
                    addr = reverse_geocode_to_spot(lat, lon, baidu_ak)
                    if addr:
                        metadata["拍摄地址"] = addr
                        logger.debug("地址解析结果: %s", addr)

                        if "·" in addr:
                            metadata["省份"] = addr.split("·")[0].strip()

                        metadata["景点类型"] = infer_scene_type_from_address(addr)
    except Exception as e:
        logger.debug("GPS解析出错: %s", e)

    # 如果EXIF没有时间，用文件系统时间
    if metadata["拍摄时间"] is None:
        try:
            stat = os.stat(image_path)
            if platform.system() == 'Windows':
                timestamp = stat.st_ctime
            else:
                timestamp = stat.st_mtime
            dt = datetime.fromtimestamp(timestamp)
            metadata["拍摄时间"] = dt.strftime("%Y:%m:%d %H:%M:%S")
            logger.debug("使用文件时间: %s", metadata['拍摄时间'])
        except Exception as e:
            logger.error("读取文件时间失败: %s", e)
            metadata["拍摄时间"] = "无法获取时间"

    # 计算季节和时段
    if metadata["拍摄时间"] and metadata["拍摄时间"] != "无法获取时间":
        season, period = get_season_and_timeperiod(metadata["拍摄时间"])
        metadata["季节"] = season
        metadata["时段"] = period

    return metadata
