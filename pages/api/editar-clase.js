import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Solo se permite método PUT' });
  }

  try {
    const { estudiante, fechaOriginal, horaOriginal, fechaNueva, horaNueva } = req.body;

    console.log('Datos recibidos:', { 
      estudiante, 
      fechaOriginal, 
      horaOriginal, 
      fechaNueva, 
      horaNueva 
    });

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Buscar la fila a editar
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Registro!A:F',
    });

    const rows = response.data.values || [];
    console.log('Filas encontradas:', rows);

    const rowIndex = rows.findIndex(row => {
      console.log('Comparando:', {
        rowEstudiante: row[0],
        rowFecha: row[1],
        rowHora: row[2],
        conEstudiante: estudiante,
        conFecha: fechaOriginal,
        conHora: horaOriginal
      });
      return row[0] === estudiante && 
             row[1] === fechaOriginal && 
             row[2] === horaOriginal;
    });

    console.log('Índice de fila encontrado:', rowIndex);

    if (rowIndex === -1) {
      throw new Error('No se encontró la clase especificada');
    }

    // Formatear la fecha para mantener consistencia
    const fechaFormateada = new Date(fechaNueva).toLocaleDateString();

    // Actualizar la fila
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `Registro!B${rowIndex + 1}:C${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[fechaFormateada, horaNueva]]
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Clase actualizada correctamente',
      updatedData: { fecha: fechaFormateada, hora: horaNueva }
    });
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
}

