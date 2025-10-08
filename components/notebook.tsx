"use client"

import { useState } from "react"
import { BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Task } from "@/types/task"

interface NotebookProps {
  value: string
  onChange: (value: string) => void
  onCreateTask: (taskData: Omit<Task, "id" | "createdAt">) => void
}

export function Notebook({ value, onChange, onCreateTask }: NotebookProps) {
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [detectedActions, setDetectedActions] = useState<string[]>([])

  const analyzeText = () => {
    // Simple regex patterns to detect actions
    const actionPatterns = [
      /(?:appeler|contacter|téléphoner)\s+([A-Za-zÀ-ÿ\s]+)/gi,
      /(?:finir|terminer|compléter)\s+([A-Za-zÀ-ÿ\s]+)/gi,
      /(?:créer|faire|développer)\s+([A-Za-zÀ-ÿ\s]+)/gi,
      /(?:envoyer|écrire)\s+([A-Za-zÀ-ÿ\s]+)/gi,
    ]

    const actions: string[] = []
    actionPatterns.forEach((pattern) => {
      const matches = value.matchAll(pattern)
      for (const match of matches) {
        actions.push(match[0])
      }
    })

    setDetectedActions(actions)
    setShowAnalysis(true)
  }

  const createTaskFromAction = (action: string) => {
    onCreateTask({
      type: "task",
      title: action,
      description: "",
      tags: [],
      priority: "medium",
      completed: false,
    })

    // Remove the action from the text
    onChange(value.replace(action, "").trim())
    setDetectedActions((prev) => prev.filter((a) => a !== action))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Bloc-notes du Jour</h2>
        </div>
        {value && (
          <Button size="sm" variant="outline" onClick={analyzeText} className="rounded-full text-xs bg-transparent">
            <Sparkles className="w-3 h-3 mr-1" />
            Analyser
          </Button>
        )}
      </div>

      <Textarea
        placeholder="Notez vos idées, pensées, ou actions à faire..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-32 rounded-2xl neuro-soft border-border/50 resize-none text-sm"
      />

      {showAnalysis && detectedActions.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
          <p className="text-xs text-muted-foreground">Actions détectées :</p>
          <div className="space-y-2">
            {detectedActions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-2xl bg-secondary/30 neuro-soft">
                <p className="flex-1 text-sm">{action}</p>
                <Button size="sm" onClick={() => createTaskFromAction(action)} className="rounded-full text-xs">
                  Créer tâche
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
