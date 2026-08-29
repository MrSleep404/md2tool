import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { RELATED_TOOLS, seoI18nKey, type SeoPageKey } from '../utils/seo'
import { tItems } from '../i18n/helpers'

/** 各主题色样式映射（与各页 hero 渐变色一致） */
const ACCENT_STYLES = {
  primary: { num: 'bg-primary-100 text-primary-600', border: 'hover:border-primary-300 hover:shadow-md', icon: 'text-primary-600' },
  green: { num: 'bg-green-100 text-green-600', border: 'hover:border-green-300 hover:shadow-md', icon: 'text-green-600' },
  orange: { num: 'bg-orange-100 text-orange-600', border: 'hover:border-orange-300 hover:shadow-md', icon: 'text-orange-600' },
  purple: { num: 'bg-purple-100 text-purple-600', border: 'hover:border-purple-300 hover:shadow-md', icon: 'text-purple-600' },
  red: { num: 'bg-red-100 text-red-600', border: 'hover:border-red-300 hover:shadow-md', icon: 'text-red-600' },
  indigo: { num: 'bg-indigo-100 text-indigo-600', border: 'hover:border-indigo-300 hover:shadow-md', icon: 'text-indigo-600' },
} as const

export type PageAccent = keyof typeof ACCENT_STYLES

interface PageSeoBlockProps {
  pageKey: SeoPageKey
  accent: PageAccent
}

/**
 * 页面底部 SEO 内容区块：功能介绍 + FAQ + 相关工具内链
 * 文案全部来自 i18n（pages:{pageKey}.intro / .faq），文案未就绪时自动不渲染
 */
export default function PageSeoBlock({ pageKey, accent }: PageSeoBlockProps) {
  const { t } = useTranslation()
  // 首页文案在 home namespace（无层级前缀），其余页在 pages namespace
  const ns = pageKey === 'home' ? 'home' : 'pages'
  const intro = t(seoI18nKey(ns, pageKey, 'intro'), { defaultValue: '' })
  const faq = tItems<{ q: string; a: string }>(t, seoI18nKey(ns, pageKey, 'faq'))
  const related = RELATED_TOOLS[pageKey]
  const s = ACCENT_STYLES[accent] ?? ACCENT_STYLES.green

  // 文案尚未配置时不渲染空区块
  if (!intro && faq.length === 0) return null

  return (
    <div className="mt-10 space-y-8">
      {intro && (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">{t('pages:seoSection.introTitle')}</h2>
          <p className="text-gray-600 leading-relaxed">{intro}</p>
        </section>
      )}

      {faq.length > 0 && (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages:seoSection.faqTitle')}</h2>
          <dl className="space-y-5">
            {faq.map((item, index) => (
              <div key={index}>
                <dt className="flex items-start font-medium text-gray-800">
                  <span
                    className={`flex-shrink-0 w-6 h-6 ${s.num} rounded-full flex items-center justify-center text-sm mr-3 mt-0.5`}
                  >
                    {index + 1}
                  </span>
                  {item.q}
                </dt>
                <dd className="mt-2 ml-9 text-gray-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages:seoSection.relatedTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {related.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-colors ${s.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-6 w-6 ${s.icon}`} />
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">{t(seoI18nKey(tool.ns, tool.pageKey, 'hero.title'))}</h3>
                <p className="text-sm text-gray-600">{t(seoI18nKey(tool.ns, tool.pageKey, 'hero.subtitle'))}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
