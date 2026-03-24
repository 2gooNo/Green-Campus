/**
 * Backend API integration
 * Replace the BASE_URL with your actual backend URL
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://green-campus-be.onrender.com";

export interface SensorData {
  moisture: number;
  temperature: number;
  isWatering: boolean;
  timestamp: string;
}

interface SensorApiResponse {
  moisture?: number;
  temperature?: number;
  isWatering?: boolean;
  status?: string;
  timestamp?: string;
}

export interface ChartDataPoint {
  time: string;
  moisture: number;
  timestamp: string;
}

interface MoistureHistoryApiPoint {
  moisture: number;
  timestamp: string;
}

/**
 * Fetch current sensor data from backend
 */
export async function fetchSensorData(): Promise<SensorData> {
  const response = await fetch(`${BASE_URL}/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
  }

  const data = (await response.json()) as SensorApiResponse;
  const normalizedStatus = (data.status || "").toUpperCase();

  return {
    moisture: typeof data.moisture === "number" ? data.moisture : 0,
    temperature: typeof data.temperature === "number" ? data.temperature : 0,
    isWatering:
      typeof data.isWatering === "boolean"
        ? data.isWatering
        : normalizedStatus === "WATERING",
    timestamp: data.timestamp || new Date().toISOString(),
  };
}

/**
 * Fetch historical moisture data for chart (last 12 hours)
 */
export async function fetchMoistureHistory(): Promise<ChartDataPoint[]> {
  const response = await fetch(`${BASE_URL}/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch moisture history: ${response.statusText}`);
  }

  const history = (await response.json()) as MoistureHistoryApiPoint[];

  // Normalize backend data for the chart and render oldest to newest.
  return history
    .filter(
      (point) =>
        typeof point.moisture === "number" &&
        typeof point.timestamp === "string",
    )
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    .map((point) => ({
      moisture: point.moisture,
      timestamp: point.timestamp,
      time: new Date(point.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
}

/**
 * Trigger watering action on backend
 */
export async function triggerWatering(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(`${BASE_URL}/water`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger watering: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Set auto mode on backend
 */
export async function setAutoMode(
  enabled: boolean,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${BASE_URL}/toggle-auto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ auto_mode: enabled }),
  });
  console.log("Setting auto mode to:", enabled);
  if (!response.ok) {
    throw new Error(`Failed to set auto mode: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get auto mode status from backend
 */
export async function getAutoModeStatus(): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch auto mode status: ${response.statusText}`);
  }

  const data = await response.json();
  return Boolean(data.auto_mode);
}
