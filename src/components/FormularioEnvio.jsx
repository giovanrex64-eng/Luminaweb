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

  return (
    <div className="formulario-envio-card">
      <style>{`
        .formulario-envio-card {
          background-color: #fff;
          padding: 2.5rem;
          border-radius: 16px;
          margin-bottom: 2.5rem;
          border: 1px solid #f3f4f6;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }
        .destino-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .form-input-full {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          box-sizing: border-box;
          background-color: #f9fafb;
          transition: all 0.2s;
        }
        .form-input-full:focus {
          background-color: #fff;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          outline: none;
        }
        @media (max-width: 768px) {
          .formulario-envio-card {
            padding: 1.5rem;
          }
          .destino-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
      `}</style>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: '700', color: '#111827' }}>
        📦 Información de Envío
      </h3>

      {/* Origen Fijo */}
      <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: '#f0f9ff', borderRadius: '12px', borderLeft: '5px solid #0ea5e9' }}>
        <p style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: '500', marginBottom: '0.5rem' }}>
          ✓ Enviamos desde:
        </p>
        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1e40af' }}>
          Maipú, Mendoza (CP 5511)
        </p>
      </div>

      {/* Destino */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: '600', color: '#374151' }}>
          Destino
        </h4>
        <div className="destino-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: '600', color: '#4b5563' }}>
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
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: '600', color: '#4b5563' }}>
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
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: '600', color: '#4b5563' }}>
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
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: '600', color: '#4b5563' }}>
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
          padding: '1rem',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: '600',
          opacity: loadingShipping ? 0.7 : 1,
          boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
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
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          ⚠️ {shippingError}
        </div>
      )}

      {/* Opciones de envío */}
      {shippingOptions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600', color: '#374151' }}>
            Selecciona una opción de envío:
          </h4>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {shippingOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelectShipping(option)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: selectedShipping?.id === option.id ? '#dbeafe' : 'white',
                  border: selectedShipping?.id === option.id ? '2px solid var(--primary-color)' : '1px solid #d1d5db',
                  borderRadius: '12px',
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
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '2px dashed #e5e7eb', 
          background: '#fff', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '1rem' }}>No se encontraron opciones de envío para los datos ingresados.</p>
          <button onClick={handleObtenerCotizacion} style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#0369a1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '1rem', 
            cursor: 'pointer',
            maxWidth: '100%'
          }}>
            Reintentar Búsqueda
          </button>
        </div>
      )}
    </div>
  );
};

export default FormularioEnvio;
