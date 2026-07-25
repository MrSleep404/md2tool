/**
 * Word 转 Markdown 工具函数
 * 使用 mammoth 库将 Word 文档转换为 Markdown 文本
 */

import mammoth from 'mammoth';

/**
 * 使用mammoth的transformDocument API获取段落样式信息
 * 更准确地识别标题级别
 */
async function convertWordToMarkdownAdvanced(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  console.log('========== Word转Markdown（高级模式）==========');

  // 存储段落及其样式信息
  interface ParagraphInfo {
    text: string;
    styleName?: string;
    isBold?: boolean;
    fontSize?: number;
  }

  const paragraphs: ParagraphInfo[] = [];

  // 使用mammoth的transformDocument来访问原始段落信息
  const options = {
    arrayBuffer,
    transformDocument: (element: any) => {
      console.log('检测到元素类型:', element.type);

      // 处理段落元素
      if (element.type === 'paragraph') {
        console.log('找到段落元素:', element);
        const children = element.children || [];
        const text = children
          .filter((child: any) => child.type === 'run')
          .map((run: any) => run.text || '')
          .join('');

        // 获取段落样式名称
        const styleName = element.styleName;

        // 检查是否加粗
        const isBold = children.some((child: any) =>
          child.type === 'run' && child.isBold
        );

        // 获取字体大小（如果有的话）
        let fontSize: number | undefined;
        children.forEach((child: any) => {
          if (child.type === 'run' && child.fontSize) {
            fontSize = child.fontSize;
          }
        });

        if (text.trim()) {
          paragraphs.push({
            text: text.trim(),
            styleName,
            isBold,
            fontSize,
          });

          console.log(`段落: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
          console.log(`  样式: ${styleName || '无'}, 加粗: ${isBold}, 字号: ${fontSize || '未知'}`);
        }
      }
      return element;
    },
  };

  // 先运行transformDocument收集段落信息
  await mammoth.convertToHtml(options);

  // 根据段落信息生成Markdown
  let markdown = '';

  paragraphs.forEach((para, index) => {
    const { text, styleName, isBold, fontSize } = para;

    // 根据样式名称判断标题级别
    let headingLevel = 0;

    if (styleName) {
      // 检查是否是标题样式
      const headingMatch = styleName.match(/(?:Heading|标题)\s*(\d+)/i);
      if (headingMatch) {
        headingLevel = parseInt(headingMatch[1]);
        console.log(`  -> 识别为标题 ${headingLevel}`);
      }
    }

    // 如果没有标题样式，根据字体大小和加粗判断
    if (headingLevel === 0 && isBold && fontSize) {
      if (fontSize >= 28) {
        headingLevel = 1;
        console.log(`  -> 根据字体大小判断为标题 1 (${fontSize}pt)`);
      } else if (fontSize >= 24) {
        headingLevel = 2;
        console.log(`  -> 根据字体大小判断为标题 2 (${fontSize}pt)`);
      } else if (fontSize >= 20) {
        headingLevel = 3;
        console.log(`  -> 根据字体大小判断为标题 3 (${fontSize}pt)`);
      }
    }

    // 如果仍然没有识别，检查是否是加粗的短文本
    if (headingLevel === 0 && isBold && text.length <= 30) {
      headingLevel = 1;
      console.log(`  -> 识别为加粗短文本标题`);
    }

    // 生成Markdown
    if (headingLevel > 0) {
      markdown += `${'#'.repeat(headingLevel)} ${text}\n\n`;
    } else {
      markdown += `${text}\n\n`;
    }
  });

  console.log('========== 转换完成 ==========');
  return markdown.trim();
}

/**
 * 将 Word 文档文件转换为 Markdown 文本
 * @param file Word 文档文件（.docx 格式）
 * @returns Promise<string> 转换后的 Markdown 文本
 * @throws Error 当转换过程中出现错误时抛出异常
 */
export async function convertWordToMarkdown(file: File): Promise<string> {
  try {
    // 验证文件类型
    if (!file) {
      throw new Error('文件不能为空');
    }

    if (!file.name.endsWith('.docx')) {
      throw new Error('只支持 .docx 格式的 Word 文档');
    }

    // 读取文件为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 配置mammoth样式映射，确保正确识别标题
    const options = {
      arrayBuffer,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        // 处理自定义标题样式
        "p[style-name='标题 1'] => h1:fresh",
        "p[style-name='标题 2'] => h2:fresh",
        "p[style-name='标题 3'] => h3:fresh",
      ],
    };

    // 使用增强转换方法，保留格式
    const result = await mammoth.convertToHtml(options);
    const html = result.value;

    // 调试：输出原始HTML
    console.log('========== Word转Markdown 开始 ==========');
    console.log('原始HTML长度:', html.length);
    console.log('HTML预览:', html.substring(0, 500));

    // 检查标题标签
    const h1Count = (html.match(/<h1/gi) || []).length;
    const h2Count = (html.match(/<h2/gi) || []).length;
    const h3Count = (html.match(/<h3/gi) || []).length;
    console.log('检测到的标题数量: h1:', h1Count, ', h2:', h2Count, ', h3:', h3Count);

    // 将 HTML 转换为 Markdown
    const markdown = convertHtmlToMarkdown(html);

    console.log('转换后的Markdown长度:', markdown.length);
    console.log('Markdown预览:', markdown.substring(0, 300));
    console.log('========== Word转Markdown 完成 ==========');

    return markdown;
  } catch (error) {
    console.error('Word 转 Markdown 失败:', error);
    throw new Error('Word 转 Markdown 失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

/**
 * 将 Word 文档 ArrayBuffer 转换为 Markdown 文本
 * @param arrayBuffer Word 文件的 ArrayBuffer
 * @returns Promise<string> 转换后的 Markdown 文本
 */
export async function convertWordBufferToMarkdown(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('ArrayBuffer 不能为空');
    }

    const result = await mammoth.convertToHtml({ arrayBuffer });
    const markdown = convertHtmlToMarkdown(result.value);

    return markdown;
  } catch (error) {
    console.error('Word 转 Markdown 失败:', error);
    throw new Error(`Word 转 Markdown 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 后处理 Markdown 文本，优化格式
 * @param text 原始 Markdown 文本
 * @returns 优化后的 Markdown 文本
 */
function postProcessMarkdown(text: string): string {
  // 移除多余的空行（保留最多一个空行）
  text = text.replace(/\n{3,}/g, '\n\n');

  // 移除行尾空格
  text = text.split('\n').map(line => line.trimEnd()).join('\n');

  // 确保文件末尾只有一个换行符
  text = text.trimEnd() + '\n';

  return text;
}

/**
 * 智能识别加粗文本为标题
 * 规则：
 * 1. 段落只包含<strong>标签
 * 2. 文本较短（<=30字符）
 * 3. 后面跟随普通段落
 */
function smartDetectTitles(html: string): string {
  console.log('开始智能标题识别...');

  // 匹配只包含<strong>的段落
  const strongParagraphRegex = /<p><strong>([^<]+)<\/strong><\/p>/g;
  let match;
  let titleCount = 0;

  // 替换所有符合条件的加粗段落为标题
  const result = html.replace(strongParagraphRegex, (fullMatch, text) => {
    // 检查文本长度（标题通常较短）
    if (text.trim().length <= 30 && text.trim().length > 0) {
      titleCount++;
      console.log(`识别为标题: "${text.trim()}"`);
      return `<h1>${text.trim()}</h1>`;
    }
    return fullMatch;
  });

  console.log(`智能识别完成，找到 ${titleCount} 个潜在标题`);
  return result;
}

/**
 * 将 HTML 转换为 Markdown（增强版）
 * 支持标题、表格、列表、粗体、斜体等格式
 * @param html HTML 字符串
 * @returns Markdown 字符串
 */
function convertHtmlToMarkdown(html: string): string {
  let markdown = html;

  // 智能识别加粗文本为标题
  markdown = smartDetectTitles(markdown);

  // 处理表格（必须在其他标签之前处理）
  markdown = processTables(markdown);

  // 处理标题（提取文本内容）
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gis, (match, content) => {
    const text = cleanHtmlTags(content);
    return `# ${text}\n\n`;
  });
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gis, (match, content) => {
    const text = cleanHtmlTags(content);
    return `## ${text}\n\n`;
  });
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gis, (match, content) => {
    const text = cleanHtmlTags(content);
    return `### ${text}\n\n`;
  });
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gis, (match, content) => {
    const text = cleanHtmlTags(content);
    return `#### ${text}\n\n`;
  });
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gis, (match, content) => {
    const text = cleanHtmlTags(content);
    return `##### ${text}\n\n`;
  });
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gis, (match, content) => {
    const text = cleanHtmlTags(content);
    return `###### ${text}\n\n`;
  });

  // 处理粗体和斜体
  markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gis, '**$2**');
  markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gis, '*$2*');

  // 处理段落
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n');

  // 处理无序列表
  markdown = markdown.replace(/<ul[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n');

  // 处理有序列表
  let olCounter = 0;
  markdown = markdown.replace(/<ol[^>]*>/gi, () => {
    olCounter = 0;
    return '\n';
  });
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gis, (match, content) => {
    olCounter++;
    return `${olCounter}. ${content}\n`;
  });

  // 处理换行
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  // 处理链接
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // 清理其他 HTML 标签
  markdown = cleanHtmlTags(markdown);

  // 解码 HTML 实体
  markdown = markdown
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 清理多余空行
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim() + '\n';

  return markdown;
}

