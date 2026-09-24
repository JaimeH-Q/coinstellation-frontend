"use client";

import React, { useState } from "react";
import { CONFIG_TIPOS, TipoProyecto } from "./SeccionProyectos";

export type EstadoTienda = "online" | "degradado" | "offline";

export interface TiendaMonitoreo {
  id: string;
  nombre: string;
  tipo: TipoProyecto;
  webstoreUrl: string;
  estado: EstadoTienda;
  detalleEstado: string;
}

const TIENDAS_INICIALES: TiendaMonitoreo[] = [
  {
    id: "tienda-minecraft",
    nombre: "Servidor de Minecraft",
    tipo: "Opero un servidor de juegos",
    webstoreUrl: "https://webstore.coinstellation.com/minecraft-server",
    estado: "online",
    detalleEstado: "Todo funciona (Web activa + Plugin conectado).",
  },
  {
    id: "tienda-keys",
    nombre: "Steam & Epic Keys",
    tipo: "Vendedor de claves de juego",
    webstoreUrl: "https://webstore.coinstellation.com/steam-epic-keys",
    estado: "degradado",
    detalleEstado:
      "La web funciona, pero el servidor de juegos no responde al plugin (los usuarios pueden comprar, pero sus beneficios tardarán en entregarse).",
  },
];

export default function EstadoTiendas() {
  const [tiendas] = useState<TiendaMonitoreo[]>(TIENDAS_INICIALES);
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoTienda>("todos");

  const tiendasFiltradas =
    filtroEstado === "todos" ? tiendas : tiendas.filter((t) => t.estado === filtroEstado);

  return (
    <div className="panel p-6 text-left">
      {/* Cabecera del cuadro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="panel-title text-base font-extrabold text-[var(--text-primary)]">
            Estado de las Tiendas
          </h2>
          <p className="page-subtitle text-xs mt-0.5">
            Disponibilidad web y sincronización con el servidor de juegos en tiempo real
          </p>
        </div>

        {/* Filtros rápidos de estado */}
        <div className="flex items-center gap-1">
          {(
            [
              { id: "todos", label: "Todas" },
              { id: "online", label: "Online" },
              { id: "degradado", label: "En Alerta" },
              { id: "offline", label: "Offline" },
            ] as const
          ).map((filtro) => (
            <button
              key={filtro.id}
              type="button"
              onClick={() => setFiltroEstado(filtro.id)}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-colors cursor-pointer ${
                filtroEstado === filtro.id
                  ? "bg-[#095a86] text-white"
                  : "bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla con ÚNICAMENTE Tienda / Plataforma y Estado Actual */}
      <div className="w-full border border-[var(--border-color)] rounded-[6px] overflow-visible">
        <table className="operations-table">
          <thead>
            <tr>
              <th className="w-1/2">Tienda / Plataforma</th>
              <th className="w-1/2">Estado Actual</th>
            </tr>
          </thead>
          <tbody>
            {tiendasFiltradas.map((tienda) => {
              const config = CONFIG_TIPOS[tienda.tipo] || CONFIG_TIPOS["Opero un servidor de juegos"];

              return (
                <tr key={tienda.id}>
                  {/* Columna 1: Tienda / Plataforma */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-[4px] border flex items-center justify-center text-sm shrink-0 ${config.colorBg} ${config.colorTexto}`}
                      >
                        <i className={config.icono}></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-[var(--text-primary)] text-sm truncate">
                          {tienda.nombre}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            {config.etiquetaCorta}
                          </span>
                          <span className="text-[var(--text-muted)]">•</span>
                          <a
                            href={tienda.webstoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#095a86] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Visitar webstore</span>
                            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Columna 2: Estado Actual */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      {tienda.estado === "online" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Online
                        </span>
                      ) : tienda.estado === "degradado" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Degradado / Alerta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Offline
                        </span>
                      )}

                      {/* Ícono de admiración con tooltip descriptivo ampliado */}
                      <div className="relative group/tip inline-flex items-center">
                        <div
                          className="w-5 h-5 rounded-full border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] flex items-center justify-center text-[11px] font-bold cursor-default transition-colors group-hover/tip:border-[#095a86] group-hover/tip:text-[#095a86] group-hover/tip:bg-[#095a86]/10 select-none"
                          aria-label="Descripción del estado"
                        >
                          !
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-72 sm:w-80 p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl text-xs leading-relaxed text-[var(--text-primary)] opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-50 pointer-events-none">
                          <div className="font-bold text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-info text-[#095a86]"></i>
                            <span>Descripción del estado</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {tienda.detalleEstado}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {tiendasFiltradas.length === 0 && (
              <tr>
                <td colSpan={2} className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No hay tiendas registradas con el estado seleccionado ({filtroEstado}).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
