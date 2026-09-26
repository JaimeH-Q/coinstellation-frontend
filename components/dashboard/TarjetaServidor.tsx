"use client";

import React, { useEffect, useState } from "react";
import type { GameServerDTO } from "@/backend/packages/PackageTypes";
import { copiarTexto } from "./copiarTexto";

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Conexión del servidor de juego del usuario: el plugin usa la clave (X-Server-Key)
 * para consultar los comandos pagados y confirmar su ejecución.
 */
export default function TarjetaServidor() {
  const [servidor, setServidor] = useState<GameServerDTO | null>(null);
  const [nombre, setNombre] = useState("");
  const [clave, setClave] = useState<string | null>(null);
  const [copiada, setCopiada] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    fetch("/api/server", { cache: "no-store" })
      .then((respuesta) => respuesta.json())
      .then((data: { server?: GameServerDTO | null; error?: string }) => {
        if (!vigente) return;
        if (data.error) throw new Error(data.error);
        setServidor(data.server ?? null);
        setNombre(data.server?.name ?? "");
      })
      .catch((err: unknown) => {
        if (vigente) setError(err instanceof Error ? err.message : "No se pudo consultar el servidor.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const guardarServidor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      servidor &&
      !window.confirm("Se generará una clave nueva y el plugin con la clave anterior dejará de recibir comandos. ¿Continuar?")
    ) {
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre.trim() }),
      });
      const data: { server?: GameServerDTO; serverKey?: string; error?: string } = await respuesta.json();

      if (!respuesta.ok || !data.server || !data.serverKey) {
        throw new Error(data.error ?? "No se pudo conectar el servidor.");
      }

      setServidor(data.server);
      setClave(data.serverKey);
      setCopiada(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const copiarClave = async () => {
    if (!clave) return;
    if (await copiarTexto(clave)) {
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2000);
    } else {
      setError("No se pudo copiar la clave: selecciónala y cópiala con Ctrl+C.");
    }
  };

  return (
    <div className="rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <i className="fa-solid fa-server text-[#095a86]"></i>
            Servidor de juego
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            El plugin de tu servidor usa esta clave para recibir los comandos de los paquetes pagados.
          </p>
        </div>
        {servidor && (
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              {servidor.lastSeenAt
                ? `Última conexión: ${formatearFechaHora(servidor.lastSeenAt)}`
                : "El plugin todavía no se conectó"}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
              {servidor.pendingCommands} {servidor.pendingCommands === 1 ? "comando pendiente" : "comandos pendientes"}
            </span>
          </div>
        )}
      </div>

      {cargando ? (
        <p className="text-xs text-[var(--text-muted)]">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Consultando servidor...
        </p>
      ) : (
        <form onSubmit={guardarServidor} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del servidor (ej. Mythic Network)"
            aria-label="Nombre del servidor"
            required
            maxLength={100}
            className="flex-1 px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-main)] text-xs text-[var(--text-primary)] outline-none focus:border-[#095a86]"
          />
          <button
            type="submit"
            disabled={guardando || !nombre.trim()}
            className="px-3.5 py-2 rounded-[6px] bg-[#095a86] hover:bg-[#0b6fa5] text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {guardando ? "Guardando..." : servidor ? "Regenerar clave" : "Conectar servidor"}
          </button>
        </form>
      )}

      {clave && (
        <div className="mt-3 p-3 rounded-[8px] border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-[var(--text-primary)]">Clave del servidor</span>
            <button
              type="button"
              onClick={copiarClave}
              className="px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[11px] font-bold text-[var(--text-primary)] cursor-pointer"
            >
              <i className={`fa-solid ${copiada ? "fa-check text-emerald-500" : "fa-copy"} mr-1`}></i>
              {copiada ? "Copiada" : "Copiar"}
            </button>
          </div>
          <code className="block break-all text-[11px] font-mono text-[var(--text-primary)]">{clave}</code>
          <p className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400">
            Pégala en la configuración del plugin. Solo se muestra ahora.
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-[11px] text-rose-500">{error}</p>}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="p-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)]">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">GET</span> /api/plugin/commands
          <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">
            X-Server-Key · comandos pagados pendientes (con %p% y %am% ya reemplazados)
          </span>
        </div>
        <div className="p-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)]">
          <span className="font-bold text-blue-600 dark:text-blue-400">POST</span> /api/plugin/commands/ack
          <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">
            {'{ "ids": [...] }'} · confirma los comandos ejecutados
          </span>
        </div>
      </div>
    </div>
  );
}
