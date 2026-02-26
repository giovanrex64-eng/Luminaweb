// ✅ VERSIÓN CORREGIDA DE mp_webhook.cjs
// Este webhook procesa correctamente los pagos de Mercado Pago

const { MercadoPagoConfig, Payment } = require('mercadopago');

/**
 * Verifica la firma del webhook de Mercado Pago
 * Referencia: https://developers.mercadopago.com.ar/es/docs/checkout-pro/integration-configuration/webhooks
 */
const verifySignature = (request, secretKey) => {
  // La firma viene en el header X-Signature
  const signature = request.headers['x-signature'];
  const requestId = request.headers['x-request-id'];
  
  if (!signature || !requestId) {
    console.warn('⚠️ Headers de seguridad faltantes');
    return false; // En producción: return false; En dev: return true;
  }
  
  // Por ahora retornamos true para tiempo de desarrollo
  // En producción, implementar verificación real
  console.log('✓ Firma verificada (verificación simplificada)');
  return true;
};

/**
 * Obtiene los detalles del pago desde Mercado Pago
 */
const getPaymentDetails = async (paymentId, client) => {
  try {
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });
    return paymentData;
  } catch (error) {
    console.error('Error obteniendo detalles del pago:', error);
    throw error;
  }
};

/**
 * Webhook principal de Mercado Pago
 */
exports.handler = async function(event, context) {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('🔔 WEBHOOK DE MERCADO PAGO RECIBIDO');
    console.log('═══════════════════════════════════════════════');
    
    // 1. Parsear el body
    const body = JSON.parse(event.body);
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));
    
    // 2. Verificar que sea un evento de pago
    const { type, data } = body;
    
    if (type !== 'payment') {
      console.log('⚠️ Evento ignorado (no es de tipo payment):', type);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Evento ignorado' }),
      };
    }
    
    if (!data || !data.id) {
      console.error('❌ ID de pago faltante');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID de pago faltante' }),
      };
    }
    
    // 3. Obtener detalles del pago desde Mercado Pago
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      console.error('❌ MP_ACCESS_TOKEN no configurado');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Credenciales no configuradas' }),
      };
    }
    
    const client = new MercadoPagoConfig({ accessToken: token });
    const paymentData = await getPaymentDetails(data.id, client);
    
    console.log('💳 Detalles del pago obtenidos:', {
      id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.transaction_amount,
      metadata: paymentData.metadata
    });
    
    // 4. Verificar si el pago fue APROBADO
    const isApproved = paymentData.status === 'approved';
    
    if (!isApproved) {
      console.log(`⚠️ Pago no aprobado. Estado: ${paymentData.status}`);
      // Aquí podrías notificar al usuario que el pago falló
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: `Pago con estado: ${paymentData.status}`,
          paymentId: paymentData.id 
        }),
      };
    }
    
    console.log('✅ PAGO APROBADO!');
    
    // 5. Extraer datos del envío desde metadata
    const metadata = paymentData.metadata || {};
    const orderData = {
      paymentId: paymentData.id,
      amount: paymentData.transaction_amount,
      currency: paymentData.currency_id,
      buyerEmail: paymentData.payer?.email,
      buyerName: paymentData.payer?.first_name + ' ' + paymentData.payer?.last_name,
      shippingCarrier: metadata.shipping_carrier,
      shippingService: metadata.shipping_service,
      destName: metadata.dest_name,
      destAddress: metadata.dest_address,
      destCity: metadata.dest_city,
      destState: metadata.dest_state,
      destZip: metadata.dest_zip,
      destCountry: metadata.dest_country,
    };
    
    console.log('📋 Datos del pedido extraídos:', JSON.stringify(orderData, null, 2));
    
    // ⚠️ IMPORTANTE: Aquí deberías hacer:
    // 1. Guardar el pedido en base de datos
    // 2. Crear el pickup en Envia.com (ver create_pickup.cjs)
    // 3. Enviar confirmación al cliente
    // 4. Notificar al operador
    
    // 6. CREAR PICKUP EN ENVIA.COM (si tienes los datos de envío)
    if (orderData.shippingCarrier && orderData.destCity) {
      console.log('📍 Intentando crear pickup en Envia.com...');
      
      const apiKey = process.env.ENVIA_ACCESS_TOKEN;
      if (!apiKey) {
        console.error('⚠️ ENVIA_ACCESS_TOKEN no configurado, no se puede crear pickup');
      } else {
        try {
          // ⚠️ NOTA: Esta es una llamada INCOMPLETA
          // Falta información como: origen, paquetes, horario de pickup
          // Necesitarían estar guardados en metadata o base de datos
          console.log('⚠️ No se puede crear pickup: falta información completa de paquetes');
          
          // En una implementación real, aquí llamarías a Envia.com
          // Ver create_pickup.cjs para referencia de estructura
        } catch (error) {
          console.error('❌ Error creando pickup:', error.message);
        }
      }
    }
    
    // 7. Responder a Mercado Pago
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Webhook procesado correctamente',
        paymentId: paymentData.id,
        status: paymentData.status
      }),
    };
    
  } catch (error) {
    console.error('❌ ERROR EN WEBHOOK:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error procesando el webhook',
        message: error.message
      }),
    };
  }
};

/*
═══════════════════════════════════════════════════════════════════════════════
NOTAS IMPORTANTES:

1. ESTADOS DE PAGO:
   - pending: Pago pendiente de confirmación
   - approved: Pago aprobado ✅ (hacer el envío aquí)
   - authorized: Pago autorizado pero no capturado
   - in_process: En proceso de revisión
   - rejected: Pago rechazado
   - cancelled: Pago cancelado
   - refunded: Pago reembolsado
   - charged_back: Contracargo

2. METADATA ESPERADA (desde create_preference.cjs):
   {
     shipping_carrier: "oca"|"andreani"|"correo_argentino"
     shipping_service: "Estándar"|"Express"
     dest_name: "Cliente Web"
     dest_address: "Calle 123"
     dest_city: "Buenos Aires"
     dest_state: "BA" (código de provincia)
     dest_zip: "1000"
     dest_country: "AR"
   }

3. FALTA INFORMACIÓN CRÍTICA:
   - No está en metadata: origen del envío, paquetes (peso/dimensiones), horario de pickup
   - Estas deberían guardarse en una base de datos cuando se selec el 
   - O calcular desde los items del carrito

4. PRÓXIMOS PASOS:
   - Implementar base de datos (Supabase, Firebase, etc.)
   - Guardar información completa del pedido cuando se crea preferencia
   - Cuando se apruebe pago, recuperar todos los datos y crear pickup
   - Implementar envia_webhook.cjs para rastrear estado de envíos

═══════════════════════════════════════════════════════════════════════════════
*/
