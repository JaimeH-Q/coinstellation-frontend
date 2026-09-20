"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Página Principal / Landing Page: http://localhost:3000/
 */
export default function PaginaInicio() {
  const router = useRouter();
  const [esModoOscuro, setEsModoOscuro] = useState(false);

  // Estados para el Modal de Registro
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verificarContrasena, setVerificarContrasena] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState("");

  // Sincroniza la clase dark-theme en el <body>
  useEffect(() => {
    if (esModoOscuro) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [esModoOscuro]);

  // Si llega con el query param ?registro=true (ej. desde el login), abre el modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registro") === "true") {
        setModalRegistroAbierto(true);
      }
    }
  }, []);

  // Cierra con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalRegistroAbierto(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Manejador del envío del formulario de registro hacia /api/users
  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRegistro("");

    // Validaciones en el cliente
    if (!nombre.trim() || !correo.trim() || !contrasena || !verificarContrasena) {
      setErrorRegistro("Todos los campos son obligatorios.");
      return;
    }

    if (nombre.trim().length < 2) {
      setErrorRegistro("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      setErrorRegistro("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (contrasena.length < 6) {
      setErrorRegistro("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (contrasena !== verificarContrasena) {
      setErrorRegistro("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      setErrorRegistro("Debes confirmar que tienes al menos 18 años y aceptar los términos y la política de privacidad.");
      return;
    }

    try {
      setCargando(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombre.trim(),
          email: correo.trim(),
          password: contrasena,
          confirmPassword: verificarContrasena,
          termsAccepted: aceptaTerminos,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorRegistro(data.error || "No se pudo completar el registro.");
        return;
      }

      const correoRegistrado = correo.trim();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("correo_reciente", correoRegistrado);
      }

      setModalRegistroAbierto(false);
      router.push(`/login?email=${encodeURIComponent(correoRegistrado)}`);
    } catch {
      setErrorRegistro("Ocurrió un error al comunicarse con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalRegistro = () => {
    setErrorRegistro("");
    setModalRegistroAbierto(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 transition-colors duration-300">
      {/* Barra de navegación superior */}
      <header className="flex justify-between items-center max-w-5xl w-full mx-auto">
        <div className="brand-container mb-0">
          <div className="brand-logo-icon">C</div>
          <span className="brand-name">coinstellation</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón para registrarse */}
          <button
            type="button"
            onClick={abrirModalRegistro}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--accent-gray)] hover:opacity-90 text-white transition-opacity shadow flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-user-plus text-xs"></i>
            Registrarse
          </button>

          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            Iniciar Sesión
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

      {/* Hero / Presentación de Inicio */}
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
            {/* Botón principal de Registrarse */}
            <button
              type="button"
              onClick={abrirModalRegistro}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--accent-gray)] hover:opacity-90 text-white font-bold text-sm transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-user-plus text-xs"></i>
              Registrarse
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket text-xs"></i>
              Iniciar Sesión (/login)
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <p>
              ℹ️ <strong>Ruta raíz (/) lista:</strong> Tu compañera puede subir su Landing Page aquí y los botones de registro y acceso ya están integrados con la API backend.
            </p>
          </div>
        </div>
      </main>

      {/* Modal de Registro */}
      {modalRegistroAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="panel w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar modal */}
            <button
              type="button"
              onClick={() => setModalRegistroAbierto(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="text-center mb-6">
              <div className="brand-logo-icon mx-auto mb-2 !w-10 !h-10 text-base">
                C
              </div>
              <h2 className="page-title text-2xl">Crear Cuenta</h2>
            </div>

            <form onSubmit={manejarRegistro} className="flex flex-col gap-3.5">
              {/* Campo Nombre */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="registro-nombre"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Nombre completo
                </label>
                <input
                  id="registro-nombre"
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              {/* Campo Correo */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="registro-correo"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Correo Electrónico
                </label>
                <input
                  id="registro-correo"
                  type="email"
                  placeholder="usuario@coinstellation.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              {/* Campo Contraseña */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="registro-contrasena"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Contraseña
                </label>
                <input
                  id="registro-contrasena"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              {/* Campo Verificar Contraseña */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="registro-verificar-contrasena"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Verificar Contraseña
                </label>
                <input
                  id="registro-verificar-contrasena"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={verificarContrasena}
                  onChange={(e) => setVerificarContrasena(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              {/* Check list: Tengo al menos 18 años y acepto los términos y la política de privacidad */}
              <div className="mt-1 flex items-start gap-2.5 text-left p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]/60">
                <input
                  id="registro-terminos"
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  disabled={cargando}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-[var(--accent-gray)] focus:ring-[var(--accent-gray)] cursor-pointer"
                />
                <label
                  htmlFor="registro-terminos"
                  className="text-xs text-[var(--text-secondary)] leading-relaxed cursor-pointer select-none"
                >
                  Tengo al menos <strong className="text-[var(--text-primary)]">18 años</strong> y acepto los{" "}
                  <Link href="/legal" target="_blank" className="text-[var(--text-primary)] underline font-medium hover:opacity-80">
                    términos
                  </Link>{" "}
                  y la{" "}
                  <Link href="/legal" target="_blank" className="text-[var(--text-primary)] underline font-medium hover:opacity-80">
                    política de privacidad
                  </Link>
                  .
                </label>
              </div>

              {/* Mensaje de advertencia justo encima del botón */}
              {errorRegistro && (
                <div className="text-red-500 text-xs font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-sm"></i>
                  <span>{errorRegistro}</span>
                </div>
              )}

              {/* Botón de Enviar Registro */}
              <button
                type="submit"
                disabled={cargando}
                className="mt-3 w-full py-3 px-4 rounded-lg bg-[var(--accent-gray)] hover:opacity-90 text-white font-bold text-sm transition-all shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cargando ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-plus text-xs"></i>
                    <span>Registrarse</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-bold text-[var(--text-primary)] hover:underline"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página */}
      <footer className="text-center text-xs text-[var(--text-muted)] py-4">
        Coinstellation Platform © {new Date().getFullYear()} — Todos los derechos reservados.
      </footer>
    </div>
  );
}
