# Markdown 文档转换工具

一个纯前端的文档格式转换工具，支持 Markdown、Word、HTML、PDF 之间的互转。

## 功能特性

✅ **6大核心转换功能**
- Markdown 转 Word (.docx)
- Word 转 Markdown
- Markdown 转 HTML
- HTML 转 Markdown
- Markdown 转 PDF
- Markdown 转 DOCX

✅ **隐私保护**
- 所有转换在浏览器本地完成
- 不上传任何文件到服务器
- 关闭页面后数据自动清除

✅ **现代化设计**
- 参考 markdowntoword.io 的设计风格
- 响应式布局，支持桌面和移动端
- 实时预览功能

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router DOM
- **核心库**:
  - docx: 生成 Word 文档
  - mammoth: 解析 Word 文档
  - marked: Markdown 转 HTML
  - turndown: HTML 转 Markdown
  - jspdf + html2canvas: 生成 PDF

## 安装和运行

### 方法一：使用管理员权限（推荐）

1. 以管理员身份打开 PowerShell
2. 导航到项目目录:
   ```bash
   cd "d:\我的项目\markdown转化"
   ```
3. 安装依赖:
   ```bash
   npm install
   ```
4. 启动开发服务器:
   ```bash
   npm run dev
   ```

### 方法二：清理 npm 缓存

```bash
# 清理 npm 缓存
npm cache clean --force

# 安装依赖
npm install
```

### 方法三：使用 yarn（如果已安装）

```bash
# 安装 yarn（如果未安装）
npm install -g yarn

# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

## 项目结构

```
markdown转化/
├── src/
│   ├── components/          # 组件目录
│   │   ├── common/          # 通用组件
│   │   │   ├── FileUploader.tsx
│   │   │   ├── Editor.tsx
│   │   │   └── Preview.tsx
│   │   └── layout/          # 布局组件
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Layout.tsx
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx         # Markdown 转 Word
│   │   ├── WordToMarkdown.tsx
│   │   ├── MarkdownToHtml.tsx
│   │   ├── HtmlToMarkdown.tsx
│   │   ├── MarkdownToPdf.tsx
│   │   └── MarkdownToDocx.tsx
│   ├── utils/               # 工具函数
│   │   └── converters/      # 转换工具
│   │       ├── mdToWord.ts
│   │       ├── wordToMd.ts
│   │       ├── mdToHtml.ts
│   │       ├── htmlToMd.ts
│   │       └── mdToPdf.ts
│   ├── store/               # 状态管理
│   │   └── useStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 使用说明

### Markdown 转 Word
1. 访问首页或点击 "Markdown 转 Word"
2. 拖拽或点击上传 .md 文件，或直接粘贴内容
3. 在左侧编辑器中修改内容
4. 右侧实时预览效果
5. 点击"下载 Word 文档"按钮

### Word 转 Markdown
1. 点击导航中的 "Word 转 Markdown"
2. 上传 .docx 文件
3. 查看转换后的 Markdown 内容
4. 可复制或下载为 .md 文件

其他功能使用方式类似。

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 注意事项

- 文件大小限制：Markdown 文件最大 10MB，PDF 转换最大 5MB
- 支持的浏览器：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 不支持 IE 浏览器
- 所有转换在本地完成，大文件可能需要较长时间

## 许可证

MIT

## 作者

TRAE AI 生成