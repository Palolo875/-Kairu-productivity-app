"use client"

import { motion, AnimatePresence } from "framer-motion"
import { slideInFromRight, slideInFromLeft, modalBackdrop } from "@/lib/animations"
import type { ReactNode } from "react"

interface MotionSheetProps {
  isOpen: boolean
  side?: "left" | "right"
  children: ReactNode
  onClose?: () => void
}

export function MotionSheet({ isOpen, side = "right", children, onClose }: MotionSheetProps) {
  const variants = side === "right" ? slideInFromRight : slideInFromLeft

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-50 ${
              side === "right" ? "right-0 inset-y-0" : "left-0 inset-y-0"
            } w-3/4 sm:max-w-sm`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
