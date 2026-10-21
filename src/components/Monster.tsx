import { motion } from 'framer-motion'
import type { MonsterSpecies } from '../logic/monsters'

export type MonsterMood = 'full' | 'hurt' | 'faint' | 'silhouette'

const INK = '#2B2551'

/** Q版梦魇怪：全部手绘 SVG，情绪由战斗状态驱动 */
export const Monster = ({ species, mood, size = 150 }: { species: MonsterSpecies; mood: MonsterMood; size?: number }) => {
  const sil = mood === 'silhouette'
  const filter = sil ? 'grayscale(1) brightness(0.55) opacity(0.8)' : undefined

  const eyes = () => {
    if (mood === 'faint')
      return (
        <g stroke={INK} strokeWidth="3" strokeLinecap="round">
          <path d="M40 55 l9 9 M49 55 l-9 9" />
          <path d="M66 55 l9 9 M75 55 l-9 9" />
        </g>
      )
    if (mood === 'hurt')
      return (
        <g fill={INK}>
          <circle cx="45" cy="58" r="4" />
          <circle cx="70" cy="58" r="4" />
          <path d="M40 51 q5 -4 10 -1" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )
    return (
      <g fill={INK}>
        <circle cx="45" cy="56" r="5" />
        <circle cx="70" cy="56" r="5" />
        <circle cx="47" cy="54" r="1.8" fill="#fff" />
        <circle cx="72" cy="54" r="1.8" fill="#fff" />
      </g>
    )
  }

  const mouth = () => {
    if (mood === 'faint')
      return <path d="M52 76 q6 7 12 0 q-2 6 -6 6 q-4 0 -6 -6z" fill="#B4547E" />
    if (mood === 'hurt')
      return <path d="M53 76 q5 -4 10 0" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    return <path d="M50 72 q8 8 16 0" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
  }

  const body = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 115 115" style={{ filter }} aria-hidden="true">
      {children}
    </svg>
  )

  const wrap = (inner: React.ReactNode) =>
    mood === 'faint' ? (
      <motion.div animate={{ rotate: [-8, 8, -6, 0] }} transition={{ duration: 0.9 }}>{body(inner)}</motion.div>
    ) : (
      body(inner)
    )

  switch (species) {
    case 'imp':
      return wrap(
        <>
          <path d="M32 38 L26 20 L44 30 Z" fill="#C0554F" stroke="#7E2F2A" strokeWidth="3" strokeLinejoin="round" />
          <path d="M83 38 L89 20 L71 30 Z" fill="#C0554F" stroke="#7E2F2A" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="57.5" cy="64" rx="38" ry="36" fill="#D66A62" stroke="#7E2F2A" strokeWidth="3.5" />
          <ellipse cx="57.5" cy="76" rx="24" ry="18" fill="#F0A38C" opacity="0.75" />
          {eyes()}{mouth()}
          <path d="M38 30 q6 -5 12 -2 M66 28 q6 -3 11 2" stroke="#7E2F2A" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>,
      )
    case 'ghost':
      return wrap(
        <>
          <path d="M22 96 V52 a35.5 35.5 0 0 1 71 0 v44 q-6 -7 -11.8 0 q-5.9 7 -11.8 0 q-5.9 -7 -11.8 0 q-5.9 7 -11.8 0 q-5.9 -7 -11.8 0 q-5.8 7 -12 0 z" fill="#BFD3FF" stroke="#5B6FB5" strokeWidth="3.5" strokeLinejoin="round" />
          {eyes()}{mouth()}
          <ellipse cx="34" cy="40" rx="7" ry="10" fill="#E4ECFF" transform="rotate(-18 34 40)" />
        </>,
      )
    case 'slime':
      return wrap(
        <>
          <path d="M18 92 q0 -46 39.5 -46 q39.5 0 39.5 46 q-20 6 -39.5 6 q-19.5 0 -39.5 -6z" fill="#8FD9A8" stroke="#3F8A5C" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="45" cy="34" r="6" fill="#BCEACB" />
          <circle cx="70" cy="26" r="4" fill="#BCEACB" />
          {eyes()}{mouth()}
        </>,
      )
    case 'cat':
      return wrap(
        <>
          <path d="M28 40 L22 18 L44 30 Z" fill="#6E5AA8" stroke="#3A2C6B" strokeWidth="3" strokeLinejoin="round" />
          <path d="M87 40 L93 18 L71 30 Z" fill="#6E5AA8" stroke="#3A2C6B" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="57.5" cy="66" rx="38" ry="35" fill="#7C6BFF" stroke="#3A2C6B" strokeWidth="3.5" />
          {eyes()}{mouth()}
          <g fill="#3A2C6B" opacity="0.9">
            <ellipse cx="42" cy="70" rx="3.4" ry="5.4" transform="rotate(-14 42 70)" />
            <ellipse cx="73" cy="70" rx="3.4" ry="5.4" transform="rotate(14 73 70)" />
          </g>
          <path d="M95 74 q16 -4 12 -18 q10 8 -4 20 q-4 3 -8 -2z" fill="#7C6BFF" stroke="#3A2C6B" strokeWidth="3" strokeLinejoin="round" />
        </>,
      )
    case 'cloud':
      return wrap(
        <>
          <g stroke="#5A6BA8" strokeWidth="3.5" strokeLinejoin="round">
            <path d="M20 82 a15 15 0 0 1 6 -29 a19 19 0 0 1 36 -8 a16 16 0 0 1 27 12 a13 13 0 0 1 -4 25 z" fill="#93A4D9" />
          </g>
          {eyes()}{mouth()}
          <path d="M30 92 l-4 12 M50 94 l-3 10 M72 93 l-4 11" stroke="#FFD84A" strokeWidth="3" strokeLinecap="round" />
        </>,
      )
    case 'tapir':
    default:
      return wrap(
        <>
          <ellipse cx="57.5" cy="64" rx="39" ry="36" fill="#9C8BFF" stroke="#4A38C9" strokeWidth="3.5" />
          <ellipse cx="57.5" cy="42" rx="22" ry="15" fill="#C9BEFF" />
          <ellipse cx="57.5" cy="46" rx="9" ry="6.5" fill="#FFB84A" stroke="#8A5A00" strokeWidth="2" />
          <circle cx="42" cy="50" r="4" fill="#4A38C9" />
          <circle cx="73" cy="50" r="4" fill="#4A38C9" />
          <circle cx="43.5" cy="48.5" r="1.4" fill="#fff" />
          <circle cx="74.5" cy="48.5" r="1.4" fill="#fff" />
          <path d="M50 78 q8 7 16 0" stroke="#4A38C9" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M20 40 q6 4 5 11 M95 40 q-6 4 -5 11" stroke="#4A38C9" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M97 70 q15 -3 12 -16 q9 9 -5 19 q-4 2 -7 -3z" fill="#FFB84A" stroke="#8A5A00" strokeWidth="2.4" strokeLinejoin="round" />
        </>,
      )
  }
}
