# ✅ GUÍA DE CONFIGURACIÓN DE WEBHOOKS

## PASO 1: Configurar Variable de Entorno URL

Primero, necesitas que Netlify sepa cuál es tu URL para armar los webhooks.

### En `.env` (desarrollo local):
```env
URL=http://localhost:8888
```

### En Netlify Dashboard (producción):
1. Ve a: **Site → Settings → Build & deploy → Environment variables**
2. Click en **Edit variables**
3. Agrega o edita:
   - **Key**: `URL`
   - **Value**: `https://eloquent-puffpuff-c48359.netlify.app` (sin trailing slash)
4. Click en **Save**

---

## PASO 2: Registrar Webhook de Mercado Pago

### IMPORTANTE: Identificar si estás en SANDBOX o PRODUCCIÓN

Mirando tu `.env`:
```
VITE_MP_PUBLIC_KEY=APP_USR-fcacda04-10ea-4afc-87ed-7a8ff4c8ab6b
MP_ACCESS_TOKEN=APP_USR-2150812221573924-020212-d166d896a6c9da001d5427178624f5b9-3175759108
```

Estos son tokens de **PRODUCCIÓN** (`APP_USR-` = producción, `TEST-` = sandbox).

⚠️ **CUIDADO:** Si cambias a testing, los débitos serán REALES en estas credenciales. Usa credenciales de SANDBOX para testing.

### Registrar Webhook en Mercado Pago

#### opción A: Dashboard de Mercado Pago
1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Click en **Configuración** (esquina superior derecha)
3. Click en **Webhooks** (lado izquierdo)
4. Click en **Agregar evento**
5. Completa:
   - **Aplicación**: Selecciona tu app
   - **URL**: `https://eloquent-puffpuff-c48359.netlify.app/.netlify/functions/mp_webhook`
   - **Eventos a notificar**:
     - ✅ `payment.created` (se crea pago)
     - ✅ `payment.updated` (se actualiza pago)
     - ✅ `payment.approved` (se aprueba)
   - Click en **Guardar**

6. **Verificar webhook**:
   - Mercado Pago enviará un test
   - Mira la consola (netlify logs) para confirmar que se recibió

#### Opción B: Usando API de Mercado Pago (advanced)
```bash
curl -X POST https://api.mercadopago.com/v1/notifications/webhooks \
  -H "Authorization: Bearer APP_USR-..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://luminaweb.netlify.app/.netlify/functions/mp_webhook",
    "events": ["payment.created", "payment.updated", "payment.approved"]
  }'
```

---

## PASO 3: Registrar Webhook de Envia.com

### ⚠️ PRIMERO: Confirma estructura exacta con Envia.com

1. Ve al dashboard de Envia.com:
   - https://app.envia.com
   - Login con tus credenciales

2. Busca **Configuración** → **Webhooks** o **Notificaciones**

3. Agrega nuevo webhook:
   - **URL**: `https://eloquent-puffpuff-c48359.netlify.app/.netlify/functions/envia_webhook`
   - **Eventos**: Selecciona:
     - ✅ Cambio de estado de envío
     - ✅ Pickup programado
     - ✅ Entrega confirmada
   
4. Guarda y verifica que se haya registrado

5. **Probar webhook** (Envia.com debería permitir un test):
   - Click en "Enviar test" o similar
   - Verifica en consola de Netlify que fue recibido

### Si Envia.com no tiene UI para webhooks:
- Contacta con soporte de Envia.com
- Proporciona tu URL: `https://luminaweb.netlify.app/.netlify/functions/envia_webhook`

---

## PASO 4: Verificar Que Todo Funciona

### Test local (desarrollo):
```bash
# Terminal 1: Inicia servidor local
netlify dev

# Terminal 2 (en otra ventana):
# Envía prueba de webhook a Mercado Pago
curl -X POST http://localhost:8888/.netlify/functions/mp_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": 999999999
    }
  }'
```

