import { Link, useLocation } from 'react-router-dom'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { getLangFromPath, localizedTo } from '../../i18n/lang'

interface LocalizedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  children: ReactNode
}

/**
 * 带语言前缀的站内链接
 * 在英文版（/en/*）下自动为 to 添加 /en 前缀，中文版保持原路径
 */
export default function LocalizedLink({ to, children, ...rest }: LocalizedLinkProps) {
  const { pathname } = useLocation()
  const lang = getLangFromPath(pathname)
  const href = localizedTo(to, lang)

  return (
    <Link to={href} {...rest}>
      {children}
    </Link>
  )
}
