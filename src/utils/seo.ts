import { useEffect } from 'react'

/**
 * SEO配置接口
 */
interface SEOConfig {
  title: string
  description: string
  keywords?: string
}

/**
 * 设置页面SEO信息的Hook
 * @param config SEO配置
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    // 设置title
    document.title = config.title

    // 设置或更新meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', config.description)
    } else {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      metaDescription.setAttribute('content', config.description)
      document.head.appendChild(metaDescription)
    }

    // 设置或更新meta keywords（如果提供）
    if (config.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', config.keywords)
      } else {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        metaKeywords.setAttribute('content', config.keywords)
        document.head.appendChild(metaKeywords)
      }
    }

    // 清理函数：恢复默认值（可选）
    return () => {
      // 当组件卸载时，可以选择恢复默认的meta标签
      // 这里不做清理，保持SEO信息
    }
  }, [config])
}

/**
 * 各页面的SEO配置
 */
export const SEO_CONFIGS = {
  home: {
    title: 'Markdown转Word在线工具 - MD2Tool | 免费转换MD为DOCX',
    description: '免费在线Markdown转Word工具，一键将Markdown文档转换为Word格式（DOCX）。支持标题、列表、表格、代码块等格式，浏览器本地处理，保护隐私，无需注册。',
    keywords: 'Markdown转Word,MD转DOCX,Markdown转Word在线,免费Markdown转换,Markdown转Word工具'
  },
  wordToMarkdown: {
    title: 'Word转Markdown在线工具 - MD2Tool | 免费转换DOCX为MD',
    description: '免费在线Word转Markdown工具，一键将Word文档（DOCX）转换为Markdown格式。支持标题、列表、表格等格式转换，浏览器本地处理，保护隐私。',
    keywords: 'Word转Markdown,DOCX转MD,Word转MD在线,免费Word转换,Word转Markdown工具'
  },
  markdownToHtml: {
    title: 'Markdown转HTML在线工具 - MD2Tool | 免费转换MD为HTML',
    description: '免费在线Markdown转HTML工具，实时预览转换效果，支持复制HTML代码或下载完整HTML文档。浏览器本地处理，保护隐私，无需注册。',
    keywords: 'Markdown转HTML,MD转HTML,Markdown转HTML在线,免费Markdown转换,Markdown转HTML工具'
  },
  htmlToMarkdown: {
    title: 'HTML转Markdown在线工具 - MD2Tool | 免费转换HTML为MD',
    description: '免费在线HTML转Markdown工具，一键将HTML代码转换为Markdown格式。支持表格、列表、链接等格式，浏览器本地处理，保护隐私。',
    keywords: 'HTML转Markdown,HTML转MD,HTML转MD在线,免费HTML转换,HTML转Markdown工具'
  },
  markdownToPdf: {
    title: 'Markdown转PDF在线工具 - MD2Tool | 免费转换MD为PDF',
    description: '免费在线Markdown转PDF工具，一键将Markdown文档转换为高质量PDF文件。支持标题、列表、表格、代码块等格式，浏览器本地处理，保护隐私。',
    keywords: 'Markdown转PDF,MD转PDF,Markdown转PDF在线,免费Markdown转换,Markdown转PDF工具'
  },
  markdownToExcel: {
    title: 'Markdown转Excel在线工具 - MD2Tool | 免费转换MD表格为XLSX',
    description: '免费在线Markdown转Excel工具，一键将Markdown表格转换为Excel格式（XLSX）。支持表格样式、对齐方式，浏览器本地处理，保护隐私。',
    keywords: 'Markdown转Excel,MD转XLSX,Markdown转Excel在线,免费Markdown转换,Markdown转Excel工具'
  },
  about: {
    title: '关于我们 - MD2Tool | 免费在线Markdown转换工具',
    description: 'MD2Tool是一款完全免费、开源的在线文档格式转换工具，专注于Markdown与其他文档格式之间的互转。浏览器本地处理，保护隐私，无需注册。',
    keywords: 'MD2Tool,关于我们,Markdown转换工具,开源工具,免费文档转换'
  },
  contact: {
    title: '联系我们 - MD2Tool | 免费在线Markdown转换工具',
    description: '联系MD2Tool团队，提交Bug报告或功能建议。我们欢迎所有形式的贡献，包括代码优化、文档改进和新功能开发。',
    keywords: 'MD2Tool,联系我们,反馈建议,GitHub,开源项目'
  },
  privacyPolicy: {
    title: '隐私政策 - MD2Tool | 免费在线Markdown转换工具',
    description: 'MD2Tool隐私政策，详细说明我们如何收集、使用、披露和管理您的个人信息。所有文件转换在浏览器本地完成，不收集上传文件内容。',
    keywords: 'MD2Tool,隐私政策,用户隐私,数据安全,隐私保护'
  }
}