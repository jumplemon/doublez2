// 改进版 Vercel Serverless Function (api/translate.js)
// 支持多语言翻译，带输入验证和日志

export default async function handler(req, res) {
  // 允许网页的跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { text, target_lang = 'EN-US', source_lang = 'ZH' } = req.body || {};

  // 输入验证
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required and must be a non-empty string' });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: 'text too long (max 5000 characters)' });
  }

  const authKey = process.env.DEEPL_AUTH_KEY;

  if (!authKey) {
    return res.status(500).json({ error: 'Server configuration error: DEEPL_AUTH_KEY not set' });
  }

  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key ${authKey}`
      },
      body: new URLSearchParams({
        text: text.trim(),
        source_lang: source_lang,
        target_lang: target_lang
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('DeepL API error:', data);
      return res.status(response.status).json({ error: data.message || 'Translation failed' });
    }

    res.status(200).json({
      success: true,
      data: data,
      usage: {
        source_lang: source_lang,
        target_lang: target_lang,
        char_count: text.length
      }
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}