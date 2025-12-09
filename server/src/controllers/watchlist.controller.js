import {
  getWatchlistByUserId,
  addWatchlistItem,
  updateWatchlistItem,
  removeWatchlistItem
} from '../models/watchlist.model.js';

export async function list(req, res) {
  const rows = await getWatchlistByUserId(req.user.user_id);
  res.json(rows);
}

export async function add(req, res) {
  const { item_id, item_name, iconLink, wikiLink } = req.body;

  const item = await addWatchlistItem(
    req.user.user_id,
    item_id,
    item_name,
    iconLink,
    wikiLink
  );

  res.status(201).json(item);
}

export async function update(req, res) {
  const { note, priority, targetPrice, quantityNeeded } = req.body;

  try {
    const item = await updateWatchlistItem(
      req.user.user_id,
      req.params.itemId,
      { note, priority, targetPrice, quantityNeeded }
    );

    if (!item) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    res.json(item);
  } catch (err) {
    console.error('updateWatchlistItem failed', err);
    res.status(500).json({ error: 'Failed to update watchlist item' });
  }
}

export async function remove(req, res) {
  await removeWatchlistItem(req.user.user_id, req.params.itemId);
  res.status(204).end();
}
