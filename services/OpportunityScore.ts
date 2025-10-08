import type { Task, Size } from "@/types/task"
import type { EnergyProfile } from "@/types/onboarding"
import { differenceInHours } from "date-fns"

interface ScoreWeights {
  opportunity: number
  energy: number
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  opportunity: 70,
  energy: 30,
}

export function calculateOpportunityScore(task: Task): number {
  let score = 50

  const priorityScores = {
    urgent: 40,
    high: 30,
    medium: 20,
    low: 10,
  }
  score += priorityScores[task.priority]

  if (task.dueDate) {
    const hoursUntilDue = differenceInHours(task.dueDate, new Date())
    if (hoursUntilDue < 0) score -= 30
    else if (hoursUntilDue < 24) score += 20
    else if (hoursUntilDue < 48) score += 15
    else if (hoursUntilDue < 72) score += 10
  }

  const sizeScores: Record<Size, number> = {
    S: 10,
    M: 5,
    L: 3,
  }
  if (task.size) score += sizeScores[task.size]

  if (task.tags?.includes("deepwork")) score += 15
  if (task.tags?.includes("urgent")) score += 10

  return Math.max(0, Math.min(100, score))
}

export function calculateEnergyScore(
  task: Task,
  energyProfile: EnergyProfile,
  currentTime: Date = new Date()
): number {
  let score = 50

  const currentHour = currentTime.getHours()

  if (energyProfile.peaks && energyProfile.peaks.length > 0) {
    const inPeakTime = energyProfile.peaks.some((peak) => {
      const start = parseInt(peak.start.split(":")[0])
      const end = parseInt(peak.end.split(":")[0])
      return currentHour >= start && currentHour < end
    })

    if (task.energy === "deep" && inPeakTime) score += 30
    else if (task.energy === "deep" && !inPeakTime) score -= 20
    else if (task.energy === "light" && !inPeakTime) score += 20
  }

  if (energyProfile.dips && energyProfile.dips.length > 0) {
    const inDipTime = energyProfile.dips.some((dip) => {
      const [start, end] = dip.split("-").map((t) => parseInt(t.split(":")[0]))
      return currentHour >= start && currentHour < end
    })

    if (inDipTime) {
      if (task.energy === "admin" || task.energy === "light") score += 15
      else if (task.energy === "deep") score -= 25
    }
  }

  const energyTypeScores = {
    deep: 10,
    creative: 8,
    learning: 7,
    admin: 5,
    light: 3,
  }
  if (task.energy) score += energyTypeScores[task.energy] || 0

  return Math.max(0, Math.min(100, score))
}

export function calculateHybridScore(
  task: Task,
  energyProfile: EnergyProfile,
  currentTime: Date = new Date(),
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  const opportunityScore = calculateOpportunityScore(task)
  const energyScore = calculateEnergyScore(task, energyProfile, currentTime)

  const hybridScore =
    (opportunityScore * weights.opportunity + energyScore * weights.energy) / 100

  return Math.round(hybridScore)
}

export function rankTasksByScore(
  tasks: Task[],
  energyProfile: EnergyProfile,
  currentTime: Date = new Date()
): Task[] {
  return tasks
    .map((task) => ({
      task,
      score: calculateHybridScore(task, energyProfile, currentTime),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.task)
}
