export const spring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 22,
}

export const hoverLift = {
  y: -4,
  transition: { type: 'spring' as const, stiffness: 400, damping: 22 },
}

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
}

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

export const modalCard = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 16 },
  transition: { ...spring, delay: 0.05 },
}
