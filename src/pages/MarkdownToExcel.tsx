import { useState, useEffect, useRef } from 'react'
import { Table, Download, Loader2, FileSpreadsheet, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import {
  convertMarkdownToExcel,
  previewMarkdownTables,
} from '../utils/converters/mdToExcel'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'

/**
 * Markdown 转 Excel 页面
 */
export default function MarkdownToExcel() {
  const [markdown, setMarkdown] = useState<string>('')
  const [tables, setTables] = useState<Array<{ headers: string[]; rows: string[][] }>>([])
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isInitialized = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步滚动
  const editorScrollRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const { enabled: syncScrollEnabled, toggle: toggleSyncScroll } = useSyncScrollState(false)
  useSyncScroll(editorScrollRef, previewScrollRef, syncScrollEnabled)

  // 示例 Markdown 内容（包含表格）
  const exampleMarkdown = `# Markdown 表格转 Excel 示例

这是一个将 Markdown 表格转换为 Excel 文件的工具。

## 示例表格

| 姓名 | 年龄 | 城市 | 职业 |
|------|------|------|------|
| 张三 | 28   | 北京 | 工程师 |
| 李四 | 32   | 上海 | 设计师 |
| 王五 | 25   | 广州 | 产品经理 |

## 另一个表格

| 产品 | 价格 | 库存 | 状态 |
|------|------|------|------|
| 手机 | 2999 | 100  | 在售 |
| 电脑 | 5999 | 50   | 在售 |
| 耳机 | 299  | 200  | 缺货 |

## 使用说明

1. 在左侧编辑器中输入包含表格的 Markdown 内容
2. 右侧会实时显示识别到的表格预览
3. 点击"下载 Excel"按钮下载转换后的文件
`

  // 初始化示例内容
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      setMarkdown(exampleMarkdown)
    }
  }, [])

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
      setError('文件读取失败，请重试')
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
      setError('请先输入 Markdown 内容')
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const blob = await convertMarkdownToExcel(markdown)
      saveAs(blob, 'markdown-tables.xlsx')
    } catch (err) {
      console.error('Excel 生成错误:', err)
      setError('Excel 生成失败，请检查 Markdown 格式')
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
              <h1 className="text-4xl font-bold">Markdown 转 Excel</h1>
            </div>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
              将 Markdown 中的表格数据一键转换为 Excel 文件，支持多表格识别
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
              title="上传Markdown文件 (.md, .markdown, .txt)"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">上传 MD 文件</span>
            </button>

            {/* 示例内容按钮 */}
            <button
              onClick={handleLoadExample}
              title="加载示例内容"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">示例内容</span>
            </button>

            {/* 清除内容按钮 */}
            <button
              onClick={handleClear}
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

          {/* 右侧：下载按钮 */}
          <button
            onClick={handleDownloadExcel}
            disabled={isConverting || tables.length === 0}
            title="下载Excel文件"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isConverting || tables.length === 0
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
                <span className="text-sm">下载 Excel 文件</span>
              </>
            )}
          </button>
        </div>

        {/* 编辑器和预览区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：Markdown 编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-22rem)]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Markdown 编辑器</h3>
              <p className="text-xs text-gray-500 mt-1">输入包含表格的 Markdown 内容</p>
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
                <span className="text-sm text-gray-700">表格预览</span>
              </div>
              <button
                onClick={toggleSyncScroll}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  syncScrollEnabled
                    ? 'bg-indigo-100 text-indigo-700'
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
            </div>
            <div className="flex-1 overflow-auto p-4" ref={previewScrollRef}>
              {tables.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm">暂无表格数据</p>
                  <p className="text-xs mt-2">请在左侧输入包含表格的 Markdown</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {tables.map((table, tableIndex) => (
                    <div key={tableIndex}>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        表格 {tableIndex + 1}
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
              <h3 className="text-lg font-medium text-gray-900">自动识别表格</h3>
            </div>
            <p className="text-gray-600">
              自动识别 Markdown 内容中的所有表格，无需手动选择
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">多表格支持</h3>
            </div>
            <p className="text-gray-600">
              支持同时转换多个表格到同一个 Excel 文件的不同位置
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
              点击下载按钮即可生成 .xlsx 文件，完全在浏览器端完成
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}