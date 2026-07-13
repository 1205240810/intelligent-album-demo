# 前端使用指南

技术栈：React 18、Vite 6、Tailwind CSS、ECharts 6 和 lucide-react。界面采用白色基底、青绿色主色和琥珀色强调，面向数据展示而非营销页面。

## 启动

在项目根目录执行：

```bash
npm ci --prefix frontend
npm run dev
```

默认地址：<http://127.0.0.1:5173/>。

## 数据入口

默认数据位于 `public/data.json`，图片位于 `public/images/real/`。需要后端联调时，将 `.env.example` 复制为 `.env.local`：

```bash
VITE_PHOTO_DATA_API_URL=http://127.0.0.1:8080/api/photos?username=张三&album_name=我的照片
```

加载规则：

1. 请求配置的 API。
2. API 网络失败或结构非法时读取本地 JSON。
3. 本地 JSON 也不可用时才使用临时样本。
4. API 返回空数组属于成功，页面显示 0 张空态。

页面会归一化非法枚举、越界分数和重复 ID；当前数据来源会明确显示为 API、本地文件或临时样本。

## 关键模块

| 文件 | 职责 |
| --- | --- |
| `src/App.jsx` | 页面组合、筛选状态与数据加载 |
| `src/components/OverviewSection.jsx` | 首屏结论和核心指标 |
| `src/components/ProcessingTrail.jsx` | 数据处理链路 |
| `src/components/FilterBar.jsx` | 紧凑筛选器与命中摘要 |
| `src/components/InsightBoard.jsx` | 结论与图表入口 |
| `src/components/Dashboard.jsx` | ECharts 图表，异步加载 |
| `src/components/ImageGrid.jsx` | 真实图片证据库与详情弹窗 |
| `src/lib/data.js` | 数据获取、结构提取与归一化 |
| `src/lib/insights.js` | KPI、分布和文字结论计算 |

图片证据库首次渲染 24 张，每次增加 24 张；筛选、指标和图表始终基于全部 76 张数据计算。

## 测试与构建

```bash
npm run test:frontend
npm run build
npm run build:single
```

- `frontend/dist/`：普通生产构建，适合 Vercel 和静态服务器。
- `output/cos-single/index.html`：样式、脚本、数据和 76 张压缩图片全部内嵌，可直接双击。

普通 `dist/` 仍包含独立图片文件，分享时必须复制整个目录；课程提交优先使用自包含单文件版本。
