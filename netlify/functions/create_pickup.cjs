const handler = async (event, context) => {
  console.log('--- EJECUTANDO create_pickup.cjs ---');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ENVIA_ACCESS_TOKEN || process.env.ENVIA_API_KEY;
  if (!apiKey) {
    console.error('Error: ENVIA_ACCESS_TOKEN o ENVIA_API_KEY no está configurada');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key de Envia no configurada. Verifica ENVIA_ACCESS_TOKEN en variables de entorno' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // Validaciones mínimas y normalización
    const { origin, shipment } = body;
    if (!origin || !shipment) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Faltan campos requeridos: origin, shipment' })
      };
    }

    // Normalizar pickup: Envia requiere propiedades como timeFrom/timeTo, totalPackages, totalWeight, weightUnit
    const pickup = shipment.pickup || {};
    const normalizedPickup = {
      date: pickup.date || pickup.day || null,
      // Some carriers expect numeric timeFrom/timeTo as integers (e.g., 900 for 09:00)
      timeFrom: (() => {
        const v = pickup.timeFrom || pickup.startTime || pickup.time_from || null;
        if (!v) return null;
        // If string like "09:00", convert to number 900
        if (typeof v === 'string' && v.match(/^\d{1,2}:?\d{2}$/)) {
          return Number(v.replace(':', ''));
        }
        return Number(v);
      })(),
      timeTo: (() => {
        const v = pickup.timeTo || pickup.endTime || pickup.time_to || null;
        if (!v) return null;
        if (typeof v === 'string' && v.match(/^\d{1,2}:?\d{2}$/)) {
          return Number(v.replace(':', ''));
        }
        return Number(v);
      })(),
      totalPackages: pickup.totalPackages || pickup.total_packages || pickup.packages || 0,
      totalWeight: pickup.totalWeight || pickup.total_weight || pickup.weight || 0,
      weightUnit: pickup.weightUnit || pickup.weight_unit || 'KG'
    };

    // Validar después de normalizar
    const missing = [];
    if (!normalizedPickup.date) missing.push('pickup.date');
    if (!normalizedPickup.timeFrom) missing.push('pickup.timeFrom');
    if (!normalizedPickup.timeTo) missing.push('pickup.timeTo');
    if (!normalizedPickup.totalPackages || normalizedPickup.totalPackages <= 0) missing.push('pickup.totalPackages');
    if (!normalizedPickup.totalWeight || normalizedPickup.totalWeight <= 0) missing.push('pickup.totalWeight');

    if (missing.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Faltan campos requeridos en pickup', missing })
      };
    }

    // Reconstruir el shipment con pickup normalizado
    const shipmentPayload = { ...shipment, pickup: normalizedPickup };
    const payload = { origin, shipment: shipmentPayload };

    console.log('Payload normalizado para pickup:', JSON.stringify(payload, null, 2));

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'X-API-Token': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'LuminaWeb/1.0'
    };

    const response = await fetch('https://api.envia.com/ship/pickup/', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.error('No se pudo parsear JSON de Envia:', err);
      return { statusCode: response.status || 500, body: JSON.stringify({ error: 'Respuesta inválida de Envia', raw: text }) };
    }

    if (!response.ok) {
      console.error('Error desde Envia:', data);
      return { statusCode: response.status || 502, body: JSON.stringify({ error: 'Envia API error', details: data }) };
    }

    console.log('Pickup programado:', data);
    return { statusCode: 200, body: JSON.stringify({ success: true, data }) };
  } catch (error) {
    console.error('Error general create_pickup:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

module.exports = { handler };
