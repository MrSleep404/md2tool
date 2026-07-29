import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * 隐私政策页面
 */
export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <p className="text-sm text-gray-500">
              最后更新日期：{new Date().toLocaleDateString('zh-CN')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">引言</h2>
              <p>
                MD2Tool（以下简称"我们"）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用、披露和管理您的个人信息。
              </p>
              <p>
                使用本网站即表示您同意本隐私政策的条款。如果您不同意本政策，请勿使用本网站。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">信息收集</h2>
              <h3 className="text-lg font-medium text-gray-900 mb-3">我们收集的信息</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>使用数据：</strong>我们可能收集有关您如何使用网站的信息，包括访问的页面、访问时间、停留时间等。</li>
                <li><strong>设备信息：</strong>我们可能收集有关您使用的设备类型、浏览器类型、操作系统等信息。</li>
                <li><strong>Cookie：</strong>我们使用 Cookie 和类似技术来改善用户体验和分析网站流量。</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3 mt-6">我们不收集的信息</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>上传的文件内容：</strong>我们承诺不收集、存储或传输您上传到网站进行转换的任何文件内容。所有文件转换均在您的浏览器本地完成。</li>
                <li><strong>个人身份信息：</strong>我们不需要您注册账号，不收集姓名、邮箱、电话等个人身份信息。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie 和跟踪技术</h2>
              <p>我们使用以下类型的 Cookie：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>必要 Cookie：</strong>网站正常运行所必需的 Cookie。</li>
                <li><strong>分析 Cookie：</strong>用于分析网站使用情况和改善用户体验的 Cookie。</li>
                <li><strong>广告 Cookie：</strong>用于展示个性化广告的 Cookie（详见下方"广告服务"部分）。</li>
              </ul>
              <p className="mt-4">
                您可以在浏览器设置中管理 Cookie 偏好。请注意，禁用某些 Cookie 可能会影响网站功能。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">广告服务（Google AdSense）</h2>
              <p>
                我们使用 Google AdSense 在网站上展示广告。Google AdSense 使用 Cookie 来根据用户之前的访问记录或其他网站的兴趣展示广告。
              </p>
              <p className="mt-3">
                Google 可能会使用 Cookie 和类似技术来收集有关您访问本网站和其他网站的信息，目的是根据您的兴趣展示广告。您可以通过访问{' '}
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google 广告设置
                </a>{' '}
                来关闭个性化广告。
              </p>
              <p className="mt-3">
                您也可以访问{' '}
                <a 
                  href="https://www.aboutads.info" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.aboutads.info
                </a>{' '}
                了解有关第三方广告 Cookie 的更多信息。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">数据安全</h2>
              <p>
                我们采取适当的安全措施来保护您的信息免受未经授权的访问、使用或披露。然而，互联网传输无法保证 100% 安全，我们无法保证传输信息的安全性。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第三方链接</h2>
              <p>
                本网站可能包含指向第三方网站的链接。我们不对这些网站的隐私政策或内容负责。建议您阅读这些网站的隐私政策。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">儿童隐私</h2>
              <p>
                本网站不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人信息。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">隐私政策变更</h2>
              <p>
                我们可能不时更新本隐私政策。任何变更将在此页面上发布，并更新"最后更新日期"。建议您定期查看本页面。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">联系我们</h2>
              <p>
                如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>GitHub Issues: <a href="https://github.com/MrSleep404/md2tool" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://github.com/MrSleep404/md2tool</a></li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} MD2Tool. 保留所有权利。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}