import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, NightPlan, NightReport } from './types'
import { EMPTY_PLAN, EMPTY_REPORT, evaluateReport, isRecorded, isWin } from './logic/scoring'
import { monsterOf } from './logic/monsters'
import { dayXp, levelFromXp, planOf, questProgress, QUESTS, STORAGE_KEY, xpForLevel } from './logic/quests'
import { today, ymd, addDays, parseYmd } from './logic/dates'

interface TickResult {
  date: string
  verdict: ReturnType<typeof evaluateReport>['verdict']
  score: number
  newUnlocked: string[]
  levelBefore: number
  levelAfter: number
  xpGained: number
}

const initStats = () => ({
  totalDays: 0, winDays: 0, perfectDays: 0, failDays: 0, bestScore: 0,
  curStreak: 0, bestStreak: 0, xp: 0, killsByMonster: {}, unlocked: [] as string[], unlockedAt: {} as Record<string, string>,
})

export const useGame = create<GameState & {
  setReport: (date: string, r: NightReport) => TickResult
  setPlan: (date: string, p: NightPlan) => void
  clearReport: (date: string) => void
  dismissOneCelebrate: () => void
  importData: (json: string) => boolean
  resetAll: () => void
}>()(
  persist(
    (set, get) => {
      const recompute = (reports: Record<string, NightReport>, plans: Record<string, NightPlan>, prevStats: GameState['stats']) => {
        // 重算 stats 基础项
        const stats = { ...prevStats }
        const dates = Object.keys(reports).filter((d) => isRecorded(reports[d])).sort()
        stats.totalDays = dates.length
        stats.winDays = 0
        stats.perfectDays = 0
        stats.failDays = 0
        stats.bestScore = 0
        let streak = 0
        let best = 0
        for (const d of dates) {
          const ev = evaluateReport(reports[d], planOf(plans, d))
          if (isWin(ev.verdict)) {
            stats.winDays += 1
            streak += 1
            best = Math.max(best, streak)
          } else {
            streak = 0
            if (ev.verdict === 'fail') stats.failDays += 1
          }
          if (ev.verdict === 'perfect') stats.perfectDays += 1
          stats.bestScore = Math.max(stats.bestScore, ev.score)
        }
        let cur = 0
        if (dates.length > 0) {
          const last = dates[dates.length - 1]
          const lastEv = evaluateReport(reports[last], planOf(plans, last))
          if (isWin(lastEv.verdict)) {
            cur = 1
            let cursor = parseYmd(last)
            for (;;) {
              const prev = ymd(addDays(cursor, -1))
              const rep = reports[prev]
              if (rep && isRecorded(rep) && isWin(evaluateReport(rep, planOf(plans, prev)).verdict)) {
                cur += 1
                cursor = parseYmd(prev)
              } else break
            }
          }
        }
        stats.curStreak = cur
        stats.bestStreak = Math.max(best, cur)
        return stats
      }

      const checkUnlocks = (stats: GameState['stats'], celebrated: string[]): string[] => {
        const fresh: string[] = []
        for (const q of QUESTS) {
          if (!celebrated.includes(q.id) && questProgress(q, stats) >= q.goal) fresh.push(q.id)
        }
        return fresh
      }

      return {
        version: 1,
        reports: {},
        plans: {},
        stats: initStats(),
        celebrated: [],
        pendingCelebrate: [],

        setReport: (date, r) => {
          const s = get()
          const reports = { ...s.reports, [date]: r }
          const plans = s.plans
          const prevStats = s.stats
          const oldXp = dayXp(
            s.reports[date] ? evaluateReport(s.reports[date], planOf(plans, date)).verdict : 'pending',
            s.reports[date] ?? EMPTY_REPORT,
            !!planOf(plans, date) && (planOf(plans, date)!.bed !== 'at24' || planOf(plans, date)!.phone !== 'some'),
          )
          const stats = recompute(reports, plans, prevStats)
          const ev = evaluateReport(r, planOf(plans, date))
          const newXp = dayXp(ev.verdict, r, ev.bonus.keepWord)
          stats.xp = Math.max(0, prevStats.xp - oldXp + newXp)

          // 击杀图鉴
          const kills = { ...stats.killsByMonster }
          if (isWin(ev.verdict)) {
            const m = monsterOf(date)
            kills[m] = (kills[m] ?? 0) + 1
          }
          stats.killsByMonster = kills

          const levelBefore = levelFromXp(prevStats.xp).level

          const fresh = checkUnlocks(stats, s.celebrated)
          fresh.forEach((id) => {
            const q = QUESTS.find((x) => x.id === id)!
            stats.xp += q.tier * 25
          })
          const finalLevelAfter = levelFromXp(stats.xp).level

          const celebrated = [...s.celebrated, ...fresh]
          const pendingCelebrate = [...s.pendingCelebrate, ...fresh]
          stats.unlocked = [...new Set([...stats.unlocked, ...fresh])]
          fresh.forEach((id) => {
            if (!stats.unlockedAt[id]) stats.unlockedAt[id] = today()
          })

          set({ reports, plans, stats, celebrated, pendingCelebrate })

          return {
            date,
            verdict: ev.verdict,
            score: ev.score,
            newUnlocked: fresh,
            levelBefore,
            levelAfter: finalLevelAfter,
            xpGained: stats.xp - prevStats.xp,
          }
        },

        setPlan: (date, p) => {
          const s = get()
          set({ plans: { ...s.plans, [date]: p } })
        },

        clearReport: (date) => {
          const s = get()
          const reports = { ...s.reports }
          delete reports[date]
          const stats = recompute(reports, s.plans, { ...s.stats, xp: 0 })
          // 经验回退：删掉该日的当日经验
          const lost = s.reports[date] ? dayXp(evaluateReport(s.reports[date], planOf(s.plans, date)).verdict, s.reports[date], !!planOf(s.plans, date)) : 0
          stats.xp = Math.max(0, s.stats.xp - lost)
          set({ reports, stats })
        },

        dismissOneCelebrate: () => {
          set({ pendingCelebrate: get().pendingCelebrate.slice(1) })
        },

        importData: (json) => {
          try {
            const d = JSON.parse(json)
            if (d?.app !== 'sleep-raid' || typeof d.reports !== 'object' || typeof d.plans !== 'object') return false
            const reports: Record<string, NightReport> = {}
            for (const [k, v] of Object.entries(d.reports as Record<string, NightReport>)) {
              if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue
              const r = { ...EMPTY_REPORT, ...(v as object) }
              if (!(r.slept in { lt23: 1, at24: 1, at1: 1, at2: 1, at3: 1, unknown: 1 })) continue
              reports[k] = r
            }
            const plans: Record<string, NightPlan> = {}
            for (const [k, v] of Object.entries(d.plans as Record<string, NightPlan>)) {
              if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue
              const p = { ...EMPTY_PLAN, ...(v as object) }
              if (!(p.bed in { lt23: 1, at24: 1, at1: 1, later: 1 })) continue
              plans[k] = p
            }
            const stats = recompute(reports, plans, initStats())
            const totalReportXp = Object.entries(reports).reduce(
              (acc, [d, r]) => acc + dayXp(evaluateReport(r, planOf(plans, d)).verdict, r, evaluateReport(r, planOf(plans, d)).bonus.keepWord),
              0,
            )
            stats.xp = totalReportXp
            set({ reports, plans, stats, celebrated: stats.unlocked, pendingCelebrate: [] })
            return true
          } catch {
            return false
          }
        },

        resetAll: () =>
          set({ reports: {}, plans: {}, stats: initStats(), celebrated: [], pendingCelebrate: [] }),
      }
    },
    {
      name: STORAGE_KEY,
      version: 1,
      // xpForLevel 仅被 levelFromXp 内部使用，这里显式排除以减小体积
      partialize: (s) => {
        void xpForLevel
        const { setReport, setPlan, clearReport, dismissOneCelebrate, importData, resetAll, ...data } = s
        return data as GameState
      },
    },
  ),
)

/** 当日（昨晚战报视角：今天早上结算昨晚） */
export const useStats = () => useGame((s) => s.stats)
