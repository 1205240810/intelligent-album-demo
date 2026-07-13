# API 接口说明

## 1. 服务约定

- 默认地址：`http://127.0.0.1:8080`
- 数据格式：JSON；上传接口除外，使用 `multipart/form-data`
- 字符编码：UTF-8
- CORS：由 `CORS_ALLOW_ORIGIN` 控制，默认 `*`
- 上传上限：由 `MAX_UPLOAD_MB` 控制，默认 20MB

前端在 `frontend/.env.local` 配置：

```bash
VITE_PHOTO_DATA_API_URL=http://127.0.0.1:8080/api/photos?username=张三&album_name=我的照片
```

## 2. 前端数据接口

### `GET /api/photos`

查询参数：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `username` | 否 | 默认 `张三` |
| `album_name` | 否 | 默认 `我的照片` |

响应示例：

```json
{
  "photos": [
    {
      "id": 1,
      "url": "http://127.0.0.1:8080/media/张三/我的照片/photos/mountain.jpg",
      "type": "山景",
      "time": "白天",
      "season": "春",
      "features": {
        "color_score": 0.72,
        "texture_complexity": 0.48
      }
    }
  ],
  "meta": {
    "total": 1,
    "updated_at": "2026-07-13T10:00:00+08:00",
    "username": "张三",
    "album_name": "我的照片"
  }
}
```

空相册返回 `200` 和 `photos: []`。前端会显示真实空状态，不回退本地数据。

前端还兼容直接数组、`data` 数组和 `data.photos`，但后端正式接口应使用上面的 `photos + meta` 结构。

### `GET /media/<safe-path>`

返回相册中的合法图片。路径必须落在后端 `users/` 根目录内，目录穿越、目录本身和非图片文件均返回 `404`。

## 3. 用户与相册

### `POST /register`

```json
{ "username": "张三" }
```

创建用户并增加平台用户数。用户已存在或名称非法时返回 `400`。

### `POST /create_album`

```json
{ "username": "张三", "album_name": "我的照片" }
```

创建照片目录、缩略图目录和相册统计。用户不存在或相册已存在时返回 `400`。

### `POST /delete_user`

```json
{ "username": "张三" }
```

删除用户目录、用户统计，并从平台统计中扣除该用户所有照片。

### `POST /delete_album`

```json
{ "username": "张三", "album_name": "我的照片" }
```

删除相册、元数据记录和相册统计，并同步更新用户及平台统计。存在照片但元数据缺失时返回 `409`，避免在无法准确扣减时制造统计漂移。

## 4. 照片操作

### `POST /upload`

请求类型：`multipart/form-data`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `username` | text | 已存在用户 |
| `album_name` | text | 已存在相册 |
| `photo` | file | jpg、jpeg、png、gif、webp 或 bmp |

扩展名与实际图片内容都会验证。同名文件自动改为 `name-2.ext`，缩略图统一输出 JPEG。成功响应包含 `photo_info`、`album_stats`、`user_stats` 和 `platform_stats`。

### `POST /delete_photo`

```json
{
  "username": "张三",
  "album_name": "我的照片",
  "filename": "mountain.jpg"
}
```

删除原图、缩略图和元数据，并同步扣减三级统计。找不到可信元数据时返回 `404` 或 `409`。

## 5. 统计接口

| 方法与路径 | 查询参数 | 返回内容 |
| --- | --- | --- |
| `GET /stats/album` | `username`, `album_name` | 单相册统计 |
| `GET /stats/user` | `username` | 单用户统计 |
| `GET /stats/platform` | 无 | 平台总统计 |

统计维度包括总照片数、季节、时段、省份、手机品牌和景点类型。删除操作会从相册、用户、平台三级同步扣减；空统计文件会被删除。

## 6. 照片字段规则

| 字段 | 规则 |
| --- | --- |
| `id` | 唯一数字或字符串；前端对重复值补稳定后缀 |
| `url` | 后端返回绝对 `/media` URL，本地数据可用 `/images/real/...` |
| `type` | 约定景点类型枚举，旧字段会映射到前端枚举 |
| `time` | `白天` 或 `黑夜`；旧值 `晚上` 映射为 `黑夜` |
| `season` | `春`、`夏`、`秋`、`冬` |
| `color_score` | 数字，前端限制到 `0–1` |
| `texture_complexity` | 数字，前端限制到 `0–1` |

缺失或非法枚举使用确定性兜底，缺失特征默认 `0.5`。字段处理属于工程容错，不代表算法预测准确率。

## 7. 常见状态码

| 状态码 | 含义 |
| --- | --- |
| `200` | 成功，包括合法空相册 |
| `400` | 参数、JSON、路径名称或图片格式非法 |
| `404` | 用户、相册、照片或媒体不存在 |
| `409` | 元数据不足，拒绝执行可能导致统计漂移的删除 |
| `413` | 上传文件超过大小限制 |
