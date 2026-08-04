/**
 * Markdown 转 Word 工具函数
 * 使用 docx 库将 Markdown 文本转换为 Word 文档
 * 支持 Mermaid 流程图和 LaTeX 数学公式
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
} from 'docx';
import type { Paragraph as DocxParagraph, Table as DocxTable } from 'docx';
import { renderMermaidToSvg, svgToPngBase64WithSize, base64ToArrayBuffer } from '../helpers/renderHelpers';
import { convertLatexToWordMath } from '../helpers/latexToWord';

/**
 * 1.5倍行距的配置（360 twips = 1.5 * 240）
 */
const LINE_SPACING_1_5 = { line: 360 };

/**
 * 代码语法高亮颜色配置
 */
const CODE_COLORS = {
  keyword: '0000FF',      // 蓝色 - 关键字
  string: 'A31515',       // 深红色 - 字符串
  comment: '008000',      // 绿色 - 注释
  number: '098658',       // 青色 - 数字
  function: '795E26',     // 金色 - 函数名
  operator: 'D16969',     // 红色 - 操作符
  default: '000000',      // 黑色 - 默认文本
};

/**
 * 解析代码行并应用语法高亮
 * @param codeLine 代码行
 * @returns TextRun 对象数组
 */
function parseCodeLine(codeLine: string): TextRun[] {
  const runs: TextRun[] = [];

  // 如果行为空，返回一个空格
  if (!codeLine.trim()) {
    runs.push(new TextRun({ text: ' ', font: 'Consolas', size: 20 }));
    return runs;
  }

  // 常见关键字列表
  const keywords = [
    'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return',
    'import', 'export', 'from', 'class', 'extends', 'new', 'this', 'super',
    'async', 'await', 'try', 'catch', 'throw', 'typeof', 'instanceof',
    'true', 'false', 'null', 'undefined', 'void', 'static', 'get', 'set',
    'public', 'private', 'protected', 'readonly', 'interface', 'type', 'enum',
    'def', 'print', 'elif', 'lambda', 'with', 'as', 'in', 'not', 'and', 'or',
    'is', 'None', 'True', 'False', 'self', 'yield', 'global', 'nonlocal'
  ];

  // 使用简单的分词方法
  let i = 0;
  while (i < codeLine.length) {
    let matched = false;

    // 检查注释
    if (codeLine[i] === '/' && i + 1 < codeLine.length && codeLine[i + 1] === '/') {
      // 单行注释
      const comment = codeLine.substring(i);
      runs.push(new TextRun({
        text: comment,
        font: 'Consolas',
        size: 20,
        color: CODE_COLORS.comment,
        italics: true,
      }));
      break;
    }

    if (codeLine[i] === '#') {
      // Python注释
      const comment = codeLine.substring(i);
      runs.push(new TextRun({
        text: comment,
        font: 'Consolas',
        size: 20,
        color: CODE_COLORS.comment,
        italics: true,
      }));
      break;
    }

    // 检查字符串
    if (codeLine[i] === '"' || codeLine[i] === "'" || codeLine[i] === '`') {
      const quote = codeLine[i];
      let j = i + 1;
      while (j < codeLine.length) {
        if (codeLine[j] === '\\') {
          j += 2; // 跳过转义字符
        } else if (codeLine[j] === quote) {
          j++;
          break;
        } else {
          j++;
        }
      }
      const str = codeLine.substring(i, j);
      runs.push(new TextRun({
        text: str,
        font: 'Consolas',
        size: 20,
        color: CODE_COLORS.string,
      }));
      i = j;
      matched = true;
      continue;
    }

    // 检查数字
    if (/\d/.test(codeLine[i])) {
      let j = i;
      while (j < codeLine.length && /\d/.test(codeLine[j])) {
        j++;
      }
      // 检查是否是浮点数
      if (j < codeLine.length && codeLine[j] === '.') {
        j++;
        while (j < codeLine.length && /\d/.test(codeLine[j])) {
          j++;
        }
      }
      const num = codeLine.substring(i, j);
      runs.push(new TextRun({
        text: num,
        font: 'Consolas',
        size: 20,
        color: CODE_COLORS.number,
      }));
      i = j;
      matched = true;
      continue;
    }

    // 检查关键字和标识符
    if (/[a-zA-Z_]/.test(codeLine[i])) {
      let j = i;
      while (j < codeLine.length && /[a-zA-Z0-9_]/.test(codeLine[j])) {
        j++;
      }
      const word = codeLine.substring(i, j);

      // 检查是否是关键字
      if (keywords.includes(word)) {
        runs.push(new TextRun({
          text: word,
          font: 'Consolas',
          size: 20,
          color: CODE_COLORS.keyword,
          bold: true,
        }));
      } else {
        runs.push(new TextRun({
          text: word,
          font: 'Consolas',
          size: 20,
          color: CODE_COLORS.default,
        }));
      }
      i = j;
      matched = true;
      continue;
    }

    // 其他字符（空格、符号等）
    if (!matched) {
      runs.push(new TextRun({
        text: codeLine[i],
        font: 'Consolas',
        size: 20,
        color: CODE_COLORS.default,
      }));
      i++;
    }
  }

  return runs;
}

