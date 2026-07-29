import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Shield, Zap, Code } from 'lucide-react'

/**
 * 关于我们页面
 */
export default function About() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">关于 MD2Tool</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
            {/* 项目简介 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">项目简介</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>MD2Tool</strong> 是一款完全免费、开源的在线文档格式转换工具，专注于 Markdown 与其他文档格式之间的互转。我们致力于为开发者和内容创作者提供简单、高效、安全的文档转换服务。
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                所有转换过程都在您的浏览器本地完成，我们不会收集、存储或上传您的任何文件内容，充分保护您的隐私和数据安全。
              </p>
            </section>

            {/* 核心特性 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">核心特性</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">多格式支持</h3>
                    <p className="text-gray-600">
                      支持 Markdown、Word、HTML、PDF、Excel 等多种文档格式的互转，满足不同场景需求。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">隐私保护</h3>
                    <p className="text-gray-600">
                      所有转换在浏览器本地完成，文件不上传服务器，保护您的敏感信息。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">快速高效</h3>
                    <p className="text-gray-600">
                      无需等待上传下载，本地即时转换，几秒钟即可完成文档格式转换。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Code className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">开源免费</h3>
                    <p className="text-gray-600">
                      完全开源免费，代码托管在 GitHub，欢迎社区贡献和改进。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 技术架构 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">技术架构</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">前端框架</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• React 18 + TypeScript</li>
                      <li>• Vite 构建工具</li>
                      <li>• Tailwind CSS 样式</li>
                      <li>• React Router 路由</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">转换引擎</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• docx: Word 文档生成</li>
                      <li>• mammoth: Word 文档解析</li>
                      <li>• marked: Markdown 解析</li>
                      <li>• jspdf: PDF 文档生成</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 适用场景 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">适用场景</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>开发者编写技术文档，需要转换为 Word 或 PDF 格式提交</li>
                <li>内容创作者将 Markdown 博客文章导出为多种格式</li>
                <li>团队协作文档格式转换，保持兼容性</li>
                <li>学生撰写作业，需要将 Markdown 转换为 Word 提交</li>
                <li>编写 API 文档，生成 PDF 格式的文档手册</li>
              </ul>
            </section>

            {/* 项目信息 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">项目信息</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-900">项目名称：</span>
                    <span className="text-gray-700">MD2Tool</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">开源协议：</span>
                    <span className="text-gray-700">MIT License</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">代码仓库：</span>
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
                    <span className="font-semibold text-gray-900">在线体验：</span>
                    <a
                      href="https://md2tool.pages.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://md2tool.pages.dev
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 贡献指南 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">参与贡献</h2>
              <p className="text-gray-700 leading-relaxed">
                我们欢迎所有形式的贡献，包括但不限于：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>提交 Bug 报告或功能建议</li>
                <li>改进文档和使用指南</li>
                <li>提交代码优化和新功能</li>
                <li>分享和推广本项目</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                请访问我们的{' '}
                <a
                  href="https://github.com/MrSleep404/md2tool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub 仓库
                </a>
                {' '}参与项目开发。
              </p>
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