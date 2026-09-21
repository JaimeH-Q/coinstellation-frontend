"use client";

import React, { useState, useEffect, useMemo } from "react";
import BarraLateral from "@/components/dashboard/BarraLateral";
import NavbarSuperior from "@/components/dashboard/NavbarSuperior";
import SeccionProyectos from "@/components/dashboard/SeccionProyectos";
import SeccionBilletera from "@/components/dashboard/SeccionBilletera";
import SeccionPaquetes from "@/components/dashboard/SeccionPaquetes";
import TarjetaEstadistica from "@/components/dashboard/TarjetaEstadistica";
import EstadoTiendas from "@/components/dashboard/EstadoTiendas";
import SelectorTiempo, { TipoRangoTiempo } from "@/components/dashboard/SelectorTiempo";
import GraficoLineasEvolucion from "@/components/dashboard/GraficoLineasEvolucion";
import GraficoDonasMetodosYPaquetes from "@/components/dashboard/GraficoDonasMetodosYPaquetes";
import { obtenerDatosDashboard } from "@/components/dashboard/datosDashboard";

export default function DashboardPage() {
  // Estado para la pestaña seleccionada en el menú lateral o navbar
  const [seccionActiva, setSeccionActiva] = useState<string>("dashboard");

  // Estado para el tema oscuro
  const [esModoOscuro, setEsModoOscuro] = useState<boolean>(false);

  // Estado para el selector de tiempo del dashboard
  const [rangoTiempo, setRangoTiempo] = useState<TipoRangoTiempo>("7dias");
  const [fechaPersonalizada, setFechaPersonalizada] = useState<Date>(new Date());

  // Carga inicial y persistencia del tema en localStorage y <body>
  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("coinstellation-theme");
      if (temaGuardado === "dark") {
        setEsModoOscuro(true);
      }
    }
  }, []);

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

  // Manejador del cambio de rango de tiempo
  const manejarSeleccionarRango = (rango: TipoRangoTiempo, fecha?: Date) => {
    setRangoTiempo(rango);
    if (fecha) {
      setFechaPersonalizada(fecha);
    }
  };

  // Datos reactivos para el dashboard según el rango de tiempo seleccionado
  const datos = useMemo(
    () => obtenerDatosDashboard(rangoTiempo, fechaPersonalizada),
    [rangoTiempo, fechaPersonalizada]
  );

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
          ) : seccionActiva === "dashboard" || seccionActiva === "panel-control" ? (
            /* Sección Dashboard: estadísticas, gráficos analíticos y operaciones */
            <div>
              {/* Encabezado del Dashboard con título descriptivo */}
              <div className="mb-6 text-left">
                <h1 className="page-title text-2xl font-extrabold">Dashboard</h1>
                <p className="page-subtitle text-xs sm:text-sm">
                  Estado global del ecosistema y monitoreo en tiempo real
                </p>
              </div>

              {/* 4 Tarjetas de Estadísticas Principales */}
              {/* 1: Ingresos netos, 2: Pedidos completados, 3: Valor medio del pedido, 4: Tasa de conversión */}
              <section className="stats-grid">
                {datos.kpis.map((item) => (
                  <TarjetaEstadistica
                    key={item.titulo}
                    titulo={item.titulo}
                    valor={item.valor}
                    tendencia={item.tendencia}
                    descripcion={item.descripcion}
                    icono={item.icono}
                  />
                ))}
              </section>

              {/* Sección de Gráficos con Selector de Tiempo en la esquina superior derecha */}
              <section className="mb-7 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      Rendimiento y Métricas de Venta
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Comportamiento temporal de ingresos, volumen de pedidos y desglose por pasarelas
                    </p>
                  </div>

                  {/* Selector de tiempo con ventana emergente y mini-calendario */}
                  <SelectorTiempo
                    rangoActual={rangoTiempo}
                    fechaSeleccionada={fechaPersonalizada}
                    onSeleccionarRango={manejarSeleccionarRango}
                  />
                </div>

                {/* Cuadrícula de Gráficos: Líneas (Evolución Temporal) + Donas (Métodos y Paquetes) */}
                <div className="analytics-grid">
                  <GraficoLineasEvolucion
                    datos={datos.graficoLineas}
                    esModoOscuro={esModoOscuro}
                  />
                  <GraficoDonasMetodosYPaquetes
                    datos={datos.graficoDonas}
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
