# 国内展示部署说明

## 当前入口

- 腾讯云 CloudBase：<https://graduate-sim-d6gl5fih109ef4a1f.service.tcloudbase.com/album-demo>
- Vercel 备用：<https://intelligent-album-demo.vercel.app>

CloudBase 测试域名首次访问可能显示安全提示，确认访问后进入页面。该地址展示静态分析结果，不包含上传后端。

## 为什么使用“静态资源 + 云函数页面”

当前腾讯云静态测试域名会把 HTML/CSS 作为附件下载，不适合直接打开首页。因此部署采用：

1. CloudBase 静态托管保存 JS、图表分包和 76 张图片。
2. 云函数 `albumDemoPage` 返回正确 `text/html` 响应。
3. 构建脚本把 CSS 内嵌到函数页面，把 JS 和图片改写到静态资源域名。
4. HTTP 服务路径 `/album-demo` 对外提供可直接打开的页面。

## 更新步骤

先登录腾讯云 CLI，并准备文件：

```bash
npm run deploy:cloudbase:prepare
```

默认环境参数：

```text
环境 ID: graduate-sim-d6gl5fih109ef4a1f
函数名: albumDemoPage
服务路径: /album-demo
静态域名: https://graduate-sim-d6gl5fih109ef4a1f-1424455477.tcloudbaseapp.com
```

部署静态资源：

```bash
npx -y -p @cloudbase/cli@3.5.6 cloudbase hosting deploy frontend/dist \
  -e graduate-sim-d6gl5fih109ef4a1f
```

部署函数与服务路径：

```bash
npx -y -p @cloudbase/cli@3.5.6 cloudbase fn deploy albumDemoPage \
  --dir output/cloudbase-function \
  --path /album-demo \
  --force \
  -e graduate-sim-d6gl5fih109ef4a1f
```

如静态域名或环境变化，可覆盖：

```bash
CLOUDBASE_STATIC_ORIGIN=https://新的静态域名 npm run deploy:cloudbase:prepare
```

## 验收

```bash
curl -I https://graduate-sim-d6gl5fih109ef4a1f.service.tcloudbase.com/album-demo
```

响应应为 `200` 且 `Content-Type` 包含 `text/html`。随后在浏览器检查首屏、图表异步分包和真实图片是否都能加载。

## 其他国内方案

- 已备案域名：可使用腾讯云 COS/EdgeOne 或阿里云 OSS 静态网站托管。
- 无备案域名：CloudBase 测试域名适合课程短期展示，但可能出现提示页和平台限额。
- 不建议把 Vercel 或 GitHub Pages 作为国内网络唯一入口。
