import { getCurrentUser } from "@/backend/auth/session";
import { getGameServer, upsertGameServer } from "@/backend/servers/GameServerRepository";
import { readJsonObject } from "@/backend/http/readJson";

export const runtime = "nodejs";

/** GET /api/server — servidor de juego del usuario (o null si no conectó ninguno). */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para ver tu servidor." }, { status: 401 });
  }

  return Response.json(
    { server: await getGameServer(user.id) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * POST /api/server { name }
 * Registra el servidor o regenera su clave. La clave (cs_srv_…) solo se muestra en esta respuesta;
 * al regenerarla, el plugin con la clave anterior deja de recibir comandos.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para conectar tu servidor." }, { status: 401 });
  }

  const body = await readJsonObject(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name || name.length > 100) {
    return Response.json(
      { error: "El nombre del servidor es obligatorio (máx. 100 caracteres)." },
      { status: 422 },
    );
  }

  const { server, serverKey } = await upsertGameServer(user.id, name);

  return Response.json(
    { server, serverKey },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
