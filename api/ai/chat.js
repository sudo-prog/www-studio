export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const LLM_BASE_URL = process.env.LLM_BASE_URL || process.env.NEXT_PUBLIC_LLM_BASE_URL || 'http://localhost:8081/v1';
  const LLM_API_KEY = process.env.LLM_API_KEY || process.env.NEXT_PUBLIC_LLM_API_KEY || '';
  const LLM_MODEL = process.env.LLM_MODEL || process.env.NEXT_PUBLIC_LLM_MODEL || 'gemini-3.5-flash';

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const messages = body.messages || [];
  const model = body.model || LLM_MODEL;
  const maxTokens = body.max_tokens || 2048;
  const temperature = body.temperature ?? 0.7;

  try {
    const upstream = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LLM_API_KEY ? { Authorization: `Bearer ${LLM_API_KEY}` } : {}),
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      const msg = data?.error?.message || `Upstream error ${upstream.status}`;
      return res.status(upstream.status).json({ error: msg });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message || 'LLM proxy failed' });
  }
}