/**
 * 图片尺寸限制（厘米转换为像素，假设96 DPI）
 * Word标准：宽度≤16cm，高度≤24cm
 */
const MAX_IMAGE_WIDTH_CM = 16; // 厘米
const MAX_IMAGE_HEIGHT_CM = 24; // 厘米
const CM_TO_PX = 37.795; // 1厘米 ≈ 37.795像素（96 DPI）
const MAX_IMAGE_WIDTH_PX = MAX_IMAGE_WIDTH_CM * CM_TO_PX; // ≈605像素
const MAX_IMAGE_HEIGHT_PX = MAX_IMAGE_HEIGHT_CM * CM_TO_PX; // ≈907像素

/**
 * 创建带有1.5倍行距的段落
 * @param options 段落选项
 * @returns Paragraph 对象
 */
function createParagraphWithSpacing(options: ConstructorParameters<typeof Paragraph>[0] = {}): Paragraph {
  const defaultOptions = {
    spacing: LINE_SPACING_1_5,
  };
  return new Paragraph(Object.assign({}, defaultOptions, options));
}

/**
 * 计算符合Word尺寸限制的图片尺寸
 * @param originalWidth 原始宽度（像素）
 * @param originalHeight 原始高度（像素）
 * @returns 符合限制的尺寸 {width, height}
 */
function calculateConstrainedSize(
  originalWidth: number,
  originalHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // 检查是否超过最大尺寸
  const widthExceeded = width > MAX_IMAGE_WIDTH_PX;

  // 如果宽度超过限制，按宽度缩放
  if (widthExceeded) {
    const ratio = MAX_IMAGE_WIDTH_PX / width;
    width = MAX_IMAGE_WIDTH_PX;
    height = Math.round(height * ratio);
  }

  // 如果缩放后高度仍超过限制，再按高度缩放
  if (height > MAX_IMAGE_HEIGHT_PX) {
    const ratio = MAX_IMAGE_HEIGHT_PX / height;
    height = MAX_IMAGE_HEIGHT_PX;
    width = Math.round(width * ratio);
  }

  console.log(`图片尺寸调整: ${originalWidth}x${originalHeight} -> ${width}x${height} (限制: ${MAX_IMAGE_WIDTH_PX}x${MAX_IMAGE_HEIGHT_PX})`);

  return { width, height };
}

/**
 * 解析 Markdown 行，提取文本和格式信息
 * @param line Markdown 文本行
 * @returns TextRun 对象数组
 */
