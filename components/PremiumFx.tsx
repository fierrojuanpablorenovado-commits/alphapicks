'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* ─────────────────────────────────────────────────────────────────────────
 *  Aurora Mesh  —  4-color animated gradient mesh (Stripe-style)
 * ───────────────────────────────────────────────────────────────────────── */
export function AuroraMesh({ intensity = 0.55 }: { intensity?: number }) {
  return (
    <div className="aurora-mesh">
      <div
        className="aurora-orb aurora-orb-1"
        style={{
          width: 720, height: 720, top: -320, left: -220,
          background: 'radial-gradient(circle, #6366F1 0%, transparent 60%)',
          opacity: intensity,
        }}
      />
      <div
        className="aurora-orb aurora-orb-2"
        style={{
          width: 620, height: 620, top: -80, right: -200,
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 60%)',
          opacity: intensity,
        }}
      />
      <div
        className="aurora-orb aurora-orb-3"
        style={{
          width: 540, height: 540, top: '40%', left: '30%',
          background: 'radial-gradient(circle, #10B981 0%, transparent 60%)',
          opacity: intensity * 0.7,
        }}
      />
      <div
        className="aurora-orb aurora-orb-4"
        style={{
          width: 460, height: 460, top: '20%', left: '55%',
          background: 'radial-gradient(circle, #EC4899 0%, transparent 60%)',
          opacity: intensity * 0.45,
        }}
      />
      <div className="aurora-grain" />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Floating Stickers  —  emoji decorations with spring physics
 * ───────────────────────────────────────────────────────────────────────── */
type Sticker = { emoji: string; x: string; y: string; size: number; delay: number; rot?: number }

const DEFAULT_STICKERS: Sticker[] = [
  { emoji: '📈', x: '4%',  y: '15%',  size: 42, delay: 0.1, rot: -8 },
  { emoji: '💎', x: '88%', y: '12%',  size: 38, delay: 0.4, rot:  6 },
  { emoji: '🇲🇽', x: '92%', y: '72%',  size: 34, delay: 0.7, rot: -4 },
  { emoji: '🤖', x: '6%',  y: '78%',  size: 34, delay: 1.0, rot:  10 },
  { emoji: '⚡', x: '72%', y: '32%',  size: 26, delay: 1.3, rot: -12 },
]

export function FloatingStickers({ stickers = DEFAULT_STICKERS }: { stickers?: Sticker[] }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {stickers.map((s, i) => (
        <motion.div
          key={i}
          className="sticker"
          style={{ position: 'absolute', left: s.x, top: s.y, fontSize: s.size, lineHeight: 1 }}
          initial={{ opacity: 0, scale: 0, y: 30, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: s.rot ?? 0 }}
          transition={{
            opacity: { delay: s.delay, duration: 0.4 },
            scale:   { delay: s.delay, type: 'spring', stiffness: 200, damping: 14 },
            y:       { delay: s.delay, type: 'spring', stiffness: 110, damping: 12 },
            rotate:  { delay: s.delay + 0.1, type: 'spring', stiffness: 90, damping: 12 },
          }}
        >
          <motion.div
            animate={{
              y: [0, -8 - (i % 3) * 3, 0],
              rotate: [s.rot ?? 0, (s.rot ?? 0) + 4, (s.rot ?? 0) - 4, s.rot ?? 0],
            }}
            transition={{
              y:      { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: s.delay + 1 },
              rotate: { duration: 6 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: s.delay + 1 },
            }}
          >
            {s.emoji}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Animated Number  —  spring-physics counter (Bloomberg-style tick-up)
 * ───────────────────────────────────────────────────────────────────────── */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  locale = 'es-MX',
  className,
  style,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  locale?: string
  className?: string
  style?: CSSProperties
}) {
  const spring = useSpring(0, { stiffness: 80, damping: 18, mass: 0.6 })
  const display = useTransform(spring, (v) => {
    const formatted = v.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    return `${prefix}${formatted}${suffix}`
  })
  useEffect(() => { spring.set(value) }, [spring, value])
  return <motion.span className={className} style={style}>{display}</motion.span>
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Spotlight Card  —  cursor-follow radial glow (Notion 2025)
 * ───────────────────────────────────────────────────────────────────────── */
export function SpotlightCard({
  children,
  className,
  style,
  spotlightColor = 'rgba(99,102,241,0.16)',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  spotlightColor?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`spotlight-card ${className ?? ''}`}
      style={{
        ['--spotlight-color' as string]: spotlightColor,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Magnetic Button  —  spring-attracted toward cursor (Awwwards staple)
 * ───────────────────────────────────────────────────────────────────────── */
export function MagneticButton({
  children,
  className,
  style,
  onClick,
  strength = 0.28,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  strength?: number
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 })

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
      style={{ x: sx, y: sy, ...style }}
    >
      {children}
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Stagger Reveal  —  children fade up in sequence as they enter viewport
 * ───────────────────────────────────────────────────────────────────────── */
export function StaggerReveal({
  children,
  delay = 0,
  stagger = 0.08,
}: {
  children: ReactNode
  delay?: number
  stagger?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export const fadeUpItem = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 110, damping: 18 },
  },
}
