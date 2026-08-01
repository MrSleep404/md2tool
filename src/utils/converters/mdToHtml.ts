/**
 * Markdown 转 HTML 工具函数
 * 使用 marked 库将 Markdown 文本转换为 HTML，支持 GFM 语法
 * 支持 Mermaid 流程图和 LaTeX 数学公式
 */

import { marked } from 'marked';
import { renderMermaidToSvg, renderLatexToHtml } from '../helpers/renderHelpers';

/**
 * 配置 marked 选项，启用 GFM 支持
 */
marked.setOptions({
  gfm: true, // 启用 GitHub Flavored Markdown
  breaks: true, // 支持换行符转换为 <br>
});

/**
 * 预处理 Markdown 文本，将 Mermaid 和 LaTeX 转换为 HTML
 * @param markdown Markdown 文本内容
 * @returns Promise<string> 预处理后的 Markdown 文本
 */
async function preprocessMarkdown(markdown: string): Promise<string> {
  let result = markdown;

  // 处理 Mermaid 代码块：```mermaid ... ```
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const mermaidMatches = [...markdown.matchAll(mermaidRegex)];

  for (const match of mermaidMatches) {
    const mermaidCode = match[1].trim();
    try {
      console.log('开始渲染 Mermaid 图表:', mermaidCode.substring(0, 50));
      const svg = await renderMermaidToSvg(mermaidCode);
      // 将 SVG 包装在一个 div 中，方便样式控制
      const svgHtml = `<div class="mermaid-container">${svg}</div>`;
      result = result.replace(match[0], svgHtml);
      console.log('Mermaid 渲染成功');
    } catch (error) {
      console.error('Mermaid 渲染失败，保留原始代码块:', error);
      // 失败时保留原始代码块，并添加错误提示
      const errorHtml = `<div class="mermaid-error" style="padding: 16px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; margin: 1em 0;">
        <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ Mermaid 图表渲染失败</p>
        <pre style="margin-top: 8px; padding: 8px; background-color: #f8f9fa; border-radius: 4px; overflow-x: auto;"><code>${mermaidCode}</code></pre>
      </div>`;
      result = result.replace(match[0], errorHtml);
    }
  }

  // 处理 LaTeX 块级公式：$$...$$
  const blockLatexRegex = /\$\$([\s\S]+?)\$\$/g;
  const blockLatexMatches = [...result.matchAll(blockLatexRegex)];

  for (const match of blockLatexMatches) {
    const formula = match[1].trim();
    try {
      const html = renderLatexToHtml(formula, true); // displayMode = true
      const formulaHtml = `<div class="latex-block">${html}</div>`;
      result = result.replace(match[0], formulaHtml);
    } catch (error) {
      console.error('LaTeX 渲染失败:', error);
      // 失败时保留原始公式
      result = result.replace(match[0], `<pre>${formula}</pre>`);
    }
  }

  // 处理 LaTeX 行内公式：$...$（排除 $$...$$ 的情况）
  const inlineLatexRegex = /(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g;
  const inlineLatexMatches = [...result.matchAll(inlineLatexRegex)];

  for (const match of inlineLatexMatches) {
    const formula = match[1].trim();
    try {
      const html = renderLatexToHtml(formula, false); // displayMode = false
      const formulaHtml = `<span class="latex-inline">${html}</span>`;
      result = result.replace(match[0], formulaHtml);
    } catch (error) {
      console.error('LaTeX 渲染失败:', error);
      // 失败时保留原始公式
      result = result.replace(match[0], `<code>${formula}</code>`);
    }
  }

  return result;
}

/**
 * 将 Markdown 文本转换为 HTML 字符串
 * @param markdown Markdown 文本内容
 * @returns Promise<string> 转换后的 HTML 字符串
 * @throws Error 当转换过程中出现错误时抛出异常
 */
export async function convertMarkdownToHtml(markdown: string): Promise<string> {
  try {
    // 验证输入
    if (!markdown || typeof markdown !== 'string') {
      throw new Error('Markdown 内容不能为空');
    }

    // 预处理：将 Mermaid 和 LaTeX 转换为 HTML
    const preprocessedMarkdown = await preprocessMarkdown(markdown);

    // 使用 marked 解析 Markdown
    const html = await marked.parse(preprocessedMarkdown);

    return html;
  } catch (error) {
    console.error('Markdown 转 HTML 失败:', error);
    throw new Error(`Markdown 转 HTML 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 将 Markdown 文本转换为完整的 HTML 文档（包含样式）
 * @param markdown Markdown 文本内容
 * @param options 可选配置项
 * @param options.title HTML 文档标题
 * @param options.includeStyle 是否包含默认样式
 * @returns Promise<string> 完整的 HTML 文档字符串
 */
export async function convertMarkdownToHtmlDocument(
  markdown: string,
  options: {
    title?: string;
    includeStyle?: boolean;
  } = {}
): Promise<string> {
  try {
    const { title = 'Markdown 文档', includeStyle = true } = options;

    // 转换 Markdown 为 HTML 片段
    const htmlContent = await convertMarkdownToHtml(markdown);

    // 默认样式
    const style = includeStyle
      ? `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.25;
  }

  h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1em; }
  h5 { font-size: 0.875em; }
  h6 { font-size: 0.85em; color: #6a737d; }

  p { margin: 1em 0; }

  a { color: #0366d6; text-decoration: none; }
  a:hover { text-decoration: underline; }

  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }

  pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
  }

  pre code {
    padding: 0;
    margin: 0;
    font-size: 100%;
    background-color: transparent;
  }

  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 1em 0;
  }

  ul, ol {
    padding-left: 2em;
    margin: 1em 0;
  }

  li { margin: 0.25em 0; }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    margin: 1em 0;
    width: 100%;
  }

  table th, table td {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
  }

  table th {
    font-weight: 600;
    background-color: #f6f8fa;
  }

  table tr:nth-child(2n) {
    background-color: #f6f8fa;
  }

  img {
    max-width: 100%;
    box-sizing: content-box;
    background-color: #fff;
  }

  hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  /* Mermaid 流程图样式 */
  .mermaid-container {
    margin: 1.5em 0;
    text-align: center;
  }

  .mermaid-container svg {
    max-width: 100%;
    height: auto;
  }

  /* LaTeX 公式样式 */
  .latex-block {
    margin: 1.5em 0;
    text-align: center;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .latex-inline {
    display: inline-block;
    vertical-align: middle;
  }
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RaRD9gd5pKaoJ4uR+DRx8Lz1p5FwQWa74dcOzU5npO3jL5l4D3l6s7w8" crossorigin="anonymous">
`
      : '';

    // 构建完整的 HTML 文档
    const htmlDocument = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${style}
</head>
<body>
${htmlContent}
</body>
</html>`;

    return htmlDocument;
  } catch (error) {
    console.error('Markdown 转 HTML 文档失败:', error);
    throw new Error(`Markdown 转 HTML 文档失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 转义 HTML 特殊字符
 * @param text 需要转义的文本
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * 同步版本的 Markdown 转 HTML（用于简单场景）
 * 注意：marked.parse 默认返回 Promise，但可以使用 marked.parseSync 进行同步解析
 * @param markdown Markdown 文本内容
 * @returns HTML 字符串
 */
export function convertMarkdownToHtmlSync(markdown: string): string {
  try {
    if (!markdown || typeof markdown !== 'string') {
      throw new Error('Markdown 内容不能为空');
    }

    // 使用 marked 的同步解析方法
    const html = marked.parse(markdown) as string;

    return html;
  } catch (error) {
    console.error('Markdown 转 HTML 失败:', error);
    throw new Error(`Markdown 转 HTML 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 将 Markdown 转换为 HTML 并触发下载
 * @param markdown Markdown 文本内容
 * @param filename 输出文件名（可选）
 */
export async function downloadMarkdownAsHtml(
  markdown: string,
  filename: string = 'document.html'
): Promise<void> {
  try {
    const html = await convertMarkdownToHtmlDocument(markdown, { includeStyle: true });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载 HTML 文件失败:', error);
    throw error;
  }
}