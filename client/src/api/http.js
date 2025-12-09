const base = import.meta.env.VITE_API_URL;

export function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function get(path, opts={}) {
  const res = await fetch(`${base}${path}`, { ...opts, headers: { ...opts.headers, ...authHeader() } });
  return res.json();
}

export async function post(path, body, opts={}) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function put(path, body, opts={}) {
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function del(path) {
  const res = await fetch(`${base}${path}`, { method: 'DELETE', headers: authHeader() });
  return res.ok;
}
