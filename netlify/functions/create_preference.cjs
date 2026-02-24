const mercadopago = require('mercadopago');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Configura tu Access Token de Mercado Pago
  // NOTA: Si acabas de instalar la librería y te da error "mercadopago.configure is not a function",
  // es porque tienes la versión 2.x. Este código es para la versión 1.x.
  mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
  });

  try {
    const data = JSON.parse(event.body);
    const { items, shippingCost, shippingDestination, shippingCarrier, shippingService } = data;

    // URL donde Mercado Pago avisará al Robot (Webhook)
    // IMPORTANTE: Cuando subas esto a internet, cambia esto por tu URL real de Netlify
    const notificationUrl = process.env.URL 
      ? `${process.env.URL}/.netlify/functions/mp_webhook`
      : 'https://tu-sitio-temporal.netlify.app/.netlify/functions/mp_webhook';

    const preference = {
      items: items,
      // Guardamos los datos de envío en metadata para que el Robot los lea después
      metadata: {
        shipping_carrier: shippingCarrier,
        shipping_service: shippingService,
        // Aplanamos la dirección porque metadata no soporta objetos anidados profundos a veces
        dest_name: "Cliente Web", 
        dest_address: shippingDestination?.address || '',
        dest_city: shippingDestination?.city || '',
        dest_state: shippingDestination?.state || '',
        dest_zip: shippingDestination?.postal_code || '',
        dest_country: 'AR'
      },
      notification_url: notificationUrl, 
      back_urls: {
        success: process.env.URL ? `${process.env.URL}/#exito` : "http://localhost:5173/#exito",
        failure: process.env.URL ? `${process.env.URL}/#fallo` : "http://localhost:5173/#fallo",
        pending: process.env.URL ? `${process.env.URL}/#pendiente` : "http://localhost:5173/#pendiente",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      body: JSON.stringify({ id: response.body.id }),
    };
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};
