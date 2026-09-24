import { createCosmosPayment } from "@/backend/payments/CosmosPayments";

export const runtime = "nodejs";

/** Crea un intent SEP-7 para que una webstore externa pueda mostrar su checkout. */
export async function POST(request: Request) {
  if (!isAuthorizedWebstore(request)) {
    return Response.json({ error: "Invalid webstore API key." }, { status: 401, headers: corsHeaders() });
  }

  const body = await readRequestBody(request);

  if (body === null) {
    return Response.json({ error: "Body must be a valid JSON object." }, { status: 400 });
  }

  if (!isCreatePaymentBody(body)) {
    return Response.json(
      { error: "amount and currency are required with valid types." },
      { status: 422 },
    );
  }

  try {
    const payment = await createCosmosPayment(body);

    return Response.json({ payment }, { status: 201, headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cosmos Pay is unavailable.";
    const status = message.includes("COSMOS_PAY") || message.includes("COSMOS_MERCHANT") ? 503 : 502;

    return Response.json({ error: message }, { status, headers: corsHeaders() });
  }
}

async function readRequestBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isCreatePaymentBody(value: unknown): value is Parameters<typeof createCosmosPayment>[0] {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    (body.destination === undefined || (typeof body.destination === "string" && body.destination.trim().length > 0)) &&
    typeof body.amount === "string" &&
    /^\d+(\.\d+)?$/.test(body.amount) &&
    Number(body.amount) > 0 &&
    typeof body.currency === "string" &&
    body.currency.trim().length > 0 &&
    (body.memo === undefined || typeof body.memo === "string") &&
    (body.description === undefined || typeof body.description === "string") &&
    (body.callback === undefined || typeof body.callback === "string")
  );
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": process.env.WEBSTORE_ALLOWED_ORIGIN ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Store-Key",
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function isAuthorizedWebstore(request: Request): boolean {
  const expectedKey = process.env.WEBSTORE_API_KEY;

  if (!expectedKey) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("X-Store-Key") === expectedKey;
}