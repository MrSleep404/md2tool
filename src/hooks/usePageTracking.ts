import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    /** 百度统计命令队列，由 index.html 初始化 */
    _hmt: Array<[string, ...unknown[]]>
  }
}

/**
 * 百度统计 SPA 路由上报
 * hm.js 首次加载时会自动上报当前 URL，因此跳过首屏推送避免重复计数；
 * 之后每次路由变化（含中英文版本切换）推送一条 pageview
 */
export function usePageTracking() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!window._hmt) return
    window._hmt.push(['_trackPageview', location.pathname + location.search])
  }, [location])
}
