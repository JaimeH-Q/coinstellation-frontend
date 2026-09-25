import type { PaymentIntentData } from "@cosmosapp/pay_sdk";
import prisma from "../database/prisma";
import {
  fetchCosmosPayment,
  findIntentMismatch,
  resolveExpectedAsset,
  validateCosmosPayment,
  type ExpectedAsset,
} from "./CosmosPayments";
import { findPaymentTransaction } from "./StellarLookup";
import { renderCommand } from "../packages/commands";
import type { Payment, PaymentHistoryFilters, PaymentStatus } from "./PaymentsHistory";

const DEFAULT_TAKE = 50;
const MAX_TAKE = 200;
/** Cuántos pagos pendientes se concilian con Cosmos en cada consulta del historial. */
const MAX_PENDING_TO_SYNC = 25;
/** Cuántos pagos pendientes (de todos los usuarios) revisa la tarea programada en cada pasada. */
const MAX_PENDING_TO_SYNC_GLOBAL = 100;
/** Solo se concilian pendientes recientes; los más viejos ya deberían haber expirado. */
const PENDING_SYNC_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const OPEN_STATUSES: PaymentStatus[] = ["pending", "processing"];

type PaymentRow = Awaited<ReturnType<typeof prisma.payment.findFirstOrThrow>>;

/** Traduce el estado del intent de Cosmos al estado del pago. */
export function mapCosmosStatus(status: string): PaymentStatus {
  switch (status.toUpperCase()) {
    case "SUBMITTED":
      return "processing";
    case "SUCCEEDED":
      return "completed";
    case "FAILED":
      return "failed";
    case "CANCELLED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    default:
      return "pending";
  }
}

export interface RecordPaymentInput {
  userId: string;
  intent: Pick<
    PaymentIntentData,
    "id" | "status" | "network" | "destination" | "amount" | "memo" | "assetIssuer"
  >;
  currency: string;
  package: { id: string; name: string; commands: string[] };
  playerName: string;
  description?: string;
  reference?: string;
}

/**
 * Guarda el pago recién creado en Cosmos como pendiente, junto con los comandos del paquete
 * ya resueltos (%p%, %am%). Quedan en "awaiting_payment" hasta que el pago se complete,
 * así editar o borrar el paquete después no cambia lo que se entrega por esta compra.
 */
export async function recordCreatedPayment(input: RecordPaymentInput): Promise<Payment> {
  const amount = input.intent.amount ?? "0";
  const row = await prisma.payment.create({
    data: {
      userId: input.userId,
      cosmosIntentId: input.intent.id,
      status: mapCosmosStatus(input.intent.status),
      amount,
      currency: input.currency.trim().toUpperCase(),
      assetIssuer: input.intent.assetIssuer ?? null,
      network: input.intent.network,
      destination: input.intent.destination,
      memo: input.intent.memo || null,
      description: input.description?.trim() || null,
      reference: input.reference?.trim() || null,
      packageId: input.package.id,
      packageName: input.package.name,
      playerName: input.playerName,
      deliveries: {
        create: input.package.commands.map((template, position) => ({
          userId: input.userId,
          position,
          playerName: input.playerName,
          command: renderCommand(template, { playerName: input.playerName, amount }),
        })),
      },
    },
  });

  return toPayment(row);
}

/** Historial de pagos de un usuario, del más nuevo al más viejo. */
export async function listPaymentsForUser(
  userId: string,
  filters: PaymentHistoryFilters = {},
): Promise<Payment[]> {
  const take = Math.min(Math.max(filters.take ?? DEFAULT_TAKE, 1), MAX_TAKE);
  const rows = await prisma.payment.findMany({
    where: { userId, ...(filters.status ? { status: filters.status } : {}) },
    orderBy: { createdAt: "desc" },
    take,
  });

  return rows.map(toPayment);
}

/** Busca un pago por su intent de Cosmos, solo si pertenece al usuario. */
export async function findPaymentForUser(
  userId: string,
  cosmosIntentId: string,
): Promise<Payment | null> {
  const row = await prisma.payment.findFirst({ where: { userId, cosmosIntentId } });
  return row ? toPayment(row) : null;
}

/** Activo que se esperaba cobrar en este pago (los registros viejos no guardaban el emisor). */
function expectedAssetFor(row: PaymentRow): ExpectedAsset {
  if (row.assetIssuer) {
    return { code: row.currency, issuer: row.assetIssuer };
  }

  return resolveExpectedAsset(row.currency);
}

type IntentUpdate = Pick<PaymentIntentData, "id" | "status" | "txHash" | "source"> &
  Partial<Pick<PaymentIntentData, "asset" | "assetIssuer" | "amount">>;

/**
 * Actualiza el pago con el estado que reporta Cosmos (validación, webhook o conciliación).
 * Antes de darlo por completado comprueba que el intent cobre el mismo activo, emisor y monto
 * que se registró; si no coincide, el pago queda fallido y sus comandos se cancelan.
 * Devuelve null si el intent no corresponde a ningún pago registrado.
 */
