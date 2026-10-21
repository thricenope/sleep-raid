import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { TopBar, TabBar } from './components/Nav'
import type { TabKey } from './components/Nav'
import { RaidView } from './components/RaidView'
import { CorridorView } from './components/CorridorView'
import { CodexView } from './components/CodexView'
import { QuestView } from './components/QuestView'
import { GuildView } from './components/GuildView'
import { CelebrationLayer } from './components/CelebrationLayer'
import { today } from './logic/dates'

/** 跨午夜自动换日：日期键变化时用 key 重挂载视图，避免旧夜的日期/草稿写进新战报 */
const useTodayTick = (): string => {
  const [day, setDay] = useState(today)
  useEffect(() => {
    const id = window.setInterval(() => setDay((d) => (d === today() ? d : today())), 30000)
    return () => window.clearInterval(id)
  }, [])
  return day
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('raid')
  const day = useTodayTick()

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <TopBar />
        {tab === 'raid' && <RaidView key={day} />}
        {tab === 'corridor' && <CorridorView key={day} />}
        {tab === 'codex' && <CodexView key={day} />}
        {tab === 'quest' && <QuestView key={day} />}
        {tab === 'guild' && <GuildView key={day} />}
        <TabBar tab={tab} onTab={setTab} />
        <CelebrationLayer />
      </div>
    </MotionConfig>
  )
}
