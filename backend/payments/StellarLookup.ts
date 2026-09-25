import { normalizeAmount, type ExpectedAsset } from "./CosmosPayments";

/**
 * Búsqueda de pagos en la blockchain (Horizon).
 *
 * Cosmos Pay no vigila la red: un intent solo se completa cuando alguien llama a
 * `validate(txHash)`. Si el comprador paga escaneando el QR o abriendo el URI en su wallet,
 * nadie nos avisa el hash. Por eso la conciliación busca en Horizon el pago que coincide con
 * el intent (destino + memo + activo + monto) y después se lo pasa a Cosmos para validarlo.
 */

const HORIZON_URLS: Record<string, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  public: "https://horizon.stellar.org",
  mainnet: "https://horizon.stellar.org",
};

const PAGE_SIZE = 200;
const MAX_PAGES = 5;
/** Margen por diferencias de reloj entre nuestro servidor y la red. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const PAYMENT_OPERATION_TYPES = new Set([
  "payment",
  "path_payment_strict_receive",
  "path_payment_strict_send",
]);

interface HorizonPaymentRecord {
  type: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  created_at: string;
  transaction_hash: string;
  transaction_successful?: boolean;
  transaction?: { memo?: string; memo_type?: string; successful?: boolean };
}

interface HorizonPage {
  _embedded?: { records?: HorizonPaymentRecord[] };
  _links?: { next?: { href?: string } };
}

export interface PaymentLookup {
  network: string;
  destination: string;
  memo: string;
  asset: ExpectedAsset;
  amount: string;
  /** Fecha de creación del pago: no se buscan transacciones anteriores. */
  since: Date;
}

function horizonUrl(network: string): string {
  return process.env.STELLAR_HORIZON_URL ?? HORIZON_URLS[network.toLowerCase()] ?? HORIZON_URLS.testnet;
}

function matchesPayment(record: HorizonPaymentRecord, lookup: PaymentLookup): boolean {
  if (!PAYMENT_OPERATION_TYPES.has(record.type) || record.to !== lookup.destination) return false;
  if (record.transaction_successful === false || record.transaction?.successful === false) return false;
  if (record.transaction?.memo_type !== "id" || record.transaction.memo !== lookup.memo) return false;

  const isNative = record.asset_type === "native";
  const assetMatches = lookup.asset.issuer === null
    ? isNative
    : !isNative && record.asset_code === lookup.asset.code && record.asset_issuer === lookup.asset.issuer;

  return assetMatches && normalizeAmount(record.amount) === normalizeAmount(lookup.amount);
}

/**
 * Busca en Horizon la transacción que pagó el intent. Devuelve su hash, o null si todavía
 * no hay un pago que coincida en destino, memo, activo y monto.
 */
export async function findPaymentTransaction(lookup: PaymentLookup): Promise<string | null> {
  const oldest = lookup.since.getTime() - CLOCK_SKEW_MS;
  let url: string | undefined =
    `${horizonUrl(lookup.network)}/accounts/${encodeURIComponent(lookup.destination)}/payments` +
    `?order=desc&limit=${PAGE_SIZE}&join=transactions`;

  for (let page = 0; url && page < MAX_PAGES; page++) {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Horizon respondió ${response.status}`);
    }

    const data = (await response.json()) as HorizonPage;
    const records = data._embedded?.records ?? [];

    for (const record of records) {
      if (matchesPayment(record, lookup)) return record.transaction_hash;
    }

    // Orden descendente: si ya pasamos la fecha del pago, no hay nada más que buscar.
    const last = records.at(-1);
    if (!last || new Date(last.created_at).getTime() < oldest || records.length < PAGE_SIZE) break;

    url = data._links?.next?.href;
  }

  return null;
}

export interface AccountBalance {
  /** "XLM" para el activo nativo. */
  code: string;
  issuer: string | null;
  amount: string;
}

export interface AccountSummary {
  /** false si la cuenta todavía no existe en la red (nunca recibió XLM). */
  exists: boolean;
  balances: AccountBalance[];
}

interface HorizonAccount {
  balances?: { asset_type: string; asset_code?: string; asset_issuer?: string; balance: string }[];
}

/** Saldos públicos de una cuenta de Stellar (solo lectura). */
export async function fetchAccountSummary(network: string, address: string): Promise<AccountSummary> {
  const response = await fetch(`${horizonUrl(network)}/accounts/${encodeURIComponent(address)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return { exists: false, balances: [] };
  }

  if (!response.ok) {
    throw new Error(`Horizon respondió ${response.status}`);
  }

  const account = (await response.json()) as HorizonAccount;

  return {
    exists: true,
    balances: (account.balances ?? [])
      .filter((balance) => balance.asset_type === "native" || balance.asset_code)
      .map((balance) => ({
        code: balance.asset_type === "native" ? "XLM" : balance.asset_code!,
        issuer: balance.asset_issuer ?? null,
        amount: balance.balance,
      })),
  };
}

