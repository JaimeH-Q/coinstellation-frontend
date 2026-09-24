import { validateCosmosPayment } from "@/backend/payments/CosmosPayments";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorizedWebstore(request)) {
    return Response.json({ error: "Invalid webstore API key." }, { status: 401, headers: corsHeaders() });
  }

  const { id } = await params;
  const body = await readBody(request);

  if (!body || typeof body.txHash !== "string" || !body.txHash.trim()) {
    return Response.json({ error: "txHash is required." }, { status: 422 });
  }

  try {
    return Response.json(
      { payment: await validateCosmosPayment(id, body.txHash.trim()) },
      { headers: corsHeaders() },
    );
  } catch {
    return Response.json({ error: "Unable to validate the Cosmos payment." }, { status: 502 });
  }
}

async function readBody(request: Request): Promise<{ txHash?: unknown } | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" ? (body as { txHash?: unknown }) : null;
  } catch {
    return null;
  }
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