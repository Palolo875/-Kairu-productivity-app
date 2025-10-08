"use client"

import { LayoutGrid, Calendar, CalendarDays, Archive, Menu, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BottomNavProps {
  currentView: "tasks" | "daily" | "weekly" | "archives" | "insights"
  onViewChange: (view: "tasks" | "daily" | "weekly" | "archives" | "insights") => void
  onMenuOpen: () => void
  onSettingsOpen: () => void
}

export function BottomNav({ currentView, onViewChange, onMenuOpen, onSettingsOpen }: BottomNavProps) {
  return (
    <>
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-16 border-r border-border/50 bg-card/95 backdrop-blur-lg neuro-soft flex-col items-center py-4 gap-2 z-40">
        <Button
          variant={currentView === "daily" ? "secondary" : "ghost"}
          size="sm"
          className="flex-col h-auto py-2 px-2 rounded-2xl gap-1 w-14"
          onClick={() => onViewChange("daily")}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Jour</span>
        </Button>

        <Button
          variant={currentView === "tasks" ? "secondary" : "ghost"}
          size="sm"
          className="flex-col h-auto py-2 px-2 rounded-2xl gap-1 w-14"
          onClick={() => onViewChange("tasks")}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px]">Fiches</span>
        </Button>

        <Button
          variant={currentView === "weekly" ? "secondary" : "ghost"}
          size="sm"
          className="flex-col h-auto py-2 px-2 rounded-2xl gap-1 w-14"
          onClick={() => onViewChange("weekly")}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px]">Hebdo</span>
        </Button>

        <Button
          variant={currentView === "insights" ? "secondary" : "ghost"}
          size="sm"
          className="flex-col h-auto py-2 px-2 rounded-2xl gap-1 w-14"
          onClick={() => onViewChange("insights")}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Stats</span>
        </Button>

        <Button
          variant={currentView === "archives" ? "secondary" : "ghost"}
          size="sm"
          className="flex-col h-auto py-2 px-2 rounded-2xl gap-1 w-14"
          onClick={() => onViewChange("archives")}
        >
          <Archive className="w-5 h-5" />
          <span className="text-[10px]">Archive</span>
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-2 px-2 rounded-2xl gap-1 w-14"
          onClick={onSettingsOpen}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Réglages</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-2 px-2 rounded-2xl gap-1 w-14"
          onClick={onMenuOpen}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </Button>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/50 bg-card/95 backdrop-blur-lg neuro-soft">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          <Button
            variant={currentView === "daily" ? "secondary" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2 px-2 rounded-2xl gap-1"
            onClick={() => onViewChange("daily")}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Jour</span>
          </Button>

          <Button
            variant={currentView === "tasks" ? "secondary" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2 px-2 rounded-2xl gap-1"
            onClick={() => onViewChange("tasks")}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-xs">Fiches</span>
          </Button>

          <Button
            variant={currentView === "weekly" ? "secondary" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2 px-2 rounded-2xl gap-1"
            onClick={() => onViewChange("weekly")}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-xs">Hebdo</span>
          </Button>

          <Button
            variant={currentView === "insights" ? "secondary" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2 px-2 rounded-2xl gap-1"
            onClick={() => onViewChange("insights")}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Stats</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 px-2 rounded-2xl gap-1"
            onClick={onMenuOpen}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs">Menu</span>
          </Button>
        </div>
      </nav>
    </>
  )
}
