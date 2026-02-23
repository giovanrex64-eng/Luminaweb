const handler = async (event, context) => {
  console.log("--- EJECUTANDO get_shipping_rates.cjs ---");

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ENVIA_ACCESS_TOKEN || process.env.ENVIA_API_KEY;
  
  if (!apiKey) {
    console.error("Error: ENVIA_ACCESS_TOKEN o ENVIA_API_KEY no está configurada");
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "API key de Envia no configurada. Verifica ENVIA_ACCESS_TOKEN en variables de entorno" }) 
    };
  }

  console.log('API Key obtenida:', apiKey.substring(0, 10) + '...');
  console.log('Headers que se enviarán:');
  console.log('Authorization: Bearer ' + apiKey.substring(0, 10) + '...');

  try {
    const body = JSON.parse(event.body);
    
    // Validar datos requeridos
    const { origin, destination, parcels } = body;
    
    if (!origin || !destination || !parcels) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: "Faltan campos requeridos: origin, destination, parcels" 
        })
      };
    }

    // Construir el payload según API de Envia (con shipment.carrier requerido)
    const payload = {
      origin: {
        name: 'Lumina Web',
        phone: '+54-261-XXX-XXXX',
        street: 'Calle Principal 100',
        city: origin.city || 'Maipú',
        state: origin.state || 'Mendoza',
        country: origin.country || 'AR',
        postalCode: origin.postal_code || '5511'
      },
      destination: {
        name: 'Cliente',
        phone: '+54-XXXXXXXXX',
        street: destination.address || 'Calle Destino 1',
        city: destination.city,
        state: destination.state,
        country: destination.country || 'AR',
        postalCode: destination.postal_code
      },
      packages: parcels.map((parcel, i) => ({
        type: 'box',
        content: 'Productos Lumina Web',
        amount: 1,
        declaredValue: 100,
        lengthUnit: 'CM',
        weightUnit: 'KG',
        weight: parcel.weight || 1,
        dimensions: {
          length: parcel.length || 10,
          width: parcel.width || 10,
          height: parcel.height || 10
        }
      })),
      shipment: {
        type: 1,
        carrier: 'oca'  // Usar OCA como carrier por defecto (disponible en Argentina)
      }
    };

    console.log('Solicitando cotización a Envia.com');
    console.log('URL: https://api.envia.com/ship/rate/');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const defaultHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'X-API-Token': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'LuminaWeb/1.0'
    };

    // Intentar con múltiples carriers
    const carriers = ['oca', 'andreani', 'correo_argentino'];
    let allOptions = [];

    for (const carrier of carriers) {
      const payloadWithCarrier = { ...payload, shipment: { type: 1, carrier } };
      console.log(`Intentando con carrier: ${carrier}`);

      const response = await fetch('https://api.envia.com/ship/rate/', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(payloadWithCarrier)
      });

      console.log(`Status para ${carrier}:`, response.status);
      const rawText = await response.text();
      console.log(`Respuesta para ${carrier}:`, rawText.substring(0, 200));
      
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (err) {
        console.error(`Parse error para ${carrier}:`, err);
        continue;
      }

      if (response.ok && data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log(`✓ Carrier ${carrier} devolvió opciones:`, data.data);
        allOptions = allOptions.concat(data.data);
      }
    }

    if (allOptions.length === 0) {
      console.warn('⚠ No se encontraron opciones de envío en ningún carrier');
      allOptions = [];
    }

    // Mapear todas las opciones recolectadas
    const mapped = (allOptions || []).map(option => ({
      id: option.service || option.id || Math.random().toString(36).slice(2,9),
      carrier: option.carrier || 'Envia',
      service: option.service || option.serviceDescription || 'Envío',
      rate: Number(option.totalPrice || option.rate || option.price || 0),
      currency: option.currency || 'ARS',
      days: option.deliveryEstimate || option.days || 'N/A',
      eta: option.deliveryDate?.date || option.eta
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, options: mapped })
    };
  } catch (error) {
    console.error('Error general:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error al procesar la solicitud',
        message: error.message 
      })
    };
  }
};

module.exports = { handler };
