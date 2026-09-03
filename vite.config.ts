import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { neon } from '@neondatabase/serverless';

const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_8iOsGczvHjy4@ep-restless-brook-azx19ocz-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(NEON_DATABASE_URL);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'neon-backend-api',
      configureServer(server) {
        server.middlewares.use('/api/query', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const { query, params = [] } = JSON.parse(body || '{}');

              // Execute query directly via Neon serverless driver
              const rows = await sql.query(query, params);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ rows, rowCount: rows.length }));
            } catch (err: any) {
              console.error('Neon SQL execution error:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message, rows: [] }));
            }
          });
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});

