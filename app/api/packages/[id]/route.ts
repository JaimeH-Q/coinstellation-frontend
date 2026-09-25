import { getCurrentUser } from "@/backend/auth/session";
import { deletePackage } from "@/backend/packages/PackagesRepository";

export const runtime = "nodejs";

/** DELETE /api/packages/:id — borra un paquete propio. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para borrar paquetes." }, { status: 401 });
  }

  const { id } = await params;

  if (!(await deletePackage(user.id, id))) {
    return Response.json({ error: "Paquete no encontrado." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
