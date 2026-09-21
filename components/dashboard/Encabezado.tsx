"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Estados de usuario
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [correoUsuario, setCorreoUsuario] = useState("usuario@coinstellation.com");

  // Estados de menús y ventanas emergentes
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [menuNotificacionesAbierto, setMenuNotificacionesAbierto] = useState(false);
  const [modalProyectosAbierto, setModalProyectosAbierto] = useState(false);
  const [modalBilleteraAbierto, setModalBilleteraAbierto] = useState(false);

  const refMenuUsuario = useRef<HTMLDivElement>(null);
  const refMenuNotificaciones = useRef<HTMLDivElement>(null);

  // Carga de datos de sesión del usuario
  useEffect(() => {
    if (typeof window !== "undefined") {
      const guardado = localStorage.getItem("usuario_sesion");
      if (guardado) {
        try {
          const user = JSON.parse(guardado);
          if (user.name) setNombreUsuario(user.name);
          if (user.email) setCorreoUsuario(user.email);
        } catch {
          // ignore
        }
      }
    }
  }, []);

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
        setModalProyectosAbierto(false);
        setModalBilleteraAbierto(false);
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
  const iniciales = nombreUsuario
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("") || "CO";

  // Cerrar sesión
  const cerrarSesion = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("usuario_sesion");
    }
    router.push("/login");
  };

  return (
    <div className="w-full mb-8">
      {/* ================= BARRA DEL ENCABEZADO ================= */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        {/* LADO IZQUIERDO: Título y descripción de la pantalla */}
        <div className="text-left">
          <h1 className="page-title text-xl sm:text-2xl font-extrabold">{titulo}</h1>
          <p className="page-subtitle text-xs sm:text-sm">{subtitulo}</p>
        </div>

        {/* LADO DERECHO: Botones Notificaciones, Proyectos, Billetera y Usuario con ventana emergente */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
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
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl p-3 z-50 animate-in fade-in duration-150">
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

          {/* Botón de Proyectos (sin icono y con border radius más cuadrado) */}
          <button
            type="button"
            onClick={() => setModalProyectosAbierto(true)}
            className="px-3.5 py-1.5 h-9 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-primary)] flex items-center transition-all shadow-xs cursor-pointer"
          >
            Proyectos
          </button>

          {/* Botón de Billetera (sin icono y con border radius más cuadrado) */}
          <button
            type="button"
            onClick={() => setModalBilleteraAbierto(true)}
            className="px-3.5 py-1.5 h-9 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-primary)] flex items-center transition-all shadow-xs cursor-pointer"
          >
            Billetera
          </button>

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

            {/* Ventana Emergente del Usuario (alineada a la derecha) */}
            {menuUsuarioAbierto && (
              <div className="absolute right-0 mt-2 w-64 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                {/* Cabecera del perfil */}
                <div className="p-3 mb-1 rounded-[4px] bg-[var(--bg-main)] text-left">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{nombreUsuario}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">{correoUsuario}</p>
                </div>

                {/* Opciones del menú emergente */}
                <div className="flex flex-col gap-1 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuUsuarioAbierto(false);
                      setModalProyectosAbierto(true);
                    }}
                    className="w-full px-3 py-2 rounded-[4px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-folder-tree text-xs text-[var(--text-secondary)]"></i>
                    <span>Mis Proyectos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuUsuarioAbierto(false);
                      setModalBilleteraAbierto(true);
                    }}
                    className="w-full px-3 py-2 rounded-[4px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-wallet text-xs text-[var(--text-secondary)]"></i>
                    <span>Mi Billetera</span>
                  </button>

                  {/* Selector de Modo Oscuro / Claro mantenido en la ventana emergente */}
                  <button
                    type="button"
                    onClick={() => {
                      alAlternarModoOscuro();
                    }}
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
      </header>

      {/* ================= MODAL DE PROYECTOS ================= */}
      {modalProyectosAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="panel w-full max-w-lg shadow-2xl relative rounded-[6px]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setModalProyectosAbierto(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-[4px] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            <div className="flex items-center gap-2.5 mb-4 text-left">
              <div className="w-8 h-8 rounded-[4px] bg-[#095a86] text-white flex items-center justify-center">
                <i className="fa-solid fa-folder-tree text-sm"></i>
              </div>
              <div>
                <h3 className="page-title text-lg mb-0.5">Gestor de Proyectos</h3>
                <p className="page-subtitle text-xs">Ecosistemas vinculados a tu cuenta</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 my-4 text-left">
              <div className="p-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Coinstellation Core Node</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Nodo validador principal — Red Activa</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-[3px] bg-emerald-500/10 text-emerald-500">
                  En línea
                </span>
              </div>
              <div className="p-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Subastas Descentralizadas</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Módulo DeFi de liquidación rápida</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-[3px] bg-indigo-500/10 text-indigo-500">
                  Sincronizado
                </span>
              </div>
              <div className="p-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Filtros de Transferencia v2</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Mecanismo de seguridad y enrutamiento</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-[3px] bg-amber-500/10 text-amber-500">
                  Auditoría
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalProyectosAbierto(false)}
              className="w-full py-2.5 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL DE BILLETERA ================= */}
      {modalBilleteraAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="panel w-full max-w-md shadow-2xl relative rounded-[6px]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setModalBilleteraAbierto(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-[4px] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            <div className="flex items-center gap-2.5 mb-4 text-left">
              <div className="w-8 h-8 rounded-[4px] bg-[#095a86] text-white flex items-center justify-center">
                <i className="fa-solid fa-wallet text-sm"></i>
              </div>
              <div>
                <h3 className="page-title text-lg mb-0.5">Billetera de Plataforma</h3>
                <p className="page-subtitle text-xs">Balances y direcciones de liquidación</p>
              </div>
            </div>

            <div className="p-4 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] my-4 text-left">
              <p className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-secondary)] mb-1">
                Saldo Total Disponible
              </p>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-3">
                $128,450.00 <span className="text-xs font-semibold text-[var(--text-secondary)]">USD</span>
              </h2>
              <div className="p-2.5 rounded-[4px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] flex justify-between items-center text-[var(--text-secondary)]">
                <span className="font-mono truncate max-w-[200px]">0x71C...B29aE4F</span>
                <span className="text-emerald-500 font-bold">Conectada</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                className="py-2.5 px-3 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-down text-[10px]"></i>
                Depositar
              </button>
              <button
                type="button"
                className="py-2.5 px-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-up text-[10px]"></i>
                Transferir
              </button>
            </div>

            <button
              type="button"
              onClick={() => setModalBilleteraAbierto(false)}
              className="w-full py-2.5 rounded-[4px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
