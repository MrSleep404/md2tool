import { useTranslation } from 'react-i18next'
import { FileText, Shield, Zap, Code } from 'lucide-react'
import LocalizedLink from '../components/common/LocalizedLink'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { tList } from '../i18n/helpers'

/**
 * 关于我们页面
 */
export default function About() {
  const { t } = useTranslation()

  // 设置SEO
  useSEO(SEO_CONFIGS.about, '/about')

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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('static:about.title')}</h1>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
            {/* 项目简介 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:about.introTitle')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('static:about.intro.p1')}
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                {t('static:about.intro.p2')}
              </p>
            </section>

            {/* 核心特性 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:about.features.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('static:about.features.multiFormat.title')}</h3>
                    <p className="text-gray-600">
                      {t('static:about.features.multiFormat.desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('static:about.features.privacy.title')}</h3>
                    <p className="text-gray-600">
                      {t('static:about.features.privacy.desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('static:about.features.fast.title')}</h3>
                    <p className="text-gray-600">
                      {t('static:about.features.fast.desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Code className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('static:about.features.openSource.title')}</h3>
                    <p className="text-gray-600">
                      {t('static:about.features.openSource.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 技术架构 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:about.tech.title')}</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('static:about.tech.frontendTitle')}</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tList(t, 'static:about.tech.frontend').map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('static:about.tech.engineTitle')}</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tList(t, 'static:about.tech.engines').map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 适用场景 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:about.scenarios.title')}</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                {tList(t, 'static:about.scenarios.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* 项目信息 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:about.info.title')}</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-900">{t('static:about.info.projectName')}</span>
                    <span className="text-gray-700">MD2Tool</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{t('static:about.info.license')}</span>
                    <span className="text-gray-700">MIT License</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{t('static:about.info.repo')}</span>
                    <a
                      href="https://github.com/MrSleep404/md2tool"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://github.com/MrSleep404/md2tool
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{t('static:about.info.demo')}</span>
                    <a
                      href="https://www.md2tool.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://www.md2tool.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 贡献指南 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:about.contribute.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('static:about.contribute.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                {tList(t, 'static:about.contribute.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                {t('static:about.contribute.p2a')}{' '}
                <a
                  href="https://github.com/MrSleep404/md2tool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t('static:about.contribute.repoLink')}
                </a>
                {' '}{t('static:about.contribute.p2b')}
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t('static:about.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
