import { useMemo, useRef, useState } from 'react'
import { useGame } from '../store'
import { evaluateReport, isWin } from '../logic/scoring'
import { levelFromXp, planOf } from '../logic/quests'
import { addDays, monthLabel, monthMatrix, parseYmd, today, weekCn, ymd } from '../logic/dates'
import { Icon } from './Icon'

const last14 = (): string[] => {
  const t = today()
  const arr: string[] = []
  for (let i = 13; i >= 0; i--) arr.push(ymd(addDays(parseYmd(t), -i)))
  return arr
}

/** 公会大厅：战报大数字 + 14 日柱状图 + 月视图 + 数据管理 */
export const GuildView = () => {
  const game = useGame()
  const { reports, plans, stats, celebrated } = game
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const lv = levelFromXp(stats.xp)

  // 与 store 同源：柱高/月条都按「含言出必行加成的总分」计
  const scoreOf = (d: string): number => {
    const r = reports[d]
    return r ? evaluateReport(r, planOf(plans, d)).score : 0
  }
  const verdictOfCell = (d: string) => {
    const r = reports[d]
    return r ? evaluateReport(r, planOf(plans, d)).verdict : 'pending'
  }

  const days = useMemo(last14, [])
  const scores = useMemo(
    () => days.map((d) => scoreOf(d)),
    [days, reports, plans],
  )
  const maxAbs = Math.max(4, ...scores.map((s) => Math.abs(s)))
  const zeroLineFromBottom = 34

  const month = today().slice(0, 7)
  const rows = useMemo(() => monthMatrix(month), [month])
  const monthWins = useMemo(() => {
    let w = 0
    let p = 0
    let f = 0
    for (const row of rows)
      for (const d of row) {
        if (!d || !reports[d]) continue
        const v = verdictOfCell(d)
        if (isWin(v)) w += 1
        if (v === 'perfect') p += 1
        if (v === 'fail') f += 1
      }
    return { w, p, f }
  }, [rows, reports, plans])

  const flash = (s: string) => {
    setMsg(s)
    setTimeout(() => setMsg(''), 2600)
  }

  const doExport = () => {
    const data = { app: 'sleep-raid', version: 1, exportedAt: today(), reports, plans, stats, celebrated }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sleep-raid-${today()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    flash('已导出 ✓')
  }

  const doImport = (file: File) => {
    if (!window.confirm('导入将覆盖当前全部战报、预告与战功，确定继续吗？')) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = game.importData(String(reader.result))
      flash(ok ? '导入成功 ✓' : '导入失败：文件格式不对')
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <div className="big-nums">
        <div className="big-num hero">
          <span className="n">{lv.level}</span>
          <span className="l">
            <b>{stats.winDays}</b> 关通过 · 完美 <b>{stats.perfectDays}</b> · 最高分 <b>{stats.bestScore}</b>
          </span>
        </div>
        <div className="big-num">
          <div className="n">{stats.totalDays}</div>
          <div className="l">总战报</div>
        </div>
        <div className="big-num">
          <div className="n">{stats.curStreak}</div>
          <div className="l">当前连击</div>
        </div>
        <div className="big-num">
          <div className="n">{stats.bestStreak}</div>
          <div className="l">最长连击</div>
        </div>
      </div>

      <div className="sec-head">
        <h2>近 14 日战况</h2>
        <span className="note">柱高 = 得分</span>
      </div>
      <div className="card">
        <div className="bars" style={{ height: 150 }}>
          {days.map((d, i) => {
            const s = scores[i]
            const h = Math.round((Math.abs(s) / maxAbs) * 100)
            const cls = s > 0 ? 'pos' : s < 0 ? 'neg' : 'zero'
            const below = s < 0
            return (
              <div key={d} className={`bar-col${d === today() ? ' today-bar' : ''}`} title={`${d}: ${s > 0 ? '+' : ''}${s}`}>
                {!below && (
                  <div
                    className={`bar ${cls}`}
                    style={{ height: `${Math.max(2, h * (100 - zeroLineFromBottom)) / 100}%` }}
                  />
                )}
                <div className="win-line" style={{ bottom: `${zeroLineFromBottom}%` }} />
                {below && (
                  <div
                    className={`bar ${cls}`}
                    style={{ height: `${Math.max(2, h * zeroLineFromBottom) / 100}%`, marginTop: 'auto' }}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="bar-labels">
          {days.map((d) => (
            <span key={d}>{parseYmd(d).getDate()}</span>
          ))}
        </div>
        <div className="legend">
          <span className="li"><span className="dot pos" /> 正分</span>
          <span className="li"><span className="dot neg" /> 负分</span>
          <span className="li">虚线 = 零分线</span>
        </div>
      </div>

      <div className="sec-head">
        <h2>{monthLabel(month)}</h2>
        <span className="note">通过 {monthWins.w} · 完美 {monthWins.p} · 战败 {monthWins.f}</span>
      </div>
      <div className="card">
        <div className="month-strip">
          {rows.flat().map((d, i) => {
            if (!d) return <span key={`e${i}`} className="ms-cell" style={{ opacity: 0 }} />
            const v = verdictOfCell(d)
            return (
              <span
                key={d}
                className={`ms-cell${v === 'perfect' ? ' perfect' : isWin(v) ? ' win' : v === 'fail' ? ' fail' : ''}${d === today() ? ' today' : ''}`}
                title={`${d} ${weekCn(d)}`}
              />
            )
          })}
        </div>
      </div>

      <div className="sec-head">
        <h2>数据管理</h2>
      </div>
      <div className="card">
        <div className="data-btns">
          <button type="button" className="cta mint" onClick={doExport}>
            <Icon name="download" size={18} /> 导出
          </button>
          <button type="button" className="cta" style={{ background: 'linear-gradient(180deg,#9A82FF,#6A55E8)', boxShadow: '0 6px 0 #4A38C9' }} onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={18} /> 导入
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) doImport(f)
            e.target.value = ''
          }}
        />
        <p className="chip-hint" style={{ textAlign: 'center' }}>{msg || '数据只存在本机浏览器里'}</p>
        <button
          type="button"
          className="ghost-link"
          style={{ marginTop: 2 }}
          onClick={() => {
            if (window.confirm('确定清空全部战报吗？此操作无法恢复！') && window.confirm('真的确定吗？再想想？')) {
              game.resetAll()
              flash('已重置')
            }
          }}
        >
          <Icon name="trash" size={14} /> 清空全部数据
        </button>
      </div>
    </div>
  )
}
