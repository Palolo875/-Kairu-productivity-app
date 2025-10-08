"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Sparkles, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Task, Priority, Size, EnergyType, TaskType } from "@/types/task"
import { energyEmojis } from "@/types/task"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { parseVoiceCommand, voiceCommandToTask } from "@/lib/voice-parser"
import { parseWithNLP } from "@/services/NLPParser"

interface SmartInputBarProps {
  onTaskCreate: (task: Omit<Task, "id" | "createdAt">) => void
}

interface ParsedData {
  tags: string[]
  priority: Priority
  size?: Size
  energy?: EnergyType
  dueDate?: Date
  type: TaskType
  subtasks: Array<{ id: string; text: string; completed: boolean }>
}

export function SmartInputBar({ onTaskCreate }: SmartInputBarProps) {
  const [input, setInput] = useState("")
  const [parsedData, setParsedData] = useState<ParsedData>({
    tags: [],
    priority: "medium",
    type: "task",
    subtasks: [],
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [voiceCommandDetected, setVoiceCommandDetected] = useState<string | null>(null)
  const latestInputRef = useRef<string>("")

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error: speechError,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: "fr-FR",
    onResult: (text) => {
      const voiceCommand = parseVoiceCommand(text)

      if (voiceCommand.type !== "task" || voiceCommand.metadata.priority || voiceCommand.metadata.energy) {
        setVoiceCommandDetected(`Commande détectée: ${voiceCommand.type}`)
        setTimeout(() => setVoiceCommandDetected(null), 3000)
      }

      if (voiceCommand.type === "intention" || voiceCommand.type === "notebook") {
        const task = voiceCommandToTask(voiceCommand)
        task.tags = [...(task.tags || []), voiceCommand.type]
        onTaskCreate(task)
        setInput("")
        return
      }

      setInput((prev) => {
        const newText = prev ? `${prev} ${voiceCommand.content}` : voiceCommand.content

        let enrichedText = newText
        if (voiceCommand.metadata.tags?.length) {
          enrichedText += " " + voiceCommand.metadata.tags.map((t) => `#${t}`).join(" ")
        }
        if (voiceCommand.metadata.priority === "urgent") {
          enrichedText += " !!!"
        } else if (voiceCommand.metadata.priority === "high") {
          enrichedText += " !!"
        } else if (voiceCommand.metadata.priority === "low") {
          enrichedText += " !"
        }
        if (voiceCommand.metadata.size) {
          enrichedText += ` @${voiceCommand.metadata.size}`
        }
        if (voiceCommand.metadata.energy) {
          const energyEmojis: Record<EnergyType, string> = {
            deep: "🧠",
            light: "🔧",
            creative: "✨",
            admin: "💬",
            learning: "📚",
          }
          enrichedText += ` ${energyEmojis[voiceCommand.metadata.energy]}`
        }

        return enrichedText
      })
    },
  })

  useEffect(() => {
    if (!input) {
      resetTranscript()
    }
  }, [input, resetTranscript])

  useEffect(() => {
    if (window.innerWidth > 768) {
      inputRef.current?.focus()
    }
  }, [])

  const parseInput = useCallback(async (text: string) => {
    latestInputRef.current = text
    const currentInput = text
    
    try {
      const nlpResult = await parseWithNLP(text)
      
      if (latestInputRef.current !== currentInput) {
        return
      }
      
      const data: ParsedData = {
        tags: nlpResult.tags,
        priority: nlpResult.priority || "medium",
        type: nlpResult.type,
        subtasks: [],
        size: nlpResult.size,
        energy: nlpResult.energy,
        dueDate: nlpResult.dueDate,
      }

      const subtaskMatches = text.match(/- \[ \] .+/g)
      if (subtaskMatches) {
        data.subtasks = subtaskMatches.map((match) => ({
          id: crypto.randomUUID(),
          text: match.replace(/- \[ \] /, "").trim(),
          completed: false,
        }))
      }

      if (text.includes("🧠")) data.energy = "deep"
      else if (text.includes("🔧")) data.energy = "light"
      else if (text.includes("✨")) data.energy = "creative"
      else if (text.includes("💬")) data.energy = "admin"
      else if (text.includes("📚")) data.energy = "learning"

      if (text.includes("❓")) data.type = "question"
      else if (text.includes("💡")) data.type = "idea"
      else if (text.includes("🔗")) data.type = "link"

      setParsedData(data)
      setShowSuggestions(text.length > 3 && !data.energy && nlpResult.confidence < 0.8)
    } catch (error) {
      if (latestInputRef.current !== currentInput) {
        return
      }
      console.error("NLP parsing error:", error)
      const fallbackData: ParsedData = {
        tags: [],
        priority: "medium",
        type: "task",
        subtasks: [],
      }
      setParsedData(fallbackData)
    }
  }, [])

  useEffect(() => {
    if (input.trim()) {
      parseInput(input)
    }
  }, [input, parseInput])

  const handleSubmit = async () => {
    if (!input.trim()) return

    try {
      const nlpResult = await parseWithNLP(input)
      
      const task: Omit<Task, "id" | "createdAt"> = {
        title: nlpResult.cleanText,
        type: parsedData.type,
        tags: parsedData.tags,
        priority: parsedData.priority,
        size: parsedData.size,
        energy: parsedData.energy,
        dueDate: parsedData.dueDate,
        subtasks: parsedData.subtasks.length > 0 ? parsedData.subtasks : undefined,
        completed: false,
      }

      onTaskCreate(task)
      setInput("")
      setParsedData({ tags: [], priority: "medium", type: "task", subtasks: [] })
      setShowSuggestions(false)
    } catch (error) {
      console.error("Error submitting task:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      setInput("")
      inputRef.current?.blur()
    }
  }

  const addEnergyType = (energy: EnergyType) => {
    setInput((prev) => `${prev} ${energyEmojis[energy]}`)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-5xl mx-auto p-5">
        {/* Conteneur de création - Design KairuFlow */}
        <div className="bg-white rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-5 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Zone de texte */}
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Notez une nouvelle tâche... ex: Réunion demain #ProjetX !urgent"
                className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground text-lg leading-relaxed min-h-[50px] max-h-32"
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "50px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = `${target.scrollHeight}px`
                }}
              />

              {voiceCommandDetected && (
                <div className="text-xs text-primary font-medium mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2">
                  <Sparkles className="w-3 h-3" />
                  {voiceCommandDetected}
                </div>
              )}

              {isListening && interimTranscript && (
                <div className="text-sm text-muted-foreground italic mt-1">{interimTranscript}</div>
              )}

              {speechError && (
                <div className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <MicOff className="w-3 h-3" />
                  {speechError}
                </div>
              )}

              {input && (
                <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                  {parsedData.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 md:px-3 py-0.5 md:py-1 bg-accent/20 text-accent-foreground rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {parsedData.priority !== "medium" && (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-destructive/20 text-destructive-foreground rounded-full text-xs font-medium">
                      {parsedData.priority}
                    </span>
                  )}
                  {parsedData.size && (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium">
                      Taille: {parsedData.size}
                    </span>
                  )}
                  {parsedData.energy && (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-primary/20 text-primary-foreground rounded-full text-xs font-medium">
                      {energyEmojis[parsedData.energy]} {parsedData.energy}
                    </span>
                  )}
                  {parsedData.dueDate && (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-chart-3/20 text-foreground rounded-full text-xs font-medium">
                      📅 {parsedData.dueDate.toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  {parsedData.subtasks.length > 0 && (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-chart-2/20 text-chart-2 rounded-full text-xs font-medium">
                      {parsedData.subtasks.length} sous-tâche{parsedData.subtasks.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Contrôles - voix, clear, créer */}
            <div className="flex items-center gap-2">
              {isSupported && (
                <Button
                  size="icon"
                  variant={isListening ? "destructive" : "ghost"}
                  onClick={handleVoiceToggle}
                  className={`flex-shrink-0 rounded-full h-10 w-10 transition-all ${
                    isListening ? "animate-pulse" : "hover:bg-muted"
                  }`}
                  title={isListening ? "Arrêter l'enregistrement" : "Commencer l'enregistrement vocal"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}

              {input && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setInput("")}
                  className="flex-shrink-0 rounded-full hover:bg-muted h-10 w-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="w-[50px] h-[50px] rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Créer la fiche"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          {showSuggestions && (
            <div className="px-3 md:px-4 pb-3 md:pb-4">
              <Popover open={showSuggestions}>
                <PopoverTrigger asChild>
                  <div className="text-xs text-muted-foreground">💡 Suggestions disponibles</div>
                </PopoverTrigger>
                <PopoverContent className="w-72 md:w-80 p-3 neuro-soft rounded-2xl border-border/50" align="start">
                  <p className="text-sm font-medium mb-3 text-foreground">Ajouter un type d'énergie ?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(energyEmojis) as [EnergyType, string][]).map(([type, emoji]) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => addEnergyType(type)}
                        className="justify-start rounded-xl neuro-hover border-border/50 text-xs md:text-sm"
                      >
                        <span className="mr-2">{emoji}</span>
                        <span className="capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Instructions helpers - Design KairuFlow */}
          <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
            <span>Appuyez sur Entrée pour créer</span>
            <span>Utilisez # pour les projets, ! pour la priorité</span>
          </div>
        </div>
      </div>
    </div>
  )
}
