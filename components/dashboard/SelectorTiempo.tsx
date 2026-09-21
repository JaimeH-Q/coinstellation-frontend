"use client";

import React, { useState, useRef, useEffect } from "react";

export type TipoRangoTiempo = "hoy" | "ayer" | "7dias" | "mes" | "personalizado";

export interface SelectorTiempoProps {
  rangoActual: TipoRangoTiempo;
  fechaSeleccionada: Date;
  onSeleccionarRango: (rango: TipoRangoTiempo, fecha?: Date) => void;
}

const NOMBRES_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

export default function SelectorTiempo({
  rangoActual,
  fechaSeleccionada,
  onSeleccionarRango,
}: SelectorTiempoProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Estado para la navegación del mini-calendario (mes y año visibles)
  const [mesVisible, setMesVisible] = useState(fechaSeleccionada.getMonth());
  const [anioVisible, setAnioVisible] = useState(fechaSeleccionada.getFullYear());

  // Cerrar al hacer clic fuera o presionar escape
  useEffect(() => {
    const manejarClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    if (abierto) {
      document.addEventListener("mousedown", manejarClickFuera);
      document.addEventListener("keydown", manejarTecla);
    }
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
      document.removeEventListener("keydown", manejarTecla);
    };
  }, [abierto]);

  // Obtener etiqueta amigable del rango seleccionado
  const obtenerEtiquetaRango = () => {
    switch (rangoActual) {
      case "hoy":
        return "Hoy";
      case "ayer":
        return "Ayer";
      case "7dias":
        return "Últimos 7 días";
      case "mes":
        return "Este mes";
      case "personalizado":
        return `${fechaSeleccionada.getDate()} ${NOMBRES_MESES[fechaSeleccionada.getMonth()].slice(0, 3)} ${fechaSeleccionada.getFullYear()}`;
      default:
        return "Seleccionar periodo";
    }
  };

  // Navegación de mes en calendario
  const mesAnterior = () => {
    if (mesVisible === 0) {
      setMesVisible(11);
      setAnioVisible((a) => a - 1);
    } else {
      setMesVisible((m) => m - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesVisible === 11) {
      setMesVisible(0);
      setAnioVisible((a) => a + 1);
    } else {
      setMesVisible((m) => m + 1);
    }
  };

  // Cálculo de días para la cuadrícula del calendario
  const primerDiaSemana = new Date(anioVisible, mesVisible, 1).getDay();
  const totalDiasMes = new Date(anioVisible, mesVisible + 1, 0).getDate();

  const manejarClickDia = (dia: number) => {
    const nuevaFecha = new Date(anioVisible, mesVisible, dia);
    onSeleccionarRango("personalizado", nuevaFecha);
    setAbierto(false);
  };

  return (
    <div className="relative inline-block text-left" ref={contenedorRef}>
      {/* Botón disparador del selector */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#095a86]"
        aria-haspopup="true"
        aria-expanded={abierto}
      >
        <i className="fa-regular fa-calendar text-[#095a86] text-xs"></i>
        <span>{obtenerEtiquetaRango()}</span>
        <i
          className={`fa-solid fa-chevron-down text-[10px] text-[var(--text-secondary)] transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {/* Mini ventana desplegable (Popover) */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-[320px] sm:w-[340px] rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl p-4 z-50 animate-in fade-in duration-150 text-left">
          {/* Opciones predefinidas rápidas */}
          <div className="mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block mb-2">
              Periodos rápidos
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "hoy" as TipoRangoTiempo, label: "Hoy" },
                { id: "ayer" as TipoRangoTiempo, label: "Ayer" },
                { id: "7dias" as TipoRangoTiempo, label: "Últimos 7 días" },
                { id: "mes" as TipoRangoTiempo, label: "Este mes" },
              ].map((opcion) => {
                const activo = rangoActual === opcion.id;
                return (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => {
                      onSeleccionarRango(opcion.id);
                      setAbierto(false);
                    }}
                    className={`py-1.5 px-2.5 rounded-[4px] text-xs font-bold transition-colors cursor-pointer text-left flex items-center justify-between ${
                      activo
                        ? "bg-[#095a86] text-white"
                        : "border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    }`}
                  >
                    <span>{opcion.label}</span>
                    {activo && <i className="fa-solid fa-check text-[10px]"></i>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3">
            {/* Cabecera del mini calendario con navegación */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                {NOMBRES_MESES[mesVisible]} {anioVisible}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={mesAnterior}
                  className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xs"
                  aria-label="Mes anterior"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                </button>
                <button
                  type="button"
                  onClick={mesSiguiente}
                  className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xs"
                  aria-label="Mes siguiente"
                >
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DIAS_SEMANA.map((dia) => (
                <span
                  key={dia}
                  className="text-[10px] font-bold text-[var(--text-muted)] py-1"
                >
                  {dia}
                </span>
              ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Espacios vacíos antes del primer día */}
              {Array.from({ length: primerDiaSemana }).map((_, i) => (
                <div key={`vacio-${i}`} className="w-8 h-8"></div>
              ))}

              {/* Días del mes */}
              {Array.from({ length: totalDiasMes }).map((_, i) => {
                const dia = i + 1;
                const esSeleccionado =
                  rangoActual === "personalizado" &&
                  fechaSeleccionada.getDate() === dia &&
                  fechaSeleccionada.getMonth() === mesVisible &&
                  fechaSeleccionada.getFullYear() === anioVisible;

                const esHoy =
                  new Date().getDate() === dia &&
                  new Date().getMonth() === mesVisible &&
                  new Date().getFullYear() === anioVisible;

                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => manejarClickDia(dia)}
                    className={`w-8 h-8 mx-auto rounded-[4px] text-xs font-bold transition-colors flex items-center justify-center cursor-pointer ${
                      esSeleccionado
                        ? "bg-[#095a86] text-white shadow-xs"
                        : esHoy
                        ? "border border-[#095a86] text-[#095a86] hover:bg-[#095a86]/10"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
