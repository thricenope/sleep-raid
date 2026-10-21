import { motion } from 'framer-motion'
import type { NightPlan, NightReport } from '../types'
import { SLEPT_PTS, DURATION_PTS, WAKES_PTS, MORNING_PTS, evaluateReport, isWin } from '../logic/scoring'
import { SLEPT_LABEL, DURATION_LABEL, WAKES_LABEL, MORNING_LABEL } from './ReportEditor'
import { BED_LABEL, PHONE_LABEL } from './PlanEditor'
import { monsterById, monsterOf } from '../logic/monsters'
import { dateCn, weekCn } from '../logic/dates'
import { Monster } from './Monster'
import { Icon } from './Icon'

const row = (label: string, value: string, pts: number) => (
  <div className="p">
    <span>{label}</span>
    <b className={pts > 0 ? 'plus' : pts < 0 ? 'minus' : 'zero'}>
      {value} {pts > 0 ? `+${pts}` : pts}
    </b>
  </div>
)

/** 关卡详情弹层（可在此补录战报的指引） */
export const DaySheet = ({
  date, report, plan, onClose,
}: {
  date: string
  report?: NightReport
  plan?: NightPlan
  onClose: () => void
}) => {
  const ev = report ? evaluateReport(report, plan) : null
  const skin = monsterById(monsterOf(date))
  const isBoss = skin.boss

  return (
    <motion.div
      className="sheet-mask"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="sheet"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" />
        <div className="sheet-head">
          <h3>
            {dateCn(date)} {weekCn(date)} 关卡
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="sheet-monster-row">
          <Monster species={skin.id} mood={report ? (isWin(ev!.verdict) ? 'faint' : 'hurt') : 'full'} size={46} />
          <div style={{ flex: 1 }}>
            <div className="sheet-monster-name">
              {skin.name}
              {isBoss && <b className="boss-tag">BOSS</b>}
            </div>
            <div className="sheet-monster-title">{skin.title}</div>
          </div>
        </div>

        {ev ? (
          <>
            <div className="live-verdict card" style={{ marginBottom: 12 }}>
              <div className="row">
                <span className={`vpill ${ev.verdict === 'pending' ? 'v-pending' : `v-${ev.verdict}`}`}>
                  {ev.verdict === 'perfect' ? '完美讨伐！' : ev.verdict === 'win' ? '击退！' : ev.verdict === 'plain' ? '僵持…' : '战败…'}
                </span>
                <span className={`score-num ${ev.score > 0 ? 'pos' : ev.score < 0 ? 'neg' : 'zero'}`}>
                  {ev.score > 0 ? `+${ev.score}` : ev.score}
                </span>
              </div>
              <div className="parts">
                {row('入睡时间', SLEPT_LABEL[report!.slept], SLEPT_PTS[report!.slept])}
                {row('睡眠时长', DURATION_LABEL[report!.duration], DURATION_PTS[report!.duration])}
                {row('夜醒次数', WAKES_LABEL[report!.wakes], WAKES_PTS[report!.wakes])}
                {row('晨起状态', MORNING_LABEL[report!.morning], MORNING_PTS[report!.morning])}
                {report!.exercises.length > 0 &&
                  row('日间运动', `×${Math.min(report!.exercises.length, 2)}`, Math.min(report!.exercises.length, 2) * 2)}
                {ev.bonus.sleepWell && row('深度好眠奖励', '', 2)}
                {ev.bonus.keepWord && row('言出必行！', '', 3)}
              </div>
            </div>
            {plan && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  当晚预告：{BED_LABEL[plan.bed]}上床 · 手机{PHONE_LABEL[plan.phone]}
                </div>
              </div>
            )}
            <p className="chip-hint" style={{ textAlign: 'center' }}>
              想改战报？回出征页重新结算该关即可。
            </p>
          </>
        ) : (
          <div className="empty-tip">这一关还没开战 —— 回出征页补填当晚战报就能补打！</div>
        )}
      </motion.div>
    </motion.div>
  )
}
