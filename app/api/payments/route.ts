import {
  listPaymentsForUser,
  syncOpenPaymentsForUser,
} from "@/backend/payments/PaymentsRepository";
import type { PaymentStatus } from "@/backend/payments/PaymentsHistory";
import { resolveMerchantUserId, webstoreCorsHeaders } from "@/backend/auth/merchant";

export const runtime = "nodejs";

const CORS_METHODS = "GET";
const DEFAULT_PAYMENT_COUNT = 50;
const MAX_PAYMENT_COUNT = 200;
const STATUSES: PaymentStatus[] = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
  "expired",
];

/**
 * GET /api/payments?count=50&status=completed
 * Historial de pagos del comerciante autenticado (X-Store-Key o sesión del dashboard).
 * Antes de responder concilia con Cosmos los pagos que siguen abiertos.
 */
export async function GET(request: Request) {
  const headers = { ...webstoreCorsHeaders(CORS_METHODS), "Cache-Control": "no-store" };
  const userId = await resolveMerchantUserId(request);

  if (!userId) {
    return Response.json({ error: "Authentication required." }, { status: 401, headers });
  }

  const { searchParams } = new URL(request.url);
  const count = parseCount(searchParams.get("count"));

  if (count === null) {
    return Response.json(
      { error: `The count query parameter must be an integer between 1 and ${MAX_PAYMENT_COUNT}.` },
      { status: 400, headers },
    );
  }

  const statusParam = searchParams.get("status");
  const status = STATUSES.find((value) => value === statusParam);

  if (statusParam && !status) {
    return Response.json(
      { error: `The status query parameter must be one of: ${STATUSES.join(", ")}.` },
      { status: 400, headers },
    );
  }

  await syncOpenPaymentsForUser(userId);

  return Response.json(
    { payments: await listPaymentsForUser(userId, { status, take: count }) },
    { headers },
  );
}

function parseCount(value: string | null): number | null {
  if (value === null) {
    return DEFAULT_PAYMENT_COUNT;
  }

  const count = Number(value);
  return Number.isInteger(count) && count >= 1 && count <= MAX_PAYMENT_COUNT ? count : null;
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: webstoreCorsHeaders(CORS_METHODS) });
}
