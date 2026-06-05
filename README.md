# 智能相册分析系统

一个面向真实照片库的智能相册分析演示：前端负责筛选、图表和证据展示，后端负责照片上传、元数据解析、地图反查、统计和统一 API 输出。项目已整理为前端、后端、数据三块，方便组员分工和部署。

## 在线地址

- GitHub 仓库: [1205240810/intelligent-album-demo](https://github.com/1205240810/intelligent-album-demo)
- Vercel 预览: [intelligent-album-demo.vercel.app](https://intelligent-album-demo.vercel.app)

## 目录结构

```text
.
├── frontend/                  # React + Vite 前端展示系统
│   ├── src/                   # 页面、组件、图表、数据归一化逻辑
│   ├── public/data.json       # 前端默认读取的照片分析数据
│   ├── public/images/real/    # 可提交的压缩脱敏展示图片
│   └── scripts/               # 数据生成与离线打包脚本
├── backend/photo_album/        # Flask 后端服务
│   ├── app.py                 # 服务入口、CORS、Blueprint 注册
│   ├── routes.py              # 上传、删除、统计、/api/photos、/media
│   ├── image_analyzer.py      # EXIF、GPS、季节、时段、景点类型分析
│   ├── data/                  # 后端运行统计文件，本地生成，默认不提交
│   └── users/                 # 后端运行态用户相册，本地生成，默认不提交
├── data/raw/                  # 原始照片库，本地保留，默认不提交
├── docs/                      # 接口、数据格式和 PRD 文档
├── package.json               # 根目录统一命令入口
└── vercel.json                # Vercel 从 frontend/ 构建
```

## 快速运行前端

首次安装依赖：

```bash
npm install --prefix frontend
```

启动开发服务：

```bash
npm run dev
```

默认地址是 `http://127.0.0.1:5173/`。页面用于展示分析结果和照片证据库；项目结构、数据流和常用命令统一放在 README 与 docs 文档中。

## 快速运行后端

进入后端虚拟环境后安装依赖：

```bash
python3 -m venv backend/photo_album/.venv
backend/photo_album/.venv/bin/pip install -r backend/photo_album/requirements.txt
```

启动 Flask：

```bash
npm run backend:dev
```

后端默认监听 `http://127.0.0.1:8080/`。百度地图 AK 不是必需项，未配置时服务仍可启动；需要 GPS 地址反查时再配置：

```bash
export BAIDU_AK=你的百度地图AK
```

## 前后端联调

在 `frontend/.env.local` 写入：

```bash
VITE_PHOTO_DATA_API_URL=http://127.0.0.1:8080/api/photos?username=张三&album_name=我的照片
```

前端数据加载顺序：

1. 优先读取 `VITE_PHOTO_DATA_API_URL`
2. 接口不可用时读取 `frontend/public/data.json`
3. 文件也不可用时才使用临时样本
4. 接口返回 `photos: []` 会展示真实空状态，不会伪装成回退成功

主要接口：

```http
GET /api/photos?username=张三&album_name=我的照片
GET /media/<safe-path>
```

## 数据更新

原始照片放在：

```text
data/raw/photo-album-test/
```

然后运行：

```bash
npm run generate:data
```

脚本会读取原始库和后端本地相册，去重后输出：

- `frontend/public/images/real/*.jpg`
- `frontend/public/data.json`

当前生成逻辑会尽量使用照片文件名和 EXIF 时间判断季节、白天/黑夜；图像特征使用 HSV 饱和度、亮度、暗部比例和边缘强度估算。后端接入真实上传流程时，会额外使用 `image_analyzer.py` 做 EXIF、GPS、百度地图地址反查和景点类型映射。

## 静态打包分享

```bash
npm run build
```

构建产物在 `frontend/dist/`。打包时已配置相对资源路径，并把 `data.json` 内嵌进 `index.html`，所以把整个 `frontend/dist/` 文件夹拷到别的电脑后可以直接打开查看。只有在需要实时读取 Flask 接口时，才需要在那台电脑额外启动后端。

## 部署到 GitHub / Vercel

- GitHub 只提交代码、文档、前端压缩展示图片和 `frontend/public/data.json`
- `data/raw/`、后端运行态 `users/`、`data/`、缓存和构建产物默认忽略
- Vercel 会按 `vercel.json` 在 `frontend/` 内安装依赖并构建

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动前端开发服务 |
| `npm run generate:data` | 从原始图片生成前端展示数据 |
| `npm run build` | 生产构建并生成可拷贝静态包 |
| `npm run preview` | 预览生产构建 |
| `npm run backend:dev` | 启动 Flask 后端 |
| `npm run backend:check` | 检查后端 Python 语法 |

## 更多文档

- [接口对接约定](docs/API_CONTRACT.md)
- [数据与图片接入说明](docs/DATA_AND_IMAGE_SPEC.md)
- [国内网络展示部署建议](docs/CHINA_DEPLOY.md)
- [前端指南](frontend/README.md)
- [后端指南](backend/README.md)
- [PRD](docs/PRD.md)
