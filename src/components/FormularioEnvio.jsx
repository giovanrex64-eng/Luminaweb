import React, { useState } from 'react';
import { useEnvios } from '../hooks/useEnvios';
import { PROVINCIAS_MAP, getProvinceCode, PROVINCIAS_LISTA } from '../utils/provinciasMap';
import { calculatePackageDimensions, detectClothingType } from '../utils/shippingStandards';
import { getCiudadesPorProvincia, getPostalCode } from '../utils/ciudadesArgentinas';

const FormularioEnvio = ({ onShippingChange, carrito = [] }) => {
  const {
    shippingOptions,
    selectedShipping,
    loadingShipping,
    shippingError,
    obtenerCotizacionEnvios,
    seleccionarEnvio
  } = useEnvios();

  const [formData, setFormData] = useState({
    destination: {
      country: 'AR',
      state: '',
      city: '',
      postal_code: '',
      address: ''
    }
  });

  const handleOriginChange = (field, value) => {
    // No hacer nada - origen es fijo
  };

  const handleDestinationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, [field]: value }
    }));
  };

  const handleProvinceChange = (value) => {
    // al cambiar provincia, limpiar ciudad/cp
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, state: value, city: '', postal_code: '' }
    }));
  };

  const handleCitySelect = (cityName) => {
    const prov = formData.destination.state;
    const postalCode = getPostalCode(prov, cityName);
    setFormData(prev => ({
      ...prev,
      destination: { 
        ...prev.destination, 
        city: cityName, 
        postal_code: postalCode || prev.destination.postal_code
      }
    }));
  };

  // Obtener ciudades para la provincia actual
  const ciudadesDisponibles = getCiudadesPorProvincia(formData.destination.state);

  const handleObtenerCotizacion = async () => {
    // Validar campos requeridos
    if (!formData.destination.state || !formData.destination.city || !formData.destination.postal_code) {
      alert('Por favor completa todos los campos de destino');
      return;
    }

    // Origen fijo: Maipú, Mendoza, 5511 (con código de provincia MZ)
    const origin = {
      country: 'AR',
      state: 'MZ',  // Código de provincia de 2 letras
      city: 'Maipú',
      postal_code: '5511',
      address: 'Calle Principal 100'
    };

    // Destino con código de provincia convertido
    const destinationWithCode = {
      ...formData.destination,
      state: getProvinceCode(formData.destination.state)  // Convertir nombre a código
    };

    // Calcular dimensiones del paquete basado en los items del carrito
    const cartItems = carrito.map(item => ({
      ...item,
      clothingType: detectClothingType(item.nombre)
    }));
    
    const { weight, dimensions } = calculatePackageDimensions(cartItems);
    
    const parcels = [{
      weight: weight,
      width: dimensions.width,
      height: dimensions.height,
      length: dimensions.length
    }];

    console.log('📦 Estándar de envío calculado:', { weight, dimensions });

    const options = await obtenerCotizacionEnvios(origin, destinationWithCode, parcels);

    // Si obtuvimos opciones, seleccionar la primera y notificar al padre
    if (options && options.length > 0) {
      seleccionarEnvio(options[0]);
      if (onShippingChange) onShippingChange(options[0]);
    }
  };

  const handleSelectShipping = (option) => {
    seleccionarEnvio(option);
    if (onShippingChange) {
      onShippingChange(option);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  };

  const [manualCost, setManualCost] = useState('');

  return (
    <div className="formulario-envio-card">
      <style>{`
        .formulario-envio-card {
          background-color: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }
        .destino-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .form-input-full {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .formulario-envio-card {
            padding: 1rem;
          }
          .destino-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>
        📦 Información de Envío
      </h3>

      {/* Origen Fijo */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '8px', border: '1px solid #bae6fd' }}>
        <p style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: '500', marginBottom: '0.5rem' }}>
          ✓ Enviamos desde:
        </p>
        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1e40af' }}>
          Maipú, Mendoza (CP 5511)
        </p>
      </div>

      {/* Destino */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600', color: '#374151' }}>
          Destino
        </h4>
        <div className="destino-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Provincia *
            </label>
            <select
              value={formData.destination.state}
              onChange={(e) => handleDestinationChange('state', e.target.value)}
              className="form-input-full"
            >
              <option value="">Seleccionar provincia...</option>
              {PROVINCIAS_LISTA.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Ciudad *
            </label>
            <select
              value={formData.destination.city}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="form-input-full"
            >
              <option value="">Seleccionar ciudad...</option>
              {ciudadesDisponibles.map((ciudad, i) => (
                <option key={i} value={ciudad.name}>
                  {ciudad.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Código Postal *
            </label>
            <input
              type="text"
              placeholder="Se completa automáticamente"
              value={formData.destination.postal_code}
              readOnly
              className="form-input-full"
              style={{
                backgroundColor: '#f3f4f6',
                cursor: 'not-allowed'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Calle y número
            </label>
            <input
              type="text"
              placeholder="Ej: San Martín 123"
              value={formData.destination.address}
              onChange={(e) => handleDestinationChange('address', e.target.value)}
              className="form-input-full"
            />
          </div>
        </div>
      </div>

      {/* Botón para obtener cotización */}
      <button
        onClick={handleObtenerCotizacion}
        disabled={loadingShipping}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          opacity: loadingShipping ? 0.7 : 1
        }}
      >
        {loadingShipping ? 'Obteniendo cotizaciones...' : 'Obtener Opciones de Envío'}
      </button>

      {/* Error */}
      {shippingError && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '4px',
          border: '1px solid #fecaca'
        }}>
          ⚠️ {shippingError}
        </div>
      )}

      {/* Opciones de envío */}
      {shippingOptions.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600', color: '#374151' }}>
            Selecciona una opción de envío:
          </h4>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {shippingOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelectShipping(option)}
                style={{
                  padding: '1rem',
                  backgroundColor: selectedShipping?.id === option.id ? '#dbeafe' : 'white',
                  border: selectedShipping?.id === option.id ? '2px solid var(--primary-color)' : '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {option.carrier} - {option.service}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Entrega: {option.days ? `${option.days} días` : option.eta || 'N/A'}
                  </p>
                </div>
                <p style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--primary-color)' }}>
                  {formatearPrecio(option.rate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: no opciones */}
      {!loadingShipping && !shippingError && shippingOptions.length === 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '6px', border: '1px dashed #e5e7eb', background: '#fff' }}>
          <p style={{ margin: 0, color: '#374151' }}>No se encontraron opciones de envío para los datos ingresados.</p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={handleObtenerCotizacion} style={{ padding: '0.5rem 0.75rem', background: '#0369a1', color: 'white', border: 'none', borderRadius: '4px' }}>Reintentar</button>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="number" placeholder="Costo de envío manual" value={manualCost} onChange={(e) => setManualCost(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              <button onClick={() => {
                const cost = Number(manualCost) || 0;
                const manualOption = { id: 'manual', carrier: 'Manual', service: 'Manual', rate: cost, currency: 'ARS', days: 'N/A' };
                handleSelectShipping(manualOption);
              }} style={{ padding: '0.5rem 0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '4px' }}>Aplicar costo manual</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioEnvio;
