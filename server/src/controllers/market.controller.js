import { pool } from "../db/pool.js";
import {
  searchItemsByName,
  getItemPriceSnapshot,
} from "../services/tarkov.service.js";

export async function searchItems(req, res) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const items = await searchItemsByName(q);

    return res.json(items || []);
    
  } catch (err) {
    console.error("[market.controller] searchItems failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to load items from Tarkov API." });
  }
}

export async function getPricesForItem(req, res) {
  const { itemId } = req.params;

  try {
    const item = await getItemPriceSnapshot(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found in API." });
    }

    const rows = [];

    const isValidPrice = (p) =>
      typeof p === "number" && !Number.isNaN(p);

    for (const offer of item.buyFor || []) {
      if (!isValidPrice(offer.priceRUB)) {
        console.warn(
          `[market.controller] Skipping invalid buy price for item ${itemId} from source ${offer.source}:`,
          {itemId: item.id, price: offer.priceRUB, source: offer.source}
        );
        continue;
      }
      rows.push({
        item_id: item.id,
        item_name: item.name,
        source: `BUY - ${offer.source}`,
        price: offer.priceRUB,
        currency: offer.currency || "₽",
      });
    }

    for (const offer of item.sellFor || []) {
      if (!isValidPrice(offer.priceRUB)) {
        console.warn(
          `[market.controller] Skipping invalid sell price for item ${itemId} from source ${offer.source}:`,
          {itemId: item.id, price: offer.priceRUB, source: offer.source}
        );
        continue;
      }
      rows.push({
        item_id: item.id,
        item_name: item.name,
        source: `SELL - ${offer.source}`,
        price: offer.priceRUB,
        currency: offer.currency || "₽",
      });
    }

    if (!rows.length) {
      console.warn(
        (`[market.controller] No valid prices found for item ${itemId}`),
    );
    return res.json({ itemId, prices: [] });
    }

    // cache into DB
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const r of rows) {
        await client.query(
          `INSERT INTO price_snapshots(item_id,item_name,source,price,currency)
           VALUES($1,$2,$3,$4,$5)`,
          [r.item_id, r.item_name, r.source, r.price, r.currency]
        );
      }
      await client.query("COMMIT");
    } finally {
      client.release();
    }

    return res.json({ itemId, prices: rows });
  } catch (err) {
    console.error("[market.controller] getPricesForItem failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to load prices from Tarkov API." });
  }
}
