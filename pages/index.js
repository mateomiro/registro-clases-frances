import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export default function Home() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

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
    const fecha = new Date().toLocaleDateString();
    
    try {
      const response = await fetch('/api/registrar-clase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estudiante: estudiante.nombre,
          fecha: fecha,
          hora: estudiante.horario,
          duracion: estudiante.duracion,
          tarifa: estudiante.tarifa
        }),
      });

      if (!response.ok) throw new Error('Error al registrar la clase');

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

      alert('✅ Clase registrada correctamente');
    } catch (error) {
      alert('❌ Error al registrar la clase');
      console.error(error);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarRegistro(registro) {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) return;

    try {
      const response = await fetch('/api/eliminar-clase', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: registro.fecha,
          estudiante: registro.estudiante
        }),
      });

      if (!response.ok) throw new Error('Error al eliminar la clase');

      setRegistros(registros.filter(r => r.id !== registro.id));
      alert('✅ Clase eliminada correctamente');
    } catch (error) {
      alert('❌ Error al eliminar la clase');
      console.error(error);
    }
  }

  function iniciarEdicion(registro) {
    setEditando(registro.id);
    setNuevaFecha(registro.fecha);
    setNuevaHora(registro.hora);
  }

  async function guardarEdicion(registro) {
    try {
      const response = await fetch('/api/editar-clase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: registro.id,
          nuevaFecha,
          nuevaHora
        }),
      });

      if (!response.ok) throw new Error('Error al editar la clase');

      setRegistros(registros.map(r => r.id === registro.id ? { ...r, fecha: nuevaFecha, hora: nuevaHora } : r));
      setEditando(null);
      alert('✅ Clase actualizada correctamente');
    } catch (error) {
      alert('❌ Error al editar la clase');
      console.error(error);
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
      <h1 style={{
        color: '#333',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        Registro de Clases de Francés
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {estudiantes.map((estudiante) => (
          <div key={estudiante.nombre} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '15px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#2c5282' }}>
                  {estudiante.nombre}
                </h3>
                <p style={{ margin: '0 0 5px 0', color: '#4a5568' }}>
                  {estudiante.dia} a las {estudiante.horario}
                </p>
                <p style={{ margin: '0', color: '#4a5568' }}>
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
              {cargando ? '⏳ Registrando...' : '✏️ Registrar Clase'}
            </button>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          color: '#2c5282'
        }}>
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
                padding: '15px',
                backgroundColor: '#f7fafc',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {editando === registro.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <input
                      type="date"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <input
                      type="time"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                      style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <button
                      onClick={() => guardarEdicion(registro)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      💾 Guardar
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                      {registro.estudiante}
                    </p>
                    <p style={{ margin: '0', color: '#4a5568' }}>
                      {registro.fecha} a las {registro.hora} - {registro.duracion} min ({registro.tarifa}€/hora)
                    </p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => iniciarEdicion(registro)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#63b3ed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminarRegistro(registro)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#fc8181',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
