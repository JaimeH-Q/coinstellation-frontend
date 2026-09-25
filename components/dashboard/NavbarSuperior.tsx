"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UsuarioSesion } from "@/app/dashboard/DashboardShell";

interface NavbarSuperiorProps {
  seccionActiva: string;
  usuario: UsuarioSesion;
  esModoOscuro: boolean;
  alAlternarModoOscuro: () => void;
}

export default function NavbarSuperior({
  seccionActiva,
  usuario,
  esModoOscuro,
  alAlternarModoOscuro,
}: NavbarSuperiorProps) {
  const router = useRouter();

  const nombreUsuario = usuario.name;
  const correoUsuario = usuario.email;

  // Estados de menús emergentes
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [menuNotificacionesAbierto, setMenuNotificacionesAbierto] = useState(false);

  const refMenuUsuario = useRef<HTMLDivElement>(null);
  const refMenuNotificaciones = useRef<HTMLDivElement>(null);

  // Cierra menús al hacer clic fuera o pulsar Escape
  useEffect(() => {
    const manejarClickFuera = (e: MouseEvent) => {
      if (refMenuUsuario.current && !refMenuUsuario.current.contains(e.target as Node)) {
        setMenuUsuarioAbierto(false);
      }
      if (refMenuNotificaciones.current && !refMenuNotificaciones.current.contains(e.target as Node)) {
        setMenuNotificacionesAbierto(false);
      }
    };

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuUsuarioAbierto(false);
        setMenuNotificacionesAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    document.addEventListener("keydown", manejarEscape);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
      document.removeEventListener("keydown", manejarEscape);
    };
  }, []);

  // Iniciales del usuario para el avatar
  const iniciales =
    nombreUsuario
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((palabra) => palabra[0].toUpperCase())
      .join("") || "CO";

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <header className="w-full bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 py-2.5 sticky top-0 z-40 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4 min-h-[38px]">
        {/* Lado izquierdo: Logo y texto Coinstellation centrados verticalmente */}
        <div className="flex items-center">
          <Link href="/" className="brand-container !mb-0 cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2.5 my-auto">
            <div className="brand-logo-icon">C</div>
            <span className="brand-name">coinstellation</span>
          </Link>
        </div>

        {/* Lado derecho: Notificaciones, Proyectos, Billetera y Usuario con ventana emergente */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Botón de Notificaciones con ventana emergente */}
          <div className="relative" ref={refMenuNotificaciones}>
            <button
              type="button"
              onClick={() => {
                setMenuNotificacionesAbierto(!menuNotificacionesAbierto);
                setMenuUsuarioAbierto(false);
              }}
              className="relative w-9 h-9 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Notificaciones"
              title="Notificaciones del sistema"
            >
              <i className="fa-regular fa-bell text-sm"></i>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[var(--bg-card)]"></span>
            </button>

            {/* Ventana emergente de Notificaciones */}
            {menuNotificacionesAbierto && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl p-3 z-50 animate-in fade-in duration-150 text-left">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Notificaciones</h4>
                  <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-[3px]">
                    3 nuevas
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="p-2 rounded-[4px] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] transition-colors text-left cursor-pointer">
                    <p className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Nodo Principal Activo</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">La sincronización con el bloque 14,892 se completó.</p>
                  </div>
                  <div className="p-2 rounded-[4px] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] transition-colors text-left cursor-pointer">
                    <p className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Alerta de Rendimiento</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">Carga de sistema óptima al 24.5%.</p>
                  </div>
                  <div className="p-2 rounded-[4px] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] transition-colors text-left cursor-pointer">
                    <p className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Subasta Finalizada</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">Se acreditó una transferencia de $45,210.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Proyectos (sin icono, bordes cuadrados) */}
          <Link
            href="/dashboard/proyectos"
            className={`px-3.5 py-1.5 h-9 rounded-[4px] border text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center ${
              seccionActiva === "proyectos"
                ? "bg-[#095a86] text-white border-[#095a86]"
                : "border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
            }`}
          >
            Proyectos
          </Link>

          {/* Botón de Billetera (sin icono, bordes cuadrados) */}
          <Link
            href="/dashboard/billetera"
            className={`px-3.5 py-1.5 h-9 rounded-[4px] border text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center ${
              seccionActiva === "billetera"
                ? "bg-[#095a86] text-white border-[#095a86]"
                : "border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
            }`}
          >
            Billetera
          </Link>

          {/* Nombre del Usuario con flecha para Ventana Emergente */}
          <div className="relative" ref={refMenuUsuario}>
            <button
              type="button"
              onClick={() => {
                setMenuUsuarioAbierto(!menuUsuarioAbierto);
                setMenuNotificacionesAbierto(false);
              }}
              className="px-3 py-1.5 h-9 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer"
              aria-haspopup="true"
              aria-expanded={menuUsuarioAbierto}
            >
              <div className="w-6 h-6 rounded-[3px] bg-[#095a86] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {iniciales}
              </div>
              <span className="max-w-[120px] truncate">{nombreUsuario}</span>
              <i
                className={`fa-solid fa-chevron-down text-[9px] text-[var(--text-secondary)] transition-transform duration-200 ${
                  menuUsuarioAbierto ? "rotate-180 text-[var(--text-primary)]" : ""
                }`}
              ></i>
            </button>

            {/* Ventana Emergente del Usuario */}
            {menuUsuarioAbierto && (
              <div className="absolute right-0 mt-2 w-64 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl p-2 z-50 animate-in fade-in duration-150 text-left">
                {/* Cabecera del perfil */}
                <div className="p-3 mb-1 rounded-[4px] bg-[var(--bg-main)] text-left">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{nombreUsuario}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">{correoUsuario}</p>
                </div>

                {/* Opciones del menú emergente */}
                <div className="flex flex-col gap-1 text-left">
                  <Link
                    href="/dashboard/proyectos"
                    onClick={() => setMenuUsuarioAbierto(false)}
                    className="w-full px-3 py-2 rounded-[4px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-folder-tree text-xs text-[var(--text-secondary)]"></i>
                    <span>Mis Proyectos</span>
                  </Link>

                  <Link
                    href="/dashboard/billetera"
                    onClick={() => setMenuUsuarioAbierto(false)}
                    className="w-full px-3 py-2 rounded-[4px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-wallet text-xs text-[var(--text-secondary)]"></i>
                    <span>Mi Billetera</span>
                  </Link>

                  {/* Selector de Modo Oscuro / Claro mantenido en la ventana emergente */}
                  <button
                    type="button"
                    onClick={() => alAlternarModoOscuro()}
                    className="w-full px-3 py-2 rounded-[4px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <i className={esModoOscuro ? "fa-solid fa-sun text-xs text-amber-400" : "fa-solid fa-moon text-xs text-indigo-400"}></i>
                      <span>Tema {esModoOscuro ? "Claro" : "Oscuro"}</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                      {esModoOscuro ? "Dark" : "Light"}
                    </span>
                  </button>

                  <div className="my-1 border-t border-[var(--border-subtle)]"></div>

                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="w-full px-3 py-2 rounded-[4px] text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
