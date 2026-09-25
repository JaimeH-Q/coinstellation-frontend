import { verifyCredentials } from "@/backend/users/UserRegister";
import { createSession } from "@/backend/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/auth/login
 * Body: { email, password, remember? }
 * Verifica las credenciales, crea la sesión y deja la cookie httpOnly.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    const parsedBody: unknown = await request.json();

    if (!parsedBody || typeof parsedBody !== "object") {
      throw new Error("Invalid body");
    }

    body = parsedBody as Record<string, unknown>;
  } catch {
    return Response.json(
      { error: "El cuerpo de la solicitud debe ser un objeto JSON válido." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember === true;

  if (!email || !password) {
    return Response.json(
      { error: "El correo y la contraseña son obligatorios." },
      { status: 422 },
    );
  }

  const user = await verifyCredentials({ email, password });

  if (!user) {
    return Response.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 },
    );
  }

  await createSession(user.id, remember);

  return Response.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
