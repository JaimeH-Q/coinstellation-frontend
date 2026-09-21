"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ModalRegistroProps {
  estaAbierto: boolean;
  onCerrar: () => void;
}

export default function ModalRegistro({
  estaAbierto,
  onCerrar,
}: ModalRegistroProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verificarContrasena, setVerificarContrasena] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState("");

  // Cierra con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCerrar();
      }
    };
    if (estaAbierto) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [estaAbierto, onCerrar]);

  if (!estaAbierto) return null;

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
      setErrorRegistro(
        "Debes confirmar que tienes al menos 18 años y aceptar los términos y la política de privacidad."
      );
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

      onCerrar();
      router.push(`/login?email=${encodeURIComponent(correoRegistrado)}`);
    } catch {
      setErrorRegistro("Ocurrió un error al comunicarse con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onCerrar}
    >
      <div
        className="panel w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto bg-[#11151d] text-[#f8fafc] p-6 rounded-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          type="button"
          onClick={onCerrar}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="text-center mb-6">
          <div className="logo-icon mx-auto mb-2 !w-10 !h-10 text-base">
            C
          </div>
          <h2 className="text-2xl font-bold">Crear Cuenta</h2>
        </div>

        <form onSubmit={manejarRegistro} className="flex flex-col gap-3.5">
          {/* Nombre */}
          <div className="flex flex-col gap-1 text-left">
            <label
              htmlFor="registro-nombre"
              className="text-xs font-bold uppercase tracking-wider text-gray-400"
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
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a1128] text-white text-sm focus:outline-none focus:border-[#7dd3fc] transition-colors"
            />
          </div>

          {/* Correo */}
          <div className="flex flex-col gap-1 text-left">
            <label
              htmlFor="registro-correo"
              className="text-xs font-bold uppercase tracking-wider text-gray-400"
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
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a1128] text-white text-sm focus:outline-none focus:border-[#7dd3fc] transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1 text-left">
            <label
              htmlFor="registro-contrasena"
              className="text-xs font-bold uppercase tracking-wider text-gray-400"
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
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a1128] text-white text-sm focus:outline-none focus:border-[#7dd3fc] transition-colors"
            />
          </div>

          {/* Confirmar Contraseña */}
          <div className="flex flex-col gap-1 text-left">
            <label
              htmlFor="registro-verificar-contrasena"
              className="text-xs font-bold uppercase tracking-wider text-gray-400"
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
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a1128] text-white text-sm focus:outline-none focus:border-[#7dd3fc] transition-colors"
            />
          </div>

          {/* Términos y Condiciones */}
          <div className="mt-1 flex items-start gap-2.5 text-left p-3 rounded-lg border border-white/10 bg-white/5">
            <input
              id="registro-terminos"
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              disabled={cargando}
              className="mt-0.5 h-4 w-4 rounded border-gray-600 text-sky-400 focus:ring-sky-400 cursor-pointer"
            />
            <label
              htmlFor="registro-terminos"
              className="text-xs text-gray-300 leading-relaxed cursor-pointer select-none"
            >
              Tengo al menos <strong className="text-white">18 años</strong> y
              acepto los{" "}
              <Link
                href="/legal"
                target="_blank"
                className="text-sky-300 underline font-medium hover:opacity-80"
              >
                términos
              </Link>{" "}
              y la{" "}
              <Link
                href="/legal"
                target="_blank"
                className="text-sky-300 underline font-medium hover:opacity-80"
              >
                política de privacidad
              </Link>
              .
            </label>
          </div>

          {/* Error */}
          {errorRegistro && (
            <div className="text-red-400 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-sm"></i>
              <span>{errorRegistro}</span>
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={cargando}
            className="mt-3 w-full py-3 px-4 rounded-lg bg-[#00f2fe] hover:opacity-90 text-[#071018] font-bold text-sm transition-all shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-gray-400">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-bold text-sky-400 hover:underline"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
