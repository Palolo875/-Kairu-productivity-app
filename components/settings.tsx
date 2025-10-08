"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronDown, Download, Upload, Trash2, Info } from "lucide-react"
import type { AppSettings } from "@/types/onboarding"
import { storage } from "@/lib/storage"

interface SettingsProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
  onClose: () => void
}

export function Settings({ settings, onSettingsChange, onClose }: SettingsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("appearance")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

  const handleExport = () => {
    const data = storage.exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `productivity-app-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportDialog(false)

    const newSettings = {
      ...settings,
      data: { ...settings.data, lastExport: new Date() },
    }
    onSettingsChange(newSettings)
    storage.saveSettings(newSettings)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const success = storage.importData(content)
        if (success) {
          const newSettings = {
            ...settings,
            data: { ...settings.data, lastImport: new Date() },
          }
          onSettingsChange(newSettings)
          storage.saveSettings(newSettings)
          setShowImportDialog(false)
          window.location.reload()
        } else {
          alert("Erreur lors de l'import. Vérifiez le format du fichier.")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClearData = () => {
    localStorage.clear()
    setShowClearDialog(false)
    window.location.reload()
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="container max-w-3xl mx-auto p-4 py-8 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>

        {/* Appearance Section */}
        <Card className="neuro-soft overflow-hidden">
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection("appearance")}
          >
            <h2 className="text-xl font-semibold">Apparence</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSection === "appearance" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "appearance" && (
            <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value: "light" | "dark" | "auto") => {
                    const newSettings = {
                      ...settings,
                      appearance: { ...settings.appearance, theme: value },
                    }
                    onSettingsChange(newSettings)
                    storage.saveSettings(newSettings)
                  }}
                >
                  <SelectTrigger id="theme" className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="density">Densité</Label>
                <Select
                  value={settings.appearance.density}
                  onValueChange={(value: "comfortable" | "compact") => {
                    const newSettings = {
                      ...settings,
                      appearance: { ...settings.appearance, density: value },
                    }
                    onSettingsChange(newSettings)
                    storage.saveSettings(newSettings)
                  }}
                >
                  <SelectTrigger id="density" className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Confortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Taille de police</Label>
                <Select
                  value={settings.appearance.fontSize}
                  onValueChange={(value: "small" | "medium" | "large") => {
                    const newSettings = {
                      ...settings,
                      appearance: { ...settings.appearance, fontSize: value },
                    }
                    onSettingsChange(newSettings)
                    storage.saveSettings(newSettings)
                  }}
                >
                  <SelectTrigger id="fontSize" className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petite</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </Card>

        {/* Behavior Section */}
        <Card className="neuro-soft overflow-hidden">
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection("behavior")}
          >
            <h2 className="text-xl font-semibold">Comportement</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSection === "behavior" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "behavior" && (
            <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoArchive">Archivage automatique</Label>
                  <p className="text-sm text-muted-foreground">Archive les tâches complétées après 30 jours</p>
                </div>
                <Switch
                  id="autoArchive"
                  checked={settings.behavior.autoArchive}
                  onCheckedChange={(checked) => {
                    const newSettings = {
                      ...settings,
                      behavior: { ...settings.behavior, autoArchive: checked },
                    }
                    onSettingsChange(newSettings)
                    storage.saveSettings(newSettings)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="energyTracking">Suivi énergétique</Label>
                  <p className="text-sm text-muted-foreground">Checks horaires et suggestions</p>
                </div>
                <Switch
                  id="energyTracking"
                  checked={settings.behavior.enableEnergyTracking}
                  onCheckedChange={(checked) => {
                    const newSettings = {
                      ...settings,
                      behavior: { ...settings.behavior, enableEnergyTracking: checked },
                    }
                    onSettingsChange(newSettings)
                    storage.saveSettings(newSettings)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="realityCheck">Reality Check</Label>
                  <p className="text-sm text-muted-foreground">Alertes de surcharge énergétique</p>
                </div>
                <Switch
                  id="realityCheck"
                  checked={settings.behavior.enableRealityCheck}
                  onCheckedChange={(checked) => {
                    const newSettings = {
                      ...settings,
                      behavior: { ...settings.behavior, enableRealityCheck: checked },
                    }
                    onSettingsChange(newSettings)
                    storage.saveSettings(newSettings)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="simplifiedMode">Mode simplifié</Label>
                  <p className="text-sm text-muted-foreground">Désactive le suivi énergétique</p>
                </div>
                <Switch
                  id="simplifiedMode"
                  checked={settings.behavior.simplifiedMode}
                  onCheckedChange={(checked) => {
                    const newSettings = {
                      ...settings,
                      behavior: { ...settings.behavior, simplifiedMode: checked },
                    }
                    onSettingsChange(newSettings)
                    storage.saveSettings(newSettings)
                  }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Data Section */}
        <Card className="neuro-soft overflow-hidden">
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection("data")}
          >
            <h2 className="text-xl font-semibold">Données</h2>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === "data" ? "rotate-180" : ""}`} />
          </button>

          {expandedSection === "data" && (
            <div className="p-4 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-2xl bg-transparent"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="w-4 h-4" />
                Exporter les données (JSON)
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-2xl bg-transparent"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="w-4 h-4" />
                Importer les données
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-2xl text-destructive hover:text-destructive bg-transparent"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
                Effacer toutes les données
              </Button>

              {settings.data.lastExport && (
                <p className="text-xs text-muted-foreground">
                  Dernier export : {settings.data.lastExport.toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* About Section */}
        <Card className="neuro-soft overflow-hidden">
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection("about")}
          >
            <h2 className="text-xl font-semibold">À propos</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSection === "about" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "about" && (
            <div className="p-4 pt-0 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Application de Productivité Énergétique</p>
                  <p className="text-xs text-muted-foreground">Version 1.0.0</p>
                  <p className="text-xs text-muted-foreground">
                    Gérez vos tâches en fonction de votre énergie naturelle
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter les données</DialogTitle>
            <DialogDescription>
              Téléchargez toutes vos données (tâches, profil énergétique, paramètres) au format JSON.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleExport}>Exporter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer les données</DialogTitle>
            <DialogDescription>
              Importez un fichier JSON exporté précédemment. Cela remplacera toutes vos données actuelles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleImport}>Choisir un fichier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effacer toutes les données</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos tâches, notes et paramètres seront supprimés définitivement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              Effacer tout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
