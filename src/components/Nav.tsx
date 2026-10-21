import { useGame } from '../store'
import { levelFromXp } from '../logic/quests'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export type TabKey = 'raid' | 'corridor' | 'codex' | 'quest' | 'guild'

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'raid', label: '出征', icon: 'sword' },
  { key: 'corridor', label: '回廊', icon: 'moonstar' },
  { key: 'codex', label: '图鉴', icon: 'book' },
  { key: 'quest', label: '讨伐', icon: 'trophy' },
  { key: 'guild', label: '公会', icon: 'chart' },
]

export const TabBar = ({ tab, onTab }: { tab: TabKey; onTab: (t: TabKey) => void }) => (
  <nav className="tabbar" aria-label="主导航">
    {TABS.map((t) => (
      <button
        key={t.key}
        type="button"
        className={`tab${tab === t.key ? ' on' : ''}`}
        onClick={() => onTab(t.key)}
        aria-current={tab === t.key ? 'page' : undefined}
      >
        <Icon name={t.icon} size={21} />
        {t.label}
      </button>
    ))}
  </nav>
)

export const TopBar = () => {
  const stats = useGame((s) => s.stats)
  const lv = levelFromXp(stats.xp)
  const pct = Math.round((lv.into / lv.need) * 100)

  return (
    <header className="topbar">
      <div className="logo">
        <Icon name="moonstar" size={26} style={{ color: '#6A55E8' }} />
        <span className="name">梦境讨伐队</span>
      </div>
      <div className="spacer" />
      {stats.curStreak > 0 && (
        <span className="chip-stat flame">
          <Icon name="flame" size={15} />
          {stats.curStreak}
        </span>
      )}
      <span className="chip-stat">
        LV {lv.level}
      </span>
      <div className="xp-line" aria-label={`经验 ${lv.into}/${lv.need}`}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </header>
  )
}
