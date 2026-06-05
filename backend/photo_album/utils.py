from datetime import datetime


def get_season_and_timeperiod(datetime_str):
    """根据拍摄时间返回季节和时段"""
    try:
        normalized = datetime_str.replace(':', '-', 2)
        dt = datetime.strptime(normalized, "%Y-%m-%d %H:%M:%S")
    except:
        return "未知", "未知"

    month = dt.month
    if 3 <= month <= 5:
        season = "春"
    elif 6 <= month <= 8:
        season = "夏"
    elif 9 <= month <= 11:
        season = "秋"
    else:
        season = "冬"

    hour = dt.hour
    period = "白天" if 6 <= hour < 18 else "晚上"

    return season, period


def get_brand_from_model(model_name):
    """根据手机型号判断品牌"""
    if not model_name:
        return "未知"

    model_upper = model_name.upper()

    if 'IPHONE' in model_upper:
        return "苹果"
    if 'HUAWEI' in model_upper:
        return "华为"
    if 'HONOR' in model_upper:
        return "荣耀"
    if any(kw in model_upper for kw in ['XIAOMI', 'MI ', 'MI-', 'REDMI', 'POCO']):
        if 'REDMI' in model_upper:
            return "红米"
        if 'POCO' in model_upper:
            return "POCO"
        return "小米"
    if any(kw in model_upper for kw in ['OPPO', 'REALME', 'ONEPLUS']):
        if 'REALME' in model_upper:
            return "真我"
        if 'ONEPLUS' in model_upper:
            return "一加"
        return "OPPO"
    if any(kw in model_upper for kw in ['VIVO', 'IQOO']):
        if 'IQOO' in model_upper:
            return "iQOO"
        return "VIVO"
    if 'SAMSUNG' in model_upper or 'SM-' in model_upper:
        return "三星"

    camera_brands = ['CANON', 'NIKON', 'SONY', 'FUJIFILM']
    for brand in camera_brands:
        if brand in model_upper:
            return f"相机-{brand.capitalize()}"

    return "其他"


def infer_scene_type_from_address(address):
    """根据地址文本推断景点类型（修正版）"""
    if not address:
        return "未知"

    # 拆分成段落，取最后一段（通常是具体景点/建筑名）
    parts = address.split("·")
    last_part = parts[-1].strip() if parts else address

    # 类型关键词映射（优先匹配更具体的词）
    type_map = [
        ("海滨", ["岛", "海滨", "沙滩", "海岸", "海湾", "滨海", "海景", "渔村"]),
        ("山川", ["山", "峰", "岭", "岳", "山脉", "山谷", "雪山"]),
        ("古镇", ["古镇", "古城", "老街", "水乡", "古村", "旧居", "故居"]),
        ("园林", ["园", "林", "苑", "圃", "植物园", "动物园"]),
        ("湖泊", ["湖", "泊", "潭", "湿地", "水库", "江", "河"]),
        ("寺庙", ["寺", "庙", "观", "宫", "禅", "教堂", "清真寺", "庵"]),
        ("商场", ["商场", "购物中心", "商业广场", "广场", "百货", "中骏", "万达", "万象城", "龙湖","银泰"]),
        ("学校", ["大学", "学院", "中学", "小学", "学校", "校区", "幼儿园"]),
        ("医院", ["医院", "诊所", "卫生院", "医疗"]),
        ("公园", ["公园", "风景", "景区", "旅游"]),
        ("城市景观", ["大厦", "中心", "地标", "塔", "桥", "广场", "步行街"]),
    ]

    # 优先匹配最后一段
    for scene_type, keywords in type_map:
        for kw in keywords:
            if kw in last_part:
                return scene_type

    # 都没匹配上，返回其他
    return "其他"