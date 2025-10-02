export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Database = {
  public: {
    Tables: {
      metricas_sensor: {
        Row: {
          time: Date;
          url: string | null;
          altitud_metros: number | null;
          humedad_suelo_pct: number | null;
          humedad_suelo_raw: number | null;
          presion_hpa: number | null;
          temperatura_c: number | null;
          humedad_relativa: number | null;
        };
        Insert: {
          time: Date;
          url?: string | null;
          altitud_metros?: number | null;
          humedad_suelo_pct?: number | null;
          humedad_suelo_raw?: number | null;
          presion_hpa?: number | null;
          temperatura_c?: number | null;
          humedad_relativa: number | null;
        };
        Update: {
          time: Date;
          url?: string | null;
          altitud_metros?: number | null;
          humedad_suelo_pct?: number | null;
          humedad_suelo_raw?: number | null;
          presion_hpa?: number | null;
          temperatura_c?: number | null;
          humedad_relativa: number | null;
        };
        Relationships: [];
      };
    };
  };
};
