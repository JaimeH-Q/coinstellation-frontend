import prisma from "@/backend/database/prisma";
import { getCurrentUser } from "@/backend/auth/session";
import { cosmosNetwork, normalizeAmount, resolveExpectedAsset } from "@/backend/payments/CosmosPayments";
import { fetchAccountSummary } from "@/backend/payments/StellarLookup";
import { isValidStellarPublicKey } from "@/backend/stellar/address";
import { readJsonObject } from "@/backend/http/readJson";
import type { WalletDTO, WalletIncomeDTO } from "@/backend/wallet/WalletTypes";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

/** Unidades mínimas de Stellar: 7 decimales. */
const STROOPS = BigInt(10_000_000);

/** Suma montos decimales de hasta 7 decimales sin errores de coma flotante. */
function sumAmounts(amounts: string[]): string {
  const total = amounts.reduce((sum, amount) => {
    const [whole, fraction = ""] = amount.split(".");
    return sum + BigInt(whole) * STROOPS + BigInt(fraction.padEnd(7, "0").slice(0, 7));
  }, BigInt(0));

  return normalizeAmount(`${total / STROOPS}.${(total % STROOPS).toString().padStart(7, "0")}`) ?? "0";
}

async function incomeThisMonth(userId: string): Promise<WalletIncomeDTO[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const payments = await prisma.payment.findMany({
    where: { userId, status: "completed", confirmedAt: { gte: monthStart } },
    select: { currency: true, amount: true },
  });

  const byCurrency = new Map<string, string[]>();
  for (const payment of payments) {
    byCurrency.set(payment.currency, [...(byCurrency.get(payment.currency) ?? []), payment.amount]);
  }

  return [...byCurrency.entries()].map(([currency, amounts]) => ({
    currency,
    amount: sumAmounts(amounts),
    payments: amounts.length,
  }));
}

async function buildWallet(userId: string, walletAddress: string | null): Promise<WalletDTO> {
  const network = cosmosNetwork();
  let account: WalletDTO["account"] = null;
  let accountError: string | null = null;

  if (walletAddress) {
    try {
      const summary = await fetchAccountSummary(network, walletAddress);
      const usdc = resolveExpectedAsset("USDC");
      account = {
        ...summary,
        acceptsUsdc: summary.balances.some((b) => b.code === usdc.code && b.issuer === usdc.issuer),
      };
    } catch {
      accountError = "No se pudo consultar la wallet en la red de Stellar.";
    }
  }

  return { walletAddress, network, account, accountError, incomeThisMonth: await incomeThisMonth(userId) };
}

/** GET /api/wallet — wallet configurada, su estado en la red y lo cobrado este mes. */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para ver tu billetera." }, { status: 401 });
  }

  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { walletAddress: true } });

  return Response.json(
    { wallet: await buildWallet(user.id, row?.walletAddress ?? null) },
    { headers: NO_STORE },
  );
}

/** PUT /api/wallet { walletAddress: "G…" | null } — guarda o quita la wallet pública. */
export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Inicia sesión para configurar tu billetera." }, { status: 401 });
  }

  const body = await readJsonObject(request);

  if (!body || !("walletAddress" in body)) {
    return Response.json({ error: "Falta walletAddress." }, { status: 400 });
  }

  let walletAddress: string | null = null;

  if (body.walletAddress !== null) {
    walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim().toUpperCase() : "";

    if (!isValidStellarPublicKey(walletAddress)) {
      return Response.json(
        { error: "La dirección no es una wallet pública de Stellar válida (empieza con G y tiene 56 caracteres)." },
        { status: 422 },
      );
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { walletAddress } });

  return Response.json({ wallet: await buildWallet(user.id, walletAddress) }, { headers: NO_STORE });
}
