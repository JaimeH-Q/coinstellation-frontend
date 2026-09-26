"use client";

import React, { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  esModoClaro: boolean;
  onAlternarTema: () => void;
  onAbrirRegistro?: () => void;
}

export default function Navbar({
  esModoClaro,
  onAlternarTema,
  onAbrirRegistro,
}: NavbarProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <header>
      <div className="logo">
        <div className="logo-icon">C</div>
        Coinstellation
      </div>

      <button
        className={`nav-toggle ${menuAbierto ? "is-open" : ""}`}
        type="button"
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
        aria-controls="mainNav"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        id="mainNav"
        className={menuAbierto ? "is-open" : ""}
      >
        <ul>
          <li>
            <a href="#proceso" onClick={cerrarMenu}>
              Proceso
            </a>
          </li>
          <li>
            <a href="#costos" onClick={cerrarMenu}>
              Costos
            </a>
          </li>
          <li>
            <a href="#servicios" onClick={cerrarMenu}>
              Servicios
            </a>
          </li>
        </ul>
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          onClick={onAlternarTema}
          className="header-action-btn cursor-pointer"
          id="themeToggle"
          aria-label={esModoClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          aria-pressed={!esModoClaro}
          title={esModoClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
          <i className={esModoClaro ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
        </button>

        <Link href="/login" className="btn-login">
          Iniciar sesión
        </Link>

        <button
          type="button"
          className="btn-primary"
          onClick={onAbrirRegistro}
        >
          Crear Tienda
        </button>
      </div>
    </header>
  );
}
