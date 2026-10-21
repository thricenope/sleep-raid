import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store'
import { QUESTS, questXp } from '../logic/quests'
import { Icon } from './Icon'

/** 新战功弹窗队列（tier×25 经验在 store 中已加） */
export const CelebrationLayer = () => {
  const queue = useGame((s) => s.pendingCelebrate)
  const dismiss = useGame((s) => s.dismissOneCelebrate)
  const id = queue.length > 0 ? queue[0] : null
  const quest = id ? QUESTS.find((q) => q.id === id) : null

  // 自愈：持久化队列里查不到的旧 id（版本升级改名/删除）直接丢弃，否则会永久卡死弹窗
  useEffect(() => {
    if (id && !quest) dismiss()
  }, [id, quest, dismiss])

  // Esc 关闭与 aria-modal 的语义保持一致
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dismiss])

  return (
    <AnimatePresence>
      {id && quest && (
        <motion.div
          className="cele-mask"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={id}
          role="dialog"
          aria-modal="true"
          aria-label={`解锁战功：${quest.name}`}
        >
          <motion.div
            className="cele-card"
            initial={{ scale: 0.4, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="rays" />
            <div className="cele-kind">战 功 解 锁</div>
            <motion.div
              className="cele-emoji"
              initial={{ rotate: -20, scale: 0.4 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 11, delay: 0.12 }}
            >
              <Icon name={quest.icon as Parameters<typeof Icon>[0]['name']} size={72} style={{ color: '#e8a50f' }} />
            </motion.div>
            <div className="cele-title">{quest.name}</div>
            <div className="cele-desc">{quest.desc}</div>
            <div className="cele-xp">+{quest ? questXp(quest) : 0} 经验</div>
            <div>
              <motion.button
                type="button"
                className="cta mint"
                whileTap={{ scale: 0.95 }}
                onClick={dismiss}
              >
                收下战功！
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const CeleBanner = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="cele-mask z-top"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {children}
  </motion.div>
)

export const CeleIcon = ({ name }: { name: Parameters<typeof Icon>[0]['name'] }) => (
  <motion.div
    className="cele-emoji"
    initial={{ rotate: -20, scale: 0.4 }}
    animate={{ rotate: 0, scale: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.15 }}
  >
    <Icon name={name} size={72} style={{ color: '#e8a50f' }} />
  </motion.div>
)
