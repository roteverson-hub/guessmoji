// api/challenge.js
// Proxy de GET: pega o desafio do dia do Apps Script (sem CORS no navegador).

export default async function handler(req, res) {
  // Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // URL do Apps Script (GET) — defina no Vercel Settings → Environment Variables
    const APPS_SCRIPT_GET_URL =
      process.env.APPS_SCRIPT_GET_URL ||
      ''; // alternativa: cole a URL aqui como string

    if (!APPS_SCRIPT_GET_URL) {
      return res.status(500).json({ error: 'APPS_SCRIPT_GET_URL não configurada' });
    }

    const fwd = await fetch(APPS_SCRIPT_GET_URL);
    const text = await fwd.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(fwd.ok ? 200 : fwd.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
}
