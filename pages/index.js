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

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Euro } from 'lucide-react';
import { formatearFecha, parsearFecha } from '../utils/fechas';

export default function Home() {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(null);

  const estudiantes = [
    {
      id: 1,
      nombre: "Katharina",
      horarioPreferido: "09:00",
      dia: "Miércoles",
      duracion: 60,
      tarifa: 20
    },
    {
      id: 2,
      nombre: "Toni",
      horarioPreferido: "10:00",
      dia: "Miércoles",
      duracion: 60,
      tarifa: 20
    }
  ];

  // Cargar clases al iniciar
  useEffect(() => {
    cargarClases();
  }, []);

  async function cargarClases() {
    try {
      setCargando(true);
      const response = await fetch('/api/clases');
      if (!response.ok) throw new Error('Error al cargar las clases');
      const data = await response.json();
      setClases(data.clases);
    } catch (error) {
      setError('Error al cargar las clases: ' + error.message);
    } finally {
      setCargando(false);
    }
  }

  async function registrarClase(estudiante) {
    try {
      setCargando(true);
      const fecha = formatearFecha(new Date());
      
      const response = await fetch('/api/clases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante: estudiante.nombre,
          fecha,
          hora: estudiante.horarioPreferido,
          duracion: estudiante.duracion,
          tarifa: estudiante.tarifa
        }),
      });

      if (!response.ok) throw new Error('Error al registrar la clase');
      
      await cargarClases(); // Recargar las clases
      alert('✅ Clase registrada correctamente');
    } catch (error) {
      setError('Error al registrar la clase: ' + error.message);
    } finally {
      setCargando(false);
    }
  }

  async function editarClase(claseId) {
    if (!editando) return;
    
    try {
      setCargando(true);
      const response = await fetch(`/api/clases/${claseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: formatearFecha(parsearFecha(editando.fecha)),
          hora: editando.hora
        }),
      });

      if (!response.ok) throw new Error('Error al editar la clase');
      
      await cargarClases(); // Recargar las clases
      setEditando(null);
      alert('✅ Clase actualizada correctamente');
    } catch (error) {
      setError('Error al editar la clase: ' + error.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarClase(claseId) {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) return;

    try {
      setCargando(true);
      const response = await fetch(`/api/clases/${claseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar la clase');
      
      await cargarClases(); // Recargar las clases
      alert('✅ Clase eliminada correctamente');
    } catch (error) {
      setError('Error al eliminar la clase: ' + error.message);
    } finally {
      setCargando(false);
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
                  {estudiante.dia} a las {estudiante.horarioPreferido}
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
        {clases.length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>
            No hay clases registradas aún
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {clases.map(clase => (
              <div key={clase.id} style={{
                padding: '15px',
                backgroundColor: '#f7fafc',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {editando?.id === clase.id ? (
                  <div style={{ width: '100%' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <input
                        type="date"
                        value={editando.fecha}
                        onChange={(e) => setEditando({
                          ...editando,
                          fecha: e.target.value
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
                        value={editando.hora}
                        onChange={(e) => setEditando({
                          ...editando,
                          hora: e.target.value
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
                        onClick={editarClase}
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
                        {clase.estudiante}
                      </p>
                      <p style={{ margin: '0', color: '#4a5568' }}>
                        {clase.fecha} a las {clase.hora} - {clase.duracion} min ({clase.tarifa}€/hora)
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setEditando(clase)}
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
                        onClick={() => eliminarClase(clase.id)}
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

