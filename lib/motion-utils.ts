import { type Transition } from "framer-motion"

export const defaultTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
}

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

export const fastTransition: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
}

export const slowTransition: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
}

export function createStaggerDelay(index: number, delayBetween: number = 0.05): number {
  return index * delayBetween
}

export function getEaseConfig(preset: "smooth" | "bounce" | "snappy" = "smooth") {
  const configs = {
    smooth: [0.4, 0, 0.2, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
    snappy: [0.25, 0.1, 0.25, 1] as const,
  }
  return configs[preset]
}
