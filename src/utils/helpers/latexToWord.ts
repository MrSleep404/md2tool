/**
 * LaTeX 转 Word 数学公式转换器
 * 使用 docx 库的 Math API 创建原生 Word 数学公式
 * 支持：积分、求和、分数、根号、上下标、希腊字母等
 */

import {
  Math as DocxMath,
  MathRun,
  MathFraction,
  MathRadical,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
  MathSum,
  MathIntegral,
} from 'docx';
import type { MathComponent } from 'docx';

/**
 * LaTeX 数学节点类型（中间表示）
 */
type MathNode =
  | { type: 'text'; content: string }
  | { type: 'group'; children: MathNode[] }
  | { type: 'sup'; base: MathNode[]; sup: MathNode[] }
  | { type: 'sub'; base: MathNode[]; sub: MathNode[] }
  | { type: 'subsup'; base: MathNode[]; sub: MathNode[]; sup: MathNode[] }
  | { type: 'frac'; numerator: MathNode[]; denominator: MathNode[] }
  | { type: 'sqrt'; children: MathNode[]; degree?: MathNode[] }
  | { type: 'integral'; children: MathNode[]; sub?: MathNode[]; sup?: MathNode[] }
  | { type: 'sum'; children: MathNode[]; sub?: MathNode[]; sup?: MathNode[] };

/**
 * LaTeX 命令到 Unicode 符号映射
 */
const LATEX_SYMBOLS: Record<string, string> = {
  // 希腊字母（小写）
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', varpi: 'ϖ',
  rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ',
  phi: 'φ', varphi: 'ϕ', chi: 'χ', psi: 'ψ', omega: 'ω',
  // 希腊字母（大写）
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
  Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  // 数学符号
  infty: '∞', partial: '∂', nabla: '∇', pm: '±', mp: '∓', times: '×', div: '÷',
  cdot: '·', cdots: '⋯', ldots: '…', vdots: '⋮', ddots: '⋱',
  neq: '≠', leq: '≤', geq: '≥', le: '≤', ge: '≥', approx: '≈', equiv: '≡',
  sim: '∼', propto: '∝', forall: '∀', exists: '∃', nexists: '∄',
  in: '∈', notin: '∉', ni: '∋', subset: '⊂', supset: '⊃',
  subseteq: '⊆', supseteq: '⊇', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅',
  rightarrow: '→', leftarrow: '←', leftrightarrow: '↔',
  Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', mapsto: '↦',
  uparrow: '↑', downarrow: '↓', updownarrow: '↕',
  langle: '⟨', rangle: '⟩', ell: 'ℓ', hbar: 'ℏ', Re: 'ℜ', Im: 'ℑ', aleph: 'ℵ',
  degree: '°', circ: '∘', bullet: '•', star: '⋆', dagger: '†', ddagger: '‡',
  prime: '′', flat: '♭', natural: '♮', sharp: '♯', ast: '∗',
  otimes: '⊗', oplus: '⊕', odot: '⊙', ominus: '⊖', oslash: '⊘',
  triangle: '△', triangleleft: '◃', triangleright: '▹',
  square: '□', diamond: '◇', bigcirc: '◯', lozenge: '◊',
  angle: '∠', perp: '⊥', parallel: '∥', mid: '∣', nmid: '∤',
  // 大运算符（作为符号时的 fallback）
  int: '∫', oint: '∮', iint: '∬', iiint: '∭',
  sum: '∑', prod: '∏', coprod: '∐',
  bigcap: '⋂', bigcup: '⋃', bigvee: '⋁', bigwedge: '⋀',
  bigoplus: '⨁', bigotimes: '⨂', bigodot: '⨀',
};

/**
 * LaTeX 解析器
 * 将 LaTeX 字符串解析为 MathNode 中间表示
 */
class LatexParser {
  private pos = 0;

  constructor(private input: string) {}

