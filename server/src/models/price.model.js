import { pool } from "../db/pool.js";

/**
 * @param {Array} priceRows 
 * @returns {Promise<void>}
 */
export async function savePriceSnapshots(priceRows) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const r of priceRows) {
      await client.query(
        `INSERT INTO price_snapshots(item_id,item_name,source,price,currency)
         VALUES($1,$2,$3,$4,$5)`,
        [r.item_id, r.item_name, r.source, r.price, r.currency]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get price history for a specific item
 * @param {string} itemId - The item ID
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Array>} Array of price history records
 */
export async function getPriceHistory(itemId, days = 7) {
  const { rows } = await pool.query(
    `SELECT
       item_id AS "itemId",
       item_name AS "itemName",
       source,
       price,
       currency,
       recorded_at AS "timestamp"
     FROM price_snapshots
     WHERE item_id = $1
       AND recorded_at >= NOW() - INTERVAL '${parseInt(days)} days'
     ORDER BY recorded_at ASC`,
    [itemId]
  );
  return rows;
}

/**
 * Get aggregated price history (average prices per hour)
 * @param {string} itemId - The item ID
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Object>} Object with buy and sell price arrays
 */
export async function getAggregatedPriceHistory(itemId, days = 7) {
  const { rows } = await pool.query(
    `SELECT
       date_trunc('hour', recorded_at) AS "timestamp",
       source,
       AVG(price) AS "avgPrice",
       MIN(price) AS "minPrice",
       MAX(price) AS "maxPrice",
       COUNT(*) AS "sampleCount"
     FROM price_snapshots
     WHERE item_id = $1
       AND recorded_at >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY date_trunc('hour', recorded_at), source
     ORDER BY "timestamp" ASC`,
    [itemId]
  );

  // Separate buy and sell prices
  const buyPrices = rows
    .filter(r => r.source.startsWith('BUY'))
    .map(r => ({
      timestamp: r.timestamp,
      source: r.source,
      avgPrice: parseFloat(r.avgPrice),
      minPrice: parseFloat(r.minPrice),
      maxPrice: parseFloat(r.maxPrice),
      sampleCount: parseInt(r.sampleCount)
    }));

  const sellPrices = rows
    .filter(r => r.source.startsWith('SELL'))
    .map(r => ({
      timestamp: r.timestamp,
      source: r.source,
      avgPrice: parseFloat(r.avgPrice),
      minPrice: parseFloat(r.minPrice),
      maxPrice: parseFloat(r.maxPrice),
      sampleCount: parseInt(r.sampleCount)
    }));

  return {
    itemId,
    buyPrices,
    sellPrices
  };
}
