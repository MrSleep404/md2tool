import { useState, useEffect, useRef } from 'react'
import { Code, Copy, Download, Loader2, CheckCircle, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import Preview from '../components/common/Preview'
import { convertMarkdownToHtml, convertMarkdownToHtmlDocument } from '../utils/converters/mdToHtml'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'

/**
 * Markdown 转 HTML 页面
 */
export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState<string>('')
  const [htmlCode, setHtmlCode] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')
  const isInitialized = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步滚动
  const editorScrollRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const { enabled: syncScrollEnabled, toggle: toggleSyncScroll } = useSyncScrollState(false)
  useSyncScroll(editorScrollRef, previewScrollRef, syncScrollEnabled)

  // 示例 Markdown
  const exampleMarkdown = `# Markdown 转 HTML

这是一个 **Markdown** 转 **HTML** 的工具。

## 功能特点

- 实时转换
- 支持标准 Markdown 语法
- 可复制 HTML 代码
- 可下载完整 HTML 文档

\`\`\`html
<p>这是一段示例代码</p>
\`\`\`

> 支持引用块、表格等复杂格式

| 特性 | 支持 |
|------|------|
| 标题 | ✅ |
| 列表 | ✅ |
| 表格 | ✅ |

[了解更多](https://example.com)
`

  // 初始化示例内容
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      setMarkdown(exampleMarkdown)
    }
  }, [])

  // 实时转换 HTML
  useEffect(() => {
    const convertToHtml = async () => {
      if (!markdown) {
        setHtmlCode('')
        return
      }

      try {
        const html = await convertMarkdownToHtml(markdown)
        setHtmlCode(html)
      } catch (err) {
        console.error('转换失败:', err)
      }
    }

    convertToHtml()
  }, [markdown])

  // 复制 HTML 代码
  const handleCopy = async () => {
    if (!htmlCode) return

    try {
      await navigator.clipboard.writeText(htmlCode)
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
      setMarkdown(content)
      setError(null)
    }
    reader.onerror = () => {
      setError('文件读取失败，请重试')
    }
    reader.readAsText(file)

    // 重置 input 以便可以重新选择同一个文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 下载 HTML 文件
  const handleDownload = async () => {
    if (!markdown.trim()) {
      setError('请先输入 Markdown 内容')
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const htmlDocument = await convertMarkdownToHtmlDocument(markdown, {
        title: 'Markdown 文档',
        includeStyle: true,
      })
      const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' })
      saveAs(blob, 'document.html')
    } catch (err) {
      setError('转换失败，请重试')
      console.error(err)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 区域 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <Code className="h-12 w-12" />
              <h1 className="text-4xl font-bold">Markdown 转 HTML</h1>
            </div>
            <p className="text-lg text-orange-100 max-w-2xl mx-auto">
              实时将 Markdown 转换为 HTML，支持代码预览和下载
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

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.markdown"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 工具栏 */}
        <div className="mb-6 flex justify-between items-center">
          {/* 左侧按钮组 */}
          <div className="flex space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              title="上传Markdown文件 (.md, .markdown, .txt)"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">上传 MD 文件</span>
            </button>

            <button
              onClick={() => setMarkdown(exampleMarkdown)}
              title="加载示例内容"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">示例内容</span>
            </button>

            <button
              onClick={() => {
                setMarkdown('')
                setError(null)
              }}
              disabled={!markdown}
              title="清除所有内容"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                !markdown
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">清除内容</span>
            </button>
          </div>

          {/* 右侧按钮组 */}
          <div className="flex space-x-3">
            <button
              onClick={handleCopy}
              disabled={!htmlCode}
              title="复制HTML代码到剪贴板"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                !htmlCode
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">复制 HTML 代码</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={isConverting || !markdown.trim()}
              title="下载HTML文件"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isConverting || !markdown.trim()
                  ? 'bg-gray-300 text-white cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">转换中...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span className="text-sm">下载 HTML 文件</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 编辑器和结果区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：Markdown 编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-22rem)]">
            <Editor
              content={markdown}
              language="markdown"
              onChange={setMarkdown}
              scrollRef={editorScrollRef}
            />
          </div>

          {/* 右侧：HTML 显示区 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-22rem)]">
            {/* 标签页切换和同步按钮 */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  HTML 代码
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  预览效果
                </button>
              </div>

              {/* 同步滚动开关 */}
              <button
                onClick={toggleSyncScroll}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  syncScrollEnabled
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={syncScrollEnabled 
                  ? '同步预览已开启。滚动编辑器或预览区域时，另一侧会自动同步滚动位置，保持源码与转换结果的位置对应。点击可关闭此功能。' 
                  : '点击开启同步预览功能。开启后，滚动编辑器或预览区域时，另一侧会自动同步滚动位置，方便对照源码和转换结果。'}
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

            {/* 内容区域 - 统一滚动容器 */}
            <div ref={previewScrollRef} className="flex-1 overflow-auto">
              {/* HTML 代码标签页内容 */}
              {activeTab === 'code' && (
                htmlCode ? (
                  <pre className="p-6 font-mono text-sm text-gray-800 whitespace-pre-wrap bg-white">
                    {htmlCode}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>请在左侧输入 Markdown 内容</p>
                  </div>
                )
              )}

              {/* 预览效果标签页内容 */}
              {activeTab === 'preview' && (
                htmlCode ? (
                  <div className="p-6 bg-white">
                    <div
                      className="markdown-preview prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: htmlCode }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>请在左侧输入 Markdown 内容</p>
                  </div>
                )
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">实时转换</h3>
              </div>
              <p className="text-gray-600">
                在左侧编辑 Markdown，右侧立即显示对应的 HTML 代码
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">双模式预览</h3>
              </div>
              <p className="text-gray-600">
                查看纯 HTML 代码或渲染后的页面效果
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">完整文档</h3>
              </div>
              <p className="text-gray-600">
                下载的 HTML 文件包含完整的样式和文档结构
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}