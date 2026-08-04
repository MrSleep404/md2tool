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
    useMaxWidth: false, // 禁用 useMaxWidth，生成固定尺寸的 SVG，避免 width="100%" 导致 Image 无法加载
    htmlLabels: false, // 禁用 htmlLabels，生成纯 SVG <text> 元素，避免 Image 加载 SVG 时 foreignObject 导致失败
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
  // 添加更好的错误处理
  logLevel: 'error', // 只显示错误日志
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
    // 验证输入
    if (!code || typeof code !== 'string') {
      throw new Error('Mermaid 代码不能为空');
    }

    // 清理代码：移除多余的空行和空格
    const cleanedCode = code.trim();

    // 生成唯一 ID
    const id = getUniqueMermaidId();

    // 渲染 Mermaid
    const { svg } = await mermaid.render(id, cleanedCode);

    // 清理 SVG 并确保它可以被 Image 对象正确加载
    let cleanedSvg = svg
      .replace(/xmlns:xlink="[^"]*"/gi, '')
      .replace(/xlink:href="[^"]*"/gi, '');

    // 确保 SVG 有 xmlns 属性（Image 加载 SVG 时必需）
    if (!/xmlns=/.test(cleanedSvg)) {
      cleanedSvg = cleanedSvg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // 将 width="100%" 替换为从 viewBox 提取的实际像素值
    const viewBoxMatch = cleanedSvg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].split(/\s+/).map(Number);
      const vbWidth = parts[2];
      const vbHeight = parts[3];
      if (vbWidth && vbHeight) {
        cleanedSvg = cleanedSvg.replace(/width="[^"]*"/, `width="${vbWidth}"`);
        cleanedSvg = cleanedSvg.replace(/height="[^"]*"/, `height="${vbHeight}"`);
      }
    }

    return cleanedSvg;
  } catch (error) {
    // 记录详细错误信息
    console.error('Mermaid 渲染失败:', {
      error: error instanceof Error ? error.message : '未知错误',
      code: code.substring(0, 100) // 只记录前100个字符
    });

    // 抛出更友好的错误信息
    throw new Error(`Mermaid 渲染失败: ${error instanceof Error ? error.message : '请检查 Mermaid 语法'}`);
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
      let processedSvg = svgString;

      // 确保 SVG 有 xmlns 属性
      if (!/xmlns=/.test(processedSvg)) {
        processedSvg = processedSvg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // 从 viewBox 或 width/height 中提取尺寸
      let svgWidth = 0;
      let svgHeight = 0;

      const widthMatch = processedSvg.match(/width="(\d+)"/);
      const heightMatch = processedSvg.match(/height="(\d+)"/);

      if (widthMatch) svgWidth = parseInt(widthMatch[1]);
      if (heightMatch) svgHeight = parseInt(heightMatch[1]);

      // 如果没有具体像素尺寸，从 viewBox 提取
      if (!svgWidth || !svgHeight) {
        const viewBoxMatch = processedSvg.match(/viewBox="([^"]+)"/);
        if (viewBoxMatch) {
          const parts = viewBoxMatch[1].split(/\s+/).map(Number);
          if (!svgWidth) svgWidth = parts[2] || 800;
          if (!svgHeight) svgHeight = parts[3] || 600;
        }
      }

      // 确保 SVG 有明确的像素宽高（替换掉 width="100%" 等百分比值）
      processedSvg = processedSvg.replace(/width="[^"]*"/, `width="${svgWidth}"`);
      processedSvg = processedSvg.replace(/height="[^"]*"/, `height="${svgHeight}"`);

      console.log(`SVG 尺寸: ${svgWidth}x${svgHeight}, 缩放: ${scale}x`);

      // 使用 encodeURIComponent 方式构建 Data URL
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(processedSvg)}`;

      // 创建 Image 对象
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('无法创建 Canvas 上下文'));
            return;
          }

          const originalWidth = img.naturalWidth || svgWidth;
          const originalHeight = img.naturalHeight || svgHeight;

          canvas.width = originalWidth * scale;
          canvas.height = originalHeight * scale;

          // 填充白色背景
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngBase64 = canvas.toDataURL('image/png');

          console.log(`PNG 转换成功: ${canvas.width}x${canvas.height}`);

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
        console.error('SVG Image 加载失败，SVG 前500字符:', processedSvg.substring(0, 500));
        reject(new Error('SVG 加载失败（可能包含不支持的元素）'));
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