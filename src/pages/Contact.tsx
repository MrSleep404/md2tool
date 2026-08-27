import { useTranslation } from 'react-i18next'
import { Github, MessageCircle, ExternalLink } from 'lucide-react'
import LocalizedLink from '../components/common/LocalizedLink'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { tList, tItems } from '../i18n/helpers'

/**
 * 联系方式页面
 */
export default function Contact() {
  const { t, i18n } = useTranslation()

  // 设置SEO
  useSEO(SEO_CONFIGS.contact, '/contact')

  const responseItems = tItems<{ label: string; text: string }>(t, 'static:contact.response.items')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LocalizedLink
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span>{t('common:backHome')}</span>
          </LocalizedLink>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('static:contact.title')}</h1>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
            {/* 联系方式说明 */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                {t('static:contact.intro')}
              </p>
            </section>

            {/* 联系方式列表 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('static:contact.ways.title')}</h2>

              <div className="space-y-6">
                {/* GitHub Issues */}
                <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <Github className="h-8 w-8 text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('static:contact.ways.githubIssues.title')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('static:contact.ways.githubIssues.desc')}
                    </p>
                    <a
                      href="https://github.com/MrSleep404/md2tool/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{t('static:contact.ways.githubIssues.button')}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* GitHub 仓库 */}
                <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <Github className="h-8 w-8 text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('static:contact.ways.repo.title')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('static:contact.ways.repo.desc')}
                    </p>
                    <a
                      href="https://github.com/MrSleep404/md2tool"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>{t('static:contact.ways.repo.button')}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* 在线体验 */}
                <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <ExternalLink className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('static:contact.ways.demo.title')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('static:contact.ways.demo.desc')}
                    </p>
                    <a
                      href={i18n.language === 'en' ? 'https://www.md2tool.com/en' : 'https://www.md2tool.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{t('static:contact.ways.demo.button')}</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 反馈建议 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:contact.feedback.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('static:contact.feedback.p')}
              </p>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('static:contact.feedback.boxTitle')}</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {tList(t, 'static:contact.feedback.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 响应时间 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:contact.response.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('static:contact.response.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                {responseItems.map((item, index) => (
                  <li key={index}>
                    <strong>{item.label}</strong>
                    {item.text}
                  </li>
                ))}
              </ul>
            </section>

            {/* 其他信息 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:contact.other.title')}</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-900 mr-3">{t('static:contact.other.projectName')}</span>
                    <span>MD2Tool</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-900 mr-3">{t('static:contact.other.license')}</span>
                    <span>MIT License</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-900 mr-3">{t('static:contact.other.maintainer')}</span>
                    <span>MrSleep404</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t('static:contact.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
