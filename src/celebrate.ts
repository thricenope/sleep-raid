import confetti from 'canvas-confetti'

const COLORS = ['#7C6BFF', '#FFB84A', '#2ED3A3', '#FF5D8F', '#5EEAD4']

export const burstAt = (el: HTMLElement | null) => {
  if (!el) return
  const r = el.getBoundingClientRect()
  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 32,
    origin: {
      x: (r.left + r.width / 2) / window.innerWidth,
      y: (r.top + r.height / 2) / window.innerHeight,
    },
    colors: COLORS,
    scalar: 0.9,
    ticks: 160,
  })
}

export const bigCelebration = () => {
  confetti({
    particleCount: 130,
    spread: 100,
    startVelocity: 42,
    origin: { x: 0.5, y: 0.62 },
    colors: COLORS,
    shapes: ['star', 'circle'],
    scalar: 1.05,
    ticks: 220,
  })
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: COLORS,
    })
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: COLORS,
    })
  }, 220)
}
