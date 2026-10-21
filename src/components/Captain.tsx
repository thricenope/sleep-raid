import { motion } from 'framer-motion'

/** 睡帽小队长：出征时挥剑的小勇者（梦境讨伐队版） */
export const Captain = ({ attacking, size = 88 }: { attacking?: boolean; size?: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    aria-hidden="true"
    animate={attacking ? { x: [0, 14, 10, 0], rotate: [0, -24, 12, 0] } : { x: 0, rotate: 0 }}
    transition={{ duration: 0.55, ease: 'easeOut' }}
    style={{ transformOrigin: '60% 60%' }}
  >
    {/* 剑（出手时挥动） */}
    <motion.g
      animate={attacking ? { rotate: [0, -70, 30, 0] } : { rotate: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ transformOrigin: '72px 52px' }}
    >
      <path d="M74 14 L80 20 L60 44 L56 40 Z" fill="#D7DCF0" stroke="#5B5F8A" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M54 42 L62 50" stroke="#8A5A00" strokeWidth="4" strokeLinecap="round" />
    </motion.g>
    {/* 斗篷 */}
    <path d="M30 62 q-8 20 2 30 q18 -4 36 0 q10 -10 2 -30 q-20 8 -40 0z" fill="#5B4FD6" stroke="#3A2C6B" strokeWidth="2.6" strokeLinejoin="round" />
    {/* 身体 */}
    <ellipse cx="50" cy="70" rx="19" ry="17" fill="#9C8BFF" stroke="#4A38C9" strokeWidth="2.8" />
    {/* 头 */}
    <circle cx="50" cy="40" r="20" fill="#FFE3C2" stroke="#C98A5E" strokeWidth="2.8" />
    {/* 睡帽 */}
    <path d="M30 38 q2 -20 20 -20 q16 0 19 16 q-8 -6 -16 -4 q-12 2 -23 8z" fill="#5B4FD6" stroke="#3A2C6B" strokeWidth="2.4" strokeLinejoin="round" />
    <circle cx="69" cy="30" r="4" fill="#FFB84A" stroke="#8A5A00" strokeWidth="1.8" />
    {/* 眼睛 */}
    <circle cx="43" cy="42" r="2.6" fill="#2B2551" />
    <circle cx="56" cy="42" r="2.6" fill="#2B2551" />
    <circle cx="44" cy="41" r="0.9" fill="#fff" />
    <circle cx="57" cy="41" r="0.9" fill="#fff" />
    {/* 腮红 */}
    <ellipse cx="38" cy="48" rx="3.4" ry="2.2" fill="#FFB3B8" opacity="0.85" />
    <ellipse cx="61" cy="48" rx="3.4" ry="2.2" fill="#FFB3B8" opacity="0.85" />
    {/* 盾牌 */}
    <path d="M24 56 l9 3 v8 q0 8 -9 11 q-9 -3 -9 -11 v-8 z" fill="#FFB84A" stroke="#8A5A00" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M19.5 64 l3.5 3.5 6 -6.5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
)
