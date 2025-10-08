"use client"

import { useState, useMemo } from "react"
import { Clock, Zap, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/types/task"
import { energyEmojis } from "@/types/task"
import { triggerConfetti } from "@/lib/confetti"

interface PlaylistProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onTaskComplete: (taskId: string) => void
  energyProfile?: { peakHours: number[]; lowHours: number[] }
}

export function Playlist({ tasks, onTaskClick, onTaskComplete, energyProfile }: PlaylistProps) {
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())

  // Calculate hybrid score for tasks
  const calculateScore = (task: Task): number => {
    let score = 0

    // Priority weight
    const priorityWeights = { low: 1, medium: 2, high: 3, urgent: 4 }
    score += priorityWeights[task.priority] * 10

    // Urgency (due date)
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue <= 0)
        score += 40 // Overdue
      else if (daysUntilDue <= 1)
        score += 30 // Due today
      else if (daysUntilDue <= 3) score += 20 // Due soon
    }

    // Age (older tasks get higher score)
    const ageInDays = Math.ceil((Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    score += Math.min(ageInDays * 2, 20)

    // Size (smaller tasks get slight boost)
    const sizeWeights = { S: 5, M: 3, L: 1 }
    if (task.size) score += sizeWeights[task.size]

    return score
  }

  // Get top 3-5 tasks based on hybrid score
  const playlistTasks = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.completed && !t.archived)
    const scored = activeTasks.map((task) => ({
      task,
      score: calculateScore(task),
    }))

    scored.sort((a, b) => b.score - a.score)

    // Adjust count based on workload
    const totalEffort = scored.reduce((sum, { task }) => {
      const effortMap = { S: 1, M: 2, L: 3 }
      return sum + (task.size ? effortMap[task.size] : 2)
    }, 0)

    const count = totalEffort > 10 ? 3 : 5
    return scored.slice(0, count)
  }, [tasks])

  // Suggest time slots based on energy profile
  const suggestTimeSlot = (task: Task): string => {
    const currentHour = new Date().getHours()

    if (task.energy === "deep" && energyProfile?.peakHours) {
      const nextPeak = energyProfile.peakHours.find((h) => h > currentHour) || energyProfile.peakHours[0]
      return `${nextPeak}h`
    }

    if (task.energy === "light" && energyProfile?.lowHours) {
      const nextLow = energyProfile.lowHours.find((h) => h > currentHour) || energyProfile.lowHours[0]
      return `${nextLow}h`
    }

    return `${currentHour + 1}h`
  }

  const handleComplete = (taskId: string) => {
    setCompletedToday((prev) => new Set(prev).add(taskId))
    onTaskComplete(taskId)
    triggerConfetti()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Playlist du Jour</h2>
        <span className="text-xs text-muted-foreground">
          {completedToday.size}/{playlistTasks.length} complétées
        </span>
      </div>

      {playlistTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Aucune tâche pour aujourd'hui</p>
          <p className="text-xs mt-1">Ajoutez des tâches pour commencer</p>
        </div>
      ) : (
        <div className="space-y-2">
          {playlistTasks.map(({ task, score }, index) => {
            const isCompleted = completedToday.has(task.id)
            const timeSlot = suggestTimeSlot(task)

            return (
              <div
                key={task.id}
                className={`neuro-soft rounded-2xl p-4 transition-all ${
                  isCompleted ? "opacity-50" : "hover:shadow-lg"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    onClick={() => handleComplete(task.id)}
                    disabled={isCompleted}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${isCompleted ? "text-primary" : "text-muted-foreground"}`} />
                  </Button>

                  <div className="flex-1 min-w-0" onClick={() => onTaskClick(task.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">#{index + 1}</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{timeSlot}</span>
                      {task.energy && (
                        <span className="text-xs" title={task.energy}>
                          {energyEmojis[task.energy]}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-medium text-sm mb-1 ${isCompleted ? "line-through" : ""}`}>{task.title}</h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      {task.size && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground">
                          {task.size}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Score: {score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
