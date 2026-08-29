# 功能页 SEO 优化 技术方案

> 版本：v1.0 ｜ 日期：2026-08-28 ｜ 状态：待评审
> 依赖：《功能页SEO优化PRD.md》（已批准）｜ 覆盖：PRD 阶段 1 + 阶段 2

## 1. 现状修正（相对 PRD 假设）

技术审查发现各工具页**已有**三个文字区块（来自 `i18n/locales/*/pages.json`）：

- 使用步骤（`pages:{page}.steps`）
- 支持的格式（`pages:{page}.supported`）
- 注意事项（`pages:{page}.notes`）

**因此方案调整为增量建设，不重复造区块**：

| PRD 要求区块 | 现状 | 本方案动作 |
|-------------|------|-----------|
| 功能介绍段 | 仅 hero 短副标题 | **新增** `intro` 长文（每页 150~250 字，嵌主关键词） |
| 使用步骤 | ✅ 已有 | 复用，位置调整至 intro 之后 |
| FAQ | ❌ 无 | **新增**（每页 3~4 条，中英独立撰写） |
| 相关工具内链 | ❌ 无 | **新增**组件 |
| FAQPage JSON-LD | ❌ 无 | **新增**，数据源 = FAQ 文案（同源一致） |

## 2. 架构决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 文案存放 | `i18n/locales/{zh,en}/pages.json` 内每页新增 `intro` + `faq` 数组 | 遵循项目既有 i18n 惯例（steps/supported/notes 已在此），翻译体系统一，语言切换自动生效；**不建** PRD 中假设的独立 `src/seo/content/` TS 体系（会与 i18n 双轨重复） |
| 静态 JSON-LD（WebApplication + Organization） | `index.html` 静态注入 `<script type="application/ld+json">` | 全站/品牌级数据与页面无关，无需 JS 动态化；预渲染后天然进 HTML |
| 动态 JSON-LD（FAQPage + BreadcrumbList） | `useSEO` 扩展 `options` 参数 | 复用 hook 内已有的 i18n 上下文与注入/清理模式（参照 `setAlternateLinks` 的 `data-*` 清理策略） |
| 内链配置 | `src/utils/seo.ts` 导出 `RELATED_TOOLS` 常量（路由 + i18n key + lucide 图标） | 属代码而非文案；与 `SEO_CONFIGS` 同文件便于维护 |
| UI 组件 | 新建 `src/components/PageSeoBlock.tsx`，一个组件渲染 intro + FAQ + RelatedTools | 6 页各加 1 行接入；accent 色参数适配各页 hero 渐变色 |

## 3. 数据结构与接口

### 3.1 i18n 新增字段（zh / en 双语，`pages.json` 每页）

```jsonc
{
  "wordToMarkdown": {
    "hero": { "...": "现有字段不动" },
    "steps": [ "... 现有" ],
    "supported": [ "..." ],
    "notes": [ "..." ],
    "intro": "新增：150~250 字功能介绍，自然嵌入主关键词与本地转换卖点",
    "faq": [
      { "q": "问题", "a": "回答" }
    ]
  }
}
```

### 3.2 `useSEO` 扩展（[src/utils/seo.ts](file:///d:/我的项目/markdown转化/src/utils/seo.ts)）

```ts
export interface SEOJsonLdOptions {
  faqQa?: Array<{ q: string; a: string }>   // FAQPage 数据源
  breadcrumbName?: string                    // 面包屑末级名称（hero.title）
}
export function useSEO(config, canonicalPath?, options?: SEOJsonLdOptions)
```

- 内部新增 `setJsonLd(id, obj)`：`<script type="application/ld+json" data-jsonld-auto="true" id="ld-{id}">`，路由/语言变化时先清理再注入（同 hreflang 策略），卸载时移除。
- FAQPage schema：`@context` + `@type` + `mainEntity[]`（q → name，a → text）。
- BreadcrumbList：`首页(SITE_ORIGIN)` → `breadcrumbName(当前语言 URL)`。

