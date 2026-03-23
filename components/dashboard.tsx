"use client";

import { useState, useCallback } from "react";
import { SensorCard } from "@/components/sensor-card";
import { ProgressRing } from "@/components/progress-ring";
import { ControlPanel } from "@/components/control-panel";
import { MoistureChart } from "@/components/moisture-chart";
import { Card } from "@/components/ui/card";
import {
  Droplets,
  Thermometer,
  Waves,
  Leaf,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useSensorData } from "@/lib/useSensorData";
import { triggerWatering, setAutoMode } from "@/lib/api";

export function Dashboard() {
  const {
    sensorData,
    chartData,
    autoMode: backendAutoMode,
    loading,
    error,
    refetch,
  } = useSensorData(5000);
  const [localAutoMode, setLocalAutoMode] = useState<boolean | null>(null);
  const [isWatering, setIsWatering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Use backend auto mode if available, otherwise use local state
  const autoMode = backendAutoMode ?? localAutoMode ?? false;
  const moisture = sensorData?.moisture ?? 0;
  const temperature = sensorData?.temperature ?? 0;

  const getMoistureStatus = (value: number) => {
    if (value < 30) return "danger";
    if (value < 60) return "warning";
    return "success";
  };

  const handleWaterNow = useCallback(async () => {
    try {
      setActionError(null);
      setIsWatering(true);
      await triggerWatering();
      // Refetch data after watering
      setTimeout(() => {
        refetch();
        setIsWatering(false);
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to trigger watering";
      setActionError(errorMessage);
      setIsWatering(false);
      console.error("Water now error:", err);
    }
  }, [refetch]);

  const handleAutoModeChange = useCallback(
    async (enabled: boolean) => {
      try {
        setActionError(null);
        setLocalAutoMode(enabled);
        await setAutoMode(enabled);
        refetch();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to set auto mode";
        setActionError(errorMessage);
        setLocalAutoMode(!enabled); // Revert on error
        console.error("Auto mode change error:", err);
      }
    },
    [refetch],
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading sensor data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Card className="border-red-500/50 bg-red-500/5 p-6 max-w-md">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-red-500 mb-2">
                Failed to Load Sensor Data
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => refetch()}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Error Alert */}
        {actionError && (
          <Card className="border-amber-500/50 bg-amber-500/5 p-4">
            <div className="flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-700">{actionError}</p>
              </div>
              <button
                onClick={() => setActionError(null)}
                className="text-amber-500 hover:text-amber-600 text-sm"
              >
                ✕
              </button>
            </div>
          </Card>
        )}

        {/* Header */}
        <header className="flex items-center gap-3 pb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
              Smart Green Campus
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered irrigation system
            </p>
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
            value={sensorData?.isWatering ? "Watering" : "Idle"}
            status={sensorData?.isWatering ? "success" : "neutral"}
            pulse={sensorData?.isWatering}
          />
        </div>

        {/* Main Visual - Progress Ring */}
        <Card className="border-border bg-card p-6 md:p-8">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-6">
              Plant Health Status
            </h3>
            <ProgressRing
              progress={Math.round(moisture)}
              size={220}
              strokeWidth={14}
            />
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
          onAutoModeChange={handleAutoModeChange}
          onWaterNow={handleWaterNow}
          isWatering={isWatering}
        />

        {/* Moisture Chart */}
        {chartData && <MoistureChart data={chartData} />}
      </div>
    </div>
  );
}
