# 后端指南

后端位于 `backend/photo_album/`，技术栈为 Flask、Pillow、requests、exifread。

## 安装

```bash
python3 -m venv backend/photo_album/.venv
backend/photo_album/.venv/bin/pip install -r backend/photo_album/requirements.txt
```

## 启动

```bash
npm run backend:dev
```

默认地址：`http://127.0.0.1:8080/`

## 可选环境变量

```bash
export BAIDU_AK=你的百度地图AK
export CORS_ALLOW_ORIGIN=http://127.0.0.1:5173
```

未配置 `BAIDU_AK` 时后端仍可启动，只是 GPS 地址反查会跳过。

## 关键接口

- `GET /api/photos?username=张三&album_name=我的照片`
- `GET /media/<safe-path>`
- `POST /register`
- `POST /create_album`
- `POST /upload`
- `POST /delete_photo`
- `POST /delete_album`
- `POST /delete_user`

## 关键代码

- `app.py`：创建 Flask app、注册 Blueprint、设置 CORS
- `routes.py`：业务接口、媒体路由、前端合约字段输出
- `image_analyzer.py`：EXIF、GPS、时段、季节、地址和景点类型分析
- `stats_manager.py`：相册、用户、平台三级统计
- `config.py`：环境变量配置

## 运行态目录

- `backend/photo_album/users/`：本地用户、相册、照片和元数据
- `backend/photo_album/data/`：本地统计 JSON

这两个目录默认不提交 Git，仅保留 `.gitkeep`，避免把本地照片库和运行缓存推到仓库。
