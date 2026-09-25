import { validateCosmosPayment } from "@/backend/payments/CosmosPayments";
import {
  applyCosmosIntentUpdate,
  findPaymentForUser,
} from "@/backend/payments/PaymentsRepository";
import { resolveMerchantUserId, webstoreCorsHeaders } from "@/backend/auth/merchant";

export const runtime = "nodejs";

const CORS_METHODS = "POST";

/**
 * Valida en Cosmos la transacción enviada por el comprador y actualiza el pago registrado.
 * `id` es el ID del intent de Cosmos devuelto por /api/payments/create.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = webstoreCorsHeaders(CORS_METHODS);
  const userId = await resolveMerchantUserId(request);

  if (!userId) {
    return Response.json({ error: "Invalid webstore API key." }, { status: 401, headers });
  }

  const { id } = await params;
  const body = await readBody(request);

  if (!body || typeof body.txHash !== "string" || !body.txHash.trim()) {
    return Response.json({ error: "txHash is required." }, { status: 422, headers });
  }

  if (!(await findPaymentForUser(userId, id))) {
    return Response.json({ error: "Payment not found." }, { status: 404, headers });
  }

  let outcome: Awaited<ReturnType<typeof validateCosmosPayment>>;

  try {
    outcome = await validateCosmosPayment(id, body.txHash.trim());
  } catch {
    return Response.json({ error: "Unable to validate the Cosmos payment." }, { status: 502, headers });
  }

  const record = outcome.paymentIntent
    ? await applyCosmosIntentUpdate(outcome.paymentIntent)
    : await findPaymentForUser(userId, id);

  return Response.json({ payment: outcome, record }, { headers });
}

async function readBody(request: Request): Promise<{ txHash?: unknown } | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" ? (body as { txHash?: unknown }) : null;
  } catch {
    return null;
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: webstoreCorsHeaders(CORS_METHODS) });
}
