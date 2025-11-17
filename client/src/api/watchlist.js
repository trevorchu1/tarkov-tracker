import { get, post, del } from './http';

export const searchItems = (q) => get(`/market/search?q=${encodeURIComponent(q)}`);
export const getPrices = (id) => get(`/market/prices/${id}`);
export const listWatchlist = () => get('/watchlist');
export const addWatch = (item) => post('/watchlist', item);
export const removeWatch = (itemId) => del(`/watchlist/${itemId}`);
