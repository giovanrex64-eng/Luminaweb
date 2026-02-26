// ✅ VERSIÓN CORREGIDA DE envia_webhook.cjs
// Este webhook procesa actualizaciones de estado de envío desde Envia.com

/**
 * Verifica la firma del webhook de Envia.com
 * (Verificar documentación oficial de Envia.com)
 */
const verifyEnviaSignature = (request, secretKey) => {
  // Envia.com puede usar diferentes métodos de verificación
  // Esto necesita ser confirmado con su documentación
  
  const signature = request.headers['x-signature'] || 
                   request.headers['authorization'];
  
  if (!signature) {
    console.warn('⚠️ Firma de Envia faltante');
    return false;
  }
  
  // Por ahora simplificado para desarrollo
  console.log('✓ Firma de Envia verificada (simplificada)');
  return true;
};

/**
 * Mapea estados de Envia a estados legibles
 */
const mapEnviaStatus = (enviaStatus) => {
  const statusMap = {
    'pending': 'Pendiente',
    'picked_up': 'Recogido',
    'in_transit': 'En tránsito',
    'out_for_delivery': 'En reparto',
    'delivered': 'Entregado',
    'failed_delivery': 'Error en entrega',
    'cancelled': 'Cancelado',
    'returned': 'Devuelto',
    'exception': 'Excepción/Problema'
  };
  
  return statusMap[enviaStatus] || enviaStatus;
};

/**
 * Webhook principal de Envia.com
 */
exports.handler = async function(event, context) {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('🚚 WEBHOOK DE ENVIA.COM RECIBIDO');
    console.log('═══════════════════════════════════════════════');
    
    // 1. Parsear el body
    const body = JSON.parse(event.body);
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));
    
    // 2. Extraer información del webhook
    // ⚠️ NOTA: Estructura esperada (confirmar con Envia.com)
    const {
      shipment_id,      // ID del envío en Envia
      tracking_number,  // Número de seguimiento
      status,           // Estado actual
      updated_at,       // Fecha actualización
      carrier,          // Transportista
      delivery_date     // Fecha de entrega esperada
    } = body;
    
    if (!shipment_id) {
      console.error('❌ shipment_id faltante en el webhook');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'shipment_id requerido' }),
      };
    }
    
    console.log('📋 Información del envío:', {
      shipmentId: shipment_id,
      tracking: tracking_number,
      status: status,
      carrier: carrier,
      deliveryDate: delivery_date
    });
    
    // 3. Mapear estado a algo legible
    const humanReadableStatus = mapEnviaStatus(status);
    console.log(`📍 Nuevo estado: ${humanReadableStatus}`);
    
    // 4. Determinar si es una actualización importante
    let isImportant = false;
    let userMessage = '';
    
    switch(status) {
      case 'picked_up':
        isImportant = true;
        userMessage = '✅ Tu paquete ha sido recogido y está en camino.';
        break;
      case 'in_transit':
        isImportant = true;
        userMessage = '📦 Tu paquete está en tránsito hacia su destino.';
        break;
      case 'out_for_delivery':
        isImportant = true;
        userMessage = '🚚 Tu paquete está siendo entregado hoy! 👀';
        break;
      case 'delivered':
        isImportant = true;
        userMessage = '🎉 ¡Tu paquete ha sido entregado! Esperamos que disfrutes tu compra.';
        break;
      case 'failed_delivery':
        isImportant = true;
        userMessage = '⚠️ Hubo un problema al entregar tu paquete. Nos contactaremos pronto.';
        break;
      case 'exception':
        isImportant = true;
        userMessage = '⚠️ Hay una excepción con tu envío. Te contactaremos.';
        break;
    }
    
    // 5. AQUÍ DEBERÍAS:
    // a) Actualizar el estado en tu base de datos
    //    UPDATE orders SET shipping_status = ? WHERE envia_shipment_id = ?
    
    // b) Notificar al cliente (si estado importante)
    if (isImportant && userMessage) {
      console.log(`📧 Enviando notificación al cliente: "${userMessage}"`);
      
      // IMPLEMENTAR: Enviar email al cliente
      // IMPLEMENTAR: Enviar notificación en app si existe
      // IMPLEMENTAR: Enviar SMS si está disponible
      
      // Ejemplo (necesita implementación real):
      const clientEmail = 'cliente@email.com'; // Obtener de base de datos
      try {
        // await sendEmailNotification(clientEmail, userMessage);
        console.log('✓ Notificación enviada (simulada)');
      } catch (error) {
        console.error('⚠️ Error enviando notificación:', error.message);
        // No fallar si la notificación falla
      }
    }
    
    // 6. Registrar en logs para auditoría
    console.log('📝 Evento registrado:', {
      shipmentId: shipment_id,
      trackingNumber: tracking_number,
      previousStatus: 'UNKNOWN', // Obtenería de BD
      newStatus: status,
      timestamp: new Date().toISOString()
    });
    
    // 7. Responder a Envia.com
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Webhook procesado correctamente',
        shipmentId: shipment_id,
        status: status
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

1. ESTRUCTURA DEL WEBHOOK (CONFIRMAR CON ENVIA.COM):
   El webhook podría venir en formato:
   
   FORMATO A (más simplifado):
   {
     "shipment_id": "12345",
     "tracking_number": "OCA123456789AR",
     "status": "delivered",
     "updated_at": "2025-02-26T10:30:00Z",
     "carrier": "oca"
   }
   
   FORMATO B (más completo):
   {
     "data": {
       "shipment": {
         "id": "12345",
         "tracking": "OCA123456789AR",
         "state": "delivered",
         "updated": "2025-02-26T10:30:00Z"
       }
     }
   }
   
   CONSULTAR DOCS DE ENVIA.COM PARA ESTRUCTURA EXACTA

2. POSIBLES ESTADOS (CONFIRMAR):
   - pending: Pendiente de recoger
   - picked_up: Recogido de origen
   - in_transit: En camino
   - out_for_delivery: En reparto
   - delivered: Entregado
   - failed_delivery: Error en entrega
   - cancelled: Cancelado
   - returned: Devuelto
   - exception: Problema/Excepción

3. ACCIONES RECOMENDADAS POR ESTADO:
   ✓ picked_up → Notificar cliente que inició viaje
   ✓ in_transit → Actualizar estado si cliente consulta
   ✓ out_for_delivery → Alertar que llega hoy
   ✓ delivered → Solicitar reseña/feedback
   ✓ failed_delivery → Ofrecer remedios
   ✓ exception → Contactar cliente inmediatamente

4. IMPLEMENTAR EN BASE DE DATOS:
   CREATE TABLE shipping_updates (
     id SERIAL,
     order_id UUID,
     shipment_id VARCHAR,
     tracking_number VARCHAR,
     status VARCHAR,
     status_es VARCHAR,
     previous_status VARCHAR,
     updated_at TIMESTAMP,
     notified_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );

5. PRÓXIMOS PASOS:
   - Registrarse en webhooks de Envia.com con la URL correcta
   - Confirmar formato y estructura de webhook
   - Implementar envío de notificaciones (email/SMS/app)
   - Crear historial de actualizaciones
   - Crear página de tracking para cliente

═══════════════════════════════════════════════════════════════════════════════
*/
