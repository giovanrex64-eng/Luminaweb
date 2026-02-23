import React, { useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import AnimatedSection from './AnimatedSection';
import { useCarrito } from './context/CarritoContext';
import FormularioEnvio from './components/FormularioEnvio';
import PickupSchedule from './components/PickupSchedule';

function Carrito() {
  const { carrito, removerDelCarrito, actualizarCantidad, vaciarCarrito, obtenerTotal, obtenerCantidadItems } = useCarrito();
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [shippingSelected, setShippingSelected] = useState(null);
  const [showPickupUI, setShowPickupUI] = useState(false);

  React.useEffect(() => {
    // Inicializa Mercado Pago con tu Public Key
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, {
        locale: 'es-AR',
      });
    }
  }, []);

  const formatearPrecio = (precio) => {
    if (typeof precio === 'string') {
      return precio;
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  };

  const handleComprarCarrito = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (costoEnvio === 0 && !shippingSelected) {
      alert('Por favor selecciona una opción de envío');
      return;
    }

    setIsLoadingCheckout(true);
    try {
      // Crear preferencia con todos los items del carrito
      const items = carrito.map(item => {
        let precio = item.precio;
        if (typeof precio === 'string') {
          precio = Number(precio.replace(/[^0-9]/g, ''));
        }
        return {
          title: item.nombre,
          unit_price: precio,
          quantity: item.cantidad,
        };
      });

      const visitorId = localStorage.getItem('visitorId');

      console.log('📦 Enviando a crear preferencia:', {
        items,
        costoEnvio,
        shippingSelected
      });

      // Agregar envío como item en el frontend para asegurar que MercadoPago lo muestre
      const itemsWithShipping = [...items];
      const shippingTitle = `Envío ${shippingSelected?.carrier || 'Envia'} - ${shippingSelected?.service || 'Estándar'} (${shippingSelected?.days || 'N/A'})`;
      const hasShipping = itemsWithShipping.some(i => i.title && String(i.title).toLowerCase().includes('envío'));
      if (!hasShipping) {
        itemsWithShipping.push({
          title: shippingTitle,
          description: `Envío - ${shippingSelected?.carrier || 'Envia'}`,
          unit_price: Number(Number(costoEnvio || 0).toFixed(2)),
          quantity: 1,
          currency_id: 'ARS'
        });
      }

      const response = await fetch('/.netlify/functions/create_preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsWithShipping,
          visitorId: visitorId,
          shippingCost: costoEnvio,
          shippingService: shippingSelected?.service || 'Estándar',
          shippingCarrier: shippingSelected?.carrier || 'Envia',
          shippingDays: shippingSelected?.days || 'N/A'
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del servidor:', response.status, errorData);
        alert(`Error al conectar con el servidor: ${response.status}`);
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      }
    } catch (error) {
      console.error('Error al crear preferencia:', error);
      alert('Error al procesar el carrito');
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  const handleShippingChange = (shippingOption) => {
    setCostoEnvio(shippingOption.rate || 0);
    setShippingSelected(shippingOption);
  };

  const totalConEnvio = obtenerTotal() + costoEnvio;

  if (preferenceId) {
    return (
      <AnimatedSection>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '2rem' }}>Completa tu pago</h2>
          <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{
          backgroundColor: 'var(--card-bg)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛒</span> Carrito de Compras
          </h2>

          {carrito.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Tu carrito está vacío
              </p>
              <a
                href="/#catalogo"
                className="button"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Ir al Catálogo
              </a>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Producto</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Precio</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Cantidad</th>
                        <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Subtotal</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item) => {
                        let precioUnitario = item.precio;
                        if (typeof precioUnitario === 'string') {
                          precioUnitario = Number(precioUnitario.replace(/[^0-9]/g, ''));
                        }
                        const subtotal = precioUnitario * item.cantidad;

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '1rem' }}>
                              <div>
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.nombre}</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.descripcion}</p>
                              </div>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              {formatearPrecio(precioUnitario)}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value))}
                                style={{
                                  width: '60px',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  textAlign: 'center'
                                }}
                              />
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>
                              {formatearPrecio(subtotal)}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <button
                                onClick={() => removerDelCarrito(item.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '1.25rem',
                                  padding: '0.5rem'
                                }}
                                title="Remover del carrito"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formulario de envío */}
              <FormularioEnvio onShippingChange={handleShippingChange} carrito={carrito} />

              {/* Resumen */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
                textAlign: 'right',
                border: costoEnvio === 0 ? '2px solid #fca5a5' : '1px solid #e5e7eb'
              }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#6b7280' }}>
                  Total de items: <span style={{ fontWeight: '600', color: '#111827' }}>{obtenerCantidadItems()}</span>
                </p>
                <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#6b7280' }}>
                  Subtotal: <span style={{ fontWeight: '600', color: '#111827' }}>{formatearPrecio(obtenerTotal())}</span>
                </p>
                {costoEnvio > 0 ? (
                  <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#6b7280' }}>
                    ✓ Envío ({shippingSelected?.service || 'Estándar'}): <span style={{ fontWeight: '600', color: '#111827' }}>{formatearPrecio(costoEnvio)}</span>
                  </p>
                ) : (
                  <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#dc2626', fontWeight: '600' }}>
                    ⚠️ Selecciona una opción de envío
                  </p>
                )}
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', paddingTop: '0.5rem', borderTop: '2px solid #e5e7eb' }}>
                  Total: {formatearPrecio(totalConEnvio)}
                </p>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowPickupUI(s => !s)}
                  className="button button-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {showPickupUI ? 'Ocultar Pickup' : 'Programar Pickup'}
                </button>
                <button
                  onClick={vaciarCarrito}
                  className="button button-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Vaciar Carrito
                </button>
                <button
                  onClick={handleComprarCarrito}
                  disabled={isLoadingCheckout || costoEnvio === 0}
                  className="button"
                  style={{ 
                    padding: '0.75rem 1.5rem',
                    opacity: (isLoadingCheckout || costoEnvio === 0) ? 0.5 : 1,
                    cursor: (isLoadingCheckout || costoEnvio === 0) ? 'not-allowed' : 'pointer'
                  }}
                  title={costoEnvio === 0 ? 'Debes seleccionar un envío primero' : ''}
                >
                  {isLoadingCheckout ? 'Procesando...' : costoEnvio === 0 ? 'Selecciona envío primero' : 'Proceder al pago'}
                </button>
              </div>
              {showPickupUI && (
                <div style={{ marginTop: '1rem' }}>
                  <PickupSchedule defaultCarrier={shippingSelected?.carrier || 'oca'} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}

export default Carrito;
