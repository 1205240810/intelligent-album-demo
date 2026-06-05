# 国内网络展示部署建议

当前项目是纯前端静态站点，构建产物在 `frontend/dist/`，适合部署到国内可访问的静态托管服务。

## 推荐方案：腾讯云 EdgeOne Pages

适合：希望有公开 HTTPS 链接、国内访问更稳定、以后 GitHub 推送后自动部署。

### Git 自动部署

1. 打开 EdgeOne Pages 控制台
2. 选择从 Git 仓库导入项目
3. 连接 GitHub 仓库：

   ```text
   https://github.com/1205240810/intelligent-album-demo
   ```

4. 构建配置填写：

   ```text
   Build command: npm install --prefix frontend && npm --prefix frontend run build
   Output directory: frontend/dist
   ```

5. 部署完成后会得到一个 `*.edgeone.app` 访问链接。

### 直接上传

如果不想连接 GitHub，也可以先在本地构建：

```bash
npm run build
```

然后把 `frontend/dist/` 整个文件夹拖到 EdgeOne Pages Drop / Direct Upload 上传区。

## 备用方案：阿里云 OSS 静态网站

适合：已经有阿里云账号、Bucket、域名或希望后续绑定自定义域名。

基本步骤：

1. 执行 `npm run build`
2. 创建 OSS Bucket
3. 开启静态网站托管
4. 上传 `frontend/dist/` 内所有文件到 Bucket 根目录
5. 默认首页设置为 `index.html`
6. 如需自定义域名，按阿里云要求完成域名绑定；中国内地区域通常需要备案

## 不推荐作为国内主链路

- Vercel：部署方便，但国内网络访问不稳定
- GitHub Pages：仓库联动方便，但国内网络访问不稳定
- Gitee Pages：当前服务能力不适合作为新项目主部署方案
