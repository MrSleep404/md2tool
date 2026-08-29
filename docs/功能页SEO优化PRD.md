# 功能页 SEO 优化 PRD

> 版本：v1.0 ｜ 日期：2026-08-28 ｜ 状态：待评审
> 关联：功能页 SEO 优化方案（三阶段：技术增强 → 内容层 → 预渲染）

## 1. 背景与目标

### 背景
- 站点已完成基础 SEO：每页独立 title/description/keywords、动态 canonical、hreflang（zh-CN/en/x-default）、sitemap、og/twitter 标签、404 页、裸域 301 收敛。
- 核心短板：**6 个工具页对搜索引擎几乎是"零文字页面"**（编辑器+预览为主，正文关键词密度不足）；无结构化数据；无内链网络；百度视角正文不可见（预渲染前无法解决）。

### 目标
| 编号 | 目标 | 衡量方式 |
|------|------|---------|
| G1 | 每个工具页具备针对其功能的独立 SEO 内容（关键词、介绍、步骤、FAQ、内链） | 每页新增内容 ≥ 600 字（中）/ 400 词（英），含主关键词与长尾变体 |
| G2 | 谷歌富摘要资格 | WebApplication / FAQPage / BreadcrumbList 三类 JSON-LD 通过 Rich Results Test 校验 |
| G3 | 站内权重流转 | 6 个工具页形成双向/多向内链网络，无死链 |
| G4 | 零功能风险 | 不触碰任何转换逻辑，现有功能回归正常 |

### 受众
- **搜索引擎**：谷歌（主）、百度（阶段 3 预渲染后受益）、必应。
- **真人用户**：内容区放在页面底部，不干扰工具主操作；FAQ 兼作转化说服（隐私卖点）。

## 2. 范围

**范围内**：6 个工具页（`/`、`/word-to-markdown`、`/markdown-to-html`、`/html-to-markdown`、`/markdown-to-pdf`、`/markdown-to-excel`）× 中英双语的内容区与结构化数据；全站 JSON-LD 补充；内链组件。

**范围外（非目标）**：
- 不修改任何文档转换逻辑（docx/pdf/excel/html 生成代码零改动）。
- 不新增页面、不改路由。
- 预渲染（原阶段 3）另立 PRD，本 PRD 的内容是其数据前提。
- 4 个静态页（help/about/contact/privacy）不建内容区，仅补 Organization JSON-LD。

## 3. 阶段 1：技术增强（纯代码）

### 3.1 JSON-LD 结构化数据
| Schema | 适用页面 | 数据来源 |
|--------|---------|---------|
| WebApplication | 全站（6 工具页） | 静态常量：名称、applicationCategory=Utilities、offers price=0、operatingSystem=Web、浏览器端本地处理描述 |
| FAQPage | 6 个工具页 | 自动生成自各页内容配置的 FAQ 数组（与页面可见内容一致，符合谷歌政策） |
| BreadcrumbList | 6 个工具页 | 首页 → 当前页（中英文案随语言） |
| Organization | about 页 | 站点名称、logo、URL |

注入方式：扩展现有 `useSEO` hook，支持 JSON-LD 数组参数，动态创建/清理 `<script type="application/ld+json">`。

### 3.2 内链网络
- 每个工具页内容区末尾渲染"相关工具"卡片（图标 + 名称 + 一句话描述）。
- 配置于各页内容文件（`relatedTools` 字段），内链对象见第 4 节各页规格。

### 3.3 Crawler Hints（零代码）
- Cloudflare 控制台 → Caching → Speed → 启用 Crawler Hints（自动向 Bing/Yandex IndexNow 推送）。

## 4. 阶段 2：六页内容规格（核心交付）

每页内容区统一结构：**功能介绍段 → 使用步骤（3~4 步）→ FAQ → 相关工具**。
所有文案贯穿差异化卖点：**文件不上传服务器，浏览器本地完成转换**。

### 4.1 `/`（Markdown 转 Word）— 站点主功能
| 项目 | 内容 |
|------|------|
| 中文主词/长尾 | markdown转word；markdown转word文档、md转word在线免费 |
| 英文主词/长尾 | markdown to word converter；convert markdown to docx online free |
| 痛点 | 写完 Markdown 后需提交 Word 版作业/报告/公文 |
| 独有卖点 | Word 排版精细还原：1.5 倍行距、正文首行缩进 2 字符、标题多级编号；Mermaid 流程图与 LaTeX 公式嵌入 Word |
| FAQ | ① 转换会丢失格式吗（标题/表格/列表/图片/公式/流程图全保留）② 文件会上传服务器吗（本地转换）③ 支持哪些语法（GFM 全集）④ 免费吗（完全免费无限制） |
| 相关工具 | word转markdown、markdown转pdf |

