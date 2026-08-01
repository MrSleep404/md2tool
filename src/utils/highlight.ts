/**
 * 代码高亮工具函数
 * 使用highlight.js实现代码语法高亮
 */

// 声明hljs全局变量
declare global {
  interface Window {
    hljs?: {
      highlightElement: (element: HTMLElement) => void
      highlightAll: () => void
    }
  }
}

/**
 * 高亮页面中的所有代码块
 * 在DOM更新后调用
 */
export function highlightAllCode() {
  if (typeof window !== 'undefined' && window.hljs) {
    try {
      window.hljs.highlightAll()
    } catch (error) {
      console.error('代码高亮失败:', error)
    }
  }
}

/**
 * 高亮指定的代码元素
 */
export function highlightElement(element: HTMLElement) {
  if (typeof window !== 'undefined' && window.hljs) {
    try {
      window.hljs.highlightElement(element)
    } catch (error) {
      console.error('代码高亮失败:', error)
    }
  }
}

/**
 * 获取代码块的高亮样式CSS
 * 用于Word文档中的代码块样式
 */
export function getCodeBlockStyles() {
  return {
    backgroundColor: 'F6F8FA', // 浅灰色背景
    fontFamily: 'Courier New',
    fontSize: 10,
    padding: 10,
    borderLeft: 3, // 左侧边框
    borderColor: '28A745', // 绿色边框
  }
}