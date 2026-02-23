import React, { useState, useEffect } from 'react';
import logo from './assets/lumina-logo.jpg';
import './Header.css';
import { useCarrito } from './context/CarritoContext';

const Header = ({ setPage, activePage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { obtenerCantidadItems } = useCarrito();
  
  const cantidadItems = obtenerCantidadItems();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavClick = (e, page) => {
    e.preventDefault();
    setPage(page);
    window.location.hash = page;
    setMenuOpen(false); // Cierra el menú al hacer clic en un enlace
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo-container" onClick={(e) => handleNavClick(e, 'inicio')}>
        <img src={logo} alt="Lumina Logo" className="logo" />
        <span className="logo-text">
          LUMINA
        </span>
      </div>

      {/* Botón Hamburguesa (solo visible en móvil) */}
      <button 
        className="menu-toggle" 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
        <a
          href="#inicio"
          className={`nav-link ${activePage === 'inicio' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'inicio')}
        >
          Inicio
        </a>
        <a
          href="#catalogo"
          className={`nav-link ${activePage === 'catalogo' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'catalogo')}
        >
          Catálogo
        </a>
        <a
          href="#contacto"
          className={`nav-link ${activePage === 'contacto' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'contacto')}
        >
          Contacto
        </a>
        <a
          href="#carrito"
          className={`nav-link ${activePage === 'carrito' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'carrito')}
          style={{ position: 'relative' }}
        >
          Carrito
          {cantidadItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-12px',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {cantidadItems}
            </span>
          )}
        </a>
      </nav>
    </header>
  );
};

export default Header;
