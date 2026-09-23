const baseURL = "https://api.abroad.finance";

const mockQuoteResponse = {
  expiration_time: 1893456000000,
  fee: {
    amount: "0.5",
    currency: "USDC",
    type: "combined",
  },
  quote_id: "550e8400-e29b-41d4-a716-446655440000",
  value: 100.5,
};

export async function createPayment(amount: number, currency: string) {
  try {
    const response = await fetch(baseURL + "/quote", {
      method: "POST",
      headers: {
        "X-API-Key": "YOUR_API_KEY",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        crypto_currency: currency,
        network: "STELLAR",
        payment_method: "BREB",
        target_currency: "COP",
      }),
    });

    if (!response.ok) {
      throw new Error("Abroad integration unavailable");
    }

    return await response.json();
  } catch {
    return mockQuoteResponse;
  }
}
