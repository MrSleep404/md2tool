import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, FileText, FileDown, Code, Table, FileType, FileCode, FileInput } from 'lucide-react'
import LocalizedLink from '../common/LocalizedLink'
import { getLangFromPath, localizedPath } from '../../i18n/lang'

const navItems = [
  { path: '/', key: 'home', icon: FileText },
  { path: '/word-to-markdown', key: 'wordToMarkdown', icon: FileInput },
  { path: '/markdown-to-html', key: 'markdownToHtml', icon: Code },
  { path: '/html-to-markdown', key: 'htmlToMarkdown', icon: FileCode },
  { path: '/markdown-to-pdf', key: 'markdownToPdf', icon: FileDown },
  { path: '/markdown-to-excel', key: 'markdownToExcel', icon: Table },
]

// 根据路由返回对应的图标
function getPageIcon(path: string) {
  switch (path) {
    case '/':
      return FileText // Markdown 转 Word -> Word 文档图标
    case '/word-to-markdown':
      return FileInput // Word 转 Markdown -> 文件输入图标
    case '/markdown-to-html':
      return Code // Markdown 转 HTML -> HTML 代码图标
    case '/html-to-markdown':
      return FileCode // HTML 转 Markdown -> HTML 文件图标
    case '/markdown-to-pdf':
      return FileDown // Markdown 转 PDF -> PDF 图标
    case '/markdown-to-excel':
      return Table // Markdown 转 Excel -> Excel 表格图标
    default:
      return FileType // 默认图标
  }
}

// 根据路由返回对应的图标颜色（与功能介绍区域底色对应）
function getPageIconColor(path: string) {
  switch (path) {
    case '/':
      return 'text-primary-600' // Markdown 转 Word -> primary
    case '/word-to-markdown':
      return 'text-green-600' // Word 转 Markdown -> green
    case '/markdown-to-html':
      return 'text-orange-500' // Markdown 转 HTML -> orange
    case '/html-to-markdown':
      return 'text-purple-600' // HTML 转 Markdown -> purple
    case '/markdown-to-pdf':
      return 'text-red-600' // Markdown 转 PDF -> red
    case '/markdown-to-excel':
      return 'text-indigo-600' // Markdown 转 Excel -> indigo
    default:
      return 'text-primary-600' // 默认颜色
  }
}

export default function Header() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isEn = getLangFromPath(location.pathname) === 'en'

  // 去掉语言前缀的"核心路径"，用于图标/高亮判断
  const corePath = isEn
    ? location.pathname === '/en'
      ? '/'
      : location.pathname.slice(3)
    : location.pathname

  // 根据当前路由获取对应的图标和颜色
  const LogoIcon = getPageIcon(corePath)
  const logoColor = getPageIconColor(corePath)

  // 语言切换目标地址（保持当前页面）
  const switchTarget = localizedPath(location.pathname, isEn ? 'zh' : 'en')

  const isActive = (path: string) => corePath === path

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <LocalizedLink to="/" className="flex items-center space-x-2">
            <LogoIcon className={`h-8 w-8 ${logoColor}`} />
            <span className="text-3xl font-bold">
              <span className={logoColor}>MD</span>
              <span className="text-gray-900">2Tool</span>
            </span>
          </LocalizedLink>

          {/* Desktop Navigation（xl 起才放得下完整导航 + 语言切换，避免挤压换行） */}
          <nav className="hidden xl:flex items-center space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <LocalizedLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-1.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t(`nav.${item.key}`)}</span>
                </LocalizedLink>
              )
            })}

            {/* 语言切换 */}
            <Link
              to={switchTarget}
              title={t('switchLangTitle')}
              className="flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('switchLang')}</span>
            </Link>
          </nav>

          {/* Mobile: language switch + menu button */}
          <div className="xl:hidden flex items-center space-x-2">
            <Link
              to={switchTarget}
              title={t('switchLangTitle')}
              className="flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('switchLang')}</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label={t('menu')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="xl:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <LocalizedLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(`nav.${item.key}`)}</span>
                  </LocalizedLink>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
