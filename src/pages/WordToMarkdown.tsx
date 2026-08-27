import { useState, useRef } from 'react'
import { FileInput, Copy, Download, Loader2, CheckCircle, Upload, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'file-saver'
import { convertWordToMarkdown } from '../utils/converters/wordToMd'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { conversionErrorMessage } from '../utils/conversionError'
import { tList } from '../i18n/helpers'

/**
 * Word 转 Markdown 页面
 */
export default function WordToMarkdown() {
  const { t } = useTranslation()

  // 设置SEO
  useSEO(SEO_CONFIGS.wordToMarkdown, '/word-to-markdown')

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
      setError(conversionErrorMessage(err, t))
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
              <h1 className="text-4xl font-bold">{t('pages:wordToMarkdown.hero.title')}</h1>
            </div>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              {t('pages:wordToMarkdown.hero.subtitle')}
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
                title={t('common:tips.uploadWord')}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">{t('common:buttons.uploadWord')}</span>
              </button>

              <button
                onClick={handleClear}
                disabled={isConverting || (!markdown && !error)}
                title={t('common:tips.clear')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isConverting || (!markdown && !error)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">{t('common:buttons.clear')}</span>
              </button>
            </div>

            {/* 右侧按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={handleCopy}
                disabled={!markdown}
                title={t('common:tips.copyMd')}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">{t('common:buttons.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">{t('common:buttons.copyMd')}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                disabled={!markdown}
                title={t('common:tips.downloadMd')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  !markdown
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">{t('common:buttons.downloadMd')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 转换状态 */}
        {isConverting && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">{t('tools:converting')}</span>
          </div>
        )}

        {/* 转换结果 */}
        {markdown && !isConverting && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-24rem)]">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
              <span className="text-sm text-gray-700">{t('tools:resultTitle')}</span>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('tools:usageTitle')}</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ul className="space-y-3 text-gray-600">
              {tList(t, 'pages:wordToMarkdown.steps').map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 支持的格式 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tools:supportedTitle')}</h3>
            <ul className="space-y-2 text-gray-600">
              {tList(t, 'pages:wordToMarkdown.supported').map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tools:notesTitle')}</h3>
            <ul className="space-y-2 text-gray-600">
              {tList(t, 'pages:wordToMarkdown.notes').map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
