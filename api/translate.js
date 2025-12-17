// Vercel Serverless Function 示例代码 (api/translate.js)
export default async function handler(req, res) {
  // 允许网页的跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text } = req.body;
  // 从环境变量读取密钥，这是最安全的方式
  const authKey = process.env.DEEPL_AUTH_KEY;

  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key ${authKey}`
      },
      body: new URLSearchParams({
        text: text,
        target_lang: 'EN-US'
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}