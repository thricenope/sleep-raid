import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { NightPlan, NightReport } from '../types'
import { useGame } from '../store'
import {
  EMPTY_PLAN, EMPTY_REPORT, VERDICT_META, damageOf, evaluateReport,
  isRecorded, isWin, planScore,
} from '../logic/scoring'
import type { EvaluateResult } from '../logic/scoring'
import { monsterById, monsterOf } from '../logic/monsters'
import { comboTitle } from '../logic/quests'
import { titleFor } from '../logic/quests'
import { dateCn, today, ymd, addDays, parseYmd, weekCn } from '../logic/dates'
import { bigCelebration, burstAt } from '../celebrate'
import { Monster } from './Monster'
import { Captain } from './Captain'
import { ReportEditor } from './ReportEditor'
import { PlanEditor } from './PlanEditor'
import { Icon } from './Icon'

const BATTLE_LINES = {
  pending: ['本梦魇今晚状态绝佳，先做个预告？', '队长还没交战报呢，本怪等着！', '就这？先填战况啦，队长！'],
  perfect: ['哇啊——暴击！本怪当场散成星星！', '教科书级讨伐！梦界广播都在放！', '太强了！梦魇们连夜给地下城上了锁！'],
  win: ['漂亮！本怪哭着退出关卡～', '干净利落，队长威武！', '今晚也是闪闪发光的讨伐夜！'],
  plain: ['唔……就掉了层皮，本怪还在蹦跶。', '差一点点就击退了，明晚再战？', '平分秋色，本怪瑟瑟但没倒。'],
  fail: ['本怪回血了！还冲你做了个鬼脸……', '呜，这仗打输了。今晚早点上床，赢回来！', '本怪得瑟中：嘿嘿，谢谢款待～'],
}

const evMeta = (ev: EvaluateResult) => VERDICT_META[ev.verdict]

