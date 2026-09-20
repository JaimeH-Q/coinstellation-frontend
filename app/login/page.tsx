"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Página de Inicio de Sesión: http://localhost:3000/login
 */
export default function PaginaLogin() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [esModoOscuro, setEsModoOscuro] = useState(false);

  // Sincroniza la clase dark-theme en el <body>
  useEffect(() => {
    if (esModoOscuro) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [esModoOscuro]);

  // Manejador del envío del formulario de login
  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes conectar tu API de autenticación real.
    // Una vez autenticado, redirigimos al usuario al dashboard:
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 transition-colors duration-300">
      {/* Barra superior con selector de tema */}
      <header className="flex justify-between items-center max-w-5xl w-full mx-auto">
        <Link href="/" className="brand-container mb-0 cursor-pointer">
          <div className="brand-logo-icon">C</div>
          <span className="brand-name">coinstellation</span>
        </Link>

        <button
          type="button"
          onClick={() => setEsModoOscuro(!esModoOscuro)}
          className="header-action-btn"
          aria-label="Cambiar tema"
          title={esModoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <i className={esModoOscuro ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
        </button>
      </header>

      {/* Tarjeta Central de Inicio de Sesión */}
      <main className="flex-1 flex items-center justify-center my-8">
        <div className="panel w-full max-w-md shadow-lg">
          <div className="text-center mb-6">
            <h1 className="page-title text-2xl mb-1">Iniciar Sesión</h1>
            <p className="page-subtitle">Ingresa tus credenciales para acceder a Coinstellation</p>
          </div>

          <form onSubmit={manejarLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-left">
              <label
                htmlFor="correo"
                className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Usuario o Correo
              </label>
              <input
                id="correo"
                type="text"
                placeholder="admin@coinstellation.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label
                htmlFor="contrasena"
                className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 px-4 rounded-lg bg-[var(--accent-gray)] hover:opacity-90 text-white font-bold text-sm transition-all shadow cursor-pointer"
            >
              Iniciar Sesión y Entrar al Dashboard
            </button>
          </form>

          {/* Enlace directo rápido para desarrollo */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
            <p className="text-xs text-[var(--text-muted)] mb-2">
              ¿Quieres ir directamente al panel durante el desarrollo?
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] hover:underline"
            >
              Abrir Dashboard directamente (/dashboard)
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
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
