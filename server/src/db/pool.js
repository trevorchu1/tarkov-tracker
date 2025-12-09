import pg from 'pg';
import 'dotenv/config';

const isNeon = process.env.PGURI?.includes('neon.tech');
const isProduction = process.env.NODE_ENV === 'production';

export const pool = new pg.Pool({
  connectionString: process.env.PGURI,
  ssl: isNeon || isProduction
    ? { rejectUnauthorized: false }
    : false,
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Wait 10s for connection
  ...(isNeon && {
    allowExitOnIdle: true // Allow process to exit when idle
  })
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

if (!isProduction) {
  pool.on('connect', () => {
    console.log('Database client connected');
  });
}
