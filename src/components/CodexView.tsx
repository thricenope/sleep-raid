import { useGame } from '../store'
import { MONSTERS } from '../logic/monsters'
import { Icon } from './Icon'
import { Monster } from './Monster'

/** 梦魇图鉴：击败过的怪物点亮，未击败的是剪影 */
export const CodexView = () => {
  const stats = useGame((s) => s.stats)
  const unlockedCount = Object.keys(stats.killsByMonster).length
  const totalKills = Object.values(stats.killsByMonster).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(150deg,#fff,#F0EDFF)', borderColor: '#D9D0FF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="book" size={40} style={{ color: 'var(--quest-deep, #4A38C9)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.25 }}>
              图鉴收录 <span style={{ color: '#4A38C9', fontFamily: 'var(--font-num)', fontSize: 27 }}>{unlockedCount}</span>/{MONSTERS.length} 只
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              累计讨伐 <b style={{ fontFamily: 'var(--font-num)' }}>{totalKills}</b> 只梦魇怪
            </div>
          </div>
        </div>
      </div>

      <div className="codex-grid">
        {MONSTERS.map((m) => {
          const kills = stats.killsByMonster[m.id] ?? 0
          const got = kills > 0
          return (
            <div key={m.id} className={`codex-card${got ? ' got' : ''}`}>
              <div className="codex-avatar">
                <Monster species={m.id} mood={got ? 'full' : 'silhouette'} size={82} />
                {!got && <span className="codex-unk">?</span>}
              </div>
              <div className="codex-name">{got ? m.name : '???'}</div>
              <div className="codex-title">{got ? m.title : '还未击败过这家伙'}</div>
              {m.boss && <span className="boss-tag">周末 BOSS</span>}
              {got && <span className="codex-kills">×{kills}</span>}
            </div>
          )
        })}
      </div>

      {unlockedCount < MONSTERS.length && (
        <p className="empty-tip">周末守关战的 BOSS「暴食梦貘」最难缠 —— 击败它图鉴才算圆满！</p>
      )}
    </div>
  )
}
