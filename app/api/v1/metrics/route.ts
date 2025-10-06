import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";

function averageByBlock(records: any[], blockMinutes: number) {
  if (records.length === 0) return [];

  const msBlock = blockMinutes * 60 * 1000;
  const grouped: Record<string, any[]> = {};

  for (const rec of records) {
    const t = new Date(rec.time).getTime();
    const blockStart = new Date(
      Math.floor(t / msBlock) * msBlock
    ).toISOString();
    if (!grouped[blockStart]) grouped[blockStart] = [];
    grouped[blockStart].push(rec);
  }

  return Object.entries(grouped)
    .map(([blockStart, rows]) => {
      const avg = (key: string) =>
        rows.reduce((sum, r) => sum + (r[key] ?? 0), 0) / rows.length;

      return {
        time: blockStart,
        url: rows[0].url,
        altitud_metros: avg("altitud_metros"),
        humedad_suelo_pct: avg("humedad_suelo_pct"),
        humedad_suelo_raw: avg("humedad_suelo_raw"),
        presion_hpa: avg("presion_hpa"),
        temperatura_c: avg("temperatura_c"),
        humedad_relativa: avg("humedad_relativa"),
      };
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

async function isOlderThanOneMinute(): Promise<boolean> {
  const { data, error } = await supabase
    .from("espmetricas")
    .select("time")
    .order("time", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error al consultar Supabase:", error);
    return true; // en caso de error puedes decidir devolver true
  }

  if (!data || data.length === 0) {
    console.log("No hay registros en la tabla.");
    return true; // si no hay registros, lo tratamos como "desactualizado"
  }

  const lastTime = new Date(data[0].time).getTime();
  const now = Date.now();
  const diffMs = now - lastTime;

  return diffMs > 60000; // true si pasó más de 1 min
}

export async function GET(req: NextRequest) {
  try {
    const fromParam = req.nextUrl.searchParams.get("from"); // YYYY-MM-DD
    const interval = req.nextUrl.searchParams.get("interval") || "last";

    if (!fromParam) {
      return NextResponse.json(
        { error: "Missing 'from' query parameter" },
        { status: 400 }
      );
    }

    // Convertir medianoche de El Salvador a UTC
    const tzOffset = 6;
    const [year, month, day] = fromParam.split("-").map(Number);
    const localMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    localMidnight.setHours(localMidnight.getHours() + tzOffset);
    const fromIso = localMidnight.toISOString();

    // Inicio del día siguiente para filtrar solo la fecha
    const nextDay = new Date(localMidnight);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayIso = nextDay.toISOString();

    // Consulta solo registros de la fecha
    let { data, error } = await supabase
      .from("espmetricas")
      .select("*")
      .gte("time", fromIso)
      .lt("time", nextDayIso)
      .order("time", { ascending: true });

    if (error) throw error;
    if (!data) data = [];

    let result: Tables<"metricas_sensor">[] = data;

    if (interval === "last") {
      // Traer los últimos 60 registros
      result = data.slice(-30);
    } else if (interval === "half-hour") {
      result = averageByBlock(data, 30);
    } else if (interval === "hour") {
      result = averageByBlock(data, 60);
    } else {
      return NextResponse.json(
        { error: "Invalid interval" },
        {
          status: 400,
        }
      );
    }
    const outdated = await isOlderThanOneMinute();

    const { data: datos } = await supabase
      .from("espmetricas")
      .select("time")
      .order("time", { ascending: false })
      .limit(1);

    return NextResponse.json(result, {
      headers: {
        outdated: outdated ? "1" : "0",
        last_date: datos.at(0)?.time,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
