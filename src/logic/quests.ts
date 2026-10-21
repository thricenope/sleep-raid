import { ymd, addDays, parseYmd } from './dates'
import { isRecorded, isWin, isPerfect, evaluateReport, verdictOf } from './scoring'
import type { NightPlan, NightReport, Stats, Verdict } from '../types'

export const STORAGE_KEY = 'sleep-raid-v1'

/** 成就定义（与 slim-hero 同构、文案睡眠化） */
export interface Quest {
  id: string
  name: string
  desc: string
  goal: number
  /** 进度取值维度 */
  kind: 'streak' | 'total' | 'perfect' | 'boss' | 'kills' | 'xp'
  tier: 1 | 2 | 3 | 4
  icon: string
}

export const QUESTS: Quest[] = [
  { id: 's1', name: '初次出征', desc: '第一次击退梦魇怪', goal: 1, kind: 'total', tier: 1, icon: 'star' },
  { id: 's3', name: '三夜连胜', desc: '连击 ×3', goal: 3, kind: 'streak', tier: 1, icon: 'flame' },
  { id: 's7', name: '一周整编', desc: '连击 ×7', goal: 7, kind: 'streak', tier: 2, icon: 'flame' },
  { id: 's14', name: '双周精锐', desc: '连击 ×14', goal: 14, kind: 'streak', tier: 2, icon: 'flame' },
  { id: 's30', name: '月度大捷', desc: '连击 ×30', goal: 30, kind: 'streak', tier: 3, icon: 'flame' },
  { id: 's60', name: '梦界常客', desc: '连击 ×60', goal: 60, kind: 'streak', tier: 3, icon: 'flame' },
  { id: 's100', name: '百日远征', desc: '连击 ×100', goal: 100, kind: 'streak', tier: 3, icon: 'flame' },
  { id: 's180', name: '半年守望', desc: '连击 ×180', goal: 180, kind: 'streak', tier: 4, icon: 'crown' },
  { id: 's365', name: '周年史诗', desc: '连击 ×365', goal: 365, kind: 'streak', tier: 4, icon: 'crown' },
  { id: 's730', name: '双年神话', desc: '连击 ×730', goal: 730, kind: 'streak', tier: 4, icon: 'crown' },
  { id: 'p1', name: '完美一夜', desc: '首次完美讨伐（≥6 分）', goal: 1, kind: 'perfect', tier: 1, icon: 'sparkle' },
  { id: 'p10', name: '暴击十连', desc: '累计完美讨伐 10 次', goal: 10, kind: 'perfect', tier: 2, icon: 'sparkle' },
  { id: 'p50', name: '梦之掌控者', desc: '累计完美讨伐 50 次', goal: 50, kind: 'perfect', tier: 3, icon: 'crown' },
  { id: 't10', name: '讨伐新兵', desc: '累计击退 10 关', goal: 10, kind: 'total', tier: 1, icon: 'sword' },
  { id: 't50', name: '讨伐老兵', desc: '累计击退 50 关', goal: 50, kind: 'total', tier: 2, icon: 'sword' },
  { id: 't150', name: '梦境常胜军', desc: '累计击退 150 关', goal: 150, kind: 'total', tier: 3, icon: 'sword' },
  { id: 't365', name: '整年讨伐', desc: '累计击退 365 关', goal: 365, kind: 'total', tier: 4, icon: 'crown' },
  { id: 'b1', name: 'BOSS 初讨', desc: '首次击败周末 BOSS 暴食梦貘', goal: 1, kind: 'boss', tier: 2, icon: 'trophy' },
  { id: 'b10', name: '貘之克星', desc: '击败 BOSS 10 次', goal: 10, kind: 'boss', tier: 3, icon: 'trophy' },
  { id: 'k30', name: '梦魇收藏家', desc: '图鉴收录全部 6 只', goal: 6, kind: 'kills', tier: 2, icon: 'book' },
  { id: 'k100', name: '百战图鉴', desc: '累计击败 100 只梦魇怪', goal: 100, kind: 'kills', tier: 3, icon: 'book' },
  { id: 'x200', name: '讨伐队骨干', desc: '累计经验 200', goal: 200, kind: 'xp', tier: 1, icon: 'star' },
  { id: 'x800', name: '月光勋章', desc: '累计经验 800', goal: 800, kind: 'xp', tier: 2, icon: 'star' },
  { id: 'x2000', name: '传说猎梦人', desc: '累计经验 2000', goal: 2000, kind: 'xp', tier: 3, icon: 'crown' },
]

