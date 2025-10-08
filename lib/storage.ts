import type { Task } from "@/types/task"
import type { EnergyProfile, AppSettings, DailyNote } from "@/types/onboarding"
import { defaultEnergyProfile, defaultSettings } from "@/types/onboarding"

const STORAGE_KEYS = {
  TASKS: "productivity-app-tasks",
  ENERGY_PROFILE: "productivity-app-energy-profile",
  SETTINGS: "productivity-app-settings",
  DAILY_NOTES: "productivity-app-daily-notes",
  ONBOARDING_COMPLETED: "productivity-app-onboarding-completed",
} as const

export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.TASKS)
    if (!data) return []
    try {
      const tasks = JSON.parse(data)
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        archivedAt: task.archivedAt ? new Date(task.archivedAt) : undefined,
      }))
    } catch {
      return []
    }
  },

  saveTasks: (tasks: Task[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
  },

  // Energy Profile
  getEnergyProfile: (): EnergyProfile => {
    if (typeof window === "undefined") return defaultEnergyProfile
    const data = localStorage.getItem(STORAGE_KEYS.ENERGY_PROFILE)
    if (!data) return defaultEnergyProfile
    try {
      return JSON.parse(data)
    } catch {
      return defaultEnergyProfile
    }
  },

  saveEnergyProfile: (profile: EnergyProfile) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.ENERGY_PROFILE, JSON.stringify(profile))
  },

  // Settings
  getSettings: (): AppSettings => {
    if (typeof window === "undefined") return defaultSettings
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (!data) return defaultSettings
    try {
      const settings = JSON.parse(data)
      return {
        ...defaultSettings,
        ...settings,
        data: {
          ...settings.data,
          lastExport: settings.data?.lastExport ? new Date(settings.data.lastExport) : undefined,
          lastImport: settings.data?.lastImport ? new Date(settings.data.lastImport) : undefined,
        },
      }
    } catch {
      return defaultSettings
    }
  },

  saveSettings: (settings: AppSettings) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  },

  // Daily Notes
  getDailyNotes: (): Record<string, DailyNote> => {
    if (typeof window === "undefined") return {}
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_NOTES)
    if (!data) return {}
    try {
      const notes = JSON.parse(data)
      const result: Record<string, DailyNote> = {}
      for (const [key, note] of Object.entries(notes)) {
        result[key] = {
          ...(note as any),
          date: new Date((note as any).date),
          energyChecks: (note as any).energyChecks.map((check: any) => ({
            ...check,
            time: new Date(check.time),
          })),
        }
      }
      return result
    } catch {
      return {}
    }
  },

  saveDailyNotes: (notes: Record<string, DailyNote>) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify(notes))
  },

  // Onboarding
  isOnboardingCompleted: (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === "true"
  },

  setOnboardingCompleted: (completed: boolean) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed ? "true" : "false")
  },

  // Export/Import
  exportData: () => {
    const data = {
      tasks: storage.getTasks(),
      energyProfile: storage.getEnergyProfile(),
      settings: storage.getSettings(),
      dailyNotes: storage.getDailyNotes(),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  },

  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString)
      if (data.tasks) storage.saveTasks(data.tasks)
      if (data.energyProfile) storage.saveEnergyProfile(data.energyProfile)
      if (data.settings) storage.saveSettings(data.settings)
      if (data.dailyNotes) storage.saveDailyNotes(data.dailyNotes)
      return true
    } catch {
      return false
    }
  },
}
