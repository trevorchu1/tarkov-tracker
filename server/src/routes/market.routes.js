import { Router } from 'express';
import * as ctl from '../controllers/market.controller.js';
import { authRequired } from '../middleware/auth.js';

const r = Router();
r.get('/search', ctl.searchItems);
r.get('/prices/:itemId', authRequired, ctl.getPricesForItem);
r.get('/prices/:itemId/history', ctl.getPriceHistoryForItem);
r.get('/prices/:itemId/history/aggregated', ctl.getAggregatedPriceHistoryForItem);
export default r;
