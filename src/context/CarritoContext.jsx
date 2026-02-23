import React, { createContext, useState, useEffect } from 'react';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [visitorId, setVisitorId] = useState(null);

  // Inicializar visitorId y carrito
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      let vid = localStorage.getItem('visitorId');
      if (!vid) {
        vid = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitorId', vid);
      }
      setVisitorId(vid);

      // Cargar carrito
      const carritoGuardado = localStorage.getItem(`carrito_${vid}`);
      if (carritoGuardado) {
        try {
          setCarrito(JSON.parse(carritoGuardado));
        } catch (error) {
          console.error('Error al cargar carrito:', error);
        }
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (visitorId && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`carrito_${visitorId}`, JSON.stringify(carrito));
    }
  }, [carrito, visitorId]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prevCarrito) => {
      const productoExistente = prevCarrito.find((item) => item.id === producto.id);

      if (productoExistente) {
        return prevCarrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }

      return [...prevCarrito, { ...producto, cantidad }];
    });
  };

  const removerDelCarrito = (productoId) => {
    setCarrito((prevCarrito) =>
      prevCarrito.filter((item) => item.id !== productoId)
    );
  };

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removerDelCarrito(productoId);
    } else {
      setCarrito((prevCarrito) =>
        prevCarrito.map((item) =>
          item.id === productoId ? { ...item, cantidad } : item
        )
      );
    }
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const obtenerTotal = () => {
    return carrito.reduce((total, item) => {
      let precio = item.precio;
      if (typeof precio === 'string') {
        precio = Number(precio.replace(/[^0-9]/g, ''));
      }
      return total + precio * item.cantidad;
    }, 0);
  };

  const obtenerCantidadItems = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const value = {
    carrito,
    visitorId,
    agregarAlCarrito,
    removerDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    obtenerTotal,
    obtenerCantidadItems,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = React.useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return context;
};
