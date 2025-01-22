import React, { useState } from 'react';
import { Clock, Trash2, Edit, X, Check } from 'lucide-react';

export default function Home() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // ... mantén la constante estudiantes igual ...

  async function registrarClase(estudiante) {
    // ... mantén la función registrarClase igual ...
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
      setMensaje({ tipo: 'exito', texto: '✅ Clase eliminada correctamente' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ ' + error.message });
    }
  }

  function iniciarEdicion(registro) {
    setEditando({
      ...registro,
      fechaTemp: registro.fecha,
      horaTemp: registro.hora
    });
  }

  async function guardarEdicion() {
    try {
      const response = await fetch('/api/editar-clase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editando.id,
          estudiante: editando.estudiante,
          fechaOriginal: editando.fecha,
          horaOriginal: editando.hora,
          fechaNueva: editando.fechaTemp,
          horaNueva: editando.horaTemp
        }),
      });

      if (!response.ok) throw new Error('Error al editar la clase');

      setRegistros(registros.map(registro =>
        registro.id === editando.id
          ? { ...registro, fecha: editando.fechaTemp, hora: editando.horaTemp }
          : registro
      ));

      setMensaje({ tipo: 'exito', texto: '✅ Clase actualizada correctamente' });
      setEditando(null);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ ' + error.message });
    }
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* ... mantén el código del título y las tarjetas de estudiantes igual ... */}

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
            {registros.map(registro => (
              <div key={registro.id} style={{
                padding: '15px',
                backgroundColor: '#f7fafc',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {editando?.id === registro.id ? (
                  <div style={{ width: '100%' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <input
                        type="date"
                        value={editando.fechaTemp}
                        onChange={(e) => setEditando({
                          ...editando,
                          fechaTemp: e.target.value
                        })}
                        style={{
                          padding: '5px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '5px'
                        }}
                      />
                      <input
                        type="time"
                        value={editando.horaTemp}
                        onChange={(e) => setEditando({
                          ...editando,
                          horaTemp: e.target.value
                        })}
                        style={{
                          padding: '5px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '5px'
                        }}
                      />
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={() => setEditando(null)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#cbd5e0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={guardarEdicion}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#48bb78',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                        {registro.estudiante}
                      </p>
                      <p style={{ margin: '0', color: '#4a5568' }}>
                        {registro.fecha} a las {registro.hora} - {registro.duracion} min ({registro.tarifa}€/hora)
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => iniciarEdicion(registro)}
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
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
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

