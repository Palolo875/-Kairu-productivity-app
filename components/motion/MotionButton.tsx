"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { type ComponentProps, forwardRef } from "react"

type MotionButtonProps = ComponentProps<typeof Button>

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </motion.div>
    )
  },
)

MotionButton.displayName = "MotionButton"
