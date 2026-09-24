import { Assets, Client } from "@cosmosapp/pay_sdk";

export interface CreateCosmosPaymentInput {
  destination?: string;
  amount: string;
  currency: string;
  description?: string;
  memo?: string;
  callback?: string;
}

let cosmosClient: Client | undefined;

function getCosmosClient(): Client {
  const apiKey = process.env.COSMOS_PAY_API_KEY;

  if (!apiKey) {
    throw new Error("COSMOS_PAY_API_KEY is not configured.");
  }

  cosmosClient ??= new Client({ apiKey });
  return cosmosClient;
}

function resolveAsset(currency: string) {
  const normalizedCurrency = currency.trim().toUpperCase();

  if (normalizedCurrency === "XLM") {
    return Assets.XLM;
  }

  return normalizedCurrency;
}

/** Crea el intent en Cosmos sin exponer la API key al navegador. */
export async function createCosmosPayment(input: CreateCosmosPaymentInput) {
  const destination = input.destination?.trim() || process.env.COSMOS_MERCHANT_ADDRESS;

  if (!destination) {
    throw new Error("COSMOS_MERCHANT_ADDRESS is not configured.");
  }

  const intent = await getCosmosClient().paymentIntents.createPay({
    destination,
    amount: input.amount,
    asset: resolveAsset(input.currency),
    ...(input.memo ? { memo: input.memo.trim() } : {}),
    ...(input.description ? { msg: input.description.trim() } : {}),
    ...(input.callback ? { callback: input.callback.trim() } : {}),
  });

  return {
    id: intent.id,
    status: intent.status,
    network: intent.network,
    destination: intent.destination,
    amount: intent.amount,
    asset: intent.asset,
    uri: intent.uri,
    qr: intent.qr,
    createdAt: intent.createdAt,
  };
}

export async function validateCosmosPayment(id: string, txHash: string) {
  const outcome = await getCosmosClient().paymentIntents.validate(id, { txHash });

  return {
    valid: outcome.valid,
    status: outcome.status,
    reason: outcome.reason,
    paymentIntent: outcome.paymentIntent,
  };
}