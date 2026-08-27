import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLangFromPath, localizedPath } from '../../i18n/lang'

const BANNER_DISMISS_KEY = 'md2tool:langBannerDismissed'

/**
 * 语言提示条
 * 仅在中文版页面、浏览器语言非中文、且用户未关闭过时显示，
 * 引导用户切换到英文版。不做任何自动跳转。
 */
export default function LangBanner() {
  const { t } = useTranslation('common')
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(BANNER_DISMISS_KEY) === '1'
  )

  const isEn = getLangFromPath(pathname) === 'en'
  const browserIsZh = navigator.language?.toLowerCase().startsWith('zh')

  if (isEn || dismissed || browserIsZh) return null

  const dismiss = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 text-sm">
        <span>{t('banner.text')}</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to={localizedPath(pathname, 'en')}
            onClick={dismiss}
            className="px-3 py-1 rounded-md bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors"
          >
            {t('banner.switch')}
          </Link>
          <button
            onClick={dismiss}
            aria-label={t('banner.dismiss')}
            className="p-1 rounded hover:bg-blue-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
