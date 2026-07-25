import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, FileDown, Code, Table, FileType, ArrowRightLeft, FileCode, FileInput } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Markdown 转 Word', icon: FileText },
  { path: '/word-to-markdown', label: 'Word 转 Markdown', icon: FileInput },
  { path: '/markdown-to-html', label: 'Markdown 转 HTML', icon: Code },
  { path: '/html-to-markdown', label: 'HTML 转 Markdown', icon: FileCode },
  { path: '/markdown-to-pdf', label: 'Markdown 转 PDF', icon: FileDown },
  { path: '/markdown-to-excel', label: 'Markdown 转 Excel', icon: Table },
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
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 根据当前路由获取对应的图标和颜色
  const LogoIcon = getPageIcon(location.pathname)
  const logoColor = getPageIconColor(location.pathname)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <LogoIcon className={`h-8 w-8 ${logoColor}`} />
            <span className="text-xl font-bold text-gray-900">文档转换工具</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="菜单"
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
          <nav className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}