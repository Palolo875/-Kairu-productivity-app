"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { type ComponentProps, forwardRef } from "react"

interface MotionCardProps extends ComponentProps<typeof Card> {
  enableHover?: boolean
  delay?: number
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, enableHover = false, delay = 0, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, delay }}
        whileHover={enableHover ? { scale: 1.02, y: -4 } : undefined}
        whileTap={enableHover ? { scale: 0.98 } : undefined}
      >
        <Card className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    )
  },
)

MotionCard.displayName = "MotionCard"
