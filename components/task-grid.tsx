"use client"

import { useState, useMemo, useCallback } from "react"
import { TaskCard } from "./task-card"
import type { Task } from "@/types/task"
import { priorityLevels } from "@/types/task"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, GripVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskGridProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onArchiveTask: (id: string) => void
  onDuplicateTask: (id: string) => void
}

type SortOption = "date" | "priority" | "alphabetical" | "manual"

function SortableTaskCard({
  task,
  onToggle,
  onDelete,
  onUpdate,
  onArchive,
  onDuplicate,
}: {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onArchive: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 touch-action-none"
      >
        <div className="p-2 rounded-full bg-muted/80 backdrop-blur-sm neuro-soft">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <TaskCard
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onArchive={onArchive}
        onDuplicate={onDuplicate}
      />
    </div>
  )
}

export function TaskGrid({
  tasks,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onArchiveTask,
  onDuplicateTask,
}: TaskGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [taskOrder, setTaskOrder] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks]

    switch (sortBy) {
      case "manual":
        if (taskOrder.length === 0) {
          setTaskOrder(sorted.map((t) => t.id))
          return sorted
        }
        return sorted.sort((a, b) => {
          const indexA = taskOrder.indexOf(a.id)
          const indexB = taskOrder.indexOf(b.id)
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        })
      case "date":
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      case "priority":
        return sorted.sort((a, b) => {
          const priorityDiff = priorityLevels[b.priority] - priorityLevels[a.priority]
          if (priorityDiff !== 0) return priorityDiff
          return b.createdAt.getTime() - a.createdAt.getTime()
        })
      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return sorted
    }
  }, [tasks, sortBy, taskOrder])

  const activeTasks = useMemo(() => sortedTasks.filter((t) => !t.completed), [sortedTasks])
  const completedTasks = useMemo(() => sortedTasks.filter((t) => t.completed), [sortedTasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTaskOrder((prevOrder) => {
        const oldIndex = prevOrder.indexOf(active.id as string)
        const newIndex = prevOrder.indexOf(over.id as string)

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prevOrder, oldIndex, newIndex)
        }
        return prevOrder
      })
    }

    setActiveId(null)
  }, [])

  const activeTask = useMemo(() => activeId ? tasks.find((t) => t.id === activeId) : null, [activeId, tasks])

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-secondary/30 flex items-center justify-center mb-4 md:mb-6">
          <span className="text-3xl md:text-4xl">✨</span>
        </div>
        <h3 className="text-lg md:text-xl font-medium text-foreground mb-2 text-balance text-center">
          Aucune tâche pour le moment
        </h3>
        <p className="text-sm md:text-base text-muted-foreground text-center text-pretty max-w-md">
          Commencez par créer votre première tâche avec la barre de saisie ci-dessus
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-base md:text-lg font-medium text-foreground">
              {activeTasks.length} tâche{activeTasks.length !== 1 ? "s" : ""} active
              {activeTasks.length !== 1 ? "s" : ""}
            </h2>
            {completedTasks.length > 0 && (
              <span className="text-xs md:text-sm text-muted-foreground">
                • {completedTasks.length} terminée{completedTasks.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full neuro-soft bg-transparent w-full sm:w-auto">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Trier
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl neuro-soft">
              <DropdownMenuItem onClick={() => setSortBy("manual")} className="rounded-xl">
                Manuel (glisser-déposer)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date")} className="rounded-xl">
                Par date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")} className="rounded-xl">
                Par priorité
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("alphabetical")} className="rounded-xl">
                Alphabétique
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {activeTasks.length > 0 && (
          <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              {activeTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <SortableTaskCard
                    task={task}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    onUpdate={onUpdateTask}
                    onArchive={onArchiveTask}
                    onDuplicate={onDuplicateTask}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h3 className="text-sm md:text-base font-medium text-muted-foreground mb-3 md:mb-4">Tâches terminées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onUpdate={onUpdateTask}
                  onArchive={onArchiveTask}
                  onDuplicate={onDuplicateTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="drag-overlay">
            <TaskCard
              task={activeTask}
              onToggle={() => {}}
              onDelete={() => {}}
              onUpdate={() => {}}
              onArchive={() => {}}
              onDuplicate={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
