import { useState, useEffect, useRef } from 'react'
import { FileText, FileDown, Download, Loader2, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import Preview from '../components/common/Preview'
import { convertMarkdownToHtml } from '../utils/converters/mdToHtml'
import { convertMarkdownToPdf } from '../utils/converters/mdToPdf'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'

/**
 * Markdown 转 PDF 页面
 */
export default function MarkdownToPdf() {
  const [markdown, setMarkdown] = useState<string>('')
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isInitialized = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步滚动
  const editorScrollRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const { enabled: syncScrollEnabled, toggle: toggleSyncScroll } = useSyncScrollState(false)
  useSyncScroll(editorScrollRef, previewScrollRef, syncScrollEnabled)

  // 示例 Markdown
  const exampleMarkdown = `# Markdown 转 PDF 工具

这是一个将 Markdown 文档转换为 PDF 格式的在线工具。

## 主要功能

- 📄 支持标准 Markdown 语法
- 📄 实时预览渲染效果
- 📄 高质量 PDF 输出
- 📄 自定义页边距和字号

## 使用方法

1. 在左侧编辑器中输入或粘贴 Markdown 内容
2. 右侧实时显示渲染后的效果
3. 点击"下载 PDF"按钮生成 PDF 文件

### 示例代码

\`\`\`python
def hello():
    print("Hello, PDF!")

hello()
\`\`\`

### 表格示例

| 功能 | 描述 |
|------|------|
| 标题 | 支持 H1-H6 |
| 列表 | 有序和无序 |
| 表格 | 完整支持 |
| 代码 | 高亮显示 |

> 💡 提示：PDF 文件将包含完整的格式和样式

---

感谢使用本工具！
`

  // 初始化示例内容
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      setMarkdown(exampleMarkdown)
    }
  }, [])

  // 更新 HTML 预览
  useEffect(() => {
    const updatePreview = async () => {
      if (!markdown) {
        setHtmlContent('')
        return
      }
      try {
        const html = await convertMarkdownToHtml(markdown)
        setHtmlContent(html)
      } catch (err) {
        console.error('预览更新失败:', err)
      }
    }
    updatePreview()
  }, [markdown])

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

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 触发文件上传
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // 加载示例内容
  const loadExample = () => {
    setMarkdown(exampleMarkdown)
    setError(null)
  }

  // 清除内容
  const clearContent = () => {
    setMarkdown('')
    setHtmlContent('')
    setError(null)
  }

  // 下载 PDF
  const handleDownloadPdf = async () => {
    if (!markdown.trim()) {
      setError('请先输入 Markdown 内容')
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const blob = await convertMarkdownToPdf(markdown, {
        pageSize: 'a4',
        orientation: 'portrait',
        margin: 10,
        fontSize: 12,
        showPageNumber: true,
        title: 'Markdown 文档',
      })
      saveAs(blob, 'document.pdf')
    } catch (err) {
      setError('PDF 生成失败，请重试')
      console.error(err)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 区域 */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <FileDown className="h-12 w-12" />
              <h1 className="text-4xl font-bold">Markdown 转 PDF</h1>
            </div>
            <p className="text-lg text-red-100 max-w-2xl mx-auto">
              将 Markdown 文档转换为高质量的 PDF 文件，支持实时预览
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

        {/* 隐藏的文件上传输入框 */}
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
              onClick={triggerFileUpload}
              title="上传Markdown文件 (.md, .markdown, .txt)"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">上传 MD 文件</span>
            </button>

            <button
              onClick={loadExample}
              title="加载示例内容"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">示例内容</span>
            </button>

            <button
              onClick={clearContent}
              title="清除所有内容"
              disabled={!markdown}
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

          {/* 右侧下载按钮 */}
          <button
            onClick={handleDownloadPdf}
            title="下载PDF文件"
            disabled={isConverting || !markdown.trim()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isConverting || !markdown.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">生成中...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="text-sm">下载 PDF 文件</span>
              </>
            )}
          </button>
        </div>

        {/* 编辑器和预览区 */}
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

          {/* 右侧：实时预览 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-22rem)] flex flex-col">
            <Preview
              content={htmlContent}
              type="html"
              scrollRef={previewScrollRef}
              headerActions={
                <button
                  onClick={toggleSyncScroll}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    syncScrollEnabled
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              }
            />
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">功能说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">高质量输出</h3>
              </div>
              <p className="text-gray-600">
                使用专业渲染引擎，生成清晰、美观的 PDF 文档
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">实时预览</h3>
              </div>
              <p className="text-gray-600">
                编辑的同时实时查看渲染效果，确保输出符合预期
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">一键下载</h3>
              </div>
              <p className="text-gray-600">
                点击按钮即可下载生成的 PDF 文件，无需等待
              </p>
            </div>
          </div>
        </div>

        {/* PDF 设置说明 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">PDF 默认配置</h3>
            <ul className="space-y-2 text-gray-600">
              <li>📐 页面大小: A4</li>
              <li>📐 页面方向: 纵向</li>
              <li>📐 页边距: 10mm</li>
              <li>📐 字体大小: 12pt</li>
              <li>📐 显示页码: 是</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">支持的元素</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✅ 标题（H1-H6）</li>
              <li>✅ 段落和文本格式</li>
              <li>✅ 列表（有序、无序）</li>
              <li>✅ 表格</li>
              <li>✅ 代码块</li>
              <li>✅ 引用块</li>
            </ul>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">注意事项</h3>
          <ul className="space-y-2 text-yellow-700">
            <li>⚠️ PDF 生成过程可能需要几秒钟，请耐心等待</li>
            <li>⚠️ 复杂的表格和代码块可能需要手动调整格式</li>
            <li>⚠️ 图片和链接在 PDF 中可能无法正常显示</li>
            <li>⚠️ 建议使用现代浏览器（Chrome、Firefox、Edge）以获得最佳效果</li>
          </ul>
        </div>
      </div>
    </div>
  )
}