### 3.3 内链常量与组件

```ts
// src/utils/seo.ts 新增
export interface RelatedTool { path: string; nameKey: string; descKey: string; icon: LucideIcon }
export const RELATED_TOOLS: Record<PageKey, [RelatedTool, RelatedTool]>
```

```tsx
// src/components/PageSeoBlock.tsx
interface Props { pageKey: string; accent: 'green' | 'blue' | '...' }
// 渲染顺序：intro 段落 → FAQ 手风琴/静态列表 → RelatedTools 卡片 ×2
```

- FAQ 用静态列表（非折叠手风琴）：保证内容对爬虫 100% 可见（预渲染前置条件）。
- RelatedTools 卡片：`<Link to>` 站内路由，图标 + 名称 + 一句话描述，hover 样式与现有卡片一致。

### 3.4 index.html 静态 JSON-LD

- `WebApplication`：name=MD2Tool、applicationCategory=UtilitiesApplication、offers price=0、operatingSystem=Any、featureList（六功能简述）。
- `Organization`：name、url、logo（og-image.png）。

## 4. 页面接入改动（每页 3 行）

以 WordToMarkdown 为例：

```tsx
useSEO(SEO_CONFIGS.wordToMarkdown, '/word-to-markdown', {
  faqQa: tList(t, 'pages:wordToMarkdown.faq'),      // → [{q, a}]
  breadcrumbName: t('pages:wordToMarkdown.hero.title'),
})
// ...页面底部 notes 区块之后：
<PageSeoBlock pageKey="wordToMarkdown" accent="green" />
```

accent 对照：home=green、wordToMarkdown=green、markdownToHtml=blue、htmlToMarkdown=purple、markdownToPdf=red、markdownToExcel=emerald（与各页 hero 渐变一致，实施时以实际 hero class 为准）。

## 5. 实施步骤（3 次提交）

| # | 提交 | 内容 |
|---|------|------|
| C1 | 阶段 1 基础设施 | `useSEO` JSON-LD 扩展 + `index.html` 静态 JSON-LD + `RELATED_TOOLS` 常量 + `PageSeoBlock` 组件（FAQ/内链渲染） |
| C2 | 中文文案 | zh/pages.json 6 页 intro + faq；6 页接入 useSEO options + PageSeoBlock |
| C3 | 英文文案 | en/pages.json 6 页 intro + faq 独立撰写 |

Crawler Hints（控制台开关）由用户自行启用，见 PRD §3.3。

## 6. 测试与验收（对应 PRD §6）

1. `tsc --noEmit` 通过。
2. 每页中英切换检查：intro/FAQ/内链随语言切换（useSEO 已依赖 `i18n.language`，自动重注入）。
3. 线上 `view-source:` 检查 index.html 两个静态 ld+json；DevTools 检查动态 FAQPage/BreadcrumbList 注入与路由切换清理。
4. Rich Results Test / schema.org Validator 校验三类 schema。
5. 内链 12 条逐一可达，双向互链成立。
6. 每页一次完整转换 + 下载回归。
7. 布局回归：编辑器/预览高度公式不变（内容区全部在 `calc(100vh-24rem)` 结果区下方）。

## 7. 风险

| 风险 | 对策 |
|------|------|
| FAQ 文案与功能实际不符误导用户 | 文案初稿基于项目记忆中已确认的功能特性（1.5 行距/首行缩进/代码块分页/Mermaid 支持等），用户审核定稿 |
| JSON-LD 残留污染下一页 | 沿用 `data-hreflang-auto` 同款清理策略（`data-jsonld-auto`） |
| tList 返回结构不匹配 FAQ 对象数组 | FAQ 取数新增 `tList` 泛化版本或专用 `tFaq` helper，返回 `{q,a}[]` |
