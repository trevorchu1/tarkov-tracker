import { pool } from '../db/pool.js';

/**
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export async function getWatchlistByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT
       id,
       item_id,
       item_name,
       icon_link AS "iconLink",
       wiki_link AS "wikiLink",
       note,
       priority,
       target_price AS "targetPrice",
       quantity_needed AS "quantityNeeded",
       created_at
     FROM watchlist_items
     WHERE user_id = $1
     ORDER BY priority DESC, created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * @param {number} userId 
 * @param {string} itemId 
 * @param {string} itemName 
 * @param {string} iconLink 
 * @param {string} wikiLink 
 * @returns {Promise<Object>} 
 */
export async function addWatchlistItem(userId, itemId, itemName, iconLink, wikiLink) {
  const { rows } = await pool.query(
    `INSERT INTO watchlist_items (user_id, item_id, item_name, icon_link, wiki_link)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, item_id) DO UPDATE
       SET item_name = EXCLUDED.item_name,
           icon_link = EXCLUDED.icon_link,
           wiki_link = EXCLUDED.wiki_link
     RETURNING
       id,
       item_id,
       item_name,
       icon_link AS "iconLink",
       wiki_link AS "wikiLink",
       created_at`,
    [userId, itemId, itemName, iconLink, wikiLink]
  );
  return rows[0];
}

/**
 * @param {number} userId
 * @param {string} itemId
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export async function updateWatchlistItem(userId, itemId, updates) {
  const { note, priority, targetPrice, quantityNeeded } = updates;

  const { rows } = await pool.query(
    `UPDATE watchlist_items
     SET note = COALESCE($3, note),
         priority = COALESCE($4, priority),
         target_price = COALESCE($5, target_price),
         quantity_needed = COALESCE($6, quantity_needed)
     WHERE user_id = $1 AND item_id = $2
     RETURNING
       id,
       item_id,
       item_name,
       icon_link AS "iconLink",
       wiki_link AS "wikiLink",
       note,
       priority,
       target_price AS "targetPrice",
       quantity_needed AS "quantityNeeded",
       created_at`,
    [userId, itemId, note, priority, targetPrice, quantityNeeded]
  );

  return rows[0];
}

/**
 * @param {number} userId
 * @param {string} itemId ]
 * @returns {Promise<void>}
 */
export async function removeWatchlistItem(userId, itemId) {
  await pool.query(
    'DELETE FROM watchlist_items WHERE user_id=$1 AND item_id=$2',
    [userId, itemId]
  );
}
