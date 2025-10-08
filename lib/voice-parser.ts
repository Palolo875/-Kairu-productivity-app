import type { Task, Priority, Size, EnergyType, TaskType } from "@/types/task"

export interface VoiceCommand {
  type: "task" | "note" | "intention" | "notebook" | "question" | "idea" | "link"
  content: string
  metadata: {
    priority?: Priority
    size?: Size
    energy?: EnergyType
    tags?: string[]
    dueDate?: Date
    subtasks?: Array<{ id: string; text: string; completed: boolean }>
  }
}

export function parseVoiceCommand(text: string): VoiceCommand {
  const lowerText = text.toLowerCase().trim()

  let type: VoiceCommand["type"] = "task"
  let content = text

  // Command detection
  if (lowerText.startsWith("tâche") || lowerText.startsWith("tache") || lowerText.startsWith("task")) {
    type = "task"
    content = text.replace(/^(tâche|tache|task)\s*:?\s*/i, "")
  } else if (lowerText.startsWith("note")) {
    type = "note"
    content = text.replace(/^note\s*:?\s*/i, "")
  } else if (lowerText.startsWith("intention")) {
    type = "intention"
    content = text.replace(/^intention\s*:?\s*/i, "")
  } else if (
    lowerText.startsWith("bloc-notes") ||
    lowerText.startsWith("bloc notes") ||
    lowerText.startsWith("notebook")
  ) {
    type = "notebook"
    content = text.replace(/^(bloc-notes|bloc notes|notebook)\s*:?\s*/i, "")
  } else if (lowerText.startsWith("question")) {
    type = "question"
    content = text.replace(/^question\s*:?\s*/i, "")
  } else if (lowerText.startsWith("idée") || lowerText.startsWith("idee") || lowerText.startsWith("idea")) {
    type = "idea"
    content = text.replace(/^(idée|idee|idea)\s*:?\s*/i, "")
  } else if (lowerText.startsWith("lien") || lowerText.startsWith("link")) {
    type = "link"
    content = text.replace(/^(lien|link)\s*:?\s*/i, "")
  }

  const metadata: VoiceCommand["metadata"] = {}

  // Priority detection
  if (/(urgent|urgente|très important|tres important|critique)/i.test(lowerText)) {
    metadata.priority = "urgent"
  } else if (/(important|importante|prioritaire)/i.test(lowerText)) {
    metadata.priority = "high"
  } else if (/(peu important|basse priorité|basse priorite|pas urgent)/i.test(lowerText)) {
    metadata.priority = "low"
  } else {
    metadata.priority = "medium"
  }

  // Size detection
  if (/(petit|petite|rapide|quick|small)/i.test(lowerText)) {
    metadata.size = "S"
  } else if (/(moyen|moyenne|medium)/i.test(lowerText)) {
    metadata.size = "M"
  } else if (/(grand|grande|gros|grosse|long|longue|large)/i.test(lowerText)) {
    metadata.size = "L"
  }

  // Energy type detection
  if (/(concentration|focus|deep work|réflexion|reflexion|complexe)/i.test(lowerText)) {
    metadata.energy = "deep"
  } else if (/(créatif|creatif|créative|creative|design|brainstorm)/i.test(lowerText)) {
    metadata.energy = "creative"
  } else if (/(administratif|admin|email|mail|paperasse)/i.test(lowerText)) {
    metadata.energy = "admin"
  } else if (/(apprentissage|apprendre|learning|formation|étude|etude)/i.test(lowerText)) {
    metadata.energy = "learning"
  } else if (/(simple|facile|routine|light)/i.test(lowerText)) {
    metadata.energy = "light"
  }

  // Date detection
  const today = new Date()
  if (/(aujourd'hui|aujourdhui|today)/i.test(lowerText)) {
    metadata.dueDate = today
  } else if (/(demain|tomorrow)/i.test(lowerText)) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    metadata.dueDate = tomorrow
  } else if (/(après-demain|apres-demain|après demain|apres demain)/i.test(lowerText)) {
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    metadata.dueDate = dayAfterTomorrow
  } else if (/(cette semaine|this week)/i.test(lowerText)) {
    const endOfWeek = new Date(today)
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))
    metadata.dueDate = endOfWeek
  } else if (/(semaine prochaine|next week|la semaine prochaine)/i.test(lowerText)) {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    metadata.dueDate = nextWeek
  }

  // Tag detection (hashtags or "tag" keyword)
  const tagMatches = content.match(/#(\w+)/g)
  if (tagMatches) {
    metadata.tags = tagMatches.map((tag) => tag.slice(1))
  } else {
    // Detect "tag" keyword
    const tagKeywordMatch = content.match(/tag[s]?\s+([a-zA-Z0-9,\s]+)/i)
    if (tagKeywordMatch) {
      metadata.tags = tagKeywordMatch[1].split(/[,\s]+/).filter(Boolean)
    }
  }

  // Clean content from metadata keywords
  content = content
    .replace(
      /(urgent|urgente|très important|tres important|critique|important|importante|prioritaire|peu important|basse priorité|basse priorite|pas urgent)/gi,
      "",
    )
    .replace(/(petit|petite|rapide|quick|small|moyen|moyenne|medium|grand|grande|gros|grosse|long|longue|large)/gi, "")
    .replace(
      /(concentration|focus|deep work|réflexion|reflexion|complexe|créatif|creatif|créative|creative|design|brainstorm|administratif|admin|email|mail|paperasse|apprentissage|apprendre|learning|formation|étude|etude|simple|facile|routine|light)/gi,
      "",
    )
    .replace(
      /(aujourd'hui|aujourdhui|today|demain|tomorrow|après-demain|apres-demain|après demain|apres demain|cette semaine|this week|semaine prochaine|next week|la semaine prochaine)/gi,
      "",
    )
    .replace(/tag[s]?\s+[a-zA-Z0-9,\s]+/gi, "")
    .replace(/\s+/g, " ")
    .trim()

  return {
    type,
    content,
    metadata,
  }
}

export function voiceCommandToTask(command: VoiceCommand): Omit<Task, "id" | "createdAt"> {
  const taskType: TaskType =
    command.type === "question"
      ? "question"
      : command.type === "idea" || command.type === "note"
        ? "idea"
        : command.type === "link"
          ? "link"
          : "task"

  return {
    title: command.content,
    type: taskType,
    tags: command.metadata.tags || [],
    priority: command.metadata.priority || "medium",
    size: command.metadata.size,
    energy: command.metadata.energy,
    dueDate: command.metadata.dueDate,
    subtasks: command.metadata.subtasks,
    completed: false,
  }
}
