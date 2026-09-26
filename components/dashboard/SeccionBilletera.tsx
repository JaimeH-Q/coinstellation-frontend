"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isValidStellarPublicKey } from "@/backend/stellar/address";
import type { WalletDTO } from "@/backend/wallet/WalletTypes";
import { copiarTexto } from "./copiarTexto";

function urlCuenta(red: string, direccion: string) {
  return `https://stellar.expert/explorer/${red === "public" ? "public" : "testnet"}/account/${direccion}`;
}

function formatearSaldo(monto: string) {
  const valor = Number(monto);
  return Number.isFinite(valor)
    ? valor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 })
    : monto;
}

async function leerError(respuesta: Response, porDefecto: string) {
  try {
    const data: { error?: string } = await respuesta.json();
    return data.error ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

export default function SeccionBilletera() {
  const [billetera, setBilletera] = useState<WalletDTO | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [copiada, setCopiada] = useState(false);

  const cargar = useCallback(async () => {
    const respuesta = await fetch("/api/wallet", { cache: "no-store" });
    if (!respuesta.ok) throw new Error(await leerError(respuesta, "No se pudo cargar la billetera."));
    const data: { wallet: WalletDTO } = await respuesta.json();
    return data.wallet;
  }, []);

  useEffect(() => {
    let vigente = true;

    cargar()
      .then((wallet) => {
        if (!vigente) return;
        setBilletera(wallet);
        setEditando(!wallet.walletAddress);
      })
      .catch((err: unknown) => {
        if (vigente) setError(err instanceof Error ? err.message : "No se pudo cargar la billetera.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [cargar]);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(null), 3500);
  };

  const actualizar = async () => {
    setActualizando(true);
    setError(null);
    try {
      setBilletera(await cargar());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la billetera.");
    } finally {
      setActualizando(false);
    }
  };

  const guardarWallet = async (nuevaDireccion: string | null) => {
    setGuardando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: nuevaDireccion }),
      });

      if (!respuesta.ok) {
        setError(await leerError(respuesta, "No se pudo guardar la wallet."));
        return;
      }

      const data: { wallet: WalletDTO } = await respuesta.json();
      setBilletera(data.wallet);
      setEditando(!data.wallet.walletAddress);
      setDireccion("");
      mostrarMensaje(nuevaDireccion ? "Wallet guardada." : "Wallet eliminada.");
    } catch {
      setError("Error de conexión al guardar la wallet.");
    } finally {
      setGuardando(false);
    }
  };

  const manejarGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = direccion.trim().toUpperCase();

    if (!isValidStellarPublicKey(valor)) {
      setError("La dirección no es válida. Debe ser una wallet pública de Stellar: empieza con G y tiene 56 caracteres.");
      return;
    }

    void guardarWallet(valor);
  };

  const quitarWallet = () => {
    if (!window.confirm("¿Quitar tu wallet de cobro? Las nuevas simulaciones de pago no tendrán dirección precargada.")) return;
    void guardarWallet(null);
  };

  const copiarDireccion = async () => {
    if (!billetera?.walletAddress) return;
    if (await copiarTexto(billetera.walletAddress)) {
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2000);
    } else {
      setError("No se pudo copiar la dirección: selecciónala y cópiala con Ctrl+C.");
    }
  };

  const direccionValida = isValidStellarPublicKey(direccion.trim().toUpperCase());
  const esTestnet = billetera?.network !== "public";
  const cuenta = billetera?.account ?? null;

  return (
    <section className="w-full text-left">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title text-2xl font-extrabold">Billetera</h1>
          <p className="page-subtitle text-xs sm:text-sm">
            Wallet pública de Stellar donde recibes los pagos de tus paquetes
          </p>
        </div>
        {billetera?.walletAddress && (
          <button
            type="button"
            onClick={actualizar}
            disabled={actualizando}
            className="px-4 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-xs cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs ${actualizando ? "animate-spin" : ""}`}></i>
            <span>{actualizando ? "Actualizando..." : "Actualizar saldo"}</span>
          </button>
        )}
      </div>

      {mensaje && (
        <div className="mb-4 p-3 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{mensaje}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-[4px] bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation text-sm"></i>
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="panel p-12 text-center text-xs text-[var(--text-muted)]">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Cargando billetera...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ================= WALLET DE COBRO ================= */}
          <div className="panel p-6 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs lg:col-span-2 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                  Wallet de cobro
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Se precarga al simular pagos en la sección API. Tus integraciones deben enviarla como{" "}
                  <code className="text-[11px]">destination</code> al crear un pago.
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-[3px] border ${
                  esTestnet
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}
              >
                {esTestnet ? "Stellar Testnet" : "Stellar Mainnet"}
              </span>
            </div>

            {billetera?.walletAddress && !editando ? (
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-[4px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                  <code className="block break-all font-mono text-xs font-bold text-[var(--text-primary)]">
                    {billetera.walletAddress}
                  </code>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copiarDireccion}
                    className="px-3 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <i className={`fa-solid ${copiada ? "fa-check text-emerald-500" : "fa-copy"} mr-1.5`}></i>
                    {copiada ? "Copiada" : "Copiar"}
                  </button>
                  <a
                    href={urlCuenta(billetera.network, billetera.walletAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-[11px] transition-colors"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square mr-1.5"></i>
                    Ver en stellar.expert
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setDireccion(billetera.walletAddress ?? "");
                      setError(null);
                      setEditando(true);
                    }}
                    className="px-3 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-pen mr-1.5"></i>
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={quitarWallet}
                    disabled={guardando}
                    className="px-3 py-1.5 rounded-[4px] text-red-500 hover:bg-red-500/10 font-bold text-[11px] cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <i className="fa-solid fa-trash-can mr-1.5"></i>
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={manejarGuardar} className="flex flex-col gap-2">
                <label
                  htmlFor="wallet-publica"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Dirección pública (G…)
                </label>
                <input
                  id="wallet-publica"
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="GABC…XYZ (56 caracteres)"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs font-mono focus:outline-none focus:border-[#095a86] transition-colors"
                />
                <p className="text-[11px] text-[var(--text-muted)]">
                  Pega solo la dirección <strong>pública</strong>. Nunca compartas tu clave secreta (la que empieza con S).
                  {direccion.trim() && !direccionValida && (
                    <span className="block mt-1 text-rose-500">
                      {direccion.trim().toUpperCase().startsWith("S")
                        ? "Eso parece una clave secreta: no la pegues aquí."
                        : "Dirección inválida: revisa que esté completa y sin errores."}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="submit"
                    disabled={guardando || !direccionValida}
                    className="px-4 py-2 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardando ? "Guardando..." : "Guardar wallet"}
                  </button>
                  {billetera?.walletAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(false);
                        setError(null);
                      }}
                      className="px-4 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] font-bold text-xs cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Estado de la cuenta en la red */}
            {billetera?.walletAddress && !editando && (
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-3">
                  Saldo en la red
                </span>

                {billetera.accountError ? (
                  <p className="text-xs text-rose-500">{billetera.accountError}</p>
                ) : cuenta && !cuenta.exists ? (
                  <div className="p-3 rounded-[4px] bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400">
                    <strong>Esta cuenta todavía no existe en la red.</strong> Necesita recibir al menos 1 XLM para
                    activarse; hasta entonces los pagos a esta wallet van a fallar.
                  </div>
                ) : cuenta ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cuenta.balances.map((saldo) => (
                        <div
                          key={`${saldo.code}-${saldo.issuer ?? "native"}`}
                          className="p-3 rounded-[4px] bg-[var(--bg-main)] border border-[var(--border-subtle)]"
                        >
                          <span className="text-[10px] font-bold text-[var(--text-muted)] block">
                            {saldo.code}
                            {saldo.issuer && (
                              <span className="font-mono font-normal ml-1" title={saldo.issuer}>
                                · {saldo.issuer.slice(0, 4)}…{saldo.issuer.slice(-4)}
                              </span>
                            )}
                          </span>
                          <strong className="text-lg font-extrabold text-[var(--text-primary)]">
                            {formatearSaldo(saldo.amount)}
                          </strong>
                        </div>
                      ))}
                    </div>

                    {!cuenta.acceptsUsdc && (
                      <div className="p-3 rounded-[4px] bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400">
                        <strong>Esta wallet no acepta USDC.</strong> Para cobrar paquetes en USDC, agrega el activo USDC
                        (trustline) desde tu wallet. Hasta entonces, los pagos en USDC a esta dirección van a fallar.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* ================= COBRADO ESTE MES ================= */}
          <div className="panel p-6 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-col justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-3">
                Cobrado este mes
              </span>
              {billetera && billetera.incomeThisMonth.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {billetera.incomeThisMonth.map((ingreso) => (
                    <div key={ingreso.currency}>
                      <h3 className="text-2xl font-bold text-emerald-500">
                        +{formatearSaldo(ingreso.amount)} {ingreso.currency}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {ingreso.payments} {ingreso.payments === 1 ? "pago completado" : "pagos completados"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">Todavía no hay pagos completados este mes.</p>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <Link
                href="/dashboard/historial-pagos"
                className="text-xs font-bold text-[var(--text-primary)] hover:underline inline-flex items-center gap-1.5"
              >
                Ver historial de pagos
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