  /**
   * 解析 LaTeX 公式，返回 MathNode 数组
   */
  parse(): MathNode[] {
    return this.parseUntil('');
  }

  /**
   * 解析直到遇到 stopChars 中的字符
   * @param stopChars 停止字符集（如 '}' 或 ']'）
   * @returns 解析出的 MathNode 数组
   */
  private parseUntil(stopChars: string): MathNode[] {
    const nodes: MathNode[] = [];
    let textBuffer = '';

    const flushText = () => {
      if (textBuffer) {
        nodes.push({ type: 'text', content: textBuffer });
        textBuffer = '';
      }
    };

    while (this.pos < this.input.length) {
      const char = this.input[this.pos];

      if (stopChars.includes(char)) break;

      if (char === '\\') {
        flushText();
        const node = this.parseCommand();
        if (node) nodes.push(node);
      } else if (char === '{') {
        flushText();
        this.pos++; // 跳过 {
        const children = this.parseUntil('}');
        if (this.pos < this.input.length) this.pos++; // 跳过 }
        nodes.push({ type: 'group', children });
      } else if (char === '^') {
        flushText();
        this.pos++; // 跳过 ^
        const sup = this.parseScriptContent();
        this.applyScript(nodes, 'sup', sup);
      } else if (char === '_') {
        flushText();
        this.pos++; // 跳过 _
        const sub = this.parseScriptContent();
        this.applyScript(nodes, 'sub', sub);
      } else if (char === '}') {
        break;
      } else {
        textBuffer += char;
        this.pos++;
      }
    }
    flushText();
    return nodes;
  }

  /**
   * 解析脚本内容（上标或下标的内容）
   * 支持 {...} 分组和单字符/单命令
   */
  private parseScriptContent(): MathNode[] {
    // 跳过前导空格
    while (this.pos < this.input.length && this.input[this.pos] === ' ') {
      this.pos++;
    }

    if (this.input[this.pos] === '{') {
      this.pos++; // 跳过 {
      const children = this.parseUntil('}');
      if (this.pos < this.input.length) this.pos++; // 跳过 }
      return children;
    }

    if (this.input[this.pos] === '\\') {
      const node = this.parseCommand();
      return node ? [node] : [];
    }

    // 单个字符
    const char = this.input[this.pos];
    if (char) {
      this.pos++;
      return [{ type: 'text', content: char }];
    }
    return [];
  }

  /**
   * 解析分组 {...}（用于 \frac 和 \sqrt 的参数）
   */
  private parseGroup(): MathNode[] {
    while (this.pos < this.input.length && this.input[this.pos] === ' ') {
      this.pos++;
    }

    if (this.input[this.pos] === '{') {
      this.pos++; // 跳过 {
      const children = this.parseUntil('}');
      if (this.pos < this.input.length) this.pos++; // 跳过 }
      return children;
    }

    if (this.input[this.pos] === '\\') {
      const node = this.parseCommand();
      return node ? [node] : [];
    }

    const char = this.input[this.pos];
    if (char) {
      this.pos++;
      return [{ type: 'text', content: char }];
    }
    return [];
  }

