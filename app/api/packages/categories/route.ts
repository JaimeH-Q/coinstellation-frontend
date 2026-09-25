import { getCurrentUser } from "@/backend/auth/session";
import { createCategory, parseCategoryInput } from "@/backend/packages/PackagesRepository";
import { readJsonObject } from "@/backend/http/readJson";

export const runtime = "nodejs";

/** POST /api/packages/categories — crea una categoría (solo desde el dashboard). */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para crear categorías." }, { status: 401 });
  }

  const body = await readJsonObject(request);

  if (!body) {
    return Response.json({ error: "El cuerpo debe ser un objeto JSON válido." }, { status: 400 });
  }

  const parsed = parseCategoryInput(body);

  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 422 });
  }

  return Response.json({ category: await createCategory(user.id, parsed.data) }, { status: 201 });
}
