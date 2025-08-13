// api/submit.js
// Proxy de POST: recebe do front e encaminha ao Apps Script (sem CORS no navegador).

export default async function handler(req, res) {
  // Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*'); // pode restringir ao seu domínio depois
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Lê o corpo enviado pelo front
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const { username, challengeDate, points, attempts, elapsed } = body;

    // URL do Apps Script (defina no Vercel Settings → Environment Variables)
    const APPS_SCRIPT_POST_URL =
      process.env.APPS_SCRIPT_POST_URL ||
      ''; // alternativa: cole a URL aqui como string

    if (!APPS_SCRIPT_POST_URL) {
      return res.status(500).json({ error: 'APPS_SCRIPT_POST_URL não configurada' });
    }

    // Encaminha servidor → servidor (sem CORS)
    const forward = await fetch(APPS_SCRIPT_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, challengeDate, points, attempts, elapsed }),
    });

    const text = await forward.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(forward.ok ? 200 : forward.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
}
