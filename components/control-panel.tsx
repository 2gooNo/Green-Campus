"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Droplets, Cpu } from "lucide-react"

interface ControlPanelProps {
  autoMode: boolean
  onAutoModeChange: (value: boolean) => void
  onWaterNow: () => void
  isWatering: boolean
}

export function ControlPanel({ 
  autoMode, 
  onAutoModeChange, 
  onWaterNow, 
  isWatering 
}: ControlPanelProps) {
  return (
    <Card className="border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Control Panel</h3>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4 flex-1 p-4 rounded-xl bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Auto Mode</p>
              <p className="text-xs text-muted-foreground">AI-controlled irrigation</p>
            </div>
          </div>
          <Switch 
            checked={autoMode} 
            onCheckedChange={onAutoModeChange}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        
        <Button 
          onClick={onWaterNow}
          disabled={isWatering}
          size="lg"
          className="h-auto py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <Droplets className="h-5 w-5 mr-2" />
          {isWatering ? "Watering..." : "Water Now"}
        </Button>
      </div>
    </Card>
  )
}
