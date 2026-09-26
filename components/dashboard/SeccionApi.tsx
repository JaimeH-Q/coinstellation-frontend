"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDashboardLayout } from "@/app/dashboard/DashboardShell";
import type { PackageDTO } from "@/backend/packages/PackageTypes";
import type { WalletDTO } from "@/backend/wallet/WalletTypes";
import { copiarTexto } from "./copiarTexto";

interface Transaccion {
  id: string;
  text: string;
  amount: string;
  status: string;
}

interface CosmosPaymentResponse {
  id: string;
  uri: string | null;
  qr: string | null;
  network: string;
  destination: string;
  amount: string | null;
  /** "native" para XLM. */
  asset: string;
  memo: string;
}

// Si no se configura PUBLIC_API_URL, se usa la URL desde la que se abre el dashboard.
const suscribirseSinCambios = () => () => {};
const leerOrigen = () => window.location.origin;
const origenEnServidor = () => "";

interface DatosSnippet {
  baseUrl: string;
  apiKey: string | null;
  packageId: string | null;
  destination: string;
}

/** Ejemplo de integración con los datos reales del usuario (paquete, wallet y URL del servidor). */
function construirSnippet({ baseUrl, apiKey, packageId, destination }: DatosSnippet) {
  return `// Llamar desde el BACKEND de tu tienda: la API key es secreta.
const response = await fetch("${baseUrl || "https://TU_SERVIDOR"}/api/payments/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Store-Key": "${apiKey ?? "TU_API_KEY"}"
  },
  body: JSON.stringify({
    packageId: "${packageId ?? "ID_DEL_PAQUETE"}", // monto y activo salen del paquete
    playerName: "Steve",       // jugador: reemplaza %p% en los comandos
    destination: "${destination || "TU_WALLET_G..."}",
    reference: "orden-1001"    // opcional: tu ID de orden
  })
});

const { payment } = await response.json();
// payment.uri → enlace web+stellar:pay para abrir la wallet del comprador
// payment.qr  → imagen del QR (data URL) para <img src>
// payment.id  → ID del pago para consultar su estado en GET /api/payments`;
}

interface EndpointDoc {
  metodo: "GET" | "POST";
  ruta: string;
  descripcion: string;
  detalles: string[];
  opcional?: boolean;
}

/** Referencia de la API pública para tiendas (coincide con app/api/payments y app/api/packages). */
const REFERENCIA_ENDPOINTS: EndpointDoc[] = [
  {
    metodo: "POST",
    ruta: "/api/payments/create",
    descripcion:
      "Crea el cobro de un paquete. El monto y el activo salen del paquete. Devuelve payment.uri (SEP-7) y payment.qr para que el comprador pague desde su wallet.",
    detalles: [
      "Body: { packageId, playerName, destination, reference?, description? }",
      "playerName: letras, números, _ y . (máx. 32)",
      "destination: tu wallet pública de Stellar (G…)",
      "201 · 401 key inválida · 404 paquete · 422 datos · 502/503 Cosmos",
    ],
  },
  {
    metodo: "GET",
    ruta: "/api/payments",
    descripcion:
      "Pagos de tu cuenta, del más nuevo al más viejo. Un pago pasa a completed solo, hasta ~1 min después de que el comprador paga.",
    detalles: [
      "Query: ?count=50 (1–200) & status=completed",
      "status: pending · processing · completed · failed · cancelled · expired",
      "Buscar tu pago por cosmosIntentId = payment.id",
    ],
  },
  {
    metodo: "GET",
    ruta: "/api/packages",
    descripcion: "Catálogo de tus paquetes y categorías para mostrarlos en la tienda (sin los comandos).",
    detalles: ["Respuesta: { packages: [{ id, name, description, imageUrl, price, currency, categoryId }], categories }"],
  },
  {
    metodo: "POST",
    ruta: "/api/payments/{payment.id}/validate",
    descripcion:
      "Confirma el pago al instante si tu tienda obtiene el hash de la transacción (p. ej. con el WebClient de Cosmos). Si no, se confirma solo.",
    detalles: ["Body: { txHash }", "Respuesta: { payment: { valid, status, reason }, record }"],
    opcional: true,
  },
];

