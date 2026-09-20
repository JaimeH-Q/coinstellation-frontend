"use client";

import React from "react";

// Estructura de cada enlace de la barra lateral
interface ElementoNavegacion {
  id: string;
  etiqueta: string;
  icono: string;
}

// Estructura de cada sección del menú
interface SeccionMenu {
  titulo: string;
  elementos: ElementoNavegacion[];
}

interface BarraLateralProps {
  seccionActiva: string;
  alSeleccionarSeccion: (id: string) => void;
}

// Definimos los enlaces del menú organizados por sección
const SECCIONES_MENU: SeccionMenu[] = [
  {
    titulo: "PLATFORM",
    elementos: [
      { id: "panel-control", etiqueta: "Panel de Control", icono: "fa-solid fa-gauge-high" },
      { id: "nodos-servidor", etiqueta: "Nodos del Servidor", icono: "fa-solid fa-server" },
      { id: "analiticas", etiqueta: "Analiticas", icono: "fa-solid fa-chart-line" },
      { id: "casa-subastas", etiqueta: "Casa de Subastas", icono: "fa-solid fa-gavel" },
      { id: "filtros-transferencias", etiqueta: "Filtros y transferencias", icono: "fa-solid fa-arrow-right-arrow-left" },
      { id: "configuracion-yaml", etiqueta: "Configuracion YAML", icono: "fa-solid fa-code" },
    ],
  },
  {
    titulo: "SISTEMA",
    elementos: [
      { id: "notificaciones", etiqueta: "Notificaciones", icono: "fa-regular fa-bell" },
      { id: "registro-alertas", etiqueta: "Registro Alertas", icono: "fa-solid fa-shield-halved" },
    ],
  },
];

export default function BarraLateral({ seccionActiva, alSeleccionarSeccion }: BarraLateralProps) {
  return (
    <aside className="sidebar">
      {/* Marca Superior / Logotipo */}
      <div className="brand-container">
        <div className="brand-logo-icon">C</div>
        <span className="brand-name">coinstellation</span>
      </div>

      {/* Contenedor de Secciones en la Barra Lateral */}
      <div className="sidebar-nav-wrapper">
        {SECCIONES_MENU.map((seccion) => (
          <div key={seccion.titulo} className="sidebar-section">
            <div className="sidebar-section-title">{seccion.titulo}</div>
            <nav className="sidebar-nav">
              {seccion.elementos.map((item) => {
                const estaActivo = seccionActiva === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => alSeleccionarSeccion(item.id)}
                    className={`nav-link ${estaActivo ? "active" : ""}`}
                    aria-current={estaActivo ? "page" : undefined}
                  >
                    <i className={item.icono}></i>
                    <span>{item.etiqueta}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
