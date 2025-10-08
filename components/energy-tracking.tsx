"use client"

import { useState, useEffect } from "react"
import { Battery, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { energyLevelEmojis, type EnergyLevel } from "@/types/daily"

interface EnergyTrackingProps {
  onEnergyCheck: (level: EnergyLevel, note?: string) => void
  enabled?: boolean
}

export function EnergyTracking({ onEnergyCheck, enabled = true }: EnergyTrackingProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    if (!enabled) return

    const checkInterval = setInterval(
      () => {
        const now = new Date()
        const hoursSinceLastCheck = lastCheck ? (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60) : 999

        // Show prompt every 1-2 hours
        if (hoursSinceLastCheck >= 1) {
          setShowPrompt(true)
        }
      },
      60 * 60 * 1000,
    ) // Check every hour

    return () => clearInterval(checkInterval)
  }, [enabled, lastCheck])

  const handleEnergySelect = (level: EnergyLevel) => {
    onEnergyCheck(level)
    setLastCheck(new Date())
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="neuro-soft rounded-2xl p-4 bg-card/95 backdrop-blur-lg border border-border/50 shadow-xl max-w-xs">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Comment vous sentez-vous ?</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setShowPrompt(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 justify-between">
          {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => handleEnergySelect(level)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-secondary/50 transition-all hover:scale-110"
            >
              <span className="text-2xl">{energyLevelEmojis[level]}</span>
              <span className="text-xs text-muted-foreground">{level}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
