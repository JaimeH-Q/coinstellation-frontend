"use client";

import React, { useEffect, useRef } from "react";

import { Chart } from "chart.js/auto";

interface GraficoRecursosProps {
  esModoOscuro?: boolean;
  memoriaTotal?: string;
  usoActual?: string;
  porcentajeUso?: number;
}

export default function GraficoRecursos({
  esModoOscuro = false,
  memoriaTotal = "64 GB",
  usoActual = "24.8 GB",
  porcentajeUso = 38.75,
}: GraficoRecursosProps) {
  // Referencia al elemento <canvas> del DOM
  const lienzoRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!lienzoRef.current) return;

    const ctx = lienzoRef.current.getContext("2d");
    if (!ctx) return;

    // Crear degradado suave según si está en modo claro u oscuro
    const gradiente = ctx.createLinearGradient(0, 0, 0, 160);
    if (esModoOscuro) {
      gradiente.addColorStop(0, "rgba(148, 163, 184, 0.25)");
      gradiente.addColorStop(1, "rgba(148, 163, 184, 0.0)");
    } else {
      gradiente.addColorStop(0, "rgba(71, 85, 105, 0.15)");
      gradiente.addColorStop(1, "rgba(71, 85, 105, 0.0)");
    }

    const colorLinea = esModoOscuro ? "#94a3b8" : "#475569";
    const colorRejilla = esModoOscuro ? "#1f2937" : "#f1f5f9";
    const colorEtiquetas = esModoOscuro ? "#6b7280" : "#94a3b8";

    // Inicializamos el gráfico Chart.js
    const instanciaGrafico = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Ahora"],
        datasets: [
          {
            label: "Uso de Memoria (GB)",
            data: [18.2, 19.5, 22.0, 28.4, 21.1, 23.5, 24.8],
            borderColor: colorLinea,
            borderWidth: 2,
            pointBackgroundColor: esModoOscuro ? "#111827" : "#ffffff",
            pointBorderColor: colorLinea,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradiente,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: esModoOscuro ? "#1f2937" : "#1e293b",
            titleColor: esModoOscuro ? "#f9fafb" : "#ffffff",
            bodyColor: esModoOscuro ? "#e5e7eb" : "#ffffff",
            titleFont: { family: "Nunito", size: 12, weight: 800 },
            bodyFont: { family: "Nunito", size: 12 },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y} GB utilizados`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colorEtiquetas,
              font: { family: "Nunito", size: 10, weight: 600 },
            },
          },
          y: {
            min: 10,
            max: 40,
            grid: { color: colorRejilla },
            ticks: {
              color: colorEtiquetas,
              font: { family: "Nunito", size: 10, weight: 600 },
              stepSize: 10,
              callback: (val) => `${val}GB`,
            },
          },
        },
      },
    });

    // Limpieza al desmontar o antes de volver a ejecutar useEffect
    return () => {
      instanciaGrafico.destroy();
    };
  }, [esModoOscuro]);

  return (
    <div className="panel resource-panel">
      <div className="panel-header">
        <h2 className="panel-title">Uso de Recursos</h2>
      </div>

      {/* Contenedor del Canvas para el gráfico */}
      <div className="chart-wrapper">
        <canvas ref={lienzoRef}></canvas>
      </div>

      {/* Métricas de Memoria */}
      <div className="resource-metrics">
        <div className="metric-row">
          <span className="metric-label">Memoria total asignada</span>
          <span className="metric-value">{memoriaTotal}</span>
        </div>

        <div className="metric-row">
          <span className="metric-label">Uso actual</span>
          <span className="metric-value">
            {usoActual}{" "}
            <span style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.82rem" }}>
              ({porcentajeUso}%)
            </span>
          </span>
        </div>

        {/* Barra visual de progreso */}
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${porcentajeUso}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
