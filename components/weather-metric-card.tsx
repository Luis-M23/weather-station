import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherMetricCardProps {
  title: string
  value: string
  unit: string
  icon: LucideIcon
  color: string
  trend: "up" | "down" | "stable"
}

export function WeatherMetricCard({ title, value, unit, icon: Icon, color, trend }: WeatherMetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />
      case "down":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="weather-gradient border-border/50 hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", `text-${color}`)} style={{ color: `var(--color-${color})` }} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <div className="text-2xl font-bold font-mono">{value}</div>
            <span className="text-sm text-muted-foreground font-mono">{unit}</span>
          </div>

            <Badge variant="outline" className={cn("gap-1 text-xs", getTrendColor())}>
              {getTrendIcon()}
            </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
