/**
 * LaTeX 转 Word 数学公式转换器
 * 使用 docx 库的 Math API
 */

import {
  Math as DocxMath,
  MathRun,
  MathFraction,
  MathRadical,
  MathSuperScript,
  MathSubScript,
  MathSum,
  MathIntegral,
  MathFunction,
} from 'docx';

/**
 * 将 LaTeX 公式转换为更友好的显示格式
 * @param latex LaTeX 公式字符串
 * @returns 格式化后的文本
 */
function formatLatexForDisplay(latex: string): string {
  let result = latex;

  // 常见的LaTeX符号转换
  const replacements: Record<string, string> = {
    '\\int': '∫',
    '\\sum': '∑',
    '\\prod': '∏',
    '\\sqrt': '√',
    '\\pm': '±',
    '\\times': '×',
    '\\div': '÷',
    '\\cdot': '·',
    '\\neq': '≠',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\approx': '≈',
    '\\infty': '∞',
    '\\pi': 'π',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\theta': 'θ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\sigma': 'σ',
    '\\omega': 'ω',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\forall': '∀',
    '\\exists': '∃',
    '\\in': '∈',
    '\\notin': '∉',
    '\\subset': '⊂',
    '\\supset': '⊃',
    '\\cup': '∪',
    '\\cap': '∩',
    '\\emptyset': '∅',
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\leftrightarrow': '↔',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\Leftrightarrow': '⇔',
    '\\ldots': '...',
    '\\cdots': '···',
    '\\vdots': '⋮',
    '\\ddots': '⋱',
  };

  // 替换LaTeX命令为Unicode符号
  for (const [latexCmd, symbol] of Object.entries(replacements)) {
    result = result.replace(new RegExp(latexCmd.replace(/\\/g, '\\\\'), 'g'), symbol);
  }

  // 处理上标 ^{...}
  result = result.replace(/\^{([^}]+)}/g, (_, content) => {
    // 将上标内容转换为上标字符（简化处理）
    return `^${content}`;
  });

  // 处理下标 _{...}
  result = result.replace(/_{([^}]+)}/g, (_, content) => {
    // 将下标内容转换为下标字符（简化处理）
    return `_${content}`;
  });

  // 处理分数 \frac{a}{b}
  result = result.replace(/\\frac{([^}]+)}{([^}]+)}/g, (_, num, den) => {
    return `${num}/${den}`;
  });

  // 移除其他LaTeX命令（保留文本）
  result = result.replace(/\\[a-zA-Z]+/g, '');
  result = result.replace(/[{}]/g, '');

  return result.trim();
}

/**
 * 将 LaTeX 公式转换为 Word 数学公式对象
 * @param latex LaTeX 公式字符串
 * @returns DocxMath 对象
 */
export function convertLatexToWordMath(latex: string): DocxMath {
  // 格式化LaTeX为更友好的显示
  const formattedLatex = formatLatexForDisplay(latex);

  // 使用 MathRun 创建数学文本
  const mathRun = new MathRun(formattedLatex);

  // 创建 Math 对象，包含 MathRun
  return new DocxMath({
    children: [mathRun],
  });
}

/**
 * 解析简单的分数表达式
 * @param numerator 分子
 * @param denominator 分母
 * @returns MathFraction 对象
 */
export function createFraction(numerator: string, denominator: string): MathFraction {
  return new MathFraction({
    numerator: [new MathRun(numerator)],
    denominator: [new MathRun(denominator)],
  });
}

/**
 * 创建根号表达式
 * @param content 内容
 * @param degree 根次数（可选，默认为平方根）
 * @returns MathRadical 对象
 */
export function createRadical(content: string, degree?: string): MathRadical {
  return new MathRadical({
    children: [new MathRun(content)],
    degree: degree ? [new MathRun(degree)] : undefined,
  });
}

/**
 * 创建上标表达式
 * @param base 基础文本
 * @param superScript 上标
 * @returns MathSuperScript 对象
 */
export function createSuperScript(base: string, superScript: string): MathSuperScript {
  return new MathSuperScript({
    children: [new MathRun(base)],
    superScript: [new MathRun(superScript)],
  });
}

/**
 * 创建求和表达式
 * @param subScript 下标
 * @param superScript 上标
 * @returns MathSum 对象
 */
export function createSum(subScript: string, superScript: string): MathSum {
  return new MathSum({
    children: [],
    subScript: [new MathRun(subScript)],
    superScript: [new MathRun(superScript)],
  });
}

/**
 * 创建积分表达式
 * @param subScript 下标
 * @param superScript 上标
 * @returns MathIntegral 对象
 */
export function createIntegral(subScript: string, superScript: string): MathIntegral {
  return new MathIntegral({
    children: [],
    subScript: [new MathRun(subScript)],
    superScript: [new MathRun(superScript)],
  });
}