  /**
   * 解析 LaTeX 命令（以 \ 开头）
   */
  private parseCommand(): MathNode | null {
    this.pos++; // 跳过 \
    const cmd = this.readCommandName();

    switch (cmd) {
      case 'frac': {
        // \frac{分子}{分母}
        const numerator = this.parseGroup();
        const denominator = this.parseGroup();
        return { type: 'frac', numerator, denominator };
      }
      case 'dfrac':
      case 'tfrac': {
        // \dfrac 和 \tfrac 同 \frac
        const numerator = this.parseGroup();
        const denominator = this.parseGroup();
        return { type: 'frac', numerator, denominator };
      }
      case 'sqrt': {
        // \sqrt{x} 或 \sqrt[n]{x}
        let degree: MathNode[] | undefined;
        while (this.pos < this.input.length && this.input[this.pos] === ' ') {
          this.pos++;
        }
        if (this.input[this.pos] === '[') {
          this.pos++; // 跳过 [
          degree = this.parseUntil(']');
          if (this.pos < this.input.length) this.pos++; // 跳过 ]
        }
        const children = this.parseGroup();
        return { type: 'sqrt', children, degree };
      }
      case 'int':
      case 'oint':
      case 'iint':
      case 'iiint': {
        // 积分符号，上下标后续由 applyScript 处理
        return { type: 'integral', children: [] };
      }
      case 'sum':
      case 'prod':
      case 'coprod':
      case 'bigcap':
      case 'bigcup':
      case 'bigvee':
      case 'bigwedge':
      case 'bigoplus':
      case 'bigotimes':
      case 'bigodot': {
        // 大运算符，上下标后续由 applyScript 处理
        return { type: 'sum', children: [] };
      }
      case 'left': {
        // \left( \left[ 等 - 读取下一个字符/命令
        if (this.input[this.pos] === '\\') {
          return this.parseCommand();
        }
        const char = this.input[this.pos];
        if (char) {
          this.pos++;
          // \left. 不可见括号
          if (char === '.') return null;
          return { type: 'text', content: char };
        }
        return null;
      }
      case 'right': {
        if (this.input[this.pos] === '\\') {
          return this.parseCommand();
        }
        const char = this.input[this.pos];
        if (char) {
          this.pos++;
          if (char === '.') return null;
          return { type: 'text', content: char };
        }
        return null;
      }
      case 'quad':
        return { type: 'text', content: '  ' };
      case 'qquad':
        return { type: 'text', content: '    ' };
      case ',': case ':': case ';':
        return { type: 'text', content: ' ' };
      case '!':
        return null; // 负间距，忽略
      case ' ':
        return { type: 'text', content: ' ' };
      case 'displaystyle':
      case 'textstyle':
      case 'scriptstyle':
      case 'scriptscriptstyle':
      case 'limits':
      case 'nolimits':
      case 'mathbf':
      case 'mathit':
      case 'mathsf':
      case 'mathtt':
      case 'mathcal':
      case 'mathbb':
      case 'mathfrak':
        // 样式命令：跳过，解析其后的分组内容
        return this.parseGroup()[0] || null;
      case 'text':
      case 'mathrm':
      case 'operatorname':
        // 文本内容
        const textContent = this.parseGroup();
        return { type: 'text', content: textContent.map(n => n.type === 'text' ? n.content : '').join('') };
      default: {
        // 查找符号映射
        if (LATEX_SYMBOLS[cmd]) {
          return { type: 'text', content: LATEX_SYMBOLS[cmd] };
        }
        // 未知命令，保留原始命令作为文本
        return { type: 'text', content: `\\${cmd}` };
      }
    }
  }

  /**
   * 读取命令名（字母序列或单字符命令）
   */
  private readCommandName(): string {
    let name = '';
    // 命令名是字母序列
    while (this.pos < this.input.length && /[a-zA-Z]/.test(this.input[this.pos])) {
      name += this.input[this.pos];
      this.pos++;
    }
    if (name === '') {
      // 非字母命令（如 \, \; \! \{ 等）
      const char = this.input[this.pos];
      if (char) {
        name = char;
        this.pos++;
      }
    }
    return name;
  }

