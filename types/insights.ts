export interface ProductivityStats {
  totalTasks: number
  completedTasks: number
  completionRate: number
  deepWorkHours: number
  deepWorkPercentage: number
  peakTimeCompletionRate: number
  energyDistribution: {
    deep: number
    light: number
    creative: number
    admin: number
    learning: number
  }
  priorityCompletion: {
    low: { total: number; completed: number }
    medium: { total: number; completed: number }
    high: { total: number; completed: number }
    urgent: { total: number; completed: number }
  }
  weeklyTrend: {
    week: string
    completed: number
    deepWorkHours: number
  }[]
  typeDistribution: {
    task: number
    question: number
    idea: number
    link: number
  }
}

export interface InsightCard {
  id: string
  title: string
  value: string
  description: string
  trend?: "up" | "down" | "stable"
  trendValue?: string
  icon: string
}
