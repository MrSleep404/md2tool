import { useTranslation } from 'react-i18next'
import { Shield, Lock, Zap } from 'lucide-react'
import LocalizedLink from '../common/LocalizedLink'

export default function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t('footer.privacyTitle')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('footer.privacyDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Lock className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t('footer.securityTitle')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('footer.securityDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Zap className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t('footer.fastTitle')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('footer.fastDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('footer.copyright', { year: new Date().getFullYear() })}{' '}
            <LocalizedLink to="/about" className="text-blue-600 hover:underline">
              {t('footer.about')}
            </LocalizedLink>
            {' · '}
            <LocalizedLink to="/contact" className="text-blue-600 hover:underline">
              {t('footer.contact')}
            </LocalizedLink>
            {' · '}
            <LocalizedLink to="/help" className="text-blue-600 hover:underline">
              {t('footer.help')}
            </LocalizedLink>
            {' · '}
            <LocalizedLink to="/privacy-policy" className="text-blue-600 hover:underline">
              {t('footer.privacy')}
            </LocalizedLink>
          </p>
        </div>
      </div>
    </footer>
  )
}
