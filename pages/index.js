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
  console.log('Registro a editar:', registro);
  
  // Convertir la fecha al formato correcto
  try {
    const [dia, mes, año] = registro.fecha.split('/');
    const fechaFormateada = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    
    console.log('Fecha formateada:', fechaFormateada);

    setEditando({
      id: registro.id,
      estudiante: registro.estudiante,
      fecha: registro.fecha,        // Mantener la fecha original
      hora: registro.hora,          // Mantener la hora original
      fechaTemp: fechaFormateada,   // Fecha para el input
      horaTemp: registro.hora       // Hora para el input
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    alert('Error al iniciar la edición');
  }
}

async function guardarEdicion() {
  if (!editando) {
    console.error('No hay datos de edición');
    return;
  }

  try {
    // Convertir la fecha de YYYY-MM-DD a DD/MM/YYYY
    const [año, mes, dia] = editando.fechaTemp.split('-');
    const fechaNuevaFormateada = `${dia}/${mes}/${año}`;

    const datosEdicion = {
      estudiante: editando.estudiante,
      fechaOriginal: editando.fecha,
      horaOriginal: editando.hora,
      fechaNueva: fechaNuevaFormateada,
      horaNueva: editando.horaTemp
    };

    console.log('Enviando datos de edición:', datosEdicion);

    const response = await fetch('/api/editar-clase', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosEdicion),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al editar la clase');
    }

    setRegistros(registros.map(registro =>
      registro.id === editando.id
        ? { 
            ...registro, 
            fecha: fechaNuevaFormateada, 
            hora: editando.horaTemp 
          }
        : registro
    ));

    alert('✅ Clase actualizada correctamente');
    setEditando(null);
  } catch (error) {
    console.error('Error al guardar edición:', error);
    alert('❌ Error al editar la clase: ' + error.message);
  }
}

    const response = await fetch('/api/editar-clase', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estudiante: editando.estudiante,
        fechaOriginal,
        horaOriginal,
        fechaNueva: editando.fechaTemp,
        horaNueva: editando.horaTemp
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al editar la clase');
    }

    setRegistros(registros.map(registro =>
      registro.id === editando.id
        ? { 
            ...registro, 
            fecha: data.updatedData.fecha, 
            hora: data.updatedData.hora 
          }
        : registro
    ));

    alert('✅ Clase actualizada correctamente');
    setEditando(null);
  } catch (error) {
    alert('❌ Error al editar la clase: ' + error.message);
    console.error('Error completo:', error);
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
        value={editando.fechaTemp || ''}
        onChange={(e) => {
          console.log('Nueva fecha:', e.target.value);
          setEditando({
            ...editando,
            fechaTemp: e.target.value
          });
        }}
        style={{
          padding: '5px',
          border: '1px solid #e2e8f0',
          borderRadius: '5px',
          width: '100%'
        }}
      />
      <input
        type="time"
        value={editando.horaTemp || ''}
        onChange={(e) => {
          console.log('Nueva hora:', e.target.value);
          setEditando({
            ...editando,
            horaTemp: e.target.value
          });
        }}
        style={{
          padding: '5px',
          border: '1px solid #e2e8f0',
          borderRadius: '5px',
          width: '100%'
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
        ❌
      </button>
      <button
        onClick={() => {
          console.log('Estado actual de editando:', editando);
          guardarEdicion();
        }}
        style={{
          padding: '5px 10px',
          backgroundColor: '#48bb78',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ✅
      </button>
    </div>
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
