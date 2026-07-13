import os
import json
import tempfile
from datetime import datetime
root_path = os.path.dirname(os.path.abspath(__file__))


def _read_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return default
    return payload if isinstance(payload, dict) else default


def _atomic_write_json(path, payload):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    descriptor, temp_path = tempfile.mkstemp(prefix=".stats-", suffix=".json", dir=os.path.dirname(path))
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_path, path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def _safe_total(stats):
    return max(1, int(stats.get("总照片数", 0) or 0))


class StatsManager:
    def __init__(self, data_dir="./data", users_base=None):
        self.data_dir = data_dir
        self.users_base = users_base or os.path.join(root_path, "users")
        self.users_dir = os.path.join(data_dir, "users")
        self.albums_dir = os.path.join(data_dir, "albums")
        self.platform_file = os.path.join(data_dir, "platform_stats.json")

        os.makedirs(self.users_dir, exist_ok=True)
        os.makedirs(self.albums_dir, exist_ok=True)

    # ========== 平台级统计 ==========
    def _load_platform_stats(self):
        default = {
            "总照片数": 0,
            "总用户数": 0,
            "省份统计": {},
            "景点类型统计": {},
            "品牌统计": {},
            "季节统计": {},
            "时段统计": {},
            "最后更新": None
        }
        return _read_json(self.platform_file, default)

    def _save_platform_stats(self, stats):
        stats["最后更新"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        _atomic_write_json(self.platform_file, stats)

    def register_user(self, username):
        stats = self._load_platform_stats()
        stats["总用户数"] = stats.get("总用户数", 0) + 1
        self._save_platform_stats(stats)
        self.init_user_stats(username)

    def unregister_user(self, username):
        stats = self._load_platform_stats()
        stats["总用户数"] = max(0, stats.get("总用户数", 0) - 1)
        self._save_platform_stats(stats)
        self.delete_user_stats(username)

    def update_platform_stats(self, photo_info):
        stats = self._load_platform_stats()
        stats["总照片数"] += 1
        province = photo_info.get("省份")
        if province:
            stats["省份统计"][province] = stats["省份统计"].get(province, 0) + 1
        scene = photo_info.get("景点类型")
        if scene:
            stats["景点类型统计"][scene] = stats["景点类型统计"].get(scene, 0) + 1
        brand = photo_info.get("手机品牌")
        if brand:
            stats["品牌统计"][brand] = stats["品牌统计"].get(brand, 0) + 1
        season = photo_info.get("季节")
        if season:
            stats["季节统计"][season] = stats["季节统计"].get(season, 0) + 1
        period = photo_info.get("时段")
        if period:
            stats["时段统计"][period] = stats["时段统计"].get(period, 0) + 1
        self._save_platform_stats(stats)
        return stats

    def get_platform_stats(self):
        stats = self._load_platform_stats()
        total = _safe_total(stats)

        def get_top3(counter_dict):
            sorted_items = sorted(counter_dict.items(), key=lambda x: x[1], reverse=True)[:3]
            return [{"名称": k, "次数": v, "占比": f"{v / total * 100:.1f}%"} for k, v in sorted_items]

        return {
            "总照片数": stats["总照片数"],
            "总用户数": stats["总用户数"],
            "最爱去的省份Top3": get_top3(stats.get("省份统计", {})),
            "最爱拍的风景Top3": get_top3(stats.get("景点类型统计", {})),
            "常用手机品牌Top3": get_top3(stats.get("品牌统计", {})),
            "最爱季节Top3": get_top3(stats.get("季节统计", {})),
            "最爱时段Top3": get_top3(stats.get("时段统计", {})),
            "最后更新": stats.get("最后更新")
        }

    # ========== 用户级统计 ==========
    def _get_user_file(self, username):
        return os.path.join(self.users_dir, f"{username}_stats.json")

    def _load_user_stats(self, username):
        user_file = self._get_user_file(username)
        default = {
            "用户名": username,
            "总照片数": 0,
            "省份统计": {},
            "景点类型统计": {},
            "品牌统计": {},
            "季节统计": {},
            "时段统计": {},
            "最后更新": None
        }
        return _read_json(user_file, default)

    def _save_user_stats(self, stats):
        stats["最后更新"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user_file = self._get_user_file(stats["用户名"])
        _atomic_write_json(user_file, stats)

    def update_user_stats(self, username, photo_info):
        stats = self._load_user_stats(username)
        stats["总照片数"] += 1
        province = photo_info.get("省份")
        if province:
            stats["省份统计"][province] = stats["省份统计"].get(province, 0) + 1
        scene = photo_info.get("景点类型")
        if scene:
            stats["景点类型统计"][scene] = stats["景点类型统计"].get(scene, 0) + 1
        brand = photo_info.get("手机品牌")
        if brand:
            stats["品牌统计"][brand] = stats["品牌统计"].get(brand, 0) + 1
        season = photo_info.get("季节")
        if season:
            stats["季节统计"][season] = stats["季节统计"].get(season, 0) + 1
        period = photo_info.get("时段")
        if period:
            stats["时段统计"][period] = stats["时段统计"].get(period, 0) + 1
        self._save_user_stats(stats)
        return stats

    def init_user_stats(self, username):
        stats = self._load_user_stats(username)  # 如果不存在会创建默认
        self._save_user_stats(stats)

    def reset_user_stats(self, username):
        user_file = self._get_user_file(username)
        if os.path.exists(user_file):
            os.remove(user_file)
        self.init_user_stats(username)

    def delete_user_stats(self, username):
        user_file = self._get_user_file(username)
        if os.path.exists(user_file):
            os.remove(user_file)
        prefix = f"{username}_"
        for filename in os.listdir(self.albums_dir):
            if filename.startswith(prefix) and filename.endswith("_stats.json"):
                os.remove(os.path.join(self.albums_dir, filename))

    def _aggregate_visited(self, username):
        """从用户照片的拍摄地址中聚合省→市→区三级数据，完全依赖'拍摄地址'字段"""
        user_metadata_file = os.path.join(self.users_base, username, "photos_metadata.json")
        if not os.path.exists(user_metadata_file):
            return {}
        with open(user_metadata_file, 'r', encoding='utf-8') as f:
            photos = json.load(f)

        visited = {}
        for photo in photos:
            address = photo.get("拍摄地址", ":")
            if not address or "·" not in address:
                continue
            parts = [p.strip() for p in address.split("·") if p.strip()]
            if len(parts) < 1:
                continue

            province = parts[0]  # 省级单位
            # 处理直辖市和特别行政区：例如“上海市” 或 “香港特别行政区”
            # 城市：如果有第二部分则取，否则设为“未知市”
            city = parts[1] if len(parts) >= 2 else "未知市"
            # 区县：如果有第三部分则取，否则设为“未知区”
            district = parts[2] if len(parts) >= 3 else "未知区"

            visited.setdefault(province, {}).setdefault(city, set()).add(district)

        # 将 set 转换为 list
        for prov in visited:
            for city in visited[prov]:
                visited[prov][city] = list(visited[prov][city])
        return visited

    def get_user_stats(self, username):
        stats = self._load_user_stats(username)
        total = _safe_total(stats)

        def get_top3(counter_dict):
            sorted_items = sorted(counter_dict.items(), key=lambda x: x[1], reverse=True)[:3]
            return [{"名称": k, "次数": v, "占比": f"{v / total * 100:.1f}%"} for k, v in sorted_items]

        # 所有去过省份列表（去重）
        provinces_visited = list(stats.get("省份统计", {}).keys())
        # 三级详细数据
        visited = self._aggregate_visited(username)
        return {
            "用户名": username,
            "总照片数": stats["总照片数"],
            "去过省份列表": provinces_visited,
            "最爱拍的风景Top3": get_top3(stats.get("景点类型统计", {})),
            "常用手机品牌Top3": get_top3(stats.get("品牌统计", {})),
            "最爱季节": get_top3(stats.get("季节统计", {}))[0]["名称"] if stats.get("季节统计") else "未知",
            "最爱时段": get_top3(stats.get("时段统计", {}))[0]["名称"] if stats.get("时段统计") else "未知",
            "最后更新": stats.get("最后更新"),
            "visited": visited
        }

    # ========== 相册级统计 ==========
    def _get_album_file(self, username, album_name):
        return os.path.join(self.albums_dir, f"{username}_{album_name}_stats.json")

    def _load_album_stats(self, username, album_name):
        album_file = self._get_album_file(username, album_name)
        default = {
            "用户名": username,
            "相册名": album_name,
            "总照片数": 0,
            "省份统计": {},
            "景点类型统计": {},
            "品牌统计": {},
            "季节统计": {},
            "时段统计": {},
            "最后更新": None
        }
        return _read_json(album_file, default)

    def _save_album_stats(self, stats):
        stats["最后更新"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        album_file = self._get_album_file(stats["用户名"], stats["相册名"])
        _atomic_write_json(album_file, stats)

    def update_album_stats(self, username, album_name, photo_info):
        stats = self._load_album_stats(username, album_name)
        stats["总照片数"] += 1
        province = photo_info.get("省份")
        if province:
            stats["省份统计"][province] = stats["省份统计"].get(province, 0) + 1
        scene = photo_info.get("景点类型")
        if scene:
            stats["景点类型统计"][scene] = stats["景点类型统计"].get(scene, 0) + 1
        brand = photo_info.get("手机品牌")
        if brand:
            stats["品牌统计"][brand] = stats["品牌统计"].get(brand, 0) + 1
        season = photo_info.get("季节")
        if season:
            stats["季节统计"][season] = stats["季节统计"].get(season, 0) + 1
        period = photo_info.get("时段")
        if period:
            stats["时段统计"][period] = stats["时段统计"].get(period, 0) + 1
        self._save_album_stats(stats)
        return stats

    def init_album_stats(self, username, album_name):
        stats = self._load_album_stats(username, album_name)
        self._save_album_stats(stats)

    def reset_album_stats(self, username, album_name):
        album_file = self._get_album_file(username, album_name)
        if os.path.exists(album_file):
            os.remove(album_file)
        self.init_album_stats(username, album_name)

    def delete_album_stats(self, username, album_name):
        album_file = self._get_album_file(username, album_name)
        if os.path.exists(album_file):
            os.remove(album_file)

    def get_album_stats(self, username, album_name):
        stats = self._load_album_stats(username, album_name)
        total = _safe_total(stats)

        def get_top3(counter_dict):
            sorted_items = sorted(counter_dict.items(), key=lambda x: x[1], reverse=True)[:3]
            return [{"名称": k, "次数": v, "占比": f"{v / total * 100:.1f}%"} for k, v in sorted_items]

        return {
            "用户名": username,
            "相册名": album_name,
            "总照片数": stats["总照片数"],
            "最爱去的省份Top3": get_top3(stats.get("省份统计", {})),
            "最爱拍的风景Top3": get_top3(stats.get("景点类型统计", {})),
            "常用手机品牌Top3": get_top3(stats.get("品牌统计", {})),
            "最爱季节": get_top3(stats.get("季节统计", {}))[0]["名称"] if stats.get("季节统计") else "未知",
            "最爱时段": get_top3(stats.get("时段统计", {}))[0]["名称"] if stats.get("时段统计") else "未知",
            "最后更新": stats.get("最后更新")
        }

