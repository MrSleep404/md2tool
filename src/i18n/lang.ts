/**
 * 语言与路径的映射工具
 * URL 约定：/en 前缀 = 英文，其余 = 中文（中文版 URL 保持与历史收录一致）
 */

export type Lang = 'zh' | 'en'

/** 根据路径判断当前语言 */
export function getLangFromPath(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/')
    ? 'en'
    : 'zh'
}

/**
 * 把「当前页面路径」转换为目标语言的对应路径
 * 用于语言切换器等场景
 */
export function localizedPath(pathname: string, lang: Lang): string {
  const isEn = getLangFromPath(pathname) === 'en'
  if (lang === 'en') {
    return isEn ? pathname : pathname === '/' ? '/en' : `/en${pathname}`
  }
  if (!isEn) return pathname
  return pathname === '/en' ? '/' : pathname.replace(/^\/en(?=\/|$)/, '')
}

/**
 * 把「站内路由目标」转换为目标语言的链接
 * 用于渲染各语言下的内部链接（如 /about -> /en/about）
 */
export function localizedTo(to: string, lang: Lang): string {
  if (lang === 'en') {
    return to === '/' ? '/en' : `/en${to}`
  }
  return to
}
