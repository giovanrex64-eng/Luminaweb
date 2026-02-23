import { useState } from 'react';

export const useEnvios = () => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  const obtenerCotizacionEnvios = async (origin, destination, parcels) => {
    setLoadingShipping(true);
    setShippingError(null);
    
    try {
      console.log('Enviando request a /.netlify/functions/get_shipping_rates', { origin, destination, parcels });
      const response = await fetch('/.netlify/functions/get_shipping_rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          parcels
        })
      });

      console.log('Response status:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response text:', text);
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error('No se pudo parsear JSON de la respuesta:', err);
        throw new Error('Respuesta inválida del servidor de envíos');
      }

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      console.log('Data parsed from shipping API:', data);
      if (data && data.success && Array.isArray(data.options)) {
        setShippingOptions(data.options);
        // Seleccionar la primera opción por defecto
        if (data.options.length > 0) {
          setSelectedShipping(data.options[0]);
        }
      } else {
        // si la respuesta tiene estructura diferente, intentar mapear
        if (Array.isArray(data.rates)) {
          const mapped = data.rates.map(r => ({
            id: r.service || r.id || Math.random().toString(36).slice(2,9),
            carrier: r.carrier || r.name || 'Envia',
            service: r.service || r.name || 'Servicio',
            rate: Number(r.rate || r.price || 0),
            days: r.days,
            eta: r.eta,
            currency: r.currency
          }));
          setShippingOptions(mapped);
          if (mapped.length > 0) setSelectedShipping(mapped[0]);
          data.options = mapped;
        }
      }

      return data.options || [];
    } catch (error) {
      console.error('Error:', error);
      setShippingError(error.message);
      setShippingOptions([]);
      return [];
    } finally {
      setLoadingShipping(false);
    }
  };

  const seleccionarEnvio = (shippingOption) => {
    setSelectedShipping(shippingOption);
  };

  const obtenerCostoEnvio = () => {
    return selectedShipping?.rate || 0;
  };

  const limpiarEnvios = () => {
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingError(null);
  };

  const schedulePickup = async (pickupPayload) => {
    // pickupPayload should contain { origin, shipment }
    try {
      console.log('Llamando a /.netlify/functions/create_pickup', pickupPayload);
      const res = await fetch('/.netlify/functions/create_pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickupPayload)
      });

      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (err) { throw new Error('Respuesta inválida del servidor de pickup'); }

      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      return data;
    } catch (err) {
      console.error('Error al programar pickup:', err);
      throw err;
    }
  };

  return {
    shippingOptions,
    selectedShipping,
    loadingShipping,
    shippingError,
    obtenerCotizacionEnvios,
    seleccionarEnvio,
    obtenerCostoEnvio,
    limpiarEnvios,
    schedulePickup
  };
};
