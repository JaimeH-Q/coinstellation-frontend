import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import prisma from "../database/prisma";

export const SESSION_COOKIE = "coinstellation_session";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Duración de la sesión con "Recuérdame" marcado. */
const REMEMBER_DURATION_MS = 30 * DAY_MS;
/** Duración de la sesión sin "Recuérdame" (la cookie además muere al cerrar el navegador). */
const DEFAULT_DURATION_MS = DAY_MS;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

/** El navegador solo guarda el token; en la base se guarda su hash. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * true si la solicitud llegó por HTTPS, directo o a través de un proxy (X-Forwarded-Proto).
 * Decide si la cookie lleva `Secure`: el navegador descarta una cookie `Secure` recibida por
 * HTTP, así que marcarla según NODE_ENV rompía el login al servir la app por http://IP:puerto.
 */
export function isHttpsRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();

  if (forwardedProto) {
    return forwardedProto === "https";
  }

  return new URL(request.url).protocol === "https:";
}

/**
 * Crea una sesión en la base de datos y escribe la cookie httpOnly.
 * Solo se puede llamar desde un Route Handler o una Server Function.
 * `secure` debe ser true cuando la solicitud llegó por HTTPS (ver isHttpsRequest).
 */
export async function createSession(userId: string, remember: boolean, secure: boolean): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (remember ? REMEMBER_DURATION_MS : DEFAULT_DURATION_MS));

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    // Sin "Recuérdame" es una cookie de sesión del navegador.
    ...(remember ? { expires: expiresAt } : {}),
  });
}

/**
 * Devuelve el usuario de la sesión actual, o null si no hay sesión válida.
 * Está memoizado por request con `cache`.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  return session.user;
});

/** Borra la sesión actual de la base de datos y elimina la cookie. */
export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}
