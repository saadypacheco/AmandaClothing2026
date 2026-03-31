# mercadopago.md

## Integración MercadoPago

### Workflow
1. Usuario agrega productos al carrito
2. Click en "Comprar" → POST /pagos/preference
3. Backend crea preference y devuelve URL de checkout
4. Usuario es redirigido a MercadoPago
5. Pago exitoso → webhook en /pagos/webhook
6. Validamos firma y actualizamos estado de pedido a "pagado"

### Variábles de entorno
- `NEXT_PUBLIC_MP_PUBLIC_KEY`: public key para el checkout
- `MP_ACCESS_TOKEN`: token privado en backend
- `MP_WEBHOOK_SECRET`: para validar webhooks

### Testing
Usar credenciales de sandbox en desarrollo.
