import io
import os
import sys
import tempfile
import unittest
from pathlib import Path
from urllib.parse import unquote, urlsplit

from PIL import Image


BACKEND_ROOT = Path(__file__).resolve().parents[1] / "photo_album"
sys.path.insert(0, str(BACKEND_ROOT))

import routes  # noqa: E402
from app import create_app  # noqa: E402
from stats_manager import StatsManager  # noqa: E402


def make_png():
    buffer = io.BytesIO()
    Image.new("RGB", (2, 2), (20, 184, 166)).save(buffer, "PNG")
    return buffer.getvalue()


class PhotoAlbumApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        root = Path(self.temp_dir.name)
        routes.USERS_BASE = str(root / "users")
        os.makedirs(routes.USERS_BASE, exist_ok=True)
        routes.stats_mgr = StatsManager(str(root / "data"), routes.USERS_BASE)
        self.app = create_app({
            "TESTING": True,
            "MAX_CONTENT_LENGTH": 2 * 1024 * 1024,
            "CORS_ALLOW_ORIGIN": "*",
        })
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def register_and_create_album(self):
        register = self.client.post("/register", json={"username": "张三"})
        self.assertEqual(register.status_code, 200)
        create = self.client.post(
            "/create_album",
            json={"username": "张三", "album_name": "我的照片"},
        )
        self.assertEqual(create.status_code, 200)

    def upload(self, filename="sample.png", content=None):
        content = make_png() if content is None else content
        return self.client.post(
            "/upload",
            data={
                "username": "张三",
                "album_name": "我的照片",
                "photo": (io.BytesIO(content), filename),
            },
            content_type="multipart/form-data",
        )

    def test_invalid_json_and_path_traversal_are_rejected(self):
        invalid_json = self.client.post("/register", data="not-json", content_type="text/plain")
        self.assertEqual(invalid_json.status_code, 400)

        traversal = self.client.post("/register", json={"username": "../outside"})
        self.assertEqual(traversal.status_code, 400)
        self.assertFalse((Path(self.temp_dir.name) / "outside").exists())

        media = self.client.get("/media/../../README.md")
        self.assertEqual(media.status_code, 404)

    def test_empty_album_contract_and_cors(self):
        response = self.client.get("/api/photos?username=张三&album_name=空相册")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["photos"], [])
        self.assertEqual(response.json["meta"]["total"], 0)
        self.assertEqual(response.headers["Access-Control-Allow-Origin"], "*")

    def test_upload_rejects_extension_and_invalid_image(self):
        self.register_and_create_album()

        wrong_extension = self.upload("sample.txt", b"not an image")
        self.assertEqual(wrong_extension.status_code, 400)

        fake_image = self.upload("sample.jpg", b"not an image")
        self.assertEqual(fake_image.status_code, 400)

        photo_dir = Path(routes.USERS_BASE) / "张三" / "我的照片" / "photos"
        self.assertEqual(list(photo_dir.iterdir()), [])

    def test_full_photo_and_stats_lifecycle(self):
        self.register_and_create_album()

        first = self.upload()
        second = self.upload()
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.json["photo_info"]["filename"], "sample.png")
        self.assertEqual(second.json["photo_info"]["filename"], "sample-2.png")
        self.assertEqual(second.json["platform_stats"]["总照片数"], 2)
        self.assertEqual(second.json["platform_stats"]["总用户数"], 1)

        thumbnail_dir = Path(routes.USERS_BASE) / "张三" / "我的照片" / "thumbnails"
        self.assertTrue((thumbnail_dir / "sample.jpg").exists())
        self.assertTrue((thumbnail_dir / "sample-2.jpg").exists())

        photos = self.client.get("/api/photos?username=张三&album_name=我的照片")
        self.assertEqual(photos.status_code, 200)
        self.assertEqual(photos.json["meta"]["total"], 2)
        media_path = unquote(urlsplit(photos.json["photos"][0]["url"]).path)
        media_response = self.client.get(media_path)
        self.assertEqual(media_response.status_code, 200)
        media_response.close()

        deleted = self.client.post(
            "/delete_photo",
            json={"username": "张三", "album_name": "我的照片", "filename": "sample.png"},
        )
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(self.client.get("/stats/platform").json["总照片数"], 1)

        album_deleted = self.client.post(
            "/delete_album",
            json={"username": "张三", "album_name": "我的照片"},
        )
        self.assertEqual(album_deleted.status_code, 200)
        self.assertEqual(self.client.get("/stats/platform").json["总照片数"], 0)
        self.assertFalse(routes.stats_mgr._get_album_file("张三", "我的照片") and os.path.exists(
            routes.stats_mgr._get_album_file("张三", "我的照片")
        ))

        user_deleted = self.client.post("/delete_user", json={"username": "张三"})
        self.assertEqual(user_deleted.status_code, 200)
        platform = self.client.get("/stats/platform").json
        self.assertEqual(platform["总用户数"], 0)
        self.assertFalse(os.path.exists(routes.stats_mgr._get_user_file("张三")))

    def test_delete_user_rejects_missing_stats_for_existing_photos(self):
        self.register_and_create_album()
        self.assertEqual(self.upload().status_code, 200)

        os.remove(routes.stats_mgr._get_user_file("张三"))
        rejected = self.client.post("/delete_user", json={"username": "张三"})

        self.assertEqual(rejected.status_code, 409)
        self.assertTrue((Path(routes.USERS_BASE) / "张三").exists())
        self.assertEqual(self.client.get("/stats/platform").json["总照片数"], 1)

    def test_delete_user_subtracts_existing_photo_aggregate(self):
        self.register_and_create_album()
        self.assertEqual(self.upload().status_code, 200)

        deleted = self.client.post("/delete_user", json={"username": "张三"})
        platform = self.client.get("/stats/platform").json

        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(platform["总照片数"], 0)
        self.assertEqual(platform["总用户数"], 0)
        self.assertFalse((Path(routes.USERS_BASE) / "张三").exists())


if __name__ == "__main__":
    unittest.main()
