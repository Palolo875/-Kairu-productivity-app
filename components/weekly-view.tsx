"use client"

import { useMemo, useState } from "react"
import { Download, TrendingUp, AlertCircle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Task } from "@/types/task"
import { energyEmojis } from "@/types/task"
import { generateWeeklyData, exportWeeklyToPDF } from "@/lib/weekly-analysis"
import { dayNames, dayNamesFull } from "@/types/weekly"
import type { WeeklySuggestion } from "@/types/weekly"

interface WeeklyViewProps {
  tasks: Task[]
  onDayClick: (day: number) => void
  onSuggestionClick: (suggestion: WeeklySuggestion) => void
}

const energyTypes = ["deep", "light", "creative", "admin", "learning"] as const

export function WeeklyView({ tasks, onDayClick, onSuggestionClick }: WeeklyViewProps) {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(() => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    const monday = new Date(now.setDate(diff))
    monday.setDate(monday.getDate() + weekOffset * 7)
    monday.setHours(0, 0, 0, 0)
    return monday
  }, [weekOffset])

  const weeklyData = useMemo(() => generateWeeklyData(tasks, weekStart), [tasks, weekStart])

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-background"
    if (intensity < 25) return "bg-peach/20"
    if (intensity < 50) return "bg-peach/40"
    if (intensity < 75) return "bg-coral/60"
    return "bg-coral/80"
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "overload":
        return <AlertCircle className="w-4 h-4 text-coral" />
      case "balance":
        return <TrendingUp className="w-4 h-4 text-sage" />
      case "optimize":
        return <Lightbulb className="w-4 h-4 text-honey" />
      default:
        return <Lightbulb className="w-4 h-4 text-sage" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Vue Hebdomadaire</h1>
            <p className="text-sm text-muted-foreground">Semaine du {weekStart.toLocaleDateString("fr-FR")}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setWeekOffset((prev) => prev - 1)}>
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset((prev) => prev + 1)}>
              →
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => exportWeeklyToPDF(weeklyData)}
              className="bg-coral hover:bg-coral/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 bg-card border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Tâches</div>
            <div className="text-2xl font-bold text-foreground">
              {weeklyData.stats.completedTasks}/{weeklyData.stats.totalTasks}
            </div>
          </Card>
          <Card className="p-4 bg-card border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Deep Work</div>
            <div className="text-2xl font-bold text-foreground">{weeklyData.stats.deepWorkHours.toFixed(1)}h</div>
          </Card>
          <Card className="p-4 bg-card border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Équilibre</div>
            <div className="text-2xl font-bold text-foreground">{weeklyData.stats.balanceScore}%</div>
          </Card>
          <Card className="p-4 bg-card border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Jour productif</div>
            <div className="text-2xl font-bold text-foreground">{dayNames[weeklyData.stats.mostProductiveDay]}</div>
          </Card>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="p-4 md:p-6 bg-card border-border/50 overflow-x-auto">
          <div role="table" aria-label="Grille hebdomadaire des efforts" className="min-w-[600px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs font-medium text-muted-foreground"></div>
              {dayNames.map((day, idx) => (
                <div
                  key={day}
                  className="text-xs font-medium text-center text-foreground p-2 rounded-lg bg-background/50"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Rows */}
            {energyTypes.map((energyType) => (
              <div key={energyType} className="grid grid-cols-8 gap-2 mb-2">
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  <span className="mr-1">{energyEmojis[energyType]}</span>
                  <span className="hidden sm:inline capitalize">{energyType}</span>
                </div>

                {Array.from({ length: 7 }, (_, day) => {
                  const cell = weeklyData.cells.find((c) => c.day === day && c.energyType === energyType)
                  const intensity = cell?.intensity || 0
                  const hours = cell?.totalHours || 0
                  const taskCount = cell?.tasks.length || 0

                  return (
                    <button
                      key={`${day}-${energyType}`}
                      onClick={() => onDayClick(day)}
                      className={`
                        relative p-3 rounded-xl transition-all duration-200
                        ${getIntensityColor(intensity)}
                        hover:scale-105 hover:shadow-lg
                        focus:outline-none focus:ring-2 focus:ring-sage/50
                        ${intensity > 0 ? "cursor-pointer" : "cursor-default"}
                      `}
                      aria-label={`${dayNamesFull[day]}, ${energyType}, ${hours.toFixed(1)} heures, ${taskCount} tâches`}
                    >
                      {hours > 0 && (
                        <div className="text-center">
                          <div className="text-sm font-semibold text-foreground">{hours.toFixed(1)}h</div>
                          <div className="text-xs text-muted-foreground">{taskCount}</div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Suggestions */}
      {weeklyData.suggestions.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold text-foreground mb-4">Suggestions d'optimisation</h2>
          <div className="space-y-3">
            {weeklyData.suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="p-4 bg-card border-border/50 hover:border-sage/50 transition-colors cursor-pointer"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSuggestionIcon(suggestion.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{suggestion.message}</p>
                    {suggestion.day >= 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{dayNamesFull[suggestion.day]}</p>
                    )}
                  </div>
                  {suggestion.action && (
                    <Button variant="ghost" size="sm" className="text-sage hover:text-sage/80">
                      Appliquer
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
