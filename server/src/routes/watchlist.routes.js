import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as ctl from '../controllers/watchlist.controller.js';

const r = Router();
r.get('/', authRequired, ctl.list);
r.post('/', authRequired, ctl.add);
r.put('/:itemId', authRequired, ctl.update);
r.delete('/:itemId', authRequired, ctl.remove);
export default r;
