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
  
  const completionPercentage = todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto p-5">
      {/* Header - Nouveau design KairuFlow */}
      <div className="flex justify-between items-center mb-8 px-1">
        {/* Date et message de bienvenue */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">
            {currentDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            {isToday ? "Bonjour" : currentDate.toLocaleDateString("fr-FR", { weekday: "long" })} 👋
          </h2>
        </div>

        {/* Jauge circulaire de complétion */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Cercle de fond */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-border"
            />
            {/* Cercle de progression */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${completionPercentage * 2.51} 251`}
              className="text-primary transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          {/* Texte au centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{completedTasks}/{todayTasks.length}</span>
            <span className="text-xs text-muted-foreground">Tâches</span>
          </div>
        </div>
      </div>
      
      {/* Navigation de jour (seulement si pas aujourd'hui) */}
      {!isToday && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigateDay("prev")} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-full px-6">
            Retour à aujourd'hui
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigateDay("next")} className="rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {/* Playlist */}
        <div className="bg-white/70 backdrop-blur-sm rounded-[25px] p-6 shadow-lg">
          <Playlist
            tasks={tasks}
            onTaskClick={onTaskClick}
            onTaskComplete={onTaskComplete}
            energyProfile={{ peakHours: [9, 10, 11], lowHours: [14, 15] }}
          />
        </div>

        {/* Intention */}
        <div className="bg-white/70 backdrop-blur-sm rounded-[25px] p-6 shadow-lg">
          <Intention value={intention} onChange={setIntention} tasks={tasks} />
        </div>

        {/* Notebook */}
        <div className="bg-white/70 backdrop-blur-sm rounded-[25px] p-6 shadow-lg">
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
