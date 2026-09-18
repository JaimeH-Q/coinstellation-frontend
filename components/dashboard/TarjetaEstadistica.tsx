import React from "react";

export interface TarjetaEstadisticaProps {
  titulo: string;
  valor: string;
  tendencia?: string;
  descripcion?: string;
}
export default function TarjetaEstadistica({
  titulo,
  valor,
  tendencia,
  descripcion,
}: TarjetaEstadisticaProps) {
  return (
    <article className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{titulo}</span>
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
