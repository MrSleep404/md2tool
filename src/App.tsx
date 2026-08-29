import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/common/ScrollToTop'
import LanguageSync from './components/common/LanguageSync'
import Home from './pages/Home'
import WordToMarkdown from './pages/WordToMarkdown'
import MarkdownToHtml from './pages/MarkdownToHtml'
import HtmlToMarkdown from './pages/HtmlToMarkdown'
import MarkdownToPdf from './pages/MarkdownToPdf'
import MarkdownToExcel from './pages/MarkdownToExcel'
import PrivacyPolicy from './pages/PrivacyPolicy'
import About from './pages/About'
import Contact from './pages/Contact'
import Help from './pages/Help'
import NotFound from './pages/NotFound'

/**
 * 页面路由表（相对路径，同时服务于中文无前缀和 /en 前缀两套路由）
 */
function PageRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="word-to-markdown" element={<WordToMarkdown />} />
      <Route path="markdown-to-html" element={<MarkdownToHtml />} />
      <Route path="html-to-markdown" element={<HtmlToMarkdown />} />
      <Route path="markdown-to-pdf" element={<MarkdownToPdf />} />
      <Route path="markdown-to-excel" element={<MarkdownToExcel />} />
      <Route path="help" element={<Help />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      {/* 未匹配路径：404 页面（注入 noindex 防止软 404 被收录） */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <LanguageSync />
      <Routes>
        {/* 英文版：/en 前缀；中文版：无前缀（保持历史收录 URL 不变） */}
        <Route path="/en/*" element={<PageRoutes />} />
        <Route path="/*" element={<PageRoutes />} />
      </Routes>
    </Layout>
  )
}

export default App
