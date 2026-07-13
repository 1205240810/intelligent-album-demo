# 演示与运行指南

## 1. 最快演示方式

打开提交包中的：

```text
01_直接演示/智能相册分析.html
```

该文件已内嵌脚本、样式、76 条数据和 76 张图片，不需要安装 Node.js、Python 或启动后端。

## 2. 建议演示顺序

1. 首屏：说明数据集包含 76 张真实脱敏照片，并指出当前主要类别、昼夜和季节结构。
2. 筛选：依次切换景点类型、时段和季节，观察命中数、结论和代表图片同步变化。
3. 处理链路：简述 EXIF/GPS、时间标签、地址关键词、颜色与边缘特征。
4. 图表：解释类型分布、昼夜对比、季节分布和色彩-纹理散点。
5. 图片证据：打开一张图片，核对类别、时段、季节和特征分值。
6. 收尾：说明分类属于可解释启发式方案，未来可替换为正式模型而无需修改前端契约。

建议总时长为 3–5 分钟。

## 3. 在线地址

- Vercel：<https://intelligent-album-demo.vercel.app>
- 腾讯云：<https://graduate-sim-d6gl5fih109ef4a1f.service.tcloudbase.com/album-demo>
- GitHub：<https://github.com/1205240810/intelligent-album-demo>

腾讯云测试域名首次访问可能显示提示页，点击“确定访问”后进入系统。

## 4. 源码运行

### 前端

```bash
npm ci --prefix frontend
npm run dev
```

访问 `http://127.0.0.1:5173/`。

### 后端

```bash
python3 -m venv backend/photo_album/.venv
backend/photo_album/.venv/bin/pip install -r backend/photo_album/requirements.txt
npm run backend:dev
```

后端默认地址为 `http://127.0.0.1:8080/`。

### 联调

复制 `frontend/.env.example` 为 `frontend/.env.local`，确认其中的用户名和相册名与后端数据一致，然后重新启动前端。

## 5. 提交前验证

```bash
npm run verify
npm run build:single
```

组员 PPT 放入 `submission/智能相册分析系统-答辩.pptx` 后执行：

```bash
npm run package:submission
```
