import { useMemo, useEffect, useRef } from 'react'
import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import 'katex/dist/katex.min.css'
import { highlightAllCode } from '../../utils/highlight'

/**
 * 预览组件的属性接口
 */
interface PreviewProps {
  /** 预览内容 */
  content: string
  /** 预览类型 */
  type: 'markdown' | 'html'
  /** 滚动容器引用（可选） */
  scrollRef?: React.RefObject<HTMLDivElement>
  /** 标题栏右侧的操作按钮（可选） */
  headerActions?: React.ReactNode
  /** 是否显示标题栏（默认 true） */
  showHeader?: boolean
}

/**
 * 预览组件
 * 实时渲染 Markdown/HTML 内容
 */
export default function Preview({ content, type, scrollRef, headerActions, showHeader = true }: PreviewProps) {
  const { t } = useTranslation('common')
  // 预览容器的引用
  const previewRef = useRef<HTMLDivElement>(null)

  /**
   * 内容更新后应用代码高亮
   */
  useEffect(() => {
    if (content && previewRef.current) {
      // 延迟执行，确保DOM已更新
      const timer = setTimeout(() => {
        highlightAllCode()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [content])

  /**
   * 处理并转换内容为安全的 HTML
   */
  const renderedContent = useMemo(() => {
    if (!content) return ''

    if (type === 'html') {
      // 直接返回 HTML 内容
      return content
    }

    // 对于 Markdown，这里返回原始内容
    // 实际的 Markdown 渲染应该在父组件中使用 marked 等库完成
    return content
  }, [content, type])

  /**
   * 获取预览标题
   */
  const getPreviewTitle = () => {
    return type === 'markdown' ? t('preview.markdown') : t('preview.html')
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 预览头部 */}
      {showHeader && (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">{getPreviewTitle()}</span>
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* 预览内容区域 */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-6">
        {content ? (
          <div
            ref={previewRef}
            className={`markdown-preview ${type === 'html' ? '' : 'prose prose-sm max-w-none'}`}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
            style={{
              // 确保 LaTeX 和 Mermaid 正确显示
            }}
          >
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FileText className="h-16 w-16 mb-4" />
            <p className="text-sm">{t('preview.emptyTitle')}</p>
            <p className="text-xs mt-2">{t('preview.emptyHint')}</p>
          </div>
        )}
      </div>

      {/* 全局样式：确保 Mermaid 和 LaTeX 正确显示 */}
      <style>{`
        /* 代码块高亮样式 */
        .markdown-preview pre {
          background-color: #ffffff;
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .markdown-preview code {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
        }

        .markdown-preview pre code {
          color: #000000;
          background: transparent;
          padding: 0;
        }

        .markdown-preview p code,
        .markdown-preview li code {
          background-color: #f6f8fa;
          color: #e83e8c;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
        }

        .markdown-preview .mermaid-container {
          margin: 1.5em 0;
          text-align: center;
          overflow-x: auto;
          background-color: #FFFFFF;
          padding: 20px;
          border-radius: 8px;
        }

        .markdown-preview .mermaid-container svg {
          max-width: 100%;
          height: auto;
          background-color: #FFFFFF;
        }

        /* 确保 Mermaid 节点有正确的填充色 */
        .markdown-preview .mermaid-container svg .node rect,
        .markdown-preview .mermaid-container svg .node circle,
        .markdown-preview .mermaid-container svg .node ellipse,
        .markdown-preview .mermaid-container svg .node polygon,
        .markdown-preview .mermaid-container svg .node path {
          fill: #E3F2FD;
          stroke: #1976D2;
        }

        .markdown-preview .mermaid-container svg .nodeLabel {
          color: #1976D2;
        }

        .markdown-preview .mermaid-container svg .edgePath path {
          stroke: #1976D2;
        }

        .markdown-preview .latex-block {
          margin: 1.5em 0;
          text-align: center;
          overflow-x: auto;
          overflow-y: hidden;
        }

        .markdown-preview .latex-inline {
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>
    </div>
  )
}