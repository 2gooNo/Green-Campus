# Backend Integration Guide

## Overview

The Green Campus dashboard has been refactored to fetch real sensor data from a backend API instead of using mock/random data. This guide explains the changes and how to set up the backend.

## Architecture

### Frontend Components

#### 1. **API Service** (`lib/api.ts`)

Core API client for all backend communication:

- `fetchSensorData()` - Gets current moisture, temperature, and watering status
- `fetchMoistureHistory()` - Gets historical data for the chart (last 12 hours)
- `triggerWatering()` - Sends watering command to backend
- `setAutoMode(enabled)` - Enables/disables auto mode on backend
- `getAutoModeStatus()` - Checks current auto mode status

**Base URL:** Uses `NEXT_PUBLIC_API_URL` environment variable

#### 2. **Custom Hook** (`lib/useSensorData.ts`)

`useSensorData(refreshInterval?)` hook that:

- Fetches sensor data on component mount
- Auto-refreshes data at specified interval (default 5 seconds)
- Manages loading, error, and success states
- Provides `refetch()` function for manual refresh
- Handles all error cases gracefully

#### 3. **Dashboard Component** (`components/dashboard.tsx`)

Updated to:

- Use `useSensorData` hook for data management
- Handle loading and error states with proper UI feedback
- Call API functions when user performs actions (water now, toggle auto mode)
- Display real backend data instead of simulated values

## Environment Setup

### 1. Create `.env.local`

Copy from `.env.example` and set your backend URL:

```bash
copy .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Note:** If deploying to production, update the URL to match your backend domain.

## Backend API Requirements

Your backend should provide these endpoints:

### 1. **GET `/api/sensors/current`**

Returns current sensor readings

**Response:**

```json
{
  "moisture": 45,
  "temperature": 28.5,
  "isWatering": false,
  "timestamp": "2024-03-23T10:30:00Z"
}
```

**Fields:**

- `moisture`: Number (0-100, percentage)
- `temperature`: Number (Celsius)
- `isWatering`: Boolean
- `timestamp`: ISO 8601 datetime string

---

### 2. **GET `/api/sensors/history?hours=12`**

Returns historical moisture data for chart

**Query Parameters:**

- `hours`: Number (default: 12) - How many hours of history to fetch

**Response:**

```json
[
  {
    "time": "10:00",
    "moisture": 42
  },
  {
    "time": "10:05",
    "moisture": 43
  }
  // ... more data points
]
```

**Requirements:**

- Return array of objects with `time` and `moisture`
- `time`: String in "HH:MM" format
- `moisture`: Number (0-100)
- Should return up to 12 data points

---

### 3. **POST `/api/irrigation/water-now`**

Triggers watering action

**Request Body:** None required

**Response:**

```json
{
  "success": true,
  "message": "Watering started"
}
```

---

### 4. **POST `/api/irrigation/auto-mode`**

Sets auto mode state

**Request Body:**

```json
{
  "enabled": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Auto mode enabled"
}
```

---

### 5. **GET `/api/irrigation/auto-mode`**

Gets current auto mode state

**Response:**

```json
{
  "enabled": true
}
```

## Error Handling

The frontend handles these error scenarios:

### Initial Load Error

- Shows error card with retry button
- User can click "Retry" to fetch data again

### Action Error (Water Now, Auto Mode)

- Shows amber alert at top of dashboard
- Error message is displayed
- User can dismiss alert with ✕ button
- Original state is reverted on failed action

### Network Timeout

- All requests have a built-in timeout via fetch
- Frontend treats as error and shows appropriate message

## Development Testing

### 1. Mock Backend (Quick Testing)

Create a simple Node.js mock server:

```javascript
// backend-mock.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let isBad = false;

app.get("/api/sensors/current", (req, res) => {
  res.json({
    moisture: Math.floor(Math.random() * 100),
    temperature: 25 + Math.random() * 5,
    isWatering: false,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/sensors/history", (req, res) => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    data.push({
      time: hour.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      moisture: 40 + Math.random() * 40,
    });
  }
  res.json(data);
});

app.post("/api/irrigation/water-now", (req, res) => {
  res.json({ success: true, message: "Watering started" });
});

app.post("/api/irrigation/auto-mode", (req, res) => {
  res.json({
    success: true,
    message: `Auto mode ${req.body.enabled ? "enabled" : "disabled"}`,
  });
});

app.get("/api/irrigation/auto-mode", (req, res) => {
  res.json({ enabled: true });
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));
```

Run it:

```bash
node backend-mock.js
```

### 2. Set Environment Variable

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Start Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` and test the dashboard.

## Data Flow Diagram

```
Dashboard Component
    ↓
useSensorData Hook (5s interval)
    ↓
API Service Functions
    ↓
`NEXT_PUBLIC_API_URL` (Backend)
    ↓
Sensor Data / Chart Data / Status
    ↓
Update UI (moisture, temperature, chart, etc.)
```

## Refresh Interval

By default, the dashboard refreshes sensor data every 5 seconds:

```typescript
const { sensorData, chartData, ... } = useSensorData(5000) // 5000ms = 5s
```

To change the interval, modify the Dashboard component:

```typescript
// Refresh every 10 seconds
const { sensorData, chartData, ... } = useSensorData(10000)

// Refresh every 2 seconds
const { sensorData, chartData, ... } = useSensorData(2000)
```

## Troubleshooting

### API Connection Failed

**Problem:** Error message "Failed to fetch sensor data"

**Solutions:**

1. Check backend is running on correct port
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS is enabled on backend
4. Review browser console for detailed error

### Data Not Updating

**Problem:** Dashboard shows loading state or stale data

**Solutions:**

1. Check backend endpoints return correct format
2. Verify `moisture` is a number between 0-100
3. Check `isWatering` is a boolean
4. Ensure `timestamp` is valid ISO 8601 string

### Chart Shows No Data

**Problem:** Chart doesn't render even though dashboard loaded

**Solutions:**

1. Verify history endpoint returns array of objects
2. Check `time` field is in "HH:MM" format
3. Check `moisture` field is a number
4. Ensure at least 2 data points are returned

## Security Notes

- Backend should validate all requests
- Implement authentication/authorization if needed
- Use HTTPS in production
- Add rate limiting on backend endpoints
- Validate moisture (0-100), temperature ranges
- Validate `isWatering` boolean
