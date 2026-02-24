const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Configuración para Mercado Pago versión 2.x
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    const data = JSON.parse(event.body);
    const { items, shippingCost, shippingDestination, shippingCarrier, shippingService } = data;

    // URL donde Mercado Pago avisará al Robot (Webhook)
    // IMPORTANTE: Cuando subas esto a internet, cambia esto por tu URL real de Netlify
    const notificationUrl = process.env.URL 
      ? `${process.env.URL}/.netlify/functions/mp_webhook`
      : 'https://tu-sitio-temporal.netlify.app/.netlify/functions/mp_webhook';

    const preferenceData = {
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

    const response = await preference.create({ body: preferenceData });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: response.id }),
    };
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor: ' + error.message }),
    };
  }
};
