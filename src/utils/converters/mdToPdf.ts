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

  // 添加 Markdown 样式
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
    
    #markdown-pdf-container code {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      background-color: #f5f5f5;
      padding: 2pt 4pt;
      border-radius: 2pt;
      font-size: 11pt;
    }
    
    #markdown-pdf-container pre {
      background-color: #f5f5f5;
      padding: 10pt;
      border-radius: 4pt;
      overflow-x: auto;
      margin: 10pt 0;
    }
    
    #markdown-pdf-container pre code {
      background-color: transparent;
      padding: 0;
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
    const htmlContent = await convertMarkdownToHtml(markdown);

    // 步骤2：创建带样式的 HTML 容器
    const container = createStyledHtmlContainer(htmlContent, opts);
    document.body.appendChild(container);

    try {
      // 步骤3：使用 html2canvas 渲染 HTML 为 Canvas
      const canvas = await html2canvas(container, {
        scale: 2, // 提高清晰度
        useCORS: true, // 允许跨域图片
        logging: false, // 禁用日志
        backgroundColor: '#ffffff',
      });

      // 步骤4：创建 PDF 文档
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

      // 将 Canvas 转换为图片
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 计算需要的页数
      let heightLeft = imgHeight;
      let position = margin;
      let pageNumber = 1;

      // 添加第一页
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin;

      // 添加后续页面（如果需要）
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();

        // 添加图片到新页面
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 2 * margin;
        pageNumber++;
      }

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
      // 渲染为 Canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 2 * margin;
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