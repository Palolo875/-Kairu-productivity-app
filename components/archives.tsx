"use client"

import { useState, useMemo, useCallback } from "react"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Zap, Calendar, ArchiveIcon } from "lucide-react"
import type { Task } from "@/types/task"

const energyColors: Record<string, string> = {
  deep: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  light: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  creative: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  admin: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  learning: "bg-green-500/20 text-green-700 dark:text-green-300",
}

interface ArchivesProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onArchiveTask: (id: string) => void
  onDuplicateTask: (id: string) => void
  onUnarchive: (id: string) => void
}

export function Archives({
  tasks,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onArchiveTask,
  onDuplicateTask,
  onUnarchive,
}: ArchivesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [energyFilter, setEnergyFilter] = useState<string | null>(null)

  const archivedTasks = tasks.filter((t) => t.archived)

  const filteredArchives = useMemo(() => {
    let filtered = archivedTasks

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (energyFilter) {
      filtered = filtered.filter((t) => t.energy === energyFilter)
    }

    return filtered
  }, [archivedTasks, searchQuery, energyFilter])

  const stats = useMemo(() => {
    const totalArchived = archivedTasks.length
    const completedInPeak = archivedTasks.filter((t) => t.completed && t.energy === "deep").length
    const peakPercentage = totalArchived > 0 ? Math.round((completedInPeak / totalArchived) * 100) : 0

    const energyDistribution = archivedTasks.reduce(
      (acc, task) => {
        if (task.energy) {
          acc[task.energy] = (acc[task.energy] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const avgCompletionTime = archivedTasks
      .filter((t) => t.completed && t.archivedAt && t.createdAt)
      .reduce((acc, task) => {
        const diff = task.archivedAt!.getTime() - task.createdAt.getTime()
        return acc + diff / (1000 * 60 * 60 * 24) // Convert to days
      }, 0)

    const avgDays =
      archivedTasks.filter((t) => t.completed).length > 0
        ? avgCompletionTime / archivedTasks.filter((t) => t.completed).length
        : 0

    return {
      totalArchived,
      peakPercentage,
      completedInPeak,
      energyDistribution,
      avgDays: Math.round(avgDays * 10) / 10,
      completedCount: archivedTasks.filter((t) => t.completed).length,
    }
  }, [archivedTasks])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleEnergyFilterToggle = useCallback((energy: string) => {
    setEnergyFilter((prev) => prev === energy ? null : energy)
  }, [])

  const handleResetFilters = useCallback(() => {
    setSearchQuery("")
    setEnergyFilter(null)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500" role="region" aria-label="Archives">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ArchiveIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Archives</h1>
        </div>
        <p className="text-muted-foreground">Fiches complétées et archivées - Historique sans encombrement</p>

        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les archives..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-12 rounded-3xl neuro-soft border-border/50 h-12"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="neuro-soft rounded-3xl p-6 animate-in fade-in duration-500 delay-100">
            <div className="flex items-center gap-3 mb-2">
              <ArchiveIcon className="w-5 h-5 text-primary" />
              <div className="text-sm text-muted-foreground">Total archivé</div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalArchived}</div>
          </div>

          <div className="neuro-soft rounded-3xl p-6 animate-in fade-in duration-500 delay-200">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <div className="text-sm text-muted-foreground">En Deep Work</div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.peakPercentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">{stats.completedInPeak} tâches</div>
          </div>

          <div className="neuro-soft rounded-3xl p-6 animate-in fade-in duration-500 delay-300">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div className="text-sm text-muted-foreground">Terminées</div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.completedCount}</div>
          </div>

          <div className="neuro-soft rounded-3xl p-6 animate-in fade-in duration-500 delay-[400ms]">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div className="text-sm text-muted-foreground">Temps moyen</div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.avgDays}</div>
            <div className="text-xs text-muted-foreground mt-1">jours</div>
          </div>
        </div>

        {Object.keys(stats.energyDistribution).length > 0 && (
          <div className="mt-6 neuro-soft rounded-3xl p-6 animate-in fade-in duration-500 delay-500">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Distribution énergétique
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.energyDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([energy, count]) => (
                  <button
                    key={energy}
                    onClick={() => handleEnergyFilterToggle(energy)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      energyFilter === energy
                        ? energyColors[energy] || "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {energy} ({count})
                  </button>
                ))}
              {energyFilter && (
                <button
                  onClick={() => setEnergyFilter(null)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-muted/50 text-muted-foreground hover:bg-muted"
                >
                  Tout voir
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArchives.map((task, index) => (
          <div
            key={task.id}
            className="relative animate-in fade-in duration-500"
            style={{ animationDelay: `${Math.min(index * 50, 1000)}ms` }}
          >
            <div className="absolute -top-2 -right-2 z-10">
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium neuro-soft">
                Archivé
              </span>
            </div>
            <TaskCard
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
              onArchive={onArchiveTask}
              onDuplicate={onDuplicateTask}
            />
            <div className="absolute top-2 right-2 z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnarchive(task.id)}
                className="rounded-full neuro-soft hover:bg-primary/20"
                title="Désarchiver"
              >
                <ArchiveIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredArchives.length === 0 && (
        <div className="text-center py-16 animate-in fade-in duration-500">
          <ArchiveIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery || energyFilter ? "Aucune fiche trouvée avec ces critères" : "Aucune fiche archivée"}
          </p>
          {(searchQuery || energyFilter) && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="mt-4 rounded-full"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
