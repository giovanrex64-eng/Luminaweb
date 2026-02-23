import React, { useState } from 'react';
import './Catalogo.css';
import BotonPago from './components/BotonPago';

// Carga dinámica de imágenes para evitar errores si falta alguna o la extensión es diferente
const imageModules = import.meta.glob('./assets/**/*.{jpg,jpeg,png,webp,JPG,JPEG}', { eager: true, import: 'default' });

// Procesa las imágenes una sola vez para crear un mapa de ID a URL para una búsqueda eficiente.
// Esto asume que tus imágenes se nombran como '1.jpg', '2.png', etc., coincidiendo con el `id` de la prenda.
const imagesById = Object.entries(imageModules).reduce((acc, [path, url]) => {
  const fileName = path.split('/').pop();
  // Extrae el nombre del archivo sin la extensión para usarlo como ID
  const id = fileName.substring(0, fileName.lastIndexOf('.')).trim();
  if (id) {
    acc[id] = url;
  }
  return acc;
}, {});

// Debug: Muestra en la consola el mapa de imágenes por ID.
console.log('Imágenes del catálogo mapeadas por ID:', imagesById);

const Catalogo = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const prendasMias = [
    { id: 1, nombre: 'Champions', precio: '$11000', categoria: 'Categoria 1', descripcion:  'talle 4, color celeste',  },
    { id: 2, nombre: 'Vans', precio: '$11000', categoria: 'Categoria 2', descripcion: 'talle 4 color morado' },
    { id: 3, nombre: 'Jordan', precio: '$11000', categoria: 'Categoria 3', descripcion: 'color blanco, talle 5' },
    { id: 4, nombre: 'Levis', precio: '$11000', categoria: 'Categoria 4', descripcion: 'color crema, talle 5' },
    { id: 5, nombre: 'Nike SB', precio: '$11000', categoria: 'Categoria 5', descripcion: 'color marron,talle 3' },
    { id: 6, nombre: 'North face', precio: '$11000', categoria: 'Categoria 6', descripcion: 'color verde,talle 5' },
  ].map(p => ({ ...p, imagen: imagesById[p.id] || null })); // Búsqueda directa en el mapa

  const prendasNastyBarbell = [
    { id: 7, nombre: 'ONNA Bugeisha', precio: '$30000', categoria: 'Nasty Barbell', descripcion: 'Soporte y estilo para tu rutina' },
    { id: 8, nombre: 'ONNA Bugeisha', precio: '$30000', categoria: 'Nasty Barbell', descripcion: 'Ajuste perfecto y máxima movilidad' },
    { id: 9, nombre: 'ONNA Bugeisha', precio: '$30000', categoria: 'Nasty Barbell', descripcion: 'Ideal para entrenamientos intensos' },
    { id: 10, nombre: 'ONNA Bugeisha', precio: '$30000', categoria: 'Nasty Barbell', descripcion: 'Tela transpirable de secado rápido' },
  ].map(p => ({ ...p, imagen: imagesById[p.id] || null }));

  return (
    <div className="catalogo-container">
        {/* Menú de Hamburguesa para móviles */}
        <div className="mobile-menu-wrapper" style={{ position: 'relative', padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)}
            style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#333' }}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          {menuAbierto && (
            <div className="mobile-menu-dropdown" style={{
              position: 'absolute', top: '50px', right: '10px', backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', zIndex: 1000, minWidth: '200px'
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}>
                  <button onClick={() => { setMenuAbierto(false); document.getElementById('catalogo-general')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#333', padding: 0, textAlign: 'left', width: '100%' }}>
                    Catálogo General
                  </button>
                </li>
                <li>
                  <button onClick={() => { setMenuAbierto(false); document.getElementById('nasty-barbell')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#333', padding: 0, textAlign: 'left', width: '100%' }}>
                    Nasty Barbell
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="catalogo-header">
          <h2 className="catalogo-title">Nuestro Catálogo</h2>
          <p className="catalogo-subtitle">
            Explora las últimas tendencias y encuentra piezas únicas en nuestro catálogo completo.
          </p>
        </div>

        {/* Sección Original */}
        <div className="catalogo-grid" id="catalogo-general">
          {prendasMias.map((prenda) => (
            <PrendaCard key={prenda.id} prenda={prenda} />
          ))}
        </div>

        <div className="catalogo-header" id="nasty-barbell" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
          <h2 className="catalogo-title">Línea de ropa deportiva Nasty Barbell</h2>
          <p className="catalogo-subtitle">
            Potencia tu entrenamiento con nuestra nueva colección exclusiva.
          </p>
        </div>

        <div className="catalogo-grid">
          {prendasNastyBarbell.map((prenda) => (
            <PrendaCard key={prenda.id} prenda={prenda} />
          ))}
        </div>
    </div>
  );
};

const PrendaCard = ({ prenda }) => {
  return (
    <div className="prenda-card">
      <div className="prenda-card-img-container">
        {prenda.imagen ? (
          <img src={prenda.imagen} alt={prenda.nombre} className="prenda-card-img" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', backgroundColor: '#f0f0f0' }}>Sin imagen</div>
        )}
      </div>
      <div className="prenda-card-content">
        <div className="prenda-card-categoria">{prenda.categoria}</div>
        <h3 className="prenda-card-nombre">{prenda.nombre}</h3>
        <p className="prenda-card-descripcion">{prenda.descripcion}</p>
        <p className="prenda-card-precio">{prenda.precio}</p>
        <div className="prenda-card-boton">
          <BotonPago producto={prenda} />
        </div>
      </div>
    </div>
  );
};

export default Catalogo;