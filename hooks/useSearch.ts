import { useState, useEffect, useCallback, useMemo } from "react"
import { taskSearchService, noteSearchService, type SearchResult } from "@/services/SearchService"
import type { Task } from "@/types/task"
import type { DailyNote } from "@/types/onboarding"

export function useTaskSearch(tasks: Task[]) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult<Task>[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (tasks.length > 0) {
      taskSearchService.buildIndex(tasks)
    }
  }, [tasks])

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery)
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)
      try {
        const searchResults = taskSearchService.search(searchQuery)
        setResults(searchResults)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [tasks],
  )

  const quickResults = useMemo(() => taskSearchService.quickSearch(query, 5), [query, tasks])

  return {
    query,
    results,
    quickResults,
    isSearching,
    search,
    setQuery,
  }
}

export function useNoteSearch(notes: DailyNote[]) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult<DailyNote>[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (notes.length > 0) {
      noteSearchService.buildIndex(notes)
    }
  }, [notes])

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery)
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)
      try {
        const searchResults = noteSearchService.search(searchQuery)
        setResults(searchResults)
      } catch (error) {
        console.error("Note search error:", error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [notes],
  )

  const quickResults = useMemo(() => noteSearchService.quickSearch(query, 5), [query, notes])

  return {
    query,
    results,
    quickResults,
    isSearching,
    search,
    setQuery,
  }
}
