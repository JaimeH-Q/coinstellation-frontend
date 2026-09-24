This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
## Cosmos Pay para webstores

Configura estas variables en el servidor:

```env
COSMOS_PAY_API_KEY=dv_...
WEBSTORE_API_KEY=una-clave-privada-por-webstore
WEBSTORE_ALLOWED_ORIGIN=https://tu-webstore.example
```

Una webstore crea un pago llamando al backend, nunca exponiendo `COSMOS_PAY_API_KEY`:

```ts
const response = await fetch("https://api.tu-plataforma.example/api/payments/create", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"X-Store-Key": process.env.WEBSTORE_API_KEY,
	},
	body: JSON.stringify({
		destination: "G...CUENTA_MERCHANT",
		amount: "10",
		currency: "XLM",
		description: "Orden #1001",
	}),
});

const { payment } = await response.json();
// payment.uri y payment.qr se muestran en el checkout.
```

También puedes crear el pago desde cualquier backend externo con `curl`:

```bash
curl -X POST https://tu-plataforma.example/api/payments/create \
	-H "Content-Type: application/json" \
	-H "X-Store-Key: tu-clave-de-webstore" \
	-d '{
		"destination": "G...WALLET_PUBLICA_DEL_CREADOR",
		"amount": "24.99",
		"currency": "XLM",
		"description": "Orden #1001",
	}'
```

`destination` es obligatorio y debe ser la wallet pública Stellar del creador. La respuesta
incluye `payment.id`, `payment.memo`, `payment.uri` y `payment.qr`. El backend genera
`payment.memo` como un `MEMO_ID` numérico para correlacionar la orden. Si falta `destination`, el endpoint
responde `422` y no crea ningún intent.

La cabecera `X-Store-Key` debe enviarse desde el backend externo; no la incluyas en código
que se ejecute directamente en el navegador.

Después de que el cliente complete el pago con Freighter, xBull, Rabet, LOBSTR o Albedo,
la webstore valida el `txHash` con `POST /api/payments/{payment.id}/validate` y el mismo
header `X-Store-Key`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
