import type { Task, Priority, Size, EnergyType } from "@/types/task"

interface ParseResult {
  cleanText: string
  priority?: Priority
  size?: Size
  energy?: EnergyType
  tags: string[]
  isDeepWork?: boolean
}

export function parseEnergyAndEffort(input: string): ParseResult {
  let cleanText = input
  const tags: string[] = []
  let priority: Priority | undefined
  let size: Size | undefined
  let energy: EnergyType | undefined

  const priorityRegex = /!{1,3}/g
  const priorityMatches = input.match(priorityRegex)
  if (priorityMatches) {
    const exclamCount = priorityMatches[0].length
    if (exclamCount === 3) priority = "urgent"
    else if (exclamCount === 2) priority = "high"
    else priority = "medium"
    cleanText = cleanText.replace(priorityRegex, "").trim()
  }

  const sizeRegex = /\b(S|M|L)\b/
  const sizeMatch = input.match(sizeRegex)
  if (sizeMatch) {
    size = sizeMatch[1] as Size
    cleanText = cleanText.replace(sizeRegex, "").trim()
  }

  const energyKeywords = {
    deep: ["deepwork", "deep work", "concentration", "focus", "complexe"],
    creative: ["créatif", "creative", "création", "design", "brainstorm"],
    learning: ["apprentissage", "learning", "apprendre", "étude", "formation"],
    admin: ["admin", "administratif", "email", "réunion", "meeting"],
    light: ["léger", "light", "facile", "rapide", "simple"],
  }

  for (const [energyType, keywords] of Object.entries(energyKeywords)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "i")
      if (regex.test(input)) {
        energy = energyType as EnergyType
        break
      }
    }
    if (energy) break
  }

  const tagRegex = /#(\w+)/g
  const tagMatches = input.matchAll(tagRegex)
  for (const match of tagMatches) {
    tags.push(match[1])
    cleanText = cleanText.replace(match[0], "").trim()
  }

  const deepWorkIndicators = ["deepwork", "deep work", "concentration profonde"]
  const isDeepWork = deepWorkIndicators.some((indicator) =>
    input.toLowerCase().includes(indicator)
  )
  if (isDeepWork) {
    energy = "deep"
    tags.push("deepwork")
  }

  cleanText = cleanText.replace(/\s+/g, " ").trim()

  return {
    cleanText,
    priority,
    size,
    energy,
    tags,
    isDeepWork,
  }
}

export function detectSubtasks(text: string): string[] {
  const subtasks: string[] = []
  
  const bulletRegex = /^[\s]*[-•*]\s*(.+)$/gm
  const matches = text.matchAll(bulletRegex)
  for (const match of matches) {
    subtasks.push(match[1].trim())
  }

  if (subtasks.length === 0) {
    const numberRegex = /^[\s]*\d+[\.)]\s*(.+)$/gm
    const numberMatches = text.matchAll(numberRegex)
    for (const match of numberMatches) {
      subtasks.push(match[1].trim())
    }
  }

  return subtasks
}

export function detectDueDate(text: string): Date | undefined {
  const datePatterns = [
    {
      regex: /aujourd'?hui/i,
      offset: 0,
    },
    {
      regex: /demain/i,
      offset: 1,
    },
    {
      regex: /après[- ]demain/i,
      offset: 2,
    },
    {
      regex: /dans (\d+) jours?/i,
      offsetFn: (match: RegExpMatchArray) => parseInt(match[1]),
    },
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern.regex)
    if (match) {
      const offset = pattern.offsetFn ? pattern.offsetFn(match) : pattern.offset
      const date = new Date()
      date.setDate(date.getDate() + offset)
      date.setHours(23, 59, 59, 999)
      return date
    }
  }

  return undefined
}

export function enrichTaskWithParsing(text: string): Partial<Task> {
  const parseResult = parseEnergyAndEffort(text)
  const subtasks = detectSubtasks(text)
  const dueDate = detectDueDate(text)

  return {
    title: parseResult.cleanText,
    priority: parseResult.priority || "medium",
    size: parseResult.size,
    energy: parseResult.energy,
    tags: parseResult.tags,
    dueDate,
    ...(subtasks.length > 0 && {
      subtasks: subtasks.map((text, index) => ({
        id: `subtask-${Date.now()}-${index}`,
        text,
        completed: false,
      })),
    }),
  }
}
