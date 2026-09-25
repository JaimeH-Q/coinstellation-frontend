import { createHash } from "node:crypto";
import prisma from "../database/prisma";
import { getCurrentUser } from "./session";

export const STORE_KEY_HEADER = "X-Store-Key";

/** Las API keys se guardan hasheadas; esta es la misma función que se usa al generarlas. */
export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Identifica al comerciante que hace la solicitud:
 * 1. Por su API key en el header X-Store-Key (integraciones de tiendas).
 * 2. Si no hay header, por la sesión del dashboard.
 * Devuelve null si ninguna de las dos es válida.
 */
export async function resolveMerchantUserId(request: Request): Promise<string | null> {
  const storeKey = request.headers.get(STORE_KEY_HEADER)?.trim();

  if (storeKey) {
    const record = await prisma.apiKey.findUnique({
      where: { apiKeyHash: hashApiKey(storeKey) },
      select: { userId: true },
    });

    return record?.userId ?? null;
  }

  return (await getCurrentUser())?.id ?? null;
}

/** Headers CORS para que una webstore externa pueda llamar a la API de pagos. */
export function webstoreCorsHeaders(methods: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": process.env.WEBSTORE_ALLOWED_ORIGIN ?? "*",
    "Access-Control-Allow-Methods": `${methods}, OPTIONS`,
    "Access-Control-Allow-Headers": `Content-Type, ${STORE_KEY_HEADER}`,
  };
}
