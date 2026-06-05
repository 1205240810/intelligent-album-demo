# 接口对接约定

前端已经预留运行时接口，组件层不需要再猜字段。只要后端返回统一结构，筛选、KPI、图表和照片弹窗都会自动同步。

## 环境变量

在 `frontend/.env.local` 中配置：

```bash
VITE_PHOTO_DATA_API_URL=http://127.0.0.1:8080/api/photos?username=张三&album_name=我的照片
```

启动前端后会优先请求该接口。接口不可用或返回结构错误时，前端会回退到 `frontend/public/data.json`；空数组是合法状态，不会触发回退。

## 请求方式

```http
GET /api/photos?username=张三&album_name=我的照片
Accept: application/json
```

## 推荐响应结构

```json
{
  "photos": [
    {
      "id": 1,
      "url": "http://127.0.0.1:8080/media/张三/photos/我的照片/mountain.jpg",
      "type": "山景",
      "time": "白天",
      "season": "春",
      "features": {
        "color_score": 0.86,
        "texture_complexity": 0.55
      }
    }
  ],
  "meta": {
    "total": 1,
    "updated_at": "2026-05-13T10:00:00+08:00"
  }
}
```

前端同时兼容以下三种返回形式：

- 直接返回数组：`[{ ...photo }]`
- 返回 `{ "photos": [...] }`
- 返回 `{ "data": [...] }` 或 `{ "data": { "photos": [...] } }`

## 字段约定

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` / `string` | 照片唯一编号；重复时前端会稳定补后缀 |
| `url` | `string` | 图片地址。后端建议返回 `/media/...` 的绝对 URL；本地 JSON 可使用 `/images/real/xxx.jpg` |
| `type` | `string` | 景点类型，建议使用约定枚举 |
| `time` | `string` | 拍摄时段，建议为 `白天` / `黑夜` |
| `season` | `string` | 季节标签，建议为 `春` / `夏` / `秋` / `冬` |
| `features.color_score` | `number` | 色彩分值，范围 `0` 到 `1` |
| `features.texture_complexity` | `number` | 纹理复杂度，范围 `0` 到 `1` |

## 页面归一化规则

- 缺失或非法的 `type`、`time`、`season` 会按内置枚举兜底
- 缺失或非法的 `features` 会回退到 `0.5`
- `color_score` 和 `texture_complexity` 会被限制在 `0` 到 `1`
- 缺失 `url` 时，会按景点类型使用本地示例图
- 以 `/images/` 开头的本地图片地址会转换为当前部署位置下的资源地址
- `{ "photos": [] }` 是合法响应，页面展示 0 张空态

## 后端当前实现

- 服务入口：`backend/photo_album/app.py`
- 合约接口：`backend/photo_album/routes.py` 中的 `GET /api/photos`
- 静态图片：`GET /media/<safe-path>`
- 本地相册：`backend/photo_album/users/`
- 运行统计：`backend/photo_album/data/`

后端会把旧字段映射为前端约定字段，例如 `山川 -> 山景`、`海滨 -> 海景`、`晚上 -> 黑夜`，并在缺少特征分数时估算 `color_score` 和 `texture_complexity`。
