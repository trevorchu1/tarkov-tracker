import { pool } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(req, res) {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING user_id,email',
      [email, hash]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: 'Email in use?' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
