import { neon } from '@neondatabase/serverless';

/**
 * Neon Database HTTP Client Service
 * 
 * Supports Dual-Mode:
 * 1. Serverless API Endpoint (/api/query)
 * 2. Direct Browser HTTP Neon Client fallback via @neondatabase/serverless
 */

export const getNeonConnectionString = (): string => {
  const envUrl = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_NEON_DATABASE_URL : '';
  return (
    envUrl ||
    'postgresql://neondb_owner:npg_8iOsGczvHjy4@ep-restless-brook-azx19ocz-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  );
};

// Fallback Direct Neon Browser SQL Client
let directSqlInstance: ReturnType<typeof neon> | null = null;
function getDirectSql() {
  if (!directSqlInstance) {
    const connStr = getNeonConnectionString();
    directSqlInstance = neon(connStr);
  }
  return directSqlInstance;
}

/**
 * Execute parameterized SQL query directly to Neon PostgreSQL with automatic fallback
 */
export async function executeNeonQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  // 1. Try via /api/query endpoint first (Vercel serverless / Vite dev proxy)
  try {
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        params,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      let rows: any[] = [];
      if (Array.isArray(data)) {
        rows = data;
      } else if (data && Array.isArray(data.rows)) {
        rows = data.rows;
      } else if (data && Array.isArray(data.result)) {
        rows = data.result;
      }
      return {
        rows,
        rowCount: rows.length,
      };
    }
  } catch {
    // API endpoint unreachable, fallback to direct browser client
  }

  // 2. Direct Browser Client Fallback via @neondatabase/serverless HTTP SQL
  try {
    const sql = getDirectSql();
    const rows = await sql.query(query, params) as any[];
    return {
      rows: (rows || []) as T[],
      rowCount: rows ? rows.length : 0,
    };
  } catch (directErr) {
    console.error('Neon SQL Direct Query Error:', directErr);
    return { rows: [], rowCount: 0 };
  }
}
