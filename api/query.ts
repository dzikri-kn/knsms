import { neon } from '@neondatabase/serverless';

const NEON_DATABASE_URL = process.env.DATABASE_URL || 
  process.env.VITE_NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_8iOsGczvHjy4@ep-restless-brook-azx19ocz-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(NEON_DATABASE_URL);

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { query, params = [] } = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (!query) {
      res.status(400).json({ error: 'Query is required', rows: [] });
      return;
    }

    const rows = await sql.query(query, params);
    res.status(200).json({ rows, rowCount: rows.length });
  } catch (err: any) {
    console.error('Vercel Neon SQL execution error:', err);
    res.status(500).json({ error: err.message || 'Database error', rows: [] });
  }
}
