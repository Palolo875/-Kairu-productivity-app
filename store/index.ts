import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Task } from "@/types/task"
import type { DailyNote, EnergyProfile, AppSettings } from "@/types/onboarding"
import { StorageService } from "@/services/StorageService"
import { calculateHybridScore } from "@/services/OpportunityScore"
import { defaultEnergyProfile, defaultSettings } from "@/types/onboarding"

interface AppState {
  cards: Task[]
  dailyNotes: DailyNote[]
  energyProfile: EnergyProfile
  settings: AppSettings
  isLoading: boolean
  isInitialized: boolean

  initializeStore: () => Promise<void>
  
  addCard: (card: Task) => Promise<void>
  updateCard: (id: string, updates: Partial<Task>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  toggleCard: (id: string) => Promise<void>
  archiveCard: (id: string) => Promise<void>
  getHybridScore: (task: Task) => number
  
  saveDailyNote: (note: DailyNote) => Promise<void>
  getDailyNote: (date: string) => Promise<DailyNote | undefined>
  
  updateEnergyProfile: (profile: Partial<EnergyProfile>) => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  
  searchCards: (query: string) => Promise<Task[]>
  getCardsByTag: (tag: string) => Promise<Task[]>
  getCardsByEnergy: (energy: string) => Promise<Task[]>
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cards: [],
      dailyNotes: [],
      energyProfile: defaultEnergyProfile,
      settings: defaultSettings,
      isLoading: false,
      isInitialized: false,

      initializeStore: async () => {
        set({ isLoading: true })
        
        await StorageService.migrateFromLocalStorage()
        
        const [cards, energyProfile, settings] = await Promise.all([
          StorageService.getCards(),
          StorageService.getEnergyProfile(),
          StorageService.getSettings(),
        ])

        set({
          cards: cards || [],
          energyProfile: energyProfile || defaultEnergyProfile,
          settings: settings || defaultSettings,
          isLoading: false,
          isInitialized: true,
        })
      },

      addCard: async (card: Task) => {
        await StorageService.addCard(card)
        const cards = await StorageService.getCards()
        set({ cards })
      },

      updateCard: async (id: string, updates: Partial<Task>) => {
        await StorageService.updateCard(id, updates)
        const cards = await StorageService.getCards()
        set({ cards })
      },

      deleteCard: async (id: string) => {
        await StorageService.deleteCard(id)
        const cards = await StorageService.getCards()
        set({ cards })
      },

      toggleCard: async (id: string) => {
        const card = await StorageService.getCardById(id)
        if (card) {
          await StorageService.updateCard(id, { completed: !card.completed })
          const cards = await StorageService.getCards()
          set({ cards })
        }
      },

      archiveCard: async (id: string) => {
        await StorageService.updateCard(id, { archived: true, archivedAt: new Date() })
        const cards = await StorageService.getCards()
        set({ cards })
      },

      getHybridScore: (task: Task) => {
        const { energyProfile } = get()
        return calculateHybridScore(task, energyProfile, new Date())
      },

      saveDailyNote: async (note: DailyNote) => {
        await StorageService.saveDailyNote(note)
        const dailyNotes = await StorageService.getAllDailyNotes()
        set({ dailyNotes })
      },

      getDailyNote: async (date: string) => {
        return await StorageService.getDailyNote(date)
      },

      updateEnergyProfile: async (profileUpdates: Partial<EnergyProfile>) => {
        const currentProfile = get().energyProfile
        const newProfile = { ...currentProfile, ...profileUpdates }
        await StorageService.saveEnergyProfile(newProfile)
        set({ energyProfile: newProfile })
      },

      updateSettings: async (settingsUpdates: Partial<AppSettings>) => {
        const currentSettings = get().settings
        const newSettings = { ...currentSettings, ...settingsUpdates }
        await StorageService.saveSettings(newSettings)
        set({ settings: newSettings })
      },

      searchCards: async (query: string) => {
        return await StorageService.searchCards(query)
      },

      getCardsByTag: async (tag: string) => {
        return await StorageService.getCardsByTag(tag)
      },

      getCardsByEnergy: async (energy: string) => {
        return await StorageService.getCardsByEnergy(energy)
      },
    }),
    {
      name: "kairuflow-store",
      partialize: (state) => ({
        energyProfile: state.energyProfile,
        settings: state.settings,
      }),
    }
  )
)
