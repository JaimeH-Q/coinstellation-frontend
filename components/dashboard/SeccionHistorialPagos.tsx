"use client";

import React, { useState, useMemo } from "react";
import { isPaymentCompleted, type Payment } from "@/backend/payments/PaymentsHistory";

interface SeccionHistorialPagosProps {
  pagos: Payment[];
  cargandoPagos: boolean;
  alActualizarPagos: () => void;
}

const ETIQUETA_ESTADO: Record<string, { texto: string; clase: string }> = {
  completed: { texto: "Completado", clase: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  processing: { texto: "Procesando", clase: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  pending: { texto: "Pendiente", clase: "bg-slate-500/10 text-slate-500 border-slate-500/30" },
  failed: { texto: "Fallido", clase: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" },
  cancelled: { texto: "Cancelado", clase: "bg-neutral-500/10 text-neutral-500 border-neutral-500/30" },
  expired: { texto: "Expirado", clase: "bg-neutral-500/10 text-neutral-500 border-neutral-500/30" },
};

function BadgeEstado({ estado, motivo }: { estado: string; motivo?: string | null }) {
  const cfg = ETIQUETA_ESTADO[estado] ?? ETIQUETA_ESTADO.pending;
  return (
    <span
      title={motivo ?? undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.clase}`}
    >
      {cfg.texto}
    </span>
  );
}

/** Texto que identifica qué se cobró: paquete, descripción o referencia de la tienda. */
function conceptoPago(pago: Payment) {
  return pago.packageName ?? pago.description ?? pago.reference ?? "—";
}

function urlTransaccion(pago: Payment) {
  if (!pago.transactionId) return null;
  const red = /test/i.test(pago.asset.network) ? "testnet" : "public";
  return `https://stellar.expert/explorer/${red}/tx/${pago.transactionId}`;
}

function formatearFecha(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function SeccionHistorialPagos({
  pagos,
  cargandoPagos,
  alActualizarPagos,
}: SeccionHistorialPagosProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");

  const pagosFiltrados = useMemo(() => {
    return pagos.filter((p) => {
      const coincideEstado =
        filtroEstado === "todos"
          ? true
          : filtroEstado === "completados"
          ? isPaymentCompleted(p)
          : p.status === filtroEstado;

      const coincideBusqueda =
        busqueda.trim() === ""
          ? true
          : [
              p.id,
              p.cosmosIntentId,
              p.description,
              p.reference,
              p.packageName,
              p.playerName,
              p.asset.currency,
              p.transactionId,
            ].some((campo) => campo?.toLowerCase().includes(busqueda.trim().toLowerCase()));

      return coincideEstado && coincideBusqueda;
    });
  }, [pagos, filtroEstado, busqueda]);

  const completados = pagos.filter(isPaymentCompleted);
  const totalCompletados = completados.length;

  // Total cobrado agrupado por activo (no se suman XLM con USDC).
  const totalesPorActivo = [
    ...completados
      .reduce(
        (mapa, p) => mapa.set(p.asset.currency, (mapa.get(p.asset.currency) ?? 0) + parseFloat(p.amount)),
        new Map<string, number>(),
      )
      .entries(),
  ]
    .map(([moneda, total]) => `${total.toFixed(2)} ${moneda}`)
    .join(" · ");

  return (
    <div className="text-left">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title text-2xl font-extrabold text-[var(--text-primary)]">
            Historial de Pagos
          </h1>
          <p className="page-subtitle text-xs sm:text-sm mt-0.5">
            Registro detallado de transacciones recibidas — datos en tiempo real desde{" "}
            <code className="text-[10px] bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
              /api/payments
            </code>
          </p>
        </div>

        <button
          type="button"
          onClick={alActualizarPagos}
          disabled={cargandoPagos}
          className="px-4 py-2 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className={`fa-solid fa-arrows-rotate text-xs ${cargandoPagos ? "animate-spin" : ""}`}></i>
          <span>{cargandoPagos ? "Actualizando..." : "Actualizar pagos"}</span>
        </button>
      </div>

      {/* Panel principal de tabla de pagos */}
      <div className="panel p-6 text-left">
        {/* Barra de filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            {(
              [
                { id: "todos", label: "Todos" },
                { id: "completados", label: "Completados" },
                { id: "pending", label: "Pendientes" },
                { id: "failed", label: "Fallidos" },
              ] as const
            ).map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                onClick={() => setFiltroEstado(filtro.id)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors cursor-pointer ${
                  filtroEstado === filtro.id
                    ? "bg-[#095a86] text-white"
                    : "bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-muted)]"></i>
            <input
              type="text"
              placeholder="Buscar por jugador, paquete, tx..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#095a86] w-full sm:w-64"
            />
          </div>
        </div>

        {/* Tabla de pagos */}
        <div className="table-container border border-[var(--border-color)] rounded-[6px] overflow-hidden">
          <table className="operations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paquete</th>
                <th>Jugador</th>
                <th>Monto</th>
                <th>Activo</th>
                <th>Estado</th>
                <th>Transacción</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cargandoPagos && pagos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[var(--text-muted)]">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Cargando pagos desde el backend...
                  </td>
                </tr>
              ) : pagosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[var(--text-muted)]">
                    {pagos.length === 0
                      ? "Todavía no recibiste pagos. Crea uno desde la sección API o con tu API key."
                      : "No se encontraron pagos con los filtros seleccionados."}
                  </td>
                </tr>
              ) : (
                pagosFiltrados.map((pago) => (
                  <tr key={pago.id}>
                    <td className="tx-id font-mono text-[11px]">
                      {pago.id.slice(0, 8)}…
                    </td>
                    <td className="text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <i className="fa-solid fa-cube text-[10px] text-[#095a86]"></i>
                        {conceptoPago(pago)}
                      </span>
                    </td>
                    <td className="text-xs font-mono">
                      {pago.playerName ?? <span className="text-[var(--text-muted)]">—</span>}
                    </td>
                    <td className="text-xs font-bold text-[var(--text-primary)]">{pago.amount}</td>
                    <td className="text-xs">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold">{pago.asset.currency}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          ({pago.asset.network})
                        </span>
                      </span>
                    </td>
                    <td>
                      <BadgeEstado estado={pago.status} motivo={pago.failureReason} />
                      {pago.failureReason && (
                        <span className="block mt-1 max-w-[220px] text-[10px] leading-snug text-rose-500">
                          {pago.failureReason}
                        </span>
                      )}
                    </td>
                    <td className="text-xs font-mono">
                      {urlTransaccion(pago) ? (
                        <a
                          href={urlTransaccion(pago) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#095a86] hover:underline"
                          title={pago.transactionId ?? undefined}
                        >
                          {pago.transactionId?.slice(0, 8)}…
                          <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[9px]"></i>
                        </a>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="text-xs text-[var(--text-secondary)]">
                      {formatearFecha(pago.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen al pie */}
        {pagos.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-4">
              <span>
                Mostrando <strong className="text-[var(--text-primary)]">{pagosFiltrados.length}</strong> de {pagos.length} transacciones
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                <i className="fa-solid fa-circle-check mr-1 text-[10px]"></i>
                {totalCompletados} completadas
              </span>
            </div>

            {totalesPorActivo && (
              <div>
                Total cobrado: <strong className="text-[var(--text-primary)]">{totalesPorActivo}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
