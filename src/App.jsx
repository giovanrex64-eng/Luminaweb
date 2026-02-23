import { useState, useEffect } from 'react';
import Header from './Header';
import Inicio from './Inicio';
import Catalogo from './Catalogo';
import Contacto from './Contacto';
import Carrito from './Carrito';
import { CarritoProvider } from './context/CarritoContext';
import './App.css';
import './animations.css';

function App() {
  const [page, setPage] = useState('inicio');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setPage(hash);
      } else {
        setPage('inicio');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); 

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'catalogo':
        return <Catalogo />;
      case 'contacto':
        return <Contacto />;
      case 'carrito':
        return <Carrito />;
      default:
        return <Inicio />;
    }
  };

  return (
    <CarritoProvider>
      <Header setPage={setPage} activePage={page} />
      <main>
        {renderPage()}
      </main>
    </CarritoProvider>
  );
}

export default App;