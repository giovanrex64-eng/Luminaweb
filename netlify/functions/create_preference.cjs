const { MercadoPagoConfig, Preference } = require('mercadopago');

const handler = async (event, context) => {
  console.log("--- EJECUTANDO create_preference.cjs ---");

  // Solo permitimos peticiones POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Validación de seguridad: Verificar token antes de usarlo
  if (!process.env.MP_ACCESS_TOKEN) {
    console.error("Error crítico: La variable de entorno MP_ACCESS_TOKEN está vacía.");
    return { statusCode: 500, body: JSON.stringify({ error: "Falta configuración del servidor (MP_ACCESS_TOKEN)" }) };
  }

  // Configura el cliente con tu Access Token
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

  try {
    const body = JSON.parse(event.body);
    
    console.log('📝 Body recibido:', JSON.stringify(body, null, 2));
    
    // Log del usuario visitante
    console.log(`Compra realizada por visitante: ${body.visitorId}`);
    console.log('Costo de envío:', body.shippingCost);
    console.log('Detalles de envío:', {
      service: body.shippingService,
      carrier: body.shippingCarrier,
      days: body.shippingDays
    });

    const preference = new Preference(client);
    
    // Determinar si es un array de items (carrito) o un solo item
    let items = [];
    if (body.items && Array.isArray(body.items)) {
      // Si viene un array de items (carrito)
      items = body.items.map(item => ({
        title: item.title || 'Producto Lumina',
        description: item.title || 'Producto',
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity) || 1,
        currency_id: 'ARS',
      }));
    } else {
      // Si es un solo item (compra directa)
      items = [
        {
          title: body.title || 'Producto Lumina',
          description: body.title || 'Producto',
          unit_price: Number(body.unit_price),
          quantity: Number(body.quantity) || 1,
          currency_id: 'ARS',
        },
      ];
    }
    
    console.log('📦 Items recibidos en create_preference:', items);

    // Construir items finales para MercadoPago: 1) un ítem agregado "Productos" con subtotal, 2) un ítem "Envío" separado
    const currency = body.currency_id || 'ARS';

    // Separar cualquier ítem que parezca envío (para no contarlo dentro de productos)
    const productItems = items.filter(it => !(it.title && String(it.title).toLowerCase().includes('envío')));
    const shippingItems = items.filter(it => it.title && String(it.title).toLowerCase().includes('envío'));

    // Calcular subtotal de productos
    const productTotal = productItems.reduce((sum, it) => {
      const price = Number(it.unit_price || 0);
      const qty = Number(it.quantity || 1);
      return sum + price * qty;
    }, 0);

    const finalItems = [];
    // Agregar ítem agregado de productos (mostrar como una sola línea en MercadoPago)
    finalItems.push({
      title: `Productos (${productItems.length})`,
      description: 'Subtotal de productos',
      unit_price: Number(Number(productTotal).toFixed(2)),
      quantity: 1,
      currency_id: currency
    });

    // Determinar costo de envío: preferir body.shippingCost; si no, usar cualquier shipping item enviado
    const shippingCost = Number(body.shippingCost ?? (shippingItems[0] ? Number(shippingItems[0].unit_price || 0) : 0));
    const days = body.shippingDays ? body.shippingDays : 'N/A';
    const shippingTitle = `Envío ${body.shippingCarrier || 'Envia'} - ${body.shippingService || 'Estándar'} (${days})`;

    // Agregar ítem de envío separado
    finalItems.push({
      title: shippingTitle,
      description: `Envío a domicilio - ${body.shippingCarrier || 'Envia'}`,
      unit_price: Number(Number(shippingCost).toFixed(2)),
      quantity: 1,
      currency_id: currency,
      category_id: 'shipping'
    });

    console.log('📦 Items finales para MercadoPago (Productos + Envío):', finalItems);

    // Crea la preferencia de pago usando los items agregados (producto subtotal + envío)
    const result = await preference.create({
      body: {
        items: finalItems,
        back_urls: {
          success: "https://luminawebtuestilo.netlify.app/",
          failure: "https://luminawebtuestilo.netlify.app/",
          pending: "https://luminawebtuestilo.netlify.app/",
        },
        auto_return: "approved",
      }
    });

    // Devuelve el ID de la preferencia al frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.id }),
    };
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

module.exports = { handler };