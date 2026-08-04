/**
 * Markdown 转 PDF 工具函数
 * 使用 jspdf + html2canvas 将 Markdown 先转为 HTML，再渲染为 PDF
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { convertMarkdownToHtml } from './mdToHtml';

/**
 * PDF 配置选项
 */
export interface PdfOptions {
  /** 页面大小，默认为 'a4' */
  pageSize?: 'a3' | 'a4' | 'letter' | 'legal';
  /** 页面方向，默认为 'portrait'（纵向） */
  orientation?: 'portrait' | 'landscape';
  /** 页边距（单位：mm），默认为 10 */
  margin?: number;
  /** 字体大小（单位：pt），默认为 12 */
  fontSize?: number;
  /** 是否显示页码，默认为 true */
  showPageNumber?: boolean;
  /** 文档标题，默认为 'Markdown Document' */
  title?: string;
}

/**
 * 默认 PDF 配置
 */
const DEFAULT_PDF_OPTIONS: Required<PdfOptions> = {
  pageSize: 'a4',
  orientation: 'portrait',
  margin: 10,
  fontSize: 12,
  showPageNumber: true,
  title: 'Markdown Document',
};

/**
 * 预加载容器中的所有图片，将外部 URL 转换为 base64 数据 URL
 * 解决 html2canvas 无法渲染跨域图片的问题
 */
async function preloadImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img');
  console.log(`[PDF] 预加载 ${images.length} 张图片`);

  await Promise.all(
    Array.from(images).map(async (img, index) => {
      const src = img.src || img.getAttribute('src') || '';
      if (!src || src.startsWith('data:')) return;

      try {
        // 方案1：直接 fetch
        let response: Response | null = null;
        try {
          response = await fetch(src, { mode: 'cors' });
        } catch {
          // CORS 失败，尝试代理
        }

        // 方案2：使用 wsrv.nl 代理
        if (!response || !response.ok) {
          console.log(`[PDF] 图片 ${index + 1} 使用代理下载`);
          response = await fetch(`https://wsrv.nl/?url=${encodeURIComponent(src)}`);
        }

        // 方案3：使用 corsproxy.io
        if (!response || !response.ok) {
          response = await fetch(`https://corsproxy.io/?${encodeURIComponent(src)}`);
        }

        if (response && response.ok) {
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          img.src = dataUrl;
          console.log(`[PDF] 图片 ${index + 1} 预加载成功`);
        }
      } catch (error) {
        console.warn(`[PDF] 图片 ${index + 1} 预加载失败:`, error);
      }
    })
  );
}

/**
 * 对容器中的代码块应用 highlight.js 语法高亮
 */
function applyCodeHighlighting(container: HTMLElement): void {
  // 检查 highlight.js 是否可用（通过 CDN 加载）
  const hljs = (window as unknown as { hljs?: { highlightElement: (el: HTMLElement) => void } }).hljs;
  if (!hljs) {
    console.warn('[PDF] highlight.js 未加载，代码块将无语法高亮');
    return;
  }

  const codeBlocks = container.querySelectorAll('pre code');
  console.log(`[PDF] 对 ${codeBlocks.length} 个代码块应用语法高亮`);

  codeBlocks.forEach((block) => {
    try {
      hljs.highlightElement(block as HTMLElement);
    } catch (error) {
      console.warn('[PDF] 代码块高亮失败:', error);
    }
  });

  // 不再需要占位行，代码块会被转换为图片
}

/**
 * 将容器中的所有 pre 代码块转换为图片
 * 解决 html2canvas 渲染文本时 descender（字符下半部分）被截断的问题
 */
async function convertCodeBlocksToImages(container: HTMLElement): Promise<void> {
  const preElements = container.querySelectorAll('pre');
  console.log(`[PDF] 将 ${preElements.length} 个代码块转换为图片`);

  for (const pre of Array.from(preElements)) {
    try {
      // 单独渲染 pre 元素为 canvas
      const codeCanvas = await html2canvas(pre as HTMLElement, {
        scale: 2,
        backgroundColor: '#f6f8fa',
        logging: false,
      });

      // 转换为 PNG data URL
      const dataUrl = codeCanvas.toDataURL('image/png');

      // 创建 img 元素替换 pre
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.cssText = 'max-width: 100%; height: auto; display: block; margin: 10pt 0; border-radius: 6pt;';

      // 替换 pre 元素
      pre.parentNode?.replaceChild(img, pre);
      console.log('[PDF] 代码块转换图片成功');
    } catch (error) {
      console.warn('[PDF] 代码块转图片失败，保留原始 pre:', error);
    }
  }
}

