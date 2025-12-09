import {
  searchItemsByName,
  getItemPriceSnapshot,
  getItemHistoricalPrices,
} from "../services/tarkov.service.js";
import {
  savePriceSnapshots,
  getPriceHistory,
  getAggregatedPriceHistory
} from "../models/price.model.js";

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
    await savePriceSnapshots(rows);

    return res.json({ itemId, prices: rows });
  } catch (err) {
    console.error("[market.controller] getPricesForItem failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to load prices from Tarkov API." });
  }
}

// days not really working, seems like api only stores past 2 days or so
// may come back to this later
export async function getPriceHistoryForItem(req, res) {
  const { itemId } = req.params;
  const days = parseInt(req.query.days) || 7;

  if (days < 1 || days > 90) {
    return res.status(400).json({
      error: "Days parameter must be between 1 and 90"
    });
  }

  try {
    const history = await getPriceHistory(itemId, days);

    if (!history || history.length === 0) {
      return res.status(404).json({
        error: "No price history found for this item",
        itemId,
        days
      });
    }

    return res.json({
      itemId,
      days,
      count: history.length,
      history
    });
  } catch (err) {
    console.error("[market.controller] getPriceHistoryForItem failed:", err);
    return res
      .status(500)
      .json({ error: "Failed to retrieve price history" });
  }
}


export async function getAggregatedPriceHistoryForItem(req, res) {
  const { itemId } = req.params;
  const days = parseInt(req.query.days) || 7;

  if (days < 1 || days > 90) {
    return res.status(400).json({
      error: "Days parameter must be between 1 and 90"
    });
  }

  try {
    // Try to fetch historical prices from Tarkov API first
    let itemName = null;
    let apiHistoricalPrices = [];

    try {
      const item = await getItemHistoricalPrices(itemId);
      itemName = item?.name;

      if (item?.historicalPrices && item.historicalPrices.length > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        apiHistoricalPrices = item.historicalPrices
          .filter(p => {
            const timestamp = parseInt(p.timestamp);
            return new Date(timestamp) >= cutoffDate;
          })
          .map(p => ({
            timestamp: new Date(parseInt(p.timestamp)).toISOString(),
            price: p.price,
            source: "Flea Market"
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
    } catch (apiErr) {
      console.warn("[market.controller] Tarkov API historicalPrices not available:", apiErr.message);
    }

    // If API has data, use it
    if (apiHistoricalPrices.length > 0) {
      return res.json({
        itemId,
        itemName,
        days,
        source: "tarkov-api",
        buyPricesCount: apiHistoricalPrices.length,
        sellPricesCount: 0,
        buyPrices: apiHistoricalPrices.map(p => ({
          timestamp: p.timestamp,
          source: `BUY - ${p.source}`,
          avgPrice: p.price,
          minPrice: p.price,
          maxPrice: p.price,
          sampleCount: 1
        })),
        sellPrices: []
      });
    }

    // Fallback to database aggregated prices
    console.log("[market.controller] No API data, falling back to database");
    const dbHistory = await getAggregatedPriceHistory(itemId, days);

    if (!dbHistory.buyPrices.length && !dbHistory.sellPrices.length) {
      return res.status(404).json({
        error: "No price history found for this item. Try viewing current prices first to start collecting data.",
        itemId,
        days
      });
    }

    return res.json({
      itemId,
      itemName,
      days,
      source: "database",
      buyPricesCount: dbHistory.buyPrices.length,
      sellPricesCount: dbHistory.sellPrices.length,
      buyPrices: dbHistory.buyPrices,
      sellPrices: dbHistory.sellPrices
    });
  } catch (err) {
    console.error("[market.controller] getAggregatedPriceHistoryForItem failed:", err);
    return res
      .status(500)
      .json({ error: "Failed to retrieve price history" });
  }
}
