# 后端使用指南

后端位于 `backend/photo_album/`，使用 Flask、Pillow、requests 和 exifread，保存方式为本地 JSON。它适合课程演示和可信的单机环境，不包含生产级账号鉴权与并发数据库。

## 安装与启动

在项目根目录执行：

```bash
python3 -m venv backend/photo_album/.venv
backend/photo_album/.venv/bin/pip install -r backend/photo_album/requirements.txt
npm run backend:dev
```

默认地址：<http://127.0.0.1:8080/>。

复制本地配置模板：

```bash
cp backend/photo_album/.env.example backend/photo_album/.env.local
```

在 `.env.local` 中填写 `BAIDU_AK`。该文件已被 Git 忽略，不会进入 GitHub 或最终压缩包。生产环境也可以直接设置同名环境变量，环境变量优先于本地文件。

未配置 `BAIDU_AK` 时服务仍能启动，GPS 地址反查会跳过。单文件上传默认最大 20MB。

## 后端完成的处理

1. 验证用户名、相册名和文件路径，阻止目录穿越。
2. 同时校验图片扩展名和真实图片内容。
3. 同名上传自动生成 `name-2.jpg` 等唯一文件名。
4. 提取 EXIF 时间、设备和 GPS；有 AK 时反查地址。
5. 根据时间判断季节与昼夜，根据地址关键词映射景点类型。
6. 使用像素饱和度、亮度、暗部比例和边缘强度计算特征。
7. 生成 JPEG 缩略图、保存元数据，并原子写入三级统计。
8. 通过 `/api/photos` 输出前端统一数据结构，通过 `/media` 提供图片。

这些方法属于可解释规则，不应描述为训练后的图像识别模型。

## 主要接口

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/photos` | 查询相册照片统一数据 |
| `GET` | `/media/<safe-path>` | 访问相册图片 |
| `POST` | `/register` | 创建用户 |
| `POST` | `/create_album` | 创建相册 |
| `POST` | `/upload` | 上传并分析图片 |
| `POST` | `/delete_photo` | 删除照片并更新统计 |
| `POST` | `/delete_album` | 删除相册并更新统计 |
| `POST` | `/delete_user` | 删除用户并更新统计 |
| `GET` | `/stats/album` | 查询相册统计 |
| `GET` | `/stats/user` | 查询用户统计 |
| `GET` | `/stats/platform` | 查询平台统计 |

完整请求与响应见 `docs/API_CONTRACT.md`。

## 运行态目录

- `backend/photo_album/users/`：用户、相册、图片、缩略图和元数据。
- `backend/photo_album/data/`：相册、用户和平台统计 JSON。

两者只保留 `.gitkeep`，本地运行数据不会提交 GitHub，也不会进入最终压缩包。

## 验证

```bash
npm run backend:check
npm run test:backend
```

测试覆盖非法 JSON、路径穿越、伪图片、同名图片、媒体访问、空相册和完整删除统计链路。
