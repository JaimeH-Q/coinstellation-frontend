"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import BarraLateral from "@/components/dashboard/BarraLateral";
import NavbarSuperior from "@/components/dashboard/NavbarSuperior";
import SeccionProyectos from "@/components/dashboard/SeccionProyectos";
import SeccionBilletera from "@/components/dashboard/SeccionBilletera";
import SeccionPaquetes from "@/components/dashboard/SeccionPaquetes";
import SeccionHistorialPagos from "@/components/dashboard/SeccionHistorialPagos";
import SeccionApi from "@/components/dashboard/SeccionApi";
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
  // Estado para la pestaña seleccionada en el menú lateral o navbar
  const [seccionActiva, setSeccionActiva] = useState<string>("dashboard");

  // Estado para el tema oscuro
  const [esModoOscuro, setEsModoOscuro] = useState<boolean>(false);

  // ── Estado para los pagos del backend ──
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [errorPagos, setErrorPagos] = useState<string | null>(null);

  // Función reutilizable para traer pagos desde /api/payments
  const cargarPagos = useCallback(async () => {
    setCargandoPagos(true);
    setErrorPagos(null);
    try {
      const res = await fetch("/api/payments?user_id=demo-user&count=50");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setPagos(data.payments ?? []);
    } catch (err) {
      setErrorPagos(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargandoPagos(false);
    }
  }, []);

  // Carga inicial y persistencia del tema en localStorage y <body>
  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("coinstellation-theme");
      if (temaGuardado === "dark") {
        setEsModoOscuro(true);
      }
    }
  }, []);

  // Cargar pagos al montar el componente
  useEffect(() => {
    cargarPagos();
  }, [cargarPagos]);

  useEffect(() => {
    if (esModoOscuro) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("coinstellation-theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("coinstellation-theme", "light");
    }
  }, [esModoOscuro]);

  // Alterna entre tema claro y oscuro
  const alternarModoOscuro = () => {
    setEsModoOscuro((previo) => !previo);
  };

  // ── Todos los datos del dashboard computados dinámicamente desde los pagos ──
  const datosDinamicos = useMemo(() => computarDatosDashboard(pagos), [pagos]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      {/* Nav Bar Superior siempre visible sin importar en qué sección lateral esté */}
      <NavbarSuperior
        seccionActiva={seccionActiva}
        alSeleccionarSeccion={(id) => setSeccionActiva(id)}
        esModoOscuro={esModoOscuro}
        alAlternarModoOscuro={alternarModoOscuro}
      />

      {/* Contenedor principal con Barra Lateral y Área de Contenido */}
      <div className="app-container flex-1">
        {/* Barra Lateral Izquierda */}
        <BarraLateral
          seccionActiva={seccionActiva}
          alSeleccionarSeccion={(id) => setSeccionActiva(id)}
        />

        {/* Área de Contenido Principal dinámico */}
        <main className="main-content">
          {seccionActiva === "proyectos" ? (
            /* Sección Proyectos: cuadros con tipo, logo, X en rojo para eliminar, Ver Webstore, Login y botón Crear Proyecto */
            <SeccionProyectos />
          ) : seccionActiva === "billetera" ? (
            /* Sección Billetera: saldos y movimientos */
            <SeccionBilletera />
          ) : seccionActiva === "paquetes" ? (
            /* Sección Paquetes: formulario Crea un Paquete y lista */
            <SeccionPaquetes />
          ) : seccionActiva === "historial-pagos" ? (
            /* Sección Historial de Pagos dedicada */
            <SeccionHistorialPagos
              pagos={pagos}
              cargandoPagos={cargandoPagos}
              alActualizarPagos={cargarPagos}
            />
          ) : seccionActiva === "api" ? (
            /* Sección API (vacía de momento) */
            <SeccionApi />
          ) : seccionActiva === "dashboard" || seccionActiva === "panel-control" ? (
            /* Sección Dashboard: estadísticas, gráficos analíticos y estado de las tiendas */
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
          ) : (
            /* Otras secciones de la barra lateral */
            <div className="p-8 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] text-left">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 capitalize">
                {seccionActiva.replace("-", " ")}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Módulo en funcionamiento activo y sincronizado con los servicios de Coinstellation.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