/**
 * 收集容器中所有不可分割元素（pre, table, img）的位置范围
 * @param container HTML 容器
 * @param scale canvas 缩放比例
 * @returns 元素位置数组（canvas 像素坐标）
 */
function collectElementPositions(container: HTMLElement, scale: number): Array<{start: number, end: number}> {
  const containerRect = container.getBoundingClientRect();
  const positions: Array<{start: number, end: number}> = [];

  // 收集 pre, table, img 元素的位置
  const elements = container.querySelectorAll('pre, table, img, .mermaid-container');
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const startY = (rect.top - containerRect.top) * scale;
    const endY = (rect.bottom - containerRect.top) * scale;
    positions.push({ start: startY, end: endY });
  });

  console.log(`[PDF] 收集到 ${positions.length} 个不可分割元素位置`);
  return positions;
}

/**
 * 检查切割位置是否落在不可分割元素内部，如果是则调整到元素之前
 * @param y 期望的切割 Y 坐标
 * @param positions 不可分割元素位置数组
 * @param currentY 当前页起始 Y 坐标
 * @returns 调整后的切割 Y 坐标
 */
function adjustCutPosition(
  y: number,
  positions: Array<{start: number, end: number}>,
  currentY: number
): number {
  for (const pos of positions) {
    // 如果切割位置在元素内部（不是开头也不是结尾）
    if (y > pos.start + 10 && y < pos.end - 10) {
      console.log(`[PDF] 切割位置 ${y}px 在元素内部 [${pos.start}, ${pos.end}]，调整到 ${pos.start}px`);
      // 调整到元素之前
      return Math.max(currentY + 10, pos.start);
    }
  }
  return y;
}

/**
 * 在 Canvas 中查找最近的空白行（用于智能分页）
 * @param canvas Canvas 元素
 * @param y 期望的切割 Y 坐标
 * @param searchRange 向上搜索的范围（像素）
 * @returns 最佳切割 Y 坐标
 */
function findBestCutPosition(canvas: HTMLCanvasElement, y: number, searchRange: number): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return y;

  const width = canvas.width;

  // 从期望位置向上搜索白色空白行
  for (let dy = 0; dy <= searchRange; dy++) {
    const checkY = y - dy;
    if (checkY < 0) break;

    const imageData = ctx.getImageData(0, checkY, width, 1);
    let isWhite = true;
    for (let x = 0; x < width; x += 10) {
      const i = x * 4;
      if (
        imageData.data[i] < 245 ||
        imageData.data[i + 1] < 245 ||
        imageData.data[i + 2] < 245
      ) {
        isWhite = false;
        break;
      }
    }
    if (isWhite) return checkY;
  }
  return y;
}

/**
 * 创建带样式的 HTML 容器元素
 * @param htmlContent HTML 内容
 * @param options PDF 配置选项
 * @returns HTML 容器元素
 */
