"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Playlist } from "@/components/playlist"
import { Intention } from "@/components/intention"
import { Notebook } from "@/components/notebook"
import { EnergyTracking } from "@/components/energy-tracking"
import { RealityCheck } from "@/components/reality-check"
import type { Task } from "@/types/task"
import type { EnergyLevel } from "@/types/daily"

interface DailyNoteProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onTaskComplete: (taskId: string) => void
  onCreateTask: (taskData: Omit<Task, "id" | "createdAt">) => void
}

export function DailyNote({ tasks, onTaskClick, onTaskComplete, onCreateTask }: DailyNoteProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [intention, setIntention] = useState("")
  const [notebook, setNotebook] = useState("")
  const [showRealityCheck, setShowRealityCheck] = useState(true)
  const [energyChecks, setEnergyChecks] = useState<Array<{ level: EnergyLevel; timestamp: Date }>>([])

  const handleEnergyCheck = (level: EnergyLevel) => {
    setEnergyChecks((prev) => [...prev, { level, timestamp: new Date() }])
  }

  const handleRealityCheckAdjust = (action: "spread" | "reduce" | "force") => {
    console.log("[v0] Reality check action:", action)
    setShowRealityCheck(false)
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const isToday = currentDate.toDateString() === new Date().toDateString()

  // Calculate stats
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    return t.dueDate.toDateString() === currentDate.toDateString()
  })

  const completedTasks = todayTasks.filter((t) => t.completed).length
  const urgentTasks = todayTasks.filter((t) => t.priority === "urgent" && !t.completed).length

  const avgEnergy =
    energyChecks.length > 0
      ? (energyChecks.reduce((sum, check) => sum + check.level, 0) / energyChecks.length).toFixed(1)
      : "N/A"

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="neuro-soft rounded-3xl p-6 mb-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigateDay("prev")} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">
              {currentDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h1>
            {isToday && <p className="text-sm text-muted-foreground">Bonjour Alex 👋</p>}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDay("next")}
            className="rounded-full"
            disabled={isToday}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-2xl bg-card/50">
            <p className="text-2xl font-bold text-primary">
              {completedTasks}/{todayTasks.length}
            </p>
            <p className="text-xs text-muted-foreground">Tâches</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-card/50">
            <p className="text-2xl font-bold text-destructive">{urgentTasks}</p>
            <p className="text-xs text-muted-foreground">Urgentes</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-card/50">
            <p className="text-2xl font-bold text-primary">{avgEnergy}</p>
            <p className="text-xs text-muted-foreground">Énergie</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Playlist */}
        <div className="neuro-soft rounded-3xl p-6">
          <Playlist
            tasks={tasks}
            onTaskClick={onTaskClick}
            onTaskComplete={onTaskComplete}
            energyProfile={{ peakHours: [9, 10, 11], lowHours: [14, 15] }}
          />
        </div>

        {/* Intention */}
        <div className="neuro-soft rounded-3xl p-6">
          <Intention value={intention} onChange={setIntention} tasks={tasks} />
        </div>

        {/* Notebook */}
        <div className="neuro-soft rounded-3xl p-6">
          <Notebook value={notebook} onChange={setNotebook} onCreateTask={onCreateTask} />
        </div>
      </div>

      {/* Energy Tracking */}
      <EnergyTracking onEnergyCheck={handleEnergyCheck} enabled={isToday} />

      {/* Reality Check */}
      {showRealityCheck && isToday && (
        <RealityCheck tasks={tasks} onAdjust={handleRealityCheckAdjust} onDismiss={() => setShowRealityCheck(false)} />
      )}
    </div>
  )
}
