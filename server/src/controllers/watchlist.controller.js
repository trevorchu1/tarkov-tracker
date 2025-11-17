import { pool } from '../db/pool.js';

export async function list(req, res) {
  const { rows } = await pool.query(
    'SELECT id, item_id, item_name, created_at FROM watchlist_items WHERE user_id=$1 ORDER BY created_at DESC',
    [req.user.user_id]
  );
  res.json(rows);
}

export async function add(req, res) {
  const { item_id, item_name } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO watchlist_items(user_id,item_id,item_name)
     VALUES($1,$2,$3)
     ON CONFLICT (user_id,item_id) DO NOTHING
     RETURNING id,item_id,item_name,created_at`,
    [req.user.user_id, item_id, item_name]
  );
  res.status(201).json(rows[0] ?? { note: 'Already on watchlist' });
}

export async function remove(req, res) {
  await pool.query(
    'DELETE FROM watchlist_items WHERE user_id=$1 AND item_id=$2',
    [req.user.user_id, req.params.itemId]
  );
  res.status(204).end();
}
