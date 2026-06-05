import requests
import math


def wgs84_to_bd09(lat, lon):
    """WGS-84转BD-09（百度坐标系）"""
    a = 6378245.0
    ee = 0.00669342162296594323
    x = lon - 105.0
    y = lat - 35.0

    dlat = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * math.sqrt(abs(x))
    dlat += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    dlat += (20.0 * math.sin(y * math.pi) + 40.0 * math.sin(y / 3.0 * math.pi)) * 2.0 / 3.0
    dlat += (160.0 * math.sin(y / 12.0 * math.pi) + 320 * math.sin(y * math.pi / 30.0)) * 2.0 / 3.0

    dlon = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(abs(x))
    dlon += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    dlon += (20.0 * math.sin(x * math.pi) + 40.0 * math.sin(x / 3.0 * math.pi)) * 2.0 / 3.0
    dlon += (150.0 * math.sin(x / 12.0 * math.pi) + 300.0 * math.sin(x / 30.0 * math.pi)) * 2.0 / 3.0

    radlat = lat / 180.0 * math.pi
    magic = math.sin(radlat)
    magic = 1 - ee * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * math.pi)
    dlon = (dlon * 180.0) / (a / sqrtmagic * math.cos(radlat) * math.pi)
    mg_lat = lat + dlat
    mg_lon = lon + dlon

    z = math.sqrt(mg_lon * mg_lon + mg_lat * mg_lat) + 0.00002 * math.sin(mg_lat * math.pi * 3000.0 / 180.0)
    theta = math.atan2(mg_lat, mg_lon) + 0.000003 * math.cos(mg_lon * math.pi * 3000.0 / 180.0)
    bd_lon = z * math.cos(theta) + 0.0065
    bd_lat = z * math.sin(theta) + 0.006
    return bd_lat, bd_lon


def reverse_geocode_to_spot(lat, lon, baidu_ak):
    """根据GPS坐标获取地址（省、市、区、最近的景点/地标）"""
    bd_lat, bd_lon = wgs84_to_bd09(lat, lon)

    url = "https://api.map.baidu.com/reverse_geocoding/v3/"
    params = {
        "ak": baidu_ak,
        "output": "json",
        "location": f"{bd_lat},{bd_lon}",
        "extensions_poi": "1"
    }

    try:
        resp = requests.get(url, params=params, timeout=5)
        data = resp.json()
        status = data.get("status")

        if status != 0:
            return None

        result = data.get("result", {})
        addr_component = result.get("addressComponent", {})

        province = addr_component.get("province", "")
        city = addr_component.get("city", "")
        district = addr_component.get("district", "")

        # 查找景点
        spot_name = None
        pois = result.get("pois", [])
        if pois:
            for poi in pois:
                tag = poi.get("tag", "")
                if any(kw in tag for kw in ["景点", "旅游", "公园", "风景"]):
                    spot_name = poi.get("name")
                    break
            if not spot_name and pois:
                spot_name = pois[0].get("name")

        parts = [p for p in [province, city, district] if p]
        result_str = " · ".join(parts) if parts else "未知地区"
        if spot_name:
            result_str += f" · {spot_name}"

        return result_str
    except Exception as e:
        return None