"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { WeatherMetricCard } from "@/components/weather-metric-card"
import { WeatherChart } from "@/components/weather-chart"
import { Thermometer, Droplets, Gauge, Mountain, Sprout, RefreshCw, Wifi, WifiOff, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  altitude: number
  soilMoisture: number
  timestamp: Date
}

type TimeRange = "15min" | "6hours" | "12hours" | "24hours"

export function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 23.5,
    humidity: 65,
    pressure: 1013.25,
    altitude: 245,
    soilMoisture: 42,
    timestamp: new Date(),
  })

  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [historicalData, setHistoricalData] = useState<WeatherData[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>("15min")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      const newData: WeatherData = {
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        pressure: 1000 + Math.random() * 30,
        altitude: 240 + Math.random() * 10,
        soilMoisture: 30 + Math.random() * 40,
        timestamp: new Date(),
      }

      setWeatherData(newData)
      setLastUpdate(new Date())

      setHistoricalData((prev) => {
        const updated = [...prev, newData]
        return updated.slice(-288) // 24 horas a 5 segundos por lectura
      })
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  const refreshData = () => {
    setLastUpdate(new Date())
    // Aquí conectarías con tu API real
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Estación Meteorológica</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real • Última actualización: {formatTime(lastUpdate)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-2">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>

          <Button onClick={refreshData} size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <WeatherMetricCard
          title="Temperatura"
          value={weatherData.temperature.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          color="weather-temp"
          trend={weatherData.temperature > 25 ? "up" : weatherData.temperature < 15 ? "down" : "stable"}
        />

        <WeatherMetricCard
          title="Humedad"
          value={weatherData.humidity.toFixed(0)}
          unit="%"
          icon={Droplets}
          color="weather-humidity"
          trend={weatherData.humidity > 70 ? "up" : weatherData.humidity < 40 ? "down" : "stable"}
        />

        <WeatherMetricCard
          title="Presión"
          value={weatherData.pressure.toFixed(1)}
          unit="hPa"
          icon={Gauge}
          color="weather-pressure"
          trend={weatherData.pressure > 1020 ? "up" : weatherData.pressure < 1000 ? "down" : "stable"}
        />

        <WeatherMetricCard
          title="Altitud"
          value={weatherData.altitude.toFixed(0)}
          unit="m"
          icon={Mountain}
          color="weather-altitude"
          trend="stable"
        />

        <WeatherMetricCard
          title="Humedad Suelo"
          value={weatherData.soilMoisture.toFixed(0)}
          unit="%"
          icon={Sprout}
          color="weather-soil"
          trend={weatherData.soilMoisture > 60 ? "up" : weatherData.soilMoisture < 30 ? "down" : "stable"}
        />
      </div>

      <Card className="weather-gradient border-border/50 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Fecha</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal bg-muted/50 hover:bg-muted"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">Rango de tiempo</h3>
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange("15min")}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    timeRange === "15min"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  15 minutos
                </button>
                <button
                  onClick={() => setTimeRange("6hours")}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    timeRange === "6hours"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  6 horas
                </button>
                <button
                  onClick={() => setTimeRange("12hours")}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    timeRange === "12hours"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  12 horas
                </button>
                <button
                  onClick={() => setTimeRange("24hours")}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    timeRange === "24hours"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  24 horas
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherChart
          title="Temperatura y Humedad"
          data={historicalData}
          dataKeys={["temperature", "humidity"]}
          colors={["#ff6b35", "#4ecdc4"]}
          units={["°C", "%"]}
          timeRange={timeRange}
        />

        <WeatherChart
          title="Presión Atmosférica"
          data={historicalData}
          dataKeys={["pressure"]}
          colors={["#a8e6cf"]}
          units={["hPa"]}
          timeRange={timeRange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherChart
          title="Altitud"
          data={historicalData}
          dataKeys={["altitude"]}
          colors={["#ffd93d"]}
          units={["m"]}
          timeRange={timeRange}
        />

        <WeatherChart
          title="Humedad del Suelo"
          data={historicalData}
          dataKeys={["soilMoisture"]}
          colors={["#8b5a3c"]}
          units={["%"]}
          timeRange={timeRange}
        />
      </div>
    </div>
  )
}
