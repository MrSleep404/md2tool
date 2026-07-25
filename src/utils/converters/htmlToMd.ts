/**
 * HTML 转 Markdown 工具函数
 * 使用 turndown 库将 HTML 转换为 Markdown，清理样式和布局标记
 */

import TurndownService from 'turndown';

/**
 * 创建配置好的 Turndown 实例
 */
function createTurndownService(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx', // 使用 # 风格的标题
    codeBlockStyle: 'fenced', // 使用 ``` 风格的代码块
    bulletListMarker: '-', // 无序列表使用 - 符号
    emDelimiter: '*', // 斜体使用 * 符号
    strongDelimiter: '**', // 粗体使用 ** 符号
  });

  // 添加自定义规则：处理 strikethrough（删除线）
  turndownService.addRule('strikethrough', {
    filter: ['del', 's'],
    replacement: (content: string) => `~~${content}~~`,
  });

  // 添加自定义规则：处理任务列表
  turndownService.addRule('taskList', {
    filter: (node: HTMLElement) => {
      return (
        node.nodeName === 'INPUT' &&
        node.getAttribute('type') === 'checkbox' &&
        node.parentNode?.nodeName === 'LI'
      );
    },
    replacement: (_content: string, node: TurndownService.Node) => {
      const input = node as HTMLInputElement;
      return input.checked ? '[x] ' : '[ ] ';
    },
  });

  // 添加自定义规则：处理表格（Turndown 默认支持，但可以增强）
  turndownService.addRule('table', {
    filter: 'table',
    replacement: (content: string, node: TurndownService.Node) => {
      const table = node as HTMLTableElement;
      const rows = Array.from(table.querySelectorAll('tr'));

      if (rows.length === 0) return content;

      let markdown = '';

      rows.forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        const cellContents = cells.map(cell => cell.textContent?.trim() || '');

        markdown += '| ' + cellContents.join(' | ') + ' |\n';

        // 添加表头分隔线
        if (rowIndex === 0 && row.querySelector('th')) {
          markdown += '|' + cellContents.map(() => '---').join('|') + '|\n';
        }
      });

      return '\n' + markdown + '\n';
    },
  });

  // 添加自定义规则：处理代码块中的语言标识
  turndownService.addRule('codeBlockWithLanguage', {
    filter: (node: HTMLElement) => {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild?.nodeName === 'CODE'
      );
    },
    replacement: (content: string, node: TurndownService.Node) => {
      const pre = node as HTMLPreElement;
      const code = pre.querySelector('code');

      if (!code) return '```\n' + content + '\n```\n';

      // 尝试从 class 中提取语言标识（例如 class="language-javascript"）
      const classMatch = code.className.match(/language-(\w+)/);
      const language = classMatch ? classMatch[1] : '';

      const codeContent = code.textContent || '';

      return '\n```' + language + '\n' + codeContent + '\n```\n';
    },
  });

  return turndownService;
}

/**
 * 清理 HTML 内容，移除不必要的样式和布局标记
 * @param html 原始 HTML 字符串
 * @returns 清理后的 HTML 字符串
 */
function cleanHtml(html: string): string {
  let cleaned = html;

  // 移除 <style> 标签及其内容
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // 移除内联样式
  cleaned = cleaned.replace(/\s*style="[^"]*"/gi, '');

  // 移除 <script> 标签及其内容
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // 移除注释
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // 移除一些常见的无用标签
  cleaned = cleaned.replace(/<\/?(div|span|section|article|aside|header|footer|nav|main|figure|figcaption|details|summary)[^>]*>/gi, '');

  // 移除空行（多个连续换行符压缩为两个）
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

/**
 * 将 HTML 字符串转换为 Markdown 文本
 * @param html HTML 字符串
 * @param options 可选配置项
 * @param options.cleanHtml 是否在转换前清理 HTML（默认为 true）
 * @returns Promise<string> 转换后的 Markdown 文本
 * @throws Error 当转换过程中出现错误时抛出异常
 */
export async function convertHtmlToMarkdown(
  html: string,
  options: { cleanHtml?: boolean } = {}
): Promise<string> {
  try {
    // 验证输入
    if (!html || typeof html !== 'string') {
      throw new Error('HTML 内容不能为空');
    }

    const { cleanHtml: shouldClean = true } = options;

    // 清理 HTML（可选）
    const processedHtml = shouldClean ? cleanHtml(html) : html;

    // 创建 Turndown 实例
    const turndownService = createTurndownService();

    // 转换为 Markdown
    const markdown = turndownService.turndown(processedHtml);

    // 后处理：优化 Markdown 格式
    const optimizedMarkdown = optimizeMarkdown(markdown);

    return optimizedMarkdown;
  } catch (error) {
    console.error('HTML 转 Markdown 失败:', error);
    throw new Error(`HTML 转 Markdown 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 优化 Markdown 文本格式
 * @param markdown 原始 Markdown 文本
 * @returns 优化后的 Markdown 文本
 */
function optimizeMarkdown(markdown: string): string {
  let optimized = markdown;

  // 移除多余的空行（保留最多一个空行）
  optimized = optimized.replace(/\n{3,}/g, '\n\n');

  // 移除行尾空格
  optimized = optimized.split('\n').map(line => line.trimEnd()).join('\n');

  // 确保文件末尾只有一个换行符
  optimized = optimized.trimEnd() + '\n';

  // 修复列表项前后的空行问题
  optimized = optimized.replace(/(\n[-*+]\s)/g, '\n$1');

  return optimized;
}

/**
 * 同步版本的 HTML 转 Markdown
 * @param html HTML 字符串
 * @param options 可选配置项
 * @returns Markdown 字符串
 */
export function convertHtmlToMarkdownSync(
  html: string,
  options: { cleanHtml?: boolean } = {}
): string {
  try {
    if (!html || typeof html !== 'string') {
      throw new Error('HTML 内容不能为空');
    }

    const { cleanHtml: shouldClean = true } = options;
    const processedHtml = shouldClean ? cleanHtml(html) : html;

    const turndownService = createTurndownService();
    const markdown = turndownService.turndown(processedHtml);

    return optimizeMarkdown(markdown);
  } catch (error) {
    console.error('HTML 转 Markdown 失败:', error);
    throw new Error(`HTML 转 Markdown 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 从 URL 加载 HTML 并转换为 Markdown
 * @param url HTML 页面的 URL
 * @param options 可选配置项
 * @returns Promise<string> 转换后的 Markdown 文本
 */
export async function convertUrlToMarkdown(
  url: string,
  options: { cleanHtml?: boolean } = {}
): Promise<string> {
  try {
    // 发起请求获取 HTML
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // 转换为 Markdown
    return convertHtmlToMarkdown(html, options);
  } catch (error) {
    console.error('URL 转 Markdown 失败:', error);
    throw new Error(`URL 转 Markdown 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}