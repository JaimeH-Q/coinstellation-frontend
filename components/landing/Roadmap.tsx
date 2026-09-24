"use client";

import React, { useState } from "react";

interface PasoRoadmap {
  id: number;
  numero: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  posicion: "top" | "bottom";
}

const pasos: PasoRoadmap[] = [
  {
    id: 0,
    numero: "01",
    categoria: "Cuenta",
    titulo: "Regístrate gratis",
    descripcion: "Crea tu cuenta en 1 minuto sin tarjeta.",
    posicion: "top"
  },
  {
    id: 1,
    numero: "02",
    categoria: "Catálogo",
    titulo: "Arma tu tienda",
    descripcion: "Agrega rangos, ítems y fija sus precios.",
    posicion: "bottom",
  },
  {
    id: 2,
    numero: "03",
    categoria: "Publicación",
    titulo: "Publica tu tienda",
    descripcion: "Comparte la tienda con tu comunidad.",
    posicion: "top",
  },
  {
    id: 3,
    numero: "04",
    categoria: "Ventas",
    titulo: "Genera ganancias",
    descripcion: "Visualiza estadísticas en tiempo real y gestiona tus ingresos desde un solo lugar.",
    posicion: "bottom",
  },
];

export default function Roadmap() {
  const [pasosRevisados, setPasosRevisados] = useState<number[]>([0]);

  const alternarPaso = (id: number) => {
    setPasosRevisados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const porcentaje = Math.round((pasosRevisados.length / pasos.length) * 100);

  return (
    <section
      className="coin-roadmap"
      aria-label="Roadmap de configuración de Coinstellation"
    >
      <div className="coin-roadmap-header">
        <div className="coin-roadmap-mark" aria-hidden="true">
          C
        </div>
        <p className="coin-roadmap-eyebrow">COINSTELLATION / CONFIGURACIÓN</p>
        <h2>
          Prepara tu tienda en <span>Coinstellation</span>
        </h2>
        <p className="coin-roadmap-copy">
          Completa estos pasos antes de compartir tu tienda con tus clientes.
        </p>
        <div className="coin-roadmap-meta">
          <span className="coin-roadmap-dot"></span>
          <span>Progreso de configuración</span>
          <strong id="coin-roadmap-progress">{porcentaje}% revisado</strong>
        </div>
      </div>

      <div className="coin-roadmap-track">
        <div className="coin-roadmap-path" aria-hidden="true">
          <span></span>
          <b></b>
        </div>
        <div className="coin-roadmap-steps">
          {pasos.map((paso) => {
            const estaRevisado = pasosRevisados.includes(paso.id);
            return (
              <article
                key={paso.id}
                className={`coin-roadmap-step coin-roadmap-step-${paso.posicion} ${estaRevisado ? "is-reviewed" : ""
                  }`}
                data-roadmap-step={paso.id}
                tabIndex={0}
                role="button"
                aria-label={`Paso ${paso.numero}: ${paso.titulo}`}
                onClick={() => alternarPaso(paso.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    alternarPaso(paso.id);
                  }
                }}
              >
                <div className="coin-roadmap-connector">
                  <i></i>
                </div>
                <div className="coin-roadmap-card">
                  <div className="coin-roadmap-heading">
                    <span>{paso.numero}</span>
                    <b>{paso.categoria}</b>
                  </div>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.descripcion}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
