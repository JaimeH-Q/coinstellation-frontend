"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Página Principal / Landing Page: http://localhost:3000/
 *
 * Espacio reservado para la Landing Page de inicio.
 * El login ha sido trasladado a '/login'.
 */
export default function PaginaInicio() {
  const [esModoOscuro, setEsModoOscuro] = useState(false);

  // Sincroniza la clase dark-theme en el <body>
  useEffect(() => {
    if (esModoOscuro) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [esModoOscuro]);

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 transition-colors duration-300">
      {/* Barra de navegación superior */}
      <header className="flex justify-between items-center max-w-5xl w-full mx-auto">
        <div className="brand-container mb-0">
          <div className="brand-logo-icon">C</div>
          <span className="brand-name">coinstellation</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            Iniciar Sesión
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--accent-gray)] hover:opacity-90 text-white transition-opacity shadow"
          >
            Dashboard
          </Link>

          <button
            type="button"
            onClick={() => setEsModoOscuro(!esModoOscuro)}
            className="header-action-btn ml-1"
            aria-label="Cambiar tema"
            title={esModoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <i className={esModoOscuro ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>
        </div>
      </header>

      {/* Hero / Presentación temporal mientras se integra la landing */}
      <main className="flex-1 flex items-center justify-center my-12">
        <div className="panel max-w-xl text-center p-8 sm:p-12 shadow-lg">
          <div className="brand-logo-icon mx-auto mb-4 !w-16 !h-16 !text-2xl">
            C
          </div>

          <h1 className="page-title text-3xl sm:text-4xl mb-3">
            Coinstellation
          </h1>

          <p className="page-subtitle text-base max-w-md mx-auto mb-8">
            Plataforma de monitoreo y gestión de ecosistema descentralizado en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--accent-gray)] hover:opacity-90 text-white font-bold text-sm transition-all shadow flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket text-xs"></i>
              Acceder al Login (/login)
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-gauge-high text-xs"></i>
              Ir al Dashboard (/dashboard)
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <p>
              ℹ️ <strong>Ruta raíz (/) lista:</strong> Aquí tu compañera puede montar directamente su Landing Page de inicio.
            </p>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="text-center text-xs text-[var(--text-muted)] py-4">
        Coinstellation Platform © {new Date().getFullYear()} — Todos los derechos reservados.
      </footer>
    </div>
  );
}