interface SeccionApiProps {
  /** URL pública del servidor (PUBLIC_API_URL en el .env); se muestra en la documentación. */
  urlPublica?: string | null;
}

export default function SeccionApi({ urlPublica = null }: SeccionApiProps) {
  const { usuario } = useDashboardLayout();
  const userId = usuario.id;
  const [tabActiva, setTabActiva] = useState<"dev" | "store">("dev");
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const contadorTransacciones = useRef(0);
  const [copiadoKey, setCopiadoKey] = useState(false);
  const [copiadoCodigo, setCopiadoCodigo] = useState(false);
  const [copiadoUrlPago, setCopiadoUrlPago] = useState(false);
  const [copiadoUrlBase, setCopiadoUrlBase] = useState(false);
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);
  const [simulandoPago, setSimulandoPago] = useState(false);
  const [pagoCosmos, setPagoCosmos] = useState<CosmosPaymentResponse | null>(null);
  const [walletCreador, setWalletCreador] = useState("");
  const [paquetes, setPaquetes] = useState<PackageDTO[]>([]);
  const [paqueteId, setPaqueteId] = useState("");
  const [jugador, setJugador] = useState("");
  const paqueteSeleccionado = paquetes.find((p) => p.id === paqueteId) ?? null;
  const origenActual = useSyncExternalStore(suscribirseSinCambios, leerOrigen, origenEnServidor);
  const baseUrl = urlPublica || origenActual;
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyExists, setApiKeyExists] = useState(false);
  const [cargandoApiKey, setCargandoApiKey] = useState(true);
  const [generandoApiKey, setGenerandoApiKey] = useState(false);
  const [errorApiKey, setErrorApiKey] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    fetch("/api/packages", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { packages: [] }))
      .then((data: { packages?: PackageDTO[] }) => {
        if (!vigente) return;
        const lista = data.packages ?? [];
        setPaquetes(lista);
        setPaqueteId((actual) => actual || lista[0]?.id || "");
      })
      .catch(() => {});

    // Precarga la wallet configurada en Billetera (sin pisar lo que el usuario ya escribió).
    fetch("/api/wallet", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { wallet?: WalletDTO } | null) => {
        const direccion = data?.wallet?.walletAddress;
        if (vigente && direccion) setWalletCreador((actual) => actual || direccion);
      })
      .catch(() => {});

    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    let vigente = true;

    void Promise.resolve()
      .then(async () => {
        const response = await fetch(`/api/users/${encodeURIComponent(userId)}/api-key`, {
          cache: "no-store",
        });
        const data: { hasApiKey?: boolean; error?: string } = await response.json();
        if (!response.ok) throw new Error(data.error ?? "No se pudo consultar la API key.");

        if (vigente) {
          setApiKeyExists(data.hasApiKey === true);
        }
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorApiKey(error instanceof Error ? error.message : "No se pudo consultar la API key.");
        }
      })
      .finally(() => {
        if (vigente) setCargandoApiKey(false);
      });

    return () => {
      vigente = false;
    };
  }, [userId]);

  const mostrarToast = (msg: string) => {
    setMensajeToast(msg);
    setTimeout(() => {
      setMensajeToast(null);
    }, 3000);
  };

  const agregarTransaccion = (texto: string, monto: string, estado: string) => {
    const nuevaTx: Transaccion = {
      // crypto.randomUUID no existe por HTTP (contexto no seguro), así que se usa un contador.
      id: String(++contadorTransacciones.current),
      text: texto,
      amount: monto,
      status: estado,
    };
    setTransacciones((prev) => [nuevaTx, ...prev].slice(0, 7));
    mostrarToast(`Evento registrado: ${texto}`);
  };

  const generarApiKey = async () => {
    setGenerandoApiKey(true);
    setErrorApiKey(null);

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userId)}/api-key`, {
        method: "POST",
      });
      const data: { apiKey?: string; error?: string } = await response.json();
      if (!response.ok || !data.apiKey) {
        throw new Error(data.error ?? "No se pudo generar la API key.");
      }

      setApiKey(data.apiKey);
      setApiKeyExists(true);
      setCopiadoKey(false);
      mostrarToast("API key generada. Copiala ahora; no se volverá a mostrar.");
    } catch (error) {
      setErrorApiKey(error instanceof Error ? error.message : "No se pudo generar la API key.");
    } finally {
      setGenerandoApiKey(false);
    }
  };

  const simularPagoCosmos = async () => {
    if (!walletCreador.trim()) {
      mostrarToast("Introduce la wallet Stellar pública del creador o configúrala en Billetera.");
      return;
    }
    if (!paqueteSeleccionado) {
      mostrarToast("Crea un paquete en la sección Paquetes para simular una compra.");
      return;
    }
    if (!jugador.trim()) {
      mostrarToast("Introduce el nombre del jugador que compra.");
      return;
    }

    setSimulandoPago(true);
    setPagoCosmos(null);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: paqueteSeleccionado.id,
          playerName: jugador.trim(),
          destination: walletCreador.trim(),
          reference: "Simulación desde el dashboard",
        }),
      });
      const data: { payment?: CosmosPaymentResponse; error?: string } = await response.json();

      if (!response.ok || !data.payment) {
        throw new Error(data.error ?? `Error ${response.status} al crear el pago.`);
      }

      setPagoCosmos(data.payment);
      agregarTransaccion(
        `${paqueteSeleccionado.name} para ${jugador.trim()}`,
        `+${paqueteSeleccionado.price} ${paqueteSeleccionado.currency}`,
        "Pending",
      );
      mostrarToast("Intent Cosmos creado. Abre el enlace o escanea el QR para pagar.");
    } catch (error) {
      mostrarToast(error instanceof Error ? error.message : "No se pudo crear el pago Cosmos.");
    } finally {
      setSimulandoPago(false);
    }
  };

  const snippetApi = construirSnippet({
    baseUrl,
    apiKey,
    packageId: paqueteSeleccionado?.id ?? null,
    destination: walletCreador.trim(),
  });

  const copiarAlPortapapeles = async (
    texto: string,
    tipo: "key" | "code" | "paymentUrl" | "baseUrl",
  ) => {
    try {
      if (!(await copiarTexto(texto))) {
        mostrarToast("No se pudo copiar: selecciona el texto y cópialo con Ctrl+C");
        return;
      }
      if (tipo === "key") {
        setCopiadoKey(true);
        setTimeout(() => setCopiadoKey(false), 2000);
      } else if (tipo === "code") {
        setCopiadoCodigo(true);
        setTimeout(() => setCopiadoCodigo(false), 2000);
      } else if (tipo === "paymentUrl") {
        setCopiadoUrlPago(true);
        setTimeout(() => setCopiadoUrlPago(false), 2000);
      } else {
        setCopiadoUrlBase(true);
        setTimeout(() => setCopiadoUrlBase(false), 2000);
      }
      mostrarToast(
        tipo === "key"
          ? "Clave API copiada al portapapeles"
          : tipo === "code"
            ? "Código SDK copiado"
            : tipo === "paymentUrl"
              ? "URL de pago copiada al portapapeles"
              : "URL base copiada al portapapeles",
      );
    } catch {
      mostrarToast("No se pudo copiar al portapapeles");
    }
  };

  return (
    <div className="text-left space-y-6">
      {/* Toast flotante de confirmación */}
      {mensajeToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-[8px] bg-[#095a86] text-white text-xs font-bold shadow-lg flex items-center gap-2 border border-sky-400/30 transition-all animate-bounce">
          <i className="fa-solid fa-circle-check text-sky-200"></i>
          <span>{mensajeToast}</span>
        </div>
      )}

      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-extrabold text-[var(--text-primary)]">
            API
          </h1>
          <p className="page-subtitle text-xs sm:text-sm mt-0.5">
            Gestión de credenciales, entorno interactivo y especificación de endpoints
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={paqueteId}
            onChange={(event) => setPaqueteId(event.target.value)}
            aria-label="Paquete a comprar"
            className="w-44 px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-primary)] outline-none focus:border-[#095a86]"
          >
            {paquetes.length === 0 && <option value="">Sin paquetes</option>}
            {paquetes.map((paquete) => (
              <option key={paquete.id} value={paquete.id}>
                {paquete.name} · {paquete.price} {paquete.currency}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={jugador}
            onChange={(event) => setJugador(event.target.value)}
            placeholder="Jugador: Steve"
            aria-label="Nombre del jugador que compra"
            className="w-32 px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#095a86]"
          />
          <input
            type="text"
            value={walletCreador}
            onChange={(event) => setWalletCreador(event.target.value)}
            placeholder="Wallet creador: G..."
            aria-label="Wallet Stellar pública del creador"
            className="w-52 px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#095a86]"
          />
          <button
            type="button"
            onClick={simularPagoCosmos}
            disabled={simulandoPago}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#095a86] hover:bg-[#0b6fa5] text-white transition-all shadow-sm cursor-pointer"
          >
            <i className="fa-solid fa-bolt"></i>
            {simulandoPago ? "Creando intent..." : "Simular pago"}
          </button>
        </div>
      </div>

      {pagoCosmos && (
        <div className="p-4 rounded-[12px] border border-emerald-500/30 bg-emerald-500/5 text-left">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Intent Cosmos listo</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Red: {pagoCosmos.network} · ID: {pagoCosmos.id}
              </p>
            </div>
            {pagoCosmos.uri && (
              <a
                href={pagoCosmos.uri}
                className="px-3 py-2 rounded-[6px] bg-[#095a86] text-white text-xs font-bold"
              >
                Abrir wallet
              </a>
            )}
          </div>
          {pagoCosmos.qr && (
            <img src={pagoCosmos.qr} alt="QR del pago Cosmos" className="w-40 h-40 bg-white p-2 rounded" />
          )}
          {pagoCosmos.uri && (
            <div className="mt-4 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-[11px] font-extrabold text-[var(--text-primary)]">URL de pago</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Copiala y pegala en tu wallet Stellar si el botón no la abre automáticamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copiarAlPortapapeles(pagoCosmos.uri ?? "", "paymentUrl")}
                  className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[11px] font-bold text-[var(--text-primary)]"
                >
                  <i className={`fa-solid ${copiadoUrlPago ? "fa-check text-emerald-500" : "fa-copy"}`}></i>
                  {copiadoUrlPago ? "Copiada" : "Copiar"}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={pagoCosmos.uri}
                aria-label="URL de pago Cosmos"
                onFocus={(event) => event.currentTarget.select()}
                className="w-full min-w-0 px-3 py-2 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[10px] font-mono text-[var(--text-secondary)] outline-none focus:border-[#095a86]"
              />
            </div>
          )}
          <div className="mt-3 rounded-[8px] border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-[11px] font-extrabold text-[var(--text-primary)] mb-1">¿Pagas a mano desde tu wallet?</p>
            <p className="text-[10px] text-[var(--text-secondary)] mb-2">
              Usa exactamente estos datos. <strong>El memo es obligatorio</strong>: sin él, el pago no se puede asociar
              a esta compra y queda pendiente.
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px] font-mono">
              <dt className="text-[var(--text-muted)]">Destino</dt>
              <dd className="break-all text-[var(--text-primary)]">{pagoCosmos.destination}</dd>
              <dt className="text-[var(--text-muted)]">Monto</dt>
              <dd className="text-[var(--text-primary)]">
                {pagoCosmos.amount} {pagoCosmos.asset === "native" ? "XLM" : pagoCosmos.asset}
              </dd>
              <dt className="text-[var(--text-muted)]">Memo (ID)</dt>
              <dd className="text-[var(--text-primary)] font-bold">{pagoCosmos.memo}</dd>
            </dl>
          </div>
        </div>
      )}

      {/* Barra de credenciales rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Entorno y SLA */}
        <div className="p-3.5 rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Integración
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <strong className="text-xs font-bold text-[var(--text-primary)]">
                REST / JSON
              </strong>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Sin SDK
          </span>
        </div>

        {/* Base URL */}
        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Endpoint Base
            </span>
            <code className="text-xs font-mono font-bold text-[var(--text-primary)] truncate block mt-0.5">
              {baseUrl || "…"}
            </code>
          </div>
          <button
            type="button"
            onClick={() => copiarAlPortapapeles(baseUrl, "baseUrl")}
            className="px-2.5 py-1 text-[11px] font-bold rounded border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-all cursor-pointer flex-shrink-0"
            title="Copiar URL"
          >
            <i className={`fa-solid ${copiadoUrlBase ? "fa-check text-emerald-500" : "fa-copy"} mr-1`}></i>
            {copiadoUrlBase ? "Copiada" : "Copiar"}
          </button>
        </div>
      </div>

      {/* =========================================================================
          Cuadro de API del Inicio (Landing Interactive Container)
          ========================================================================= */}
      <div className="rounded-[18px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-sm">
        <div className="api-intro mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
            Integra Coinstellation en minutos
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Cobra tus paquetes en XLM o USDC sobre Stellar. Al confirmarse el pago, los comandos llegan a tu servidor.
          </p>
        </div>

        <div className="interactive-container">
          {/* Selector de modo */}
          <div className="mode-switch">
            <button
              type="button"
              className={`switch-btn ${tabActiva === "dev" ? "active" : ""}`}
              id="tabDevDashboard"
              onClick={() => setTabActiva("dev")}
            >
              Developer API
            </button>
            <button
              type="button"
              className={`switch-btn ${tabActiva === "store" ? "active" : ""}`}
              id="tabStoreDashboard"
              onClick={() => setTabActiva("store")}
            >
              Webstore Preview
            </button>
          </div>

          <div className="api-demo-stage">
          {/* Panel Desarrollador */}
          <div
            className={`landing-panel ${tabActiva === "dev" ? "active" : ""}`}
            id="panelDevDashboard"
          >
            <div className="panel-layout">
              {/* Caja Visual de Estado */}
              <div className="visual-box">
                <div className="visual-header">
                  <div className="flex items-center gap-2">
                    <span className="status-dot"></span>
                    <span>API disponible</span>
                  </div>
                </div>
                <div className="visual-grid">
                  <div className="visual-item wide">
                    <label>API Key</label>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="min-w-0 break-all text-xs font-mono font-bold text-white">
                        {apiKey ?? (cargandoApiKey ? "Consultando..." : apiKeyExists ? "••••••••••••••••" : "Aún no generada")}
                      </code>
                      {apiKey ? (
                        <button
                          type="button"
                          onClick={() => copiarAlPortapapeles(apiKey, "key")}
                          className="shrink-0 rounded border border-white/15 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/10"
                        >
                          <i className={`fa-solid ${copiadoKey ? "fa-check" : "fa-copy"} mr-1`}></i>
                          {copiadoKey ? "Copiada" : "Copiar"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={generarApiKey}
                          disabled={cargandoApiKey || generandoApiKey}
                          className="shrink-0 rounded bg-[#095a86] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#0b6fa5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {generandoApiKey ? "Generando..." : apiKeyExists ? "Generar nueva" : "Generar API key"}
                        </button>
                      )}
                    </div>
                    {apiKeyExists && !apiKey && (
                      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                        Por seguridad, la clave existente no se puede recuperar. Genera una nueva para copiarla.
                      </p>
                    )}
                    {apiKey && (
                      <p className="mt-2 text-[10px] text-amber-200">
                        Guarda esta clave ahora; solo se muestra al generarla.
                      </p>
                    )}
                    {errorApiKey && <p className="mt-2 text-[10px] text-rose-300">{errorApiKey}</p>}
                  </div>
                  <div className="visual-item">
                    <label>Route</label>
                    <strong>POST /api/payments/create</strong>
                  </div>
                  <div className="visual-item">
                    <label>Response</label>
                    <strong>201 Created</strong>
                  </div>
                  <div className="visual-item wide">
                    <label>Datos de este ejemplo</label>
                    <span className="block text-[11px] text-white/80 leading-relaxed">
                      Paquete: <strong>{paqueteSeleccionado ? `${paqueteSeleccionado.name} (${paqueteSeleccionado.price} ${paqueteSeleccionado.currency})` : "crea uno en Paquetes"}</strong>
                      <br />
                      Wallet: <strong>{walletCreador.trim() ? "la de tu Billetera" : "configúrala en Billetera"}</strong>
                      {!apiKey && (
                        <>
                          <br />
                          API key: genera una arriba para verla en el código
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna de llamada HTTP */}
              <div className="code-column">
                <div className="mini-code-box">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      HTTP / JSON
                    </span>
                    <button
                      type="button"
                      onClick={() => copiarAlPortapapeles(snippetApi, "code")}
                      className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <i className={`fa-solid ${copiadoCodigo ? "fa-check text-emerald-500" : "fa-copy"}`}></i>
                      {copiadoCodigo ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <pre>
                    <code>{snippetApi}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Vista Previa Tienda */}
          <div
            className={`landing-panel ${tabActiva === "store" ? "active" : ""}`}
            id="panelStoreDashboard"
          >
            <div className="store-item">
              <div className="store-info">
                <h4>{paqueteSeleccionado?.name ?? "Sin paquetes"}</h4>
                <p>{paqueteSeleccionado?.description ?? "Crea un paquete en la sección Paquetes."}</p>
              </div>
              <strong className="price">
                {paqueteSeleccionado ? `${paqueteSeleccionado.price} ${paqueteSeleccionado.currency}` : "—"}
              </strong>
            </div>
            <button
              type="button"
              className="btn-primary buy-button"
              id="buyButtonDashboard"
              onClick={simularPagoCosmos}
              disabled={simulandoPago}
            >
              {simulandoPago ? "Creando pago..." : "Crear pago de prueba"}
            </button>
          </div>
          </div>

          {/* Feed de Actividad en Red en Vivo */}
          <div className="live-feed">
            <div className="live-title">
              <span>Solicitudes ejecutadas</span>
              <span className="transaction-count" id="txCountDashboard">
                {transacciones.length} solicitud{transacciones.length === 1 ? "" : "es"}
              </span>
            </div>
            <ul className="tx-list" id="txListDashboard">
              {transacciones.length === 0 ? (
                <li className="tx-item">Todavía no hay solicitudes realizadas.</li>
              ) : transacciones.map((item) => (
                <li key={item.id} className="tx-item">
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-arrow-right-arrow-left text-[10px] opacity-60"></i>
                    {item.text}
                  </span>
                  <div className="tx-status">
                    <span>{item.status}</span>
                    <span>{item.amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* =========================================================================
          Referencia de endpoints (todos con header X-Store-Key: TU_API_KEY)
          ========================================================================= */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-3">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Endpoints</h3>
          <p className="text-[11px] text-[var(--text-muted)]">
            Base: <code className="font-mono">{baseUrl || "…"}</code> · Autenticación:{" "}
            <code className="font-mono">X-Store-Key: TU_API_KEY</code> (solo desde tu backend)
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REFERENCIA_ENDPOINTS.map((endpoint) => (
            <div
              key={`${endpoint.metodo} ${endpoint.ruta}`}
              className="p-4 rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                    endpoint.metodo === "GET"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  }`}
                >
                  {endpoint.metodo}
                </span>
                <code className="text-xs font-mono font-bold text-[var(--text-primary)]">{endpoint.ruta}</code>
                {endpoint.opcional && (
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">opcional</span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-3">{endpoint.descripcion}</p>
              <div className="text-[11px] text-[var(--text-muted)] font-mono bg-[var(--bg-main)] p-2 rounded border border-[var(--border-color)] space-y-0.5">
                {endpoint.detalles.map((detalle) => (
                  <div key={detalle}>{detalle}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
