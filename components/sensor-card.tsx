"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SensorCardProps {
  icon: React.ReactNode
  label: string
  value: string
  status?: "success" | "warning" | "danger" | "neutral"
  pulse?: boolean
}

export function SensorCard({ icon, label, value, status = "neutral", pulse = false }: SensorCardProps) {
  const statusColors = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
    neutral: "text-sky-400",
  }

  const statusBg = {
    success: "bg-emerald-400/10",
    warning: "bg-amber-400/10",
    danger: "bg-red-400/10",
    neutral: "bg-sky-400/10",
  }

  return (
    <Card className="relative overflow-hidden border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("text-3xl font-semibold tracking-tight", statusColors[status])}>
            {value}
          </p>
        </div>
        <div className={cn(
          "rounded-xl p-3",
          statusBg[status],
          pulse && "animate-pulse"
        )}>
          <div className={statusColors[status]}>{icon}</div>
        </div>
      </div>
    </Card>
  )
}
