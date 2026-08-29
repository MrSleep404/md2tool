import { useState, useEffect, useRef } from 'react'
import { Table, Download, Loader2, FileSpreadsheet, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import {
  convertMarkdownToExcel,
  previewMarkdownTables,
} from '../utils/converters/mdToExcel'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'
import { useExampleContent } from '../hooks/useExampleContent'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { getExample } from '../i18n/exampleContent'
import { tItems } from '../i18n/helpers'
import PageSeoBlock from '../components/PageSeoBlock'

/**
 * Markdown 转 Excel 页面
 */
export default function MarkdownToExcel() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'zh'

  // FAQ 文案（页面区块与 FAQPage JSON-LD 共用）
  const faq = tItems<{ q: string; a: string }>(t, 'pages:markdownToExcel.faq')

  // 设置SEO
  useSEO(SEO_CONFIGS.markdownToExcel, '/markdown-to-excel', {
    faqQa: faq.length ? faq : undefined,
    breadcrumbName: t('pages:markdownToExcel.hero.title'),
  })

  const [markdown, setMarkdown] = useState<string>('')
  const [tables, setTables] = useState<Array<{ headers: string[]; rows: string[][] }>>([])
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步滚动
  const editorScrollRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const { enabled: syncScrollEnabled, toggle: toggleSyncScroll } = useSyncScrollState(false)
  useSyncScroll(editorScrollRef, previewScrollRef, syncScrollEnabled)

  // 示例 Markdown 内容（包含表格，跟随界面语言）
  const exampleMarkdown = getExample(lang, 'mdToExcel')

  // 初始化示例内容，并在语言切换后同步（未被用户修改时）
  useExampleContent(exampleMarkdown, setMarkdown)

  // 处理文件上传
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

    // 重置 input 以便可以重复上传同一个文件
    if (event.target) {
      event.target.value = ''
    }
  }

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 加载示例内容
  const handleLoadExample = () => {
    setMarkdown(exampleMarkdown)
    setError(null)
  }

  // 清除内容
  const handleClear = () => {
    setMarkdown('')
    setTables([])
    setError(null)
  }

  // 实时解析表格
  useEffect(() => {
    try {
      const parsedTables = previewMarkdownTables(markdown)
      setTables(parsedTables)
      setError(null)
    } catch (err) {
      console.error('表格解析错误:', err)
    }
  }, [markdown])

  // 处理 Excel 下载
  const handleDownloadExcel = async () => {
    if (!markdown.trim()) {
      setError(t('common:errors.emptyInput'))
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const blob = await convertMarkdownToExcel(markdown)
      saveAs(blob, 'markdown-tables.xlsx')
    } catch (err) {
      console.error('Excel 生成错误:', err)
      setError(t('common:errors.excelFailed'))
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 区域 */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <Table className="h-12 w-12" />
              <h1 className="text-4xl font-bold">{t('pages:markdownToExcel.hero.title')}</h1>
            </div>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
              {t('pages:markdownToExcel.hero.subtitle')}
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
        <div className="mb-6 flex items-center justify-between">
          {/* 左侧工具栏 */}
          <div className="flex items-center space-x-3">
            {/* 隐藏的文件输入 */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".md,.txt,.markdown"
              className="hidden"
            />

            {/* 上传文件按钮 */}
            <button
              onClick={handleUploadClick}
              title={t('common:tips.uploadMd')}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.uploadMd')}</span>
            </button>

            {/* 示例内容按钮 */}
            <button
              onClick={handleLoadExample}
              title={t('common:tips.example')}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">{t('common:buttons.example')}</span>
            </button>

            {/* 清除内容按钮 */}
            <button
              onClick={handleClear}
              disabled={!markdown}
              title={t('common:tips.clear')}
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

          {/* 右侧：下载按钮 */}
          <button
            onClick={handleDownloadExcel}
            disabled={isConverting || tables.length === 0}
            title={t('common:tips.downloadExcel')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isConverting || tables.length === 0
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t('common:buttons.converting')}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="text-sm">{t('common:buttons.downloadExcel')}</span>
              </>
            )}
          </button>
        </div>

        {/* 编辑器和预览区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：Markdown 编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-22rem)]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{t('common:editor.markdown')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('tools:editorHint')}</p>
            </div>
            <Editor
              content={markdown}
              language="markdown"
              onChange={setMarkdown}
              scrollRef={editorScrollRef}
            />
          </div>

          {/* 右侧：表格预览 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-22rem)] flex flex-col">
            {/* 预览工具栏 */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Table className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{t('tools:tablePreview')}</span>
              </div>
              <button
                onClick={toggleSyncScroll}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  syncScrollEnabled
                    ? 'bg-indigo-100 text-indigo-700'
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
            <div className="flex-1 overflow-auto p-4" ref={previewScrollRef}>
              {tables.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm">{t('tools:noTables')}</p>
                  <p className="text-xs mt-2">{t('tools:noTablesHint')}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {tables.map((table, tableIndex) => (
                    <div key={tableIndex}>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        {t('tools:tableN', { index: tableIndex + 1 })}
                      </h4>
                      <div className="overflow-x-auto border border-gray-300 rounded">
                        <table className="min-w-full divide-y divide-gray-300">
                          {table.headers.length > 0 && (
                            <thead className="bg-gray-50">
                              <tr>
                                {table.headers.map((header, headerIndex) => (
                                  <th
                                    key={headerIndex}
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody className="bg-white divide-y divide-gray-300">
                            {table.rows.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Table className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('pages:markdownToExcel.cards.detect.title')}</h3>
            </div>
            <p className="text-gray-600">
              {t('pages:markdownToExcel.cards.detect.desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('pages:markdownToExcel.cards.multi.title')}</h3>
            </div>
            <p className="text-gray-600">
              {t('pages:markdownToExcel.cards.multi.desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('pages:markdownToExcel.cards.download.title')}</h3>
            </div>
            <p className="text-gray-600">
              {t('pages:markdownToExcel.cards.download.desc')}
            </p>
          </div>
        </div>

        {/* SEO 内容区块 */}
        <PageSeoBlock pageKey="markdownToExcel" accent="indigo" />
      </div>
    </div>
  )
}
