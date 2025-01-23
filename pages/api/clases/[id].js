import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Obtener todas las filas para encontrar el ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Registro!A:F',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[5] === id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    switch (req.method) {
      case 'PUT':
        const { fecha, hora } = req.body;

        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: `Registro!B${rowIndex + 1}:C${rowIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[fecha, hora]]
          }
        });

        return res.status(200).json({ success: true });

      case 'DELETE':
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          resource: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1
                }
              }
            }]
          }
        });

        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
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
