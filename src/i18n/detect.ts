import type { Lang } from './lang'

/** 用户手动选择语言的存储键（存在即代表用户显式选过，之后不再自动跳转） */
const PREF_KEY = 'md2tool:langPref'

/**
 * 常见搜索引擎与社交平台爬虫特征。
 * 命中时不自动跳转，避免爬虫（其 navigator.language 多为 en-US）
 * 抓取中文页时被重定向到英文版，影响中文页收录。
 */
const CRAWLER_RE =
  /bot|crawler|spider|crawling|slurp|baiduspider|yandex|sogou|bytespider|applebot|google-inspectiontool|googleother|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|whatsapp|gptbot|chatgpt-user|claudebot|perplexitybot|petalbot|semrushbot|ahrefsbot|lighthouse|pagespeed/i

/** 读取用户手动选择的语言，未选择过返回 null */
export function getSavedLangPref(): Lang | null {
  try {
    const value = localStorage.getItem(PREF_KEY)
    return value === 'zh' || value === 'en' ? value : null
  } catch {
    // 隐私模式下 localStorage 不可用，按未选择处理
    return null
  }
}

/** 记录用户手动选择的语言 */
export function saveLangPref(lang: Lang): void {
  try {
    localStorage.setItem(PREF_KEY, lang)
  } catch {
    // 忽略存储失败
  }
}

/** 系统语言是否为中文（简体、繁体、港澳台均视为中文） */
export function isSystemLangZh(): boolean {
  const list = navigator.languages?.length ? navigator.languages : [navigator.language]
  const primary = list[0] ?? ''
  return primary.toLowerCase().startsWith('zh')
}

/** 当前访问者是否为爬虫 */
export function isCrawler(): boolean {
  return CRAWLER_RE.test(navigator.userAgent || '')
}

/**
 * 是否需要把根路径首页自动切换到英文版
 *
 * 规则（按优先级）：
 * 1. 仅对根路径 `/` 生效，内页保持 URL 原样（保护已收录的中文内页）
 * 2. 爬虫不跳转（保护中文版收录）
 * 3. 用户手动选过语言则以用户选择为准
 * 4. 未选择过时按系统语言：中文留在中文版，非中文进入英文版
 */
export function shouldRedirectRootToEn(pathname: string): boolean {
  if (pathname !== '/') return false
  if (isCrawler()) return false

  const pref = getSavedLangPref()
  if (pref === 'zh') return false
  if (pref === 'en') return true

  return !isSystemLangZh()
}
