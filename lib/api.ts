/**
 * Backend API integration
 * Replace the BASE_URL with your actual backend URL
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface SensorData {
  moisture: number;
  temperature: number;
  isWatering: boolean;
  timestamp: string;
}

export interface ChartDataPoint {
  time: string;
  moisture: number;
}

/**
 * Fetch current sensor data from backend
 */
export async function fetchSensorData(): Promise<SensorData> {
  const response = await fetch(`${BASE_URL}/sensors/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch historical moisture data for chart (last 12 hours)
 */
export async function fetchMoistureHistory(): Promise<ChartDataPoint[]> {
  const response = await fetch(`${BASE_URL}/sensors/history?hours=12`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch moisture history: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Trigger watering action on backend
 */
export async function triggerWatering(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(`${BASE_URL}/irrigation/water-now`, {
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
  const response = await fetch(`${BASE_URL}/irrigation/auto-mode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    throw new Error(`Failed to set auto mode: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get auto mode status from backend
 */
export async function getAutoModeStatus(): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/irrigation/auto-mode`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch auto mode status: ${response.statusText}`);
  }

  const data = await response.json();
  return data.enabled;
}
