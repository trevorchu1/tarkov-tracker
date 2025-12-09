import pg from 'pg';
import 'dotenv/config';

const isNeon = process.env.PGURI?.includes('neon.tech');
const isProduction = process.env.NODE_ENV === 'production';

export const pool = new pg.Pool({
  connectionString: process.env.PGURI,
  ssl: isNeon || isProduction
    ? { rejectUnauthorized: false }
    : false
});
