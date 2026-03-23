import { useEffect, useState } from "react";
import {
  fetchSensorData,
  fetchMoistureHistory,
  getAutoModeStatus,
  SensorData,
  ChartDataPoint,
} from "@/lib/api";

interface UseSensorDataReturn {
  sensorData: SensorData | null;
  chartData: ChartDataPoint[] | null;
  autoMode: boolean | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching sensor data from backend
 * Handles loading, error states, and auto-refresh
 */
export function useSensorData(
  refreshInterval: number = 5000,
): UseSensorDataReturn {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [autoMode, setAutoMode] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [sensorResponse, historyResponse, autoModeResponse] =
        await Promise.all([
          fetchSensorData(),
          fetchMoistureHistory(),
          getAutoModeStatus(),
        ]);

      setSensorData(sensorResponse);
      setChartData(historyResponse);
      setAutoMode(autoModeResponse);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch sensor data";
      setError(errorMessage);
      setLoading(false);
      console.error("Sensor data fetch error:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    sensorData,
    chartData,
    autoMode,
    loading,
    error,
    refetch: fetchData,
  };
}
