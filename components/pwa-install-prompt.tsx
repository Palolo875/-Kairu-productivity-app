"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      const lastDismissed = localStorage.getItem("pwa-install-dismissed")
      const daysSinceDismiss = lastDismissed 
        ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
        : 999
      
      if (daysSinceDismiss > 7) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md lg:bottom-4">
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold">Installer KairuFlow</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Installez l'application pour un accès rapide et une utilisation hors ligne
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Installer
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  )
}
