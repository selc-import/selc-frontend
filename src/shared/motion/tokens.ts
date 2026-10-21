import type { CSSProperties } from 'vue'

export const motion = {
  fast: 0.14,
  normal: 0.22,
  slow: 0.36,
  stagger: 0.055,
  enterY: 8,
  hoverY: 3,
  iconShift: 2,
  pressedScale: 0.99,
  photoScale: 1.025,
  ease: 'power2.out',
  cssEase: 'cubic-bezier(.2, .7, .2, 1)',
} as const

export const motionCssVars: CSSProperties = {
  '--motion-fast': `${motion.fast}s`,
  '--motion-normal': `${motion.normal}s`,
  '--motion-slow': `${motion.slow}s`,
  '--motion-ease': motion.cssEase,
  '--motion-hover-y': `${-motion.hoverY}px`,
  '--motion-icon-shift': `${motion.iconShift}px`,
  '--motion-pressed-scale': motion.pressedScale,
  '--motion-photo-scale': motion.photoScale,
}