### Test en producción:
1. Haz un pago de prueba en tu sitio
2. Ve a logs de Netlify:
   - Dashboard → Logs
   - Busca "WEBHOOK DE MERCADO PAGO RECIBIDO"
3. Verifica que aparezca en algunos segundos

---

## PASO 5: Monitorear Webhooks

### Netlify Console/Logs
Para ver qué pasa en tiempo real:

```bash
# Ver logs en vivo
netlify logs

# Ver logs con filtro
netlify logs --tail

# Ver logs específicos de función
netlify logs --function mp_webhook
```

### En Mercado Pago Dashboard
1. Settings → Webhooks
2. Click sobre el webhook que registraste
3. Debería haber un listado de intentos recientes
4. Si falla, muestra el error

### En Envia.com Dashboard
- Busca historial o log de webhooks enviados
- Verifica state (200, 400, 500, etc)

---

## RESUMEN DE URLS WEBHOOK

| Servicio | URL | Evento |
|----------|-----|--------|
| Mercado Pago | `https://eloquent-puffpuff-c48359.netlify.app/.netlify/functions/mp_webhook` | `payment.created`, `payment.updated`, `payment.approved` |
| Envia.com | `https://eloquent-puffpuff-c48359.netlify.app/.netlify/functions/envia_webhook` | `shipment_status_updated`, `pickup_scheduled`, etc |

---

## TROUBLESHOOTING

### Los webhooks no se reciben

**Problema:** No puedo ver "WEBHOOK RECIBIDO" en logs

**Soluciones:**
1. ✓ Verifica que `URL` esté configurado en variables de entorno
2. ✓ Verifica que la URL en los servicios sea correcta (sin typos)
3. ✓ Verifica que el sitio esté deployado (no solo local)
4. ✓ Espera 5-10 minutos para que se propague
5. ✓ Prueba manualmente con `curl` desde terminal
6. ✓ Verifica que tu firewall no bloquee los webhooks

Prueba manual:
```bash
curl -X POST https://luminaweb.netlify.app/.netlify/functions/mp_webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":123}}'
```

Debería responder:
```json
{
  "success": true,
  "message": "Webhook procesado correctamente"
}
```

### Webhooks se reciben pero no procesan el pago

**Problema:** El webhook se recibe pero el pickup no se crea

**Verificaciones:**
1. ✓ El webhook está obteniendo correctamente el payment ID
2. ✓ El status del pago es "approved"
3. ✓ Los datos de envío están en metadata
4. ✓ ENVIA_ACCESS_TOKEN está configurado y es válido
5. ✓ create_pickup.cjs está siendo llamado

Ver logs para ver exactamente dónde falla.

### El precio de envío no se muestra en Mercado Pago

**Problema:** El envío aparece como item pero no suma al total

**Verificar en create_preference.cjs:**
- Los items incluyen el envío: `itemsWithShipping.push({ title: shippingTitle, unit_price: Number(costoEnvio), ... })`
- El unit_price es un número válido (no NaN)
- Todos los precios usan moneda correcta: `currency_id: 'ARS'`

---

## DATOS SENSIBLES ⚠️

En tu webhook verás información sensible:
- Emails de clientes
- Direcciones
- Números de teléfono
- Direcciones IP

**Medidas de seguridad:**
1. ✓ Nunca logguees datos sensibles en producción
2. ✓ Verifica la firma de webhooks
3. ✓ Solo guarda lo mínimo en base de datos
4. ✓ Encripta datos sensibles
5. ✓ Usa HTTPS siempre (Netlify lo pone automático)

---

## PRÓXIMOS PASOS

1. ✅ Implementar mp_webhook.cjs completo (archivo CORREGIDO proporcionado)
2. ✅ Implementar envia_webhook.cjs completo (archivo CORREGIDO proporcionado)
3. ✅ Crear base de datos para almacenar pedidos
4. ✅ Conectar pedidos con envíos
5. ✅ Crear página de rastreo para cliente
6. ✅ Configurar notificaciones por email al cliente

