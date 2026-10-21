import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGame } from '../store'
import { evaluateReport, isWin } from '../logic/scoring'
import { monsterOf } from '../logic/monsters'
import { monthLabel, monthMatrix, parseYmd, today, ymd, addDays } from '../logic/dates'
import { Monster } from './Monster'
import { Icon } from './Icon'
import { DaySheet } from './DaySheet'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

/** 梦境回廊：日历即关卡地图，每格镇守一只梦魇怪 */
export const CorridorView = () => {
  const reports = useGame((s) => s.reports)
  const plans = useGame((s) => s.plans)

  const t = today()
  const [cursor, setCursor] = useState(() => t.slice(0, 7))
  const [sel, setSel] = useState<string | null>(null)

  const rows = useMemo(() => monthMatrix(cursor), [cursor])

  const shiftMonth = (n: number) => {
    const [y, m] = cursor.split('-').map(Number)
    const d = new Date(y, m - 1 + n, 1)
    setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const summary = useMemo(() => {
    let win = 0
    let fail = 0
    let idle = 0
    for (const row of rows)
      for (const d of row) {
        if (!d) continue
        const r = reports[d]
        if (!r) {
          idle += 1
        } else if (isWin(evaluateReport(r, undefined).verdict)) {
          win += 1
        } else if (evaluateReport(r, undefined).verdict === 'fail') {
          fail += 1
        }
      }
    return { win, fail, idle }
  }, [rows, reports])

  return (
    <div>
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => shiftMonth(-1)} aria-label="上一月">
          <Icon name="left" size={19} />
        </button>
        <div className="title">{monthLabel(cursor)}</div>
        <button type="button" className="cal-nav" onClick={() => shiftMonth(1)} aria-label="下一月">
          <Icon name="right" size={19} />
        </button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <button type="button" className="cal-today-btn" onClick={() => setCursor(t.slice(0, 7))}>
          回到本月
        </button>
      </div>

      <div className="card">
        <div className="cal-week">
          {WEEK.map((w, i) => (
            <span key={w} className={i === 0 || i === 6 ? 'wend' : undefined}>{w}</span>
          ))}
        </div>
        <div className="cal-grid">
          {rows.flat().map((d, i) => {
            if (!d) return <span key={`e${i}`} />
            const r = reports[d]
            const isBoss = monsterOf(d) === 'tapir'
            const isFuture = d > t
            const isToday = d === t
            const verdict = r ? evaluateReport(r, undefined).verdict : 'pending'
            return (
              <button
                key={d}
                type="button"
                className={`cal-cell${isFuture ? ' dim' : ''}${isToday ? ' today' : ''}${sel === d ? ' sel' : ''}`}
                onClick={() => setSel(d)}
                aria-label={`${d} ${r ? (isWin(verdict) ? '已通过' : verdict === 'fail' ? '战败' : '僵持') : '未挑战'}`}
              >
                <span className="dnum">{parseYmd(d).getDate()}</span>
                <span className="mark">
                  {r ? (
                    <span className={`cell-monster${isWin(verdict) ? ' won' : verdict === 'fail' ? ' angry' : ''}`}>
                      <Monster
                        species={monsterOf(d)}
                        mood={isWin(verdict) ? 'faint' : verdict === 'fail' ? 'full' : 'hurt'}
                        size={30}
                      />
                    </span>
                  ) : (
                    <span className={isFuture ? 'dungeon-dim' : 'dungeon-idle'}>
                      {isBoss && !isFuture && <Monster species="tapir" mood="silhouette" size={22} />}
                    </span>
                  )}
                </span>
                {isWin(verdict) && <span className="win-flag" style={{ position: 'absolute', top: 1, right: 3 }} />}
              </button>
            )
          })}
        </div>

        <div className="legend">
          <span className="li"><span className="win-flag" style={{ width: 14, height: 15 }} /> 通过</span>
          <span className="li"><Monster species="imp" mood="hurt" size={16} /> 僵持</span>
          <span className="li"><Monster species="imp" mood="full" size={16} /> 战败</span>
          <span className="li"><span className="dungeon-idle" style={{ width: 14, height: 14 }} /> 未挑战</span>
        </div>
        <div className="month-sum">
          本月通过 <b>{summary.win}</b> 关 · 战败 <b style={{ color: 'var(--cherry)' }}>{summary.fail}</b> 关
        </div>
      </div>

      <AnimatePresence>
        {sel && (
          <DaySheet
            date={sel}
            report={reports[sel]}
            plan={plans[ymd(addDays(parseYmd(sel), 1))]}
            onClose={() => setSel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
