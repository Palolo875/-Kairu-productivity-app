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
      className={`neuro-soft neuro-hover rounded-3xl border-border/50 bg-card overflow-hidden transition-all duration-300 ${
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

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mt-4">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium"
              role="tag"
            >
              #{tag}
            </span>
          ))}
          {task.priority !== "medium" && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority === "urgent" ? "🔥" : ""} {task.priority}
            </span>
          )}
          {task.size && (
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
              {sizeLabels[task.size]}
            </span>
          )}
          {task.energy && (
            <span className="px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-xs font-medium">
              {energyEmojis[task.energy]}
            </span>
          )}
          {deadlineBadge && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${deadlineBadge.color}`}
              aria-label={`Deadline ${deadlineBadge.text}`}
            >
              📅 {deadlineBadge.text}
            </span>
          )}
          {subtaskProgress && (
            <span className="px-3 py-1 bg-chart-2/20 text-chart-2 rounded-full text-xs font-medium">
              {subtaskProgress}
            </span>
          )}
        </div>
      </div>

      {/* Priority indicator bar */}
      <div
        className={`h-1 ${
          task.priority === "urgent"
            ? "bg-destructive"
            : task.priority === "high"
              ? "bg-chart-1"
              : task.priority === "low"
                ? "bg-chart-2"
                : "bg-chart-3"
        }`}
      />
    </Card>
  )
}

export const TaskCard = memo(TaskCardComponent)
