# Website Starter

这是一个给新手起步用的 `Next.js` 展示型网站模板，适合后面部署到 `Vercel`，再绑定你自己的 `www` 子域名。

## 本地启动

```bash
npm install
npm run dev
```

启动后打开：

```text
http://localhost:3000
```

## 你先改哪里

1. `app/page.tsx`
   这里改网站标题、介绍、按钮文案和内容区。
2. `app/globals.css`
   这里改颜色、排版、布局和整体视觉风格。
3. `app/layout.tsx`
   这里改网页标题和描述。

## 后面怎么上线

1. 把这个项目上传到 GitHub
2. 在 Vercel 里导入项目
3. 在 Vercel 项目设置里添加域名，例如 `www.231065.xyz`
4. 按 Vercel 给你的提示去 Cloudflare 填 `CNAME`

## 目录

- `app/page.tsx`: 首页
- `app/layout.tsx`: 站点布局和 metadata
- `app/globals.css`: 全局样式
- `package.json`: 依赖和脚本
