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
    useMaxWidth: false,
    htmlLabels: false,
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
  logLevel: 'error',
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
    if (!code || typeof code !== 'string') {
      throw new Error('Mermaid 代码不能为空');
    }

    const cleanedCode = code.trim();
    const id = getUniqueMermaidId();

    console.log('[Mermaid] 开始渲染, ID:', id);
    console.log('[Mermaid] 代码:', cleanedCode.substring(0, 100));

    const { svg } = await mermaid.render(id, cleanedCode);

    console.log('[Mermaid] 渲染成功, SVG长度:', svg.length);

    // 清理 SVG，确保可以被 Image 对象正确加载
    let cleanedSvg = svg;

    // 移除 xlink 相关属性
    cleanedSvg = cleanedSvg.replace(/xmlns:xlink="[^"]*"/gi, '');
    cleanedSvg = cleanedSvg.replace(/xlink:href="[^"]*"/gi, '');

    // 移除 foreignObject 元素（可能导致 Image 加载失败）
    cleanedSvg = cleanedSvg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');

    // 确保 SVG 有 xmlns 属性
    if (!/xmlns=/.test(cleanedSvg)) {
      cleanedSvg = cleanedSvg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // 从 viewBox 中提取尺寸，只替换 <svg> 根元素的 width/height
    const viewBoxMatch = cleanedSvg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].split(/\s+/).map(Number);
      const vbWidth = parts[2];
      const vbHeight = parts[3];
      if (vbWidth && vbHeight) {
        // 只替换 <svg 标签上的 width/height，不影响内部子元素
        cleanedSvg = cleanedSvg.replace(/(<svg[^>]*?)width="[^"]*"/, `$1width="${vbWidth}"`);
        cleanedSvg = cleanedSvg.replace(/(<svg[^>]*?)height="[^"]*"/, `$1height="${vbHeight}"`);
      }
    }

    // 如果没有 width/height 属性，添加默认值
    if (!/width=/.test(cleanedSvg)) {
      cleanedSvg = cleanedSvg.replace(/<svg/, '<svg width="800"');
    }
    if (!/height=/.test(cleanedSvg)) {
      cleanedSvg = cleanedSvg.replace(/<svg/, '<svg height="600"');
    }

    console.log('[Mermaid] SVG清理完成, 前300字符:', cleanedSvg.substring(0, 300));

    return cleanedSvg;
  } catch (error) {
    console.error('[Mermaid] 渲染失败:', error);
    throw new Error(`Mermaid 渲染失败: ${error instanceof Error ? error.message : '请检查 Mermaid 语法'}`);
  }
}

/**
 * 将 LaTeX 公式渲染为 HTML 字符串
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
 * 使用 Blob URL 方式加载 SVG，比 data URL 更可靠
 */
export async function svgToPngBase64WithSize(
  svgString: string,
  scale: number = 2
): Promise<{ base64: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    try {
      let processedSvg = svgString;

      // 确保 SVG 有 xmlns 属性
      if (!/xmlns=/.test(processedSvg)) {
        processedSvg = processedSvg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // 提取尺寸
      let svgWidth = 0;
      let svgHeight = 0;

      const widthMatch = processedSvg.match(/width="(\d+(?:\.\d+)?)"\b/);
      const heightMatch = processedSvg.match(/height="(\d+(?:\.\d+)?)"\b/);

      if (widthMatch) svgWidth = Math.round(parseFloat(widthMatch[1]));
      if (heightMatch) svgHeight = Math.round(parseFloat(heightMatch[1]));

      if (!svgWidth || !svgHeight) {
        const viewBoxMatch = processedSvg.match(/viewBox="([^"]+)"/);
        if (viewBoxMatch) {
          const parts = viewBoxMatch[1].split(/\s+/).map(Number);
          if (!svgWidth) svgWidth = Math.round(parts[2]) || 800;
          if (!svgHeight) svgHeight = Math.round(parts[3]) || 600;
        }
      }

      // 确保有合理的尺寸
      svgWidth = svgWidth || 800;
      svgHeight = svgHeight || 600;

      // 只替换 <svg> 根元素的 width/height，不影响内部子元素
      processedSvg = processedSvg.replace(/(<svg[^>]*?)width="[^"]*"/, `$1width="${svgWidth}"`);
      processedSvg = processedSvg.replace(/(<svg[^>]*?)height="[^"]*"/, `$1height="${svgHeight}"`);

      console.log(`[SVG→PNG] 尺寸: ${svgWidth}x${svgHeight}, 缩放: ${scale}x`);

      // 使用 Blob URL 方式加载 SVG（比 data URL 更可靠）
      const blob = new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const img = new Image();

      // 设置超时（10秒）
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.error('[SVG→PNG] 加载超时');
        reject(new Error('SVG 加载超时'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const originalWidth = img.naturalWidth || svgWidth;
          const originalHeight = img.naturalHeight || svgHeight;

          // 限制 Canvas 尺寸，避免超过浏览器限制
          const maxCanvasSize = 4096;
          let actualScale = scale;
          if (originalWidth * scale > maxCanvasSize || originalHeight * scale > maxCanvasSize) {
            actualScale = Math.min(maxCanvasSize / originalWidth, maxCanvasSize / originalHeight);
            console.warn(`[SVG→PNG] Canvas 尺寸过大，降低缩放到 ${actualScale.toFixed(2)}x`);
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('无法创建 Canvas 上下文'));
            return;
          }

          canvas.width = Math.round(originalWidth * actualScale);
          canvas.height = Math.round(originalHeight * actualScale);

          // 填充白色背景
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          URL.revokeObjectURL(blobUrl);

          const pngBase64 = canvas.toDataURL('image/png');

          console.log(`[SVG→PNG] 转换成功: ${canvas.width}x${canvas.height}, Base64长度: ${pngBase64.length}`);

          resolve({
            base64: pngBase64,
            width: originalWidth,
            height: originalHeight,
          });
        } catch (error) {
          URL.revokeObjectURL(blobUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(blobUrl);
        console.error('[SVG→PNG] Image 加载失败, SVG前500字符:', processedSvg.substring(0, 500));
        reject(new Error('SVG 加载失败'));
      };

      img.src = blobUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 将 SVG 字符串转换为 Base64 PNG 图片
 */
export async function svgToPngBase64(svgString: string): Promise<string> {
  const result = await svgToPngBase64WithSize(svgString, 2);
  return result.base64;
}

/**
 * 将 HTML 字符串转换为 Base64 PNG 图片
 */
export async function htmlToPngBase64(
  htmlString: string,
  width: number = 800,
  height: number = 100
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
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

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        document.body.removeChild(container);
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }

      setTimeout(() => {
        try {
          canvas.width = width;
          canvas.height = height;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

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
