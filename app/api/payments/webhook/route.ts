import { SIGNATURE_HEADER } from "@cosmosapp/pay_sdk";
import { constructCosmosWebhookEvent } from "@/backend/payments/CosmosPayments";
import { applyCosmosIntentUpdate } from "@/backend/payments/PaymentsRepository";

export const runtime = "nodejs";

/**
 * POST /api/payments/webhook
 * Recibe los eventos de Cosmos Pay (PAYMENT_INTENT_*) y actualiza el pago registrado.
 * Registrar esta URL en Cosmos y guardar el secreto whsec_… en COSMOS_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  if (!process.env.COSMOS_WEBHOOK_SECRET) {
    return Response.json({ error: "Webhooks are not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  let event: ReturnType<typeof constructCosmosWebhookEvent>;

  try {
    event = constructCosmosWebhookEvent(rawBody, request.headers.get(SIGNATURE_HEADER));
  } catch {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.data?.id && event.type !== "PAYMENT_INTENT_DELETED") {
    await applyCosmosIntentUpdate(event.data);
  }

  // Los eventos de intents que no creamos se aceptan igual para que Cosmos no los reintente.
  return new Response(null, { status: 204 });
}
