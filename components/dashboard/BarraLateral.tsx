"use client";

import React from "react";
import Link from "next/link";

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
}

// Definimos los enlaces del menú organizados por sección
const SECCIONES_MENU: SeccionMenu[] = [
  {
    titulo: "PLATFORM",
    elementos: [
      { id: "dashboard", etiqueta: "Dashboard", icono: "fa-solid fa-gauge-high" },
      { id: "paquetes", etiqueta: "Paquetes", icono: "fa-solid fa-box-archive" },
      { id: "historial-pagos", etiqueta: "Historial de pagos", icono: "fa-solid fa-receipt" },
      { id: "api", etiqueta: "API", icono: "fa-solid fa-code" },
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

export default function BarraLateral({ seccionActiva }: BarraLateralProps) {
  return (
    <aside className="sidebar">
      {/* Contenedor de Secciones en la Barra Lateral */}
      <div className="sidebar-nav-wrapper !mt-0">
        {SECCIONES_MENU.map((seccion) => (
          <div key={seccion.titulo} className="sidebar-section">
            <div className="sidebar-section-title">{seccion.titulo}</div>
            <nav className="sidebar-nav">
              {seccion.elementos.map((item) => {
                const estaActivo = seccionActiva === item.id;
                const href = item.id === "dashboard" ? "/dashboard" : `/dashboard/${item.id}`;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`nav-link ${estaActivo ? "active" : ""}`}
                    aria-current={estaActivo ? "page" : undefined}
                  >
                    <i className={item.icono}></i>
                    <span>{item.etiqueta}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
