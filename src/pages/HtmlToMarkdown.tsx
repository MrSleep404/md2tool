import { useState, useEffect, useRef } from 'react'
import { FileCode, FileText, Copy, Download, CheckCircle, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import { convertHtmlToMarkdown } from '../utils/converters/htmlToMd'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'
import { useExampleContent } from '../hooks/useExampleContent'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { getExample } from '../i18n/exampleContent'
import { tList } from '../i18n/helpers'

/**
 * HTML 转 Markdown 页面
 */
export default function HtmlToMarkdown() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'zh'

  // 设置SEO
  useSEO(SEO_CONFIGS.htmlToMarkdown, '/html-to-markdown')

  const [html, setHtml] = useState<string>('')
  const [markdown, setMarkdown] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步滚动
  const htmlEditorScrollRef = useRef<HTMLTextAreaElement>(null)
  const markdownPreviewScrollRef = useRef<HTMLPreElement>(null)
  const { enabled: syncScrollEnabled, toggle: toggleSyncScroll } = useSyncScrollState(false)
  useSyncScroll(htmlEditorScrollRef, markdownPreviewScrollRef, syncScrollEnabled)

  // 示例 HTML（跟随界面语言）
  const exampleHtml = getExample(lang, 'htmlToMd')

  // 初始化示例内容，并在语言切换后同步（未被用户修改时）
  useExampleContent(exampleHtml, setHtml)

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
      setError(t('common:errors.readFile'))
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
              <h1 className="text-4xl font-bold">{t('pages:htmlToMarkdown.hero.title')}</h1>
            </div>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              {t('pages:htmlToMarkdown.hero.subtitle')}
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
              title={t('common:tips.uploadHtml')}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.uploadHtml')}</span>
            </button>

            <button
              onClick={handleLoadExample}
              title={t('common:tips.example')}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.example')}</span>
            </button>

            <button
              onClick={handleClear}
              title={t('common:tips.clear')}
              disabled={!html}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                !html
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.clear')}</span>
            </button>
          </div>

          {/* 右侧按钮组 */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={handleCopy}
              title={t('common:tips.copyMd')}
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
              title={t('common:tips.downloadMd')}
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
              <span className="text-sm">{t('common:buttons.downloadMd')}</span>
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
                <span className="text-sm text-gray-700">{t('common:preview.markdown')}</span>
              </div>
              <button
                onClick={toggleSyncScroll}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  syncScrollEnabled
                    ? 'bg-purple-100 text-purple-700'
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
            </div>

            {/* Markdown 内容 */}
            <div className="flex-1 overflow-hidden">
              {markdown ? (
                <pre ref={markdownPreviewScrollRef} className="h-full p-6 font-mono text-sm text-gray-800 overflow-auto whitespace-pre-wrap bg-white">
                  {markdown}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>{t('tools:emptyHtmlHint')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('tools:featuresTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileCode className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('pages:htmlToMarkdown.cards.smartClean.title')}</h3>
              </div>
              <p className="text-gray-600">
                {t('pages:htmlToMarkdown.cards.smartClean.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('pages:htmlToMarkdown.cards.fullSupport.title')}</h3>
              </div>
              <p className="text-gray-600">
                {t('pages:htmlToMarkdown.cards.fullSupport.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('pages:htmlToMarkdown.cards.download.title')}</h3>
              </div>
              <p className="text-gray-600">
                {t('pages:htmlToMarkdown.cards.download.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* 支持的元素 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tools:htmlElementsTitle')}</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              {tList(t, 'pages:htmlToMarkdown.htmlElements').map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tools:convertTraitsTitle')}</h3>
            <ul className="space-y-2 text-gray-600">
              {tList(t, 'pages:htmlToMarkdown.traits').map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
