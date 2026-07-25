import ExcelJS from 'exceljs'
import { marked } from 'marked'

/**
 * 将 Markdown 表格转换为 Excel 文件
 * @param markdown Markdown 内容
 * @returns Excel 文件的 Blob
 */
export async function convertMarkdownToExcel(markdown: string): Promise<Blob> {
  // 创建工作簿
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Markdown Tables')

  // 解析 Markdown 中的表格
  const tables = parseMarkdownTables(markdown)

  if (tables.length === 0) {
    // 如果没有找到表格，创建一个说明工作表
    worksheet.getCell('A1').value = '未检测到表格数据'
    worksheet.getCell('A2').value = '请在 Markdown 内容中包含表格，格式如下：'
    worksheet.getCell('A3').value = '| 列1 | 列2 | 列3 |'
    worksheet.getCell('A4').value = '|-----|-----|-----|'
    worksheet.getCell('A5').value = '| 数据1 | 数据2 | 数据3 |'
  } else {
    let currentRow = 1

    tables.forEach((table, tableIndex) => {
      // 如果不是第一个表格，添加空行分隔
      if (tableIndex > 0) {
        currentRow += 2
      }

      // 添加表头
      if (table.headers && table.headers.length > 0) {
        const headerRow = worksheet.getRow(currentRow)
        table.headers.forEach((header, index) => {
          headerRow.getCell(index + 1).value = header
          // 设置表头样式
          headerRow.getCell(index + 1).font = { bold: true }
          headerRow.getCell(index + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E0E0E0' },
          }
        })
        headerRow.commit()
        currentRow++
      }

      // 添加数据行
      if (table.rows && table.rows.length > 0) {
        table.rows.forEach((rowData) => {
          const dataRow = worksheet.getRow(currentRow)
          rowData.forEach((cellData, index) => {
            dataRow.getCell(index + 1).value = cellData
          })
          dataRow.commit()
          currentRow++
        })
      }

      // 自动调整列宽
      worksheet.columns.forEach((column) => {
        let maxLength = 0
        column.eachCell!((cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 0
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = Math.min(Math.max(maxLength + 2, 10), 50)
      })
    })
  }

  // 生成 Blob
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * 解析 Markdown 内容中的表格
 * @param markdown Markdown 内容
 * @returns 表格数据数组
 */
function parseMarkdownTables(
  markdown: string
): Array<{ headers: string[]; rows: string[][] }> {
  const tables: Array<{ headers: string[]; rows: string[][] }> = []

  // 正则表达式匹配 Markdown 表格
  const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g

  let match
  while ((match = tableRegex.exec(markdown)) !== null) {
    const headerLine = match[1]
    const dataLines = match[2]

    // 解析表头
    const headers = headerLine
      .split('|')
      .map((h) => h.trim())
      .filter((h) => h.length > 0)

    // 解析数据行
    const rows = dataLines
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) =>
        line
          .split('|')
          .map((cell) => cell.trim())
          .filter((cell) => cell.length > 0)
      )

    tables.push({ headers, rows })
  }

  return tables
}

/**
 * 下载 Markdown 转换为的 Excel 文件
 * @param markdown Markdown 内容
 * @param filename 文件名（不含扩展名）
 */
export async function downloadMarkdownAsExcel(
  markdown: string,
  filename: string = 'converted-tables'
): Promise<void> {
  const blob = await convertMarkdownToExcel(markdown)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 预览表格数据（用于实时预览）
 * @param markdown Markdown 内容
 * @returns 解析后的表格数据数组
 */
export function previewMarkdownTables(
  markdown: string
): Array<{ headers: string[]; rows: string[][] }> {
  return parseMarkdownTables(markdown)
}