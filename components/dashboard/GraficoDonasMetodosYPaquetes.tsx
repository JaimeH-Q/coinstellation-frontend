"use client";

import React, { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export interface ItemDistribucion {
  nombre: string;
  porcentaje: number;
  monto: string;
  color: string;
  icono?: string;
}

export interface DatosDistribucion {
  metodosPago: ItemDistribucion[];
  categoriasPaquetes: ItemDistribucion[];
}

interface GraficoDonasMetodosYPaquetesProps {
  datos: DatosDistribucion;
  esModoOscuro?: boolean;
}

export default function GraficoDonasMetodosYPaquetes({
  datos,
  esModoOscuro = false,
}: GraficoDonasMetodosYPaquetesProps) {
  // Pestaña activa: "metodos" o "categorias"
  const [pestañaActiva, setPestañaActiva] = useState<"metodos" | "categorias">("metodos");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const listaActual = pestañaActiva === "metodos" ? datos.metodosPago : datos.categoriasPaquetes;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: listaActual.map((item) => item.nombre),
        datasets: [
          {
            data: listaActual.map((item) => item.porcentaje),
            backgroundColor: listaActual.map((item) => item.color),
            borderColor: esModoOscuro ? "#111827" : "#ffffff",
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            display: false, // Usamos la lista de badges personalizada para mayor claridad
          },
          tooltip: {
            backgroundColor: esModoOscuro ? "#1f2937" : "#1e293b",
            titleColor: "#ffffff",
            bodyColor: "#f3f4f6",
            titleFont: { family: "Nunito", size: 12, weight: 800 },
            bodyFont: { family: "Nunito", size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const item = listaActual[index];
                return ` ${item.nombre}: ${item.porcentaje}% (${item.monto})`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [pestañaActiva, listaActual, esModoOscuro]);

  return (
    <div className="panel flex flex-col justify-between h-full text-left">
      <div>
        {/* Cabecera con selector de pestaña */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="panel-title text-base font-bold">Distribución</h2>

          {/* Segmented Control / Pestañas */}
          <div className="inline-flex p-0.5 rounded-[5px] bg-[var(--bg-main)] border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setPestañaActiva("metodos")}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                pestañaActiva === "metodos"
                  ? "bg-[#095a86] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Métodos de Pago
            </button>
            <button
              type="button"
              onClick={() => setPestañaActiva("categorias")}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                pestañaActiva === "categorias"
                  ? "bg-[#095a86] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Categorías
            </button>
          </div>
        </div>

        <p className="page-subtitle text-xs mb-3">
          {pestañaActiva === "metodos"
            ? "Preferencia de pago de tu comunidad (PayPal, Stripe, Pix/OXXO)"
            : "Artículos y paquetes más populares en tu tienda"}
        </p>

        {/* Dona central con texto en medio */}
        <div className="relative w-full h-[150px] flex items-center justify-center my-2">
          <canvas ref={canvasRef}></canvas>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              Principal
            </span>
            <span className="text-sm font-extrabold text-[var(--text-primary)]">
              {listaActual[0]?.nombre || ""}
            </span>
            <span className="text-[11px] font-bold text-[#095a86]">
              {listaActual[0]?.porcentaje}%
            </span>
          </div>
        </div>
      </div>

      {/* Lista detallada de métodos o categorías con badges y barras */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-subtle)] mt-2">
        {listaActual.map((item) => (
          <div key={item.nombre} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="font-semibold text-[var(--text-primary)]">{item.nombre}</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-[var(--text-secondary)] text-[11px]">{item.monto}</span>
              <span
                className="px-1.5 py-0.5 rounded-[3px] text-[10px]"
                style={{
                  backgroundColor: `${item.color}20`,
                  color: item.color,
                }}
              >
                {item.porcentaje}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
