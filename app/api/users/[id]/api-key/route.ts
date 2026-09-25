import { createHash, randomBytes } from "node:crypto";
import prisma from "@/backend/database/prisma";

export const runtime = "nodejs";

interface ApiKeyRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: ApiKeyRouteContext) {
  const { id } = await params;
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