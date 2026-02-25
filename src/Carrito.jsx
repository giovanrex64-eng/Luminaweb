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
  const [shippingDestination, setShippingDestination] = useState(null);
  const [showPickupUI, setShowPickupUI] = useState(false);

  React.useEffect(() => {
    // Inicializa Mercado Pago con tu Public Key
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
    
    // LOG DE DEPURACIÓN: Verificar modo en el Frontend
    const isTestKey = publicKey && publicKey.startsWith('TEST-');
    console.log(`🔑 FRONTEND MP: ${isTestKey ? '🟢 SANDBOX (PRUEBA)' : '🔴 PRODUCCIÓN (REAL)'}`);
    console.log('🔑 Public Key cargada:', publicKey);

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
          currency_id: 'ARS', // Importante: Especificar la moneda
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
          shippingDays: shippingSelected?.days || 'N/A',
          shippingDestination: shippingDestination // <--- Enviamos la dirección aquí
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

  const handleShippingChange = (shippingOption, destination) => {
    setCostoEnvio(shippingOption.rate || 0);
    setShippingSelected(shippingOption);
    setShippingDestination(destination);
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
        <style>{`
          .carrito-card {
            background-color: var(--card-bg);
            padding: 2rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
          }
          .carrito-table {
            width: 100%;
            border-collapse: collapse;
          }
          .carrito-table th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
          }
          .carrito-table td {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
          }
          
          /* Estilos Responsivos para Móvil */
          @media (max-width: 768px) {
            .carrito-card {
              padding: 1rem; /* Menos padding para ganar espacio */
            }
            .carrito-table thead {
              display: none; /* Ocultar encabezados de tabla */
            }
            .carrito-table, .carrito-table tbody, .carrito-table tr, .carrito-table td {
              display: block;
              width: 100%;
            }
            .carrito-table tr {
              margin-bottom: 1.5rem;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 0;
              box-shadow: 0 2px 5px rgba(0,0,0,0.05);
              overflow: hidden;
            }
            .carrito-table td {
              padding: 0.75rem 1rem;
              text-align: right;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #f3f4f6;
            }
            .carrito-table td::before {
              content: attr(data-label);
              font-weight: 600;
              color: #6b7280;
              text-align: left;
            }
            /* Estilo especial para la celda del nombre del producto */
            .carrito-table td:first-child {
              background-color: #f9fafb;
              flex-direction: column;
              align-items: flex-start;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            .carrito-table td:first-child::before {
              display: none;
            }
          }
        `}</style>
        <div className="carrito-card">
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
                  <table className="carrito-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th style={{ textAlign: 'center' }}>Precio</th>
                        <th style={{ textAlign: 'center' }}>Cantidad</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
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
                          <tr key={item.id}>
                            <td data-label="Producto">
                              <div>
                                <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#111827' }}>{item.nombre}</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.descripcion}</p>
                              </div>
                            </td>
                            <td data-label="Precio" style={{ textAlign: 'center' }}>
                              {formatearPrecio(precioUnitario)}
                            </td>
                            <td data-label="Cantidad" style={{ textAlign: 'center' }}>
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
                            <td data-label="Subtotal" style={{ textAlign: 'right', fontWeight: '600', color: '#4f46e5' }}>
                              {formatearPrecio(subtotal)}
                            </td>
                            <td data-label="Acciones" style={{ textAlign: 'center' }}>
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
