# 旅游景点智能相册前端演示系统 PRD

## 1. 项目概述

本系统是一个交互式的旅游景点照片管理与分析原型，旨在通过颜色和纹理特征的统计展示“智能相册”的概念。系统核心功能包括基于元数据的多维图片筛选和实时更新的数据统计看板。

## 2. 技术栈要求

- **框架**: React (Vite 驱动)
- **UI 组件库**: Tailwind CSS (用于快速布局) + Lucide-React (图标)
- **图表库**: ECharts (负责高性能数据可视化)
- **部署**: GitHub 托管代码，Vercel 实现 CI/CD 自动部署

## 3. 核心功能模块

### 3.1 三级过滤控制栏 (Filter Header)

- **景点类型 (10类)**: 全部、山景、海景、河湖景观、森林绿植、古镇小镇、现代化大都市、乡村田园、雪山冰川、瀑布溪流、历史古迹。
- **时段 (3类)**: 全部、白天、黑夜。
- **季节 (5类)**: 全部、春、夏、秋、冬。
- **逻辑**: 三个维度为“且”逻辑，切换任一选项需立即触发照片列表和统计图表的更新。

### 3.2 照片展示网格 (Image Grid)

- **布局**: 响应式网格 (Grid)，每行 4-5 张图。
- **内容**: 延迟加载照片缩略图，点击照片可查看基本属性（类型/时段/季节）。
- **交互**: 筛选结果为空时显示“无匹配照片”的提示。

### 3.3 数据统计看板 (Data Dashboard)

- **景点分布饼图**: 展示当前筛选池中各类景点的占比。
- **昼夜对比柱状图**: 横向展示白天与黑夜的照片数量对比。
- **季节分布柱状图**: 展示春夏秋冬四个季节的数据分布。

## 4. 数据契约 (JSON Structure)

系统需读取根目录下 `public/data.json` 文件。

JSON

```
[
  {
    "id": 1,
    "url": "https://images.unsplash.com/photo-example", 
    "type": "森林绿植",
    "time": "白天",
    "season": "春",
    "features": { "color_score": 0.85, "texture_complexity": 0.45 }
  }
]
```

## 5. Mock 数据生成策略

为了确保系统在没有真实后台数据时也能演示，前端需内置一套 Mock 数据生成逻辑。



<iframe allow="xr-spatial-tracking; web-share" sandbox="allow-pointer-lock allow-popups allow-forms allow-popups-to-escape-sandbox allow-downloads allow-scripts allow-same-origin" src="https://08ryte2upuh6tpweeig9xgpp4eq5bp1nuhmzn0vohf4n80w633-h899562818.scf.usercontent.goog/gemini-code-immersive/shim.html?origin=https%3A%2F%2Fgemini.google.com&amp;cache=1" style="height: 649px;"></iframe>





此视觉内容是否有助于更好地理解回答？

是不要



## 6. 部署与交接流程

### 6.1 GitHub 仓库设置

1. 在 GitHub 创建新项目 `intelligent-album-demo`。
2. 将代码 Push 到仓库。
3. **重要**: 确保 `data.json` 放在 `public` 文件夹下，这样部署后可以通过固定 URL 修改数据。

### 6.2 Vercel 自动化部署

1. 登录 Vercel 官网，点击 `Add New` -> `Project`。
2. 关联 GitHub 上的 `intelligent-album-demo` 仓库。
3. 框架选 `Vite`，点击 `Deploy`。
4. **交接点**: 将生成的 `xxx.vercel.app` 链接发给队长。后续只需在 GitHub 上修改 `data.json` 并提交，线上链接会自动更新。

## 7. 给 Codex 的开发指令 (Prompt)

> "请基于 React 和 Tailwind CSS 编写一个名为 IntelligentAlbum 的单页面应用。
>
> 1. 定义三个 State 变量记录当前的筛选条件（景点类型、时段、季节）。
> 2. 从本地 data.json 读取数据，并实现过滤逻辑。
> 3. 顶部实现三排按钮样式的筛选器。
> 4. 中间部分使用 ECharts 渲染三个图表：饼图（景点分布）、柱状图（昼夜对比）、柱状图（季节分布）。
> 5. 底部使用网格布局展示过滤后的图片。
> 6. 代码要求模块化，图表部分需处理窗口缩放自适应。"