function parseMarkdownLine(line: string): TextRun[] {
  const runs: TextRun[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    // 匹配粗体 **text** 或 __text__
    const boldMatch = remaining.match(/^(?:\*\*(.+?)\*\*|__(.+?)__)/);
    // 匹配斜体 *text* 或 _text_
    const italicMatch = remaining.match(/^(?:\*(?!\*)(.+?)(?<!\*)\*|_(?!_)(.+?)(?<!_)_)/);
    // 匹配粗斜体 ***text*** 或 ___text___
    const boldItalicMatch = remaining.match(/^(?:\*\*\*(.+?)\*\*\*|___(.+?)___)/);
    // 匹配行内代码 `text`
    const codeMatch = remaining.match(/^`(.+?)`/);
    // 匹配行内 LaTeX 公式 $...$（排除 $$...$$）
    const latexMatch = remaining.match(/^(?<!\$)\$(?!\$)(.+?)\$(?!\$)/);

    if (boldItalicMatch) {
      runs.push(
        new TextRun({
          text: boldItalicMatch[1] || boldItalicMatch[2],
          bold: true,
          italics: true,
          size: 24,
        })
      );
      remaining = remaining.slice(boldItalicMatch[0].length);
    } else if (boldMatch) {
      runs.push(
        new TextRun({
          text: boldMatch[1] || boldMatch[2],
          bold: true,
          size: 24,
        })
      );
      remaining = remaining.slice(boldMatch[0].length);
    } else if (italicMatch) {
      runs.push(
        new TextRun({
          text: italicMatch[1] || italicMatch[2],
          italics: true,
          size: 24,
        })
      );
      remaining = remaining.slice(italicMatch[0].length);
    } else if (latexMatch) {
      // 行内 LaTeX 公式作为斜体文本
      runs.push(
        new TextRun({
          text: latexMatch[1],
          italics: true,
          font: 'Cambria Math',
          size: 24,
        })
      );
      remaining = remaining.slice(latexMatch[0].length);
    } else if (codeMatch) {
      runs.push(
        new TextRun({
          text: codeMatch[1],
          font: 'Consolas',
          shading: { fill: 'F6F8FA' }, // 浅灰色背景
          color: 'E83E8C', // 粉红色文字
          size: 22, // 稍小的字号
        })
      );
      remaining = remaining.slice(codeMatch[0].length);
    } else {
      // 查找下一个格式化标记的位置
      const nextFormat = remaining.search(/(?:\*\*|\*|__|_|`|\$(?!\$))/);
      if (nextFormat === -1) {
        runs.push(new TextRun({ text: remaining, size: 24 }));
        break;
      } else if (nextFormat === 0) {
        // 如果在位置0但没有匹配，跳过一个字符
        runs.push(new TextRun({ text: remaining[0], size: 24 }));
        remaining = remaining.slice(1);
      } else {
        runs.push(new TextRun({ text: remaining.slice(0, nextFormat), size: 24 }));
        remaining = remaining.slice(nextFormat);
      }
    }
  }

  return runs;
}

/**
 * 解析 Markdown 文本为段落数组
 * @param markdown Markdown 文本
 * @returns Paragraph、Table、ImageRun 或 DocxMath 对象数组
 */
async function parseMarkdownToParagraphs(markdown: string): Promise<{
  paragraphs: (DocxParagraph | DocxTable)[];
  orderedListId: number;
}> {
  const paragraphs: (DocxParagraph | DocxTable)[] = [];
  // 统一处理行尾符号，将 Windows 格式（CRLF）转换为 Unix 格式（LF）
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedMarkdown.split('\n');

  console.log('开始解析 Markdown，总行数:', lines.length);
  console.log('原始内容:', markdown.substring(0, 200));

  // 有序列表计数器
  let orderedListCounter = 0;
  let orderedListId = 0;
  let lastWasOrderedList = false;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    console.log(`处理第 ${i} 行:`, JSON.stringify(line));

    // 空行
    if (!line.trim()) {
      console.log('  -> 空行');
      paragraphs.push(createParagraphWithSpacing({ text: '' }));
      // 空行时不立即结束列表，只有遇到非列表内容时才结束
      // 检查下一行是否为有序列表项
      if (lastWasOrderedList) {
        const nextLine = lines[i + 1];
        const nextIsOrderedList = nextLine && /^\d+\.\s+.+$/.test(nextLine);
        if (!nextIsOrderedList) {
          // 下一行不是有序列表项，列表结束
          console.log('  -> 列表结束（下一行不是列表项），重置计数器');
          orderedListCounter = 0;
          lastWasOrderedList = false;
        } else {
          console.log('  -> 空行但下一行是列表项，保持列表连续性');
        }
      }
      i++;
      continue;
    }

    // 图片 ![alt](url)
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const altText = imageMatch[1] || '图片';
      const imageUrl = imageMatch[2];
      console.log('========== 图片处理开始 ==========');
      console.log('alt文本:', altText);
      console.log('图片URL:', imageUrl);

      try {
        // 处理图片URL
        console.log('步骤1: 尝试获取图片数据...');
        const imageBuffer = await fetchImageAsBuffer(imageUrl);

        if (imageBuffer && imageBuffer.byteLength > 0) {
          console.log('步骤1完成: 成功获取图片数据, 大小:', imageBuffer.byteLength);

          // 获取图片原始尺寸，保持长宽比
          console.log('步骤1.5: 获取图片原始尺寸...');
          const { width: origWidth, height: origHeight } = await getImageDimensions(imageBuffer);
          console.log(`图片原始尺寸: ${origWidth}x${origHeight}`);

          // 按原始比例缩放到适合Word的尺寸（最大宽度600px）
          const maxWidth = 600;
          let displayWidth = origWidth;
          let displayHeight = origHeight;
          if (origWidth > maxWidth) {
            const ratio = maxWidth / origWidth;
            displayWidth = maxWidth;
            displayHeight = Math.round(origHeight * ratio);
          }

          // 应用Word尺寸限制
          const constrained = calculateConstrainedSize(displayWidth, displayHeight);
          displayWidth = constrained.width;
          displayHeight = constrained.height;
          console.log(`图片显示尺寸: ${displayWidth}x${displayHeight}`);

          // 创建图片段落
          console.log('步骤2: 创建ImageRun...');
          const imageRun = new ImageRun({
            data: imageBuffer,
            transformation: {
              width: displayWidth,
              height: displayHeight,
            },
          });

          paragraphs.push(
            createParagraphWithSpacing({
              children: [imageRun],
              alignment: AlignmentType.CENTER,
            })
          );
          console.log('步骤2完成: 图片段落已添加到文档');
          console.log('========== 图片处理成功 ==========');
        } else {
          console.log('步骤1失败: 无法获取图片数据');
          // 无法获取图片，显示alt文本
          paragraphs.push(
            createParagraphWithSpacing({
              children: [
                new TextRun({
                  text: `[图片: ${altText}]`,
                  italics: true,
                  color: '666666',
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
            })
          );
          console.log('显示alt文本作为占位符');
          console.log('========== 图片处理结束（失败）==========');
        }
      } catch (error) {
        console.error('========== 图片处理异常 ==========');
        console.error('错误详情:', error);
        // 出错时显示alt文本
        paragraphs.push(
          createParagraphWithSpacing({
            children: [
              new TextRun({
                text: `[图片: ${altText}]`,
                italics: true,
                color: '666666',
                size: 24,
              }),
            ],
          })
        );
        console.log('显示alt文本作为占位符');
      }

      i++;
      continue;
    }

    // 标题（标准 Markdown 格式：# 后必须有空格）
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      console.log('  -> 检测到标题:', { level, text, fullMatch: headingMatch[0] });

      // 标题前重置列表计数器
      if (lastWasOrderedList) {
        console.log('  -> 遇到标题，重置列表计数器');
        orderedListCounter = 0;
        lastWasOrderedList = false;
      }

      const headingLevelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };

      // 标题字号映射
      const headingSizeMap: Record<number, number> = {
        1: 36, // 小二
        2: 32, // 三号
        3: 30, // 小三
        4: 28, // 四号
        5: 28, // 四号
        6: 28, // 四号
      };

      // 为标题创建带黑色字体和加粗的 TextRun
      paragraphs.push(
        createParagraphWithSpacing({
          children: [
            new TextRun({
              text: text,
              color: '000000', // 黑色
              bold: true, // 加粗
              size: headingSizeMap[level] || 28,
            }),
          ],
          heading: headingLevelMap[level] || HeadingLevel.HEADING_6,
        })
      );
      i++;
      continue;
    } else {
      console.log('  -> 不是标题，正则匹配失败');
    }

    // 无序列表
    const ulMatch = line.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      paragraphs.push(
        createParagraphWithSpacing({
          children: parseMarkdownLine(ulMatch[1]),
          bullet: { level: 0 },
        })
      );
      i++;
      continue;
    }

    // 有序列表
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      // 从 Markdown 中提取实际编号
      const actualNumber = line.match(/^(\d+)\./)?.[1];
      
      // 检查是否需要开始新的列表
      // 只有当前不是列表且遇到第一个列表项，或者明确需要新列表时才创建新列表
      if (!lastWasOrderedList) {
        orderedListId++;
        orderedListCounter = 0;
        console.log(`  -> 开始新的有序列表 #${orderedListId}`);
      }

      orderedListCounter++;
      lastWasOrderedList = true;

      console.log(`  -> 有序列表项 #${orderedListId}.${orderedListCounter}: ${olMatch[1]}, Markdown编号: ${actualNumber}`);

      // 使用文本形式显示编号，而不是依赖 Word 自动编号
      paragraphs.push(
        createParagraphWithSpacing({
          children: [
            new TextRun({ text: `${actualNumber}. `, size: 24 }),
            ...parseMarkdownLine(olMatch[1])
          ],
        })
      );
      i++;
      continue;
    } else if (lastWasOrderedList && line.trim() && !line.match(/^\s+/)) {
      // 只有遇到非列表、非缩进的内容时，列表才结束
      console.log('  -> 遇到非列表非缩进项，列表结束');
      lastWasOrderedList = false;
      orderedListCounter = 0;
    }

    // 代码块开始
    if (line.startsWith('```')) {
      const language = line.slice(3).trim().toLowerCase();
      const codeLines: string[] = [];
      i++; // 跳过开始标记
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结束标记

      // 处理 Mermaid 代码块
      if (language === 'mermaid') {
        const mermaidCode = codeLines.join('\n');
        try {
          console.log('========== Mermaid 处理开始 ==========');
          console.log('Mermaid 代码:', mermaidCode);

          // 渲染 Mermaid 为 SVG
          console.log('步骤1: 开始渲染Mermaid SVG...');
          const svg = await renderMermaidToSvg(mermaidCode);
          console.log('步骤1完成: SVG渲染成功, SVG长度:', svg.length);
          console.log('SVG内容预览:', svg.substring(0, 200));

          // 将 SVG 转换为 PNG（使用高分辨率缩放）
          console.log('步骤2: 开始SVG转PNG...');
          const { base64, width, height } = await svgToPngBase64WithSize(svg, 6); // 提高到6倍缩放
          console.log('步骤2完成: PNG转换成功');
          console.log('原始尺寸:', width, 'x', height);
          console.log('Base64长度:', base64.length);

          // 将 Base64 转换为 ArrayBuffer
          console.log('步骤3: 开始Base64转ArrayBuffer...');
          const imageBuffer = base64ToArrayBuffer(base64);
          console.log('步骤3完成: ArrayBuffer长度:', imageBuffer.byteLength);

          // 计算符合Word尺寸限制的尺寸
          // 原始尺寸的3倍显示
          const originalDisplayWidth = width * 3;
          const originalDisplayHeight = height * 3;
          const { width: displayWidth, height: displayHeight } = calculateConstrainedSize(
            originalDisplayWidth,
            originalDisplayHeight
          );

          // 创建图片段落
          console.log('步骤4: 创建ImageRun...');
          const imageRun = new ImageRun({
            data: imageBuffer,
            transformation: {
              width: displayWidth,
              height: displayHeight,
            },
          });

          paragraphs.push(
            createParagraphWithSpacing({
              children: [imageRun],
              alignment: AlignmentType.CENTER,
            })
          );
          console.log('步骤4完成: 图片段落已添加');
          console.log('========== Mermaid 处理成功 ==========');
        } catch (error) {
          console.error('========== Mermaid 处理失败 ==========');
          console.error('错误详情:', error);
          console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');

          // 失败时保留原始代码块
          console.log('回退: 保存为代码块格式');
          codeLines.forEach(codeLine => {
            paragraphs.push(
              createParagraphWithSpacing({
                children: [
                  new TextRun({
                    text: codeLine || ' ',
                    font: 'Consolas',
                    size: 20,
                  }),
                ],
                shading: { fill: 'F5F5F5' },
              })
            );
          });
        }
        continue;
      }

      // 普通代码块 - 应用语法高亮
      codeLines.forEach((codeLine, index) => {
        paragraphs.push(
          createParagraphWithSpacing({
            children: parseCodeLine(codeLine),
            shading: { fill: 'F6F8FA' }, // 浅灰色背景
            spacing: {
              before: index === 0 ? 100 : 0,
              after: index === codeLines.length - 1 ? 100 : 0,
              line: 276, // 1.5倍行距
            },
          })
        );
      });
      continue;
    }

    // 引用
    if (line.startsWith('> ')) {
      paragraphs.push(
        createParagraphWithSpacing({
          children: parseMarkdownLine(line.slice(2)),
          indent: { left: 720 }, // 720 twips = 0.5 inch
          border: {
            left: {
              color: 'CCCCCC',
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
        })
      );
      i++;
      continue;
    }

    // 表格（以 | 开头）
    if (line.startsWith('|')) {
      const tableRows: string[][] = [];

      // 收集所有表格行
      while (i < lines.length && lines[i].startsWith('|')) {
        const rowLine = lines[i];
        // 跳过分隔行（如 |---|---|）
        if (!/^[\|\-\s]+$/.test(rowLine)) {
          // 解析表格行：| 列1 | 列2 | 列3 | → ['列1', '列2', '列3']
          const cells = rowLine
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '');
          tableRows.push(cells);
        }
        i++;
      }

      // 创建 Word 表格
      if (tableRows.length > 0) {
        const rows = tableRows.map((row, rowIndex) => {
          return new TableRow({
            children: row.map(cell => {
              return new TableCell({
                children: [
                  createParagraphWithSpacing({
                    children: [
                      new TextRun({
                        text: cell,
                        bold: rowIndex === 0, // 表头（第一行）加粗
                        size: 24,
                      }),
                    ],
                  }),
                ],
              });
            }),
          });
        });

        paragraphs.push(
          new Table({
            rows: rows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          })
        );
      }
      continue;
    }

    // 水平分割线
    if (/^[-*_]{3,}$/.test(line.trim())) {
      paragraphs.push(
        createParagraphWithSpacing({
          border: {
            bottom: {
              color: 'CCCCCC',
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );
      i++;
      continue;
    }

    // LaTeX 块级公式：$$...$$
    const blockLatexMatch = line.match(/^\$\$(.+)\$\$$/);
    if (blockLatexMatch) {
      const formula = blockLatexMatch[1].trim();
      console.log('检测到块级 LaTeX 公式:', formula);

      // 将 LaTeX 转换为 Word 原生数学公式
      const mathObj = convertLatexToWordMath(formula);

      paragraphs.push(
        createParagraphWithSpacing({
          children: [mathObj],
          alignment: AlignmentType.CENTER,
        })
      );
      console.log('LaTeX 公式已添加到文档（Word 原生公式格式）');
      i++;
      continue;
    }

    // 普通段落
    paragraphs.push(
      createParagraphWithSpacing({
        children: parseMarkdownLine(line),
      })
    );
    i++;
  }

  return {
    paragraphs,
    orderedListId,
  };
}

/**
 * 从URL或base64获取图片数据
 * @param url 图片URL或base64编码
 * @returns ArrayBuffer 或 null
 */
async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    // 处理base64编码的图片
    if (url.startsWith('data:image')) {
      const base64Match = url.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
      if (base64Match) {
        const base64 = base64Match[1];
        return base64ToArrayBuffer(base64);
      }
    }

    // 处理http/https URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('尝试从URL下载图片:', url);

      // 开发环境：使用本地代理
      // @ts-ignore - Vite环境变量
      if (import.meta.env?.DEV) {
        const proxyUrl = `/proxy-image?url=${encodeURIComponent(url)}`;
        console.log('使用本地代理:', proxyUrl);

        const response = await fetch(proxyUrl);
        if (!response.ok) {
          console.error('代理请求失败:', response.status, response.statusText);
          return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log('图片下载成功（代理），大小:', arrayBuffer.byteLength);
        return arrayBuffer;
      }

      // 生产环境：多级备选方案
      // 方案1：直接请求（如果图片服务器支持CORS）
      console.log('生产环境：尝试直接请求');
      try {
        const response = await fetch(url, {
          mode: 'cors',
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          if (arrayBuffer.byteLength > 0) {
            console.log('图片下载成功（直接），大小:', arrayBuffer.byteLength);
            return arrayBuffer;
          }
        }
        console.warn('直接请求失败，状态码:', response.status);
      } catch (error) {
        console.warn('直接请求失败（CORS限制），尝试备用方案:', error);
      }

      // 方案2：使用 wsrv.nl 图片代理服务
      console.log('尝试使用 wsrv.nl 图片代理');
      try {
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);

        if (proxyResponse.ok) {
          const arrayBuffer = await proxyResponse.arrayBuffer();
          if (arrayBuffer.byteLength > 0) {
            console.log('图片下载成功（wsrv.nl代理），大小:', arrayBuffer.byteLength);
            return arrayBuffer;
          }
        }
        console.warn('wsrv.nl代理失败，状态码:', proxyResponse.status);
      } catch (error) {
        console.warn('wsrv.nl代理失败:', error);
      }

      // 方案3：使用 corsproxy.io 通用CORS代理
      console.log('尝试使用 corsproxy.io 代理');
      try {
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);

        if (proxyResponse.ok) {
          const arrayBuffer = await proxyResponse.arrayBuffer();
          if (arrayBuffer.byteLength > 0) {
            console.log('图片下载成功（corsproxy.io代理），大小:', arrayBuffer.byteLength);
            return arrayBuffer;
          }
        }
        console.warn('corsproxy.io代理失败，状态码:', proxyResponse.status);
      } catch (error) {
        console.warn('corsproxy.io代理失败:', error);
      }

      // 方案4：使用 Image + Canvas 方式（最后手段）
      console.log('尝试使用 Image+Canvas 方式获取图片');
      try {
        const arrayBuffer = await fetchImageViaCanvas(url);
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          console.log('图片下载成功（Canvas方式），大小:', arrayBuffer.byteLength);
          return arrayBuffer;
        }
      } catch (error) {
        console.warn('Canvas方式获取失败:', error);
      }

      console.error('所有图片下载方案均失败');
      return null;
    }

    // 不支持的格式
    console.warn('不支持的图片URL格式:', url);
    return null;
  } catch (error) {
    console.error('获取图片失败:', error);
    return null;
  }
}

/**
 * 获取图片的原始尺寸
 * @param buffer 图片数据的 ArrayBuffer
 * @returns 原始宽高 { width, height }
 */
function getImageDimensions(buffer: ArrayBuffer): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    try {
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const result = { width: img.naturalWidth || 400, height: img.naturalHeight || 300 };
        URL.revokeObjectURL(url);
        resolve(result);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        console.warn('无法获取图片原始尺寸，使用默认400x300');
        resolve({ width: 400, height: 300 });
      };

      // 超时保护（5秒）
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve({ width: 400, height: 300 });
      }, 5000);

      img.src = url;
    } catch (error) {
      console.error('获取图片尺寸失败:', error);
      resolve({ width: 400, height: 300 });
    }
  });
}

