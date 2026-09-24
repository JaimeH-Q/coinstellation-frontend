# Coinstellation Payments API

Coinstellation permite que webstores externas creen cobros en Stellar mediante Cosmos Pay.

Este repositorio contiene la plataforma y su API hospedada. **Los integradores no necesitan clonar este frontend, instalar sus dependencias ni ejecutar el dashboard.** Para crear un pago solo deben llamar al endpoint público de creación desde el backend de su webstore.

## Flujo de integración

1. El backend de la webstore llama a `POST /api/payments/create`.
2. Envía la wallet pública Stellar del creador en `destination`.
3. Coinstellation crea el intent Cosmos Pay y genera el `MEMO_ID`.
4. La respuesta incluye una URI SEP-7 y un QR para que el cliente pague.
5. La webstore muestra el QR o la URI en su checkout.

Cosmos Pay utiliza un único destino por intent, por lo que el pago llega directamente a la wallet pública indicada por la webstore.

## Crear un pago

Endpoint hospedado:

```http
POST https://TU_DOMINIO_COINSTELLATION/api/payments/create
```

Headers requeridos:

```http
Content-Type: application/json
X-Store-Key: TU_CLAVE_DE_WEBSTORE
```

Body mínimo:

```json
{
  "destination": "G...WALLET_PUBLICA_DEL_CREADOR",
  "amount": "24.99",
  "currency": "XLM",
  "description": "Orden #1001"
}
```

### Ejemplo con `fetch`

Este código se ejecuta en el backend de la webstore, no en el navegador:

```ts
const response = await fetch(
  "https://TU_DOMINIO_COINSTELLATION/api/payments/create",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Store-Key": process.env.WEBSTORE_API_KEY!,
    },
    body: JSON.stringify({
      destination: "G...WALLET_PUBLICA_DEL_CREADOR",
      amount: "24.99",
      currency: "XLM",
      description: "Orden #1001",
    }),
  },
);

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error ?? "No se pudo crear el pago");
}

const payment = data.payment;
// payment.uri: enlace web+stellar:pay para la wallet
// payment.qr: imagen QR para mostrar en el checkout
// payment.id: identificador del intent
// payment.memo: MEMO_ID generado por Coinstellation
```

### Ejemplo con `curl`

```bash
curl -X POST https://TU_DOMINIO_COINSTELLATION/api/payments/create \
  -H "Content-Type: application/json" \
  -H "X-Store-Key: TU_CLAVE_DE_WEBSTORE" \
  -d '{
    "destination": "G...WALLET_PUBLICA_DEL_CREADOR",
    "amount": "24.99",
    "currency": "XLM",
    "description": "Orden #1001"
  }'
```

## Respuesta exitosa

```json
{
  "payment": {
    "id": "pi_...",
    "status": "PENDING",
    "network": "testnet",
    "destination": "G...WALLET_PUBLICA_DEL_CREADOR",
    "amount": "24.99",
    "asset": "native",
    "memo": "1727182345123",
    "uri": "web+stellar:pay?...",
    "qr": "data:image/png;base64,...",
    "createdAt": "2026-09-24T00:00:00.000Z"
  }
}
```

`destination` es obligatorio y debe ser una dirección pública Stellar que empiece por `G`.
El `amount` debe enviarse como string decimal. El `MEMO_ID` lo genera Coinstellation y no debe enviarlo la webstore.

## Errores frecuentes

- `401`: falta `X-Store-Key` o la clave no es válida.
- `422`: falta `destination`, `amount` o `currency`, o tienen un formato inválido.
- `502`: Cosmos Pay no pudo crear el intent.
- `503`: falta configurar la API key de Cosmos Pay en el servidor de Coinstellation.

## Seguridad

- La llamada debe salir del backend de la webstore.
- Nunca expongas `X-Store-Key` ni una API key de Cosmos Pay en el frontend.
- `destination` es pública; nunca envíes una clave privada de wallet.
- Usa una clave de webstore independiente por integración.
- Usa wallets de testnet con API keys `dv_...` y mainnet con API keys `prod_...`.

## Validación posterior

Cuando el cliente haya pagado y la webstore tenga el `txHash`, puede validarlo mediante:

```http
POST https://TU_DOMINIO_COINSTELLATION/api/payments/{paymentId}/validate
Content-Type: application/json
X-Store-Key: TU_CLAVE_DE_WEBSTORE
```

```json
{
  "txHash": "HASH_DE_LA_TRANSACCION"
}
```

La validación es server-side y confirma que la transacción corresponde al intent creado.

## Para colaboradores del proyecto

Solo quienes mantengan la plataforma necesitan clonar el repositorio. Para desarrollo interno:

```bash
npm install
npm run dev
```

El dashboard local se abre en `http://localhost:3000`. Los consumidores de la API no necesitan seguir estos pasos.
