/** Estados del ciclo de vida de un pago, incluido el estado previo a la confirmacion on-chain. */
export type PaymentStatus =
	| "pending"
	| "processing"
	| "confirmed"
	| "completed"
	| "failed"
	| "cancelled"
	| "refunded";

/**
 * Importes serializados como texto para evitar perdida de precision con tokens.
 * Ejemplo: "12.50" o una cantidad entera en la unidad minima del activo.
 */
export type PaymentAmount = string;

/** Datos comunes del activo con el que se expresa un importe. */
export interface PaymentAsset {
	currency: string;
	network?: string;
	contractAddress?: string;
}

/** Datos opcionales que permiten reconciliar un pago con una blockchain. */
export interface PaymentBlockchainDetails {
	transactionId: string;
	network: string;
	asset?: string;
	fromAddress?: string;
	toAddress?: string;
	blockNumber?: number;
	confirmations?: number;
	confirmedAt?: string;
}

/** Campos necesarios para crear un registro de pago. */
export interface CreatePayment {
	userId: string;
	packageId: string;
	amount: PaymentAmount;
	fees: PaymentAmount;
	finalAmount: PaymentAmount;
	asset: PaymentAsset;
	status?: PaymentStatus;
	transactionId?: string | null;
	blockchain?: PaymentBlockchainDetails;
}

/** Registro persistido en el historial de pagos. */
export interface Payment extends CreatePayment {
	id: string;
	createdAt: string;
	updatedAt: string;
	metadata?: Record<string, unknown>;
}

/** Filtros para consultar el historial de pagos de un usuario. */
export interface PaymentHistoryFilters {
	userId?: string;
	packageId?: string;
	status?: PaymentStatus;
	transactionId?: string;
}

export const EXAMPLE_PAYMENT_PACKAGES = ["package-basic", "package-pro", "package-enterprise"] as const;
export const EXAMPLE_PAYMENT_ASSETS: PaymentAsset[] = [
	{ currency: "USDC", network: "STELLAR" },
	{ currency: "XLM", network: "STELLAR" },
	{ currency: "USDC", network: "BASE", contractAddress: "0xToyUsdcContract" },
];

const EXAMPLE_PAYMENT_STATUSES: PaymentStatus[] = [
	"pending",
	"processing",
	"confirmed",
	"completed",
	"failed",
];

/** Genera pagos de juguete distintos en cada llamada para demos y pruebas locales. */
export function createExamplePayments(userId: string, count = 5): Payment[] {
	if (!userId.trim()) {
		throw new Error("Payment example userId is required.");
	}

	if (!Number.isInteger(count) || count < 0) {
		throw new Error("Payment example count must be a non-negative integer.");
	}

	return Array.from({ length: count }, () => createExamplePayment(userId.trim()));
}

function createExamplePayment(userId: string): Payment {
	const amountInCents = randomInteger(500, 100000);
	const feeInCents = Math.max(1, Math.round(amountInCents * randomInteger(1, 5) / 100));
	const status = randomItem(EXAMPLE_PAYMENT_STATUSES);
	const transactionId = status === "confirmed" || status === "completed"
		? createToyTransactionId()
		: null;
	const now = Date.now();
	const createdAt = new Date(now - randomInteger(0, 30) * 24 * 60 * 60 * 1000).toISOString();
	const asset = { ...randomItem(EXAMPLE_PAYMENT_ASSETS) };

	return {
		id: crypto.randomUUID(),
		userId,
		packageId: randomItem(EXAMPLE_PAYMENT_PACKAGES),
		amount: formatCents(amountInCents),
		fees: formatCents(feeInCents),
		finalAmount: formatCents(amountInCents + feeInCents),
		asset,
		status,
		transactionId,
		blockchain: transactionId
			? {
				transactionId,
				network: asset.network ?? "TESTNET",
				asset: asset.currency,
				fromAddress: "toy-wallet-from",
				toAddress: "toy-wallet-to",
				blockNumber: randomInteger(100000, 999999),
				confirmations: randomInteger(1, 24),
				confirmedAt: new Date(now).toISOString(),
			}
			: undefined,
		createdAt,
		updatedAt: new Date(now).toISOString(),
		metadata: { example: true },
	};
}

function randomItem<T>(items: readonly T[]): T {
	return items[randomInteger(0, items.length - 1)];
}

function randomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatCents(cents: number): PaymentAmount {
	return (cents / 100).toFixed(2);
}

function createToyTransactionId(): string {
	return `0x${crypto.randomUUID().replaceAll("-", "")}`;
}
