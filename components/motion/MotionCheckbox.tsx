"use client"

import { motion } from "framer-motion"
import { checkboxRotate } from "@/lib/animations"

interface MotionCheckboxProps {
  checked: boolean
  children: React.ReactNode
  className?: string
}

export function MotionCheckbox({ checked, children, className }: MotionCheckboxProps) {
  return (
    <motion.div
      variants={checkboxRotate}
      initial="unchecked"
      animate={checked ? "checked" : "unchecked"}
      className={className}
    >
      {children}
    </motion.div>
  )
}