function createStyledHtmlContainer(
  htmlContent: string,
  options: Required<PdfOptions>
): HTMLDivElement {
  // 创建容器
  const container = document.createElement('div');
  container.id = 'markdown-pdf-container';
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 210mm;
    padding: ${options.margin}mm;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: ${options.fontSize}pt;
    line-height: 1.6;
    color: #333;
    background: #fff;
  `;

  // 添加 Markdown 样式（包含代码高亮和 Mermaid 样式）
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    #markdown-pdf-container h1 {
      font-size: 24pt;
      margin-top: 20pt;
      margin-bottom: 10pt;
      border-bottom: 1px solid #eee;
      padding-bottom: 5pt;
    }

    #markdown-pdf-container h2 {
      font-size: 20pt;
      margin-top: 18pt;
      margin-bottom: 8pt;
      border-bottom: 1px solid #eee;
      padding-bottom: 4pt;
    }

    #markdown-pdf-container h3 {
      font-size: 16pt;
      margin-top: 16pt;
      margin-bottom: 6pt;
    }

    #markdown-pdf-container h4, #markdown-pdf-container h5, #markdown-pdf-container h6 {
      margin-top: 14pt;
      margin-bottom: 4pt;
    }

    #markdown-pdf-container p {
      margin: 10pt 0;
    }

    /* 行内代码样式 */
    #markdown-pdf-container code {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      background-color: #f6f8fa;
      color: #e83e8c;
      padding: 2pt 4pt;
      border-radius: 3pt;
      font-size: 11pt;
    }

    /* 代码块样式 */
    #markdown-pdf-container pre {
      background-color: #f6f8fa;
      padding: 12pt;
      border-radius: 6pt;
      overflow: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 10pt 0;
      line-height: 22px;
    }

    #markdown-pdf-container pre code {
      background-color: transparent;
      padding: 0;
      color: #24292e;
      font-size: 10.5pt;
      white-space: pre-wrap;
      word-wrap: break-word;
      display: block;
      line-height: 22px;
    }

    /* highlight.js GitHub Light 主题配色 */
    #markdown-pdf-container .hljs-comment,
    #markdown-pdf-container .hljs-quote {
      color: #6a737d;
      font-style: italic;
    }
    #markdown-pdf-container .hljs-keyword,
    #markdown-pdf-container .hljs-selector-tag,
    #markdown-pdf-container .hljs-literal,
    #markdown-pdf-container .hljs-type,
    #markdown-pdf-container .hljs-name {
      color: #d73a49;
      font-weight: bold;
    }
    #markdown-pdf-container .hljs-string,
    #markdown-pdf-container .hljs-attr,
    #markdown-pdf-container .hljs-template-tag,
    #markdown-pdf-container .hljs-addition {
      color: #032f62;
    }
    #markdown-pdf-container .hljs-number,
    #markdown-pdf-container .hljs-built_in,
    #markdown-pdf-container .hljs-builtin-name,
    #markdown-pdf-container .hljs-literal,
    #markdown-pdf-container .hljs-type,
    #markdown-pdf-container .hljs-params {
      color: #005cc5;
    }
    #markdown-pdf-container .hljs-function .hljs-title,
    #markdown-pdf-container .hljs-title,
    #markdown-pdf-container .hljs-section {
      color: #6f42c1;
      font-weight: bold;
    }
    #markdown-pdf-container .hljs-variable,
    #markdown-pdf-container .hljs-attribute,
    #markdown-pdf-container .hljs-tag,
    #markdown-pdf-container .hljs-regexp,
    #markdown-pdf-container .hljs-link {
      color: #e36209;
    }
    #markdown-pdf-container .hljs-meta {
      color: #6a737d;
    }
    #markdown-pdf-container .hljs-deletion {
      color: #b31d28;
    }

    #markdown-pdf-container blockquote {
      border-left: 3pt solid #ddd;
      padding-left: 10pt;
      margin: 10pt 0;
      color: #666;
    }

    #markdown-pdf-container ul, #markdown-pdf-container ol {
      padding-left: 20pt;
      margin: 10pt 0;
    }

    #markdown-pdf-container li {
      margin: 4pt 0;
    }

    #markdown-pdf-container table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0;
    }

    #markdown-pdf-container table th, #markdown-pdf-container table td {
      border: 1px solid #ddd;
      padding: 6pt 10pt;
    }

    #markdown-pdf-container table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }

    #markdown-pdf-container img {
      max-width: 100%;
      height: auto;
    }

    #markdown-pdf-container a {
      color: #0366d6;
      text-decoration: none;
    }

    #markdown-pdf-container hr {
      border: none;
      height: 1pt;
      background-color: #eee;
      margin: 20pt 0;
    }

    /* Mermaid 流程图样式 - 控制大小在可显示范围内 */
    #markdown-pdf-container .mermaid-container {
      margin: 1.5em 0;
      text-align: center;
      overflow: visible;
    }

    #markdown-pdf-container .mermaid-container svg {
      max-width: 100%;
      height: auto;
      font-size: 14px;
    }

    /* LaTeX 公式样式 */
    #markdown-pdf-container .latex-block {
      margin: 1.5em 0;
      text-align: center;
      overflow-x: auto;
    }

    #markdown-pdf-container .latex-inline {
      display: inline-block;
      vertical-align: middle;
    }

    /* Mermaid 渲染失败的错误提示样式 */
    #markdown-pdf-container .mermaid-error {
      padding: 16px;
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      margin: 1em 0;
    }
  `;

  container.appendChild(styleElement);

  // 添加 HTML 内容
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = htmlContent;
  container.appendChild(contentDiv);

  return container;
}

