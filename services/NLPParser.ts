import type { Task, Priority, Size, EnergyType, TaskType } from "@/types/task"

export interface NLPParseResult {
  cleanText: string
  type: TaskType
  priority?: Priority
  size?: Size
  energy?: EnergyType
  tags: string[]
  dueDate?: Date
  confidence: number
  metadata?: {
    timeEstimate?: string
    context?: string
    people?: string[]
  }
}

let nlp: any = null

async function loadCompromise() {
  if (!nlp) {
    nlp = (await import("compromise")).default
  }
  return nlp
}

const PRIORITY_PATTERNS = {
  urgent: ["urgent", "urgente", "asap", "critique", "immédiat", "immédiate", "tout de suite"],
  high: ["important", "importante", "prioritaire", "essentiel", "essentielle", "rapidement"],
  medium: ["moyen", "moyenne", "normal", "normale"],
  low: ["bas", "basse", "peu important", "peu importante", "quand possible"],
}

const ENERGY_PATTERNS = {
  deep: ["deepwork", "deep work", "concentration", "focus", "complexe", "réfléchir", "réflexion", "analyse", "analyser"],
  creative: ["créatif", "créative", "creative", "création", "design", "brainstorm", "idée", "imaginer"],
  learning: ["apprentissage", "learning", "apprendre", "étude", "étudier", "formation", "cours", "lire"],
  admin: ["admin", "administratif", "email", "emails", "réunion", "meeting", "appel", "organiser"],
  light: ["léger", "légère", "light", "facile", "rapide", "simple", "vite"],
}

const SIZE_PATTERNS = {
  S: ["petit", "petite", "rapide", "quick", "5 min", "10 min", "court", "courte"],
  M: ["moyen", "moyenne", "medium", "30 min", "1h", "1 heure", "normal"],
  L: ["grand", "grande", "gros", "grosse", "long", "longue", "large", "plusieurs heures", "2h", "3h"],
}

export async function parseWithNLP(input: string): Promise<NLPParseResult> {
  const nlpEngine = await loadCompromise()
  const doc = nlpEngine(input)
  
  let cleanText = input
  const tags: string[] = []
  let type: TaskType = "task"
  let priority: Priority | undefined
  let size: Size | undefined
  let energy: EnergyType | undefined
  let dueDate: Date | undefined
  let confidence = 0.5
  
  const lowerInput = input.toLowerCase()

  const typePatterns = {
    task: ["tâche", "tache", "task", "faire", "à faire", "todo"],
    note: ["note", "noter", "rappel", "mémo"],
    idea: ["idée", "idee", "idea", "suggestion"],
    question: ["question", "pourquoi", "comment", "quoi", "qui"],
    link: ["lien", "link", "url", "site"],
  }

  for (const [taskType, patterns] of Object.entries(typePatterns)) {
    for (const pattern of patterns) {
      if (lowerInput.startsWith(pattern)) {
        type = taskType as TaskType
        cleanText = input.replace(new RegExp(`^${pattern}\\s*:?\\s*`, "i"), "")
        confidence += 0.1
        break
      }
    }
    if (type !== "task") break
  }

  const priorityShorthand = input.match(/!{1,3}/g)
  if (priorityShorthand) {
    const exclamations = priorityShorthand[0].length
    priority = exclamations === 1 ? "low" : exclamations === 2 ? "high" : "urgent"
    cleanText = cleanText.replace(/!{1,3}/g, "").trim()
    confidence += 0.2
  } else {
    for (const [priorityLevel, patterns] of Object.entries(PRIORITY_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerInput.includes(pattern)) {
          priority = priorityLevel as Priority
          confidence += 0.15
          break
        }
      }
      if (priority) break
    }
  }

  for (const [energyLevel, patterns] of Object.entries(ENERGY_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerInput.includes(pattern)) {
        energy = energyLevel as EnergyType
        confidence += 0.15
        break
      }
    }
    if (energy) break
  }

  const sizeShorthand = input.match(/@([SML])/i)
  if (sizeShorthand) {
    size = sizeShorthand[1].toUpperCase() as Size
    cleanText = cleanText.replace(/@[SML]/gi, "").trim()
    confidence += 0.15
  } else {
    for (const [sizeLevel, patterns] of Object.entries(SIZE_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerInput.includes(pattern)) {
          size = sizeLevel as Size
          confidence += 0.1
          break
        }
      }
      if (size) break
    }
  }

  const hashtagMatches = input.match(/#(\w+)/g)
  if (hashtagMatches) {
    hashtagMatches.forEach((tag) => {
      tags.push(tag.slice(1))
      cleanText = cleanText.replace(tag, "").trim()
    })
    confidence += 0.1
  }

  const dates = doc.dates().json()
  if (dates && dates.length > 0) {
    const dateInfo = dates[0]
    if (dateInfo.start) {
      dueDate = new Date(dateInfo.start)
      confidence += 0.1
    }
  }

  const datePatterns = [
    { regex: /aujourd'?hui/i, offset: 0 },
    { regex: /demain/i, offset: 1 },
    { regex: /après[- ]?demain/i, offset: 2 },
    { regex: /dans (\d+) jours?/i, offsetFn: (m: RegExpMatchArray) => parseInt(m[1]) },
    { regex: /cette semaine/i, offset: 3 },
    { regex: /semaine prochaine/i, offset: 7 },
  ]

  for (const pattern of datePatterns) {
    const match = input.match(pattern.regex)
    if (match) {
      const offset = pattern.offsetFn ? pattern.offsetFn(match) : pattern.offset
      const date = new Date()
      date.setDate(date.getDate() + offset)
      date.setHours(23, 59, 59, 999)
      dueDate = date
      cleanText = cleanText.replace(pattern.regex, "").trim()
      confidence += 0.1
      break
    }
  }

  const people = doc.people().out("array")
  const metadata = people.length > 0 ? { people } : undefined

  cleanText = cleanText
    .replace(/\s+/g, " ")
    .replace(/!{1,3}/g, "")
    .replace(/\b(S|M|L)\b/g, "")
    .trim()

  confidence = Math.min(confidence, 1.0)

  return {
    cleanText,
    type,
    priority,
    size,
    energy,
    tags,
    dueDate,
    confidence,
    metadata,
  }
}

export async function enrichTaskWithNLP(text: string): Promise<Partial<Task>> {
  const result = await parseWithNLP(text)

  return {
    title: result.cleanText,
    type: result.type,
    priority: result.priority || "medium",
    size: result.size,
    energy: result.energy,
    tags: result.tags,
    dueDate: result.dueDate,
  }
}

export async function batchParseWithNLP(inputs: string[]): Promise<NLPParseResult[]> {
  const results = await Promise.all(inputs.map((input) => parseWithNLP(input)))
  return results
}
