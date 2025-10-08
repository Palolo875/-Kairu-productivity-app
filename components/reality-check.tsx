"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/types/task"

interface RealityCheckProps {
  tasks: Task[]
  onAdjust: (action: "spread" | "reduce" | "force") => void
  onDismiss: () => void
}

export function RealityCheck({ tasks, onAdjust, onDismiss }: RealityCheckProps) {
  // Calculate total deep work hours
  const deepWorkTasks = tasks.filter((t) => t.energy === "deep" && !t.completed && !t.archived)
  const totalDeepWorkHours = deepWorkTasks.reduce((sum, task) => {
    const effortMap = { S: 1, M: 2, L: 3 }
    return sum + (task.size ? effortMap[task.size] : 2)
  }, 0)

  // Don't show if workload is reasonable
  if (totalDeepWorkHours <= 3) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="neuro-soft rounded-3xl p-6 bg-card max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-full bg-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Reality Check</h3>
            <p className="text-sm text-muted-foreground">
              Vous avez prévu {totalDeepWorkHours}h de Deep Work aujourd'hui. C'est peut-être trop ambitieux.
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="p-3 rounded-2xl bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Tâches Deep Work :</p>
            <ul className="space-y-1">
              {deepWorkTasks.slice(0, 3).map((task) => (
                <li key={task.id} className="text-sm">
                  • {task.title}
                </li>
              ))}
              {deepWorkTasks.length > 3 && (
                <li className="text-sm text-muted-foreground">+ {deepWorkTasks.length - 3} autres</li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={() => onAdjust("spread")} className="w-full rounded-2xl" variant="default">
            Étaler sur plusieurs jours
          </Button>
          <Button onClick={() => onAdjust("reduce")} className="w-full rounded-2xl" variant="outline">
            Réduire la charge
          </Button>
          <Button onClick={() => onAdjust("force")} className="w-full rounded-2xl" variant="ghost">
            Je gère, continuer
          </Button>
        </div>

        <button onClick={onDismiss} className="w-full text-center text-xs text-muted-foreground mt-3 hover:underline">
          Ne plus afficher aujourd'hui
        </button>
      </div>
    </div>
  )
}
