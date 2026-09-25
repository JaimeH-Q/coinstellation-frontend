"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Página de Acceso (Login / Registro integrado): http://localhost:3000/login
 */
export default function PaginaLogin() {
  const router = useRouter();
  const inputContrasenaRef = useRef<HTMLInputElement>(null);

  // Modo: "login" o "registro"
  const [modo, setModo] = useState<"login" | "registro">("login");

  // Campos de formulario
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verificarContrasena, setVerificarContrasena] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Estados de interfaz y feedback
  const [esModoOscuro, setEsModoOscuro] = useState(false);
  const [temaInicializado, setTemaInicializado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [recuerdame, setRecuerdame] = useState(false);
  const [modalOlvido, setModalOlvido] = useState(false);
  const [correoOlvido, setCorreoOlvido] = useState("");
  const [mensajeOlvidoExito, setMensajeOlvidoExito] = useState(false);

  // Carga inicial del tema desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("coinstellation-theme");
      if (temaGuardado === "dark") {
        setEsModoOscuro(true);
      }
      setTemaInicializado(true);
    }
  }, []);

  // Sincroniza la clase dark-theme en el <body>
  useEffect(() => {
    if (!temaInicializado) return;
    if (esModoOscuro) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("coinstellation-theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("coinstellation-theme", "light");
    }
  }, [esModoOscuro, temaInicializado]);

  // Si viene con un correo desde URL o si viene con parámetro de registro o recuerdame
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailQuery = params.get("email");
      const correoAlmacenado = sessionStorage.getItem("correo_reciente");
      const correoRecordado = localStorage.getItem("coinstellation_correo_recordado");
      const estaRecordado = localStorage.getItem("coinstellation_recuerdame") === "true";
      const modoQuery = params.get("modo") || (params.get("registro") === "true" ? "registro" : null);

      if (modoQuery === "registro") {
        setModo("registro");
      }

      if (estaRecordado) {
        setRecuerdame(true);
      }

      const correoFinal = emailQuery || correoAlmacenado || (estaRecordado ? correoRecordado : "");
      if (correoFinal) {
        setCorreo(correoFinal);
        setCorreoOlvido(correoFinal);

        // Foco inmediato en el campo de contraseña si estamos en login
        setTimeout(() => {
          inputContrasenaRef.current?.focus();
        }, 150);
      }
    }
  }, []);

  // Cambiar entre pestaña Login y Registro
  const cambiarModo = (nuevoModo: "login" | "registro") => {
    setErrorMsg("");
    setModo(nuevoModo);
    if (nuevoModo === "login") {
      setTimeout(() => {
        inputContrasenaRef.current?.focus();
      }, 100);
    }
  };

  // Manejador del envío del formulario de Login
  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!correo.trim() || !contrasena) {
      setErrorMsg("Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      setCargando(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: correo.trim(),
          password: contrasena,
          remember: recuerdame,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Correo o contraseña incorrectos.");
        return;
      }

      // La sesión vive en una cookie httpOnly que puso el servidor; acá solo recordamos el correo.
      if (typeof window !== "undefined") {
        localStorage.removeItem("usuario_sesion");
        sessionStorage.removeItem("correo_reciente");

        if (recuerdame) {
          localStorage.setItem("coinstellation_recuerdame", "true");
          localStorage.setItem("coinstellation_correo_recordado", correo.trim());
        } else {
          localStorage.removeItem("coinstellation_recuerdame");
          localStorage.removeItem("coinstellation_correo_recordado");
        }
      }

      // Solo se aceptan rutas internas para evitar redirecciones abiertas.
      const siguiente = new URLSearchParams(window.location.search).get("next");
      const destino =
        siguiente && siguiente.startsWith("/") && !siguiente.startsWith("//")
          ? siguiente
          : "/dashboard";
      router.replace(destino);
      router.refresh();
    } catch {
      setErrorMsg("Hubo un error de conexión al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  // Manejador del envío del formulario de Registro integrado
  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombre.trim() || !correo.trim() || !contrasena || !verificarContrasena) {
      setErrorMsg("Todos los campos son obligatorios.");
      return;
    }

    if (nombre.trim().length < 2) {
      setErrorMsg("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      setErrorMsg("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (contrasena.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (contrasena !== verificarContrasena) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      setErrorMsg("Debes confirmar que tienes al menos 18 años y aceptar los términos y la política de privacidad.");
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
        setErrorMsg(data.error || "No se pudo completar el registro.");
        return;
      }

      // Registro exitoso: cambiamos al modo login manteniendo el correo precargado
      const correoGuardado = correo.trim();
      setContrasena("");
      setVerificarContrasena("");
      setModo("login");

      setTimeout(() => {
        inputContrasenaRef.current?.focus();
      }, 150);
    } catch {
      setErrorMsg("Ocurrió un error al comunicarse con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // Manejador del envío de recuperación de contraseña
  const manejarRecuperacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoOlvido.trim()) return;
    setMensajeOlvidoExito(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        esModoOscuro ? "bg-[#0b0f19] text-[#f9fafb]" : "bg-[#f8fafc] text-[#1e293b]"
      }`}
    >
      {/* Barra superior: blanco en modo claro y negro en modo oscuro */}
      <header
        className={`w-full border-b transition-colors duration-300 px-6 py-3.5 sticky top-0 z-30 ${
          esModoOscuro
            ? "bg-black border-neutral-900 text-white"
            : "bg-white border-slate-200 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        }`}
      >
        <div className="flex justify-between items-center max-w-5xl w-full mx-auto">
          <Link href="/" className="brand-container !mb-0 cursor-pointer flex items-center gap-2.5 my-auto">
            <div className="brand-logo-icon">C</div>
            <span
              className={`brand-name font-bold transition-colors duration-300 ${
                esModoOscuro ? "text-white" : "text-slate-900"
              }`}
            >
              coinstellation
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setEsModoOscuro(!esModoOscuro)}
            className="header-action-btn cursor-pointer"
            aria-label="Cambiar tema"
            title={esModoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <i className={esModoOscuro ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>
        </div>
      </header>

      {/* Tarjeta Central de Autenticación */}
      <main className="flex-1 flex items-center justify-center p-6 my-6">
        <div className="panel w-full max-w-md shadow-lg">
          <div className="text-center mb-6">
            <h1 className="page-title text-2xl">
              {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h1>
          </div>

          {/* ================= FORMULARIO DE INICIO DE SESIÓN ================= */}
          {modo === "login" && (
            <form onSubmit={manejarLogin} className="flex flex-col gap-4">
              {/* Campo Usuario o Correo */}
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
                  placeholder="usuario@coinstellation.com"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setCorreoOlvido(e.target.value);
                  }}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#095a86] transition-colors"
                />
              </div>

              {/* Campo Contraseña con texto y botón "¿Olvidaste tu contraseña?" arriba */}
              <div className="flex flex-col gap-1 text-left">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="contrasena"
                    className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCorreoOlvido(correo);
                      setMensajeOlvidoExito(false);
                      setModalOlvido(true);
                    }}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  ref={inputContrasenaRef}
                  id="contrasena"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#095a86] transition-colors"
                />
              </div>

              {/* Check list / Casilla: Recuérdame */}
              <div className="flex items-center gap-2 text-left">
                <input
                  id="recuerdame"
                  type="checkbox"
                  checked={recuerdame}
                  onChange={(e) => setRecuerdame(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border-color)] text-[#095a86] focus:ring-[#095a86] cursor-pointer"
                />
                <label
                  htmlFor="recuerdame"
                  className="text-xs font-medium text-[var(--text-secondary)] select-none cursor-pointer"
                >
                  Recuérdame
                </label>
              </div>

              {/* Mensaje de advertencia justo encima del botón */}
              {errorMsg && (
                <div className="text-red-500 text-xs font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-sm"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="mt-2 w-full py-3 px-4 rounded-lg bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-sm transition-all shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cargando ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>
          )}

          {/* ================= FORMULARIO DE REGISTRO INTEGRADO ================= */}
          {modo === "registro" && (
            <form onSubmit={manejarRegistro} className="flex flex-col gap-3.5">
              {/* Campo Nombre */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="reg-nombre"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Nombre completo
                </label>
                <input
                  id="reg-nombre"
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#095a86] transition-colors"
                />
              </div>

              {/* Campo Correo */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="reg-correo"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Correo Electrónico
                </label>
                <input
                  id="reg-correo"
                  type="email"
                  placeholder="usuario@coinstellation.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#095a86] transition-colors"
                />
              </div>

              {/* Campo Contraseña */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="reg-contrasena"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Contraseña
                </label>
                <input
                  id="reg-contrasena"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#095a86] transition-colors"
                />
              </div>

              {/* Campo Verificar Contraseña */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="reg-verificar-contrasena"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Verificar Contraseña
                </label>
                <input
                  id="reg-verificar-contrasena"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={verificarContrasena}
                  onChange={(e) => setVerificarContrasena(e.target.value)}
                  required
                  disabled={cargando}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#095a86] transition-colors"
                />
              </div>

              {/* Check list: Tengo al menos 18 años y acepto los términos y la política de privacidad */}
              <div className="mt-1 flex items-start gap-2.5 text-left p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]/60">
                <input
                  id="reg-terminos"
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  disabled={cargando}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-[#095a86] focus:ring-[#095a86] cursor-pointer"
                />
                <label
                  htmlFor="reg-terminos"
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
              {errorMsg && (
                <div className="text-red-500 text-xs font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-sm"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón de Enviar Registro */}
              <button
                type="submit"
                disabled={cargando}
                className="mt-2 w-full py-3 px-4 rounded-lg bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-sm transition-all shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          )}

          {/* Alternar entre Iniciar Sesión y Registrarse */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center flex flex-col items-center gap-3">
            {modo === "login" ? (
              <p className="text-xs text-[var(--text-secondary)]">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => cambiarModo("registro")}
                  className="font-bold underline text-[var(--text-primary)] hover:opacity-80 cursor-pointer"
                >
                  Regístrate
                </button>
              </p>
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => cambiarModo("login")}
                  className="font-bold underline text-[var(--text-primary)] hover:opacity-80 cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Modal / Diálogo: ¿Olvidaste tu contraseña? */}
      {modalOlvido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="panel w-full max-w-sm shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOlvido(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>

            <div className="text-center mb-4">
              <div className="brand-logo-icon mx-auto mb-2 !w-10 !h-10 text-sm">
                <i className="fa-solid fa-key"></i>
              </div>
              <h3 className="page-title text-xl mb-1">Recuperar Contraseña</h3>
              <p className="page-subtitle text-xs">
                Ingresa tu correo y te enviaremos las instrucciones de recuperación.
              </p>
            </div>

            {mensajeOlvidoExito ? (
              <div className="flex flex-col gap-4 text-center">
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Si existe una cuenta asociada a <strong>{correoOlvido}</strong>, recibirás un correo con las instrucciones para restablecer tu contraseña.
                </div>
                <button
                  type="button"
                  onClick={() => setModalOlvido(false)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={manejarRecuperacion} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 text-left">
                  <label
                    htmlFor="correo-recuperacion"
                    className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Correo Electrónico
                  </label>
                  <input
                    id="correo-recuperacion"
                    type="email"
                    placeholder="tu@correo.com"
                    value={correoOlvido}
                    onChange={(e) => setCorreoOlvido(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-main) text-(--text-primary) text-sm focus:outline-none focus:border-[#095a86] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-1 w-full py-2.5 px-4 rounded-lg bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Enviar Instrucciones
                </button>
              </form>
            )}
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
