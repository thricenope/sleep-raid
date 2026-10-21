import type { NightPlan, NightReport, Verdict } from '../types'

/** 睡眠评分表（梦境讨伐队专属：战报 + 预告两段式） */
export const SLEPT_PTS: Record<NightReport['slept'], number> = {
  lt23: 4,
  at24: 2,
  at1: 0,
  at2: -2,
  at3: -4,
  unknown: 0,
}

export const DURATION_PTS: Record<NightReport['duration'], number> = {
  h7plus: 3,
  h6to7: 1,
  h5to6: -1,
  h5less: -3,
}

export const WAKES_PTS: Record<NightReport['wakes'], number> = {
  none: 2,
  once: 1,
  twice: 0,
  many: -2,
}

export const MORNING_PTS: Record<NightReport['morning'], number> = {
  fresh: 2,
  ok: 1,
  foggy: -1,
  crash: -2,
}

export const BED_PTS: Record<NightPlan['bed'], number> = {
  lt23: 2,
  at24: 1,
  at1: 0,
  later: -1,
}

export const PHONE_PTS: Record<NightPlan['phone'], number> = {
  no: 1,
  some: 0,
  sleepy: -1,
}

export const EXERCISE_PTS = 2
export const EXERCISE_DAILY_CAP = 2

export const EMPTY_REPORT: NightReport = {
  slept: 'unknown',
  duration: 'h7plus',
  wakes: 'none',
  morning: 'ok',
  exercises: [],
}

export const EMPTY_PLAN: NightPlan = {
  bed: 'at24',
  phone: 'some',
}

export const VERDICT_META: Record<Verdict, { title: string; cls: string }> = {
  pending: { title: '未结算', cls: 'v-pending' },
  perfect: { title: '完美讨伐！', cls: 'v-perfect' },
  win: { title: '击退！', cls: 'v-win' },
  plain: { title: '僵持…', cls: 'v-plain' },
  fail: { title: '战败…', cls: 'v-fail' },
}

export interface Part {
  label: string
  pts: number
}

export const isRecorded = (r: NightReport): boolean =>
  r.slept !== 'unknown' || r.duration !== 'h7plus' || r.wakes !== 'none' || r.morning !== 'ok' || r.exercises.length > 0

export const hasPlan = (p: NightPlan): boolean => p.bed !== 'at24' || p.phone !== 'some'

export interface EvaluateResult {
  score: number
  verdict: Verdict
  parts: Part[]
  bonus: { keepWord: boolean; sleepWell: boolean }
}

/** 战报评分（不含预告） */
export const reportScore = (r: NightReport): number =>
  SLEPT_PTS[r.slept] + DURATION_PTS[r.duration] + WAKES_PTS[r.wakes] + MORNING_PTS[r.morning] +
  Math.min(r.exercises.length, EXERCISE_DAILY_CAP) * EXERCISE_PTS

export const planScore = (p: NightPlan): number => BED_PTS[p.bed] + PHONE_PTS[p.phone]

export const verdictOf = (score: number): Verdict =>
  score >= 6 ? 'perfect' : score >= 2 ? 'win' : score >= 0 ? 'plain' : 'fail'

/** 结算昨晚战报。yesterdayPlan = 昨晚睡前填的预告（用于「言出必行」） */
export const evaluateReport = (r: NightReport, yesterdayPlan?: NightPlan): EvaluateResult => {
  const parts: Part[] = []
  parts.push({ label: '入睡时间', pts: SLEPT_PTS[r.slept] })
  parts.push({ label: '睡眠时长', pts: DURATION_PTS[r.duration] })
  parts.push({ label: '夜醒次数', pts: WAKES_PTS[r.wakes] })
  parts.push({ label: '晨起状态', pts: MORNING_PTS[r.morning] })
  if (r.exercises.length > 0)
    parts.push({ label: `日间运动 ×${Math.min(r.exercises.length, EXERCISE_DAILY_CAP)}`, pts: Math.min(r.exercises.length, EXERCISE_DAILY_CAP) * EXERCISE_PTS })

  const bonus = { keepWord: false, sleepWell: false }
  let score = reportScore(r)
  if (r.slept !== 'unknown') {
    if (r.wakes !== 'many' && r.duration === 'h7plus') {
      bonus.sleepWell = true
      score += 2
      parts.push({ label: '深度好眠奖励', pts: 2 })
    }
    if (yesterdayPlan && planScore(yesterdayPlan) >= 2 && score >= 2) {
      bonus.keepWord = true
      score += 3
      parts.push({ label: '言出必行！', pts: 3 })
    }
  }
  return { score, verdict: verdictOf(score), parts, bonus }
}

export const isWin = (v: Verdict): boolean => v === 'win' || v === 'perfect'
export const isPerfect = (v: Verdict): boolean => v === 'perfect'

/** 伤害公式（与 slim-hero 同构的独立实现） */
export const damageOf = (score: number): number => Math.max(1, Math.min(100, (score + 6) * 10))
