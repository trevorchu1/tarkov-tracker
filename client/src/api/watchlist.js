import { get, post, put, del } from './http';

export const searchItems = (q) => get(`/market/search?q=${encodeURIComponent(q)}`);
export const getPrices = (id) => get(`/market/prices/${id}`);
export const getPriceHistory = (id, days = 7) => get(`/market/prices/${id}/history?days=${days}`);
export const getAggregatedPriceHistory = (id, days = 7) => get(`/market/prices/${id}/history/aggregated?days=${days}`);
export const listWatchlist = () => get('/watchlist');
export const addWatch = (item) => post('/watchlist', item);
export const updateWatch = (itemId, updates) => put(`/watchlist/${itemId}`, updates);
export const removeWatch = (itemId) => del(`/watchlist/${itemId}`);
export const getTraders = () => get('/traders');
export const getTraderItems = (traderId, limit = 5000) => get(`/traders/${traderId}/items?limit=${limit}`);
export const getTraderBarters = (traderId, limit = 100) => get(`/traders/${traderId}/barters?limit=${limit}`);
