export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  return res.status(501).json({ error: 'Not Implemented', note: 'Wire backend here' })
}
