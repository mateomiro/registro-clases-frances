import { useState } from 'react';

export default function Home() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const estudiantes = [
    { nombre: "Katharina", horario: "09:00", dia: "Miércoles" },
    { nombre: "Toni", horario: "10:00", dia: "Miércoles" }
  ];

  async function registrarClase(estudiante) {
    setCargando(true);
    setMensaje(null);

    try {
      const fecha = new Date().toLocaleDateString();
      const response = await fetch('/api/registrar-clase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante: estudiante.nombre,
          fecha: fecha,
          hora: estudiante.horario
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: '✅ Clase registrada correctamente' });
        setRegistros([
          { 
            id: Date.now(),
            estudiante: estudiante.nombre,
            fecha,
            hora: estudiante.horario
          },
          ...registros
        ]);
      } else {
        throw new Error(data.error || 'Error al registrar la clase');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: '❌ ' + error.message });
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{
        color: '#333',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        Registro de Clases de Francés
      </h1>

      {mensaje && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          backgroundColor: mensaje.tipo === 'error' ? '#fed7d7' : '#c6f6d5',
          color: mensaje.tipo === 'error' ? '#c53030' : '#2f855a'
        }}>
          {mensaje.texto}
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {estudiantes.map(estudiante => (
          <div key={estudiante.nombre} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#2c5282' }}>
              {estudiante.nombre}
            </h2>
            <p style={{ margin: '0 0 15px 0', color: '#4a5568' }}>
              {estudiante.dia} a las {estudiante.horario}
            </p>
            <button
              onClick={() => registrarClase(estudiante)}
              disabled={cargando}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: cargando ? '#90cdf4' : '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: cargando ? 'default' : 'pointer'
              }}
            >
              {cargando ? '⏳ Registrando...' : '✏️ Registrar Clase'}
            </button>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c5282', marginTop: 0 }}>
          Últimas Clases Registradas
        </h2>
        {registros.length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>
            No hay clases registradas aún
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {registros.map(registro => (
              <div key={registro.id} style={{
                padding: '10px',
                backgroundColor: '#f7fafc',
                borderRadius: '5px'
              }}>
                <p style={{ margin: 0, color: '#2d3748' }}>
                  {registro.estudiante} - {registro.fecha} a las {registro.hora}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
