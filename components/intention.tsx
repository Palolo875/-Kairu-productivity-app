"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Task } from "@/types/task"

interface IntentionProps {
  value: string
  onChange: (value: string) => void
  tasks: Task[]
}

export function Intention({ value, onChange, tasks }: IntentionProps) {
  const [localValue, setLocalValue] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])

  // Generate suggestions based on tasks
  useEffect(() => {
    const urgentTasks = tasks.filter((t) => t.priority === "urgent" && !t.completed && !t.archived)
    const deepWorkTasks = tasks.filter((t) => t.energy === "deep" && !t.completed && !t.archived)

    const newSuggestions: string[] = []

    if (urgentTasks.length > 0) {
      newSuggestions.push(`Finir ${urgentTasks[0].title}`)
    }

    if (deepWorkTasks.length > 0) {
      newSuggestions.push(`Focus sur ${deepWorkTasks[0].title}`)
    }

    if (tasks.filter((t) => !t.completed && !t.archived).length > 5) {
      newSuggestions.push("Avancer sur mes priorités")
    }

    setSuggestions(newSuggestions.slice(0, 3))
  }, [tasks])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Intention du Jour</h2>
      </div>

      <div className="relative">
        <Input
          placeholder="Quel est votre objectif principal aujourd'hui ?"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="rounded-2xl neuro-soft border-border/50 text-sm"
        />
      </div>

      {!localValue && suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setLocalValue(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {localValue && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary font-medium">{localValue}</p>
          </div>
        </div>
      )}
    </div>
  )
}