### 4.2 `/word-to-markdown`
| 项目 | 内容 |
|------|------|
| 中文主词/长尾 | word转markdown；docx转markdown、word文档转md在线 |
| 英文主词/长尾 | word to markdown converter；convert docx to markdown online free |
| 痛点 | 把已有 Word 文档迁移到 Obsidian/Notion/博客系统 |
| 独有卖点 | 复杂文档高保真：嵌套列表、表格、图片提取 |
| FAQ | ① 支持 .doc 吗（支持 .docx，旧格式建议另存）② 图片处理（提取嵌入图片并生成引用）③ 表格和列表效果（GFM 表格 + 层级保留） |
| 相关工具 | markdown转word、markdown转html |

### 4.3 `/markdown-to-html`
| 项目 | 内容 |
|------|------|
| 中文主词/长尾 | markdown转html；md转html、markdown生成html代码 |
| 英文主词/长尾 | markdown to html converter；md to html online |
| 痛点 | 博客平台发布、网页/邮件嵌入 |
| 独有卖点 | 多主题实时预览、一键复制带样式 HTML |
| FAQ | ① 能复制完整 HTML 吗 ② 代码高亮支持（highlight.js）③ 主题可切换吗 |
| 相关工具 | html转markdown、markdown转pdf |

### 4.4 `/html-to-markdown`
| 项目 | 内容 |
|------|------|
| 中文主词/长尾 | html转markdown；网页转markdown、html转md在线 |
| 英文主词/长尾 | html to markdown converter；html to md online free |
| 痛点 | 技术文档/维基内容存入 Markdown 笔记库 |
| 独有卖点 | 粘贴即转，零操作成本 |
| FAQ | ① 粘贴 URL 还是源码（HTML 源码/片段）② 复杂结构保留（表格/代码块/链接/图片） |
| 相关工具 | markdown转html、word转markdown |

### 4.5 `/markdown-to-pdf`
| 项目 | 内容 |
|------|------|
| 中文主词/长尾 | markdown转pdf；md转pdf免费在线、markdown转pdf带代码高亮 |
| 英文主词/长尾 | markdown to pdf converter；md to pdf online free |
| 痛点 | 简历/技术文档定稿交付 |
| 独有卖点 | **代码块不跨页截断**（智能分页）、GitHub Light 语法高亮、外链图片自动预加载、Mermaid/公式渲染 |
| FAQ | ① 代码高亮吗 ② 代码块会分页截断吗 ③ 外链图片能进 PDF 吗 |
| 相关工具 | markdown转word、markdown转html |

### 4.6 `/markdown-to-excel`
| 项目 | 内容 |
|------|------|
| 中文主词/长尾 | markdown转excel；md表格转excel、markdown转xlsx |
| 英文主词/长尾 | markdown to excel converter；markdown table to xlsx |
| 痛点 | 把表格数据交给不使用 Markdown 的同事 |
| 独有卖点 | 多表格识别、每表独立工作表、.xlsx 原生格式 |
| FAQ | ① 只转换表格吗（识别全部表格）② 输出格式（.xlsx）③ 保留单元格文本格式吗 |
| 相关工具 | html转markdown、markdown转word |

### 4.7 文案产出与审核
- 中英各 6 份独立撰写（英文非机翻），由 AI 产出初稿、用户审核后定稿。
- 文案嵌入 `src/seo/content/` 每页独立配置文件（详见技术方案），不硬编码在页面组件。

## 5. 阶段 3：预渲染（另立 PRD）

- 依赖本 PRD 的内容数据就位；实施构建时预渲染 11 个路由，使内容文字进入初始 HTML（百度质变）。
- 需先验证 Mermaid、动态 SEO 标签、语言路由与预渲染的兼容性。本 PRD 不含实施。

## 6. 验收标准

1. 6 个工具页（中英）内容区按规格渲染，视觉风格与现有页面一致，编辑器/预览布局不受影响（内容区位于工具区下方，可滚动）。
2. 三类 JSON-LD 在 Rich Results Test / schema.org Validator 校验通过；FAQ 内容与页面可见文本一致。
3. 内链全部可达、双向互链成立、无死链。
4. `tsc --noEmit` 通过；各页转换功能手动回归正常（每页至少一次完整转换 + 下载）。
5. Lighthouse SEO 分数不低于当前值；LCP/TBT 无明显劣化（内容区为纯静态 DOM）。
6. 所有新增文案中英文齐全，`_hmt` 路由统计在内容区页面跳转正常。

## 7. 风险与对策

| 风险 | 对策 |
|------|------|
| 内容区过长挤占工具区视野 | 内容区放页面底部，工具区布局（calc(100vh - 22rem)）不变 |
| FAQ schema 与页面内容不一致被谷歌判违规 | schema 数据强制来自内容配置同一数据源 |
| 英文文案质量 | 独立撰写后用户审核 |
| 关键词堆砌被降权 | 介绍段自然叙述，单页主词密度 ≤ 3% |
