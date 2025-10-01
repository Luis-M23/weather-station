"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  altitude: number
  soilMoisture: number
  timestamp: Date
}

type TimeRange = "15min" | "6hours" | "12hours" | "24hours"

interface WeatherChartProps {
  title: string
  data: WeatherData[]
  dataKeys: (keyof WeatherData)[]
  colors: string[]
  units: string[]
  timeRange: TimeRange
}

export function WeatherChart({ title, data, dataKeys, colors, units, timeRange }: WeatherChartProps) {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFilteredData = () => {
    const now = new Date()
    const minutesMap = {
      "15min": 15,
      "6hours": 360,
      "12hours": 720,
      "24hours": 1440,
    }

    const minutes = minutesMap[timeRange]
    const cutoffTime = new Date(now.getTime() - minutes * 60 * 1000)

    return data.filter((item) => item.timestamp >= cutoffTime)
  }

  const chartData = getFilteredData().map((item) => ({
    ...item,
    time: formatTime(item.timestamp),
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{`Hora: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)} ${units[index] || ""}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="weather-gradient border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index]}
                  strokeWidth={2}
                  dot={{ fill: colors[index], strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: colors[index], strokeWidth: 2 }}
                  name={
                    key === "temperature"
                      ? "Temperatura"
                      : key === "humidity"
                        ? "Humedad"
                        : key === "pressure"
                          ? "Presión"
                          : key === "altitude"
                            ? "Altitud"
                            : key === "soilMoisture"
                              ? "Humedad Suelo"
                              : key
                  }
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
