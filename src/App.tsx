import { useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { TopBar, TabBar } from './components/Nav'
import type { TabKey } from './components/Nav'
import { RaidView } from './components/RaidView'
import { CorridorView } from './components/CorridorView'
import { CodexView } from './components/CodexView'
import { QuestView } from './components/QuestView'
import { GuildView } from './components/GuildView'
import { CelebrationLayer } from './components/CelebrationLayer'

export default function App() {
  const [tab, setTab] = useState<TabKey>('raid')

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <TopBar />
        {tab === 'raid' && <RaidView />}
        {tab === 'corridor' && <CorridorView />}
        {tab === 'codex' && <CodexView />}
        {tab === 'quest' && <QuestView />}
        {tab === 'guild' && <GuildView />}
        <TabBar tab={tab} onTab={setTab} />
        <CelebrationLayer />
      </div>
    </MotionConfig>
  )
}
