import { createExamplePayments } from "@/backend/payments/PaymentsHistory";

const DEFAULT_PAYMENT_COUNT = 5;

/** Devuelve pagos de ejemplo asociados al usuario solicitado. */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("user_id")?.trim();

	if (!userId) {
		return Response.json(
			{ error: "The user_id query parameter is required." },
			{ status: 400 },
		);
	}

	const count = parseCount(searchParams.get("count"));
	if (count === null) {
		return Response.json(
			{ error: "The count query parameter must be a non-negative integer." },
			{ status: 400 },
		);
	}

	return Response.json({ payments: createExamplePayments(userId, count) });
}

function parseCount(value: string | null): number | null {
	if (value === null || value === "") {
		return DEFAULT_PAYMENT_COUNT;
	}

	const count = Number(value);
	return Number.isInteger(count) && count >= 0 ? count : null;
}
