import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Solo se permite método PUT' });
  }

  try {
    const { estudiante, fechaOriginal, horaOriginal, fechaNueva, horaNueva } = req.body;

    console.log('Buscando:', {
      estudiante,
      fechaOriginal, // formato "DD/M/YYYY"
      horaOriginal
    });

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Obtener todas las filas
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Registro!A:F',
    });

    const rows = response.data.values || [];
    console.log('Filas encontradas:', rows);

    // Encontrar la fila que coincida exactamente
    const rowIndex = rows.findIndex(row => {
      return row[0] === estudiante && 
             row[1] === fechaOriginal && 
             row[2] === horaOriginal;
    });

    console.log('Índice de fila encontrado:', rowIndex);

    if (rowIndex === -1) {
      throw new Error('No se encontró la clase especificada');
    }

    // Actualizar la fila
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `Registro!B${rowIndex + 1}:C${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[fechaNueva, horaNueva]]
      }
    });

    res.status(200).json({ 
      success: true,
      updatedData: { 
        fecha: fechaNueva, 
        hora: horaNueva 
      }
    });
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack
    });
  }
}

import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export default function Home() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);

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
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    
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
    console.log('Iniciando edición para:', registro);
    try {
      // Convertir fecha de "DD/M/YYYY" a "YYYY-MM-DD"
      const [dia, mes, año] = registro.fecha.split('/');
      const fechaFormateada = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      
      console.log('Fecha formateada:', fechaFormateada);
      
      setEditando({
        ...registro,
        fechaTemp: fechaFormateada,
        horaTemp: registro.hora
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      alert('Error al iniciar la edición: formato de fecha incorrecto');
    }
  }

  async function guardarEdicion(registro) {
    try {
      if (!editando || !registro) {
        throw new Error('Datos de edición incompletos');
      }

      console.log('Enviando edición:', {
        estudiante: registro.estudiante,
        fechaOriginal: registro.fecha,
        horaOriginal: registro.hora,
        fechaNueva: fechaNuevaFormateada,
        horaNueva: editando.horaTemp,
      });

      const fechaInput = editando.fechaTemp;
      const [año, mes, dia] = fechaInput.split('-');
      const fechaNuevaFormateada = `${parseInt(dia)}/${parseInt(mes)}/${año}`;

      const response = await fetch('/api/editar-clase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estudiante: registro.estudiante,
          fechaOriginal: registro.fecha,
          horaOriginal: registro.hora,
          fechaNueva: fechaNuevaFormateada,
          horaNueva: editando.horaTemp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al editar la clase');
      }

      setRegistros(registros.map(r => 
        r.id === registro.id 
          ? { 
              ...r, 
              fecha: fechaNuevaFormateada, 
              hora: editando.horaTemp 
            } 
          : r
      ));
      
      setEditando(null);
      alert('✅ Clase actualizada correctamente');
    } catch (error) {
      console.error('Error completo:', error);
      alert('❌ Error al editar la clase: ' + error.message);
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
                        value={editando.fechaTemp}
                        onChange={(e) => setEditando({
                          ...editando,
                          fechaTemp: e.target.value
                        })}
                        style={{
                          padding: '5px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '5px',
                          width: '100%'
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
                        ✅
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
                        ✏️
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
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

