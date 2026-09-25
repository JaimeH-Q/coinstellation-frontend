"use client";

import { useState, useEffect, useMemo } from "react";
import { useDashboardLayout } from "./DashboardShell";
import TarjetaEstadistica from "@/components/dashboard/TarjetaEstadistica";
import EstadoTiendas from "@/components/dashboard/EstadoTiendas";
import GraficoLineasEvolucion from "@/components/dashboard/GraficoLineasEvolucion";
import GraficoDonasMetodosYPaquetes from "@/components/dashboard/GraficoDonasMetodosYPaquetes";
import type { Payment } from "@/backend/payments/PaymentsHistory";
import type { TarjetaEstadisticaProps } from "@/components/dashboard/TarjetaEstadistica";
import type { DatosGraficoLineas } from "@/components/dashboard/GraficoLineasEvolucion";
import type { DatosDistribucion } from "@/components/dashboard/GraficoDonasMetodosYPaquetes";

// ──────────── Colores para gráficos ────────────

const COLORES_ACTIVOS: Record<string, string> = {
  USDC: "#095a86",
  XLM: "#0284c7",
  BTC: "#f59e0b",
  ETH: "#8b5cf6",
};
const COLOR_DEFECTO_ACTIVO = "#10b981";

const COLORES_PAQUETES: Record<string, string> = {
  "package-basic": "#095a86",
  "package-pro": "#8b5cf6",
  "package-enterprise": "#ec4899",
};
const COLOR_DEFECTO_PAQUETE = "#10b981";

const NOMBRES_PAQUETES: Record<string, string> = {
  "package-basic": "Basic",
  "package-pro": "Pro",
  "package-enterprise": "Enterprise",
};

// ──────────── Función para computar todos los datos del dashboard ────────────

