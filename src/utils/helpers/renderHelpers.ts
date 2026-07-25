/**
 * 渲染辅助函数
 * 用于将 Mermaid 和 LaTeX 渲染为图片
 */

import mermaid from 'mermaid';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// 初始化 Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'arial, sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
  themeVariables: {
    primaryColor: '#E3F2FD',
    primaryTextColor: '#1976D2',
    primaryBorderColor: '#1976D2',
    lineColor: '#1976D2',
    secondaryColor: '#F3E5F5',
    tertiaryColor: '#FFF',
  },
});

/**
 * 生成唯一的 Mermaid 图表 ID
 */
let mermaidCounter = 0;
function getUniqueMermaidId(): string {
  return `mermaid-graph-${Date.now()}-${mermaidCounter++}`;
}

/**
 * 将 Mermaid 代码渲染为 SVG 字符串
 * @param code Mermaid 代码
 * @returns Promise<string> SVG 字符串
 */
export async function renderMermaidToSvg(code: string): Promise<string> {
  try {
    const id = getUniqueMermaidId();
    const { svg } = await mermaid.render(id, code);

    // 只移除可能导致安全问题的外部链接，保留样式
    const cleanedSvg = svg
      .replace(/xmlns:xlink="[^"]*"/gi, '')
      .replace(/xlink:href="[^"]*"/gi, '');

    return cleanedSvg;
  } catch (error) {
    console.error('Mermaid 渲染失败:', error);
    throw error;
  }
}

/**
 * 将 LaTeX 公式渲染为 HTML 字符串
 * @param formula LaTeX 公式
 * @param displayMode 是否为块级公式（$$...$$）
 * @returns string HTML 字符串
 */
export function renderLatexToHtml(formula: string, displayMode: boolean = false): string {
  try {
    return katex.renderToString(formula, {
      displayMode,
      throwOnError: false,
      errorColor: '#cc0000',
    });
  } catch (error) {
    console.error('LaTeX 渲染失败:', error);
    throw error;
  }
}

/**
 * 将 SVG 字符串转换为 Base64 PNG 图片（带尺寸信息）
 * @param svgString SVG 字符串
 * @param scale 缩放比例（默认为3，提高清晰度）
 * @returns Promise<{ base64: string, width: number, height: number }> Base64 PNG 图片和尺寸信息
 */
export async function svgToPngBase64WithSize(
  svgString: string,
  scale: number = 3
): Promise<{ base64: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    try {
      // 将 SVG 字符串转换为 Base64 编码的 Data URL
      const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
      const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      // 创建 Image 对象
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // 创建 Canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('无法创建 Canvas 上下文'));
            return;
          }

          // 获取原始尺寸
          const originalWidth = img.width || 800;
          const originalHeight = img.height || 600;

          // 设置 Canvas 大小（放大以提高清晰度）
          canvas.width = originalWidth * scale;
          canvas.height = originalHeight * scale;

          // 填充白色背景
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 绘制图片
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 转换为 PNG Base64
          const pngBase64 = canvas.toDataURL('image/png');

          resolve({
            base64: pngBase64,
            width: originalWidth,
            height: originalHeight,
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('SVG 加载失败'));
      };

      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 将 SVG 字符串转换为 Base64 PNG 图片
 * @param svgString SVG 字符串
 * @returns Promise<string> Base64 PNG 图片
 */
export async function svgToPngBase64(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 将 SVG 字符串转换为 Base64 编码的 Data URL
      // 这样可以避免跨域问题
      const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
      const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      // 创建 Image 对象
      const img = new Image();

      // 设置 crossOrigin 属性
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // 创建 Canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('无法创建 Canvas 上下文'));
            return;
          }

          // 设置 Canvas 大小（放大2倍以提高清晰度）
          canvas.width = img.width * 2 || 800;
          canvas.height = img.height * 2 || 600;

          // 填充白色背景
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 绘制图片
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 转换为 PNG Base64
          const pngBase64 = canvas.toDataURL('image/png');

          resolve(pngBase64);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('SVG 加载失败'));
      };

      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 将 HTML 字符串转换为 Base64 PNG 图片
 * @param htmlString HTML 字符串
 * @param width 宽度
 * @param height 高度
 * @returns Promise<string> Base64 PNG 图片
 */
export async function htmlToPngBase64(
  htmlString: string,
  width: number = 800,
  height: number = 100
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 创建临时容器
      const container = document.createElement('div');
      container.innerHTML = htmlString;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = `${width}px`;
      container.style.padding = '20px';
      container.style.backgroundColor = '#FFFFFF';
      container.style.fontSize = '18px';
      document.body.appendChild(container);

      // 使用 html2canvas（如果已安装）
      // 这里使用简化版本的 Canvas 绘制
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        document.body.removeChild(container);
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }

      // 等待字体渲染完成
      setTimeout(() => {
        try {
          canvas.width = width;
          canvas.height = height;

          // 填充白色背景
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 绘制公式（简化版本，实际应使用 html2canvas）
          ctx.font = '18px KaTeX_Main, serif';
          ctx.fillStyle = '#000000';
          ctx.textBaseline = 'top';
          ctx.fillText(htmlString.replace(/<[^>]*>/g, ''), 10, 10);

          const pngBase64 = canvas.toDataURL('image/png');

          document.body.removeChild(container);
          resolve(pngBase64);
        } catch (err) {
          document.body.removeChild(container);
          reject(err);
        }
      }, 100);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 将 Base64 图片数据转换为 ArrayBuffer
 * @param base64 Base64 图片字符串
 * @returns ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const base64Data = base64.split(',')[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}