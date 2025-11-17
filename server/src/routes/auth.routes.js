import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { authRequired } from '../middleware/auth.js';

const r = Router();
r.post('/register', register);
r.post('/login', login);
r.get('/me', authRequired, me);
export default r;
