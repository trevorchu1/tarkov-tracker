import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as ctl from '../controllers/watchlist.controller.js';

const r = Router();
r.get('/', authRequired, ctl.list);
r.post('/', authRequired, ctl.add);
r.delete('/:itemId', authRequired, ctl.remove);
export default r;
