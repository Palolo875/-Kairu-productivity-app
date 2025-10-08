import type { Task } from "@/types/task"
import type { ProductivityStats, InsightCard } from "@/types/insights"

export function calculateProductivityStats(tasks: Task[]): ProductivityStats {
  const completedTasks = tasks.filter((t) => t.completed && !t.archived)
  const totalTasks = tasks.filter((t) => !t.archived)

  // Calculate Deep Work hours (estimate: S=1h, M=2h, L=4h)
  const sizeToHours = { S: 1, M: 2, L: 4 }
  const deepWorkHours = completedTasks
    .filter((t) => t.energy === "deep")
    .reduce((sum, t) => sum + (sizeToHours[t.size || "M"] || 2), 0)

  // Energy distribution
  const energyDistribution = {
    deep: completedTasks.filter((t) => t.energy === "deep").length,
    light: completedTasks.filter((t) => t.energy === "light").length,
    creative: completedTasks.filter((t) => t.energy === "creative").length,
    admin: completedTasks.filter((t) => t.energy === "admin").length,
    learning: completedTasks.filter((t) => t.energy === "learning").length,
  }

  // Priority completion
  const priorityCompletion = {
    low: {
      total: totalTasks.filter((t) => t.priority === "low").length,
      completed: completedTasks.filter((t) => t.priority === "low").length,
    },
    medium: {
      total: totalTasks.filter((t) => t.priority === "medium").length,
      completed: completedTasks.filter((t) => t.priority === "medium").length,
    },
    high: {
      total: totalTasks.filter((t) => t.priority === "high").length,
      completed: completedTasks.filter((t) => t.priority === "high").length,
    },
    urgent: {
      total: totalTasks.filter((t) => t.priority === "urgent").length,
      completed: completedTasks.filter((t) => t.priority === "urgent").length,
    },
  }

  // Peak time completion (9h-12h)
  const peakTimeCompletedTasks = completedTasks.filter((t) => {
    if (!t.createdAt) return false
    const hour = new Date(t.createdAt).getHours()
    return hour >= 9 && hour <= 12
  })

  // Weekly trend (last 4 weeks)
  const weeklyTrend = calculateWeeklyTrend(tasks)

  // Type distribution
  const typeDistribution = {
    task: completedTasks.filter((t) => t.type === "task").length,
    question: completedTasks.filter((t) => t.type === "question").length,
    idea: completedTasks.filter((t) => t.type === "idea").length,
    link: completedTasks.filter((t) => t.type === "link").length,
  }

  return {
    totalTasks: totalTasks.length,
    completedTasks: completedTasks.length,
    completionRate: totalTasks.length > 0 ? (completedTasks.length / totalTasks.length) * 100 : 0,
    deepWorkHours,
    deepWorkPercentage: completedTasks.length > 0 ? (energyDistribution.deep / completedTasks.length) * 100 : 0,
    peakTimeCompletionRate:
      completedTasks.length > 0 ? (peakTimeCompletedTasks.length / completedTasks.length) * 100 : 0,
    energyDistribution,
    priorityCompletion,
    weeklyTrend,
    typeDistribution,
  }
}

function calculateWeeklyTrend(tasks: Task[]) {
  const weeks: { week: string; completed: number; deepWorkHours: number }[] = []
  const now = new Date()
  const sizeToHours = { S: 1, M: 2, L: 4 }

  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7 - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const weekTasks = tasks.filter((t) => {
      if (!t.createdAt || t.archived) return false
      const taskDate = new Date(t.createdAt)
      return taskDate >= weekStart && taskDate < weekEnd
    })

    const completed = weekTasks.filter((t) => t.completed).length
    const deepWorkHours = weekTasks
      .filter((t) => t.completed && t.energy === "deep")
      .reduce((sum, t) => sum + (sizeToHours[t.size || "M"] || 2), 0)

    weeks.push({
      week: `S${i === 0 ? "" : `-${i}`}`,
      completed,
      deepWorkHours,
    })
  }

  return weeks
}

export function generateInsightCards(stats: ProductivityStats): InsightCard[] {
  return [
    {
      id: "completion-rate",
      title: "Taux de complétion",
      value: `${Math.round(stats.completionRate)}%`,
      description: `${stats.completedTasks} tâches complétées sur ${stats.totalTasks}`,
      trend: stats.completionRate > 70 ? "up" : stats.completionRate > 50 ? "stable" : "down",
      trendValue: `${stats.completedTasks} complétées`,
      icon: "✅",
    },
    {
      id: "deep-work",
      title: "Deep Work",
      value: `${stats.deepWorkHours}h`,
      description: `${Math.round(stats.deepWorkPercentage)}% des tâches en Deep Work`,
      trend: stats.deepWorkPercentage > 40 ? "up" : stats.deepWorkPercentage > 25 ? "stable" : "down",
      trendValue: `${Math.round(stats.deepWorkPercentage)}% en pic`,
      icon: "🧠",
    },
    {
      id: "peak-time",
      title: "Productivité en pic",
      value: `${Math.round(stats.peakTimeCompletionRate)}%`,
      description: "Tâches complétées entre 9h-12h",
      trend: stats.peakTimeCompletionRate > 60 ? "up" : stats.peakTimeCompletionRate > 40 ? "stable" : "down",
      trendValue: "Heures optimales",
      icon: "⚡",
    },
    {
      id: "weekly-average",
      title: "Moyenne hebdomadaire",
      value: `${Math.round(stats.weeklyTrend.reduce((sum, w) => sum + w.completed, 0) / stats.weeklyTrend.length)}`,
      description: "Tâches complétées par semaine",
      trend: "stable",
      trendValue: "4 dernières semaines",
      icon: "📊",
    },
  ]
}
