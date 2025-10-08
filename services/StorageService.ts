import Dexie, { type Table } from "dexie"
import type { Task } from "@/types/task"
import type { DailyNote, EnergyProfile, AppSettings } from "@/types/onboarding"

export interface Card extends Task {}

interface StoredEnergyProfile extends EnergyProfile {
  id: string
}

interface StoredAppSettings extends AppSettings {
  id: string
}

class KairuDB extends Dexie {
  cards!: Table<Card, string>
  dailyNotes!: Table<DailyNote, string>
  energyProfiles!: Table<StoredEnergyProfile, string>
  settings!: Table<StoredAppSettings, string>

  constructor() {
    super("KairuFlowDB")
    this.version(1).stores({
      cards: "id, *tags, archived, priority, energy, dueDate, createdAt",
      dailyNotes: "date",
      energyProfiles: "id",
      settings: "id",
    })
  }
}

const db = new KairuDB()

export const StorageService = {
  async addCard(card: Card): Promise<string> {
    return await db.cards.add(card)
  },

  async getCards(): Promise<Card[]> {
    return await db.cards.toArray()
  },

  async getActiveCards(): Promise<Card[]> {
    return await db.cards.filter((card) => !card.archived).toArray()
  },

  async getArchivedCards(): Promise<Card[]> {
    return await db.cards.filter((card) => card.archived === true).toArray()
  },

  async getCardById(id: string): Promise<Card | undefined> {
    return await db.cards.get(id)
  },

  async updateCard(id: string, updates: Partial<Card>): Promise<number> {
    return await db.cards.update(id, updates)
  },

  async deleteCard(id: string): Promise<void> {
    await db.cards.delete(id)
  },

  async searchCards(query: string): Promise<Card[]> {
    const lowerQuery = query.toLowerCase()
    return await db.cards
      .filter(
        (card) =>
          card.title.toLowerCase().includes(lowerQuery) ||
          card.description?.toLowerCase().includes(lowerQuery) ||
          card.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      .toArray()
  },

  async getCardsByTag(tag: string): Promise<Card[]> {
    return await db.cards.where("tags").equals(tag).toArray()
  },

  async getCardsByEnergy(energy: string): Promise<Card[]> {
    return await db.cards.where("energy").equals(energy).toArray()
  },

  async getDailyNote(date: string): Promise<DailyNote | undefined> {
    return await db.dailyNotes.get(date)
  },

  async saveDailyNote(note: DailyNote): Promise<string> {
    return await db.dailyNotes.put(note)
  },

  async getAllDailyNotes(): Promise<DailyNote[]> {
    return await db.dailyNotes.toArray()
  },

  async getEnergyProfile(): Promise<EnergyProfile | undefined> {
    const stored = await db.energyProfiles.get("profile")
    if (!stored) return undefined
    const { id, ...profile } = stored
    return profile
  },

  async saveEnergyProfile(profile: EnergyProfile): Promise<string> {
    const stored: StoredEnergyProfile = { ...profile, id: "profile" }
    await db.energyProfiles.put(stored)
    return "profile"
  },

  async getSettings(): Promise<AppSettings | undefined> {
    const stored = await db.settings.get("settings")
    if (!stored) return undefined
    const { id, ...settings } = stored
    return settings
  },

  async saveSettings(settings: AppSettings): Promise<string> {
    const stored: StoredAppSettings = { ...settings, id: "settings" }
    await db.settings.put(stored)
    return "settings"
  },

  async exportData() {
    const data = {
      cards: await db.cards.toArray(),
      dailyNotes: await db.dailyNotes.toArray(),
      energyProfile: await this.getEnergyProfile(),
      settings: await this.getSettings(),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  },

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString)
      
      if (data.cards) {
        await db.cards.clear()
        await db.cards.bulkAdd(data.cards)
      }
      
      if (data.dailyNotes) {
        await db.dailyNotes.clear()
        await db.dailyNotes.bulkAdd(data.dailyNotes)
      }
      
      if (data.energyProfile) {
        await this.saveEnergyProfile(data.energyProfile)
      }
      
      if (data.settings) {
        await this.saveSettings(data.settings)
      }
      
      return true
    } catch (error) {
      console.error("Import failed:", error)
      return false
    }
  },

  async migrateFromLocalStorage() {
    const STORAGE_KEYS = {
      TASKS: "productivity-app-tasks",
      ENERGY_PROFILE: "productivity-app-energy-profile",
      SETTINGS: "productivity-app-settings",
      DAILY_NOTES: "productivity-app-daily-notes",
    }

    try {
      const tasksData = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (tasksData) {
        const tasks = JSON.parse(tasksData)
        const cardsCount = await db.cards.count()
        if (cardsCount === 0) {
          await db.cards.bulkAdd(tasks)
          console.log("[Migration] Tasks migrated to IndexedDB")
        }
      }

      const energyData = localStorage.getItem(STORAGE_KEYS.ENERGY_PROFILE)
      if (energyData) {
        const profile = JSON.parse(energyData)
        const existingProfile = await this.getEnergyProfile()
        if (!existingProfile) {
          await this.saveEnergyProfile(profile)
          console.log("[Migration] Energy profile migrated to IndexedDB")
        }
      }

      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (settingsData) {
        const settings = JSON.parse(settingsData)
        const existingSettings = await this.getSettings()
        if (!existingSettings) {
          await this.saveSettings(settings)
          console.log("[Migration] Settings migrated to IndexedDB")
        }
      }

      const notesData = localStorage.getItem(STORAGE_KEYS.DAILY_NOTES)
      if (notesData) {
        const notes = JSON.parse(notesData)
        const notesCount = await db.dailyNotes.count()
        if (notesCount === 0) {
          await db.dailyNotes.bulkAdd(notes)
          console.log("[Migration] Daily notes migrated to IndexedDB")
        }
      }

      console.log("[Migration] LocalStorage to IndexedDB migration complete")
    } catch (error) {
      console.error("[Migration] Error during migration:", error)
    }
  },

  async clearAll(): Promise<void> {
    await db.cards.clear()
    await db.dailyNotes.clear()
    await db.energyProfiles.clear()
    await db.settings.clear()
  },
}

export default db
