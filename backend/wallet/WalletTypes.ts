export interface WalletBalanceDTO {
  code: string;
  issuer: string | null;
  amount: string;
}

export interface WalletAccountDTO {
  /** false si la cuenta todavía no existe en la red (nunca recibió XLM). */
  exists: boolean;
  balances: WalletBalanceDTO[];
  /** true si tiene la trustline del USDC que usa Cosmos en esta red (necesaria para cobrar en USDC). */
  acceptsUsdc: boolean;
}

export interface WalletIncomeDTO {
  currency: string;
  amount: string;
  payments: number;
}

export interface WalletDTO {
  walletAddress: string | null;
  /** "testnet" o "public", según la API key de Cosmos. */
  network: string;
  /** null si no hay wallet configurada o no se pudo consultar la red. */
  account: WalletAccountDTO | null;
  accountError: string | null;
  /** Cobrado este mes (pagos completados), por activo. */
  incomeThisMonth: WalletIncomeDTO[];
}
