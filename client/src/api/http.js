const base = import.meta.env.VITE_API_URL;

export function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server may be starting up, please try again');
    }
    throw error;
  }
}

export async function get(path, opts={}) {
  const res = await fetchWithTimeout(`${base}${path}`, { ...opts, headers: { ...opts.headers, ...authHeader() } });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }
  return res.json();
}

export async function post(path, body, opts={}) {
  const res = await fetchWithTimeout(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }
  return res.json();
}

export async function put(path, body, opts={}) {
  const res = await fetchWithTimeout(`${base}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }
  return res.json();
}

export async function del(path) {
  const res = await fetchWithTimeout(`${base}${path}`, { method: 'DELETE', headers: authHeader() });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.ok;
}
