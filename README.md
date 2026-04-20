# Intelligent Album Demo

旅游景点智能相册前端演示系统，基于 React + Vite + Tailwind CSS + ECharts，面向课程大作业的前端展示与交互演示。

## 在线地址

- GitHub 仓库: [1205240810/intelligent-album-demo](https://github.com/1205240810/intelligent-album-demo)
- Vercel 演示: [intelligent-album-demo.vercel.app](https://intelligent-album-demo.vercel.app)

## 当前功能

- 三级过滤控制栏: 支持景点类型、时段、季节三维筛选，采用“且”逻辑实时联动。
- 实时统计看板: 包含景点分布饼图、昼夜对比柱状图、季节分布柱状图。
- 照片展示网格: 支持延迟加载、空状态提示、图片点击查看详情。
- 图片属性弹窗: 展示类型、时段、季节、色彩分值、纹理复杂度。
- 数据兜底机制: 优先读取 `public/data.json`，异常时自动切换到内置 Mock 数据。
- 图片错误兜底: 当图片路径失效时，页面会显示加载失败提示，便于排查数据问题。

## 项目结构

```text
.
├── public/
│   ├── data.json
│   └── images/
├── src/
│   ├── components/
│   ├── constants/
│   └── lib/
├── docs/
│   └── DATA_AND_IMAGE_SPEC.md
└── README.md
```

## 本地运行

```bash
npm install
npm run dev
```

本地开发地址默认是 `http://127.0.0.1:5173/`。

## 生产构建

```bash
npm run build
```

## 数据接入方式

- 运行时默认读取 `public/data.json`
- 如果 `public/data.json` 缺失、为空或格式不正确，前端会自动回退到内置 Mock 数据
- 本地图片建议统一放在 `public/images/`
- `data.json` 中的图片路径建议写成 `"/images/文件名.jpg"` 这种形式
- 你们后续只需要替换图片和 `public/data.json`，前端结构不需要改

## JSON 数据格式

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

字段说明：

- `id`: 数字，建议唯一。
- `url`: 字符串，可以是本地路径，也可以是完整的图片 URL。
- `type`: 字符串，建议使用这 10 类之一：`山景`、`海景`、`河湖景观`、`森林绿植`、`古镇小镇`、`现代化大都市`、`乡村田园`、`雪山冰川`、`瀑布溪流`、`历史古迹`。
- `time`: 字符串，建议使用 `白天` 或 `黑夜`。
- `season`: 字符串，建议使用 `春`、`夏`、`秋`、`冬`。
- `features.color_score`: 数字，建议在 `0` 到 `1` 之间。
- `features.texture_complexity`: 数字，建议在 `0` 到 `1` 之间。

## 图片格式建议

- 推荐格式: `jpg`、`png`、`webp`、`svg`
- 推荐比例: `4:3` 或 `16:9`
- 推荐尺寸: 宽度不低于 `1200px`
- 推荐命名: 全部使用英文或拼音文件名，避免空格
- 本地存放路径: `public/images/`

## 协作更新流程

1. 数据同学准备图片资源，并统一放入 `public/images/`
2. 数据同学按约定格式修改 `public/data.json`
3. 前端确认本地预览正常
4. 提交并推送到 GitHub
5. Vercel 自动重新部署，线上链接自动更新

## 补充文档

- 更详细的数据和图片接入说明见 [docs/DATA_AND_IMAGE_SPEC.md](docs/DATA_AND_IMAGE_SPEC.md)
- 可直接参考的数据模板见 [public/data.template.json](public/data.template.json)
