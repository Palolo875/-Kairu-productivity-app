"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Bar, BarChart, Line, LineChart, Scatter, ScatterChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, ZAxis } from "recharts"
import type { Task } from "@/types/task"
import { calculateProductivityStats, generateInsightCards } from "@/lib/insights-calculator"

interface InsightsDashboardProps {
  tasks: Task[]
}

export function InsightsDashboard({ tasks }: InsightsDashboardProps) {
  const [isExporting, setIsExporting] = useState(false)

  const stats = useMemo(() => calculateProductivityStats(tasks), [tasks])
  const insightCards = useMemo(() => generateInsightCards(stats), [stats])

  const energyData = [
    { name: "Deep Work", value: stats.energyDistribution.deep, color: "hsl(var(--chart-1))" },
    { name: "Light", value: stats.energyDistribution.light, color: "hsl(var(--chart-2))" },
    { name: "Creative", value: stats.energyDistribution.creative, color: "hsl(var(--chart-3))" },
    { name: "Admin", value: stats.energyDistribution.admin, color: "hsl(var(--chart-4))" },
    { name: "Learning", value: stats.energyDistribution.learning, color: "hsl(var(--chart-5))" },
  ]

  const priorityData = [
    {
      name: "Urgent",
      total: stats.priorityCompletion.urgent.total,
      completed: stats.priorityCompletion.urgent.completed,
    },
    {
      name: "High",
      total: stats.priorityCompletion.high.total,
      completed: stats.priorityCompletion.high.completed,
    },
    {
      name: "Medium",
      total: stats.priorityCompletion.medium.total,
      completed: stats.priorityCompletion.medium.completed,
    },
    {
      name: "Low",
      total: stats.priorityCompletion.low.total,
      completed: stats.priorityCompletion.low.completed,
    },
  ]

  const handleExportPDF = async () => {
    setIsExporting(true)
    // Simulate PDF export
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("[v0] Exporting insights to PDF...")
    setIsExporting(false)
  }

  return (
    <div
      className="container mx-auto px-4 py-6 space-y-6 animate-fade-in"
      role="region"
      aria-label="Tableau de bord insights"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1">Analyse de votre productivité</p>
        </div>
        <Button onClick={handleExportPDF} disabled={isExporting} className="gap-2">
          <Download className="h-4 w-4" />
          {isExporting ? "Export en cours..." : "Exporter PDF"}
        </Button>
      </div>

      {/* Insight Cards - Design KairuFlow avec jauges visuelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {insightCards.map((card, index) => {
          // Calculer le pourcentage pour la jauge basé sur le type de métrique
          const numericValue = parseFloat(card.value.toString().replace(/[^\d.-]/g, '')) || 0
          
          let percentage = 0
          // Logique spécifique par type de carte
          if (card.id === 'completion-rate') {
            percentage = numericValue // Déjà en %
          } else if (card.id === 'deep-work') {
            // Deep work hours - max 8h par jour considéré comme 100%
            percentage = Math.min((numericValue / 8) * 100, 100)
          } else if (card.id === 'focus-score') {
            // Focus score généralement sur 5 ou 10
            percentage = numericValue <= 5 ? (numericValue / 5) * 100 : (numericValue / 10) * 100
          } else if (card.id === 'weekly-average') {
            // Moyenne hebdo - 5 tâches/jour = 35/semaine considéré comme 100%
            percentage = Math.min((numericValue / 35) * 100, 100)
          } else {
            // Autres métriques - estimation basique
            percentage = Math.min(numericValue, 100)
          }
          
          return (
            <div 
              key={card.id} 
              className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icône et jauge circulaire */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{card.icon}</span>
                <div className="relative w-14 h-14">
                  {/* Jauge circulaire background */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="rgba(226, 232, 240, 0.5)"
                      strokeWidth="4"
                    />
                    {/* Jauge circulaire progress */}
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="#EE9E8E"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - percentage / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                </div>
              </div>
              
              {/* Titre et valeur */}
              <h3 className="text-sm font-medium text-muted-foreground mb-1">{card.title}</h3>
              <div className="text-3xl font-bold text-foreground mb-1">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              
              {/* Tendance */}
              {card.trend && (
                <div className="flex items-center gap-1 mt-3 text-xs">
                  {card.trend === "up" && <TrendingUp className="h-3 w-3" style={{ color: '#8EEDDE' }} />}
                  {card.trend === "down" && <TrendingDown className="h-3 w-3" style={{ color: '#EE9E8E' }} />}
                  {card.trend === "stable" && <Minus className="h-3 w-3" style={{ color: '#8EB8EE' }} />}
                  <span className="text-muted-foreground">{card.trendValue}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts Grid - Design KairuFlow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Distribution - Graphique à bulles */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-1">Distribution par type d'énergie</h3>
          <p className="text-sm text-muted-foreground mb-4">Tâches complétées par catégorie</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" domain={[0, 5]} hide />
              <YAxis type="number" dataKey="y" domain={[0, 5]} hide />
              <ZAxis type="number" dataKey="value" range={[100, 2000]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white rounded-lg shadow-lg p-3 border border-border">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">{data.value} tâches</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter 
                data={energyData.map((item, index) => ({
                  ...item,
                  x: (index % 3) + 1.5,
                  y: Math.floor(index / 3) + 2,
                }))} 
                fill="#EE9E8E"
              >
                {energyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          {/* Légende personnalisée */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {energyData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Completion - Design KairuFlow */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-1">Complétion par priorité</h3>
          <p className="text-sm text-muted-foreground mb-4">Total vs complétées</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="total" fill="rgba(226, 232, 240, 0.8)" name="Total" radius={[12, 12, 0, 0]} />
              <Bar dataKey="completed" fill="#EE9E8E" name="Complétées" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend - Design KairuFlow */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 animate-fade-in lg:col-span-2" style={{ animationDelay: "600ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-1">Tendance hebdomadaire</h3>
          <p className="text-sm text-muted-foreground mb-4">Tâches complétées et heures de Deep Work</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.weeklyTrend}>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#EE9E8E"
                strokeWidth={3}
                name="Tâches complétées"
                dot={{ r: 5, fill: '#EE9E8E' }}
              />
              <Line
                type="monotone"
                dataKey="deepWorkHours"
                stroke="#8EB8EE"
                strokeWidth={3}
                name="Deep Work (h)"
                dot={{ r: 5, fill: '#8EB8EE' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats - Design KairuFlow */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 animate-fade-in" style={{ animationDelay: "700ms" }}>
        <h3 className="text-lg font-semibold text-foreground mb-5">Résumé de la productivité</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground mb-2">Total tâches</p>
            <p className="text-3xl font-bold" style={{ color: '#2d3748' }}>{stats.totalTasks}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-2">Tâches complétées</p>
            <p className="text-3xl font-bold" style={{ color: '#8EEDDE' }}>{stats.completedTasks}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-2">Deep Work cette semaine</p>
            <p className="text-3xl font-bold" style={{ color: '#8EB8EE' }}>{stats.deepWorkHours}h</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-2">Taux Deep Work</p>
            <p className="text-3xl font-bold" style={{ color: '#EE9E8E' }}>{Math.round(stats.deepWorkPercentage)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
