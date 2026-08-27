import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  FileCode,
  FileDown,
  FileSpreadsheet,
  FileType,
  FileJson,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ChevronDown,
} from 'lucide-react'
import { useSEO, SEO_CONFIGS } from '../utils/seo'

/**
 * 操作说明页面：新手教程 + FAQ
 */

// 各工具的入口配置
const TOOL_LINKS = [
  {
    to: '/',
    icon: FileText,
    title: 'Markdown 转 Word',
    description: '粘贴 Markdown，一键转换为 Word 文档（DOCX）',
  },
  {
    to: '/word-to-markdown',
    icon: FileType,
    title: 'Word 转 Markdown',
    description: '上传 .docx 文件，一键转换为 Markdown 文本',
  },
  {
    to: '/markdown-to-html',
    icon: FileCode,
    title: 'Markdown 转 HTML',
    description: '粘贴 Markdown，实时预览并导出 HTML 代码',
  },
  {
    to: '/html-to-markdown',
    icon: FileJson,
    title: 'HTML 转 Markdown',
    description: '粘贴 HTML 代码，转换为干净的 Markdown 文本',
  },
  {
    to: '/markdown-to-pdf',
    icon: FileDown,
    title: 'Markdown 转 PDF',
    description: '将 Markdown 文档渲染为高质量 PDF 文件',
  },
  {
    to: '/markdown-to-excel',
    icon: FileSpreadsheet,
    title: 'Markdown 转 Excel',
    description: '将 Markdown 表格转换为 Excel（XLSX）文件',
  },
]

// 新手教程步骤
const TUTORIAL_STEPS = [
  {
    step: 1,
    title: '选择转换工具',
    content: (
      <>
        在<Link to="/" className="text-blue-600 hover:underline">首页</Link>
        点击您需要的转换方向卡片（如「Word 转 Markdown」），进入对应的工具页面。MD2Tool 提供
        Word、HTML、PDF、Excel 与 Markdown 之间的互转，所有转换均在浏览器本地完成。
      </>
    ),
  },
  {
    step: 2,
    title: '输入您的内容',
    content: (
      <>
        根据工具类型选择输入方式：<strong>文本类工具</strong>（Markdown/HTML 相关）直接在左侧编辑器中粘贴或输入内容；
        <strong>文件类工具</strong>（Word 转 Markdown）点击上传区域或把 .docx 文件拖拽进去即可。
        支持的文件格式为 .docx（旧版 .doc 请先用 Word 另存为 .docx）。
      </>
    ),
  },
  {
    step: 3,
    title: '查看实时预览',
    content: (
      <>
        输入内容后，右侧会实时显示转换结果预览。Markdown 相关工具的编辑区与预览区支持同步滚动，
        方便对照检查。如果预览效果不对，可回到左侧修改内容。
      </>
    ),
  },
  {
    step: 4,
    title: '导出或复制结果',
    content: (
      <>
        确认无误后，点击「转换」或「下载」按钮即可导出文件（DOCX / HTML / PDF / XLSX），
        文本类结果也可以直接点击「复制」按钮复制到剪贴板。整个过程无需注册、不限次数。
      </>
    ),
  },
]

// FAQ 数据
const FAQS = [
  {
    q: '使用 MD2Tool 需要注册或付费吗？',
    a: '不需要。MD2Tool 完全免费，无需注册登录，也没有次数限制，打开网页即可使用。',
  },
  {
    q: '我的文件会被上传到服务器吗？',
    a: '不会。所有转换都在您的浏览器本地完成，文件内容不会上传、不会存储，关闭页面后临时数据自动清除，请放心使用。',
  },
  {
    q: 'Word 转 Markdown 时，公式和图片能保留吗？',
    a: '支持。LaTeX 公式会转换为 Markdown 中的 LaTeX 语法（$...$ / $$...$$），图片会自动提取并以 Base64 或引用形式嵌入。个别复杂排版（如文本框、艺术字）可能无法完美还原，建议转换后检查预览效果。',
  },
  {
    q: '为什么 .doc 格式的 Word 文件无法上传？',
    a: '目前仅支持 .docx 格式（Office 2007 及以上）。如果您的文件是旧版 .doc，请先用 Word 或 WPS 打开，选择「另存为」并保存为 .docx 格式后再上传。',
  },
  {
    q: 'Markdown 转 PDF 时代码块显示为图片是怎么回事？',
    a: '为了让 PDF 中的代码块保持完整并避免跨页时被截断，工具会把较长的代码块渲染为图片，这是预期行为，不影响内容。',
  },
  {
    q: 'Markdown 转 Excel 对表格语法有要求吗？',
    a: '需要使用标准 Markdown 表格语法（第二行使用 | --- | 分隔表头与表体）。工具会把每个表格导出为一个工作表；如果文档中没有表格，将无法导出有效内容。',
  },
  {
    q: '转换结果出现乱码或格式错乱怎么办？',
    a: '请先确认源文件内容完整且格式标准；也可以尝试减少单次转换的内容量。如果问题仍然存在，欢迎通过「联系我们」页面反馈，附上出现问题的内容片段，我们会尽快修复。',
  },
  {
    q: '支持哪些 Markdown 扩展语法？',
    a: '支持标准 Markdown 语法，以及表格、代码块（含语法高亮）、LaTeX 数学公式、Mermaid 图表、任务列表等常用扩展语法。',
  },
]

export default function Help() {
  // 设置SEO
  useSEO(SEO_CONFIGS.help)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">操作说明</h1>
          <p className="text-gray-600 leading-relaxed mb-10">
            本页介绍 MD2Tool 各转换工具的使用方法。如果您是第一次使用，建议先阅读下方的新手教程；
            遇到问题时可以查看常见问题解答（FAQ）。
          </p>

          {/* 快速导航：各工具入口 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">转换工具一览</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOL_LINKS.map((tool) => (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <tool.icon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{tool.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 新手教程 */}
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">新手教程</h2>
            </div>
            <p className="text-gray-600 mb-6">
              四步完成一次转换，流程对所有工具通用：
            </p>
            <ol className="space-y-6">
              {TUTORIAL_STEPS.map(({ step, title, content }) => (
                <li key={step} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 leading-relaxed">{content}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 使用技巧 */}
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">使用技巧</h2>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>数学公式使用 LaTeX 语法：行内公式用 <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">$...$</code>，独立公式用 <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">$$...$$</code>。</span>
              </li>
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>代码块使用三个反引号标注语言（如 <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">```python</code>），可获得语法高亮。</span>
              </li>
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>Mermaid 图表用 <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">```mermaid</code> 代码块编写，可自动渲染为流程图、时序图等。</span>
              </li>
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>Word 转 Markdown 前，建议先在 Word 中清理多余的手动换行和空格，转换结果会更干净。</span>
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section>
            <div className="flex items-center space-x-2 mb-6">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">常见问题（FAQ）</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-lg border border-gray-200 open:bg-gray-50"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none px-5 py-4 text-left font-medium text-gray-900 select-none">
                    <span>{faq.q}</span>
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 底部引导 */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              还有其他问题？欢迎通过{' '}
              <Link to="/contact" className="text-blue-600 hover:underline">
                联系我们
              </Link>{' '}
              反馈，或先到{' '}
              <Link to="/" className="text-blue-600 hover:underline">
                首页
              </Link>{' '}
              试试具体工具。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
