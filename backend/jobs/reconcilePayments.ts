import { syncAllOpenPayments } from "../payments/PaymentsRepository";

/**
 * Tarea programada que concilia los pagos abiertos de todos los usuarios.
 *
 * Cosmos Pay no vigila la blockchain: un pago hecho escaneando el QR solo se completa si
 * alguien encuentra la transacción y llama a validate(). Esta tarea lo hace sola cada
 * PAYMENT_RECONCILE_INTERVAL_MS (por defecto 1 minuto), así los comandos llegan al plugin
 * aunque nadie abra el dashboard. Poner 0 la desactiva.
 *
 * Corre dentro del proceso del servidor (next start), así que necesita un servidor que quede
 * encendido; en un hosting serverless habría que llamarla desde un cron externo.
 */

const DEFAULT_INTERVAL_MS = 60_000;
const MIN_INTERVAL_MS = 5_000;

interface ReconcilerState {
  timer: ReturnType<typeof setInterval> | null;
  running: boolean;
}

// Guardado en globalThis para no crear dos temporizadores si el módulo se vuelve a cargar.
const globalState = globalThis as typeof globalThis & { __paymentReconciler?: ReconcilerState };

function readInterval(): number {
  const raw = process.env.PAYMENT_RECONCILE_INTERVAL_MS;
  if (raw === undefined || raw.trim() === "") return DEFAULT_INTERVAL_MS;

  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return DEFAULT_INTERVAL_MS;
  if (value === 0) return 0;
  return Math.max(value, MIN_INTERVAL_MS);
}

async function runOnce(state: ReconcilerState): Promise<void> {
  // Si una pasada tarda más que el intervalo, no se superponen.
  if (state.running) return;
  state.running = true;

  try {
    const summary = await syncAllOpenPayments();

    if (summary.changed.length > 0 || summary.errors > 0) {
      const changes = summary.changed.map((c) => `${c.id.slice(0, 8)}→${c.status}`).join(", ");
      console.log(
        `[pagos] conciliados ${summary.checked}: ${summary.changed.length} actualizados` +
          (changes ? ` (${changes})` : "") +
          (summary.errors ? `, ${summary.errors} con error` : ""),
      );
    }
  } catch (error) {
    console.error("[pagos] error al conciliar:", error instanceof Error ? error.message : error);
  } finally {
    state.running = false;
  }
}

export function startPaymentReconciler(): void {
  const state = (globalState.__paymentReconciler ??= { timer: null, running: false });

  if (state.timer) return;

  const interval = readInterval();

  if (interval === 0) {
    console.log("[pagos] conciliación automática desactivada (PAYMENT_RECONCILE_INTERVAL_MS=0)");
    return;
  }

  state.timer = setInterval(() => void runOnce(state), interval);
  // No impide que el proceso termine (p. ej. durante el build).
  state.timer.unref?.();
  console.log(`[pagos] conciliación automática cada ${interval / 1000}s`);
}
