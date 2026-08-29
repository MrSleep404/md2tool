import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * SEO配置接口
 */
export interface SEOConfig {
  title: string
  description: string
  keywords?: string
}

/** 双语 SEO 配置：每个页面提供 zh / en 两套 */
export type SEOConfigPair = Record<'zh' | 'en', SEOConfig>

const SITE_ORIGIN = 'https://www.md2tool.com'
const OG_IMAGE_URL = `${SITE_ORIGIN}/og-image.png`

/**
 * 设置页面SEO信息的Hook
 * @param config 双语SEO配置
 * @param canonicalPath 当前页面在中文版下的路径（如 '/about'），
 *                      提供后会在 <head> 注入 zh/en/x-default 的 alternate 链接（hreflang）
 */
export function useSEO(config: SEOConfigPair, canonicalPath?: string) {
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang: 'zh' | 'en' = i18n.language === 'en' ? 'en' : 'zh'
    const c = config[lang]

    // 设置title
    document.title = c.title

    // 设置或更新meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', c.description)
    } else {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      metaDescription.setAttribute('content', c.description)
      document.head.appendChild(metaDescription)
    }

    // 设置或更新meta keywords（如果提供）
    if (c.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', c.keywords)
      } else {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        metaKeywords.setAttribute('content', c.keywords)
        document.head.appendChild(metaKeywords)
      }
    }

    // 同步 Open Graph 标签
    const ogSelectors: Array<[string, string]> = [
      ['meta[property="og:title"]', c.title],
      ['meta[property="og:description"]', c.description],
    ]
    for (const [selector, content] of ogSelectors) {
      const el = document.querySelector(selector)
      if (el) el.setAttribute('content', content)
    }

    // canonical 指向当前语言版本自身：中文版无前缀，英文版 /en 前缀
    if (canonicalPath) {
      const canonicalUrl =
        lang === 'en'
          ? SITE_ORIGIN + (canonicalPath === '/' ? '/en' : `/en${canonicalPath}`)
          : SITE_ORIGIN + canonicalPath
      setCanonicalLink(canonicalUrl)
      setMetaTagContent('meta[property="og:url"]', canonicalUrl)
    }

    // 分享图片固定
    setMetaTagContent('meta[property="og:image"]', OG_IMAGE_URL)
    setMetaTagContent('meta[name="twitter:image"]', OG_IMAGE_URL)

    // hreflang alternate 链接（辅助通道；主通道是 sitemap 的 xhtml:link）
    if (canonicalPath) {
      setAlternateLinks(canonicalPath)
    }
  }, [config, canonicalPath, i18n.language])
}

/**
 * 设置或更新 canonical 链接
 */
function setCanonicalLink(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url
}

/**
 * 设置或更新单个 meta 标签的 content（不存在时自动创建）
 */
function setMetaTagContent(selector: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    const propertyMatch = selector.match(/property="([^"]+)"/)
    const nameMatch = selector.match(/name="([^"]+)"/)
    if (propertyMatch) {
      el.setAttribute('property', propertyMatch[1])
    } else if (nameMatch) {
      el.setAttribute('name', nameMatch[1])
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * 动态注入 noindex（用于 404 等不应被索引的页面），离开页面时恢复原状
 */
export function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    const created = !meta
    const prevContent = meta?.getAttribute('content') ?? null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, follow')
    return () => {
      if (created) {
        meta?.remove()
      } else if (meta && prevContent !== null) {
        meta.setAttribute('content', prevContent)
      }
    }
  }, [])
}

/**
 * 注入/更新 hreflang alternate 链接
 * @param canonicalPath 中文版路径（无 /en 前缀）
 */
function setAlternateLinks(canonicalPath: string) {
  const head = document.head

  // 先移除之前注入的链接，避免路由切换后残留
  head.querySelectorAll('link[data-hreflang-auto]').forEach((el) => el.remove())

  const zhUrl = SITE_ORIGIN + canonicalPath
  const enUrl = SITE_ORIGIN + (canonicalPath === '/' ? '/en' : `/en${canonicalPath}`)
  const entries: Array<[string, string]> = [
    ['zh-CN', zhUrl],
    ['en', enUrl],
    ['x-default', zhUrl],
  ]

  for (const [hreflang, href] of entries) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', hreflang)
    link.setAttribute('href', href)
    link.setAttribute('data-hreflang-auto', 'true')
    head.appendChild(link)
  }
}

