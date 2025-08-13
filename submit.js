// api/submit.js
// Serverless function no Vercel que recebe o POST do seu site
// e encaminha para o Apps Script (sem CORS para o navegador).

module.exports = async (req, res) => {
  // CORS (preflight)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*'); // ou restrinja ao seu domínio
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  // Só aceitamos POST no endpoint
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Permite o front consumir a resposta (não é estritamente necessário
  // já que é mesma origem, mas deixa explícito)
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // 1) Ler o corpo recebido do front
    const { username, challengeDate, points, attempts, elapsed } = req.body || {};

    // 2) URL do seu Apps Script (doPost)
    const APPS_SCRIPT_URL =
      process.env.APPS_SCRIPT_URL ||
      'COLE_AQUI_A_URL_DO_SEU_WEB_APP_DOPOST'; // ex: https://script.google.com/macros/s/AKfycb.../exec

    // 3) Repassar para o Apps Script (servidor → servidor não tem CORS)
    const forward = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, challengeDate, points, attempts, elapsed }),
    });

    // 4) Tentar devolver JSON para o front
    const text = await forward.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(forward.ok ? 200 : forward.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
};
