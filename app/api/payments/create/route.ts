import { createCosmosPayment } from "@/backend/payments/CosmosPayments";
import { recordCreatedPayment } from "@/backend/payments/PaymentsRepository";
import { resolveMerchantUserId, webstoreCorsHeaders } from "@/backend/auth/merchant";
import { findPackageWithCommands } from "@/backend/packages/PackagesRepository";
import { isValidPlayerName } from "@/backend/packages/commands";
import { isValidStellarPublicKey } from "@/backend/stellar/address";

export const runtime = "nodejs";

const CORS_METHODS = "POST";

interface CreatePaymentBody {
  packageId: string;
  playerName: string;
  destination: string;
  description?: string;
  callback?: string;
  reference?: string;
}

/**
 * Crea un intent SEP-7 en Cosmos Pay para comprar un paquete y lo registra como pago pendiente.
 * El monto y el activo salen del precio del paquete (no del body), así la tienda no puede
 * cobrar otro importe. Autenticación: header X-Store-Key (API key del usuario) o sesión.
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
      { error: "packageId, playerName and destination (creator wallet) are required with valid types." },
      { status: 422, headers },
    );
  }

  const playerName = body.playerName.trim();
  const destination = body.destination.trim();

  if (!isValidStellarPublicKey(destination)) {
    return Response.json(
      { error: "destination must be a valid Stellar public key (G…, 56 characters, valid checksum)." },
      { status: 422, headers },
    );
  }

  if (!isValidPlayerName(playerName)) {
    return Response.json(
      { error: "playerName may only contain letters, numbers, '_' and '.' (max 32 characters)." },
      { status: 422, headers },
    );
  }

  const pkg = await findPackageWithCommands(userId, body.packageId.trim());

  if (!pkg) {
    return Response.json({ error: "Package not found." }, { status: 404, headers });
  }

  let payment: Awaited<ReturnType<typeof createCosmosPayment>>;

  try {
    payment = await createCosmosPayment({
      destination,
      amount: pkg.price,
      currency: pkg.currency,
      description: body.description?.trim() || pkg.name,
      callback: body.callback,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cosmos Pay is unavailable.";
    const status = message.includes("COSMOS_PAY") ? 503 : 502;

    return Response.json({ error: message }, { status, headers });
  }

  const record = await recordCreatedPayment({
    userId,
    intent: payment,
    currency: pkg.currency,
    package: { id: pkg.id, name: pkg.name, commands: pkg.commands.map((command) => command.command) },
    playerName,
    description: body.description?.trim() || pkg.name,
    reference: body.reference,
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
    typeof body.packageId === "string" &&
    body.packageId.trim().length > 0 &&
    typeof body.playerName === "string" &&
    typeof body.destination === "string" &&
    body.destination.trim().length > 0 &&
    isOptionalString(body.description) &&
    isOptionalString(body.callback) &&
    isOptionalString(body.reference)
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: webstoreCorsHeaders(CORS_METHODS) });
}
