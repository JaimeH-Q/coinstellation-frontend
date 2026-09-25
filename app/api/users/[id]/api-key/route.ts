import { createHash, randomBytes } from "node:crypto";
import prisma from "@/backend/database/prisma";
import { getCurrentUser } from "@/backend/auth/session";

export const runtime = "nodejs";

interface ApiKeyRouteContext {
  params: Promise<{ id: string }>;
}

/** Solo el propio usuario (con sesión válida) puede ver o regenerar su API key. */
async function authorize(id: string): Promise<Response | null> {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    return Response.json({ error: "Inicia sesión para administrar tu API key." }, { status: 401 });
  }

  if (sessionUser.id !== id) {
    return Response.json({ error: "No tienes permiso sobre este usuario." }, { status: 403 });
  }

  return null;
}

export async function GET(_request: Request, { params }: ApiKeyRouteContext) {
  const { id } = await params;
  const denied = await authorize(id);
  if (denied) return denied;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      apiKey: { select: { createdAt: true } },
    },
  });

  if (!user) {
    return Response.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  return Response.json(
    { hasApiKey: user.apiKey !== null, createdAt: user.apiKey?.createdAt ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(_request: Request, { params }: ApiKeyRouteContext) {
  const { id } = await params;
  const denied = await authorize(id);
  if (denied) return denied;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!user) {
    return Response.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const apiKey = `cs_live_${randomBytes(32).toString("hex")}`;
  const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");
  const record = await prisma.apiKey.upsert({
    where: { userId: id },
    create: { userId: id, apiKeyHash },
    update: { apiKeyHash, createdAt: new Date() },
    select: { createdAt: true },
  });

  return Response.json(
    { apiKey, createdAt: record.createdAt },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}