# NexusSpace

Li Rui 的个人主页与博客。网站：https://heathcliffak.com/

## 修改内容

- `index.html`：个人介绍、研究方向和项目。
- `blog.html`：博客文章列表。
- `prototype-plan.html`：Prototype Plan 独立原型展示页，包含项目说明、演示、下载和提交入口。
- `prototype-plan.css`、`prototype-plan.js`：展示页样式及使用虚构问答的 BC 交互示意；不访问模型或聊天。
- `assets/prototypes/`：RN 已公开的模板演示视频、封面及其 MIT 许可；来源见该目录的 NOTICE.txt。
- `cooking-and-human-evolution.html`、`ffxv-first-summit.html`：现有文章。
- `style.css`：配色、字体和手机排版。
- `image-*`：网页使用的图片。

在 GitHub 打开文件，点击编辑，修改后提交即可自动更新页面。新增文章时复制现有文章页面，修改标题、日期和正文，并在 blog.html 中添加链接，同时更新 sitemap.xml。

## 发布

GitHub Settings → Pages → Deploy from a branch → main → /(root)。无需服务器、数据库或付费服务。

旧 WordPress 文章路径通过 404.html 中的脚本跳转至对应文章；新站内部链接使用新的 HTML 地址。原域名 heathcliffak.com 已绑定 GitHub Pages；www 会转向主域名。

原文来自 2026-09-10 的 WordPress 备份。仅迁移公开且无密码的页面与文章，不包含 WordPress 后台、数据库、草稿、密码和访问日志。原生动态评论不运行。

## 维护原型展示

展示地址：https://heathcliffak.com/prototype-plan.html 。目前 RN 链接固定到 v0.3.0 模板与演示，BC 固定到 v0.1.0 Windows 插件。更新时核对实际发行资源与安装说明，并保留每个项目的版权和许可。RN 使用 MIT，BC 保留全部权利。提交入口使用 Prototype Plan 的 GitHub 原型表单，需要登录 GitHub，提交后由维护者审核。
