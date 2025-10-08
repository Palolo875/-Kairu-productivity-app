"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts"
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

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, index) => (
          <Card key={card.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <span className="text-2xl">{card.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              {card.trend && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {card.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {card.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {card.trend === "stable" && <Minus className="h-3 w-3 text-yellow-500" />}
                  <span className="text-muted-foreground">{card.trendValue}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Distribution */}
        <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle>Distribution par type d'énergie</CardTitle>
            <CardDescription>Tâches complétées par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={energyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {energyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Completion */}
        <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle>Complétion par priorité</CardTitle>
            <CardDescription>Total vs complétées</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Complétées" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="animate-fade-in lg:col-span-2" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle>Tendance hebdomadaire</CardTitle>
            <CardDescription>Tâches complétées et heures de Deep Work</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyTrend}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Tâches complétées"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="deepWorkHours"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Deep Work (h)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="animate-fade-in" style={{ animationDelay: "700ms" }}>
        <CardHeader>
          <CardTitle>Résumé de la productivité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total tâches</p>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tâches complétées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deep Work cette semaine</p>
              <p className="text-2xl font-bold text-blue-600">{stats.deepWorkHours}h</p>
            </div>
            <div>
              <p className="text-muted-foreground">Taux Deep Work</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(stats.deepWorkPercentage)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
