"use client"

import { cn } from "@/lib/utils"

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({ 
  progress, 
  size = 200, 
  strokeWidth = 12,
  className 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getColor = (value: number) => {
    if (value < 30) return { stroke: "#f87171", text: "text-red-400", label: "Critical" }
    if (value < 60) return { stroke: "#fbbf24", text: "text-amber-400", label: "Moderate" }
    return { stroke: "#34d399", text: "text-emerald-400", label: "Optimal" }
  }

  const { stroke, text, label } = getColor(progress)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn("text-5xl font-bold tracking-tight", text)}>
          {progress}%
        </span>
        <span className="text-sm text-muted-foreground mt-1">{label}</span>
      </div>
    </div>
  )
}
