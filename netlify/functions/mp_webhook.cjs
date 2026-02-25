const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // 1. Mercado Pago envía una notificación POST
  // Respondemos rápido con 200 OK para que MP sepa que recibimos el mensaje
  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'OK' };
  }

  const query = event.queryStringParameters;
  const topic = query.topic || query.type;
  const id = query.id || query['data.id'];

  // Solo nos interesan los avisos de pagos (payment)
  if (topic !== 'payment') {
    return { statusCode: 200, body: 'Ignored' };
  }

  try {
    console.log(`🔔 Notificación recibida. Topic: ${topic}, ID: ${id}`);

    // 2. Consultar a Mercado Pago el estado del pago
    // Usamos fetch directo para no depender de versiones específicas del SDK aquí
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });
    
    if (!mpResponse.ok) {
      throw new Error(`Error consultando MP: ${mpResponse.statusText}`);
    }

    const payment = await mpResponse.json();

    // 3. Si el pago está APROBADO, procedemos a crear la etiqueta
    if (payment.status === 'approved') {
      console.log('✅ Pago aprobado:', id);
      
      const metadata = payment.metadata;
      
      // Verificar si hay datos de envío guardados en la metadata (lo que guardamos en el paso anterior)
      if (metadata && metadata.shipping_carrier) {
        console.log('📦 Generando etiqueta de envío para:', metadata.dest_address);

        // 4. Preparar datos para Envia.com
        // Nota: Envia espera el código de provincia (ej: "MZ", "BA"). Asegúrate de que metadata.dest_state lo tenga.
        const shippingData = {
          origin: {
            name: "Lumina Web",
            company: "Lumina",
            email: "luminaweb.tuestilo@gmail.com",
            phone: "2612153060",
            street: "Calle Principal",
            number: "100",
            district: "",
            city: "Maipú",
            state: "MZ",
            country: "AR",
            postalCode: "5511"
          },
          destination: {
            name: metadata.dest_name || "Cliente",
            email: payment.payer.email || "email@cliente.com",
            phone: payment.payer.phone?.number || "",
            street: metadata.dest_address,
            number: "", // Si la calle tiene número, Envia suele parsearlo bien en 'street'
            district: "",
            city: metadata.dest_city,
            state: metadata.dest_state, // Debe ser código de 2 letras (ej: MZ, CB)
            country: "AR",
            postalCode: metadata.dest_zip
          },
          packages: [
            {
              content: "Indumentaria",
              amount: 1,
              type: "box",
              dimensions: { length: 30, width: 20, height: 10, weightUnit: 'kg', distanceUnit: 'cm' }, // Dimensiones estándar
              weight: 1,
              insurance: 0,
              declaredValue: payment.transaction_amount
            }
          ],
          shipment: {
            carrier: metadata.shipping_carrier.toLowerCase(), // ej: "oca"
            service: metadata.shipping_service.toLowerCase(), // ej: "estandar"
            type: 1
          }
        };

        // 5. Llamar a Envia.com para generar la guía
        const enviaResponse = await fetch('https://api.envia.com/ship/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ENVIA_API_KEY}`
          },
          body: JSON.stringify(shippingData)
        });

        const enviaResult = await enviaResponse.json();
        
        if (enviaResult.meta === 'generate') {
          console.log('🎉 Etiqueta creada con éxito! Tracking:', enviaResult.data[0].trackingNumber);
          // Aquí podrías guardar el tracking en una base de datos si tuvieras una
        } else {
          console.error('❌ Error creando etiqueta en Envia:', JSON.stringify(enviaResult));
          // No lanzamos error para que MP no reintente, pero queda en los logs
        }
      } else {
        console.log('ℹ️ El pago no tiene datos de envío asociados (probablemente retiro en tienda o digital).');
      }
    }

    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('Error procesando webhook:', error);
    // Respondemos 200 para que MP no siga enviando el mismo evento infinitamente, aunque falló nuestro proceso
    return { statusCode: 200, body: 'Error handled' };
  }
};
