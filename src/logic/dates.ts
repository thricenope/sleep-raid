/** 日期工具（独立实现，与其它应用不共享代码） */
export const ymd = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const parseYmd = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number): Date => {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}

export const today = (): string => ymd(new Date())

export const weekday = (s: string): number => parseYmd(s).getDay()

export const isWeekend = (s: string): boolean => {
  const w = weekday(s)
  return w === 0 || w === 6
}

export const daysBetween = (a: string, b: string): number =>
  Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / 86400000)

const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六']

export const weekCn = (s: string): string => `周${WEEK_CN[weekday(s)]}`

export const dateCn = (s: string): string => {
  const d = parseYmd(s)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export const monthLabel = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number)
  return `${y} 年 ${m} 月`
}

/** 生成某月日历矩阵（6 行 7 列，从周日开始），格子为日期或 null */
export const monthMatrix = (ym: string): (string | null)[][] => {
  const [y, m] = ym.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${ym}-${String(d).padStart(2, '0')}`)
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}
