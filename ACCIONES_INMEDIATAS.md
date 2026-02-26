# 🚀 ACCIONES INMEDIATAS - TODO HOY

## RESUMEN DE HALLAZGOS

Tu integración entre **Mercado Pago y Envia.com está INCOMPLETA**:

✅ **Funciona:**
- Los usuarios pueden cotizar envíos
- Los usuarios pueden pagar en Mercado Pago
- Los pagos se procesan exitosamente

❌ **NO funciona:**
- Los pickups NUNCA se crean en Envia.com
- No hay forma de rastrear el paquete
- El cliente no recibe confirmación
- El operador no sabe que se pagó

**Causa:** Los webhooks (mp_webhook.cjs y envia_webhook.cjs) están vacíos - solo reciben notificaciones pero no procesan nada.

---

## 🎯 QUE HACER HOY MISMO

### PASO 1: Implementar Webhooks Corregidos (15 minutos)

```bash
# En VS Code, abre la terminal en el root del proyecto
cd c:\Users\Equipo\Desktop\githublumina\Luminaweb

# Copia los archivos corregidos sobre los originales
# Archivo 1: Webhook de Mercado Pago
copy netlify\functions\mp_webhook_CORREGIDO.cjs netlify\functions\mp_webhook.cjs

# Archivo 2: Webhook de Envia.com  
copy netlify\functions\envia_webhook_CORREGIDO.cjs netlify\functions\envia_webhook.cjs

# Verifica que se copió
dir netlify\functions\
```

Si prefieres hacerlo manual:
1. Abre VS Code
2. Click derecho en `mp_webhook_CORREGIDO.cjs` → "Rename" o copia su contenido
3. Reemplaza el contenido de `mp_webhook.cjs`
4. Repite con `envia_webhook_CORREGIDO.cjs` → `envia_webhook.cjs`

### PASO 2: Agregar Variable de Entorno URL (5 minutos)

**En `.env` (desarrollo local):**
Abre el archivo `.env` y agrega al final:
```env
URL=http://localhost:8888
```

**En Netlify Dashboard (producción):**
1. Ve a: https://app.netlify.com
2. Selecciona tu sitio: "luminaweb" (o tu dominio)
3. Sitio → Settings → Build & deploy → Environment variables
4. Click en "Edit variables"
5. Agrega:
   - **Key:** `URL`
   - **Value:** `https://luminaweb.netlify.app` (tu dominio real)
6. Click en "Save"

### PASO 3: Registrar Webhooks (15 minutos)

#### En **Mercado Pago Dashboard:**
1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Settings (engranaje esquina superior) → Webhooks
3. Click en "Agregar evento"
4. Completa:
   - **URL Notificación:** `https://eloquent-puffpuff-c48359.netlify.app/.netlify/functions/mp_webhook`
   - **Eventos:** ✅ `payment.created`, `payment.updated`, `payment.approved`
5. Click "Guardar"
6. Mercado Pago enviará un test - debe aparecer en logs

#### En **Envia.com Dashboard:**
1. Ve a: https://app.envia.com
2. Busca Configuración → Webhooks (o similar)
3. Agrega:
   - **URL:** `https://eloquent-puffpuff-c48359.netlify.app/.netlify/functions/envia_webhook`
   - **Eventos:** Cambios de estado de envío
4. Guarda

### PASO 4: Probar Localmente (10 minutos)

```bash
# Terminal 1: Inicia servidor local
netlify dev

# Debería abrir http://localhost:8888 automáticamente
# Si no, ve a browser y abre http://localhost:8888

# Terminal 2 (en otra ventana): Prueba webhook de Mercado Pago
curl -X POST http://localhost:8888/.netlify/functions/mp_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": 999999999
    }
  }'

# Debería responder algo como:
# {
#   "success": true,
#   "message": "Webhook procesado correctamente",
#   "paymentId": 999999999,
#   "status": "unknown"
# }

# Y EN LA TERMINAL 1 deberías ver:
# 🔔 WEBHOOK DE MERCADO PAGO RECIBIDO
# 📦 Datos recibidos: {...}
```

---

## 📋 CHECKLIST DE HOY

