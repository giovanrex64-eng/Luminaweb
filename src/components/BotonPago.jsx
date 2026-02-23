import { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';

const BotonPago = ({ producto }) => {
  const [productoAgregado, setProductoAgregado] = useState(false);
  const { agregarAlCarrito } = useCarrito();

  const handleAgregarAlCarrito = () => {
    console.log('Agregando producto:', producto);
    agregarAlCarrito(producto, 1);
    setProductoAgregado(true);
    setTimeout(() => setProductoAgregado(false), 2000);
  };

  return (
    <button
      onClick={handleAgregarAlCarrito}
      className="button"
      style={{ 
        width: '100%',
        backgroundColor: productoAgregado ? '#10b981' : 'var(--primary-color)',
        transition: 'background-color 0.3s ease'
      }}
    >
      {productoAgregado ? '✓ Agregado al carrito' : 'Agregar al carrito'}
    </button>
  );
};

export default BotonPago;