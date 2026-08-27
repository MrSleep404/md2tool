import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import zhCommon from './locales/zh/common.json'
import zhHome from './locales/zh/home.json'
import zhTools from './locales/zh/tools.json'
import zhPages from './locales/zh/pages.json'
import zhStatic from './locales/zh/static.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enTools from './locales/en/tools.json'
import enPages from './locales/en/pages.json'
import enStatic from './locales/en/static.json'

// URL 是语言状态的唯一事实来源：/en 前缀为英文，其余为中文。
// 初始化时直接根据地址栏判定语言，保证首屏渲染语言正确（避免示例内容闪烁）。
const initialLang =
  window.location.pathname === '/en' || window.location.pathname.startsWith('/en/')
    ? 'en'
    : 'zh'

i18n.use(initReactI18next).init({
  resources: {
    zh: {
      common: zhCommon,
      home: zhHome,
      tools: zhTools,
      pages: zhPages,
      static: zhStatic,
    },
    en: {
      common: enCommon,
      home: enHome,
      tools: enTools,
      pages: enPages,
      static: enStatic,
    },
  },
  lng: initialLang,
  fallbackLng: 'zh',
  defaultNS: 'common',
  ns: ['common', 'home', 'tools', 'pages', 'static'],
  interpolation: {
    // React 已经做了 XSS 转义
    escapeValue: false,
  },
})

export default i18n
