# Configuración de Envíos con Envia.com (Argentina)

## Variables de Ambiente Requeridas

Para que el sistema de envíos funcione correctamente, necesitas agregar la siguiente variable de ambiente a tu archivo `.env` o en las variables de Netlify:

```
ENVIA_API_KEY=tu_api_key_aqui
```

### Cómo obtener tu API Key de Envia.com

1. Ve a [https://www.envia.com](https://www.envia.com)
2. Crea una cuenta o inicia sesión
3. Ve a tu panel de control
4. Busca la sección de "API Keys" o "Configuración"
5. Genera una nueva API Key
6. Copia la API Key y agrégala a tus variables de ambiente

## Configuración en Netlify

Si estás usando Netlify:

1. Ve a tu sitio en Netlify
2. Sitio → Configuración → Variables de entorno
3. Agrega la variable `ENVIA_API_KEY` con tu API Key

### Pruebas y desarrollo local con Netlify CLI

Si quieres probar las funciones serverless localmente con tus variables de entorno:

1. Instala Netlify CLI globalmente (si no lo tienes):

```bash
npm install -g netlify-cli
```

2. Asegúrate de tener un archivo `.env` en la raíz del proyecto con `ENVIA_ACCESS_TOKEN` o `ENVIA_API_KEY` (ya hay un ejemplo en el repo).

3. Ejecuta las funciones y el frontend localmente:

```bash
netlify dev
```

Esto levantará el sitio y los endpoints de funciones en `/.netlify/functions/*`. Las funciones usarán las variables del `.env` durante el desarrollo local.

### Variables de entorno en Netlify (Producción)

En Netlify Dashboard (Site → Settings → Build & deploy → Environment):

- Añade `ENVIA_API_KEY` con tu API Key.
- Opcionalmente añade `ENVIA_ACCESS_TOKEN` si prefieres esa variable.

Después de agregar la variable en Netlify, redeploy para que las funciones tengan acceso a la API key.

## Funcionalidad Implementada

### Endpoint: `/.netlify/functions/get_shipping_rates`

Obtiene cotizaciones de envío desde Envia.com basado en:
- **Origen**: Argentina, Maipú, Mendoza, CP 5511 (FIJO)
- **Destino**: Argentina, provincia, ciudad, código postal  
- **Paquetes**: Peso, dimensiones (ancho, alto, largo)

### Provincias Soportadas

- Buenos Aires
- CABA (Ciudad de Buenos Aires)
- Córdoba
- Santa Fe
- Mendoza
- Tucumán
- Salta
- La Pampa
- Misiones
- Chaco
- Entre Ríos
- Santiago del Estero
- Corrientes
- Jujuy
- Formosa
- Catamarca
- La Rioja
- San Juan
- San Luis
- Neuquén
- Río Negro
- Chubut
- Santa Cruz
- Tierra del Fuego

### Componente: `FormularioEnvio`

Interfaz visual para:
1. Mostrar punto de origen fijo (Maipú, Mendoza)
2. Seleccionar provincia de destino
3. Ingresar ciudad y código postal de destino
4. Ver opciones de envío disponibles
5. Seleccionar la opción de envío preferida
6. Ver el costo total con envío incluido (en ARS)

## Ejemplo de Uso

En el carrito, el usuario puede:
1. Ver sus productos
2. Completar la información de envío (provincia y ciudad de destino)
3. Hacer clic en "Obtener Opciones de Envío"
4. Seleccionar la opción que prefiera
5. El total se actualiza automáticamente con el costo del envío en pesos argentinos
6. Proceder al pago

## Estructura de Datos

### Request a get_shipping_rates:
```json
{
  "origin": {
    "country": "AR",
    "state": "Mendoza",
    "city": "Maipú",
    "postal_code": "5511",
    "address": ""
  },
  "destination": {
    "country": "AR",
    "state": "Córdoba",
    "city": "Córdoba",
    "postal_code": "5000",
    "address": ""
  },
  "parcels": [
    {
      "weight": 1,
      "width": 10,
      "height": 10,
      "length": 10
    }
  ]
}
```

### Response esperado:
```json
{
  "success": true,
  "options": [
    {
      "id": "oca_express",
      "carrier": "OCA",
      "service": "Express",
      "rate": 450.50,
      "currency": "ARS",
      "days": 2,
      "eta": "2024-02-05"
    },
    {
      "id": "andreani_standard",
      "carrier": "Andreani",
      "service": "Estándar",
      "rate": 250.00,
      "currency": "ARS",
      "days": 4,
      "eta": "2024-02-07"
    }
  ]
}
```

## Moneda

Todos los precios se muestran en **ARS (Pesos Argentinos)** según el formato regional argentino.

