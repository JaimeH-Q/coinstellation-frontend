import { getCurrentUser } from "@/backend/auth/session";
import { deleteCategory } from "@/backend/packages/PackagesRepository";

export const runtime = "nodejs";

/** DELETE /api/packages/categories/:id — borra la categoría; sus paquetes quedan sin categoría. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para borrar categorías." }, { status: 401 });
  }

  const { id } = await params;

  if (!(await deleteCategory(user.id, id))) {
    return Response.json({ error: "Categoría no encontrada." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
