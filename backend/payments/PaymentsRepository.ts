import type { PaymentIntentData } from "@cosmosapp/pay_sdk";
import prisma from "../database/prisma";
import { fetchCosmosPayment } from "./CosmosPayments";
import type { Payment, PaymentHistoryFilters, PaymentStatus } from "./PaymentsHistory";

const DEFAULT_TAKE = 50;
const MAX_TAKE = 200;
/** Cuántos pagos pendientes se concilian con Cosmos en cada consulta del historial. */
const MAX_PENDING_TO_SYNC = 25;
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
  intent: Pick<PaymentIntentData, "id" | "status" | "network" | "destination" | "amount" | "memo">;
  currency: string;
  description?: string;
  reference?: string;
  packageId?: string;
}

/** Guarda el pago recién creado en Cosmos como pendiente. */
export async function recordCreatedPayment(input: RecordPaymentInput): Promise<Payment> {
  const row = await prisma.payment.create({
    data: {
      userId: input.userId,
      cosmosIntentId: input.intent.id,
      status: mapCosmosStatus(input.intent.status),
      amount: input.intent.amount ?? "0",
      currency: input.currency.trim().toUpperCase(),
      network: input.intent.network,
      destination: input.intent.destination,
      memo: input.intent.memo || null,
      description: input.description?.trim() || null,
      reference: input.reference?.trim() || null,
      packageId: input.packageId?.trim() || null,
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

/**
 * Actualiza el pago con el estado que reporta Cosmos (validación, webhook o conciliación).
 * Devuelve null si el intent no corresponde a ningún pago registrado.
 */
export async function applyCosmosIntentUpdate(
  intent: Pick<PaymentIntentData, "id" | "status" | "txHash" | "source">,
): Promise<Payment | null> {
  const existing = await prisma.payment.findUnique({ where: { cosmosIntentId: intent.id } });

  if (!existing) {
    return null;
  }

  const status = mapCosmosStatus(intent.status);

  // Un pago cobrado no vuelve atrás aunque llegue tarde un evento viejo (p. ej. UPDATED en PENDING).
  if (existing.status === "completed" && status !== "completed") {
    return toPayment(existing);
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

  return toPayment(row);
}

/**
 * Concilia con Cosmos los pagos abiertos recientes del usuario.
 * Cubre los casos en que no llegó el webhook ni se llamó a /validate.
 * Los errores de red se ignoran: el pago queda como estaba y se reintenta en la próxima consulta.
 */
export async function syncOpenPaymentsForUser(userId: string): Promise<void> {
  const open = await prisma.payment.findMany({
    where: {
      userId,
      status: { in: OPEN_STATUSES },
      createdAt: { gte: new Date(Date.now() - PENDING_SYNC_WINDOW_MS) },
    },
    select: { cosmosIntentId: true },
    orderBy: { createdAt: "desc" },
    take: MAX_PENDING_TO_SYNC,
  });

  await Promise.allSettled(
    open.map(async ({ cosmosIntentId }) => {
      const intent = await fetchCosmosPayment(cosmosIntentId);
      await applyCosmosIntentUpdate(intent);
    }),
  );
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
    transactionId: row.txHash,
    sourceAccount: row.sourceAccount,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
