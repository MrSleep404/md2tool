import { useState, useEffect, useRef } from 'react'
import { FileText, FileDown, Download, Loader2, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import Preview from '../components/common/Preview'
import { convertMarkdownToHtml } from '../utils/converters/mdToHtml'
import { convertMarkdownToPdf } from '../utils/converters/mdToPdf'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { getExample } from '../i18n/exampleContent'
import { tList } from '../i18n/helpers'

/**
 * Markdown 转 PDF 页面
 */
export default function MarkdownToPdf() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'zh'

  // 设置SEO
  useSEO(SEO_CONFIGS.markdownToPdf, '/markdown-to-pdf')

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

  // 示例 Markdown（跟随界面语言）
  const exampleMarkdown = getExample(lang, 'mdToPdf')

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
      setError(t('common:errors.readFile'))
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
      setError(t('common:errors.emptyInput'))
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
      setError(t('common:errors.pdfFailed'))
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
              <h1 className="text-4xl font-bold">{t('pages:markdownToPdf.hero.title')}</h1>
            </div>
            <p className="text-lg text-red-100 max-w-2xl mx-auto">
              {t('pages:markdownToPdf.hero.subtitle')}
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
              title={t('common:tips.uploadMd')}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.uploadMd')}</span>
            </button>

            <button
              onClick={loadExample}
              title={t('common:tips.example')}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.example')}</span>
            </button>

            <button
              onClick={clearContent}
              title={t('common:tips.clear')}
              disabled={!markdown}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                !markdown
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.clear')}</span>
            </button>
          </div>

          {/* 右侧下载按钮 */}
          <button
            onClick={handleDownloadPdf}
            title={t('common:tips.downloadPdf')}
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
                <span className="text-sm">{t('common:buttons.generating')}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="text-sm">{t('common:buttons.downloadPdf')}</span>
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
                  title={syncScrollEnabled ? t('common:sync.onTip') : t('common:sync.offTip')}
                >
                  {syncScrollEnabled ? (
                    <>
                      <Link2 className="h-4 w-4" />
                      <span>{t('common:sync.on')}</span>
                    </>
                  ) : (
                    <>
                      <Link2Off className="h-4 w-4" />
                      <span>{t('common:sync.off')}</span>
                    </>
                  )}
                </button>
              }
            />
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('tools:featuresTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('pages:markdownToPdf.cards.quality.title')}</h3>
              </div>
              <p className="text-gray-600">
                {t('pages:markdownToPdf.cards.quality.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('pages:markdownToPdf.cards.preview.title')}</h3>
              </div>
              <p className="text-gray-600">
                {t('pages:markdownToPdf.cards.preview.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('pages:markdownToPdf.cards.download.title')}</h3>
              </div>
              <p className="text-gray-600">
                {t('pages:markdownToPdf.cards.download.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* PDF 设置说明 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{t('pages:markdownToPdf.defaultsTitle')}</h3>
            <ul className="space-y-2 text-gray-600">
              {tList(t, 'pages:markdownToPdf.defaults').map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tools:supportedTitle')}</h3>
            <ul className="space-y-2 text-gray-600">
              {tList(t, 'pages:markdownToPdf.supported').map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">{t('tools:notesTitle')}</h3>
          <ul className="space-y-2 text-yellow-700">
            {tList(t, 'pages:markdownToPdf.notes').map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
