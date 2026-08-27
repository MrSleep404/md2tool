import { useTranslation } from 'react-i18next'
import LocalizedLink from '../components/common/LocalizedLink'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { tItems } from '../i18n/helpers'

/**
 * 隐私政策页面
 */
export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation()

  // 设置SEO
  useSEO(SEO_CONFIGS.privacyPolicy, '/privacy-policy')

  const locale = i18n.language === 'en' ? 'en-US' : 'zh-CN'
  const lastUpdated = new Date().toLocaleDateString(locale)

  const labeledList = (key: string) =>
    tItems<{ label: string; text: string }>(t, key)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('static:privacy.title')}</h1>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <p className="text-sm text-gray-500">
              {t('static:privacy.lastUpdated', { date: lastUpdated })}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.intro.title')}</h2>
              <p>
                {t('static:privacy.intro.p1')}
              </p>
              <p>
                {t('static:privacy.intro.p2')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.collection.title')}</h2>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('static:privacy.collection.weCollectTitle')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {labeledList('static:privacy.collection.weCollect').map((item, index) => (
                  <li key={index}><strong>{item.label}</strong>{item.text}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3 mt-6">{t('static:privacy.collection.weDontTitle')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {labeledList('static:privacy.collection.weDont').map((item, index) => (
                  <li key={index}><strong>{item.label}</strong>{item.text}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.cookies.title')}</h2>
              <p>{t('static:privacy.cookies.p')}</p>
              <ul className="list-disc pl-6 space-y-2">
                {labeledList('static:privacy.cookies.items').map((item, index) => (
                  <li key={index}><strong>{item.label}</strong>{item.text}</li>
                ))}
              </ul>
              <p className="mt-4">
                {t('static:privacy.cookies.p2')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.ads.title')}</h2>
              <p>
                {t('static:privacy.ads.p1')}
              </p>
              <p className="mt-3">
                {t('static:privacy.ads.p2a')}{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t('static:privacy.ads.adsSettingsLink')}
                </a>{' '}
                {t('static:privacy.ads.p2b')}
              </p>
              <p className="mt-3">
                {t('static:privacy.ads.p3a')}{' '}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t('static:privacy.ads.aboutAdsLink')}
                </a>{' '}
                {t('static:privacy.ads.p3b')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.security.title')}</h2>
              <p>
                {t('static:privacy.security.p')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.thirdParty.title')}</h2>
              <p>
                {t('static:privacy.thirdParty.p')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.children.title')}</h2>
              <p>
                {t('static:privacy.children.p')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.changes.title')}</h2>
              <p>
                {t('static:privacy.changes.p')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('static:privacy.contactUs.title')}</h2>
              <p>
                {t('static:privacy.contactUs.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>GitHub Issues: <a href="https://github.com/MrSleep404/md2tool" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://github.com/MrSleep404/md2tool</a></li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t('static:privacy.copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
