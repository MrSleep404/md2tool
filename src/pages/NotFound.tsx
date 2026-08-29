import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNoIndex } from '../utils/seo'

/**
 * 404 页面：处理所有未匹配的路由
 * 动态注入 noindex，避免爬虫收录无效 URL（软 404）
 */
export default function NotFound() {
  const { t } = useTranslation()
  useNoIndex()

  useEffect(() => {
    document.title = `${t('static:notFound.title')} - MD2Tool`
  }, [t])

  return (
    <div className="min-h-[calc(100vh-16rem)] bg-gray-50 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('static:notFound.title')}</h1>
        <p className="text-gray-600 mb-8">{t('static:notFound.description')}</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('static:notFound.backHome')}
          </Link>
          <Link
            to="/help"
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('static:notFound.goHelp')}
          </Link>
        </div>
      </div>
    </div>
  )
}