  /**
   * 应用上标或下标到节点列表的最后一个节点
   * @param nodes 当前节点列表
   * @param type 'sub' 或 'sup'
   * @param content 脚本内容
   */
  private applyScript(nodes: MathNode[], type: 'sub' | 'sup', content: MathNode[]) {
    if (nodes.length === 0) {
      // 没有前驱节点，将 _ 或 ^ 作为文本
      nodes.push({ type: 'text', content: type === 'sub' ? '_' : '^' });
      nodes.push(...content);
      return;
    }

    const lastNode = nodes[nodes.length - 1];

    // 如果是 integral 或 sum，设置其 subScript/superScript
    if (lastNode.type === 'integral' || lastNode.type === 'sum') {
      if (type === 'sub') {
        (lastNode as { sub?: MathNode[] }).sub = content;
      } else {
        (lastNode as { sup?: MathNode[] }).sup = content;
      }
      return;
    }

    // 如果前一个节点已经是 sup/sub，合并为 subsup
    if (lastNode.type === 'sup' && type === 'sub') {
      nodes[nodes.length - 1] = {
        type: 'subsup',
        base: lastNode.base,
        sub: content,
        sup: lastNode.sup,
      };
      return;
    }
    if (lastNode.type === 'sub' && type === 'sup') {
      nodes[nodes.length - 1] = {
        type: 'subsup',
        base: lastNode.base,
        sub: lastNode.sub,
        sup: content,
      };
      return;
    }

    // 创建新的 sup/sub 节点，前一个节点作为 base
    nodes.pop();
    if (type === 'sub') {
      nodes.push({ type: 'sub', base: [lastNode], sub: content });
    } else {
      nodes.push({ type: 'sup', base: [lastNode], sup: content });
    }
  }
}

/**
 * 将 MathNode 数组转换为 docx MathComponent 数组
 */
function mathNodesToComponents(nodes: MathNode[]): MathComponent[] {
  const components: MathComponent[] = [];
  for (const node of nodes) {
    if (node.type === 'group') {
      // 分组：展开子节点到当前组件列表
      components.push(...mathNodesToComponents(node.children));
    } else {
      const comp = mathNodeToComponent(node);
      if (comp) components.push(comp);
    }
  }
  return components;
}

/**
 * 将单个 MathNode 转换为 docx MathComponent
 */
function mathNodeToComponent(node: MathNode): MathComponent | null {
  switch (node.type) {
    case 'text':
      return new MathRun(node.content);
    case 'group':
      // group 已在 mathNodesToComponents 中展开
      return null;
    case 'sup':
      return new MathSuperScript({
        children: mathNodesToComponents(node.base),
        superScript: mathNodesToComponents(node.sup),
      });
    case 'sub':
      return new MathSubScript({
        children: mathNodesToComponents(node.base),
        subScript: mathNodesToComponents(node.sub),
      });
    case 'subsup':
      return new MathSubSuperScript({
        children: mathNodesToComponents(node.base),
        subScript: mathNodesToComponents(node.sub),
        superScript: mathNodesToComponents(node.sup),
      });
    case 'frac':
      return new MathFraction({
        numerator: mathNodesToComponents(node.numerator),
        denominator: mathNodesToComponents(node.denominator),
      });
    case 'sqrt':
      return new MathRadical({
        children: mathNodesToComponents(node.children),
        ...(node.degree ? { degree: mathNodesToComponents(node.degree) } : {}),
      });
    case 'integral':
      return new MathIntegral({
        children: mathNodesToComponents(node.children),
        ...(node.sub ? { subScript: mathNodesToComponents(node.sub) } : {}),
        ...(node.sup ? { superScript: mathNodesToComponents(node.sup) } : {}),
      });
    case 'sum':
      return new MathSum({
        children: mathNodesToComponents(node.children),
        ...(node.sub ? { subScript: mathNodesToComponents(node.sub) } : {}),
        ...(node.sup ? { superScript: mathNodesToComponents(node.sup) } : {}),
      });
    default:
      return null;
  }
}

/**
 * 将 LaTeX 公式转换为 Word 数学公式对象
 * 使用 docx 库的 Math API 创建原生 Word 数学公式
 * @param latex LaTeX 公式字符串
 * @returns DocxMath 对象
 */
export function convertLatexToWordMath(latex: string): DocxMath {
  const parser = new LatexParser(latex);
  const nodes = parser.parse();
  const components = mathNodesToComponents(nodes);
  return new DocxMath({ children: components });
}
