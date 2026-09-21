import React from "react";

export interface TarjetaEstadisticaProps {
  titulo: string;
  valor: string;
  tendencia?: string;
  descripcion?: string;
  icono?: string;
}

export default function TarjetaEstadistica({
  titulo,
  valor,
  tendencia,
  descripcion,
  icono,
}: TarjetaEstadisticaProps) {
  return (
    <article className="stat-card">
      <div className="stat-header flex items-center justify-between">
        <span className="stat-title">{titulo}</span>
        {icono && (
          <div className="w-7 h-7 rounded-[4px] bg-[#095a86]/10 text-[#095a86] flex items-center justify-center text-xs">
            <i className={icono}></i>
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
