import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Solo se permite método PUT' });
  }

  try {
    const { estudiante, fechaOriginal, horaOriginal, fechaNueva, horaNueva } = req.body;

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
    const rowIndex = rows.findIndex(row => 
      row[0] === estudiante && 
      row[1] === fechaOriginal &&
      row[2] === horaOriginal
    );

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

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
