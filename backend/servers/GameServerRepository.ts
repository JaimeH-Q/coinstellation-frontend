import { randomBytes } from "node:crypto";
import prisma from "../database/prisma";
import { hashApiKey } from "../auth/merchant";
import type { GameServerDTO } from "../packages/PackageTypes";

export const SERVER_KEY_HEADER = "X-Server-Key";

/** Cuántos comandos entrega el plugin en cada consulta. */
const MAX_COMMANDS_PER_POLL = 100;

export interface PendingCommand {
  id: string;
  command: string;
  playerName: string;
  paymentId: string;
  createdAt: string;
}

export async function getGameServer(userId: string): Promise<GameServerDTO | null> {
  const server = await prisma.gameServer.findUnique({ where: { userId } });

  if (!server) return null;

  const pendingCommands = await prisma.commandDelivery.count({
    where: { userId, status: "pending" },
  });

  return {
    name: server.name,
    lastSeenAt: server.lastSeenAt?.toISOString() ?? null,
    createdAt: server.createdAt.toISOString(),
    pendingCommands,
  };
}

/**
 * Registra el servidor del usuario o regenera su clave. La clave solo se devuelve acá:
 * en la base se guarda su hash, igual que las API keys.
 */
export async function upsertGameServer(
  userId: string,
  name: string,
): Promise<{ server: GameServerDTO; serverKey: string }> {
  const serverKey = `cs_srv_${randomBytes(32).toString("hex")}`;
  const keyHash = hashApiKey(serverKey);

  await prisma.gameServer.upsert({
    where: { userId },
    create: { userId, name, keyHash },
    update: { name, keyHash },
  });

  return { server: (await getGameServer(userId))!, serverKey };
}

/** Identifica el servidor por su clave y registra que el plugin se conectó. */
export async function authenticateGameServer(request: Request): Promise<{ userId: string } | null> {
  const key = request.headers.get(SERVER_KEY_HEADER)?.trim();

  if (!key) return null;

  const server = await prisma.gameServer.findUnique({
    where: { keyHash: hashApiKey(key) },
    select: { id: true, userId: true },
  });

  if (!server) return null;

  await prisma.gameServer.update({ where: { id: server.id }, data: { lastSeenAt: new Date() } });

  return { userId: server.userId };
}

/** Comandos de pagos completados que el plugin todavía no ejecutó, en orden. */
export async function listPendingCommands(userId: string): Promise<PendingCommand[]> {
  const rows = await prisma.commandDelivery.findMany({
    where: { userId, status: "pending" },
    orderBy: [{ createdAt: "asc" }, { position: "asc" }],
    take: MAX_COMMANDS_PER_POLL,
  });

  return rows.map((row) => ({
    id: row.id,
    command: row.command,
    playerName: row.playerName,
    paymentId: row.paymentId,
    createdAt: row.createdAt.toISOString(),
  }));
}

/** El plugin confirma que ejecutó estos comandos; solo se marcan los del propio usuario. */
export async function acknowledgeCommands(userId: string, ids: string[]): Promise<number> {
  const result = await prisma.commandDelivery.updateMany({
    where: { userId, id: { in: ids }, status: "pending" },
    data: { status: "delivered", deliveredAt: new Date() },
  });

  return result.count;
}
