# 数据与图片接入说明

这份文档用于给队友说明后续如何替换数据和图片，而不需要修改前端页面逻辑。

## 1. 数据文件位置

- 项目运行时默认读取 `public/data.json`
- 如果这个文件缺失、为空或 JSON 格式不正确，系统会自动切换到内置 Mock 数据
- 因此正式演示前，请务必检查 `public/data.json` 是否已替换为真实数据

## 2. JSON 结构要求

推荐结构如下：

```json
[
  {
    "id": 1,
    "url": "/images/mountain.jpg",
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

## 3. 字段说明

| 字段 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | 照片唯一编号，建议不要重复 |
| `url` | `string` | 是 | 图片地址，可写本地路径或完整网络链接 |
| `type` | `string` | 是 | 景点类型 |
| `time` | `string` | 是 | 拍摄时段，建议 `白天` 或 `黑夜` |
| `season` | `string` | 是 | 季节标签，建议 `春`、`夏`、`秋`、`冬` |
| `features` | `object` | 是 | 图像特征对象 |
| `features.color_score` | `number` | 是 | 色彩分值，建议范围 `0` 到 `1` |
| `features.texture_complexity` | `number` | 是 | 纹理复杂度，建议范围 `0` 到 `1` |

## 4. 可用枚举值

### 景点类型 `type`

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

### 时段 `time`

- `白天`
- `黑夜`

### 季节 `season`

- `春`
- `夏`
- `秋`
- `冬`

## 5. 图片资源要求

### 推荐格式

- `jpg`
- `png`
- `webp`
- `svg`

### 推荐做法

- 所有本地图片统一放入 `public/images/`
- `data.json` 中通过 `"/images/文件名.jpg"` 形式引用
- 文件名尽量只用英文、数字、连字符，不要带空格
- 图片比例尽量统一为 `4:3` 或 `16:9`
- 宽度建议不低于 `1200px`

## 6. 本地路径示例

如果图片文件是：

```text
public/images/west-lake-01.jpg
```

那么 `data.json` 里应写成：

```json
{
  "url": "/images/west-lake-01.jpg"
}
```

## 7. 网络图片示例

如果使用图床，也可以直接写完整链接：

```json
{
  "url": "https://example.com/images/west-lake-01.jpg"
}
```

## 8. 更新流程

1. 准备图片资源并放到 `public/images/`
2. 按约定结构修改 `public/data.json`
3. 本地运行检查页面显示是否正常
4. 提交到 GitHub
5. 等待 Vercel 自动部署完成

## 9. 常见问题

### 图片不显示

优先检查以下几项：

- `url` 路径是否写错
- 图片文件是否真的在 `public/images/` 目录下
- 文件名大小写是否一致
- 图片是否被误删或未提交到 GitHub

### 图表数据不对

优先检查以下几项：

- `type`、`time`、`season` 是否用了约定值
- `features` 是否缺字段
- `color_score` 和 `texture_complexity` 是否写成了数字
