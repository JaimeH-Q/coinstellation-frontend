"use client";

import React, { useState, useEffect } from "react";
import BarraLateral from "@/components/dashboard/BarraLateral";
import NavbarSuperior from "@/components/dashboard/NavbarSuperior";
import SeccionProyectos from "@/components/dashboard/SeccionProyectos";
import SeccionBilletera from "@/components/dashboard/SeccionBilletera";
import SeccionPaquetes from "@/components/dashboard/SeccionPaquetes";
import TarjetaEstadistica from "@/components/dashboard/TarjetaEstadistica";
import TablaOperaciones from "@/components/dashboard/TablaOperaciones";
import GraficoRecursos from "@/components/dashboard/GraficoRecursos";

// Lista de datos de las 4 tarjetas de estadísticas
const DATOS_ESTADISTICAS = [
  {
    titulo: "Usuarios conectados",
    valor: "1,428",
    tendencia: "+5.2%",
    descripcion: "vs. hora anterior",
  },
  {
    titulo: "Carga de sistema",
    valor: "24.5%",
    descripcion: "Rendimiento óptimo",
  },
  {
    titulo: "Cola de transferencias",
    valor: "12",
    descripcion: "Operaciones pendientes",
  },
  {
    titulo: "Volumen de Subastas",
    valor: "$45,210",
    tendencia: "+12.4%",
    descripcion: "hoy",
  },
];

export default function DashboardPage() {
  // Estado para la pestaña seleccionada en el menú lateral o navbar
  const [seccionActiva, setSeccionActiva] = useState<string>("dashboard");

  // Estado para el tema oscuro
  const [esModoOscuro, setEsModoOscuro] = useState<boolean>(false);

  // Sincroniza la clase .dark-theme en el <body>
  useEffect(() => {
    if (esModoOscuro) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [esModoOscuro]);

  // Alterna entre tema claro y oscuro
  const alternarModoOscuro = () => {
    setEsModoOscuro((previo) => !previo);
  };

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
            /* Sección Dashboard: estadísticas y gráficos */
            <div>
              <div className="mb-6 text-left">
                <h1 className="page-title text-2xl font-extrabold">Dashboard</h1>
                <p className="page-subtitle text-xs sm:text-sm">
                  Estado global del ecosistema y monitoreo en tiempo real
                </p>
              </div>

              {/* 4 Tarjetas de Estadísticas */}
              <section className="stats-grid">
                {DATOS_ESTADISTICAS.map((item) => (
                  <TarjetaEstadistica
                    key={item.titulo}
                    titulo={item.titulo}
                    valor={item.valor}
                    tendencia={item.tendencia}
                    descripcion={item.descripcion}
                  />
                ))}
              </section>

              {/* Grilla Inferior: Tabla de Operaciones + Gráfico de Recursos */}
              <section className="dashboard-grid">
                <TablaOperaciones />
                <GraficoRecursos
                  esModoOscuro={esModoOscuro}
                  memoriaTotal="64 GB"
                  usoActual="24.8 GB"
                  porcentajeUso={38.75}
                />
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