export async function applyCosmosIntentUpdate(intent: IntentUpdate): Promise<Payment | null> {
  const existing = await prisma.payment.findUnique({ where: { cosmosIntentId: intent.id } });

  if (!existing) {
    return null;
  }

  const status = mapCosmosStatus(intent.status);

  // Un pago cobrado no vuelve atrás aunque llegue tarde un evento viejo (p. ej. UPDATED en PENDING).
  if (existing.status === "completed" && status !== "completed") {
    return toPayment(existing);
  }

  if (status === "completed" && existing.status !== "completed") {
    // Si el evento no trae activo/monto, se consulta el intent completo a Cosmos.
    const full =
      intent.asset === undefined || intent.amount === undefined
        ? await fetchCosmosPayment(intent.id)
        : { asset: intent.asset, assetIssuer: intent.assetIssuer ?? null, amount: intent.amount };
    const mismatch = findIntentMismatch(full, {
      asset: expectedAssetFor(existing),
      amount: existing.amount,
    });

    if (mismatch) {
      const failed = await prisma.payment.update({
        where: { id: existing.id },
        data: {
          status: "failed",
          failureReason: mismatch,
          txHash: intent.txHash ?? existing.txHash,
          sourceAccount: intent.source ?? existing.sourceAccount,
        },
      });

      await releaseCommandsForStatus(failed.id, "failed");
      return toPayment(failed);
    }
  }

  const row = await prisma.payment.update({
    where: { id: existing.id },
    data: {
      status,
      txHash: intent.txHash ?? existing.txHash,
      sourceAccount: intent.source ?? existing.sourceAccount,
      confirmedAt: status === "completed" ? existing.confirmedAt ?? new Date() : existing.confirmedAt,
    },
  });

  await releaseCommandsForStatus(row.id, status);

  return toPayment(row);
}

/**
 * Libera los comandos hacia el plugin cuando el pago se completa, o los cancela si falló.
 * Solo toca los que siguen en "awaiting_payment", así que es seguro llamarla varias veces
 * (webhook + validate + conciliación) sin duplicar entregas.
 */
async function releaseCommandsForStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  if (status === "completed") {
    await prisma.commandDelivery.updateMany({
      where: { paymentId, status: "awaiting_payment" },
      data: { status: "pending" },
    });
  } else if (status === "failed" || status === "cancelled" || status === "expired") {
    await prisma.commandDelivery.updateMany({
      where: { paymentId, status: "awaiting_payment" },
      data: { status: "cancelled" },
    });
  }
}

/**
 * Concilia los pagos abiertos recientes del usuario.
 * 1. Consulta el intent en Cosmos (por si ya se validó o cambió de estado).
 * 2. Si Cosmos todavía no conoce ninguna transacción, la busca en la blockchain por destino,
 *    memo, activo y monto, y se la pasa a Cosmos con validate(). Cosmos no vigila la red:
 *    sin este paso, un pago hecho escaneando el QR quedaría pendiente para siempre.
 * Los errores de red se ignoran: el pago queda como estaba y se reintenta en la próxima consulta.
 */
export async function syncOpenPaymentsForUser(userId: string): Promise<void> {
  await syncOpenPayments({ userId }, MAX_PENDING_TO_SYNC);
}

export interface SyncSummary {
  checked: number;
  /** Pagos que cambiaron de estado en esta pasada, con su estado nuevo. */
  changed: { id: string; status: PaymentStatus }[];
  errors: number;
}

/** Concilia los pagos abiertos recientes de todos los usuarios (lo usa la tarea programada). */
export async function syncAllOpenPayments(): Promise<SyncSummary> {
  return syncOpenPayments({}, MAX_PENDING_TO_SYNC_GLOBAL);
}

async function syncOpenPayments(where: { userId?: string }, take: number): Promise<SyncSummary> {
  const open = await prisma.payment.findMany({
    where: {
      ...where,
      status: { in: OPEN_STATUSES },
      createdAt: { gte: new Date(Date.now() - PENDING_SYNC_WINDOW_MS) },
    },
    // Los más viejos primero: son los que más tiempo llevan esperando.
    orderBy: { createdAt: "asc" },
    take,
  });

  const results = await Promise.allSettled(open.map((row) => syncOpenPayment(row)));
  const summary: SyncSummary = { checked: open.length, changed: [], errors: 0 };

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      summary.errors++;
    } else if (result.value && result.value !== open[index].status) {
      summary.changed.push({ id: open[index].id, status: result.value });
    }
  });

  return summary;
}

/** Devuelve el estado del pago después de conciliarlo. */
async function syncOpenPayment(row: PaymentRow): Promise<PaymentStatus | null> {
  const intent = await fetchCosmosPayment(row.cosmosIntentId);
  const stillOpen = intent.status === "PENDING" || intent.status === "SUBMITTED";

  if (stillOpen && !intent.txHash && row.memo) {
    const txHash = await findPaymentTransaction({
      network: row.network,
      destination: row.destination,
      memo: row.memo,
      asset: expectedAssetFor(row),
      amount: row.amount,
      since: row.createdAt,
    });

    if (txHash) {
      const outcome = await validateCosmosPayment(row.cosmosIntentId, txHash);

      if (outcome.paymentIntent) {
        return (await applyCosmosIntentUpdate(outcome.paymentIntent))?.status ?? null;
      }
    }
  }

  return (await applyCosmosIntentUpdate(intent))?.status ?? null;
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    cosmosIntentId: row.cosmosIntentId,
    status: row.status as PaymentStatus,
    amount: row.amount,
    asset: { currency: row.currency, network: row.network },
    destination: row.destination,
    memo: row.memo,
    description: row.description,
    reference: row.reference,
    packageId: row.packageId,
    packageName: row.packageName,
    playerName: row.playerName,
    transactionId: row.txHash,
    sourceAccount: row.sourceAccount,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    failureReason: row.failureReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
