# 素裁（图片、图标工具）

一个优雅的图标转换工具，基于 Nuxt 构建。支持将 PNG 图片转换为 macOS `ICNS` 图标文件，或生成多尺寸 `PNG` 图标集合压缩包。

## 功能
- 拖拽/选择 PNG 文件，一键转换
- 转换为 `ICNS`（自动圆角、透明背景与安全边距）
- 生成 `PNG Set`（包含 `16/48/128` 尺寸与原始图）
- 本地处理与下载，数据不上传到第三方

## 快速开始
```bash
npm install
npm run dev
```
打开 `http://localhost:3000`，按页面提示上传 PNG 并选择转换类型。

## 接口
- `POST /api/convert`
  - 表单字段：`file`（PNG 文件）、`type`（`icns` 或 `png-set`）
  - 返回：`icns` 为二进制图标文件，`png-set` 为包含多尺寸 PNG 的 ZIP 包

## 构建与预览
```bash
npm run build
npm run preview
```

## 技术栈
- Nuxt 4、Vue 3、Tailwind CSS
- `sharp` 图像处理、`png2icons` ICNS 生成
- `h3-formidable`（上传解析）、`jszip`（打包 ZIP）

## 说明
- 部分图像会进行自动圆角与扩展边距处理，以适配 macOS 图标规范
- 生成的文件通过浏览器直接下载，安全、快速
