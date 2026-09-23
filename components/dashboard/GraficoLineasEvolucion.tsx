"use client";

import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export interface DatosGraficoLineas {
  etiquetas: string[];
  ingresos: number[];
  pedidos: number[];
  totalIngresos: string;
  totalPedidos: number;
}

interface GraficoLineasEvolucionProps {
  datos: DatosGraficoLineas;
  esModoOscuro?: boolean;
}

export default function GraficoLineasEvolucion({
  datos,
  esModoOscuro = false,
}: GraficoLineasEvolucionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Gradiente suave para Ingresos (#095a86)
    const gradienteIngresos = ctx.createLinearGradient(0, 0, 0, 260);
    gradienteIngresos.addColorStop(0, "rgba(9, 90, 134, 0.28)");
    gradienteIngresos.addColorStop(1, "rgba(9, 90, 134, 0.0)");

    // Gradiente suave para Pedidos (#10b981)
    const gradientePedidos = ctx.createLinearGradient(0, 0, 0, 260);
    gradientePedidos.addColorStop(0, "rgba(16, 185, 129, 0.22)");
    gradientePedidos.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    const colorRejilla = esModoOscuro ? "#1f2937" : "#f1f5f9";
    const colorEtiquetas = esModoOscuro ? "#9ca3af" : "#64748b";

    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: datos.etiquetas,
        datasets: [
          {
            label: "Ingresos ($)",
            data: datos.ingresos,
            borderColor: "#095a86",
            backgroundColor: gradienteIngresos,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: esModoOscuro ? "#0b0f19" : "#ffffff",
            pointBorderColor: "#095a86",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: "y",
          },
          {
            label: "Pedidos",
            data: datos.pedidos,
            borderColor: "#10b981",
            backgroundColor: gradientePedidos,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: esModoOscuro ? "#0b0f19" : "#ffffff",
            pointBorderColor: "#10b981",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false, // La leyenda personalizada está en el encabezado
          },
          tooltip: {
            backgroundColor: esModoOscuro ? "#111827" : "#1e293b",
            titleColor: "#ffffff",
            bodyColor: "#f3f4f6",
            titleFont: { family: "Nunito", size: 12, weight: 800 },
            bodyFont: { family: "Nunito", size: 12 },
            padding: 12,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: {
              label: function (context) {
                const datasetLabel = context.dataset.label || "";
                const val = context.parsed.y ?? 0;
                if (datasetLabel.includes("Ingresos")) {
                  return ` Ingresos: $${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
                return ` Pedidos: ${val} pedidos completados`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colorEtiquetas,
              font: { family: "Nunito", size: 11, weight: 600 },
            },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            grid: { color: colorRejilla },
            ticks: {
              color: "#095a86",
              font: { family: "Nunito", size: 10, weight: 700 },
              callback: (val) => {
                const num = Number(val);
                return num >= 1000 ? `$${(num / 1000).toFixed(1)}k` : `$${num}`;
              },
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              color: "#10b981",
              font: { family: "Nunito", size: 10, weight: 700 },
              stepSize: 5,
              callback: (val) => `${val}`,
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [datos, esModoOscuro]);

  return (
    <div className="panel flex flex-col justify-between h-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="panel-title text-base font-bold">Evolución Temporal</h2>
          <p className="page-subtitle text-xs mt-0.5">
            Comportamiento cruzado entre ingresos generados y cantidad de pedidos
          </p>
        </div>

        {/* Leyenda interactiva con totales del periodo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#095a86]/10 border border-[#095a86]/30">
            <span className="w-2.5 h-2.5 rounded-full bg-[#095a86]"></span>
            <span className="text-xs font-bold text-[#095a86]">
              Ingresos: <strong className="text-[var(--text-primary)]">{datos.totalIngresos}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Pedidos: <strong className="text-[var(--text-primary)]">{datos.totalPedidos}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Canvas del gráfico de líneas */}
      <div className="relative w-full h-[270px] sm:h-[300px]">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
