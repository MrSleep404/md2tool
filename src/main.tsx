import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './i18n'
import './index.css'
import { shouldRedirectRootToEn } from './i18n/detect'

// 首次访问根路径时按系统语言决定进入中文版还是英文版：
// 中文（含简繁）留在中文版；非中文进入 /en。用户手动选择过语言或爬虫访问时不跳转。
if (shouldRedirectRootToEn(window.location.pathname)) {
  window.location.replace(`/en${window.location.search}${window.location.hash}`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
