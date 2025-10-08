export type Priority = "low" | "medium" | "high" | "urgent"
export type Size = "S" | "M" | "L"
export type EnergyType = "deep" | "light" | "creative" | "admin" | "learning"
export type TaskType = "task" | "question" | "idea" | "link"

export interface Subtask {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  type: TaskType
  title: string
  description?: string
  content?: string
  subtasks?: Subtask[]
  tags: string[]
  priority: Priority
  size?: Size
  energy?: EnergyType
  dueDate?: Date
  createdAt: Date
  completed: boolean
  archived?: boolean
  archivedAt?: Date
}

export const energyEmojis: Record<EnergyType, string> = {
  deep: "🧠",
  light: "🔧",
  creative: "✨",
  admin: "💬",
  learning: "📚",
}

export const priorityLevels: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
}

export const taskTypeEmojis: Record<TaskType, string> = {
  task: "✅",
  question: "❓",
  idea: "💡",
  link: "🔗",
}
