import type { Task, EnergyType } from "@/types/task"
import type { WeeklyCell, WeeklySuggestion, WeeklyStats, WeeklyData } from "@/types/weekly"
import { energyEmojis } from "@/types/task"

const energyTypes: EnergyType[] = ["deep", "light", "creative", "admin", "learning"]

export function generateWeeklyData(tasks: Task[], weekStart: Date): WeeklyData {
  const cells: WeeklyCell[] = []
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Initialize cells for 7 days x 5 energy types
  for (let day = 0; day < 7; day++) {
    for (const energyType of energyTypes) {
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate || task.archived) return false
        const taskDay = task.dueDate.getDay()
        const taskDate = task.dueDate
        return taskDay === day && taskDate >= weekStart && taskDate < weekEnd && task.energy === energyType
      })

      const totalHours = dayTasks.reduce((sum, task) => {
        const hours = task.size === "S" ? 0.5 : task.size === "M" ? 2 : task.size === "L" ? 4 : 1
        return sum + hours
      }, 0)

      const intensity = Math.min(100, (totalHours / 8) * 100)

      cells.push({
        day,
        energyType,
        tasks: dayTasks,
        totalHours,
        intensity,
      })
    }
  }

  const suggestions = generateSuggestions(cells)
  const stats = calculateStats(cells, tasks)

  return {
    weekStart,
    cells,
    suggestions,
    stats,
  }
}

function generateSuggestions(cells: WeeklyCell[]): WeeklySuggestion[] {
  const suggestions: WeeklySuggestion[] = []

  // Check for overloaded days
  for (let day = 0; day < 7; day++) {
    const dayCells = cells.filter((c) => c.day === day)
    const totalHours = dayCells.reduce((sum, c) => sum + c.totalHours, 0)

    if (totalHours > 10) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: "overload",
        day,
        message: `Surcharge détectée : ${totalHours.toFixed(1)}h prévues. Considérez redistribuer certaines tâches.`,
      })
    }

    // Check for too many admin tasks
    const adminCell = dayCells.find((c) => c.energyType === "admin")
    if (adminCell && adminCell.totalHours > 3) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: "balance",
        day,
        message: `Trop de tâches admin (${adminCell.totalHours.toFixed(1)}h). Bloquez du temps pour le Deep Work.`,
        action: {
          type: "block-time",
          data: { energyType: "deep", suggestedHours: 2 },
        },
      })
    }

    // Check for lack of deep work
    const deepCell = dayCells.find((c) => c.energyType === "deep")
    if (!deepCell || deepCell.totalHours < 2) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: "optimize",
        day,
        message: `Peu de Deep Work prévu. Bloquez 2-3h le matin pour les tâches importantes.`,
        action: {
          type: "block-time",
          data: { energyType: "deep", suggestedHours: 2 },
        },
      })
    }
  }

  // Check for unbalanced week
  const deepWorkDays = cells.filter((c) => c.energyType === "deep" && c.totalHours > 0).length
  if (deepWorkDays < 3) {
    suggestions.push({
      id: crypto.randomUUID(),
      type: "balance",
      day: -1,
      message: `Seulement ${deepWorkDays} jours avec du Deep Work. Visez au moins 3-4 jours pour une semaine équilibrée.`,
    })
  }

  return suggestions
}

function calculateStats(cells: WeeklyCell[], allTasks: Task[]): WeeklyStats {
  const deepWorkHours = cells.filter((c) => c.energyType === "deep").reduce((sum, c) => sum + c.totalHours, 0)
  const lightWorkHours = cells.filter((c) => c.energyType === "light").reduce((sum, c) => sum + c.totalHours, 0)
  const creativeHours = cells.filter((c) => c.energyType === "creative").reduce((sum, c) => sum + c.totalHours, 0)
  const adminHours = cells.filter((c) => c.energyType === "admin").reduce((sum, c) => sum + c.totalHours, 0)
  const learningHours = cells.filter((c) => c.energyType === "learning").reduce((sum, c) => sum + c.totalHours, 0)

  const dayHours = Array.from({ length: 7 }, (_, day) => {
    return cells.filter((c) => c.day === day).reduce((sum, c) => sum + c.totalHours, 0)
  })

  const mostProductiveDay = dayHours.indexOf(Math.max(...dayHours))
  const leastProductiveDay = dayHours.indexOf(Math.min(...dayHours.filter((h) => h > 0)))

  const totalHours = deepWorkHours + lightWorkHours + creativeHours + adminHours + learningHours
  const idealBalance = totalHours / 5
  const variance = energyTypes.reduce((sum, type) => {
    const hours = cells.filter((c) => c.energyType === type).reduce((s, c) => s + c.totalHours, 0)
    return sum + Math.abs(hours - idealBalance)
  }, 0)

  const balanceScore = Math.max(0, 100 - (variance / totalHours) * 100)

  const weekTasks = cells.flatMap((c) => c.tasks)
  const uniqueTasks = Array.from(new Set(weekTasks.map((t) => t.id))).map((id) => weekTasks.find((t) => t.id === id)!)

  return {
    totalTasks: uniqueTasks.length,
    completedTasks: uniqueTasks.filter((t) => t.completed).length,
    deepWorkHours,
    lightWorkHours,
    creativeHours,
    adminHours,
    learningHours,
    mostProductiveDay,
    leastProductiveDay,
    balanceScore: Math.round(balanceScore),
  }
}

export function exportWeeklyToPDF(data: WeeklyData): void {
  // Simple PDF export using window.print with custom styles
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const { cells, suggestions, stats, weekStart } = data

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vue Hebdomadaire - ${weekStart.toLocaleDateString("fr-FR")}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
            h1 { color: #e89ba0; font-size: 24px; margin-bottom: 10px; }
            h2 { color: #8b9a7d; font-size: 18px; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background: #f5f5f5; font-weight: 600; }
            .suggestion { margin: 10px 0; padding: 10px; background: #fff8f0; border-left: 3px solid #e89ba0; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { padding: 15px; background: #f9f9f9; border-radius: 8px; }
            .stat-label { font-size: 12px; color: #666; }
            .stat-value { font-size: 24px; font-weight: 600; color: #333; margin-top: 5px; }
          }
        </style>
      </head>
      <body>
        <h1>Vue Hebdomadaire</h1>
        <p>Semaine du ${weekStart.toLocaleDateString("fr-FR")}</p>
        
        <h2>Statistiques</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-label">Tâches</div>
            <div class="stat-value">${stats.completedTasks}/${stats.totalTasks}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Deep Work</div>
            <div class="stat-value">${stats.deepWorkHours.toFixed(1)}h</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Équilibre</div>
            <div class="stat-value">${stats.balanceScore}%</div>
          </div>
        </div>

        <h2>Répartition Hebdomadaire</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              ${["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => `<th>${day}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${energyTypes
              .map(
                (type) => `
              <tr>
                <td>${energyEmojis[type]} ${type}</td>
                ${Array.from({ length: 7 }, (_, day) => {
                  const cell = cells.find((c) => c.day === day && c.energyType === type)
                  return `<td>${cell ? cell.totalHours.toFixed(1) + "h" : "-"}</td>`
                }).join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <h2>Suggestions</h2>
        ${suggestions
          .map(
            (s) => `
          <div class="suggestion">
            <strong>${s.type === "overload" ? "⚠️" : s.type === "balance" ? "⚖️" : "💡"}</strong>
            ${s.message}
          </div>
        `,
          )
          .join("")}
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}
