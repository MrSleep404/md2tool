import { useEffect, useRef, useState } from 'react'

/**
 * 同步滚动 Hook
 * 用于同步两个容器的滚动位置
 * @param leftRef 左侧容器引用（编辑器）
 * @param rightRef 右侧容器引用（预览）
 * @param enabled 是否启用同步
 */
export function useSyncScroll(
  leftRef: React.RefObject<HTMLElement>,
  rightRef: React.RefObject<HTMLElement>,
  enabled: boolean
) {
  // 防止循环触发
  const isScrolling = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || !leftRef.current || !rightRef.current) return

    const leftElement = leftRef.current
    const rightElement = rightRef.current

    /**
     * 计算滚动比例并同步到另一个元素
     */
    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      if (isScrolling.current) return

      isScrolling.current = true

      // 计算滚动比例
      const sourceScrollHeight = source.scrollHeight - source.clientHeight
      const targetScrollHeight = target.scrollHeight - target.clientHeight

      if (sourceScrollHeight <= 0 || targetScrollHeight <= 0) {
        isScrolling.current = false
        return
      }

      // 计算比例
      const scrollRatio = source.scrollTop / sourceScrollHeight
      const targetScrollTop = scrollRatio * targetScrollHeight

      // 同步滚动
      target.scrollTop = targetScrollTop

      // 重置锁定状态
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        isScrolling.current = false
      }, 50)
    }

    /**
     * 左侧滚动事件处理
     */
    const handleLeftScroll = () => {
      if (rightRef.current) {
        syncScroll(leftElement, rightRef.current)
      }
    }

    /**
     * 右侧滚动事件处理
     */
    const handleRightScroll = () => {
      if (leftRef.current) {
        syncScroll(rightElement, leftRef.current)
      }
    }

    // 添加滚动事件监听
    leftElement.addEventListener('scroll', handleLeftScroll)
    rightElement.addEventListener('scroll', handleRightScroll)

    // 清理事件监听
    return () => {
      leftElement.removeEventListener('scroll', handleLeftScroll)
      rightElement.removeEventListener('scroll', handleRightScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, leftRef, rightRef])
}

/**
 * 同步滚动开关状态 Hook
 */
export function useSyncScrollState(initialEnabled: boolean = false) {
  const [enabled, setEnabled] = useState(initialEnabled)

  const toggle = () => setEnabled((prev) => !prev)

  return { enabled, setEnabled, toggle }
}