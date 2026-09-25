import {
  getUserById,
  registerUser,
  type User,
} from "@/backend/users/UserRegister";

type UserRequestBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  termsAccepted?: unknown;
};

function toPublicUser(user: User) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * GET /api/users?id=<userId>
 * Busca un usuario por su ID.
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return Response.json(
      { error: "El ID de usuario es obligatorio." },
      { status: 400 },
    );
  }

  const user = await getUserById(id);

  if (!user) {
    return Response.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  return Response.json({ user: toPublicUser(user) });
}

/**
 * POST /api/users
 *
 * Registra un usuario: { name, email, password, confirmPassword?, termsAccepted? }
 * El inicio de sesión está en POST /api/auth/login.
 */
export async function POST(request: Request) {
  let body: UserRequestBody;

  try {
    const parsedBody: unknown = await request.json();

    if (!parsedBody || typeof parsedBody !== "object") {
      throw new Error("Invalid body");
    }

    body = parsedBody as UserRequestBody;
  } catch {
    return Response.json(
      { error: "El cuerpo de la solicitud debe ser un objeto JSON válido." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  // Flujo de Registro (Register)
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
  const termsAccepted = body.termsAccepted === true;

  if (!name || !email || !password) {
    return Response.json(
      { error: "El nombre, correo y contraseña son obligatorios." },
      { status: 422 },
    );
  }

  if (name.length < 2) {
    return Response.json(
      { error: "El nombre debe tener al menos 2 caracteres." },
      { status: 422 },
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json(
      { error: "El correo electrónico no tiene un formato válido." },
      { status: 422 },
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 422 },
    );
  }

  // Validación de confirmación de contraseña si fue enviada
  if (body.confirmPassword !== undefined && password !== confirmPassword) {
    return Response.json(
      { error: "Las contraseñas no coinciden." },
      { status: 422 },
    );
  }

  // Validación de mayoría de edad y términos
  if (body.termsAccepted !== undefined && !termsAccepted) {
    return Response.json(
      { error: "Debes confirmar que tienes al menos 18 años y aceptar los términos y la política de privacidad." },
      { status: 422 },
    );
  }

  try {
    const user = await registerUser({ name, email, password });
    return Response.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return Response.json(
        { error: "Ya existe un usuario registrado con ese correo electrónico." },
        { status: 409 },
      );
    }

    return Response.json({ error: "No se pudo registrar al usuario." }, { status: 500 });
  }
}
