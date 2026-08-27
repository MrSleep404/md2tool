import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Link, Image, Code, List, ListOrdered, Table, Quote, Minus, GitBranch } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('common')
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
            {language === 'markdown' ? t('editor.markdown') : t('editor.html')}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {lineCount} {t('editor.lines')}
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
              title={t('editor.toolbar.h1')}
            >
              <Heading1 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertAtLineStart('## ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.h2')}
            >
              <Heading2 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertAtLineStart('### ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.h3')}
            >
              <Heading3 className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 基础格式 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('**', '**', t('editor.placeholder.boldText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.bold')}
            >
              <Bold className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('*', '*', t('editor.placeholder.italicText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.italic')}
            >
              <Italic className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('~~', '~~', t('editor.placeholder.strikeText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.strike')}
            >
              <Strikethrough className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 插入元素 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('[', '](url)', t('editor.placeholder.linkText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.link')}
            >
              <Link className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('![alt](', ')', t('editor.placeholder.imageUrl'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.image')}
            >
              <Image className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('```\n', '\n```', t('editor.placeholder.codeBlock'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.code')}
            >
              <Code className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('```mermaid\n' + t('editor.snippets.mermaid'), '```\n', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.mermaid')}
            >
              <GitBranch className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('$', '$', 'E=mc^2')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.latex')}
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
              title={t('editor.toolbar.ul')}
            >
              <List className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertAtLineStart('1. ')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.ol')}
            >
              <ListOrdered className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n' + t('editor.snippets.mdTable'), '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.table')}
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
              title={t('editor.toolbar.quote')}
            >
              <Quote className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n---\n', '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.hr')}
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
              onClick={() => insertText('<h1>', '</h1>', t('editor.toolbar.h1'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.h1')}
            >
              <Heading1 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<h2>', '</h2>', t('editor.toolbar.h2'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.h2')}
            >
              <Heading2 className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<h3>', '</h3>', t('editor.toolbar.h3'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.h3')}
            >
              <Heading3 className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 基础格式 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('<strong>', '</strong>', t('editor.placeholder.boldText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.bold')}
            >
              <Bold className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<em>', '</em>', t('editor.placeholder.italicText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.italic')}
            >
              <Italic className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<del>', '</del>', t('editor.placeholder.strikeText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.strike')}
            >
              <Strikethrough className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 插入元素 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('<a href="url">', '</a>', t('editor.placeholder.linkText'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.link')}
            >
              <Link className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<img src="', '" alt="' + t('editor.placeholder.imageDesc') + '" />', t('editor.placeholder.imageUrl'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.image')}
            >
              <Image className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<pre><code>', '</code></pre>', t('editor.placeholder.codeBlock'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.code')}
            >
              <Code className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 列表和表格 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('\n<ul>\n  <li>', '</li>\n</ul>', t('editor.placeholder.listItem'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.ul')}
            >
              <List className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n<ol>\n  <li>', '</li>\n</ol>', t('editor.placeholder.listItem'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.ol')}
            >
              <ListOrdered className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('\n' + t('editor.snippets.htmlTable'), '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.table')}
            >
              <Table className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* 其他 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <button
              onClick={() => insertText('<blockquote>', '</blockquote>', t('editor.placeholder.quoteContent'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.quote')}
            >
              <Quote className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => insertText('<p>', '</p>', t('editor.placeholder.paraContent'))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.paragraph')}
            >
              <span className="text-xs font-mono text-gray-700">P</span>
            </button>
            <button
              onClick={() => insertText('\n<hr>\n', '', '')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={t('editor.toolbar.hr')}
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
          placeholder={language === 'markdown' ? t('editor.placeholderMd') : t('editor.placeholderHtml')}
          spellCheck={false}
          style={{
            fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
          }}
        />
      </div>
    </div>
  )
}
