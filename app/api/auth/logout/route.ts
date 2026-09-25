import { deleteCurrentSession } from "@/backend/auth/session";

export const runtime = "nodejs";

/** POST /api/auth/logout — invalida la sesión actual y borra la cookie. */
export async function POST() {
  await deleteCurrentSession();

  return new Response(null, { status: 204 });
}