/**
 * 各页面的SEO配置（zh / en 双语）
 */
export const SEO_CONFIGS: Record<string, SEOConfigPair> = {
  home: {
    zh: {
      title: 'Markdown转Word在线工具 - MD2Tool | 免费转换MD为DOCX',
      description: '免费在线Markdown转Word工具，一键将Markdown文档转换为Word格式（DOCX）。支持标题、列表、表格、代码块等格式，浏览器本地处理，保护隐私，无需注册。',
      keywords: 'Markdown转Word,MD转DOCX,Markdown转Word在线,免费Markdown转换,Markdown转Word工具'
    },
    en: {
      title: 'Markdown to Word Converter Online - MD2Tool | Free MD to DOCX',
      description: 'Free online Markdown to Word converter. Convert Markdown to Word (DOCX) instantly with headings, lists, tables, and code blocks. Runs locally in your browser — private, no sign-up required.',
      keywords: 'markdown to word, md to docx, markdown to word converter, convert markdown to word online, free markdown converter'
    }
  },
  wordToMarkdown: {
    zh: {
      title: 'Word转Markdown在线工具 - MD2Tool | 免费转换DOCX为MD',
      description: '免费在线Word转Markdown工具，一键将Word文档（DOCX）转换为Markdown格式。支持标题、列表、表格等格式转换，浏览器本地处理，保护隐私。',
      keywords: 'Word转Markdown,DOCX转MD,Word转MD在线,免费Word转换,Word转Markdown工具'
    },
    en: {
      title: 'Word to Markdown Converter Online - MD2Tool | Free DOCX to MD',
      description: 'Convert Word documents (.docx) to Markdown online for free. Headings, lists, and tables are converted in seconds, right in your browser. No registration required.',
      keywords: 'word to markdown, docx to markdown, word to md converter, convert docx to markdown online, free word converter'
    }
  },
  markdownToHtml: {
    zh: {
      title: 'Markdown转HTML在线工具 - MD2Tool | 免费转换MD为HTML',
      description: '免费在线Markdown转HTML工具，实时预览转换效果，支持复制HTML代码或下载完整HTML文档。浏览器本地处理，保护隐私，无需注册。',
      keywords: 'Markdown转HTML,MD转HTML,Markdown转HTML在线,免费Markdown转换,Markdown转HTML工具'
    },
    en: {
      title: 'Markdown to HTML Converter Online - MD2Tool | Free MD to HTML',
      description: 'Convert Markdown to HTML online for free with a live preview. Copy clean HTML code or download a complete styled HTML document. Browser-based and private.',
      keywords: 'markdown to html, md to html, markdown to html converter, convert markdown to html online, free markdown converter'
    }
  },
  htmlToMarkdown: {
    zh: {
      title: 'HTML转Markdown在线工具 - MD2Tool | 免费转换HTML为MD',
      description: '免费在线HTML转Markdown工具，一键将HTML代码转换为Markdown格式。支持表格、列表、链接等格式，浏览器本地处理，保护隐私。',
      keywords: 'HTML转Markdown,HTML转MD,HTML转MD在线,免费HTML转换,HTML转Markdown工具'
    },
    en: {
      title: 'HTML to Markdown Converter Online - MD2Tool | Free HTML to MD',
      description: 'Convert HTML to clean Markdown online for free. Supports headings, lists, tables, links, and code blocks. Runs entirely in your browser.',
      keywords: 'html to markdown, html to md converter, convert html to markdown online, free html to markdown'
    }
  },
  markdownToPdf: {
    zh: {
      title: 'Markdown转PDF在线工具 - MD2Tool | 免费转换MD为PDF',
      description: '免费在线Markdown转PDF工具，一键将Markdown文档转换为高质量PDF文件。支持标题、列表、表格、代码块等格式，浏览器本地处理，保护隐私。',
      keywords: 'Markdown转PDF,MD转PDF,Markdown转PDF在线,免费Markdown转换,Markdown转PDF工具'
    },
    en: {
      title: 'Markdown to PDF Converter Online - MD2Tool | Free MD to PDF',
      description: 'Convert Markdown to high-quality PDF files online for free. Live preview, page numbers, code highlighting, and Mermaid diagram support. Private and browser-based.',
      keywords: 'markdown to pdf, md to pdf, markdown to pdf converter, convert markdown to pdf online, free markdown pdf'
    }
  },
  markdownToExcel: {
    zh: {
      title: 'Markdown转Excel在线工具 - MD2Tool | 免费转换MD表格为XLSX',
      description: '免费在线Markdown转Excel工具，一键将Markdown表格转换为Excel格式（XLSX）。支持表格样式、对齐方式，浏览器本地处理，保护隐私。',
      keywords: 'Markdown转Excel,MD转XLSX,Markdown转Excel在线,免费Markdown转换,Markdown转Excel工具'
    },
    en: {
      title: 'Markdown to Excel Converter Online - MD2Tool | Free MD Table to XLSX',
      description: 'Convert Markdown tables to Excel (XLSX) online for free. Automatic table detection with multi-table support. Everything runs locally in your browser.',
      keywords: 'markdown to excel, md to xlsx, markdown table to excel, convert markdown to excel online, free markdown converter'
    }
  },
  help: {
    zh: {
      title: '操作说明 - MD2Tool | 新手教程与常见问题解答',
      description: 'MD2Tool使用说明：四步完成Markdown与Word、HTML、PDF、Excel的格式转换，包含新手教程、使用技巧和常见问题解答。',
      keywords: 'MD2Tool,操作说明,使用教程,Markdown转换教程,常见问题,FAQ'
    },
    en: {
      title: 'Help & User Guide - MD2Tool | Tutorials and FAQ',
      description: 'MD2Tool user guide: convert between Markdown and Word, HTML, PDF, and Excel in four steps. Quick-start tutorial, tips and tricks, and FAQ.',
      keywords: 'md2tool help, markdown converter guide, how to convert markdown, markdown converter faq'
    }
  },
  about: {
    zh: {
      title: '关于我们 - MD2Tool | 免费在线Markdown转换工具',
      description: 'MD2Tool是一款完全免费、开源的在线文档格式转换工具，专注于Markdown与其他文档格式之间的互转。浏览器本地处理，保护隐私，无需注册。',
      keywords: 'MD2Tool,关于我们,Markdown转换工具,开源工具,免费文档转换'
    },
    en: {
      title: 'About Us - MD2Tool | Free Online Markdown Converter',
      description: 'MD2Tool is a free, open-source online document converter focused on conversions between Markdown and other formats. All processing runs locally in your browser.',
      keywords: 'md2tool, about us, markdown converter, open source tool, free document converter'
    }
  },
  contact: {
    zh: {
      title: '联系我们 - MD2Tool | 免费在线Markdown转换工具',
      description: '联系MD2Tool团队，提交Bug报告或功能建议。我们欢迎所有形式的贡献，包括代码优化、文档改进和新功能开发。',
      keywords: 'MD2Tool,联系我们,反馈建议,GitHub,开源项目'
    },
    en: {
      title: 'Contact Us - MD2Tool | Free Online Markdown Converter',
      description: 'Contact the MD2Tool team to report bugs or suggest features. All kinds of contributions are welcome, including code, documentation, and new ideas.',
      keywords: 'md2tool, contact us, feedback, github, open source'
    }
  },
  privacyPolicy: {
    zh: {
      title: '隐私政策 - MD2Tool | 免费在线Markdown转换工具',
      description: 'MD2Tool隐私政策，详细说明我们如何收集、使用、披露和管理您的个人信息。所有文件转换在浏览器本地完成，不收集上传文件内容。',
      keywords: 'MD2Tool,隐私政策,用户隐私,数据安全,隐私保护'
    },
    en: {
      title: 'Privacy Policy - MD2Tool | Free Online Markdown Converter',
      description: 'MD2Tool privacy policy: how we collect, use, and manage your information. All file conversion happens locally in your browser — file contents are never uploaded.',
      keywords: 'md2tool, privacy policy, user privacy, data security'
    }
  }
}
