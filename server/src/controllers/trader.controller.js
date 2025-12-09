import {
  getAllTraders,
  getTraderItems,
  getTraderBarters,
} from "../services/tarkov.service.js";


export async function getTraders(req, res) {
  try {
    const traders = await getAllTraders();
    return res.json(traders || []);
  } catch (err) {
    console.error("[trader.controller] getTraders failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to load traders from Tarkov API." });
  }
}


export async function getTraderItemsById(req, res) {
  const { traderId } = req.params;
  const limit = parseInt(req.query.limit) || 100;

  try {
    const items = await getTraderItems(traderId, limit);
    return res.json({
      traderId,
      count: items.length,
      items
    });
  } catch (err) {
    console.error("[trader.controller] getTraderItemsById failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to load trader items from Tarkov API." });
  }
}


export async function getTraderBartersById(req, res) {
  const { traderId } = req.params;
  const limit = parseInt(req.query.limit) || 100;

  try {
    const barters = await getTraderBarters(traderId, limit);
    return res.json({
      traderId,
      count: barters.length,
      barters
    });
  } catch (err) {
    console.error("[trader.controller] getTraderBartersById failed:", err);
    return res
      .status(502)
      .json({ error: "Failed to load trader barters from Tarkov API." });
  }
}
