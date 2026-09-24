import React from "react";

export interface TarjetaEstadisticaProps {
  titulo: string;
  valor: string;
  tendencia?: string;
  descripcion?: string;
  icono?: string;
  /** Texto explicativo que aparece al pasar el cursor sobre el ícono de ayuda */
  ayuda?: string;
}

export default function TarjetaEstadistica({
  titulo,
  valor,
  tendencia,
  descripcion,
  ayuda,
}: TarjetaEstadisticaProps) {
  return (
    <article className="stat-card">
      <div className="stat-header flex items-center justify-between">
        <span className="stat-title">{titulo}</span>
        {ayuda && (
          <div className="relative group/tip">
            <div
              className="w-6 h-6 rounded-full border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] flex items-center justify-center text-[11px] font-bold cursor-default transition-colors group-hover/tip:border-[#095a86] group-hover/tip:text-[#095a86] group-hover/tip:bg-[#095a86]/10 select-none"
            >
              !
            </div>
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 px-3.5 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl text-xs leading-relaxed text-[var(--text-primary)] opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-30 pointer-events-none">
              {ayuda}
            </div>
          </div>
        )}
      </div>
      <div className="stat-value">{valor}</div>
      <div className="stat-footer">
        {tendencia && (
          <span className="stat-trend">
            <i className="fa-solid fa-arrow-up"></i> {tendencia}
          </span>
        )}
        {descripcion && <span>{descripcion}</span>}
      </div>
    </article>
  );
}
