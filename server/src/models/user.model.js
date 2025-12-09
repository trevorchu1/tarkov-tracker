import { pool } from '../db/pool.js';

/**
 * @param {string} email 
 * @param {string} passwordHash 
 * @returns {Promise<Object>} 
 */
export async function createUser(email, passwordHash) {
  const { rows } = await pool.query(
    'INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING user_id,email',
    [email, passwordHash]
  );
  return rows[0];
}

/**
 * @param {string} email 
 * @returns {Promise<Object|null>} 
 */
export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  );
  return rows[0] || null;
}
