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
        <style>{`
          .catalogo-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .catalogo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            padding: 1rem 0;
          }
          .prenda-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            border: 1px solid #f0f0f0;
          }
          .prenda-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .prenda-card-img-container {
            width: 100%;
            height: 320px;
            overflow: hidden;
            background-color: #f3f4f6;
            position: relative;
          }
          .prenda-card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
          }
          .prenda-card:hover .prenda-card-img {
            transform: scale(1.05);
          }
          .prenda-card-content {
            padding: 1.5rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }
          .prenda-card-categoria {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .prenda-card-nombre {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            color: #1f2937;
          }
          .prenda-card-descripcion {
            color: #4b5563;
            margin-bottom: 1rem;
            flex-grow: 1;
          }
          .prenda-card-precio {
            font-size: 1.5rem;
            font-weight: 800;
            color: #4f46e5;
            margin-top: auto;
            margin-bottom: 1rem;
          }
          
          /* Estilos del Menú Hamburguesa (Filtros) */
          .mobile-menu-wrapper {
            display: none; /* Oculto en escritorio */
            justify-content: flex-end;
            padding: 10px 0;
            position: relative;
            z-index: 50;
            margin-bottom: 1rem;
          }
          .mobile-menu-btn {
            background: white;
            border: 1px solid #e5e7eb;
            font-size: 1.2rem;
            cursor: pointer;
            color: #333;
            padding: 8px 16px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            font-weight: 600;
            transition: all 0.2s ease;
          }
          .mobile-menu-btn:active {
            transform: scale(0.95);
            background-color: #f9fafb;
          }
          .mobile-menu-dropdown {
            position: absolute;
            top: 120%;
            right: 0;
            background-color: white;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            padding: 0.5rem;
            border-radius: 16px;
            min-width: 240px;
            border: 1px solid #f3f4f6;
            z-index: 100;
            overflow: hidden;
          }
          .mobile-menu-item {
            width: 100%;
            text-align: left;
            padding: 12px 16px;
            background: none;
            border: none;
            cursor: pointer;
            color: #4b5563;
            font-size: 1rem;
            border-radius: 8px;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mobile-menu-item:active {
            background-color: #f3f4f6;
            color: #4f46e5;
          }

          @media (max-width: 768px) {
            .catalogo-grid {
              grid-template-columns: 1fr !important;
              gap: 1.5rem;
            }
            .prenda-card-img-container {
              height: 350px;
            }
            .catalogo-title {
              font-size: 2rem;
            }
            .mobile-menu-wrapper {
              display: flex;
            }
          }
        `}</style>

        {/* Menú de Hamburguesa para móviles */}
        <div className="mobile-menu-wrapper">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Filtrar secciones"
          >
            Secciones ☰
          </button>
          {menuAbierto && (
            <div className="mobile-menu-dropdown">
              <button className="mobile-menu-item" onClick={() => { setMenuAbierto(false); document.getElementById('catalogo-general')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Catálogo General <span>↓</span>
              </button>
              <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '4px 0' }}></div>
              <button className="mobile-menu-item" onClick={() => { setMenuAbierto(false); document.getElementById('nasty-barbell')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Nasty Barbell <span>↓</span>
              </button>
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