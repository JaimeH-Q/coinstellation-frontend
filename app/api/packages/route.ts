import { getCurrentUser } from "@/backend/auth/session";
import { STORE_KEY_HEADER, resolveMerchantUserId, webstoreCorsHeaders } from "@/backend/auth/merchant";
import {
  createPackage,
  listCategories,
  listPackages,
  parsePackageInput,
} from "@/backend/packages/PackagesRepository";
import { readJsonObject } from "@/backend/http/readJson";

export const runtime = "nodejs";

const CORS_METHODS = "GET";

/**
 * GET /api/packages
 * Paquetes y categorías del comerciante. Con X-Store-Key (tienda) no se incluyen los comandos;
 * con la sesión del dashboard sí.
 */
export async function GET(request: Request) {
  const headers = { ...webstoreCorsHeaders(CORS_METHODS), "Cache-Control": "no-store" };
  const userId = await resolveMerchantUserId(request);

  if (!userId) {
    return Response.json({ error: "Authentication required." }, { status: 401, headers });
  }

  const includeCommands = !request.headers.has(STORE_KEY_HEADER);
  const [packages, categories] = await Promise.all([
    listPackages(userId, { includeCommands }),
    listCategories(userId),
  ]);

  return Response.json({ packages, categories }, { headers });
}

/** POST /api/packages — crea un paquete (solo desde el dashboard). */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para crear paquetes." }, { status: 401 });
  }

  const body = await readJsonObject(request);

  if (!body) {
    return Response.json({ error: "El cuerpo debe ser un objeto JSON válido." }, { status: 400 });
  }

  const parsed = parsePackageInput(body);

  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 422 });
  }

  const pkg = await createPackage(user.id, parsed.data);

  if (!pkg) {
    return Response.json({ error: "La categoría no existe." }, { status: 422 });
  }

  return Response.json({ package: pkg }, { status: 201 });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: webstoreCorsHeaders(CORS_METHODS) });
}