/**
 * 将 Markdown 文本转换为 PDF Blob
 * @param markdown Markdown 文本内容
 * @param options PDF 配置选项
 * @returns Promise<Blob> PDF 文档的 Blob 对象
 * @throws Error 当转换过程中出现错误时抛出异常
 */
export async function convertMarkdownToPdf(
  markdown: string,
  options: PdfOptions = {}
): Promise<Blob> {
  try {
    // 验证输入
    if (!markdown || typeof markdown !== 'string') {
      throw new Error('Markdown 内容不能为空');
    }

    // 合并配置选项
    const opts: Required<PdfOptions> = { ...DEFAULT_PDF_OPTIONS, ...options };

    // 步骤1：将 Markdown 转换为 HTML
    console.log('[PDF] 步骤1: 转换 Markdown 为 HTML');
    const htmlContent = await convertMarkdownToHtml(markdown);

    // 步骤2：创建带样式的 HTML 容器
    console.log('[PDF] 步骤2: 创建 HTML 容器');
    const container = createStyledHtmlContainer(htmlContent, opts);
    document.body.appendChild(container);

    try {
      // 步骤3：应用代码高亮
      console.log('[PDF] 步骤3: 应用代码语法高亮');
      applyCodeHighlighting(container);

      // 步骤3.5：将代码块转换为图片（避免 html2canvas 截断文字 descender）
      console.log('[PDF] 步骤3.5: 代码块转图片');
      await convertCodeBlocksToImages(container);

      // 步骤4：预加载图片（转换为 base64）
      console.log('[PDF] 步骤4: 预加载图片');
      await preloadImages(container);

      // 等待图片和样式渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 显式设置容器高度为 scrollHeight，确保所有内容都被渲染
      const fullHeight = container.scrollHeight;
      container.style.height = `${fullHeight + 50}px`;

      // 步骤5：使用 html2canvas 渲染 HTML 为 Canvas
      console.log('[PDF] 步骤5: 渲染 Canvas, 容器高度:', fullHeight);
      const canvas = await html2canvas(container, {
        scale: 2, // 提高清晰度
        useCORS: true, // 允许跨域图片
        logging: false, // 禁用日志
        backgroundColor: '#ffffff',
        height: fullHeight + 50,
        windowHeight: fullHeight + 50,
      });

      // 步骤6：创建 PDF 文档
      console.log('[PDF] 步骤6: 创建 PDF 文档');
      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.pageSize,
      });

      // 设置文档属性
      pdf.setProperties({
        title: opts.title,
        subject: 'Converted from Markdown',
        creator: 'Markdown Converter',
      });

      // 计算 PDF 页面尺寸
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = opts.margin;

      // 计算内容区域尺寸
      const contentWidth = pageWidth - 2 * margin;

      // 智能分页：计算每页可用的内容高度（转换为像素）
      const pageContentHeight = pageHeight - 2 * margin; // mm
      const pageContentHeightPx = (pageContentHeight * canvas.width) / contentWidth; // 像素

      // 搜索空白行的范围（约20pt 转换为像素）
      const searchRange = Math.round((20 * canvas.width) / contentWidth);

      // 收集不可分割元素的 DOM 位置（用于避免在代码块/表格/图片中间切割）
      const elementPositions = collectElementPositions(container, 2);

      console.log(`[PDF] 页面内容高度: ${pageContentHeightPx}px, 搜索范围: ${searchRange}px`);

      // 按页切割 Canvas
      let currentY = 0; // 当前切割位置（像素）
      let pageNumber = 0;

      while (currentY < canvas.height) {
        pageNumber++;
        let pageEndY = Math.min(currentY + pageContentHeightPx, canvas.height);

        // 如果不是最后一页，进行智能分页
        if (pageEndY < canvas.height) {
          // 步骤1：检查是否在不可分割元素内部，如果是则调整到元素之前
          pageEndY = adjustCutPosition(pageEndY, elementPositions, currentY);

          // 步骤2：在调整后的位置附近搜索空白行
          const bestCut = findBestCutPosition(canvas, pageEndY, searchRange);
          if (bestCut !== pageEndY && bestCut > currentY) {
            console.log(`[PDF] 页面 ${pageNumber}: 从 ${pageEndY}px 调整到 ${bestCut}px（空白行）`);
            pageEndY = bestCut;
          }
        }

        // 截取当前页的 Canvas 区域
        const pageHeightPx = pageEndY - currentY;
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeightPx;
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) {
          console.error('[PDF] 无法创建 Canvas 上下文');
          break;
        }

        // 填充白色背景
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // 绘制当前页的内容
        pageCtx.drawImage(canvas, 0, currentY, canvas.width, pageHeightPx, 0, 0, canvas.width, pageHeightPx);

        // 转换为图片数据
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pageImgHeight = (pageHeightPx * contentWidth) / canvas.width;

        // 添加到 PDF
        if (pageNumber > 1) {
          pdf.addPage();
        }
        pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, pageImgHeight);

        // 移动到下一页
        currentY = pageEndY;
      }

      console.log(`[PDF] 总共生成 ${pageNumber} 页`);

      // 添加页码（如果需要）
      if (opts.showPageNumber) {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
          );
        }
      }

      // 生成 Blob
      const blob = pdf.output('blob');

      return blob;
    } finally {
      // 清理：移除临时 DOM 元素
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Markdown 转 PDF 失败:', error);
    throw new Error(`Markdown 转 PDF 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 将 Markdown 转换为 PDF 并触发下载
 * @param markdown Markdown 文本内容
 * @param filename 输出文件名（可选）
 * @param options PDF 配置选项
 */
export async function downloadMarkdownAsPdf(
  markdown: string,
  filename: string = 'document.pdf',
  options: PdfOptions = {}
): Promise<void> {
  try {
    const blob = await convertMarkdownToPdf(markdown, options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载 PDF 文件失败:', error);
    throw error;
  }
}

/**
 * 从 HTML 内容直接生成 PDF（跳过 Markdown 转换）
 * @param html HTML 内容
 * @param options PDF 配置选项
 * @returns Promise<Blob> PDF 文档的 Blob 对象
 */
export async function convertHtmlToPdf(
  html: string,
  options: PdfOptions = {}
): Promise<Blob> {
  try {
    if (!html || typeof html !== 'string') {
      throw new Error('HTML 内容不能为空');
    }

    const opts: Required<PdfOptions> = { ...DEFAULT_PDF_OPTIONS, ...options };

    // 创建带样式的 HTML 容器
    const container = createStyledHtmlContainer(html, opts);
    document.body.appendChild(container);

    try {
      // 应用代码高亮
      applyCodeHighlighting(container);

      // 将代码块转换为图片
      await convertCodeBlocksToImages(container);

      // 预加载图片
      await preloadImages(container);

      // 等待渲染
      await new Promise(resolve => setTimeout(resolve, 500));

      // 显式设置容器高度
      const fullHeight = container.scrollHeight;
      container.style.height = `${fullHeight + 50}px`;

      // 渲染为 Canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        height: fullHeight + 50,
        windowHeight: fullHeight + 50,
      });

      // 创建 PDF
      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.pageSize,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = opts.margin;
      const contentWidth = pageWidth - 2 * margin;

      // 智能分页
      const pageContentHeight = pageHeight - 2 * margin;
      const pageContentHeightPx = (pageContentHeight * canvas.width) / contentWidth;
      const searchRange = Math.round((20 * canvas.width) / contentWidth);
      const elementPositions = collectElementPositions(container, 2);

      let currentY = 0;
      let pageNumber = 0;

      while (currentY < canvas.height) {
        pageNumber++;
        let pageEndY = Math.min(currentY + pageContentHeightPx, canvas.height);

        if (pageEndY < canvas.height) {
          pageEndY = adjustCutPosition(pageEndY, elementPositions, currentY);
          const bestCut = findBestCutPosition(canvas, pageEndY, searchRange);
          if (bestCut !== pageEndY && bestCut > currentY) {
            pageEndY = bestCut;
          }
        }

        const pageHeightPx = pageEndY - currentY;
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeightPx;
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) break;

        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(canvas, 0, currentY, canvas.width, pageHeightPx, 0, 0, canvas.width, pageHeightPx);

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pageImgHeight = (pageHeightPx * contentWidth) / canvas.width;

        if (pageNumber > 1) pdf.addPage();
        pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, pageImgHeight);

        currentY = pageEndY;
      }

      if (opts.showPageNumber) {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, {
            align: 'center',
          });
        }
      }

      return pdf.output('blob');
    } finally {
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('HTML 转 PDF 失败:', error);
    throw new Error(`HTML 转 PDF 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
