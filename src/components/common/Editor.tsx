import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Link, Image, Code, List, ListOrdered, Table, Quote, Minus, GitBranch } from 'lucide-react'

/**
 * 编辑器组件的属性接口
 */
interface EditorProps {
  /** 编辑器内容 */
  content: string
  /** 编辑器语言类型 */
  language: 'markdown' | 'html'
  /** 内容变化回调函数 */
  onChange: (content: string) => void
  /** 滚动容器引用（可选） */
  scrollRef?: React.RefObject<HTMLTextAreaElement>
}

/**
 * 编辑器组件
 * 支持实时编辑和显示行数
 */
export default function Editor({ content, language, onChange, scrollRef }: EditorProps) {
  const [lineCount, setLineCount] = useState(1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * 计算并更新行数
   */
  useEffect(() => {
    const lines = content.split('\n').length
    setLineCount(lines)
  }, [content])

  /**
   * 处理文本变化
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  /**
   * 处理 Tab 键输入
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd

      // 在光标位置插入制表符（或空格）
      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      onChange(newContent)

      // 恢复光标位置
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  /**
   * 在光标位置插入文本
   */
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = scrollRef?.current || textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newText = content.substring(0, start) + before + textToInsert + after + content.substring(end)
    onChange(newText)

    // 设置光标位置
    setTimeout(() => {
      const textarea = scrollRef?.current || textareaRef.current
      if (textarea) {
        const newCursorPos = start + before.length + textToInsert.length
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
        textarea.focus()
      }
    }, 0)
  }

  /**
   * 在行首插入文本
   */
  const insertAtLineStart = (prefix: string) => {
    const textarea = scrollRef?.current || textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1

    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart)
    onChange(newContent)

    setTimeout(() => {
      const textarea = scrollRef?.current || textareaRef.current
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = start + prefix.length
        textarea.focus()
      }
    }, 0)
  }

  /**
   * 生成行号数组
   */
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div className="w-full h-full flex flex-col">
      {/* 编辑器头部 */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-xs text-gray-600 ml-2">
            {language === 'markdown' ? 'Markdown 编辑器' : 'HTML 编辑器'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {lineCount} 行
        </span>
      </div>

      {/* 工具栏 - Markdown 模式 */}
      {language === 'markdown' && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-1">
          {/* 标题按钮 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertAtLineStart('# ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="标题 1"
            >
              <Heading1 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertAtLineStart('## ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="标题 2"
            >
              <Heading2 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertAtLineStart('### ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="标题 3"
            >
              <Heading3 className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 基础格式 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('**', '**', '粗体文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="粗体"
            >
              <Bold className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('*', '*', '斜体文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="斜体"
            >
              <Italic className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('~~', '~~', '删除线文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="删除线"
            >
              <Strikethrough className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 插入元素 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('[', '](url)', '链接文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入链接"
            >
              <Link className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('![alt](', ')', '图片URL')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入图片"
            >
              <Image className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('```\n', '\n```', '代码块')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入代码块"
            >
              <Code className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('```mermaid\ngraph TD\n    A[开始] --> B[处理]\n    B --> C[结束]\n', '```\n', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入 Mermaid 流程图"
            >
              <GitBranch className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('$', '$', 'E=mc^2')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入 LaTeX 数学公式"
            >
              <span className="text-sm font-serif text-gray-700">∑</span>
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 列表和表格 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertAtLineStart('- ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="无序列表"
            >
              <List className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertAtLineStart('1. ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="有序列表"
            >
              <ListOrdered className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n| 标题1 | 标题2 | 标题3 |\n|-------|-------|-------|\n| 内容1 | 内容2 | 内容3 |\n', '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入表格"
            >
              <Table className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 其他 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertAtLineStart('> ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="引用"
            >
              <Quote className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n---\n', '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="分割线"
            >
              <Minus className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* 工具栏 - HTML 模式 */}
      {language === 'html' && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-1">
          {/* 标题按钮 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('<h1>', '</h1>', '标题 1')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="标题 1"
            >
              <Heading1 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<h2>', '</h2>', '标题 2')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="标题 2"
            >
              <Heading2 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<h3>', '</h3>', '标题 3')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="标题 3"
            >
              <Heading3 className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 基础格式 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('<strong>', '</strong>', '粗体文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="粗体"
            >
              <Bold className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<em>', '</em>', '斜体文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="斜体"
            >
              <Italic className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<del>', '</del>', '删除线文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="删除线"
            >
              <Strikethrough className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 插入元素 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('<a href="url">', '</a>', '链接文本')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入链接"
            >
              <Link className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<img src="', '" alt="图片描述" />', '图片URL')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入图片"
            >
              <Image className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<pre><code>', '</code></pre>', '代码块')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入代码块"
            >
              <Code className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 列表和表格 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('\n<ul>\n  <li>', '</li>\n</ul>', '列表项')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="无序列表"
            >
              <List className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n<ol>\n  <li>', '</li>\n</ol>', '列表项')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="有序列表"
            >
              <ListOrdered className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n<table>\n  <thead>\n    <tr>\n      <th>标题1</th>\n      <th>标题2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>内容1</td>\n      <td>内容2</td>\n    </tr>\n  </tbody>\n</table>\n', '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="插入表格"
            >
              <Table className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 其他 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('<blockquote>', '</blockquote>', '引用内容')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="引用"
            >
              <Quote className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<p>', '</p>', '段落内容')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="段落"
            >
              <span className="text-xs font-mono text-gray-700">P</span>
            </button>
            <button
              onClick={() => insertText('\n<hr>\n', '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="分割线"
            >
              <Minus className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* 编辑器主体 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 行号 */}
        <div className="bg-gray-50 border-r border-gray-200 py-4 select-none overflow-hidden">
          <div className="px-3 text-right">
            {lineNumbers.map(line => (
              <div
                key={line}
                className="text-xs leading-6 text-gray-400 font-mono"
                style={{ height: '24px' }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* 文本区域 */}
        <textarea
          ref={scrollRef || textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 p-4 resize-none outline-none font-mono text-sm leading-6 bg-white text-gray-800"
          placeholder={language === 'markdown' ? '在此输入 Markdown 内容...' : '在此输入 HTML 内容...'}
          spellCheck={false}
          style={{
            fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
          }}
        />
      </div>
    </div>
  )
}