import type { NightPlan } from '../types'
import { BED_PTS, PHONE_PTS } from '../logic/scoring'
import { Icon } from './Icon'

const BED_OPTS: { v: NightPlan['bed']; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { v: 'lt23', label: '23 点前', icon: 'sunset' },
  { v: 'at24', label: '24 点', icon: 'dusk' },
  { v: 'at1', label: '1 点', icon: 'night' },
  { v: 'later', label: '更晚', icon: 'moon' },
]

const PHONE_OPTS: { v: NightPlan['phone']; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { v: 'no', label: '睡前不玩', icon: 'phone-no' },
  { v: 'some', label: '玩一会儿', icon: 'phone-some' },
  { v: 'sleepy', label: '玩到睡着', icon: 'phone-sleep' },
]

// 详情页（DaySheet）展示用中文文案
export const BED_LABEL: Record<NightPlan['bed'], string> = {
  lt23: '23 点前', at24: '24 点', at1: '1 点', later: '更晚',
}
export const PHONE_LABEL: Record<NightPlan['phone'], string> = {
  no: '不玩', some: '玩一会儿', sleepy: '玩到睡着',
}

const Sec = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="sec">
    <div className="sec-head">
      <h2>{title}</h2>
      {hint && <span className="note">{hint}</span>}
    </div>
    {children}
  </div>
)

/** 今晚上床预告（睡前填写，说出承诺，明早兑现有奖励） */
export const PlanEditor = ({ value, onChange }: { value: NightPlan; onChange: (patch: Partial<NightPlan>) => void }) => (
  <div>
    <Sec title="今晚几点上床？" hint={`${BED_PTS[value.bed] >= 0 ? '+' : ''}${BED_PTS[value.bed]} 预告分`}>
      <div className="chips">
        {BED_OPTS.map((o) => (
          <button
            key={o.v}
            type="button"
            className={`chip${value.bed === o.v ? ' on' : ''}`}
            onClick={() => onChange({ bed: o.v })}
          >
            <Icon name={o.icon} size={17} />
            {o.label}
          </button>
        ))}
      </div>
    </Sec>

    <Sec title="手机怎么安排？" hint={`${PHONE_PTS[value.phone] >= 0 ? '+' : ''}${PHONE_PTS[value.phone]} 预告分`}>
      <div className="chips">
        {PHONE_OPTS.map((o) => (
          <button
            key={o.v}
            type="button"
            className={`chip${value.phone === o.v ? ' on' : ''}`}
            onClick={() => onChange({ phone: o.v })}
          >
            <Icon name={o.icon} size={17} />
            {o.label}
          </button>
        ))}
      </div>
      <p className="chip-hint">
        预告合计 ≥ 2 且明天结算 ≥ 2，就能拿到 <b>「言出必行 +3」</b> 奖励！
      </p>
    </Sec>
  </div>
)
