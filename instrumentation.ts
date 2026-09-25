/** Next.js llama a register() una sola vez al arrancar cada instancia del servidor. */
export async function register() {
  // La tarea usa Prisma y node:crypto, así que solo corre en el runtime de Node.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPaymentReconciler } = await import("./backend/jobs/reconcilePayments");
    startPaymentReconciler();
  }
}
