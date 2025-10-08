"use client"

import { useState } from "react"
import { Search, Calendar, Brain, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { Task } from "@/types/task"

export type FilterType = "all" | "today" | "deep" | "archived"

interface SidebarProps {
  tasks: Task[]
  onFilterChange: (filter: FilterType) => void
  onSearchChange: (query: string) => void
  onViewArchives: () => void
  currentFilter: FilterType
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sidebar({
  tasks,
  onFilterChange,
  onSearchChange,
  currentFilter,
  onViewArchives,
  isOpen = false,
  onOpenChange,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearchChange(value)
  }

  const todayCount = tasks.filter((t) => {
    if (!t.dueDate || t.archived) return false
    const today = new Date()
    return t.dueDate.toDateString() === today.toDateString()
  }).length

  const deepWorkCount = tasks.filter((t) => t.energy === "deep" && !t.archived).length

  const tagCounts = tasks
    .filter((t) => !t.archived)
    .reduce(
      (acc, task) => {
        task.tags.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 rounded-2xl neuro-soft border-border/50 text-sm md:text-base"
          />
        </div>
      </div>

      <div className="p-3 md:p-4 border-b border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vues rapides</h3>
        <div className="space-y-1">
          <Button
            variant={currentFilter === "today" ? "secondary" : "ghost"}
            className="w-full justify-start rounded-2xl text-sm md:text-base"
            onClick={() => {
              onFilterChange("today")
              onOpenChange?.(false)
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Aujourd'hui
            {todayCount > 0 && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{todayCount}</span>
            )}
          </Button>
          <Button
            variant={currentFilter === "deep" ? "secondary" : "ghost"}
            className="w-full justify-start rounded-2xl text-sm md:text-base"
            onClick={() => {
              onFilterChange("deep")
              onOpenChange?.(false)
            }}
          >
            <Brain className="w-4 h-4 mr-2" />
            Deep Work
            {deepWorkCount > 0 && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {deepWorkCount}
              </span>
            )}
          </Button>
          <Button
            variant={currentFilter === "archived" ? "secondary" : "ghost"}
            className="w-full justify-start rounded-2xl text-sm md:text-base"
            onClick={() => {
              onFilterChange("archived")
              onViewArchives()
              onOpenChange?.(false)
            }}
          >
            <Archive className="w-4 h-4 mr-2" />
            Archives
          </Button>
        </div>
      </div>

      <div className="p-3 md:p-4 flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags</h3>
        <div className="space-y-1">
          {Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([tag, count]) => (
              <button
                key={tag}
                className="w-full text-left px-3 py-2 rounded-2xl hover:bg-secondary/50 transition-colors text-xs md:text-sm"
                onClick={() => onOpenChange?.(false)}
              >
                <span className="text-foreground">#{tag}</span>
                <span className="ml-auto float-right text-xs text-muted-foreground">({count})</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 md:w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:block w-80 border-r border-border/50 bg-card/50 backdrop-blur-sm">
        <SidebarContent />
      </aside>
    </>
  )
}
