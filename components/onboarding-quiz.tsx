"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, SkipForward } from "lucide-react"
import type { OnboardingQuestion, EnergyProfile, Chronotype } from "@/types/onboarding"
import type { Task } from "@/types/task"

const questions: OnboardingQuestion[] = [
  {
    id: "chronotype",
    question: "Quand êtes-vous le plus productif ?",
    type: "single",
    options: [
      { value: "morning", label: "Le matin (6h-12h)", icon: "🌅" },
      { value: "afternoon", label: "L'après-midi (12h-18h)", icon: "☀️" },
      { value: "evening", label: "Le soir (18h-23h)", icon: "🌙" },
      { value: "flexible", label: "Ça varie", icon: "🔄" },
    ],
  },
  {
    id: "peak",
    question: "Votre pic de concentration se situe vers :",
    type: "single",
    options: [
      { value: "08:00-11:00", label: "8h - 11h", icon: "🌄" },
      { value: "09:00-12:00", label: "9h - 12h", icon: "☕" },
      { value: "14:00-17:00", label: "14h - 17h", icon: "🌤️" },
      { value: "20:00-23:00", label: "20h - 23h", icon: "🌃" },
    ],
  },
  {
    id: "dip",
    question: "Quand ressentez-vous un creux d'énergie ?",
    type: "single",
    options: [
      { value: "12:00-14:00", label: "Midi (12h-14h)", icon: "🍽️" },
      { value: "14:00-16:00", label: "Après-midi (14h-16h)", icon: "😴" },
      { value: "16:00-18:00", label: "Fin d'après-midi (16h-18h)", icon: "🥱" },
      { value: "none", label: "Pas de creux notable", icon: "⚡" },
    ],
  },
  {
    id: "caffeine",
    question: "Combien de cafés/thés buvez-vous par jour ?",
    type: "single",
    options: [
      { value: "0", label: "Aucun", icon: "🚫" },
      { value: "1-2", label: "1-2 tasses", icon: "☕" },
      { value: "3-4", label: "3-4 tasses", icon: "☕☕" },
      { value: "5+", label: "5+ tasses", icon: "☕☕☕" },
    ],
  },
  {
    id: "focus",
    question: "Combien de temps pouvez-vous rester concentré ?",
    type: "single",
    options: [
      { value: "30", label: "30 minutes", icon: "⏱️" },
      { value: "60", label: "1 heure", icon: "⏰" },
      { value: "90", label: "1h30 (idéal)", icon: "🎯" },
      { value: "120", label: "2 heures+", icon: "🔥" },
    ],
  },
  {
    id: "workdays",
    question: "Quels jours travaillez-vous généralement ?",
    type: "single",
    options: [
      { value: "1,2,3,4,5", label: "Lun-Ven (classique)", icon: "📅" },
      { value: "0,1,2,3,4,5,6", label: "Tous les jours", icon: "💼" },
      { value: "1,2,3,4", label: "4 jours/semaine", icon: "🎉" },
      { value: "custom", label: "Horaires variables", icon: "🔀" },
    ],
  },
]

interface OnboardingQuizProps {
  onComplete: (profile: EnergyProfile, demoTask?: Task) => void
  onSkip: () => void
}

export function OnboardingQuiz({ onComplete, onSkip }: OnboardingQuizProps) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showTutorial, setShowTutorial] = useState(false)

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      setShowTutorial(true)
    }
  }

  const handleTutorialComplete = () => {
    const profile = buildProfile(answers)
    const demoTask: Task = {
      id: crypto.randomUUID(),
      type: "task",
      title: "Réunion équipe #ProjetX",
      tags: ["ProjetX", "réunion"],
      priority: "high",
      energy: "admin",
      dueDate: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      completed: false,
    }
    onComplete(profile, demoTask)
  }

  const buildProfile = (answers: Record<string, string>): EnergyProfile => {
    const chronotype = (answers.chronotype || "morning") as Chronotype
    const peakRange = answers.peak || "09:00-12:00"
    const [peakStart, peakEnd] = peakRange.split("-")
    const dipRange = answers.dip !== "none" ? [answers.dip || "14:00-16:00"] : []
    const caffeineCount = answers.caffeine || "1-2"
    const caffeineTimes = caffeineCount === "0" ? [] : ["08:00"]
    const focusDuration = Number.parseInt(answers.focus || "90")
    const workDaysStr = answers.workdays || "1,2,3,4,5"
    const workDays = workDaysStr.split(",").map((d) => Number.parseInt(d))

    return {
      chronotype,
      peaks: [{ start: peakStart, end: peakEnd }],
      dips: dipRange,
      caffeineTimes,
      focusDuration,
      breakPreference: 15,
      workDays,
    }
  }

  if (showWelcome) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-around bg-background p-10 text-center">
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-8 flex justify-center">
            <div className="w-80 h-80 relative">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: "#EE9E8E", stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: "#8EEDDE", stopOpacity: 0.8}} />
                  </linearGradient>
                </defs>
                <circle cx="200" cy="250" r="80" fill="#FFDBC3" opacity="0.5"/>
                <rect x="120" y="200" width="40" height="60" rx="20" fill="url(#gradient1)"/>
                <rect x="180" y="150" width="40" height="90" rx="20" fill="url(#gradient1)"/>
                <rect x="240" y="100" width="40" height="120" rx="20" fill="url(#gradient1)"/>
                <circle cx="140" cy="190" r="12" fill="#190933"/>
                <circle cx="200" cy="140" r="12" fill="#190933"/>
                <circle cx="260" cy="90" r="12" fill="#190933"/>
                <path d="M 250 60 Q 255 55, 260 60" stroke="#190933" strokeWidth="2" fill="none"/>
                <path d="M 270 60 Q 275 55, 280 60" stroke="#190933" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 text-foreground">KairuFlow</h1>
          <p className="text-xl text-muted-foreground mb-12">Organisez vos journées, avec douceur.</p>
          <Button 
            onClick={() => setShowWelcome(false)} 
            size="lg"
            className="w-full max-w-sm rounded-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Commencer
          </Button>
        </div>
      </div>
    )
  }

  if (showTutorial) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
        <Card className="w-full max-w-2xl p-8 neuro-soft animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-balance">Parfait ! Voici comment capturer vos tâches</h2>
              <p className="text-muted-foreground text-pretty">Tapez simplement dans la barre de saisie intelligente</p>
            </div>

            <div className="bg-muted/50 rounded-3xl p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Exemple :</p>
                <div className="bg-background rounded-2xl p-4 font-mono text-sm">
                  Réunion demain #ProjetX !urgent @admin
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📅</span>
                  <div>
                    <strong>demain</strong> → Détecte la date automatiquement
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">#</span>
                  <div>
                    <strong>#ProjetX</strong> → Crée un tag
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">!</span>
                  <div>
                    <strong>!urgent</strong> → Définit la priorité
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">@</span>
                  <div>
                    <strong>@admin</strong> → Type d'énergie (admin, deep, creative...)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleTutorialComplete} size="lg" className="rounded-full px-8 gap-2">
                Commencer
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestion + 1} / {questions.length}
            </span>
            <Button variant="ghost" size="sm" onClick={onSkip} className="gap-2">
              Passer
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 neuro-soft animate-in fade-in slide-in-from-bottom-4 duration-500" key={question.id}>
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center text-balance">{question.question}</h2>

            <div className="grid gap-3">
              {question.options.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="lg"
                  className="h-auto py-4 px-6 justify-start text-left rounded-2xl hover:scale-[1.02] transition-transform bg-transparent"
                  onClick={() => handleAnswer(option.value)}
                >
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <span className="text-base">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
