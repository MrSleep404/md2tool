import { useTranslation } from 'react-i18next'
import {
  FileText,
  FileCode,
  FileDown,
  FileSpreadsheet,
  FileType,
  FileJson,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ChevronDown,
} from 'lucide-react'
import LocalizedLink from '../components/common/LocalizedLink'
import { useSEO, SEO_CONFIGS } from '../utils/seo'
import { tItems } from '../i18n/helpers'

/**
 * 操作说明页面：新手教程 + FAQ
 */

// 各工具的入口配置（文案来自语言包 static:help.tools.*）
const TOOL_LINKS = [
  { to: '/', key: 'mdToWord', icon: FileText },
  { to: '/word-to-markdown', key: 'wordToMarkdown', icon: FileType },
  { to: '/markdown-to-html', key: 'markdownToHtml', icon: FileCode },
  { to: '/html-to-markdown', key: 'htmlToMarkdown', icon: FileJson },
  { to: '/markdown-to-pdf', key: 'markdownToPdf', icon: FileDown },
  { to: '/markdown-to-excel', key: 'markdownToExcel', icon: FileSpreadsheet },
]

interface FaqItem {
  q: string
  a: string
}

export default function Help() {
  const { t } = useTranslation()

  // 设置SEO
  useSEO(SEO_CONFIGS.help, '/help')

  const tutorialSteps = tItems<{ title: string; content: string }>(t, 'static:help.tutorial.steps')
  const faqs = tItems<FaqItem>(t, 'static:help.faq.items')

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('static:help.title')}</h1>
          <p className="text-gray-600 leading-relaxed mb-10">
            {t('static:help.intro')}
          </p>

          {/* 快速导航：各工具入口 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('static:help.tools.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOL_LINKS.map((tool) => (
                <LocalizedLink
                  key={tool.key}
                  to={tool.to}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <tool.icon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{t(`static:help.tools.${tool.key}.title`)}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t(`static:help.tools.${tool.key}.description`)}</p>
                  </div>
                </LocalizedLink>
              ))}
            </div>
          </section>

          {/* 新手教程 */}
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('static:help.tutorial.title')}</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('static:help.tutorial.intro')}
            </p>
            <ol className="space-y-6">
              {tutorialSteps.map((step, index) => (
                <li key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.content}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 使用技巧 */}
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">{t('static:help.tips.title')}</h2>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>
                  {t('static:help.tips.latexA')}{' '}
                  <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">$...$</code>
                  {t('static:help.tips.latexB')}{' '}
                  <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">$$...$$</code>
                  {t('static:help.tips.latexC')}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>
                  {t('static:help.tips.codeblockA')}{' '}
                  <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">```python</code>{' '}
                  {t('static:help.tips.codeblockB')}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>
                  {t('static:help.tips.mermaidA')}{' '}
                  <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">```mermaid</code>{' '}
                  {t('static:help.tips.mermaidB')}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{t('static:help.tips.wordNote')}</span>
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section>
            <div className="flex items-center space-x-2 mb-6">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('static:help.faq.title')}</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-lg border border-gray-200 open:bg-gray-50"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none px-5 py-4 text-left font-medium text-gray-900 select-none">
                    <span>{faq.q}</span>
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 底部引导 */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              {t('static:help.bottom.a')}{' '}
              <LocalizedLink to="/contact" className="text-blue-600 hover:underline">
                {t('static:help.bottom.contact')}
              </LocalizedLink>{' '}
              {t('static:help.bottom.b')}{' '}
              <LocalizedLink to="/" className="text-blue-600 hover:underline">
                {t('static:help.bottom.home')}
              </LocalizedLink>{' '}
              {t('static:help.bottom.c')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
