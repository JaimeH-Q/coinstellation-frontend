interface CreatePaymentBody {
  amount: number;
  currency: string;
  description?: string;
  user: string;
}

interface Payment extends CreatePaymentBody {
  id: string;
  createdAt: string;
}

const payments: Payment[] = [];

export async function GET() {
  return Response.json({ message: "This is the payments API." });
}


// Create payments
export async function POST(request: Request) {
  const body = await readRequestBody(request);

  if (body === null) {
    return Response.json(
      { error: "Body must be a valid JSON object." },
      { status: 400 },
    );
  }

  if (!isValidPaymentBody(body)) {
    return Response.json(
      { error: "amount, currency and user are required with valid types." },
      { status: 422 },
    );
  }

  const payment = createPayment(body);
  payments.push(payment);

  return Response.json({ payment }, { status: 201 });
}

async function readRequestBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isValidPaymentBody(value: unknown): value is CreatePaymentBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.amount === "number" &&
    Number.isFinite(body.amount) &&
    typeof body.currency === "string" &&
    body.currency.trim().length > 0 &&
    typeof body.user === "string" &&
    body.user.trim().length > 0 &&
    (body.description === undefined || typeof body.description === "string")
  );
}


function createPayment(body: CreatePaymentBody): Payment {
  return {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}