/** 主视图：出征（战斗舞台 + 昨晚战报 + 今晚预告） */
export const RaidView = () => {
  const setReport = useGame((s) => s.setReport)
  const setPlan = useGame((s) => s.setPlan)
  const clearReport = useGame((s) => s.clearReport)
  const reports = useGame((s) => s.reports)
  const plans = useGame((s) => s.plans)
  const stats = useGame((s) => s.stats)

  const t = today()
  /** 昨晚关卡日期 = 今天 −1 */
  const raidDate = useMemo(() => ymd(addDays(parseYmd(t), -1)), [t])
  const saved = reports[raidDate]
  const savedPlan = plans[t] // 昨晚睡前填的预告（今天日期键）

  const [draft, setDraft] = useState<NightReport>(saved ?? { ...EMPTY_REPORT })
  const [plan, setPlanState] = useState<NightPlan>(savedPlan ?? { ...EMPTY_PLAN })
  const [attacking, setAttacking] = useState(false)
  const [hit, setHit] = useState<{ id: number; text: string; crit: boolean } | null>(null)
  const [shake, setShake] = useState(0)
  const [combo, setCombo] = useState<{ n: number; title: string } | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  const ev = useMemo(() => evaluateReport(draft, savedPlan), [draft, savedPlan])
  const meta = evMeta(ev)
  const touched = isRecorded(draft)
  const recorded = !!saved

  const monsterId = monsterOf(raidDate)
  const skin = monsterById(monsterId)

  const hpLeft = recorded
    ? isWin(saved ? ev.verdict : 'pending')
      ? 0
      : Math.max(8, 100 - damageOf(ev.score))
    : touched && ev.score > 0
      ? Math.max(8, 100 - damageOf(ev.score))
      : 100

  const mood = !touched ? 'full' : ev.verdict === 'fail' || ev.verdict === 'plain' ? 'full' : ev.verdict === 'win' ? 'hurt' : 'faint'
  const line = recorded
    ? ev.verdict === 'fail'
      ? skin.win
      : ev.verdict === 'plain'
        ? '就擦破点皮！本怪还能蹦十年！'
        : skin.lose
    : touched && ev.score >= 2
      ? '等等——你怎么先预览了战术？！'
      : skin.taunt

  const planBonus = planScore(savedPlan ?? plan)

  const doRaid = () => {
    const result = setReport(raidDate, draft)
    setPlan(t, plan)

    setAttacking(true)
    setTimeout(() => setAttacking(false), 600)
    setShake((n) => n + 1)

    const dmg = damageOf(result.verdict === 'fail' ? Math.min(result.score, -1) : result.score)
    setHit({
      id: Date.now(),
      text: result.verdict === 'perfect' ? '会心一击！' : `伤害 ${Math.min(dmg, 100)}`,
      crit: result.verdict === 'perfect',
    })
    setTimeout(() => setHit(null), 1400)

    if (result.verdict === 'win' || result.verdict === 'perfect') {
      bigCelebration()
      burstAt(ctaRef.current)
      const cur = useGame.getState().stats.curStreak
      if (cur >= 2) {
        setCombo({ n: cur, title: comboTitle(cur) })
        setTimeout(() => setCombo(null), 1900)
      }
    } else if (result.xpGained > 0) {
      burstAt(ctaRef.current)
    }

    if (result.levelAfter > result.levelBefore) {
      setTimeout(() => setLevelUp(result.levelAfter), 700)
    }
  }

  return (
    <div>
      {stats.totalDays === 0 && (
        <div className="card guide-card">
          <div className="g-title">欢迎加入梦境讨伐队！</div>
          <ol>
            <li>睡前填<b>今晚预告</b>，说出上床承诺</li>
            <li>早上回来填<b>昨晚战报</b>——睡得越好，伤害越高</li>
            <li>≥2 分击退，≥6 分暴击；连击推进<b>讨伐之路</b></li>
          </ol>
        </div>
      )}

      <div className="card battle-card">
        <div className="battle-date">
          <Icon name="calendar" size={15} />
          {dateCn(raidDate)}（{weekCn(raidDate)}）的梦境关卡
        </div>
        <div className="battle-scene night-scene">
          <div className="battle-stars" aria-hidden="true" />
          <div className="battle-cloud" aria-hidden="true" />
          <div className="battle-hero">
            <Captain attacking={attacking} size={88} />
          </div>
          <motion.div
            key={shake}
            className="battle-monster"
            initial={shake > 0 ? { x: 0 } : false}
            animate={shake > 0 ? { x: [0, -8, 7, -5, 0] } : undefined}
            transition={{ duration: 0.4 }}
          >
            <Monster species={monsterId} mood={mood} size={150} />
          </motion.div>
          <AnimatePresence>
            {hit && (
              <motion.div
                key={hit.id}
                className={`dmg-float${hit.crit ? ' crit' : ''}`}
                initial={{ y: 10, opacity: 0, scale: 0.6 }}
                animate={{ y: -46, opacity: 1, scale: 1.15 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {hit.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hp-row">
          <span className="hp-name">
            {skin.name}
            {skin.boss && <b className="boss-tag">BOSS</b>}
          </span>
          <div className="hp-track" role="img" aria-label={`怪物血量 ${Math.round(hpLeft)}%`}>
            <motion.div className="hp-fill" animate={{ width: `${hpLeft}%` }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} />
            {[25, 50, 75].map((p) => (
              <span key={p} className="hp-tick" style={{ left: `${p}%` }} />
            ))}
          </div>
          <span className="hp-num">{Math.round(hpLeft)}%</span>
        </div>

        <div className="bubble">
          <AnimatePresence mode="wait">
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <div className="hi">{line}</div>
              <div className="sub">
                {recorded ? `战报结算：${meta.title}` : touched ? '预览战术中 · 按「出征！」结算' : '怪物叫嚣中 · 填完战报就出征'}
                {stats.curStreak > 0 && ` · 连击 ${stats.curStreak} 关`}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {recorded && (
        <div className="done-banner">
          <Icon name="check" size={20} style={{ color: '#0e8f6c' }} />
          <span className="t">该关卡已结算：{meta.title}</span>
          <span className="s">{ev.score} 分</span>
        </div>
      )}

      <div className="sec-head" style={{ marginTop: 20 }}>
        <h2>🌙 昨晚战报</h2>
        <span className="note">晨起回忆，结算 {dateCn(raidDate)} 关卡</span>
      </div>
      <ReportEditor value={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />

      <div className="sec-head" style={{ marginTop: 8 }}>
        <h2>🛏️ 今晚预告</h2>
        <span className="note">说出承诺 · 明早兑现 +3</span>
      </div>
      <PlanEditor value={plan} onChange={(p) => setPlanState((d) => ({ ...d, ...p }))} />

      <div className="card live-verdict">
        <div className="row">
          <span className={`vpill ${meta.cls}`}>{meta.title}</span>
          <span
            className={`score-num ${ev.score > 0 ? 'pos' : ev.score < 0 ? 'neg' : 'zero'}`}
            aria-label={`攻击力 ${ev.score}`}
          >
            {ev.score > 0 ? `+${ev.score}` : ev.score}
          </span>
        </div>
        <div className="parts">
          {ev.parts.map((p, i) => (
            <div className="p" key={i}>
              <span>{p.label}</span>
              <b className={p.pts > 0 ? 'plus' : p.pts < 0 ? 'minus' : 'zero'}>
                {p.pts > 0 ? `+${p.pts}` : p.pts}
              </b>
            </div>
          ))}
          {ev.parts.length === 0 && (
            <div className="p">
              <span style={{ color: 'var(--ink-3)' }}>填了战报才会出分</span>
            </div>
          )}
          <div className="p">
            <span style={{ color: 'var(--ink-3)' }}>≥ 2 分击退 · ≥ 6 分暴击击败</span>
          </div>
          {planBonus >= 2 && !recorded && (
            <div className="p">
              <span style={{ color: 'var(--moon-deep, #8A5A00)' }}>✨ 今晚预告已达标，明天兑现 +3</span>
            </div>
          )}
        </div>
      </div>

      <motion.button
        ref={ctaRef}
        type="button"
        className="cta"
        whileTap={{ scale: 0.97 }}
        disabled={!touched}
        onClick={doRaid}
      >
        <Icon name="sword" size={22} />
        {recorded ? '重新结算' : '出征！'}
      </motion.button>

      {recorded && (
        <div style={{ textAlign: 'center' }}>
          <button
            className="ghost-link"
            onClick={() => {
              if (window.confirm('撤退该关卡战报吗？')) {
                clearReport(raidDate)
                setDraft({ ...EMPTY_REPORT })
              }
            }}
          >
            <Icon name="trash" size={14} /> 撤退战报
          </button>
        </div>
      )}

      <AnimatePresence>
        {combo && (
          <motion.div
            className="combo-banner"
            initial={{ scale: 0.3, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            ×{combo.n} 连击！
            <small>{combo.title}</small>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelUp !== null && (
          <motion.div
            className="cele-mask z-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLevelUp(null)}
          >
            <motion.div
              className="cele-card"
              initial={{ scale: 0.5, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rays" />
              <div className="cele-kind">等 级 提 升</div>
              <motion.div
                className="cele-emoji"
                initial={{ rotate: -20, scale: 0.4 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.15 }}
              >
                <Icon name="crown" size={72} style={{ color: '#e8a50f' }} />
              </motion.div>
              <div className="cele-title">LV {levelUp}</div>
              <div className="cele-desc">获得称号「{titleFor(levelUp)}」</div>
              <div className="cele-xp">讨伐队越来越强！</div>
              <button type="button" className="cta mint" onClick={() => setLevelUp(null)}>
                太棒了！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { BATTLE_LINES }
