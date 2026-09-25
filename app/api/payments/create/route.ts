import { createCosmosPayment } from "@/backend/payments/CosmosPayments";
import { recordCreatedPayment } from "@/backend/payments/PaymentsRepository";
import { resolveMerchantUserId, webstoreCorsHeaders } from "@/backend/auth/merchant";

export const runtime = "nodejs";

const CORS_METHODS = "POST";

interface CreatePaymentBody {
  destination: string;
  amount: string;
  currency: string;
  description?: string;
  callback?: string;
  reference?: string;
  packageId?: string;
}

/**
 * Crea un intent SEP-7 en Cosmos Pay y lo registra como pago pendiente del comerciante.
 * Autenticación: header X-Store-Key (API key del usuario) o sesión del dashboard.
 */
export async function POST(request: Request) {
  const headers = webstoreCorsHeaders(CORS_METHODS);
  const userId = await resolveMerchantUserId(request);

  if (!userId) {
    return Response.json({ error: "Invalid webstore API key." }, { status: 401, headers });
  }

  const body = await readRequestBody(request);

  if (body === null) {
    return Response.json({ error: "Body must be a valid JSON object." }, { status: 400, headers });
  }

  if (!isCreatePaymentBody(body)) {
    return Response.json(
      { error: "creator wallet, amount and currency are required with valid types." },
      { status: 422, headers },
    );
  }

  let payment: Awaited<ReturnType<typeof createCosmosPayment>>;

  try {
    payment = await createCosmosPayment(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cosmos Pay is unavailable.";
    const status = message.includes("COSMOS_PAY") ? 503 : 502;

    return Response.json({ error: message }, { status, headers });
  }

  const record = await recordCreatedPayment({
    userId,
    intent: payment,
    currency: body.currency,
    description: body.description,
    reference: body.reference,
    packageId: body.packageId,
  });

  return Response.json({ payment, record }, { status: 201, headers });
}

async function readRequestBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isCreatePaymentBody(value: unknown): value is CreatePaymentBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.destination === "string" &&
    body.destination.trim().length > 0 &&
    typeof body.amount === "string" &&
    /^\d+(\.\d+)?$/.test(body.amount) &&
    Number(body.amount) > 0 &&
    typeof body.currency === "string" &&
    body.currency.trim().length > 0 &&
    isOptionalString(body.description) &&
    isOptionalString(body.callback) &&
    isOptionalString(body.reference) &&
    isOptionalString(body.packageId)
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: webstoreCorsHeaders(CORS_METHODS) });
}