/**
 * 通过 Image + Canvas 方式获取图片数据
 * 利用浏览器加载图片能力，通过 canvas 导出为 ArrayBuffer
 */
function fetchImageViaCanvas(url: string): Promise<ArrayBuffer | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then(resolve).catch(() => resolve(null));
          } else {
            resolve(null);
          }
        }, 'image/png');
      } catch (error) {
        console.error('Canvas处理失败:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error('图片加载失败:', url);
      resolve(null);
    };

    // 设置超时（10秒）
    setTimeout(() => {
      resolve(null);
    }, 10000);

    img.src = url;
  });
}

/**
 * 将 Markdown 文本转换为 Word 文档 Blob
 * @param markdown Markdown 文本内容
 * @param filename 输出文件名（可选，默认为 'document.docx'）
 * @returns Promise<Blob> Word 文档的 Blob 对象
 * @throws Error 当转换过程中出现错误时抛出异常
 */
export async function convertMarkdownToWord(
  markdown: string,
  _filename: string = 'document.docx'
): Promise<Blob> {
  try {
    if (!markdown || typeof markdown !== 'string') {
      throw new Error('Markdown 内容不能为空');
    }

    // 解析 Markdown 为段落数组（异步）
    const { paragraphs, orderedListId } = await parseMarkdownToParagraphs(markdown);

    // 创建文档，为每个独立的列表创建numbering配置
    const numberingConfigs = [];
    for (let i = 1; i <= orderedListId; i++) {
      numberingConfigs.push({
        reference: `ordered-list-${i}`,
        levels: [
          {
            level: 0,
            format: 'decimal' as const,
            text: '%1.',
            alignment: AlignmentType.START,
          },
        ],
      });
    }

    console.log('创建的numbering配置数量:', numberingConfigs.length);

    const doc = new Document({
      numbering: {
        config: numberingConfigs,
      },
      sections: [
        {
          properties: {},
          children: paragraphs as any,
        },
      ],
    });

    // 生成 Blob
    const blob = await Packer.toBlob(doc);

    return blob;
  } catch (error) {
    console.error('Markdown 转 Word 失败:', error);
    throw new Error(`Markdown 转 Word 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 将 Markdown 文本转换为 Word 文档并触发下载
 * @param markdown Markdown 文本内容
 * @param filename 输出文件名（可选）
 * @returns Promise<void>
 */
export async function downloadMarkdownAsWord(
  markdown: string,
  filename: string = 'document.docx'
): Promise<void> {
  try {
    const blob = await convertMarkdownToWord(markdown, filename);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载 Word 文档失败:', error);
    throw error;
  }
}