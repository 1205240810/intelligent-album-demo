# 智能相册分析系统

把真实照片转换为可筛选、可解释的数据分析结果。当前公开展示集包含 76 张脱敏照片；前端提供筛选、结论、ECharts 图表和图片证据，后端提供上传校验、EXIF/GPS 解析、特征计算、三级统计和统一 API。

> 景点类型、昼夜、季节、色彩和纹理均来自 EXIF、文件时间、GPS 地址关键词及像素特征规则，属于可解释的启发式分析，不是已训练的深度学习模型。

## 直接查看

- GitHub：<https://github.com/1205240810/intelligent-album-demo>
- Vercel：<https://intelligent-album-demo.vercel.app>
- 腾讯云：<https://graduate-sim-d6gl5fih109ef4a1f.service.tcloudbase.com/album-demo>
- 离线演示：提交压缩包内双击 `01_直接演示/智能相册分析.html`，无需安装任何软件

腾讯云测试域名首次访问可能出现安全提示，确认访问即可。在线地址均为纯前端展示；上传与实时分析需要本地启动 Flask 后端。

## 项目结构

```text
.
├── frontend/                   # React + Vite 前端
│   ├── src/                    # 页面、组件、图表与数据逻辑
│   ├── public/data.json        # 76 条公开展示数据
│   └── public/images/real/     # 76 张脱敏展示图片
├── backend/photo_album/        # Flask 后端
│   ├── routes.py               # 业务 API 与媒体路由
│   ├── image_analyzer.py       # EXIF、GPS、时间与类别分析
│   └── stats_manager.py        # 相册、用户、平台三级统计
├── backend/tests/              # 后端接口回归测试
├── docs/                       # 说明书、测试、接口与演示文档
├── scripts/                    # 数据校验、单文件与提交包脚本
├── submission/                 # 仅放最终答辩 PPT，默认不提交 Git
└── package.json                # 统一命令入口
```

701MB 原始照片保留在本地 `data/raw/`，不会进入 GitHub 或课程压缩包。公开图片经过重新编码，已移除 EXIF/GPS。

## 运行前端

需要 Node.js 18 或更高版本：

```bash
npm ci --prefix frontend
npm run dev
```

访问 <http://127.0.0.1:5173/>。生产构建：

```bash
npm run build
```

## 运行后端

需要 Python 3.9 或更高版本：

```bash
python3 -m venv backend/photo_album/.venv
backend/photo_album/.venv/bin/pip install -r backend/photo_album/requirements.txt
npm run backend:dev
```

后端默认监听 <http://127.0.0.1:8080/>。`BAIDU_AK` 为可选配置，未配置时只跳过 GPS 地址反查。开发机可使用不提交 Git 的本地配置：

```bash
cp backend/photo_album/.env.example backend/photo_album/.env.local
```

也可以在部署环境直接设置 `BAIDU_AK`、`CORS_ALLOW_ORIGIN` 和 `MAX_UPLOAD_MB`。

复制 `frontend/.env.example` 为 `frontend/.env.local` 后可联调：

```bash
VITE_PHOTO_DATA_API_URL=http://127.0.0.1:8080/api/photos?username=张三&album_name=我的照片
```

数据加载顺序为 API → 本地 JSON → 临时样本。API 合法返回 `photos: []` 时页面保持真实空状态，不会用本地数据伪装成功。

## 验证与交付

```bash
npm run verify          # 语法、数据、前后端测试和生产构建
npm run build:single    # 生成 output/cos-single/index.html
```

组员 PPT 已按 `submission/智能相册分析系统-答辩.pptx` 纳入交付流程。生成最终包时执行：

```bash
npm run package:submission
```

脚本会重新验证项目、生成约 12MB 的自包含 HTML、复制源码和文档、校验 PPT、生成 SHA-256 清单，并输出 `release/智能相册分析系统-课程作业.zip`。PPT 缺失或损坏时命令会失败，不会生成残缺压缩包。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动前端开发服务 |
| `npm run backend:dev` | 启动 Flask 后端 |
| `npm run generate:data` | 从本地原始照片重新生成展示集 |
| `npm run data:check` | 校验 76 条数据、图片引用、分数与 EXIF |
| `npm test` | 运行前端逻辑与后端 API 测试 |
| `npm run build` | 生成生产前端 |
| `npm run build:single` | 生成可双击的单文件演示 |
| `npm run package:submission` | 生成课程最终压缩包 |

## 文档

- [完整交付文档](docs/FINAL_DELIVERY.md)
- [完整交付文档（Word）](docs/智能相册分析系统-完整交付文档.docx)
- [演示界面截图](docs/演示界面.png)
- [项目说明书](docs/PROJECT_REPORT.md)
- [测试报告](docs/TEST_REPORT.md)
- [演示与运行指南](docs/DEMO_GUIDE.md)
- [API 接口说明](docs/API_CONTRACT.md)
- [数据与图片规范](docs/DATA_AND_IMAGE_SPEC.md)
- [需求与验收范围](docs/PRD.md)
- [国内展示部署](docs/CHINA_DEPLOY.md)
