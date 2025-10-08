import type { Task, EnergyType } from "./task"

export interface WeeklyCell {
  day: number // 0-6 (Sunday-Saturday)
  energyType: EnergyType
  tasks: Task[]
  totalHours: number
  intensity: number // 0-100 for heatmap
}

export interface WeeklySuggestion {
  id: string
  type: "balance" | "overload" | "optimize" | "block"
  day: number
  message: string
  action?: {
    type: "create-task" | "reschedule" | "block-time"
    data?: any
  }
}

export interface WeeklyStats {
  totalTasks: number
  completedTasks: number
  deepWorkHours: number
  lightWorkHours: number
  creativeHours: number
  adminHours: number
  learningHours: number
  mostProductiveDay: number
  leastProductiveDay: number
  balanceScore: number // 0-100
}

export interface WeeklyData {
  weekStart: Date
  cells: WeeklyCell[]
  suggestions: WeeklySuggestion[]
  stats: WeeklyStats
}

export const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
export const dayNamesFull = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
