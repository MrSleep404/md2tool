import type { TFunction } from 'i18next'

/**
 * 转换器抛出的稳定错误码（见各 utils/converters 文件）
 * 页面根据错误码显示当前语言的提示文案
 */
const KNOWN_CODES = new Set([
  'EMPTY_CONTENT',
  'EMPTY_FILE',
  'UNSUPPORTED_FORMAT',
  'CONVERSION_FAILED',
])

/**
 * 把转换器抛出的错误转换为当前语言的提示文案
 * 未识别的错误统一回退到「转换失败，请重试」
 */
export function conversionErrorMessage(err: unknown, t: TFunction): string {
  const message = err instanceof Error ? err.message : ''
  if (KNOWN_CODES.has(message)) {
    return t(`common:errors.${message}`)
  }
  return t('common:errors.convertFailed')
}
