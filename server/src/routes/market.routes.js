import { Router } from 'express';
import * as ctl from '../controllers/market.controller.js';
import { authRequired } from '../middleware/auth.js';

const r = Router();
r.get('/search', ctl.searchItems);
r.get('/prices/:itemId', authRequired, ctl.getPricesForItem);
export default r;