function computarDatosDashboard(pagos: Payment[]): {
  kpis: TarjetaEstadisticaProps[];
  graficoLineas: DatosGraficoLineas;
  graficoDonas: DatosDistribucion;
} {
  const completados = pagos.filter((p) => p.status === "completed" || p.status === "confirmed");
  const totalIngresos = completados.reduce((s, p) => s + parseFloat(p.finalAmount), 0);
  const totalFees = pagos.reduce((s, p) => s + parseFloat(p.fees), 0);
  const valorMedio = completados.length > 0 ? totalIngresos / completados.length : 0;
  const tasaConversion = pagos.length > 0 ? (completados.length / pagos.length) * 100 : 0;

  // ── KPIs ──
  const kpis: TarjetaEstadisticaProps[] = [
    {
      titulo: "Ingresos netos",
      valor: `$${totalIngresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      tendencia: `${completados.length} txs`,
      descripcion: "pagos completados/confirmados",
      ayuda: "Suma total de los montos finales (monto + fee) de todos los pagos con estado completado o confirmado.",
    },
    {
      titulo: "Pedidos totales",
      valor: pagos.length.toString(),
      tendencia: `${completados.length} exitosos`,
      descripcion: "del backend en tiempo real",
      ayuda: "Cantidad total de pagos registrados en el backend, incluyendo pendientes, fallidos y cancelados.",
    },
    {
      titulo: "Valor medio del pedido",
      valor: `$${valorMedio.toFixed(2)}`,
      tendencia: `Fee total: $${totalFees.toFixed(2)}`,
      descripcion: "ticket promedio completados",
      ayuda: "Promedio del monto final por cada pago completado o confirmado. Indica el ticket medio de compra.",
    },
    {
      titulo: "Tasa de conversión",
      valor: `${tasaConversion.toFixed(1)}%`,
      tendencia: `${pagos.length - completados.length} no completados`,
      descripcion: "completados vs total",
      ayuda: "Porcentaje de pagos que llegaron a estado completado o confirmado respecto al total de pagos registrados.",
    },
  ];

  // ── Gráfico de Líneas: agrupar por día ──
  const porDia = new Map<string, { ingresos: number; pedidos: number }>();
  for (const p of pagos) {
    const dia = new Date(p.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    const prev = porDia.get(dia) ?? { ingresos: 0, pedidos: 0 };
    prev.ingresos += parseFloat(p.finalAmount);
    prev.pedidos += 1;
    porDia.set(dia, prev);
  }
  // Ordenar cronológicamente
  const entradasOrdenadas = [...porDia.entries()].sort((a, b) => {
    const fechaA = pagos.find((p) => new Date(p.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) === a[0]);
    const fechaB = pagos.find((p) => new Date(p.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) === b[0]);
    return new Date(fechaA?.createdAt ?? 0).getTime() - new Date(fechaB?.createdAt ?? 0).getTime();
  });

  const graficoLineas: DatosGraficoLineas = {
    etiquetas: entradasOrdenadas.map(([dia]) => dia),
    ingresos: entradasOrdenadas.map(([, v]) => Math.round(v.ingresos * 100) / 100),
    pedidos: entradasOrdenadas.map(([, v]) => v.pedidos),
    totalIngresos: `$${totalIngresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    totalPedidos: pagos.length,
  };

  // ── Gráfico de Donas: por Activo (métodos de pago) ──
  const porActivo = new Map<string, number>();
  for (const p of completados) {
    const key = p.asset.network ? `${p.asset.currency} (${p.asset.network})` : p.asset.currency;
    porActivo.set(key, (porActivo.get(key) ?? 0) + parseFloat(p.finalAmount));
  }
  const totalActivos = [...porActivo.values()].reduce((s, v) => s + v, 0) || 1;
  const metodosPago = [...porActivo.entries()].map(([nombre, monto]) => ({
    nombre,
    porcentaje: Math.round((monto / totalActivos) * 100),
    monto: `$${monto.toFixed(2)}`,
    color: COLORES_ACTIVOS[nombre.split(" ")[0]] ?? COLOR_DEFECTO_ACTIVO,
  }));

  // ── Gráfico de Donas: por Paquete ──
  const porPaquete = new Map<string, number>();
  for (const p of completados) {
    porPaquete.set(p.packageId, (porPaquete.get(p.packageId) ?? 0) + parseFloat(p.finalAmount));
  }
  const totalPaquetes = [...porPaquete.values()].reduce((s, v) => s + v, 0) || 1;
  const categoriasPaquetes = [...porPaquete.entries()].map(([id, monto]) => ({
    nombre: NOMBRES_PAQUETES[id] ?? id,
    porcentaje: Math.round((monto / totalPaquetes) * 100),
    monto: `$${monto.toFixed(2)}`,
    color: COLORES_PAQUETES[id] ?? COLOR_DEFECTO_PAQUETE,
  }));

  const graficoDonas: DatosDistribucion = {
    metodosPago: metodosPago.length > 0 ? metodosPago : [{ nombre: "Sin datos", porcentaje: 100, monto: "$0.00", color: "#94a3b8" }],
    categoriasPaquetes: categoriasPaquetes.length > 0 ? categoriasPaquetes : [{ nombre: "Sin datos", porcentaje: 100, monto: "$0.00", color: "#94a3b8" }],
  };

  return { kpis, graficoLineas, graficoDonas };
}

// ──────────── Componente principal ────────────

export default function DashboardPage() {
  const { esModoOscuro } = useDashboardLayout();

  // ── Estado para los pagos del backend ──
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [errorPagos, setErrorPagos] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  const cargarPagos = () => {
    setCargandoPagos(true);
    setErrorPagos(null);
    setRecarga((actual) => actual + 1);
  };

  useEffect(() => {
    let vigente = true;

    fetch("/api/payments?user_id=demo-user&count=50")
      .then((response) => {
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (vigente) setPagos(data.payments ?? []);
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorPagos(error instanceof Error ? error.message : "Error desconocido");
        }
      })
      .finally(() => {
        if (vigente) setCargandoPagos(false);
      });

    return () => {
      vigente = false;
    };
  }, [recarga]);

  // ── Todos los datos del dashboard computados dinámicamente desde los pagos ──
  const datosDinamicos = useMemo(() => computarDatosDashboard(pagos), [pagos]);

  return (
    <div>
              {/* Encabezado del Dashboard con botón de recarga global */}
              <div className="mb-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="page-title text-2xl font-extrabold">Dashboard</h1>
                  <p className="page-subtitle text-xs sm:text-sm">
                    Estado global del ecosistema — datos en tiempo real desde <code className="text-[10px] bg-[var(--bg-card)] px-1 py-0.5 rounded border border-[var(--border-color)]">/api/payments</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cargarPagos}
                  disabled={cargandoPagos}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer border ${
                    cargandoPagos
                      ? "opacity-50 cursor-not-allowed border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)]"
                      : "border-[#095a86]/30 bg-[#095a86]/10 text-[#095a86] hover:bg-[#095a86]/20 hover:border-[#095a86]/50"
                  }`}
                >
                  <i className={`fa-solid fa-arrows-rotate ${cargandoPagos ? "animate-spin" : ""}`}></i>
                  {cargandoPagos ? "Actualizando datos..." : "Actualizar todo"}
                </button>
              </div>

              {/* Error global */}
              {errorPagos && (
                <div className="mb-6 p-4 rounded-[6px] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>{errorPagos}</span>
                  </div>
                  <button
                    type="button"
                    onClick={cargarPagos}
                    className="underline text-[11px] hover:opacity-80"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* ================= TARJETAS KPI ================= */}
              <section className="stats-grid mb-7">
                {datosDinamicos.kpis.map((item) => (
                  <TarjetaEstadistica
                    key={item.titulo}
                    titulo={item.titulo}
                    valor={cargandoPagos && pagos.length === 0 ? "..." : item.valor}
                    tendencia={item.tendencia}
                    descripcion={item.descripcion}
                    ayuda={item.ayuda}
                  />
                ))}
              </section>

              {/* ================= GRÁFICOS Y ANALÍTICA ================= */}
              <section>
                {/* Cuadrícula de Gráficos: Líneas (Evolución Temporal) + Donas (Métodos y Paquetes) */}
                <div className="analytics-grid">
                  <GraficoLineasEvolucion
                    datos={datosDinamicos.graficoLineas}
                    esModoOscuro={esModoOscuro}
                  />
                  <GraficoDonasMetodosYPaquetes
                    datos={datosDinamicos.graficoDonas}
                    esModoOscuro={esModoOscuro}
                  />
                </div>
              </section>

              {/* Cuadro de Estado y Salud de las Tiendas */}
              <section className="mt-7">
                <EstadoTiendas />
              </section>
    </div>
  );
}
