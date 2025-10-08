"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useTaskSearch } from "@/hooks/useSearch"
import type { Task } from "@/types/task"

interface SearchBarProps {
  tasks: Task[]
  onSearchChange: (query: string) => void
  onTaskSelect?: (task: Task) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ tasks, onSearchChange, onTaskSelect, placeholder = "Rechercher...", className = "" }: SearchBarProps) {
  const { query, quickResults, search, setQuery } = useTaskSearch(tasks)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (value: string) => {
    setQuery(value)
    search(value)
    onSearchChange(value)
    setShowSuggestions(value.length > 0)
  }

  const handleClear = () => {
    setQuery("")
    search("")
    onSearchChange("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleTaskClick = (task: Task) => {
    onTaskSelect?.(task)
    setShowSuggestions(false)
  }

  const highlightMatch = (text: string, matches: string[]) => {
    if (!matches.length) return text

    let result = text
    matches.forEach((match) => {
      const regex = new RegExp(`(${match})`, "gi")
      result = result.replace(regex, "<mark class='bg-primary/20 text-primary'>$1</mark>")
    })
    return result
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowSuggestions(true)}
          className="pl-10 pr-10 rounded-2xl neuro-soft border-border/50 text-sm md:text-base"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && quickResults.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50 neuro-soft"
          >
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {quickResults.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="w-full text-left p-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                      )}
                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {task.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {quickResults.length >= 5 && (
              <div className="p-2 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  {quickResults.length === 5 ? "5+ résultats" : `${quickResults.length} résultats`}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
