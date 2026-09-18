"use client";

import React, { useState, useEffect } from "react";
import BarraLateral from "@/components/dashboard/BarraLateral";
import Encabezado from "@/components/dashboard/Encabezado";
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
  // Estado para la pestaña seleccionada en el menú lateral
  const [seccionActiva, setSeccionActiva] = useState<string>("panel-control");

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
    <div className="app-container">
      {/* Barra Lateral Izquierda */}
      <BarraLateral
        seccionActiva={seccionActiva}
        alSeleccionarSeccion={(id) => setSeccionActiva(id)}
      />

      {/* Área de Contenido Principal */}
      <main className="main-content">
        {/* Encabezado con botones de acción */}
        <Encabezado
          titulo="Panel de Control"
          subtitulo="Estado global del ecosistema y monitoreo en tiempo real"
          esModoOscuro={esModoOscuro}
          alAlternarModoOscuro={alternarModoOscuro}
        />

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
      </main>
    </div>
  );
}
