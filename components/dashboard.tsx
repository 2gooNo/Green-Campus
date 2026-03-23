"use client"

import { useState, useEffect, useCallback } from "react"
import { SensorCard } from "@/components/sensor-card"
import { ProgressRing } from "@/components/progress-ring"
import { ControlPanel } from "@/components/control-panel"
import { MoistureChart } from "@/components/moisture-chart"
import { Card } from "@/components/ui/card"
import { Droplets, Thermometer, Waves, Leaf } from "lucide-react"

const generateInitialData = () => {
  const data = []
  for (let i = 11; i >= 0; i--) {
    const hour = new Date()
    hour.setHours(hour.getHours() - i)
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      moisture: Math.floor(Math.random() * 30) + 35,
    })
  }
  return data
}

export function Dashboard() {
  const [moisture, setMoisture] = useState(45)
  const [temperature, setTemperature] = useState(28)
  const [autoMode, setAutoMode] = useState(true)
  const [isWatering, setIsWatering] = useState(false)
  const [chartData, setChartData] = useState(generateInitialData)

  const getMoistureStatus = (value: number) => {
    if (value < 30) return "danger"
    if (value < 60) return "warning"
    return "success"
  }

  const handleWaterNow = useCallback(() => {
    setIsWatering(true)
    
    // Simulate watering - gradually increase moisture
    const interval = setInterval(() => {
      setMoisture(prev => {
        const newValue = Math.min(prev + 3, 85)
        if (newValue >= 85) {
          clearInterval(interval)
          setIsWatering(false)
        }
        return newValue
      })
    }, 300)
  }, [])

  // Auto-water when moisture is low in auto mode
  useEffect(() => {
    if (autoMode && moisture < 25 && !isWatering) {
      handleWaterNow()
    }
  }, [autoMode, moisture, isWatering, handleWaterNow])

  // Simulate natural moisture decrease and temperature fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWatering) {
        setMoisture(prev => Math.max(prev - 0.5, 15))
      }
      setTemperature(prev => prev + (Math.random() - 0.5) * 0.5)
    }, 2000)
    return () => clearInterval(interval)
  }, [isWatering])

  // Update chart data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)]
        const now = new Date()
        newData.push({
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          moisture: Math.round(moisture),
        })
        return newData
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [moisture])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3 pb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
              Smart Green Campus
            </h1>
            <p className="text-sm text-muted-foreground">AI-powered irrigation system</p>
          </div>
        </header>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SensorCard
            icon={<Droplets className="h-5 w-5" />}
            label="Soil Moisture"
            value={`${Math.round(moisture)}%`}
            status={getMoistureStatus(moisture)}
          />
          <SensorCard
            icon={<Thermometer className="h-5 w-5" />}
            label="Temperature"
            value={`${temperature.toFixed(1)}°C`}
            status="neutral"
          />
          <SensorCard
            icon={<Waves className="h-5 w-5" />}
            label="Status"
            value={isWatering ? "Watering" : "Idle"}
            status={isWatering ? "success" : "neutral"}
            pulse={isWatering}
          />
        </div>

        {/* Main Visual - Progress Ring */}
        <Card className="border-border bg-card p-6 md:p-8">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-6">Plant Health Status</h3>
            <ProgressRing progress={Math.round(moisture)} size={220} strokeWidth={14} />
            <p className="text-sm text-muted-foreground mt-6 text-center max-w-xs">
              {moisture < 30 
                ? "Soil moisture critically low. Water immediately!"
                : moisture < 60 
                  ? "Moderate moisture level. Consider watering soon."
                  : "Optimal moisture level. Plants are happy!"}
            </p>
          </div>
        </Card>

        {/* Control Panel */}
        <ControlPanel
          autoMode={autoMode}
          onAutoModeChange={setAutoMode}
          onWaterNow={handleWaterNow}
          isWatering={isWatering}
        />

        {/* Moisture Chart */}
        <MoistureChart data={chartData} />
      </div>
    </div>
  )
}
