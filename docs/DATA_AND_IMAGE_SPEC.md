# 数据与图片接入说明

这份文档说明如何替换数据和图片，而不需要改页面组件。

## 数据位置

- 原始照片库：`data/raw/photo-album-test/`
- 生成后的展示图片：`frontend/public/images/real/`
- 生成后的 JSON：`frontend/public/data.json`
- 前端数据模板：`frontend/public/data.template.json`
- 后端运行态相册：`backend/photo_album/users/`

`data/raw/` 和后端运行态目录默认不提交 Git；`frontend/public/images/real/` 与 `frontend/public/data.json` 是可展示、可部署的数据。

## 生成流程

```bash
npm run generate:data
```

脚本位置：

```text
frontend/scripts/generate_real_dataset.py
```

脚本会读取 `data/raw/photo-album-test/` 和 `backend/photo_album/users/`，按文件哈希去重，压缩并去除 EXIF 后写入 `frontend/public/images/real/`，同时生成 `frontend/public/data.json`。

## JSON 结构

推荐结构如下：

```json
[
  {
    "id": 1,
    "url": "/images/real/photo-001.jpg",
    "type": "山景",
    "time": "白天",
    "season": "春",
    "features": {
      "color_score": 0.86,
      "texture_complexity": 0.55
    }
  }
]
```

## 字段说明

| 字段 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `number` / `string` | 是 | 照片唯一编号，建议不要重复 |
| `url` | `string` | 是 | 图片地址，可写本地路径或完整网络链接 |
| `type` | `string` | 是 | 景点类型 |
| `time` | `string` | 是 | 拍摄时段，建议 `白天` 或 `黑夜` |
| `season` | `string` | 是 | 季节标签，建议 `春`、`夏`、`秋`、`冬` |
| `features.color_score` | `number` | 是 | 色彩分值，建议范围 `0` 到 `1` |
| `features.texture_complexity` | `number` | 是 | 纹理复杂度，建议范围 `0` 到 `1` |

## 可用枚举

景点类型：

- `山景`
- `海景`
- `河湖景观`
- `森林绿植`
- `古镇小镇`
- `现代化大都市`
- `乡村田园`
- `雪山冰川`
- `瀑布溪流`
- `历史古迹`

时段：

- `白天`
- `黑夜`

季节：

- `春`
- `夏`
- `秋`
- `冬`

## 参数如何决定

- `time`：优先使用文件名中的 `IMG_YYYYMMDD_HHMMSS`，其次使用 EXIF 拍摄时间；`6:00` 到 `18:00` 之间为 `白天`，其他为 `黑夜`
- `season`：由拍摄月份映射，`3-5` 为春，`6-8` 为夏，`9-11` 为秋，`12-2` 为冬
- `type`：静态生成脚本根据 HSV 颜色占比、亮度、暗部比例和边缘强度做轻量推断；后端真实流程会结合 EXIF、GPS 地址反查、关键词映射和已有元数据
- `color_score`：设平均饱和度为 `S`、平均亮度为 `V`、暗像素比例为 `D`，计算 `clamp(0.68S + 0.24V + 0.08(1-D), 0, 1)`
- `texture_complexity`：设灰度边缘图平均强度为 `E`，计算 `clamp(3.1E, 0, 1)`

这些规则适合演示和兜底；如果后端后续接入更正式的图像识别模型，只要输出同样字段，前端不用改。

## 图片资源要求

- 推荐格式：`jpg`、`png`、`webp`
- 推荐比例：`4:3` 或 `16:9`
- 推荐尺寸：宽度不低于 `1200px`
- 推荐命名：英文、数字、连字符，避免空格
- 本地展示路径：`/images/real/文件名.jpg`

页面会根据 Vite `base` 将 `/images/...` 归一化为当前部署位置下的资源地址。普通生产包需要保留整个 `dist/` 目录；自包含单文件会把所有图片转换为压缩 Data URL，适合 `file://` 双击预览。

## 静态交付

```bash
npm run build
```

构建结果在 `frontend/dist/`。数据会内嵌到 `index.html`，图片仍在 `dist/images/real/`，因此需要复制整个目录。

生成真正自包含的单文件：

```bash
npm run build:single
```

输出为 `output/cos-single/index.html`。脚本把 76 张图片压缩到最长边 1000px 并内嵌，不修改公开源码图片。

提交前执行：

```bash
npm run data:check
```

该检查要求 JSON 与图片一一对应、ID 唯一、分数在 `0–1` 内，并确认公开图片不含 EXIF。

## 常见问题

### 图片不显示

- 检查 `url` 路径是否写成 `/images/real/...`
- 检查图片是否在 `frontend/public/images/real/`
- 检查文件名大小写是否一致
- 检查图片是否提交到 GitHub

### 图表数据不对

- 检查 `type`、`time`、`season` 是否使用约定值
- 检查 `features` 是否缺字段
- 检查 `color_score` 和 `texture_complexity` 是否为数字
- 重新运行 `npm run generate:data`
