import lunr from "lunr"
import type { Task } from "@/types/task"
import type { DailyNote } from "@/types/onboarding"

export interface SearchResult<T> {
  item: T
  score: number
  matches: string[]
}

interface IndexableTask extends Task {
  searchContent?: string
}

interface IndexableNote extends DailyNote {
  searchContent?: string
}

export class TaskSearchService {
  private index: lunr.Index | null = null
  private tasks: Map<string, Task> = new Map()

  buildIndex(tasks: Task[]): void {
    this.tasks = new Map(tasks.map((task) => [task.id, task]))

    this.index = lunr(function (this: lunr.Builder) {
      this.ref("id")
      this.field("title", { boost: 10 })
      this.field("description", { boost: 5 })
      this.field("tags", { boost: 7 })
      this.field("searchContent", { boost: 3 })

      this.pipeline.remove(lunr.stemmer)
      this.searchPipeline.remove(lunr.stemmer)

      tasks.forEach((task) => {
        const searchContent = [
          task.content || "",
          task.subtasks?.map((st) => st.text).join(" ") || "",
        ].join(" ")

        this.add({
          id: task.id,
          title: task.title,
          description: task.description || "",
          tags: task.tags.join(" "),
          searchContent,
        })
      }, this)
    })
  }

  search(query: string): SearchResult<Task>[] {
    if (!this.index || !query.trim()) {
      return []
    }

    try {
      const wildcard = query
        .split(" ")
        .map((term) => `${term}* ${term}~1`)
        .join(" ")

      const results = this.index.search(wildcard)

      return results
        .map((result: lunr.Index.Result) => {
          const task = this.tasks.get(result.ref)
          if (!task) return null

          const matches = Object.keys(result.matchData.metadata)

          return {
            item: task,
            score: result.score,
            matches,
          }
        })
        .filter((r): r is SearchResult<Task> => r !== null)
        .sort((a: SearchResult<Task>, b: SearchResult<Task>) => b.score - a.score)
    } catch (error) {
      console.error("Search error:", error)
      return []
    }
  }

  quickSearch(query: string, limit: number = 10): Task[] {
    const results = this.search(query)
    return results.slice(0, limit).map((r) => r.item)
  }
}

export class NoteSearchService {
  private index: lunr.Index | null = null
  private notes: Map<string, DailyNote> = new Map()

  buildIndex(notes: DailyNote[]): void {
    this.notes = new Map(notes.map((note) => [note.date, note]))

    this.index = lunr(function (this: lunr.Builder) {
      this.ref("date")
      this.field("intention", { boost: 10 })
      this.field("notebook", { boost: 8 })

      this.pipeline.remove(lunr.stemmer)
      this.searchPipeline.remove(lunr.stemmer)

      notes.forEach((note) => {
        this.add({
          date: note.date,
          intention: note.intention || "",
          notebook: note.notebook || "",
        })
      }, this)
    })
  }

  search(query: string): SearchResult<DailyNote>[] {
    if (!this.index || !query.trim()) {
      return []
    }

    try {
      const wildcard = query
        .split(" ")
        .map((term) => `${term}* ${term}~1`)
        .join(" ")

      const results = this.index.search(wildcard)

      return results
        .map((result: lunr.Index.Result) => {
          const note = this.notes.get(result.ref)
          if (!note) return null

          const matches = Object.keys(result.matchData.metadata)

          return {
            item: note,
            score: result.score,
            matches,
          }
        })
        .filter((r): r is SearchResult<DailyNote> => r !== null)
        .sort((a: SearchResult<DailyNote>, b: SearchResult<DailyNote>) => b.score - a.score)
    } catch (error) {
      console.error("Note search error:", error)
      return []
    }
  }

  quickSearch(query: string, limit: number = 10): DailyNote[] {
    const results = this.search(query)
    return results.slice(0, limit).map((r) => r.item)
  }
}

export const taskSearchService = new TaskSearchService()
export const noteSearchService = new NoteSearchService()
