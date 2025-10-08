"use client"

import { motion, AnimatePresence } from "framer-motion"
import { scaleIn, modalBackdrop } from "@/lib/animations"
import type { ReactNode } from "react"

interface MotionDialogProps {
  isOpen: boolean
  children: ReactNode
  onClose?: () => void
}

export function MotionDialogOverlay({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50"
        />
      )}
    </AnimatePresence>
  )
}

export function MotionDialogContent({ isOpen, children }: MotionDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
