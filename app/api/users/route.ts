import {
  getUserById,
  registerUser,
  verifyCredentials,
  type User,
} from "@/backend/users/UserRegister";

type UserRequestBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
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
      { error: "The user id is required." },
      { status: 400 },
    );
  }

  const user = await getUserById(id);

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  return Response.json({ user: toPublicUser(user) });
}

/**
 * POST /api/users
 *
 * Para registrar, enviar: { name, email, password }
 * Para loguear, enviar: { email, password }
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
      { error: "Body must be a valid JSON object." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (body.name === undefined) {
    if (!email || !password) {
      return Response.json(
        { error: "email and password are required." },
        { status: 422 },
      );
    }

    const user = await verifyCredentials({ email, password });

    if (!user) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    return Response.json({ user: toPublicUser(user) });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name || !email || !password) {
    return Response.json(
      { error: "name, email and password are required." },
      { status: 422 },
    );
  }

  if (name.length < 2) {
    return Response.json(
      { error: "The name must have at least 2 characters." },
      { status: 422 },
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json(
      { error: "The email does not have a valid format." },
      { status: 422 },
    );
  }

  try {
    const user = await registerUser({ name, email, password });
    return Response.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return Response.json(
        { error: "A user with that email already exists." },
        { status: 409 },
      );
    }

    return Response.json({ error: "Could not register the user." }, { status: 500 });
  }
}
