import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import WordToMarkdown from './pages/WordToMarkdown'
import MarkdownToHtml from './pages/MarkdownToHtml'
import HtmlToMarkdown from './pages/HtmlToMarkdown'
import MarkdownToPdf from './pages/MarkdownToPdf'
import MarkdownToExcel from './pages/MarkdownToExcel'
import PrivacyPolicy from './pages/PrivacyPolicy'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/word-to-markdown" element={<WordToMarkdown />} />
        <Route path="/markdown-to-html" element={<MarkdownToHtml />} />
        <Route path="/html-to-markdown" element={<HtmlToMarkdown />} />
        <Route path="/markdown-to-pdf" element={<MarkdownToPdf />} />
        <Route path="/markdown-to-excel" element={<MarkdownToExcel />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Layout>
  )
}

export default App