import { post, get } from './http';
export const login = (email, password) => post('/auth/login', { email, password });
export const register = (email, password) => post('/auth/register', { email, password });
export const me = () => get('/auth/me');
