import { Assets, Client } from "@cosmosapp/pay_sdk";

export interface CreateCosmosPaymentInput {
  /** Public Stellar address of the webstore owner. */
  destination: string;
  amount: string;
  currency: string;
  description?: string;
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
  const destination = input.destination.trim();
  const memo = createMemoId();

  if (!destination) {
    throw new Error("The webstore creator's Stellar wallet is required.");
  }

  const intent = await getCosmosClient().paymentIntents.createPay({
    destination,
    amount: input.amount,
    asset: resolveAsset(input.currency),
    memo,
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
    memo: intent.memo,
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

function createMemoId(): string {
  return String(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}