/**
 * 处理 HTML 表格，转换为 Markdown 表格格式
 * @param html HTML 字符串
 * @returns 转换后的字符串
 */
function processTables(html: string): string {
  // 匹配整个表格
  return html.replace(/<table[^>]*>(.*?)<\/table>/gis, (tableMatch) => {
    const rows: string[][] = [];

    // 提取所有行
    const trMatches = tableMatch.match(/<tr[^>]*>(.*?)<\/tr>/gis);
    if (!trMatches) return '';

    trMatches.forEach((tr) => {
      const cells: string[] = [];

      // 提取单元格（th 或 td）
      const cellMatches = tr.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gis);
      if (cellMatches) {
        cellMatches.forEach((cell) => {
          // 清理单元格内容
          let content = cell.replace(/<t[dh][^>]*>(.*?)<\/t[dh]>/is, '$1');
          content = cleanHtmlTags(content).trim();
          // 移除换行符，用空格代替
          content = content.replace(/\n/g, ' ');
          cells.push(content);
        });
      }

      if (cells.length > 0) {
        rows.push(cells);
      }
    });

    if (rows.length === 0) return '';

    // 构建 Markdown 表格
    let markdown = '\n';

    // 第一行作为表头
    if (rows.length > 0) {
      markdown += '| ' + rows[0].join(' | ') + ' |\n';
      markdown += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';

      // 其他行作为数据
      for (let i = 1; i < rows.length; i++) {
        markdown += '| ' + rows[i].join(' | ') + ' |\n';
      }
    }

    markdown += '\n';
    return markdown;
  });
}

/**
 * 清理 HTML 标签，只保留文本内容
 * @param html HTML 字符串
 * @returns 纯文本
 */
function cleanHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}