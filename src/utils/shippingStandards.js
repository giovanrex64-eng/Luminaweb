/**
 * Estándares de envío para prendas de ropa (remeras, buzos, pantalones, etc.)
 * Basado en dimensiones y peso promedio de prendas de ropa
 */

export const CLOTHING_TYPES = {
  // Prendas livianas (remeras, musculosas, camisas)
  REMERA: {
    type: 'remera',
    weight: 0.2,  // kg (200g)
    dimensions: {
      length: 30,   // cm (largo de remera)
      width: 20,    // cm (ancho de remera)
      height: 3,    // cm (grosor cuando está doblada)
    },
    name: 'Remera / Musculosa'
  },

  // Prendas medianas (camisas, buzos livianos)
  CAMISA: {
    type: 'camisa',
    weight: 0.3,  // kg (300g)
    dimensions: {
      length: 35,
      width: 25,
      height: 4,
    },
    name: 'Camisa / Blusa'
  },

  // Prendas pesadas (buzos, sweatshirts, camperas livianas)
  BUZO: {
    type: 'buzo',
    weight: 0.5,  // kg (500g)
    dimensions: {
      length: 40,
      width: 28,
      height: 6,
    },
    name: 'Buzo / Sweatshirt'
  },

  // Pantalones
  PANTALON: {
    type: 'pantalon',
    weight: 0.4,  // kg (400g)
    dimensions: {
      length: 45,
      width: 25,
      height: 5,
    },
    name: 'Pantalón / Jogger'
  },

  // Camperas/Jackets
  CAMPERA: {
    type: 'campera',
    weight: 0.7,  // kg (700g)
    dimensions: {
      length: 45,
      width: 30,
      height: 8,
    },
    name: 'Campera / Jacket'
  },

  // Accesorios (gorras, sombreros)
  ACCESORIO: {
    type: 'accesorio',
    weight: 0.1,  // kg (100g)
    dimensions: {
      length: 20,
      width: 20,
      height: 10,
    },
    name: 'Accesorio'
  }
};

/**
 * Estándar consolidado: cuando se envían múltiples prendas en un paquete
 * Se calcula dinámicamente según cantidad de items
 */
export const calculatePackageDimensions = (items = []) => {
  if (!items || items.length === 0) {
    // Por defecto: 1 remera
    return {
      weight: 0.2,
      dimensions: { length: 30, width: 20, height: 3 }
    };
  }

  // Sumar pesos
  let totalWeight = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;

  items.forEach(item => {
    const quantity = item.cantidad || item.quantity || 1;
    const type = item.clothingType || 'REMERA';
    const standard = CLOTHING_TYPES[type] || CLOTHING_TYPES.REMERA;

    totalWeight += standard.weight * quantity;
    maxLength = Math.max(maxLength, standard.dimensions.length);
    maxWidth = Math.max(maxWidth, standard.dimensions.width);
    totalHeight += standard.dimensions.height * quantity; // El height se suma (grosor al empacar)
  });

  // El height no debe superar 25cm (límite de algunos carriers)
  if (totalHeight > 25) {
    totalHeight = 25;
  }

  return {
    weight: Math.round(totalWeight * 100) / 100, // Redondear a 2 decimales
    dimensions: {
      length: maxLength,
      width: maxWidth,
      height: totalHeight
    }
  };
};

/**
 * Obtiene el tipo de prenda basado en el nombre del producto
 */
export const detectClothingType = (productName) => {
  const name = (productName || '').toLowerCase();

  if (name.includes('remera') || name.includes('t-shirt') || name.includes('musculosa')) return 'REMERA';
  if (name.includes('camisa') || name.includes('blusa') || name.includes('shirt')) return 'CAMISA';
  if (name.includes('buzo') || name.includes('sweatshirt') || name.includes('hoodie')) return 'BUZO';
  if (name.includes('pantalon') || name.includes('pants') || name.includes('jogger')) return 'PANTALON';
  if (name.includes('campera') || name.includes('jacket') || name.includes('abrigo')) return 'CAMPERA';
  if (name.includes('gorra') || name.includes('hat') || name.includes('cap')) return 'ACCESORIO';

  // Por defecto, asumir remera
  return 'REMERA';
};

/**
 * Ejemplo de uso en el carrito:
 * 
 * const cartItems = carrito.map(item => ({
 *   ...item,
 *   clothingType: detectClothingType(item.nombre)
 * }));
 * 
 * const { weight, dimensions } = calculatePackageDimensions(cartItems);
 * 
 * const parcels = [{
 *   weight: weight,
 *   length: dimensions.length,
 *   width: dimensions.width,
 *   height: dimensions.height
 * }];
 */

export default {
  CLOTHING_TYPES,
  calculatePackageDimensions,
  detectClothingType,
};
