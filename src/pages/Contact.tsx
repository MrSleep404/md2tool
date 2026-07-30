import { Link } from 'react-router-dom'
import { ArrowLeft, Github, MessageCircle, ExternalLink } from 'lucide-react'
import { useSEO, SEO_CONFIGS } from '../utils/seo'

/**
 * 联系方式页面
 */
export default function Contact() {
  // 设置SEO
  useSEO(SEO_CONFIGS.contact)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">联系我们</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
            {/* 联系方式说明 */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                感谢您对 MD2Tool 的关注！我们非常重视您的反馈和建议。您可以通过以下方式联系我们：
              </p>
            </section>

            {/* 联系方式列表 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">联系方式</h2>
              
              <div className="space-y-6">
                {/* GitHub Issues */}
                <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <Github className="h-8 w-8 text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub Issues</h3>
                    <p className="text-gray-600 mb-4">
                      如果您遇到 Bug 或有功能建议，请提交 Issue。我们会尽快回复。
                    </p>
                    <a
                      href="https://github.com/MrSleep404/md2tool/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>提交 Issue</span>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub 仓库</h3>
                    <p className="text-gray-600 mb-4">
                      访问项目仓库，查看源代码、提交 Pull Request 或参与讨论。
                    </p>
                    <a
                      href="https://github.com/MrSleep404/md2tool"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>访问仓库</span>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">在线体验</h3>
                    <p className="text-gray-600 mb-4">
                      直接访问在线版本，立即体验所有转换功能。
                    </p>
                    <a
                      href="https://www.md2tool.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>立即体验</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 反馈建议 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">反馈与建议</h2>
              <p className="text-gray-700 leading-relaxed">
                我们非常欢迎您的反馈！无论是 Bug 报告、功能建议还是使用体验，您的意见都将帮助我们改进产品。
              </p>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">提交反馈时，建议包含以下信息：</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>问题的详细描述或功能的详细说明</li>
                  <li>复现问题的步骤（如果是 Bug）</li>
                  <li>期望的行为和实际的行为</li>
                  <li>浏览器类型和版本（如果相关）</li>
                  <li>截图或录屏（如果有助于理解问题）</li>
                </ul>
              </div>
            </section>

            {/* 响应时间 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">响应时间</h2>
              <p className="text-gray-700 leading-relaxed">
                我们会尽快回复您的反馈。通常情况下：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li><strong>Bug 报告：</strong>1-3 个工作日内回复</li>
                <li><strong>功能建议：</strong>1-5 个工作日内回复</li>
                <li><strong>Pull Request：</strong>3-7 个工作日内审核</li>
              </ul>
            </section>

            {/* 其他信息 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">其他信息</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-900 mr-3">项目名称：</span>
                    <span>MD2Tool</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-900 mr-3">开源协议：</span>
                    <span>MIT License</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-900 mr-3">维护者：</span>
                    <span>MrSleep404</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} MD2Tool. 保留所有权利。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}