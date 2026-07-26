import { Shield, Lock, Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">隐私保护</h3>
              <p className="text-sm text-gray-600 mt-1">
                所有文件处理都在您的浏览器中完成，不会上传到服务器
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Lock className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">安全可靠</h3>
              <p className="text-sm text-gray-600 mt-1">
                不收集任何用户数据，关闭页面后临时数据自动清除
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Zap className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">快速高效</h3>
              <p className="text-sm text-gray-600 mt-1">
                本地即时转换，无需等待上传下载，几秒钟完成
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} MD2Tool. 免费使用，无需注册.
          </p>
        </div>
      </div>
    </footer>
  )
}