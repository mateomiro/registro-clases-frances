import { google } from 'googleapis';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    switch (req.method) {
      case 'GET':
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Registro!A2:F',
        });

        const clases = (response.data.values || []).map((row, index) => ({
          id: row[5] || `${index}-${Date.now()}`,
          estudiante: row[0],
          fecha: row[1],
          hora: row[2],
          duracion: parseInt(row[3]),
          tarifa: parseInt(row[4])
        }));

        return res.status(200).json({ clases });

      case 'POST':
        const { estudiante, fecha, hora, duracion, tarifa } = req.body;

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

        return res.status(201).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export function formatearFecha(fecha) {
  if (typeof fecha === 'string') {
    fecha = new Date(fecha);
  }
  
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  
  return `${dia}/${mes}/${año}`;
}

export function parsearFecha(fechaStr) {
  const [dia, mes, año] = fechaStr.split('/');
  return new Date(año, parseInt(mes) - 1, dia);
}

export function formatearHora(hora) {
  return hora.padStart(5, '0'); // Asegura formato HH:mm
}

export function EditarClaseModal({ clase, onGuardar, onCancelar }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  useEffect(() => {
    if (clase) {
      const [dia, mes, año] = clase.fecha.split('/');
      setFecha(`${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
      setHora(clase.hora);
    }
  }, [clase]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const [año, mes, dia] = fecha.split('-');
    const fechaFormateada = `${parseInt(dia)}/${parseInt(mes)}/${año}`;
    onGuardar({ ...clase, fecha: fechaFormateada, hora });
  };

  if (!clase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Editar Clase</h2>
          <button
            onClick={onCancelar}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancelar}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
