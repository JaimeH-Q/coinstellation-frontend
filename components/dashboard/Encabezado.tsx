"use client";

import React from "react";

interface EncabezadoProps {
  titulo?: string;
  subtitulo?: string;
  esModoOscuro: boolean;
  alAlternarModoOscuro: () => void;
}

export default function Encabezado({
  titulo = "Panel de Control",
  subtitulo = "Estado global del ecosistema y monitoreo en tiempo real",
  esModoOscuro,
  alAlternarModoOscuro,
}: EncabezadoProps) {
  return (
    <header className="header-title-section">
      <div>
        <h1 className="page-title">{titulo}</h1>
        <p className="page-subtitle">{subtitulo}</p>
      </div>

      <div className="header-actions">
        {/* Botón de Modo Claro / Modo Oscuro */}
        <button
          type="button"
          onClick={alAlternarModoOscuro}
          className="header-action-btn"
          aria-label="Cambiar tema"
          title={esModoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <i className={esModoOscuro ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
        </button>

        {/* Botón de Notificaciones */}
        <button
          type="button"
          className="header-action-btn notification-btn"
          aria-label="Notificaciones"
          title="Notificaciones del sistema"
        >
          <i className="fa-regular fa-bell"></i>
          <span className="notification-badge-dot"></span>
        </button>

        {/* Botón de Perfil de Usuario */}
        <button
          type="button"
          className="account-avatar-btn"
          aria-label="Cuenta de usuario"
          title="Cuenta: Coinstellation Admin"
        >
          <span>CO</span>
        </button>
      </div>
    </header>
  );
}
