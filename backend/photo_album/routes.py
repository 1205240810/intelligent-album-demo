import os
import json
import shutil
from datetime import datetime
from urllib.parse import quote

from flask import Blueprint, abort, jsonify, request, send_file
from werkzeug.utils import secure_filename
from image_analyzer import get_image_metadata
from stats_manager import StatsManager
from config import BAIDU_AK


api = Blueprint('api', __name__)

# 配置
root_path = os.path.dirname(os.path.abspath(__file__))
USERS_BASE = os.path.join(root_path, "users")
os.makedirs(USERS_BASE, exist_ok=True)

# 初始化统计管理器（统计数据保存在后端 data 目录）
stats_mgr = StatsManager(os.path.join(root_path, "data"))
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
CONTRACT_TYPES = {
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
CONTRACT_TIMES = {"白天", "黑夜"}
CONTRACT_SEASONS = {"春", "夏", "秋", "冬"}
SCENE_TYPE_MAP = {
    "山川": "山景",
    "海滨": "海景",
    "湖泊": "河湖景观",
    "园林": "森林绿植",
    "公园": "森林绿植",
    "古镇": "古镇小镇",
    "城市景观": "现代化大都市",
    "商场": "现代化大都市",
    "学校": "现代化大都市",
    "医院": "现代化大都市",
    "寺庙": "历史古迹",
}
TIME_MAP = {
    "晚上": "黑夜",
}
ADDRESS_TYPE_HINTS = [
    ("雪山冰川", ("雪山", "冰川", "冰峰")),
    ("瀑布溪流", ("瀑布", "溪", "涧", "泉")),
    ("河湖景观", ("湖", "江", "河", "潭", "水库", "湿地")),
    ("海景", ("海", "岛", "沙滩", "海湾", "滨海")),
    ("山景", ("山", "峰", "岭", "岳", "峡谷")),
    ("森林绿植", ("森林", "公园", "园林", "植物园", "花园")),
    ("古镇小镇", ("古镇", "古城", "老街", "水乡", "古村", "街区")),
    ("历史古迹", ("历史", "遗址", "寺", "庙", "塔", "故居", "博物馆")),
    ("现代化大都市", ("商场", "购物中心", "广场", "大厦", "中心", "万象城", "银泰", "中骏")),
    ("乡村田园", ("乡村", "田园", "农庄", "村")),
]


# ==================== 辅助函数 ====================
def _update_stats_decrement(stats, target_info):
    """从统计字典中减去 target_info 中的各项计数"""
    stats["总照片数"] = max(0, stats.get("总照片数", 0) - 1)
    stat_key_map = {
        "省份": "省份统计",
        "景点类型": "景点类型统计",
        "手机品牌": "品牌统计",
        "季节": "季节统计",
        "时段": "时段统计",
    }
    for key, stat_key in stat_key_map.items():
        val = target_info.get(key)
        if val and stat_key in stats and val in stats[stat_key]:
            stats[stat_key][val] -= 1
            if stats[stat_key][val] <= 0:
                del stats[stat_key][val]


def _safe_users_path(*parts):
    base = os.path.realpath(USERS_BASE)
    candidate = os.path.realpath(os.path.join(USERS_BASE, *[p for p in parts if p]))
    if candidate == base or candidate.startswith(base + os.sep):
        return candidate
    return None


def _is_image_file(path):
    return os.path.splitext(path)[1].lower() in IMAGE_EXTENSIONS


def _album_photo_dirs(username, album_name):
    candidates = [
        _safe_users_path(username, "photos", album_name),
        _safe_users_path(username, album_name, "photos"),
    ]
    seen = set()
    result = []
    for candidate in candidates:
        if candidate and candidate not in seen and os.path.isdir(candidate):
            seen.add(candidate)
            result.append(candidate)
    return result


def _album_delete_dirs(username, album_name):
    candidates = [
        _safe_users_path(username, album_name),
        _safe_users_path(username, "photos", album_name),
    ]
    seen = set()
    result = []
    for candidate in candidates:
        if candidate and candidate not in seen and os.path.isdir(candidate):
            seen.add(candidate)
            result.append(candidate)
    return result


def _iter_album_images(username, album_name):
    images = []
    for photo_dir in _album_photo_dirs(username, album_name):
        for filename in sorted(os.listdir(photo_dir)):
            image_path = os.path.join(photo_dir, filename)
            if os.path.isfile(image_path) and _is_image_file(image_path):
                images.append(image_path)
    return images


def _delete_photo_files(username, album_name, filename):
    candidates = [
        _safe_users_path(username, album_name, "photos", filename),
        _safe_users_path(username, album_name, "thumbnails", filename),
        _safe_users_path(username, "photos", album_name, filename),
        _safe_users_path(username, "thumbnails", album_name, filename),
    ]
    for candidate in candidates:
        if candidate and os.path.isfile(candidate):
            os.remove(candidate)


def _metadata_file(username):
    return _safe_users_path(username, "photos_metadata.json")


def _load_user_metadata(username):
    user_meta_file = _metadata_file(username)
    if not user_meta_file or not os.path.exists(user_meta_file):
        return []
    try:
        with open(user_meta_file, "r", encoding="utf-8") as f:
            photos = json.load(f)
    except (json.JSONDecodeError, OSError):
        return []
    return photos if isinstance(photos, list) else []


def _save_photo_metadata(username, photo_info):
    user_meta_file = _metadata_file(username)
    if not user_meta_file:
        raise ValueError("非法用户路径")
    os.makedirs(os.path.dirname(user_meta_file), exist_ok=True)
    all_photos = _load_user_metadata(username)
    filename = photo_info.get("filename")
    album_name = photo_info.get("album_name")
    all_photos = [
        photo for photo in all_photos
        if not (photo.get("filename") == filename and photo.get("album_name") == album_name)
    ]
    all_photos.append(photo_info)
    with open(user_meta_file, "w", encoding="utf-8") as f:
        json.dump(all_photos, f, ensure_ascii=False, indent=2)


def _relative_media_path(image_path):
    return os.path.relpath(image_path, USERS_BASE).replace(os.sep, "/")


def _media_url(image_path):
    return f"{request.url_root.rstrip('/')}/media/{quote(_relative_media_path(image_path), safe='/')}"


def _clamp_score(value, default=0.5):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return round(default, 2)
    return round(max(0.0, min(1.0, number)), 2)


def _season_from_file_time(image_path):
    try:
        month = datetime.fromtimestamp(os.path.getmtime(image_path)).month
    except OSError:
        return "春"
    if month in (3, 4, 5):
        return "春"
    if month in (6, 7, 8):
        return "夏"
    if month in (9, 10, 11):
        return "秋"
    return "冬"


def _time_from_file_time(image_path):
    try:
        hour = datetime.fromtimestamp(os.path.getmtime(image_path)).hour
    except OSError:
        return "白天"
    return "白天" if 6 <= hour < 18 else "黑夜"


def _normalize_scene_type(scene_type, metadata):
    mapped_type = SCENE_TYPE_MAP.get(scene_type, scene_type)
    if mapped_type in CONTRACT_TYPES:
        return mapped_type

    address = metadata.get("拍摄地址") or metadata.get("address") or ""
    for type_name, keywords in ADDRESS_TYPE_HINTS:
        if any(keyword in address for keyword in keywords):
            return type_name

    return "现代化大都市"


def _normalize_time(period, image_path):
    mapped_time = TIME_MAP.get(period, period)
    if mapped_time in CONTRACT_TIMES:
        return mapped_time
    return _time_from_file_time(image_path)


def _normalize_season(season, image_path):
    if season in CONTRACT_SEASONS:
        return season
    return _season_from_file_time(image_path)


def _estimate_image_features(image_path):
    """Estimate lightweight visual features when analyzer metadata is missing."""
    try:
        from PIL import Image, ImageFilter, ImageStat

        with Image.open(image_path) as image:
            rgb = image.convert("RGB")
            rgb.thumbnail((96, 96))
            hsv = rgb.convert("HSV")
            saturation = ImageStat.Stat(hsv.split()[1]).mean[0] / 255
            brightness = ImageStat.Stat(hsv.split()[2]).mean[0] / 255
            edge_map = rgb.convert("L").filter(ImageFilter.FIND_EDGES)
            edge_mean = ImageStat.Stat(edge_map).mean[0] / 255

        return {
            "color_score": _clamp_score(0.7 * saturation + 0.3 * brightness),
            "texture_complexity": _clamp_score(edge_mean * 2.8),
        }
    except Exception:
        return {
            "color_score": 0.5,
            "texture_complexity": 0.5,
        }


def _metadata_index(metadata, album_name):
    exact = {}
    fallback = {}
    for item in metadata:
        filename = item.get("filename")
        if not filename:
            continue
        if item.get("album_name") == album_name:
            exact[filename] = item
        fallback.setdefault(filename, item)
    return exact, fallback


def _to_contract_photo(index, image_path, metadata):
    features = metadata.get("features") if isinstance(metadata.get("features"), dict) else {}
    estimated_features = _estimate_image_features(image_path)
    scene_type = metadata.get("景点类型") or metadata.get("type") or "其他"
    period = metadata.get("时段") or metadata.get("time") or "未知"
    season = metadata.get("季节") or metadata.get("season") or "未知"
    return {
        "id": index,
        "url": _media_url(image_path),
        "type": _normalize_scene_type(scene_type, metadata),
        "time": _normalize_time(period, image_path),
        "season": _normalize_season(season, image_path),
        "features": {
            "color_score": _clamp_score(
                features.get("color_score", metadata.get("color_score")),
                estimated_features["color_score"],
            ),
            "texture_complexity": _clamp_score(
                features.get("texture_complexity", metadata.get("texture_complexity")),
                estimated_features["texture_complexity"],
            ),
        },
    }


def _updated_at(image_paths, username):
    timestamps = [os.path.getmtime(path) for path in image_paths if os.path.exists(path)]
    user_meta_file = _metadata_file(username)
    if user_meta_file and os.path.exists(user_meta_file):
        timestamps.append(os.path.getmtime(user_meta_file))
    if not timestamps:
        return datetime.now().astimezone().isoformat()
    return datetime.fromtimestamp(max(timestamps)).astimezone().isoformat()


@api.route("/api/photos", methods=["GET"])
def get_photos():
    username = (request.args.get("username") or "张三").strip()
    album_name = (request.args.get("album_name") or "我的照片").strip()
    if not username or not album_name:
        return jsonify({"error": "用户名和相册名不能为空"}), 400
    if not _safe_users_path(username) or not _safe_users_path(username, "photos", album_name):
        return jsonify({"error": "非法路径"}), 400

    image_paths = _iter_album_images(username, album_name)
    metadata = _load_user_metadata(username)
    exact_metadata, fallback_metadata = _metadata_index(metadata, album_name)

    photos = []
    for index, image_path in enumerate(image_paths, start=1):
        filename = os.path.basename(image_path)
        photo_metadata = exact_metadata.get(filename) or fallback_metadata.get(filename) or {}
        photos.append(_to_contract_photo(index, image_path, photo_metadata))

    return jsonify({
        "photos": photos,
        "meta": {
            "total": len(photos),
            "updated_at": _updated_at(image_paths, username),
            "username": username,
            "album_name": album_name,
        },
    })


@api.route("/media/<path:media_path>", methods=["GET"])
def get_media(media_path):
    image_path = _safe_users_path(media_path)
    if not image_path or not os.path.isfile(image_path) or not _is_image_file(image_path):
        abort(404)
    return send_file(image_path, conditional=True)


# ==================== 用户注册 ====================
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({"error": "用户名不能为空"}), 400
    user_dir = os.path.join(USERS_BASE, username)
    if os.path.exists(user_dir):
        return jsonify({"error": "用户已存在"}), 400
    os.makedirs(user_dir, exist_ok=True)
    # 初始化用户统计（stats_manager 的方法）
    stats_mgr.init_user_stats(username)
    return jsonify({"message": f"用户 {username} 注册成功"})


# ==================== 创建相册 ====================
@api.route('/create_album', methods=['POST'])
def create_album():
    data = request.get_json()
    username = data.get('username')
    album_name = data.get('album_name')
    if not username or not album_name:
        return jsonify({"error": "用户名和相册名不能为空"}), 400
    user_dir = os.path.join(USERS_BASE, username)
    if not os.path.exists(user_dir):
        return jsonify({"error": "用户不存在，请先注册"}), 400
    album_dir = os.path.join(user_dir, album_name)
    if os.path.exists(album_dir):
        return jsonify({"error": "相册已存在"}), 400
    os.makedirs(os.path.join(album_dir, "photos"), exist_ok=True)
    os.makedirs(os.path.join(album_dir, "thumbnails"), exist_ok=True)
    stats_mgr.init_album_stats(username, album_name)
    return jsonify({"message": f"相册 {album_name} 创建成功"})


# ==================== 上传照片 ====================
@api.route('/upload', methods=['POST'])
def upload_photo():
    username = request.form.get('username')
    album_name = request.form.get('album_name')
    file = request.files.get('photo')
    if not all([username, album_name, file]):
        return jsonify({"error": "缺少参数"}), 400

    filename = secure_filename(file.filename or "")
    if not filename:
        filename = f"photo_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
    album_dir = os.path.join(USERS_BASE, username, album_name)
    photos_dir = os.path.join(album_dir, "photos")
    thumbs_dir = os.path.join(album_dir, "thumbnails")
    os.makedirs(photos_dir, exist_ok=True)
    os.makedirs(thumbs_dir, exist_ok=True)

    # 保存原图
    original_path = os.path.join(photos_dir, filename)
    file.save(original_path)

    # 生成缩略图（去除EXIF）
    try:
        from PIL import Image
        img = Image.open(original_path)
        # 调整大小（可选，例如宽度不超过1200）
        img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        # 保存为JPEG，不保留exif
        thumb_path = os.path.join(thumbs_dir, filename)
        # 如果是PNG，可能需要转换；简单处理：保存为JPEG
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.save(thumb_path, 'JPEG', quality=85, optimize=True, exif=b'')
    except Exception as e:
        print(f"生成缩略图失败: {e}")

    # 分析原图（读EXIF）
    photo_info = get_image_metadata(original_path, BAIDU_AK)
    photo_info["filename"] = filename
    photo_info["album_name"] = album_name

    # 更新三层统计
    stats_mgr.update_album_stats(username, album_name, photo_info)
    stats_mgr.update_user_stats(username, photo_info)
    stats_mgr.update_platform_stats(photo_info)

    # 保存照片元数据到用户级文件（用于 visited 树），同相册同文件名覆盖旧记录
    _save_photo_metadata(username, photo_info)

    return jsonify({
        "photo_info": photo_info,
        "album_stats": stats_mgr.get_album_stats(username, album_name),
        "user_stats": stats_mgr.get_user_stats(username),
        "platform_stats": stats_mgr.get_platform_stats()
    })


def _aggregate_visited(self, username):
    """从 photos_metadata.json 中解析省→市→区树，若失败则回退到用户统计中的省份"""
    visited = {}

    # 1. 尝试从 photos_metadata.json 读取
    user_metadata_file = os.path.join(root_path,"users", username, "photos_metadata.json")
    if os.path.exists(user_metadata_file):
        with open(user_metadata_file, 'r', encoding='utf-8') as f:
            photos = json.load(f)
        for photo in photos:
            address = photo.get("拍摄地址", "")
            if address and "·" in address:
                parts = [p.strip() for p in address.split("·") if p.strip()]
                if len(parts) >= 1:
                    province = parts[0]
                    city = parts[1] if len(parts) >= 2 else "未知市"
                    district = parts[2] if len(parts) >= 3 else "未知区"
                    visited.setdefault(province, {}).setdefault(city, set()).add(district)
            else:
                # 如果没有完整地址，尝试使用省份字段
                province = photo.get("省份")
                if province:
                    visited.setdefault(province, {}).setdefault("未知市", set()).add("未知区")
        # 如果有解析结果，转换 set 为 list 后返回
        if visited:
            for p in visited:
                for c in visited[p]:
                    visited[p][c] = list(visited[p][c])
            return visited

    # 2. 兜底：从用户统计中的省份统计生成
    stats = self._load_user_stats(username)
    provinces = stats.get("省份统计",{}).keys()
    for province in provinces:
        visited[province] = {"未知市": ["未知区"]}
    return visited

# ==================== 删除单张照片 ====================
@api.route('/delete_photo', methods=['POST'])
def delete_photo():
    data = request.get_json()
    username = data.get('username')
    album_name = data.get('album_name')
    filename = data.get('filename')
    if not all([username, album_name, filename]):
        return jsonify({"error": "缺少参数"}), 400

    # 1. 查找照片元数据
    user_meta_file = _metadata_file(username)
    if not user_meta_file or not os.path.exists(user_meta_file):
        return jsonify({"error": "元数据文件不存在"}), 500
    with open(user_meta_file, 'r', encoding='utf-8') as f:
        all_photos = json.load(f)
    target = None
    for p in all_photos:
        if p.get('filename') == filename and p.get('album_name') == album_name:
            target = p
            break
    if not target and any(os.path.basename(path) == filename for path in _iter_album_images(username, album_name)):
        for p in all_photos:
            if p.get('filename') == filename:
                target = p
                break
    if not target:
        return jsonify({"error": "照片元数据不存在"}), 404

    # 2. 删除物理文件
    _delete_photo_files(username, album_name, filename)

    # 3. 从元数据中移除
    all_photos = [
        p for p in all_photos
        if not (p is target or (p.get('filename') == filename and p.get('album_name') == album_name))
    ]
    with open(user_meta_file, 'w', encoding='utf-8') as f:
        json.dump(all_photos, f, ensure_ascii=False, indent=2)

    # 4. 更新三层统计（减去计数）
    # 相册统计
    album_stats = stats_mgr._load_album_stats(username, album_name)
    _update_stats_decrement(album_stats, target)
    stats_mgr._save_album_stats(album_stats)

    # 用户统计
    user_stats = stats_mgr._load_user_stats(username)
    _update_stats_decrement(user_stats, target)
    stats_mgr._save_user_stats(user_stats)

    # 平台统计
    platform_stats = stats_mgr._load_platform_stats()
    _update_stats_decrement(platform_stats, target)
    stats_mgr._save_platform_stats(platform_stats)

    return jsonify({"message": "照片删除成功"})


# ==================== 删除整个相册 ====================
@api.route('/delete_album', methods=['POST'])
def delete_album():
    data = request.get_json()
    username = data.get('username')
    album_name = data.get('album_name')
    if not username or not album_name:
        return jsonify({"error": "缺少参数"}), 400

    album_dirs = _album_delete_dirs(username, album_name)
    if not album_dirs:
        return jsonify({"error": "相册不存在"}), 404
    album_filenames = {os.path.basename(path) for path in _iter_album_images(username, album_name)}

    # 1. 获取该相册的所有照片元数据
    user_meta_file = _metadata_file(username)
    if not user_meta_file or not os.path.exists(user_meta_file):
        # 没有元数据文件，只能直接删除文件夹，但统计会乱，建议先上传过照片
        for album_dir in album_dirs:
            shutil.rmtree(album_dir)
        return jsonify({"error": "元数据文件缺失，相册已删除但统计未更新"}), 500

    with open(user_meta_file, 'r', encoding='utf-8') as f:
        all_photos = json.load(f)

    album_photos = [
        p for p in all_photos
        if p.get('album_name') == album_name or p.get('filename') in album_filenames
    ]
    if not album_photos:
        # 没有照片，直接删除文件夹和统计
        for album_dir in album_dirs:
            shutil.rmtree(album_dir)
        stats_mgr.reset_album_stats(username, album_name)
        return jsonify({"message": "相册已删除（无照片）"})

    # 2. 从用户统计和平台统计中减去该相册所有照片的计数
    user_stats = stats_mgr._load_user_stats(username)
    platform_stats = stats_mgr._load_platform_stats()
    for p in album_photos:
        _update_stats_decrement(user_stats, p)
        _update_stats_decrement(platform_stats, p)
    stats_mgr._save_user_stats(user_stats)
    stats_mgr._save_platform_stats(platform_stats)

    # 3. 删除相册文件夹
    for album_dir in album_dirs:
        shutil.rmtree(album_dir)

    # 4. 删除相册统计文件
    stats_mgr.reset_album_stats(username, album_name)

    # 5. 从用户元数据中移除这些照片记录
    remaining_photos = [
        p for p in all_photos
        if not (p.get('album_name') == album_name or p.get('filename') in album_filenames)
    ]
    with open(user_meta_file, 'w', encoding='utf-8') as f:
        json.dump(remaining_photos, f, ensure_ascii=False, indent=2)

    return jsonify({"message": "相册删除成功", "user_stats": user_stats, "platform_stats": platform_stats})


# ==================== 注销用户 ====================
@api.route('/delete_user', methods=['POST'])
def delete_user():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({"error": "缺少用户名"}), 400

    user_dir = os.path.join(USERS_BASE, username)
    if not os.path.exists(user_dir):
        return jsonify({"error": "用户不存在"}), 404

    # 1. 获取该用户所有照片元数据
    user_meta_file = os.path.join(USERS_BASE, username, "photos_metadata.json")
    if os.path.exists(user_meta_file):
        with open(user_meta_file, 'r', encoding='utf-8') as f:
            all_photos = json.load(f)
        # 从平台统计中减去该用户所有照片的贡献
        platform_stats = stats_mgr._load_platform_stats()
        for p in all_photos:
            _update_stats_decrement(platform_stats, p)
        stats_mgr._save_platform_stats(platform_stats)

    # 2. 删除用户文件夹
    shutil.rmtree(user_dir)

    # 3. 删除用户统计文件
    stats_mgr.reset_user_stats(username)

    return jsonify({"message": "用户注销成功"})


# ==================== 获取统计接口 ====================
@api.route('/stats/album', methods=['GET'])
def get_album_stats():
    username = request.args.get('username')
    album_name = request.args.get('album_name')
    if not username or not album_name:
        return jsonify({"error": "缺少参数"}), 400
    return jsonify(stats_mgr.get_album_stats(username, album_name))


@api.route('/stats/user', methods=['GET'])
def get_user_stats():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "缺少用户名"}), 400
    return jsonify(stats_mgr.get_user_stats(username))


@api.route('/stats/platform', methods=['GET'])
def get_platform_stats():
    return jsonify(stats_mgr.get_platform_stats())