```
[ ] 1. Copié mp_webhook_CORREGIDO.cjs → mp_webhook.cjs
[ ] 2. Copié envia_webhook_CORREGIDO.cjs → envia_webhook.cjs
[ ] 3. Agregué URL=http://localhost:8888 a .env
[ ] 4. Agregué URL a Netlify Dashboard
[ ] 5. Registré webhook en Mercado Pago
[ ] 6. Registré webhook en Envia.com
[ ] 7. Probé con curl (ve output en terminal)
[ ] 8. Hice git commit: "fix: implement payment and shipping webhooks"
[ ] 9. Pusheé a GitHub
```

---

## 🔍 QUE VERIFICAR DESPUÉS

### Verifica en Console de Netlify:
1. Ve a: https://app.netlify.com/sites/luminaweb/functions
2. Abre "Logs"
3. Deberías ver:
   - `🔔 WEBHOOK DE MERCADO PAGO RECIBIDO` (cuando alguien paga)
   - `🚚 WEBHOOK DE ENVIA.COM RECIBIDO` (cuando cambié estado envío)

### Verifica que el flujo funciona:
1. Haz un pedido de prueba (en Netlify dev: `http://localhost:8888`)
2. Selecciona envío
3. Paga (en sandbox si quieres evitar cargas reales)
4. Verifica que se imprima "WEBHOOK RECIBIDO" en logs

### Si ves el webhook pero no procesa:
- Revisa los logs para ver donde falla
- Puede ser que falten env vars
- O que la estructura del webhook sea distinta

---

## ⚠️ IMPORTANTE: INFORMACIÓN SENSIBLE

Tu `.env` tiene claves REALES de PRODUCCIÓN:
```
MP_ACCESS_TOKEN=APP_USR-2150812221573924-...
VITE_MP_PUBLIC_KEY=APP_USR-fcacda04-10ea-4afc-...
ENVIA_ACCESS_TOKEN=5d6e2422f271a3311a9f...
```

**CUIDADO:**
- ❌ No subas `.env` a GitHub
- ❌ Si ya lo hiciste: rota las claves INMEDIATAMENTE
- ✅ Usa `.env` en local y variables en Netlify para producción

Para GitHub:
```bash
git rm --cached .env
echo .env >> .gitignore
git add .gitignore
git commit -m "chore: remove .env from git"
```

---

## 📞 SI ALGO FALLA

### "No puedo probarlo con curl"
- Verifica que `netlify dev` esté corriendo
- Intenta sin curl: ve a http://localhost:8888/api... en browser y verás un error (normal)

### "No aparece el webhook en los logs"
- Espera 5-10 segundos después de hacer curl
- Verifica que la Terminal 1 (netlify dev) siga corriendo
- Prueba registrarse un cliente en Mercado Pago y hacer un pago de verdad

### "El webhook llega pero error 500"
- Abre los logs de Netlify y busca el error exacto
- Puede ser: credenciales faltantes, BD no configurada, etc
- Avísame con la captura del error

### "Mercado Pago dice que el webhook está en error"
- Verifica que `URL` esté configurado en env vars
- Verifica que no haya typos en la URL
- Espera 5 minutos para que se propague

---

## 🎯 LOS PRÓXIMOS PASOS (Después de hoy)

1. **Configurar Base de Datos** (semana 1)
   - Guardar pedidos cuando se paga
   - Vincular con envíos de Envia

2. **Conectar pago → envío** (semana 1-2)
   - Cuando pago aprobado → crear pickup en Envia

3. **Notificaciones por email** (semana 2)
   - El cliente recibe confirmación

4. **Página de rastreo** (semana 2-3)
   - El cliente puede ver estado del paquete

5. **Seguridad** (ongoing)
   - Verificar firmas de webhooks
   - Validar datos

---

## 📞 PREGUNTAS COMUNES

**P: ¿Esto va a chargar dinero real a las tarjetas?**
R: Solo si usas credenciales de PRODUCCIÓN. Cambia a SANDBOX si quieres probar sin cargar.

**P: ¿Dónde guardo los pedidos?**
R: Necesitas una BD. Opciones: Supabase (recomendada), Firebase, MongoDB, etc.

**P: ¿Qué pasa si Mercado Pago me envía un webhook dos veces?**
R: Por eso necesitas verificar firma y guardar en BD con ID único de pago.

**P: ¿Puedo hacer esto sin BD?**
R: No. Necesitas guardar: pedidos, envíos, estado de envíos. Una BD es obligatoria.

---

## 🚀 RESUMEN EN UNA LÍNEA

**Copia los webhooks corregidos, agrega la URL a env vars, registra en Mercado Pago y Envia, y está listo.**

¿Preguntas? Avisame si algo no funciona.

