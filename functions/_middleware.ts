// Cloudflare Pages 全局中间件：裸域 301 到 www，统一站点入口，集中 SEO 权重
// 替代原先在 Cloudflare 控制台配置的 Redirect Rule（已失效）
interface Ctx {
  request: Request
  next: () => Promise<Response>
}

export async function onRequest(ctx: Ctx): Promise<Response> {
  const url = new URL(ctx.request.url)
  if (url.hostname === 'md2tool.com') {
    url.protocol = 'https:'
    url.hostname = 'www.md2tool.com'
    return Response.redirect(url.toString(), 301)
  }
  return ctx.next()
}
