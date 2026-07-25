import { useState, useEffect, useRef } from 'react'
import { FileCode, FileText, Copy, Download, CheckCircle, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import { convertHtmlToMarkdown } from '../utils/converters/htmlToMd'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'

/**
 * HTML 转 Markdown 页面
 */
export default function HtmlToMarkdown() {
  const [html, setHtml] = useState<string>('')
  const [markdown, setMarkdown] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const isInitialized = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步滚动
  const htmlEditorScrollRef = useRef<HTMLTextAreaElement>(null)
  const markdownPreviewScrollRef = useRef<HTMLPreElement>(null)
  const { enabled: syncScrollEnabled, toggle: toggleSyncScroll } = useSyncScrollState(false)
  useSyncScroll(htmlEditorScrollRef, markdownPreviewScrollRef, syncScrollEnabled)

  // 示例 HTML
  const exampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>示例文档</title>
</head>
<body>
  <h1>HTML 转 Markdown 工具</h1>
  <p>这是一个用于将 <strong>HTML</strong> 转换为 <em>Markdown</em> 的工具。</p>

  <h2>功能特点</h2>
  <ul>
    <li>支持标准 HTML 标签</li>
    <li>自动清理样式和脚本</li>
    <li>实时转换预览</li>
  </ul>

  <h3>代码示例</h3>
  <pre><code>const greeting = "Hello, World!";</code></pre>

  <blockquote>
    <p>这是一个引用块的示例</p>
  </blockquote>

  <table>
    <thead>
      <tr>
        <th>功能</th>
        <th>支持</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>标题</td>
        <td>✅</td>
      </tr>
      <tr>
        <td>列表</td>
        <td>✅</td>
      </tr>
    </tbody>
  </table>

  <p><a href="https://example.com">了解更多信息</a></p>
</body>
</html>`

  // 初始化示例内容
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      setHtml(exampleHtml)
    }
  }, [])

  // 实时转换 Markdown
  useEffect(() => {
    const convertToMarkdown = async () => {
      if (!html) {
        setMarkdown('')
        return
      }

      try {
        const md = await convertHtmlToMarkdown(html, { cleanHtml: true })
        setMarkdown(md)
      } catch (err) {
        console.error('转换失败:', err)
      }
    }

    convertToMarkdown()
  }, [html])

  // 复制 Markdown
  const handleCopy = async () => {
    if (!markdown) return

    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setHtml(content)
      setError(null)
    }
    reader.onerror = () => {
      setError('文件读取失败，请重试')
    }
    reader.readAsText(file)

    // 重置 input 以便可以再次选择同一个文件
    if (event.target) {
      event.target.value = ''
    }
  }

  // 加载示例内容
  const handleLoadExample = () => {
    setHtml(exampleHtml)
    setError(null)
  }

  // 清除内容
  const handleClear = () => {
    setHtml('')
    setMarkdown('')
    setError(null)
  }

  // 下载 Markdown 文件
  const handleDownload = () => {
    if (!markdown) return

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, 'converted.md')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 区域 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <FileCode className="h-12 w-12" />
              <h1 className="text-4xl font-bold">HTML 转 Markdown</h1>
            </div>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              将 HTML 代码转换为简洁的 Markdown 格式，支持实时预览
            </p>
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 工具栏 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* 左侧按钮组 */}
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="上传HTML文件 (.html, .htm)"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">上传 HTML 文件或代码段</span>
            </button>

            <button
              onClick={handleLoadExample}
              title="加载示例内容"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">示例内容</span>
            </button>

            <button
              onClick={handleClear}
              title="清除所有内容"
              disabled={!html}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                !html
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">清除内容</span>
            </button>
          </div>

          {/* 右侧按钮组 */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={handleCopy}
              title="复制Markdown到剪贴板"
              disabled={!markdown}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all
                ${!markdown
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">复制 Markdown 内容</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              title="下载Markdown文件"
              disabled={!markdown}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                ${!markdown
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                }
              `}
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">下载 Markdown 文件</span>
            </button>
          </div>
        </div>

        {/* 编辑器和结果区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：HTML 编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-22rem)]">
            <Editor
              content={html}
              language="html"
              onChange={setHtml}
              scrollRef={htmlEditorScrollRef}
            />
          </div>

          {/* 右侧：Markdown 显示区 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-22rem)]">
            {/* 预览工具栏 */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Markdown 预览</span>
              </div>
              <button
                onClick={toggleSyncScroll}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  syncScrollEnabled
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={syncScrollEnabled
                  ? '同步预览已开启。滚动编辑器或预览区域时,另一侧会自动同步滚动位置,保持源码与转换结果的位置对应。点击可关闭此功能。'
                  : '点击开启同步预览功能。开启后,滚动编辑器或预览区域时,另一侧会自动同步滚动位置,方便对照源码和转换结果。'}
              >
                {syncScrollEnabled ? (
                  <>
                    <Link2 className="h-4 w-4" />
                    <span>同步预览已开</span>
                  </>
                ) : (
                  <>
                    <Link2Off className="h-4 w-4" />
                    <span>同步预览已关</span>
                  </>
                )}
              </button>
            </div>

            {/* Markdown 内容 */}
            <div className="flex-1 overflow-hidden">
              {markdown ? (
                <pre ref={markdownPreviewScrollRef} className="h-full p-6 font-mono text-sm text-gray-800 overflow-auto whitespace-pre-wrap bg-white">
                  {markdown}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>请在左侧输入 HTML 内容</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">功能说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileCode className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">智能清理</h3>
              </div>
              <p className="text-gray-600">
                自动移除 HTML 中的样式、脚本和注释，提取纯文本内容
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">完整支持</h3>
              </div>
              <p className="text-gray-600">
                支持标题、列表、表格、代码块、链接等常见 HTML 元素
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">一键下载</h3>
              </div>
              <p className="text-gray-600">
                转换完成后可直接复制或下载为 .md 文件
              </p>
            </div>
          </div>
        </div>

        {/* 支持的元素 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">支持的 HTML 元素</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>✅ 标题 (h1-h6)</div>
              <div>✅ 段落 (p)</div>
              <div>✅ 链接 (a)</div>
              <div>✅ 列表 (ul, ol, li)</div>
              <div>✅ 表格 (table)</div>
              <div>✅ 代码块 (pre, code)</div>
              <div>✅ 引用 (blockquote)</div>
              <div>✅ 粗体/斜体 (strong, em)</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">转换特性</h3>
            <ul className="space-y-2 text-gray-600">
              <li>🔧 自动移除内联样式</li>
              <li>🔧 自动移除 script 和 style 标签</li>
              <li>🔧 保留表格结构</li>
              <li>🔧 代码块支持语言标识</li>
              <li>🔧 优化 Markdown 格式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}