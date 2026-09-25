/** Estados del ciclo de vida de un pago (derivados del estado del intent en Cosmos Pay). */
export type PaymentStatus =
	| "pending"
	| "processing"
	| "completed"
	| "failed"
	| "cancelled"
	| "expired";

/**
 * Importes serializados como texto para evitar perdida de precision con tokens.
 * Ejemplo: "12.50".
 */
export type PaymentAmount = string;

/** Activo con el que se expresa un importe. */
export interface PaymentAsset {
	currency: string;
	network: string;
}

/** Pago tal como lo devuelve la API al dashboard o a la tienda. */
export interface Payment {
	id: string;
	cosmosIntentId: string;
	status: PaymentStatus;
	amount: PaymentAmount;
	asset: PaymentAsset;
	destination: string;
	memo: string | null;
	description: string | null;
	reference: string | null;
	packageId: string | null;
	/** Nombre del paquete al momento de la compra. */
	packageName: string | null;
	/** Jugador que compró (reemplaza %p% en los comandos). */
	playerName: string | null;
	/** Hash de la transacción Stellar, disponible cuando el pago se envió. */
	transactionId: string | null;
	sourceAccount: string | null;
	confirmedAt: string | null;
	/** Motivo por el que el pago falló (p. ej. el intent no coincidía con el paquete). */
	failureReason: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Filtros para consultar el historial de pagos de un usuario. */
export interface PaymentHistoryFilters {
	status?: PaymentStatus;
	take?: number;
}

/** Un pago cuenta como cobrado cuando Cosmos confirmó la transacción. */
export function isPaymentCompleted(payment: Pick<Payment, "status">): boolean {
	return payment.status === "completed";
}
