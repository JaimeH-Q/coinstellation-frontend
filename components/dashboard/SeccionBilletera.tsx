"use client";

import React, { useState } from "react";

export default function SeccionBilletera() {
  const [saldo] = useState("128,450.00");
  const direccion = "0x71C...B29aE4F89d2";

  return (
    <section className="w-full text-left">
      <div className="mb-6">
        <h1 className="page-title text-2xl font-extrabold">Billetera de Plataforma</h1>
        <p className="page-subtitle text-xs sm:text-sm">
          Gestión de saldos, liquidaciones y transferencias del ecosistema Coinstellation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Tarjeta de Saldo */}
        <div className="panel p-6 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
            Saldo Total Disponible
          </span>
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              ${saldo}
            </h2>
            <span className="text-sm font-bold text-[var(--text-secondary)]">USD</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[4px] bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] font-semibold">Dirección de Red:</span>
              <span className="font-mono text-[var(--text-primary)] font-bold">{direccion}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-500">
              Red Principal Conectada
            </span>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              className="py-2.5 px-4 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <i className="fa-solid fa-arrow-down text-xs"></i>
              <span>Depositar Fondos</span>
            </button>

            <button
              type="button"
              className="py-2.5 px-4 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-up text-xs"></i>
              <span>Transferir a Cuenta Bancaria</span>
            </button>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="panel p-6 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-3">
              Ingresos del Mes
            </span>
            <h3 className="text-2xl font-bold text-emerald-500 mb-1">+$34,810.00</h3>
            <p className="text-xs text-[var(--text-secondary)]">+14.2% respecto al mes anterior</p>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] mt-4">
            <span className="text-xs font-bold text-[var(--text-primary)] block mb-1">Retiros programados</span>
            <p className="text-[11px] text-[var(--text-muted)]">Próxima liquidación automática: 25/09/2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}
