/**
 * Mapeo de provincias argentinas a códigos de 2 letras para API Envia.com
 * Los códigos deben ser de máximo 2 caracteres según validación de Envia
 */

export const PROVINCIAS_MAP = {
  'Buenos Aires': 'BA',
  'Catamarca': 'CT',
  'Chaco': 'CC',
  'Chubut': 'CH',
  'Ciudad Autónoma de Buenos Aires': 'CF', // Corregido de 'CABA' a 'CF' (Capital Federal)
  'Córdoba': 'CO',
  'Corrientes': 'CR',
  'Entre Ríos': 'ER',
  'Formosa': 'FO',
  'Jujuy': 'JY',
  'La Pampa': 'LP',
  'La Rioja': 'LR',
  'Mendoza': 'MZ',
  'Misiones': 'MI',
  'Neuquén': 'NQ',
  'Río Negro': 'RN',
  'Salta': 'SA',
  'San Juan': 'SJ',
  'San Luis': 'SL',
  'Santa Cruz': 'SC',
  'Santa Fe': 'SF',
  'Santiago del Estero': 'SE',
  'Tierra del Fuego': 'TF',
  'Tucumán': 'TU' // Corregido de 'TM' a 'TU'
};

/**
 * Obtiene el código de 2 letras para una provincia
 * @param {string} provinceName - Nombre completo de la provincia
 * @returns {string} Código de 2 letras
 */
export const getProvinceCode = (provinceName) => {
  return PROVINCIAS_MAP[provinceName] || provinceName.substring(0, 2).toUpperCase();
};

/**
 * Obtiene el nombre completo de la provincia desde el código
 * @param {string} code - Código de 2 letras
 * @returns {string} Nombre completo de la provincia
 */
export const getProvinceName = (code) => {
  for (const [name, c] of Object.entries(PROVINCIAS_MAP)) {
    if (c === code) return name;
  }
  return code;
};

// Lista ordenada de provincias para select/dropdown
export const PROVINCIAS_LISTA = Object.keys(PROVINCIAS_MAP).sort();
