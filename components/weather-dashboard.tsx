"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { WeatherMetricCard } from "@/components/weather-metric-card";
import { WeatherChart } from "@/components/weather-chart";
import {
  Thermometer,
  Droplets,
  Gauge,
  Mountain,
  Sprout,
  RefreshCw,
  Wifi,
  WifiOff,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tables } from "@/types/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  altitude: number;
  soilMoisture: number;
  timestamp: Date;
  time: Date;
}

type TimeRange = "last" | "half-hour" | "hour";

function getLocalDateString(selectedDate: Date) {
  const date = new Date(selectedDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function WeatherDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [historicalData, setHistoricalData] = useState<WeatherData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("last");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    humidity: 0,
    pressure: 0,
    altitude: 0,
    soilMoisture: 0,
    timestamp: new Date(),
    time: new Date(),
  });

  useEffect(() => {
    retrieveData();

    const interval = setInterval(() => {
      retrieveData();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange, selectedDate]);

  const refreshData = () => {
    retrieveData();
  };

  const retrieveData = async () => {
    try {
      const params = new URLSearchParams({
        from: getLocalDateString(selectedDate),
        interval: timeRange,
      });

      const res = await fetch(`/api/v1/metrics?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Error fetching metrics");
      }

      const data: Tables<"metricas_sensor">[] = await res.json();
      const outdated = res.headers.get("outdated");

      const lastMetric = data.at(-1);

      if (lastMetric) {
        const newData: WeatherData = {
          temperature: lastMetric.temperatura_c || 0,
          humidity: lastMetric.humedad_relativa || 0,
          pressure: lastMetric.presion_hpa || 0,
          altitude: lastMetric.altitud_metros || 0,
          soilMoisture: lastMetric.humedad_suelo_pct || 0,
          timestamp: new Date(lastMetric.time),
          time: lastMetric.time,
        };
        setWeatherData(newData);
        setLastUpdate(new Date(lastMetric.time));
      } else {
        setWeatherData({
          temperature: 0,
          humidity: 0,
          pressure: 0,
          altitude: 0,
          soilMoisture: 0,
          timestamp: new Date(),
          time: new Date(),
        });
        setLastUpdate(new Date());
      }

      setIsConnected(outdated !== "1");

      const historical = data.map((row) => ({
        temperature: row.temperatura_c || 0,
        humidity: row.humedad_relativa || 0,
        pressure: row.presion_hpa || 0,
        altitude: row.altitud_metros || 0,
        soilMoisture: row.humedad_suelo_pct || 0,
        timestamp: new Date(row.time),
        time: row.time,
      }));

      setHistoricalData(historical);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm:ss", { locale: es });
  };

  const formatTime = (utcString: Date) => {
    const date = new Date(utcString);
    return date.toLocaleString("es-SV", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/El_Salvador",
    });
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">
            Estación Meteorológica
          </h1>
          {isConnected && (
            <p className="text-lg font-bold text-muted-foreground">
              Monitoreo en tiempo real
            </p>
          )}
          <p className="text-lg font-bold text-muted-foreground">
            Última registro {formatTime(lastUpdate)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="gap-2"
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
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
          trend={
            weatherData.temperature > 25
              ? "up"
              : weatherData.temperature < 15
              ? "down"
              : "stable"
          }
        />

        <WeatherMetricCard
          title="Humedad"
          value={weatherData.humidity.toFixed(0)}
          unit="%"
          icon={Droplets}
          color="weather-humidity"
          trend={
            weatherData.humidity > 70
              ? "up"
              : weatherData.humidity < 40
              ? "down"
              : "stable"
          }
        />

        <WeatherMetricCard
          title="Presión"
          value={weatherData.pressure.toFixed(1)}
          unit="hPa"
          icon={Gauge}
          color="weather-pressure"
          trend={
            weatherData.pressure > 1020
              ? "up"
              : weatherData.pressure < 1000
              ? "down"
              : "stable"
          }
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
          trend={
            weatherData.soilMoisture > 60
              ? "up"
              : weatherData.soilMoisture < 30
              ? "down"
              : "stable"
          }
        />
      </div>

      <Card className="weather-gradient border-border/50 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Fecha
              </h3>
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
              <h3 className="text-sm font-medium text-muted-foreground">
                Rango de tiempo
              </h3>
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange("last")}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    timeRange === "last"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Últimos 15 minutos
                </button>
                <button
                  onClick={() => setTimeRange("half-hour")}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    timeRange === "half-hour"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cada media hora
                </button>
                <button
                  onClick={() => setTimeRange("hour")}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    timeRange === "hour"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cada hora
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

      <Card className="weather-gradient border-border/50 p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Histórico de Datos</h2>
            <p className="text-muted-foreground">
              Registro completo de mediciones del día
            </p>
          </div>

          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="font-semibold">
                      Fecha y Hora
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Temperatura (°C)
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Humedad (%)
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Presión (hPa)
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Altitud (m)
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Humedad Suelo (%)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    historicalData
                      .slice()
                      .reverse()
                      .map((data, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(data.timestamp)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {data.temperature.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {data.humidity !== null
                              ? data.humidity.toFixed(2)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {data.pressure.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {data.altitude.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {data.soilMoisture.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {historicalData.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Mostrando {historicalData.length} registros
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
