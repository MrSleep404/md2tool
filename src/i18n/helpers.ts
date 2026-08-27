import type { TFunction } from 'i18next'

/** 读取字符串数组类型的翻译（i18next 数组需要 returnObjects） */
export function tList(t: TFunction, key: string): string[] {
  const value = t(key, { returnObjects: true })
  return Array.isArray(value) ? (value as string[]) : []
}

/** 读取对象数组类型的翻译 */
export function tItems<T>(t: TFunction, key: string): T[] {
  const value = t(key, { returnObjects: true })
  return Array.isArray(value) ? (value as unknown as T[]) : []
}
