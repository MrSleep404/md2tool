import { useState, useRef } from 'react'
import { FileInput, Copy, Download, Loader2, CheckCircle, Upload, Trash2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import { convertWordToMarkdown } from '../utils/converters/wordToMd'
import { useSEO, SEO_CONFIGS } from '../utils/seo'

/**
 * Word 转 Markdown 页面
 */
export default function WordToMarkdown() {
  // 设置SEO
  useSEO(SEO_CONFIGS.wordToMarkdown)

  const [markdown, setMarkdown] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    setIsConverting(true)
    setError(null)
    setMarkdown('')

    try {
      const result = await convertWordToMarkdown(file)
      setMarkdown(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败，请重试')
      console.error(err)
    } finally {
      setIsConverting(false)
    }
  }

  // 触发文件上传
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 处理文件输入变化
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // 重置 input，允许重复选择同一文件
    e.target.value = ''
  }

  // 清除所有内容
  const handleClear = () => {
    setMarkdown('')
    setError(null)
  }

  // 复制到剪贴板
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

  // 下载 Markdown 文件
  const handleDownload = () => {
    if (!markdown) return

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, 'converted.md')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 区域 */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <FileInput className="h-12 w-12" />
              <h1 className="text-4xl font-bold">Word 转 Markdown</h1>
            </div>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              上传 Word 文档，一键转换为 Markdown 格式
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
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {/* 左侧按钮 */}
            <div className="flex space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                disabled={isConverting}
                title="上传Word文件 (.docx)"
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">上传 Word 文件</span>
              </button>

              <button
                onClick={handleClear}
                disabled={isConverting || (!markdown && !error)}
                title="清除所有内容"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isConverting || (!markdown && !error)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">清除内容</span>
              </button>
            </div>

            {/* 右侧按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={handleCopy}
                disabled={!markdown}
                title="复制Markdown到剪贴板"
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={!markdown}
                title="下载Markdown文件"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  !markdown
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">下载 Markdown 文件</span>
              </button>
            </div>
          </div>
        </div>

        {/* 转换状态 */}
        {isConverting && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">正在转换中...</span>
          </div>
        )}

        {/* 转换结果 */}
        {markdown && !isConverting && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-24rem)]">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
              <span className="text-sm text-gray-700">转换结果</span>
            </div>
            <div className="p-6 h-full overflow-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 overflow-x-auto bg-white">
                {markdown}
              </pre>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">使用说明</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <span>点击上方上传区域或拖拽 .docx 文件到上传区</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <span>系统将自动解析 Word 文档并转换为 Markdown 格式</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <span>转换完成后，可复制结果或下载为 .md 文件</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 支持的格式 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">支持的元素</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✅ 标题（H1-H6）</li>
              <li>✅ 段落和文本格式</li>
              <li>✅ 粗体、斜体</li>
              <li>✅ 列表（有序、无序）</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">注意事项</h3>
            <ul className="space-y-2 text-gray-600">
              <li>⚠️ 仅支持 .docx 格式</li>
              <li>⚠️ 复杂表格可能需要手动调整</li>
              <li>⚠️ 图片不会被提取</li>
              <li>⚠️ 最大文件大小: 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}