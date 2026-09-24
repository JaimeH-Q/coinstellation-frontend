## Resumen

Coinstellation es una plataforma SaaS para creadores que administran proyectos, webstores, paquetes y cobros. El dashboard centraliza métricas, historial de pagos, gestión de proyectos y una integración server-side con Cosmos Pay para aceptar pagos Stellar.

El proyecto prioriza una experiencia de integración clara para webstores externas: una tienda envía el importe y la wallet pública del creador, recibe una URI SEP-7 y un QR, y luego valida la transacción con su `txHash`.

## Arquitectura

- `app/`: páginas del dashboard y API routes de Next.js App Router.
- `components/dashboard/`: interfaz del dashboard, métricas, gráficos, proyectos, paquetes, API e historial.
- `backend/payments/`: lógica de pagos y adaptación a Cosmos Pay.
- `backend/database/`: acceso a usuarios con Prisma y SQLite.
- `prisma/`: esquema y migraciones de base de datos.
- `public/`: recursos estáticos y fuentes.

La lógica sensible de Cosmos Pay vive en el servidor. El frontend nunca recibe `COSMOS_PAY_API_KEY`.

## Flujo de pagos

1. Una webstore externa llama a `POST /api/payments/create` desde su backend.
2. La petición incluye `destination`, la dirección pública Stellar del creador, además de `amount` y `currency`.
3. El backend crea un intent `PAY` mediante `@cosmosapp/pay_sdk`.
4. El backend genera un `MEMO_ID` numérico y devuelve `payment.id`, `payment.memo`, `payment.uri` y `payment.qr`.
5. El cliente paga desde una wallet Stellar compatible.
6. La webstore llama a `POST /api/payments/{id}/validate` con el `txHash`.

Cosmos Pay acepta un destino por intent. Por diseño, el pago se dirige directamente a la wallet del creador. La distribución automática de una comisión requiere soporte de split o liquidación del proveedor y no debe asumirse sin una API específica.

## Seguridad

- `COSMOS_PAY_API_KEY` permanece exclusivamente en variables de entorno del servidor.
- Las webstores se autentican con `X-Store-Key` y `WEBSTORE_API_KEY`.
- En producción, la clave de webstore debe ser obligatoria y distinta por tienda.
- `destination` es una dirección pública; nunca se debe solicitar ni almacenar la clave privada de una wallet.
- `WEBSTORE_ALLOWED_ORIGIN` controla el origen permitido para CORS.
- Las claves `dv_...` se usan para testnet y `prod_...` para mainnet.

## Contrato de API externo

### Crear pago

`POST /api/payments/create`

Headers:

- `Content-Type: application/json`
- `X-Store-Key: <webstore-secret>`

Body mínimo:

```json
{
  "destination": "G...PUBLIC_STELLAR_ADDRESS",
  "amount": "24.99",
  "currency": "XLM"
}
```

`destination` es obligatorio. El backend rechaza cuerpos inválidos con `400` o `422` y no usa una wallet merchant global como fallback.

### Validar pago

`POST /api/payments/{id}/validate`

```json
{
  "txHash": "<stellar-transaction-hash>"
}
```

## Convenciones para modificar el proyecto

- Mantener la API key y toda llamada al SDK Cosmos en código server-only.
- Preferir los patrones existentes de Next.js App Router y TypeScript estricto.
- Usar importaciones `@/*` según el alias configurado.
- Mantener los importes como strings para evitar pérdida de precisión.
- No modificar ni revertir cambios ajenos sin confirmación.
- Validar las entradas externas antes de llamar a Cosmos Pay.
- Evitar presentar datos demo como pagos reales en nuevas funcionalidades.

## Comandos de validación

```bash
npm install
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
```

## Estado conocido

El núcleo de creación y validación de intents está implementado y compilable. Algunas secciones visuales del dashboard todavía usan datos de demo o almacenamiento local, por lo que una revisión debe distinguir entre la interfaz demostrativa y la persistencia productiva. El lint global puede incluir warnings o problemas preexistentes fuera de la integración de pagos; primero conviene validar los archivos modificados.

## Criterio de una buena revisión

Evaluar primero seguridad, semántica de los pagos, validación de inputs, manejo de errores, persistencia e idempotencia. Reconocer como fortalezas la separación server/client, el uso del SDK oficial, la obligación de una wallet destino por webstore y la documentación del contrato externo. Señalar cualquier brecha con precisión y proponer cambios pequeños y verificables.
