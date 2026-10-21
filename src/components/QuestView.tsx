import { useGame } from '../store'
import { QUESTS, ROAD, comboTitle, nextRoad, questProgress, titleFor } from '../logic/quests'
import { levelFromXp } from '../logic/quests'
import { Icon } from './Icon'

/** 讨伐之路：连击进度 + 成就墙 */
export const QuestView = () => {
  const stats = useGame((s) => s.stats)
  const lv = levelFromXp(stats.xp)
  const next = nextRoad(stats.curStreak)
  const roadPct = next
    ? Math.min(100, Math.round((stats.curStreak / next.days) * 100))
    : 100

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(150deg,#fff,#FFF6E4)', borderColor: '#FFE0AE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="emblem" style={{ width: 62, height: 62, flexShrink: 0 }}>
            <Icon name="flame" size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, lineHeight: 1.25 }}>
              当前连击 <span style={{ color: '#C26A12', fontFamily: 'var(--font-num)', fontSize: 28 }}>{stats.curStreak}</span> 关
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{comboTitle(stats.curStreak)}</div>
          </div>
        </div>
        <div className="prog" style={{ marginTop: 12 }}>
          <i style={{ width: `${roadPct}%`, background: 'linear-gradient(90deg,#FFB84A,#FF6B4A)' }} />
        </div>
        {next && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 7 }}>
            再连胜 <b style={{ color: '#C26A12' }}>{next.days - stats.curStreak}</b> 关达成「{next.title}」
          </div>
        )}
      </div>

      <div className="card guide-card" style={{ padding: 14 }}>
        <div className="g-title">LV {lv.level} · {titleFor(lv.level)}</div>
        <div className="prog" style={{ marginTop: 8 }}>
          <i style={{ width: `${Math.round((lv.into / lv.need) * 100)}%` }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6 }}>
          经验 {lv.into} / {lv.need} · 睡个好觉就是最好的修炼
        </div>
      </div>

      <div className="sec-head">
        <h2>连击之路</h2>
        <span className="note">连续击退推进</span>
      </div>
      <div className="card road-card">
        <div className="road-wrap">
          <div className="road">
            <div className="fill" style={{ width: `${roadPct * 0.8}%` }} />
            {ROAD.map((node) => {
              const done = stats.curStreak >= node.days
              return (
                <div key={node.days} className={`road-node${done ? ' done' : ''}`}>
                  <div className="st">
                    {done ? <Icon name="check" size={24} /> : <span className="node-num">{node.days}</span>}
                  </div>
                  <div className="lb">{node.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="sec-head">
        <h2>战功墙</h2>
        <span className="note">{stats.unlocked.length}/{QUESTS.length}</span>
      </div>
      <div className="badges">
        {QUESTS.map((q) => {
          const got = stats.unlocked.includes(q.id)
          const prog = Math.min(q.goal, questProgress(q, stats))
          return (
            <div key={q.id} className={`badge${got ? ' unlocked' : ' locked'}${q.tier >= 3 ? ' gold' : q.tier === 2 ? ' mint' : ''}`}>
              <div className="emblem">
                <Icon name={q.icon as Parameters<typeof Icon>[0]['name']} size={26} />
              </div>
              <div className="name">{q.name}</div>
              <div className="desc">{q.desc}</div>
              {got ? (
                <div className="got-date">{stats.unlockedAt[q.id] ?? ''}</div>
              ) : (
                <div className="prog">
                  <i style={{ width: `${Math.round((prog / q.goal) * 100)}%` }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
