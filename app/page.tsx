"use client"

import { useState, useMemo, useEffect } from "react"
import { SmartInputBar } from "@/components/smart-input-bar"
import { TaskGrid } from "@/components/task-grid"
import { Sidebar, type FilterType } from "@/components/sidebar"
import { Archives } from "@/components/archives"
import { DailyNote } from "@/components/daily-note"
import { WeeklyView } from "@/components/weekly-view"
import { BottomNav } from "@/components/bottom-nav"
import { InsightsDashboard } from "@/components/insights-dashboard"
import { OnboardingQuiz } from "@/components/onboarding-quiz"
import { Settings } from "@/components/settings"
import type { Task } from "@/types/task"
import type { WeeklySuggestion } from "@/types/weekly"
import type { EnergyProfile, AppSettings } from "@/types/onboarding"
import { storage } from "@/lib/storage"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [energyProfile, setEnergyProfile] = useState<EnergyProfile | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"tasks" | "daily" | "weekly" | "archives" | "insights">("daily")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const onboardingCompleted = storage.isOnboardingCompleted()
    const storedTasks = storage.getTasks()
    const storedProfile = storage.getEnergyProfile()
    const storedSettings = storage.getSettings()

    setTasks(storedTasks)
    setEnergyProfile(storedProfile)
    setSettings(storedSettings)
    setShowOnboarding(!onboardingCompleted)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      storage.saveTasks(tasks)
    }
  }, [tasks, isLoading])

  const handleCreateTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      type: taskData.type || "task",
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const handleToggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const handleArchiveTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, archived: true, archivedAt: new Date() } : task)),
    )
  }

  const handleDuplicateTask = (id: string) => {
    const taskToDuplicate = tasks.find((t) => t.id === id)
    if (taskToDuplicate) {
      const newTask: Task = {
        ...taskToDuplicate,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        completed: false,
        title: `${taskToDuplicate.title} (copie)`,
      }
      setTasks((prev) => [newTask, ...prev])
    }
  }

  const handleUnarchiveTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, archived: false } : task)))
  }

  const handleWeeklyDayClick = (day: number) => {
    setCurrentView("daily")
  }

  const handleWeeklySuggestionClick = (suggestion: WeeklySuggestion) => {
    if (suggestion.action?.type === "create-task") {
      const newTask: Task = {
        id: crypto.randomUUID(),
        type: "task",
        title: `Bloquer du temps - ${suggestion.action.data?.energyType || "deep"}`,
        tags: ["suggestion"],
        priority: "high",
        energy: suggestion.action.data?.energyType || "deep",
        createdAt: new Date(),
        completed: false,
      }
      setTasks((prev) => [newTask, ...prev])
      setCurrentView("tasks")
    } else if (suggestion.action?.type === "block-time") {
      const newTask: Task = {
        id: crypto.randomUUID(),
        type: "task",
        title: `Bloquer ${suggestion.action.data?.suggestedHours || 2}h - ${suggestion.action.data?.energyType || "deep"}`,
        tags: ["time-block"],
        priority: "high",
        size: "L",
        energy: suggestion.action.data?.energyType || "deep",
        createdAt: new Date(),
        completed: false,
      }
      setTasks((prev) => [newTask, ...prev])
      setCurrentView("tasks")
    }
  }

  const handleOnboardingComplete = (profile: EnergyProfile, demoTask?: Task) => {
    setEnergyProfile(profile)
    storage.saveEnergyProfile(profile)
    storage.setOnboardingCompleted(true)
    setShowOnboarding(false)

    if (demoTask) {
      setTasks([demoTask])
    }
  }

  const handleOnboardingSkip = () => {
    storage.setOnboardingCompleted(true)
    setShowOnboarding(false)
  }

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (currentFilter === "today") {
      filtered = filtered.filter((t) => {
        if (!t.dueDate || t.archived) return false
        const today = new Date()
        return t.dueDate.toDateString() === today.toDateString()
      })
    } else if (currentFilter === "deep") {
      filtered = filtered.filter((t) => t.energy === "deep" && !t.archived)
    } else if (currentFilter === "archived") {
      filtered = filtered.filter((t) => t.archived)
    } else {
      filtered = filtered.filter((t) => !t.archived)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    return filtered
  }, [tasks, currentFilter, searchQuery])

  const handleViewChange = (view: "tasks" | "daily" | "weekly" | "archives" | "insights") => {
    setCurrentView(view)
    if (view === "archives") {
      setCurrentFilter("archived")
    } else {
      setCurrentFilter("all")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingQuiz onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
  }

  if (showSettings && settings) {
    return (
      <Settings
        settings={settings}
        onSettingsChange={(newSettings) => {
          setSettings(newSettings)
          storage.saveSettings(newSettings)
        }}
        onClose={() => setShowSettings(false)}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        tasks={tasks}
        onFilterChange={(filter) => {
          setCurrentFilter(filter)
          if (filter === "archived") {
            setCurrentView("archives")
          } else {
            setCurrentView("tasks")
          }
          setSidebarOpen(false)
        }}
        onSearchChange={setSearchQuery}
        onViewArchives={() => {
          setCurrentView("archives")
          setSidebarOpen(false)
        }}
        currentFilter={currentFilter}
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <main className="flex-1 min-w-0">
        {currentView === "tasks" && <SmartInputBar onTaskCreate={handleCreateTask} />}

        <div className="pb-20 lg:pb-8">
          {currentView === "daily" && (
            <DailyNote
              tasks={tasks}
              onTaskClick={(id) => console.log("[v0] Task clicked:", id)}
              onTaskComplete={handleToggleTask}
              onCreateTask={handleCreateTask}
            />
          )}

          {currentView === "weekly" && (
            <WeeklyView
              tasks={tasks}
              onDayClick={handleWeeklyDayClick}
              onSuggestionClick={handleWeeklySuggestionClick}
            />
          )}

          {currentView === "archives" && (
            <Archives
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onArchiveTask={handleArchiveTask}
              onDuplicateTask={handleDuplicateTask}
              onUnarchive={handleUnarchiveTask}
            />
          )}

          {currentView === "tasks" && (
            <TaskGrid
              tasks={filteredTasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onArchiveTask={handleArchiveTask}
              onDuplicateTask={handleDuplicateTask}
            />
          )}

          {currentView === "insights" && <InsightsDashboard tasks={tasks} />}
        </div>
      </main>

      <BottomNav
        currentView={currentView}
        onViewChange={handleViewChange}
        onMenuOpen={() => setSidebarOpen(true)}
        onSettingsOpen={() => setShowSettings(true)}
      />
    </div>
  )
}
