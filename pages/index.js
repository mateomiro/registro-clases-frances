import { useState, useEffect } from 'react';
import { Clock, Trash2, Edit, Check, X } from 'lucide-react';

export default function Home() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const estudiantes = [
    {
      nombre: "Katharina",
      horario: "09:00",
      dia: "Miércoles",
      duracion: 60,
      tarifa: 20
    },
    {
      nombre: "Toni",
      horario: "10:00",
      dia: "Miércoles",
      duracion: 60,
      tarifa: 20
    }
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
          hora: estudiante.horario,
          duracion: estudiante.duracion,
          tarifa: estudiante.tarifa
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
            hora: estudiante.horario,
            duracion: estudiante.duracion,
            tarifa: estudiante.tarifa
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

  async function eliminarRegistro(registro, index) {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) return;

    try {
      const response = await fetch('/api/eliminar-clase', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: index + 1 }) // +1 porque la primera fila es el encabezado
      });

      if (response.ok) {
        setRegistros(registros.filter(r => r.id !== registro.id));
        setMensaje({ tipo: 'exito', texto: '✅ Clase eliminada correctamente' });
      } else {
        throw new Error('Error al eliminar la clase');
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ ' + error.message });
    }
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          margin: '0 0 20px 0',
          color: '#2c5282',
          textAlign: 'center'
        }}>
          Registro de Clases de Francés
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {estudiantes.map((estudiante) => (
            <div key={estudiante.nombre} style={{
              backgroundColor: '#f7fafc',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2c5282' }}>
                    {estudiante.nombre}
                  </h3>
                  <p style={{ margin: '0 0 5px 0', color: '#4a5568', fontSize: '14px' }}>
                    {estudiante.dia} a las {estudiante.horario}
                  </p>
                  <p style={{ margin: '0', color: '#4a5568', fontSize: '14px' }}>
                    Duración: {estudiante.duracion} min - {estudiante.tarifa}€/hora
                  </p>
                </div>
                <Clock style={{ color: '#718096' }} />
              </div>
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
                {cargando ? '⏳ Registrando...' : 'Registrar Clase'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2c5282' }}>
          Últimas Clases Registradas
        </h2>
        {registros.length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>
            No hay clases registradas aún
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {registros.map((registro, index) => (
              <div key={registro.id} style={{
                padding: '15px',
                backgroundColor: '#f7fafc',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#2d3748' }}>
                    {registro.estudiante}
                  </p>
                  <p style={{ margin: '0', color: '#4a5568', fontSize: '14px' }}>
                    {registro.fecha} a las {registro.hora} - {registro.duracion} min ({registro.tarifa}€/hora)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setEditando(registro)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => eliminarRegistro(registro, index)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#fc8181',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mensaje && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: mensaje.tipo === 'error' ? '#fc8181' : '#68d391',
          color: 'white',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}
