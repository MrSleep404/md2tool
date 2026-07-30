import { useState, useEffect, useRef } from 'react'
import { FileText, Download, Loader2, Github, Upload, RefreshCw, Trash2, Link2, Link2Off } from 'lucide-react'
import { saveAs } from 'file-saver'
import Editor from '../components/common/Editor'
import Preview from '../components/common/Preview'
import { convertMarkdownToWord } from '../utils/converters/mdToWord'
import { convertMarkdownToHtml } from '../utils/converters/mdToHtml'
import { useSyncScroll, useSyncScrollState } from '../hooks/useSyncScroll'
import { useSEO, SEO_CONFIGS } from '../utils/seo'

/**
 * 主页 - Markdown 转 Word
 */
export default function Home() {
  // 设置SEO
  useSEO(SEO_CONFIGS.home)

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

  // 示例 Markdown 内容
  const exampleMarkdown = `# 欢迎使用 Markdown 转 Word 工具

这是一个简单易用的 Markdown 转 Word 文档工具，支持 **Mermaid 流程图** 和 **LaTeX 数学公式**。

## 功能特点

- ✅ 支持 Markdown 基本语法
- ✅ 支持 Mermaid 流程图
- ✅ 支持 LaTeX 数学公式
- ✅ 实时预览
- ✅ 一键下载 Word 文档
- ✅ 支持文件上传

## 使用方法

1. 在左侧编辑器中输入 Markdown 内容
2. 右侧会实时预览渲染效果
3. 点击"下载 Word"按钮即可下载文档

### Mermaid 流程图示例

\`\`\`mermaid
flowchart LR
    A[Ask ChatGPT/Claude] --> B{Got Markdown?}
    B -->|Yes| C[Paste to md2word]
    C --> D[Export Word/PDF]
    style A fill:#f9f,stroke:#333
    style D fill:#9f9,stroke:#333
\`\`\`

### LaTeX 数学公式示例

行内公式：质能方程 $E = mc^2$ 是物理学中最著名的公式之一。

块级公式：

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

### 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!')
}
\`\`\`

### 图片示例

![测试图片](https://img.shetu66.com/2023/05/15/1684145537979686.png)

> 提示：您也可以拖拽 Markdown 文件到上传区域

| 功能 | 支持 |
|------|------|
| 标题 | ✅ |
| 列表 | ✅ |
| 代码 | ✅ |
| 流程图 | ✅ |
| 公式 | ✅ |

---

感谢使用！
`

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
      setError('文件读取失败，请重试')
      console.error(err)
    }
  }

  // 下载 Word 文档
  const handleDownloadWord = async () => {
    if (!markdown.trim()) {
      setError('请先输入 Markdown 内容')
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const blob = await convertMarkdownToWord(markdown, 'document.docx')
      saveAs(blob, 'document.docx')
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <FileText className="h-12 w-12" />
              <h1 className="text-4xl font-bold">Markdown 转 Word</h1>
            </div>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              轻松将 Markdown 文档转换为 Word 格式，支持实时预览和一键下载
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
            title="上传Markdown文件 (.md, .markdown, .txt)"
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm">上传 MD 文件</span>
          </button>

          {/* 示例内容按钮 */}
          <button
            onClick={() => setMarkdown(exampleMarkdown)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="加载示例内容"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">示例内容</span>
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
            title="清除所有内容"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">清除内容</span>
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
                <span className="text-sm">转换中...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="text-sm">下载 Word 文档</span>
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">实时编辑</h3>
            </div>
            <p className="text-gray-600">
              在左侧编辑器中输入或粘贴 Markdown 内容，右侧实时显示渲染效果
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Github className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">支持 GFM</h3>
            </div>
            <p className="text-gray-600">
              支持 GitHub Flavored Markdown 语法，包括表格、任务列表、删除线等
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
              点击下载按钮即可生成 .docx 文件，完全在浏览器端完成，无需上传服务器
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}