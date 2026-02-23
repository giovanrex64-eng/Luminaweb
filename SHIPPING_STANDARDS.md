# 📦 Estándares de Envío - Lumina Web

## Resumen
Sistema automático de cálculo de dimensiones y peso de paquetes para prendas de ropa basado en estándares reales de mercadería.

## Tipos de Prendas Soportadas

### 1. **REMERA** (Remeras, Musculosas, T-shirts)
- **Peso**: 0.2 kg (200g)
- **Dimensiones**: 30cm × 20cm × 3cm
- Prendas livianas de algodón o sintético

### 2. **CAMISA** (Camisas, Blusas)
- **Peso**: 0.3 kg (300g)
- **Dimensiones**: 35cm × 25cm × 4cm
- Prendas con tela más gruesa que remeras

### 3. **BUZO** (Buzos, Sweatshirts, Hoodies)
- **Peso**: 0.5 kg (500g)
- **Dimensiones**: 40cm × 28cm × 6cm
- Prendas deportivas más abrigadas

### 4. **PANTALÓN** (Pantalones, Joggers, Leggings)
- **Peso**: 0.4 kg (400g)
- **Dimensiones**: 45cm × 25cm × 5cm
- Prendas de pierna completa

### 5. **CAMPERA** (Camperas, Jackets, Abrigos)
- **Peso**: 0.7 kg (700g)
- **Dimensiones**: 45cm × 30cm × 8cm
- Prendas exteriores con aislamiento

### 6. **ACCESORIO** (Gorras, Sombreros, Bandanas)
- **Peso**: 0.1 kg (100g)
- **Dimensiones**: 20cm × 20cm × 10cm
- Complementos y accesorios

## Cálculo de Paquete Multi-Ítem

Cuando el carrito contiene **múltiples prendas**:

- **Peso total**: Suma de todos los pesos individuales × cantidad
- **Largo máximo**: El máximo entre todos los largos de los ítems
- **Ancho máximo**: El máximo entre todos los anchos de los ítems
- **Alto acumulado**: Suma de todos los altos (grosor cuando se empacan)
  - Límite máximo: 25cm (restricción de algunos carriers)

### Ejemplo
```
Carrito:
- 2× Remera (0.2kg c/u) → 0.4kg
- 1× Buzo (0.5kg) → 0.5kg
- 1× Pantalón (0.4kg) → 0.4kg

Total = 1.3kg
Dimensiones = 45cm × 28cm × 17cm (suma de altos)
```

## Detección Automática

El sistema detecta automáticamente el tipo de prenda usando palabras clave en el nombre:

| Palabra Clave | Tipo Detectado |
|---------------|---|
| `remera`, `t-shirt`, `musculosa` | REMERA |
| `camisa`, `blusa`, `shirt` | CAMISA |
| `buzo`, `sweatshirt`, `hoodie` | BUZO |
| `pantalon`, `pants`, `jogger` | PANTALÓN |
| `campera`, `jacket`, `abrigo` | CAMPERA |
| `gorra`, `hat`, `cap` | ACCESORIO |
| *(por defecto)* | REMERA |

## Integración en el Código

### 1. **Importar utilidades**
```javascript
import { 
  calculatePackageDimensions, 
  detectClothingType 
} from '../utils/shippingStandards';
```

### 2. **Usar en componentes**
```javascript
const cartItems = carrito.map(item => ({
  ...item,
  clothingType: detectClothingType(item.nombre)
}));

const { weight, dimensions } = calculatePackageDimensions(cartItems);

console.log('Peso:', weight, 'kg');
console.log('Dimensiones:', dimensions);
// Resultado:
// Peso: 1.3 kg
// Dimensiones: { length: 45, width: 28, height: 17 }
```

### 3. **Componentes que usan este estándar**
- `src/components/FormularioEnvio.jsx` ✓
- `src/hooks/useEnvios.js` (preparado)
- `src/Carrito.jsx` ✓

## Carriers Soportados

Actualmente se consultan cotizaciones a 3 carriers principales en Argentina:
1. **OCA** - Cobertura nacional
2. **Andreani** - Cobertura nacional
3. **Correo Argentino** - Cobertura nacional

Cada carrier recibe el paquete con sus dimensiones y peso reales calculados automáticamente.

## Próximos Pasos

- [ ] Agregar soporte para cajas predeterminadas
- [ ] Implementar descuentos por volumen
- [ ] Integrar costo de empaque/embalaje
- [ ] Calcular automáticamente desde base de datos de productos
- [ ] Agregar más carriers (DHL, FedEx, etc.)

---

**Última actualización:** 2026-02-03  
**Versión:** 1.0
