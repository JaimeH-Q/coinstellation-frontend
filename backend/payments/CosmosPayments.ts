import { Assets, Client, TestnetAssets, Webhooks, type PaymentIntentData } from "@cosmosapp/pay_sdk";

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

/** Red de Stellar en la que opera la API key de Cosmos: `prod_` → mainnet, `dv_` → testnet. */
export function cosmosNetwork(): "public" | "testnet" {
  return process.env.COSMOS_PAY_API_KEY?.startsWith("prod_") ? "public" : "testnet";
}

export interface ExpectedAsset {
  code: string;
  /** null para XLM nativo. */
  issuer: string | null;
}

/**
 * Activo de Stellar para una moneda, con el emisor de la red correcta.
 * La red la define la API key de Cosmos: `prod_` → mainnet, `dv_` → testnet.
 * Importante: pasarle a Cosmos solo el código ("USDC") sin emisor hace que el SDK descarte
 * el activo y el intent se cree en XLM nativo.
 */
export function resolveExpectedAsset(currency: string): ExpectedAsset {
  const catalog = cosmosNetwork() === "public" ? Assets : TestnetAssets;
  const code = currency.trim().toUpperCase();
  const asset = code === "XLM" ? catalog.XLM : code === "USDC" ? catalog.USDC : null;

  if (!asset) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return { code: asset.code, issuer: asset.issuer ?? null };
}

/** Compara montos decimales ignorando ceros finales ("5" == "5.0000000"). */
export function normalizeAmount(amount: string | null | undefined): string | null {
  if (!amount || !/^\d+(\.\d+)?$/.test(amount)) return null;
  const [whole, fraction = ""] = amount.split(".");
  const trimmedFraction = fraction.replace(/0+$/, "");
  return `${whole.replace(/^0+(?=\d)/, "")}${trimmedFraction ? `.${trimmedFraction}` : ""}`;
}

/**
 * Comprueba que el intent de Cosmos cobre exactamente el activo y el monto esperados.
 * Devuelve el motivo de la discrepancia, o null si coincide.
 */
export function findIntentMismatch(
  intent: Pick<PaymentIntentData, "asset" | "assetIssuer" | "amount">,
  expected: { asset: ExpectedAsset; amount: string },
): string | null {
  const intentIsNative = intent.asset === "native" || (intent.asset === "XLM" && !intent.assetIssuer);
  const expectedIsNative = expected.asset.issuer === null;

  if (intentIsNative !== expectedIsNative) {
    return `El intent cobra ${intentIsNative ? "XLM" : intent.asset} y el pago esperaba ${expected.asset.code}.`;
  }

  if (
    !expectedIsNative &&
    (intent.asset !== expected.asset.code || intent.assetIssuer !== expected.asset.issuer)
  ) {
    return `El intent cobra ${intent.asset} (${intent.assetIssuer ?? "sin emisor"}) y el pago esperaba ${expected.asset.code} (${expected.asset.issuer}).`;
  }

  if (normalizeAmount(intent.amount) !== normalizeAmount(expected.amount)) {
    return `El intent cobra ${intent.amount ?? "un monto abierto"} y el pago esperaba ${expected.amount}.`;
  }

  return null;
}

/** Crea el intent en Cosmos sin exponer la API key al navegador. */
export async function createCosmosPayment(input: CreateCosmosPaymentInput) {
  const destination = input.destination.trim();
  const memo = createMemoId();

  if (!destination) {
    throw new Error("The webstore creator's Stellar wallet is required.");
  }

  const expectedAsset = resolveExpectedAsset(input.currency);
  const intent = await getCosmosClient().paymentIntents.createPay({
    destination,
    amount: input.amount,
    asset: expectedAsset.issuer
      ? { code: expectedAsset.code, issuer: expectedAsset.issuer }
      : Assets.XLM,
    memo,
    ...(input.description ? { msg: input.description.trim() } : {}),
    ...(input.callback ? { callback: input.callback.trim() } : {}),
  });

  // Nunca devolver un intent que cobre otra cosa: se cancela y se informa el error.
  const mismatch = findIntentMismatch(intent.toJSON(), { asset: expectedAsset, amount: input.amount });

  if (mismatch) {
    await intent.cancel().catch(() => undefined);
    throw new Error(`Cosmos created an intent that does not match the package. ${mismatch}`);
  }

  return {
    id: intent.id,
    status: intent.status,
    network: intent.network,
    destination: intent.destination,
    amount: intent.amount,
    asset: intent.asset,
    assetIssuer: intent.assetIssuer,
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
    paymentIntent: outcome.paymentIntent ? outcome.paymentIntent.toJSON() : null,
  };
}

/** Consulta el estado actual de un intent en Cosmos Pay (para conciliar pagos pendientes). */
export async function fetchCosmosPayment(id: string): Promise<PaymentIntentData> {
  const intent = await getCosmosClient().paymentIntents.fetch(id);
  return intent.toJSON();
}

/**
 * Verifica la firma de un webhook de Cosmos Pay y devuelve el evento.
 * Lanza un error si falta COSMOS_WEBHOOK_SECRET o la firma no es válida.
 */
export function constructCosmosWebhookEvent(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.COSMOS_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("COSMOS_WEBHOOK_SECRET is not configured.");
  }

  return Webhooks.constructEvent<PaymentIntentData>(rawBody, signatureHeader, secret);
}

function createMemoId(): string {
  return String(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}