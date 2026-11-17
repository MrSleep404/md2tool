import { useEffect, useRef, useState } from 'react'

/** Adsterra 广告位脚本地址 */
const AD_SCRIPT_SRC = 'https://bauval.org/21/43b685842aa7549b0049428939139569'
/** Adsterra 广告容器 id（与后台广告位一一对应，同页面只能有一个） */
const AD_CONTAINER_ID = 'container-43b685842aa7549b0049428939139569'
/** 超时未渲染则收起广告位，避免网络不通时留下空白 */
const RENDER_TIMEOUT = 5000

/**
 * 广告位组件
 *
 * 采用动态注入脚本的方式而非写死在 index.html：
 * 1. SPA 路由切换后页面不会重载，脚本必须重新注入才能渲染新容器的广告
 * 2. 卸载时清理脚本与容器内容，避免同 id 容器重复填充
 * 3. 预留固定高度，防止广告加载造成的布局偏移（CLS）
 */
export default function AdBanner() {
  const [collapsed, setCollapsed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = AD_SCRIPT_SRC
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.dataset.adsterra = AD_CONTAINER_ID
    document.body.appendChild(script)

    let filled = false

    const timer = window.setTimeout(() => {
      if (!filled) {
        setCollapsed(true)
      }
    }, RENDER_TIMEOUT)

    const observer = new MutationObserver(() => {
      if (container.childElementCount > 0) {
        filled = true
        window.clearTimeout(timer)
        observer.disconnect()
      }
    })
    observer.observe(container, { childList: true, subtree: true })

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      script.remove()
      container.innerHTML = ''
    }
  }, [])

  if (collapsed) return null

  return (
    <div className="mt-8 flex justify-center">
      <div id={AD_CONTAINER_ID} ref={containerRef} />
    </div>
  )
}
