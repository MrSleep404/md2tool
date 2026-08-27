import { useState, useEffect, useRef } from 'react'
import { FileText, Download, Loader2, Github, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import Preview from '../components/common/Preview'
import { convertMarkdownToWord } from '../utils/converters/mdToWord'
import { convertMarkdownToHtml } from '../utils/converters/mdToHtml'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { getExample } from '../i18n/exampleContent'

/**
 * 主页 - Markdown 转 Word
 */
export default function Home() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'zh'

  // 设置SEO
  useSEO(SEO_CONFIGS.home, '/')

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

  // 示例 Markdown 内容（跟随界面语言）
  const exampleMarkdown = getExample(lang, 'home')

  // 初始化示例内容（页面加载时自动填充示例）
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
  const handleFileSelect = async (file: File) => {
    try {
      setError(null)
      const text = await file.text()
      setMarkdown(text)
    } catch (err) {
      setError(t('common:errors.readFile'))
      console.error(err)
    }
  }

  // 下载 Word 文档
  const handleDownloadWord = async () => {
    if (!markdown.trim()) {
      setError(t('common:errors.emptyInput'))
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const blob = await convertMarkdownToWord(markdown, 'document.docx')
      saveAs(blob, 'document.docx')
    } catch (err) {
      setError(t('common:errors.convertFailed'))
      console.error(err)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 区域 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <FileText className="h-12 w-12" />
              <h1 className="text-4xl font-bold">{t('home:hero.title')}</h1>
            </div>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              {t('home:hero.subtitle')}
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
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.markdown"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileSelect(file)
              }
            }}
          />

          {/* 上传按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={t('common:tips.uploadMd')}
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm">{t('common:buttons.uploadMd')}</span>
          </button>

          {/* 示例内容按钮 */}
          <button
            onClick={() => setMarkdown(exampleMarkdown)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={t('common:tips.example')}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">{t('common:buttons.example')}</span>
          </button>

          {/* 清除内容按钮 */}
          <button
            onClick={() => {
              setMarkdown('')
              setError(null)
            }}
            disabled={!markdown}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              !markdown
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
            }`}
            title={t('common:tips.clear')}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">{t('common:buttons.clear')}</span>
          </button>

          {/* 分隔线 */}
          <div className="flex-1"></div>

          {/* 下载按钮 */}
          <button
            onClick={handleDownloadWord}
            disabled={isConverting || !markdown.trim()}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-white
              ${isConverting || !markdown.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
              }
            `}
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t('common:buttons.converting')}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="text-sm">{t('common:buttons.downloadWord')}</span>
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
                      ? 'bg-primary-100 text-primary-700'
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('home:cards.realtime.title')}</h3>
            </div>
            <p className="text-gray-600">
              {t('home:cards.realtime.desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Github className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('home:cards.gfm.title')}</h3>
            </div>
            <p className="text-gray-600">
              {t('home:cards.gfm.desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('home:cards.download.title')}</h3>
            </div>
            <p className="text-gray-600">
              {t('home:cards.download.desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
