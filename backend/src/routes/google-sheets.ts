import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { Session } from 'express-session';

import { Credentials } from 'google-auth-library';

// Extend the Session type
interface CustomSession extends Session {
  tokens?: Credentials;
}

// Extend the Request type
interface CustomRequest extends Request {
  session: CustomSession;
}

const router = express.Router();
dotenv.config();


// At the top of the file
const REDIRECT_URI = 'http://localhost:5173/auth/callback';  // Frontend URL

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

router.get('/auth-url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    include_granted_scopes: true,
    prompt: 'consent'  // Always show consent screen
  });
  res.json({ url });
});

router.get('/callback', async (req: CustomRequest, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const { tokens: newTokens } = await oauth2Client.getToken(code as string);
    
    // Store tokens in session
    req.session.tokens = newTokens;
    
    // Force session save and wait for it
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const client = getAuthenticatedClient(newTokens);
    const drive = google.drive({ version: 'v3', auth: client });

    // Get sheets list
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)',
      pageSize: 10
    });

    res.json({ 
      success: true,
      sheets: response.data.files || [] 
    });
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

router.post('/sync-sheet', async (req, res) => {
  const { sheetId } = req.body;
  try {
    const sheets = google.sheets('v4');
    await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A2:G',
    });

    // Process and save to Supabase
    // ... rest of your sync logic

    res.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

router.get('/sheets', async (req: CustomRequest, res: Response) => {
  const { fileId } = req.query;
  
  try {
    if (!req.session.tokens) {
      throw new Error('Not authenticated');
    }

    const oauth2Client = getAuthenticatedClient(req.session.tokens);
    
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: fileId as string,
    });
    
    const sheetsList = response.data.sheets?.map(sheet => ({
      id: sheet.properties?.sheetId,
      name: sheet.properties?.title,
      index: sheet.properties?.index
    })) || [];

    res.json({ success: true, sheets: sheetsList });
  } catch (error) {
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/list-sheets', async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    // Get list of spreadsheets
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)',
      pageSize: 10
    });

    res.json({ 
      success: true,
      sheets: response.data.files || [] 
    });
  } catch (error) {
    console.error('Error listing sheets:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Move OAuth client creation to a helper function
function getAuthenticatedClient(tokens: Credentials) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Update the preview-sheet endpoint
router.post('/preview-sheet', async (req: CustomRequest, res: Response) => {
  const { fileId, sheetName } = req.body;
  
  try {
    if (!req.session.tokens) {
      throw new Error('Not authenticated');
    }

    const oauth2Client = getAuthenticatedClient(req.session.tokens);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    // Use sheet name in range if provided
    const range = sheetName ? `'${sheetName}'!A1:F` : 'A1:F';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range
    });

    const headers = response.data.values?.[0] || [];
    const rows = response.data.values?.slice(1) || [];

    // Map to our transaction schema
    const mappedData = rows.map(row => ({
      date: row[0],
      type: row[1],
      amount: Number(row[2]),
      category: row[3],
      account: row[4],
      description: row[5]
    }));

    res.json({ 
      success: true,
      headers,
      preview: mappedData.slice(0, 5)
    });
  } catch (error) {
    console.error('Error previewing sheet:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to preview sheet'
    });
  }
});

router.post('/import-sheet', async (req: CustomRequest, res: Response) => {
  const { fileId, sheetName, mappings } = req.body;
  
  try {
    if (!req.session.tokens) {
      throw new Error('Not authenticated');
    }

    const oauth2Client = getAuthenticatedClient(req.session.tokens);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    // Get all rows from the sheet
    const range = sheetName ? `'${sheetName}'!A1:Z` : 'A1:Z';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range
    });

    const rows = response.data.values?.slice(1) || []; // Skip header row

    // Map rows to transactions with type inference from amount
    const transactions = rows.map(row => {
      const amount = Number(row[mappings.amount]);
      
      return {
        date: row[mappings.date],
        // Determine type based on amount sign (positive = income, negative = expense)
        type: amount > 0 ? 'income' : 'expense',
        // Store absolute amount value
        amount: Math.abs(amount),
        category: row[mappings.category],
        source: row[mappings.account], // Map account column to source
        description: row[mappings.description]
      };
    }).filter(t => t.date && t.amount); // Filter out any invalid rows

    // Return the mapped transactions to the frontend for insertion
    res.json({ 
      success: true,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error importing sheet:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to import sheet'
    });
  }
});

export default router; 