import { useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * 编辑器示例内容管理
 * 1. 首次挂载时填充当前语言的示例内容
 * 2. 切换界面语言后，若编辑器内容仍是上一语言的示例（未被用户修改），自动替换为新语言示例；
 *    用户已修改的内容保持不变
 */
export function useExampleContent(
  example: string,
  setContent: Dispatch<SetStateAction<string>>
) {
  const lastExampleRef = useRef(example)
  const initializedRef = useRef(false)

  useEffect(() => {
    // 首次挂载：填充示例内容
    if (!initializedRef.current) {
      initializedRef.current = true
      setContent(example)
      return
    }
    // 语言切换：示例内容更新时，仅替换未被用户修改过的编辑器内容
    const lastExample = lastExampleRef.current
    if (lastExample === example) return
    lastExampleRef.current = example
    setContent((prev) => (prev === lastExample ? example : prev))
  }, [example, setContent])
}
