# 前端指南

前端位于 `frontend/`，技术栈为 React、Vite、Tailwind CSS、ECharts 和 lucide-react。

## 运行

```bash
npm install --prefix frontend
npm run dev
```

也可以进入 `frontend/` 后运行 `npm run dev`。

## 数据入口

- 默认读取：`frontend/public/data.json`
- 展示图片：`frontend/public/images/real/`
- 接口环境变量：`frontend/.env.local`

```bash
VITE_PHOTO_DATA_API_URL=http://127.0.0.1:8080/api/photos?username=张三&album_name=我的照片
```

## 关键代码

- `src/App.jsx`：页面主结构、筛选状态、数据加载
- `src/components/InsightBoard.jsx`：结论、证据和图表区
- `src/components/ImageGrid.jsx`：照片证据库
- `src/components/ProjectShowcase.jsx`：项目展示区
- `src/lib/data.js`：API / JSON / 临时样本加载与字段归一化
- `src/lib/insights.js`：统计结论计算
- `src/constants/filters.js`：枚举、颜色、示例图片

## 构建

```bash
npm run build
```

构建产物在 `frontend/dist/`。资源路径为相对路径，且数据会内嵌到 `index.html`，适合整包复制离线展示。
