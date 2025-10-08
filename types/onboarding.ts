export type Chronotype = "morning" | "evening" | "flexible"

export interface EnergyPeak {
  start: string // Format "HH:mm"
  end: string
}

export interface EnergyProfile {
  chronotype: Chronotype
  peaks: EnergyPeak[]
  dips: string[] // Format ["HH:mm-HH:mm"]
  caffeineTimes: string[] // Format ["HH:mm"]
  focusDuration: number // Minutes
  breakPreference: number // Minutes
  workDays: number[] // 0-6 (Sunday-Saturday)
}

export interface OnboardingQuestion {
  id: string
  question: string
  type: "single" | "multiple" | "time-range"
  options: {
    value: string
    label: string
    icon?: string
  }[]
}

export interface AppSettings {
  appearance: {
    theme: "light" | "dark" | "auto"
    density: "comfortable" | "compact"
    fontSize: "small" | "medium" | "large"
  }
  behavior: {
    autoArchive: boolean
    autoArchiveDays: number
    enableEnergyTracking: boolean
    enableRealityCheck: boolean
    simplifiedMode: boolean
  }
  data: {
    lastExport?: Date
    lastImport?: Date
  }
}

export const defaultEnergyProfile: EnergyProfile = {
  chronotype: "morning",
  peaks: [{ start: "09:00", end: "12:00" }],
  dips: ["14:00-16:00"],
  caffeineTimes: ["08:00"],
  focusDuration: 90,
  breakPreference: 15,
  workDays: [1, 2, 3, 4, 5],
}

export interface DailyNote {
  date: string
  intention?: string
  notebook?: string
  energyChecks?: Array<{ level: number; timestamp: Date }>
}

export const defaultSettings: AppSettings = {
  appearance: {
    theme: "auto",
    density: "comfortable",
    fontSize: "medium",
  },
  behavior: {
    autoArchive: true,
    autoArchiveDays: 30,
    enableEnergyTracking: true,
    enableRealityCheck: true,
    simplifiedMode: false,
  },
  data: {},
}
