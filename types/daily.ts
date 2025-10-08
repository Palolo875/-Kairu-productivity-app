export type EnergyLevel = 1 | 2 | 3 | 4 | 5

export interface EnergyCheck {
  id: string
  timestamp: Date
  level: EnergyLevel
  note?: string
}

export interface DailyNote {
  id: string
  date: Date
  intention?: string
  notebook?: string
  playlist: string[] // Task IDs
  energyChecks: EnergyCheck[]
  stats: {
    tasksCompleted: number
    tasksTotal: number
    deepWorkHours: number
    energyAverage: number
  }
}

export interface EnergyProfile {
  peakHours: number[] // Hours of day (0-23)
  lowHours: number[]
  preferredDeepWorkSlots: string[] // e.g., "9h-12h"
}

export const energyLevelEmojis: Record<EnergyLevel, string> = {
  1: "😫",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "🚀",
}
