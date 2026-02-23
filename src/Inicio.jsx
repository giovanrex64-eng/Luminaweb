import React, { useState } from 'react';
import './Inicio.css';

const Inicio = () => {
  const [mostrarContacto, setMostrarContacto] = useState(false);

  return (
    <div className="inicio-container">
      <div className="inicio-content">
        <h1 className="inicio-title">LUMINA</h1>
        <p className="inicio-subtitle">Tu estilo, tu frecuencia ∿</p>
        <p className="inicio-description">
          Descubre prendas únicas que reflejan tu personalidad. Moda contemporánea con estilo propio.
        </p>
        <div className="inicio-buttons">
          <button className="button" onClick={() => window.location.hash = '#catalogo'}>
            Ver Catálogo
          </button>
          <button className="button button-secondary" onClick={() => window.location.hash = '#contacto'}>
            Contactar
          </button>
        </div>
      </div>
      
      <div 
        className={`inicio-contact-info ${mostrarContacto ? 'open' : ''}`}
        onClick={() => setMostrarContacto(!mostrarContacto)}
      >
        <div className="contact-header">
          <span>Contacto</span>
          <span className="arrow">▼</span>
        </div>
        <div className="contact-details">
          <p>📧 luminaweb.tuestilo@gmail.com</p>
          <p>📱 2612153060</p>
        </div>
      </div>
    </div>
  );
};

export default Inicio;