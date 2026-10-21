import { isWeekend, weekday } from './dates'

export type MonsterSpecies = 'tapir' | 'imp' | 'ghost' | 'slime' | 'cat' | 'cloud'

export interface MonsterDef {
  id: MonsterSpecies
  name: string
  title: string
  taunt: string
  lose: string
  win: string
  boss: boolean
}

export const MONSTERS: MonsterDef[] = [
  {
    id: 'imp',
    name: '失眠小恶魔',
    title: '数羊捣乱专业的',
    taunt: '数羊吗？我替你数到天亮～',
    lose: '唔哇，羊都站你那边！本恶魔先撤了！',
    win: '嘿嘿，你眨眼了！今晚继续数羊吧！',
    boss: false,
  },
  {
    id: 'ghost',
    name: '熬夜幽灵',
    title: '「就刷最后一个」协会会长',
    taunt: '再刷一个视频嘛，就一个！',
    lose: '早睡怪人……可恶，竟被规律作息打败！',
    win: '欢迎来到凌晨三点的世界～嘿嘿。',
    boss: false,
  },
  {
    id: 'slime',
    name: '咖啡因史莱姆',
    title: '奶茶残党·下午三点半形态',
    taunt: '下午那杯奶茶是我的力量！',
    lose: '你的睡眠债还清了……本史莱姆蔫了……',
    win: '咕嘟咕嘟～今晚脑子让它自己转吧！',
    boss: false,
  },
  {
    id: 'cat',
    name: '报复性熬夜猫',
    title: '「夜晚才是自己的人生」主张者',
    taunt: '白天属于老板，夜晚属于我！',
    lose: '好吧好吧……睡饱的猫才最有威严……退下！',
    win: '凌晨两点的猫生才是完整猫生喵～',
    boss: false,
  },
  {
    id: 'cloud',
    name: '噩梦乌云',
    title: '午夜恐怖片放映员',
    taunt: '今晚给你放部恐怖片怎么样？',
    lose: '晴天娃娃技高一筹……乌云散场……',
    win: '轰隆隆——今晚梦里见分晓！',
    boss: false,
  },
  {
    id: 'tapir',
    name: '暴食梦貘',
    title: '周末关底 BOSS·吃噩梦也吃好梦',
    taunt: '本梦貘吃噩梦长大，今晚来点新的？',
    lose: '好梦太撑了！本貘认输，下周再来！',
    win: '安稳觉？不存在的，嘿嘿嘿——',
    boss: true,
  },
]

export const monsterById = (id: string): MonsterDef =>
  MONSTERS.find((m) => m.id === id) ?? MONSTERS[0]

/** 按日期哈希固定当日怪物；周日固定 BOSS（周末守关战） */
export const monsterOf = (date: string): MonsterSpecies => {
  if (weekday(date) === 0) return 'tapir'
  if (isWeekend(date)) return 'tapir'
  const pool: MonsterSpecies[] = ['imp', 'ghost', 'slime', 'cat', 'cloud']
  let h = 0
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) | 0
  return pool[Math.abs(h) % pool.length]
}
