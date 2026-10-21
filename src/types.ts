/** 昨晚战报：晨起填写，结算昨晚的梦境关卡 */
export interface NightReport {
  /** 实际入睡档位 */
  slept: 'lt23' | 'at24' | 'at1' | 'at2' | 'at3' | 'unknown'
  /** 睡眠时长档位 */
  duration: 'h7plus' | 'h6to7' | 'h5to6' | 'h5less'
  /** 夜醒次数 */
  wakes: 'none' | 'once' | 'twice' | 'many'
  /** 晨起状态 */
  morning: 'fresh' | 'ok' | 'foggy' | 'crash'
  /** 做了运动（日间，间接助眠） */
  exercises: string[]
}

/** 今晚上床预告：睡前填写，给今晚出征加成 */
export interface NightPlan {
  /** 预计上床档位 */
  bed: 'lt23' | 'at24' | 'at1' | 'later'
  /** 手机计划 */
  phone: 'no' | 'some' | 'sleepy'
}

export type Verdict = 'pending' | 'perfect' | 'win' | 'plain' | 'fail'

export interface Stats {
  totalDays: number
  winDays: number
  perfectDays: number
  failDays: number
  bestScore: number
  curStreak: number
  bestStreak: number
  xp: number
  killsByMonster: Record<string, number>
  unlocked: string[]
  unlockedAt: Record<string, string>
}

export interface GameState {
  version: 1
  /** key = 战报所属日期（即昨晚的日期） */
  reports: Record<string, NightReport>
  /** key = 日期，值为该晚的预告 */
  plans: Record<string, NightPlan>
  stats: Stats
  /** 成就弹窗已展示 */
  celebrated: string[]
  /** 战功弹窗待展示队列 */
  pendingCelebrate: string[]
}

export interface SaveResult {
  date: string
  verdict: Verdict
  score: number
  newUnlocked: string[]
  levelBefore: number
  levelAfter: number
}

export type TickResult = SaveResult & { xpGained: number }