export const ROAD: { days: number; title: string }[] = [
  { days: 2, title: '初战告捷' },
  { days: 4, title: '小队合流' },
  { days: 7, title: '一周整编' },
  { days: 14, title: '双周精锐' },
  { days: 21, title: '三周猛攻' },
  { days: 30, title: '月度大捷' },
  { days: 60, title: '梦界常客' },
  { days: 100, title: '百日远征' },
  { days: 180, title: '半年守望' },
  { days: 365, title: '周年史诗' },
]

export const nextRoad = (streak: number): { days: number; title: string } | null =>
  ROAD.find((r) => streak < r.days) ?? null

export const comboTitle = (streak: number): string => {
  const next = nextRoad(streak)
  const cur = [...ROAD].reverse().find((r) => streak >= r.days)
  return cur ? `${cur.title}·${next ? `距${next.title}还差 ${next.days - streak} 关` : '传说达成！'}` : '整装出发'
}

/** 当日经验（重复结算取差值由 store 处理） */
export const dayXp = (v: Verdict, r: NightReport, planOk: boolean): number => {
  let xp = 0
  if (isWin(v)) xp += 20
  if (isPerfect(v)) xp += 10
  if (r.wakes !== 'many' && r.duration === 'h7plus') xp += 2
  if (planOk) xp += 5
  return xp
}

export const xpForLevel = (level: number): number => 40 + 15 * (level - 1)

export const levelFromXp = (xp: number): { level: number; into: number; need: number } => {
  let level = 1
  let rest = xp
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level)
    level += 1
  }
  return { level, into: rest, need: xpForLevel(level) }
}

const TITLES = [
  '见习讨伐员', '正式讨伐员', '精锐讨伐员', '梦境猎手', '猎梦大师', '梦界宗师', '传说猎梦人',
]

export const titleFor = (level: number): string =>
  TITLES[Math.min(Math.floor((level - 1) / 3), TITLES.length - 1)]

export const questProgress = (q: Quest, stats: Stats): number => {
  switch (q.kind) {
    case 'streak': return Math.max(stats.curStreak, stats.bestStreak)
    case 'total': return stats.winDays
    case 'perfect': return stats.perfectDays
    case 'boss': return stats.killsByMonster['tapir'] ?? 0
    case 'kills': return q.id === 'k30'
      ? Object.keys(stats.killsByMonster).length
      : Object.values(stats.killsByMonster).reduce((a, b) => a + b, 0)
    case 'xp': return stats.xp
  }
}

/** 判定某日期的战报是否有效记录 */
export const hasReport = (r?: NightReport): boolean => !!r && isRecorded(r)

export const statsFromRecords = (reports: Record<string, NightReport>, plans: Record<string, NightPlan>, prevStats?: Stats): Stats => {
  const dates = Object.keys(reports).filter((d) => isRecorded(reports[d])).sort()
  const base: Stats = prevStats
    ? { ...prevStats, killsByMonster: { ...prevStats.killsByMonster }, unlocked: [...prevStats.unlocked], unlockedAt: { ...prevStats.unlockedAt } }
    : {
        totalDays: 0, winDays: 0, perfectDays: 0, failDays: 0, bestScore: 0,
        curStreak: 0, bestStreak: 0, xp: 0, killsByMonster: {}, unlocked: [], unlockedAt: {},
      }
  base.totalDays = dates.length
  base.winDays = 0
  base.perfectDays = 0
  base.failDays = 0
  base.bestScore = 0
  let streak = 0
  let best = 0
  for (const d of dates) {
    const ev = evaluateReport(reports[d], planOf(plans, d))
    const v = ev.verdict
    if (isWin(v)) {
      base.winDays += 1
      streak += 1
      best = Math.max(best, streak)
    } else {
      streak = 0
      if (v === 'fail') base.failDays += 1
    }
    if (isPerfect(v)) base.perfectDays += 1
    base.bestScore = Math.max(base.bestScore, ev.score)
  }
  // 连击必须延续到最近记录日才算「当前」
  let cur = 0
  if (dates.length > 0) {
    const last = dates[dates.length - 1]
    const lastVerdict = evaluateReport(reports[last], planOf(plans, last)).verdict
    if (isWin(lastVerdict)) {
      cur = 1
      let cursor = parseYmd(last)
      for (;;) {
        const prev = ymd(addDays(cursor, -1))
        const pv = verdictOf(evaluateReport(reports[prev], planOf(plans, prev)).score)
        if (reports[prev] && isRecorded(reports[prev]) && isWin(pv)) {
          cur += 1
          cursor = parseYmd(prev)
        } else break
      }
    }
  }
  base.curStreak = cur
  base.bestStreak = Math.max(best, cur)
  return base
}

export const planOf = (plans: Record<string, NightPlan>, reportDate: string): NightPlan | undefined => {
  // 昨晚的预告 = 战报日期前一晚填的
  const prevDay = ymd(addDays(parseYmd(reportDate), -1))
  return plans[prevDay] ?? plans[reportDate]
}
