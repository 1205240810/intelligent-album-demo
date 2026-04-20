# Intelligent Album Demo

旅游景点智能相册前端演示系统，基于 React + Vite + Tailwind CSS + ECharts。

## 本地运行

```bash
npm install
npm run dev
```

## 构建产物

```bash
npm run build
```

## 数据说明

- 运行时优先读取 `public/data.json`
- 如果 `public/data.json` 缺失或格式异常，前端会自动切换到内置 Mock 数据
- 后续你们接入后台时，只需要替换 `public/data.json` 的内容即可继续演示
