import {
  authenticateGameServer,
  listPendingCommands,
} from "@/backend/servers/GameServerRepository";

export const runtime = "nodejs";

/**
 * GET /api/plugin/commands — lo consulta periódicamente el plugin del servidor.
 * Header: X-Server-Key: cs_srv_…
 * Devuelve los comandos de pagos completados que falta ejecutar (ya con %p% y %am% reemplazados).
 * Después de ejecutarlos, el plugin debe confirmarlos en POST /api/plugin/commands/ack.
 */
export async function GET(request: Request) {
  const server = await authenticateGameServer(request);

  if (!server) {
    return Response.json({ error: "Invalid server key." }, { status: 401 });
  }

  return Response.json(
    { commands: await listPendingCommands(server.userId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
