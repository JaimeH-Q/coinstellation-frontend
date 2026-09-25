import {
  acknowledgeCommands,
  authenticateGameServer,
} from "@/backend/servers/GameServerRepository";
import { readJsonObject } from "@/backend/http/readJson";

export const runtime = "nodejs";

const MAX_IDS_PER_ACK = 100;

/**
 * POST /api/plugin/commands/ack { ids: string[] }
 * El plugin confirma los comandos que ya ejecutó para que no se vuelvan a entregar.
 */
export async function POST(request: Request) {
  const server = await authenticateGameServer(request);

  if (!server) {
    return Response.json({ error: "Invalid server key." }, { status: 401 });
  }

  const body = await readJsonObject(request);
  const ids = body?.ids;

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.length > MAX_IDS_PER_ACK ||
    !ids.every((id) => typeof id === "string")
  ) {
    return Response.json(
      { error: `ids must be a non-empty array of up to ${MAX_IDS_PER_ACK} strings.` },
      { status: 422 },
    );
  }

  return Response.json({ acknowledged: await acknowledgeCommands(server.userId, ids) });
}
