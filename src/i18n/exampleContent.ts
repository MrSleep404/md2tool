import type { Lang } from './lang'

/**
 * 各工具页的示例内容（演示文档本身需要跟随界面语言）
 * 键名与页面一一对应
 */
export type ExampleKey = 'home' | 'mdToHtml' | 'htmlToMd' | 'mdToPdf' | 'mdToExcel'

const examples: Record<Lang, Record<ExampleKey, string>> = {
  zh: {
    home: `# 欢迎使用 Markdown 转 Word 工具

这是一个简单易用的 Markdown 转 Word 文档工具，支持 **Mermaid 流程图** 和 **LaTeX 数学公式**。

## 功能特点

- ✅ 支持 Markdown 基本语法
- ✅ 支持 Mermaid 流程图
- ✅ 支持 LaTeX 数学公式
- ✅ 实时预览
- ✅ 一键下载 Word 文档
- ✅ 支持文件上传

## 使用方法

1. 在左侧编辑器中输入 Markdown 内容
2. 右侧会实时预览渲染效果
3. 点击"下载 Word"按钮即可下载文档

### Mermaid 流程图示例

\`\`\`mermaid
flowchart LR
    A[Ask ChatGPT/Claude] --> B{Got Markdown?}
    B -->|Yes| C[Paste to md2word]
    C --> D[Export Word/PDF]
    style A fill:#f9f,stroke:#333
    style D fill:#9f9,stroke:#333
\`\`\`

### LaTeX 数学公式示例

行内公式：质能方程 $E = mc^2$ 是物理学中最著名的公式之一。

块级公式：

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

### 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!')
}
\`\`\`

### 图片示例

![测试图片](https://img.shetu66.com/2023/05/15/1684145537979686.png)

> 提示：您也可以拖拽 Markdown 文件到上传区域

| 功能 | 支持 |
|------|------|
| 标题 | ✅ |
| 列表 | ✅ |
| 代码 | ✅ |
| 流程图 | ✅ |
| 公式 | ✅ |

---

感谢使用！
`,
    mdToHtml: `# Markdown 转 HTML

这是一个 **Markdown** 转 **HTML** 的工具。

## 功能特点

- 实时转换
- 支持标准 Markdown 语法
- 可复制 HTML 代码
- 可下载完整 HTML 文档

\`\`\`html
<p>这是一段示例代码</p>
\`\`\`

> 支持引用块、表格等复杂格式

| 特性 | 支持 |
|------|------|
| 标题 | ✅ |
| 列表 | ✅ |
| 表格 | ✅ |

[了解更多](https://example.com)
`,
    htmlToMd: `<!DOCTYPE html>
<html>
<head>
  <title>示例文档</title>
</head>
<body>
  <h1>HTML 转 Markdown 工具</h1>
  <p>这是一个用于将 <strong>HTML</strong> 转换为 <em>Markdown</em> 的工具。</p>

  <h2>功能特点</h2>
  <ul>
    <li>支持标准 HTML 标签</li>
    <li>自动清理样式和脚本</li>
    <li>实时转换预览</li>
  </ul>

  <h3>代码示例</h3>
  <pre><code>const greeting = "Hello, World!";</code></pre>

  <blockquote>
    <p>这是一个引用块的示例</p>
  </blockquote>

  <table>
    <thead>
      <tr>
        <th>功能</th>
        <th>支持</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>标题</td>
        <td>✅</td>
      </tr>
      <tr>
        <td>列表</td>
        <td>✅</td>
      </tr>
    </tbody>
  </table>

  <p><a href="https://example.com">了解更多信息</a></p>
</body>
</html>`,
    mdToPdf: `# Markdown 转 PDF 工具

这是一个将 Markdown 文档转换为 PDF 格式的在线工具。

## 主要功能

- 📄 支持标准 Markdown 语法
- 📄 实时预览渲染效果
- 📄 高质量 PDF 输出
- 📄 自定义页边距和字号

## 使用方法

1. 在左侧编辑器中输入或粘贴 Markdown 内容
2. 右侧实时显示渲染后的效果
3. 点击"下载 PDF"按钮生成 PDF 文件

### 示例代码

\`\`\`python
def hello():
    print("Hello, PDF!")

hello()
\`\`\`

### 表格示例

| 功能 | 描述 |
|------|------|
| 标题 | 支持 H1-H6 |
| 列表 | 有序和无序 |
| 表格 | 完整支持 |
| 代码 | 高亮显示 |

> 💡 提示：PDF 文件将包含完整的格式和样式

---

感谢使用本工具！
`,
    mdToExcel: `# Markdown 表格转 Excel 示例

这是一个将 Markdown 表格转换为 Excel 文件的工具。

## 示例表格

| 姓名 | 年龄 | 城市 | 职业 |
|------|------|------|------|
| 张三 | 28   | 北京 | 工程师 |
| 李四 | 32   | 上海 | 设计师 |
| 王五 | 25   | 广州 | 产品经理 |

## 另一个表格

| 产品 | 价格 | 库存 | 状态 |
|------|------|------|------|
| 手机 | 2999 | 100  | 在售 |
| 电脑 | 5999 | 50   | 在售 |
| 耳机 | 299  | 200  | 缺货 |

## 使用说明

1. 在左侧编辑器中输入包含表格的 Markdown 内容
2. 右侧会实时显示识别到的表格预览
3. 点击"下载 Excel"按钮下载转换后的文件
`,
  },
  en: {
    home: `# Welcome to Markdown to Word

This is an easy-to-use Markdown to Word converter with **Mermaid diagram** and **LaTeX math** support.

## Features

- ✅ Core Markdown syntax
- ✅ Mermaid diagrams
- ✅ LaTeX math formulas
- ✅ Live preview
- ✅ One-click Word download
- ✅ File upload support

## How to Use

1. Type or paste Markdown in the editor on the left
2. The rendered result appears on the right in real time
3. Click "Download Word" to save the document

### Mermaid Diagram Example

\`\`\`mermaid
flowchart LR
    A[Ask ChatGPT/Claude] --> B{Got Markdown?}
    B -->|Yes| C[Paste to md2word]
    C --> D[Export Word/PDF]
    style A fill:#f9f,stroke:#333
    style D fill:#9f9,stroke:#333
\`\`\`

### LaTeX Math Example

Inline formula: Einstein's famous equation $E = mc^2$ is one of the best-known formulas in physics.

Display formula:

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

### Code Example

\`\`\`javascript
function hello() {
  console.log('Hello, World!')
}
\`\`\`

### Image Example

![Sample image](https://img.shetu66.com/2023/05/15/1684145537979686.png)

> Tip: You can also drag a Markdown file into the upload area

| Feature | Support |
|---------|---------|
| Headings | ✅ |
| Lists | ✅ |
| Code | ✅ |
| Diagrams | ✅ |
| Formulas | ✅ |

---

Thanks for using MD2Tool!
`,
    mdToHtml: `# Markdown to HTML

This is a tool that converts **Markdown** into **HTML**.

## Features

- Real-time conversion
- Standard Markdown syntax
- Copyable HTML code
- Full HTML document download

\`\`\`html
<p>This is a sample paragraph</p>
\`\`\`

> Blockquotes, tables, and other complex formats are supported

| Feature | Support |
|---------|---------|
| Headings | ✅ |
| Lists | ✅ |
| Tables | ✅ |

[Learn more](https://example.com)
`,
    htmlToMd: `<!DOCTYPE html>
<html>
<head>
  <title>Sample Document</title>
</head>
<body>
  <h1>HTML to Markdown Tool</h1>
  <p>This is a tool for converting <strong>HTML</strong> into <em>Markdown</em>.</p>

  <h2>Features</h2>
  <ul>
    <li>Standard HTML tags supported</li>
    <li>Automatic cleanup of styles and scripts</li>
    <li>Real-time conversion preview</li>
  </ul>

  <h3>Code Example</h3>
  <pre><code>const greeting = "Hello, World!";</code></pre>

  <blockquote>
    <p>This is a sample blockquote</p>
  </blockquote>

  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>Support</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Headings</td>
        <td>✅</td>
      </tr>
      <tr>
        <td>Lists</td>
        <td>✅</td>
      </tr>
    </tbody>
  </table>

  <p><a href="https://example.com">Learn more</a></p>
</body>
</html>`,
    mdToPdf: `# Markdown to PDF

An online tool that converts Markdown documents into PDF files.

## Main Features

- 📄 Standard Markdown syntax
- 📄 Real-time rendered preview
- 📄 High-quality PDF output
- 📄 Custom margins and font sizes

## How to Use

1. Type or paste Markdown in the editor on the left
2. The rendered result appears on the right in real time
3. Click "Download PDF" to generate the PDF file

### Code Example

\`\`\`python
def hello():
    print("Hello, PDF!")

hello()
\`\`\`

### Table Example

| Feature | Description |
|---------|-------------|
| Headings | H1–H6 |
| Lists | Ordered and unordered |
| Tables | Fully supported |
| Code | Syntax highlighting |

> 💡 Tip: The PDF file will include the complete formatting and styles

---

Thanks for using this tool!
`,
    mdToExcel: `# Markdown Tables to Excel Example

This tool converts Markdown tables into Excel files.

## Sample Table

| Name  | Age | City      | Occupation       |
|-------|-----|-----------|------------------|
| John  | 28  | Beijing   | Engineer         |
| Mary  | 32  | Shanghai  | Designer         |
| David | 25  | Guangzhou | Product Manager  |

## Another Table

| Product   | Price | Stock | Status       |
|-----------|-------|-------|--------------|
| Phone     | 2999  | 100   | On sale      |
| Laptop    | 5999  | 50    | On sale      |
| Earphones | 299   | 200   | Out of stock |

## How to Use

1. Type Markdown containing tables in the editor on the left
2. Detected tables are previewed on the right in real time
3. Click "Download Excel" to save the converted file
`,
  },
}

export function getExample(lang: Lang, key: ExampleKey): string {
  return examples[lang]?.[key] ?? examples.zh[key]
}
