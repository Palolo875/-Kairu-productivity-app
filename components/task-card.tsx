"use client"

import { useState, useRef, useEffect, memo } from "react"
import { MoreVertical, Trash2, Archive, Copy, CheckCircle2, HelpCircle, Lightbulb, LinkIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import type { Task } from "@/types/task"
import { energyEmojis, taskTypeEmojis } from "@/types/task"
import { triggerConfetti } from "@/lib/confetti"

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onArchive: (id: string) => void
  onDuplicate: (id: string) => void
}

const priorityColors = {
  low: "bg-chart-2/20 text-chart-2",
  medium: "bg-chart-3/20 text-chart-3",
  high: "bg-chart-1/20 text-chart-1",
  urgent: "bg-destructive/20 text-destructive",
}

const sizeLabels = {
  S: "Petit",
  M: "Moyen",
  L: "Grand",
}

const formatDate = (date: Date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === tomorrow.toDateString()) return "Demain"
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

const TaskCardComponent = ({ task, onToggle, onDelete, onUpdate, onArchive, onDuplicate }: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(task.content || task.title)
  const [isRotating, setIsRotating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const getDeadlineBadge = () => {
    if (!task.dueDate) return null
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let color = "bg-muted text-muted-foreground"
    let text = formatDate(dueDate)

    if (diffDays < 0) {
      color = "bg-destructive/20 text-destructive"
      text = "En retard"
    } else if (diffDays === 0) {
      color = "bg-destructive/20 text-destructive"
      text = "Aujourd'hui"
    } else if (diffDays <= 3) {
      color = "bg-chart-1/20 text-chart-1"
    }

    return { color, text }
  }

  const deadlineBadge = getDeadlineBadge()

  useEffect(() => {
    if (isEditing && editContent !== (task.content || task.title)) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        onUpdate(task.id, { content: editContent })
      }, 2000)
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [editContent, isEditing, task.id, task.content, task.title, onUpdate])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleToggle = () => {
    setIsRotating(true)
    setTimeout(() => {
      onToggle(task.id)
      if (!task.completed && task.subtasks?.every((st) => st.completed)) {
        triggerConfetti()
      }
      setIsRotating(false)
    }, 300)
  }

  const handleSubtaskToggle = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st))
    onUpdate(task.id, { subtasks: updatedSubtasks })

    // Check if all subtasks are completed
    if (updatedSubtasks?.every((st) => st.completed)) {
      setTimeout(() => {
        const shouldComplete = window.confirm(
          "Toutes les sous-tâches sont complétées. Marquer la tâche comme terminée ?",
        )
        if (shouldComplete) {
          onToggle(task.id)
          triggerConfetti()
        }
      }, 300)
    }
  }

  const subtaskProgress = task.subtasks
    ? `${task.subtasks.filter((st) => st.completed).length}/${task.subtasks.length}`
    : null

  const TaskTypeIcon = () => {
    const icons = {
      task: CheckCircle2,
      question: HelpCircle,
      idea: Lightbulb,
      link: LinkIcon,
    }
    const Icon = icons[task.type || "task"]
    return <Icon className="w-4 h-4" />
  }

  return (
    <Card
      className={`bg-white rounded-[20px] border-none shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] ${
        task.completed ? "opacity-60" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      role="article"
      aria-label={`Fiche: ${task.title}`}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/30">
          <Button
            variant={task.type === "task" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => onUpdate(task.id, { type: "task" })}
          >
            {taskTypeEmojis.task}
          </Button>
          <Button
            variant={task.type === "question" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => onUpdate(task.id, { type: "question" })}
          >
            {taskTypeEmojis.question}
          </Button>
          <Button
            variant={task.type === "idea" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => onUpdate(task.id, { type: "idea" })}
          >
            {taskTypeEmojis.idea}
          </Button>
          <Button
            variant={task.type === "link" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => onUpdate(task.id, { type: "link" })}
          >
            {taskTypeEmojis.link}
          </Button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl neuro-soft">
              <DropdownMenuItem className="rounded-xl" onClick={() => onDuplicate(task.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl" onClick={() => onArchive(task.id)}>
                <Archive className="w-4 h-4 mr-2" />
                Archiver
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="rounded-xl text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggle}
            className={`mt-1 rounded-full data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-transform ${
              isRotating ? "rotate-[360deg]" : ""
            }`}
            style={{ transition: "transform 0.3s ease-in-out" }}
          />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="min-h-[60px] rounded-2xl neuro-soft resize-none"
              />
            ) : (
              <>
                <h3
                  className={`text-base font-medium leading-relaxed text-balance ${
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed text-pretty">{task.description}</p>
                )}
              </>
            )}
          </div>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-3 space-y-2">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                  className="rounded-full data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  role="checkbox"
                  aria-checked={subtask.completed}
                />
                <span
                  className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {subtask.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Metadata - Design KairuFlow avec tags très arrondis */}
        <div className="flex flex-wrap gap-2 mt-4">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-[20px] text-xs font-medium flex items-center gap-1.5"
              style={{ backgroundColor: 'rgba(142, 238, 222, 0.5)', color: '#2d3748' }}
              role="tag"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              {tag}
            </span>
          ))}
          {task.priority !== "medium" && (
            <span 
              className="px-3 py-1.5 rounded-[20px] text-xs font-medium flex items-center gap-1.5"
              style={{ 
                backgroundColor: task.priority === 'urgent' || task.priority === 'high' 
                  ? 'rgba(238, 158, 142, 0.5)' 
                  : 'rgba(142, 238, 222, 0.3)',
                color: '#2d3748'
              }}
            >
              {task.priority === "urgent" && "🔥"} 
              {task.priority === "high" && "⚡"}
              {task.priority === "low" && "🌱"}
              {task.priority}
            </span>
          )}
          {task.size && (
            <span 
              className="px-3 py-1.5 rounded-[20px] text-xs font-medium"
              style={{ backgroundColor: 'rgba(226, 232, 240, 0.8)', color: '#64748b' }}
            >
              {sizeLabels[task.size]}
            </span>
          )}
          {task.energy && (
            <span 
              className="px-3 py-1.5 rounded-[20px] text-xs font-medium flex items-center gap-1.5"
              style={{ backgroundColor: 'rgba(142, 184, 238, 0.5)', color: '#2d3748' }}
            >
              {energyEmojis[task.energy]}
            </span>
          )}
          {deadlineBadge && (
            <span
              className="px-3 py-1.5 rounded-[20px] text-xs font-medium flex items-center gap-1.5"
              style={{ 
                backgroundColor: 
                  deadlineBadge.color.includes('destructive') 
                    ? 'rgba(238, 158, 142, 0.5)'  // Pêche pour urgent/en retard
                    : deadlineBadge.color.includes('chart-1')
                      ? 'rgba(238, 158, 142, 0.3)'  // Pêche léger pour bientôt (3j)
                      : 'rgba(226, 232, 240, 0.8)', // Gris neutre pour dates normales
                color: deadlineBadge.color.includes('destructive') || deadlineBadge.color.includes('chart-1')
                  ? '#2d3748'
                  : '#64748b'
              }}
              aria-label={`Deadline ${deadlineBadge.text}`}
            >
              📅 {deadlineBadge.text}
            </span>
          )}
          {subtaskProgress && (
            <span 
              className="px-3 py-1.5 rounded-[20px] text-xs font-medium"
              style={{ backgroundColor: 'rgba(142, 238, 222, 0.3)', color: '#2d3748' }}
            >
              {subtaskProgress}
            </span>
          )}
        </div>
      </div>

      {/* Priority indicator bar - Design KairuFlow */}
      <div
        className="h-1.5 rounded-b-[20px]"
        style={{
          backgroundColor: 
            task.priority === "urgent" ? "#EE9E8E" :
            task.priority === "high" ? "#EE9E8E" :
            task.priority === "low" ? "#8EEDDE" :
            "#E2E8F0"
        }}
      />
    </Card>
  )
}

export const TaskCard = memo(TaskCardComponent)
