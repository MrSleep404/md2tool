import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLangFromPath } from '../../i18n/lang'

/**
 * 语言同步组件
 * URL 是语言的唯一事实来源：路由变化时同步 i18next 语言与 <html lang> 属性
 */
export default function LanguageSync() {
  const { i18n } = useTranslation()
  const { pathname } = useLocation()
  const lang = getLangFromPath(pathname)

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang, i18n])

  return null
}
