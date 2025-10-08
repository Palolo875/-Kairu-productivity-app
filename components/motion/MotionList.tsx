"use client"

import { motion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/animations"
import type { ReactNode } from "react"

interface MotionListProps {
  children: ReactNode
  className?: string
}

export function MotionList({ children, className }: MotionListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface MotionListItemProps {
  children: ReactNode
  className?: string
}

export function MotionListItem({ children, className }: MotionListItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}
