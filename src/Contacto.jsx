import React, { useState } from 'react';
import AnimatedSection from './AnimatedSection';
import './Contacto.css';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí normalmente se enviaría a un backend
    console.log('Formulario enviado:', formData);
    setEnviado(true);
    setFormData({ nombre: '', email: '', mensaje: '' });
    
    // Resetear después de 3 segundos
    setTimeout(() => {
      setEnviado(false);
    }, 3000);
  };

  return (
    <AnimatedSection>
      <div className="container contacto-container">
        <div className="contacto-header">
          <h2>Contáctanos</h2>
          <p>
            ¿Tienes preguntas, sugerencias o quieres colaborar con nosotros? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="contacto-content">
          {/* Formulario */}
          <div className="contacto-form-container">
            <div className="contacto-card">
              <h3>Envíanos un mensaje</h3>
            
            {enviado && (
              <div className="form-success-message">
                ✅ ¡Mensaje enviado con éxito! Te contactaremos pronto.
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mensaje</label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="¿En qué podemos ayudarte?"
                  required
                />
              </div>

              <button type="submit" className="button" style={{ width: '100%' }}>
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

          {/* Información de contacto */}
          <div className="contacto-info-container">
            <div className="contacto-card contacto-info-card">
              <h3>Información de contacto</h3>
              
              <div>
                <div className="info-item">
                  <div className="info-icon email">
                    ✉️
                  </div>
                  <div className="info-details">
                    <div>Email</div>
                    <a href="mailto:luminaweb.tuestilo@gmail.com">
                      luminaweb.tuestilo@gmail.com
                    </a>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon telefono">
                    📱
                  </div>
                  <div className="info-details">
                    <div>Teléfono</div>
                    <div>2612153060</div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon horario">
                    🕒
                  </div>
                  <div className="info-details">
                    <div>Horario de atención</div>
                    <div>Lunes a Viernes: 9:00 - 18:00</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="colaboracion-card">
              <h4>
                ¿Vendes prendas y quieres aparecer en nuestro catálogo?
              </h4>
              <p>
                Contáctanos para explorar oportunidades de colaboración y hacer crecer tu negocio.
              </p>
              <a
                href="mailto:luminaweb.tuestilo@gmail.com"
                className="button button-secondary"
              >
                Solicitar colaboración
              </a>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Contacto;
