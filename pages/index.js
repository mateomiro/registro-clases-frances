import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export default function Home() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);

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

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
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
                borderRadius: '5px'
              }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                  {registro.estudiante}
                </p>
                <p style={{ margin: '0', color: '#4a5568' }}>
                  {registro.fecha} a las {registro.hora} - {registro.duracion} min ({registro.tarifa}€/hora)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


5. Crea pages/api/registrar-clase.js:
javascript
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Solo se permite método POST' });
  }

  try {
    const { estudiante, fecha, hora, duracion, tarifa } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Registro!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          estudiante,
          fecha,
          hora,
          duracion,
          tarifa,
          new Date().toISOString()
        ]]
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
