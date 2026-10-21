import { useMemo } from 'react'
import type { NightReport } from '../types'
import { DURATION_PTS, MORNING_PTS, SLEPT_PTS, WAKES_PTS } from '../logic/scoring'
import { Icon } from './Icon'

const SLEPT_OPTS: { v: NightReport['slept']; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { v: 'lt23', label: '23 点前', icon: 'sunset' },
  { v: 'at24', label: '24 点', icon: 'dusk' },
  { v: 'at1', label: '1 点', icon: 'night' },
  { v: 'at2', label: '2 点', icon: 'moon' },
  { v: 'at3', label: '3 点后', icon: 'moon' },
  { v: 'unknown', label: '记不清', icon: 'question' },
]

const DUR_OPTS: { v: NightReport['duration']; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { v: 'h7plus', label: '≥7 小时', icon: 'h7' },
  { v: 'h6to7', label: '6–7 小时', icon: 'h6' },
  { v: 'h5to6', label: '5–6 小时', icon: 'h5' },
  { v: 'h5less', label: '<5 小时', icon: 'hs' },
]

const WAKES_OPTS: { v: NightReport['wakes']; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { v: 'none', label: '一觉到天亮', icon: 'bed' },
  { v: 'once', label: '醒 1 次', icon: 'eye1' },
  { v: 'twice', label: '醒 2 次', icon: 'eye2' },
  { v: 'many', label: '醒 ≥3 次', icon: 'eyes' },
]

const MORNING_OPTS: { v: NightReport['morning']; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { v: 'fresh', label: '神清气爽', icon: 'fresh' },
  { v: 'ok', label: '还行', icon: 'ok' },
  { v: 'foggy', label: '昏昏沉沉', icon: 'foggy' },
  { v: 'crash', label: '崩溃困倦', icon: 'crash' },
]

const EX_OPTS: { v: string; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { v: 'gym', label: '健身', icon: 'gym' },
  { v: 'run', label: '跑步', icon: 'run' },
  { v: 'walk', label: '散步', icon: 'walk' },
  { v: 'swim', label: '游泳', icon: 'swim' },
  { v: 'bike', label: '骑行', icon: 'bike' },
  { v: 'yoga', label: '瑜伽', icon: 'yoga' },
  { v: 'ball', label: '球类', icon: 'ball' },
  { v: 'hiit', label: 'HIIT', icon: 'hiit' },
]

const Sec = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="sec">
    <div className="sec-head">
      <h2>{title}</h2>
      {hint && <span className="note">{hint}</span>}
    </div>
    {children}
  </div>
)

/** 昨晚战报编辑器（晨起填写） */
export const ReportEditor = ({ value, onChange }: { value: NightReport; onChange: (patch: Partial<NightReport>) => void }) => {
  const exPts = useMemo(() => Math.min(value.exercises.length, 2) * 2, [value.exercises.length])

  return (
    <div>
      <Sec title="昨晚几点睡的？" hint={`${SLEPT_PTS[value.slept] >= 0 ? '+' : ''}${SLEPT_PTS[value.slept]} 分`}>
        <div className="chips">
          {SLEPT_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              className={`chip${value.slept === o.v ? ' on' : ''}`}
              onClick={() => onChange({ slept: o.v })}
            >
              <Icon name={o.icon} size={17} />
              {o.label}
            </button>
          ))}
        </div>
      </Sec>

      <Sec title="睡了多久？" hint={`${DURATION_PTS[value.duration] >= 0 ? '+' : ''}${DURATION_PTS[value.duration]} 分`}>
        <div className="chips">
          {DUR_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              className={`chip${value.duration === o.v ? ' on' : ''}`}
              onClick={() => onChange({ duration: o.v })}
            >
              <Icon name={o.icon} size={17} />
              {o.label}
            </button>
          ))}
        </div>
      </Sec>

      <Sec title="夜里醒过吗？" hint={`${WAKES_PTS[value.wakes] >= 0 ? '+' : ''}${WAKES_PTS[value.wakes]} 分`}>
        <div className="chips">
          {WAKES_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              className={`chip${value.wakes === o.v ? ' on' : ''}`}
              onClick={() => onChange({ wakes: o.v })}
            >
              <Icon name={o.icon} size={17} />
              {o.label}
            </button>
          ))}
        </div>
      </Sec>

      <Sec title="早上起来感觉？" hint={`${MORNING_PTS[value.morning] >= 0 ? '+' : ''}${MORNING_PTS[value.morning]} 分`}>
        <div className="chips">
          {MORNING_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              className={`chip${value.morning === o.v ? ' on' : ''}`}
              onClick={() => onChange({ morning: o.v })}
            >
              <Icon name={o.icon} size={17} />
              {o.label}
            </button>
          ))}
        </div>
      </Sec>

      <Sec title="昨天有运动吗？" hint={`每项 +2 分 · 最多计 2 项${exPts > 0 ? ` · 已 +${exPts}` : ''}`}>
        <div className="ex-grid">
          {EX_OPTS.map((o) => {
            const on = value.exercises.includes(o.v)
            return (
              <button
                key={o.v}
                type="button"
                className={`ex-cell${on ? ' on' : ''}`}
                onClick={() =>
                  onChange({
                    exercises: on ? value.exercises.filter((x) => x !== o.v) : [...value.exercises, o.v],
                  })
                }
              >
                <Icon name={o.icon} size={22} />
                {o.label}
              </button>
            )
          })}
        </div>
        <p className="chip-hint">白天动一动，晚上睡得更沉 —— 怪物最怕运动过的队长！</p>
      </Sec>
    </div>
  )
}
