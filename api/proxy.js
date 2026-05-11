// StarWeaver - Vercel Serverless API Proxy
// API Key 存在 Vercel 环境变量里，永不暴露到前端
// 在 Vercel Dashboard 设置环境变量: DEEPSEEK_API_KEY=sk-your-key

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 从 Vercel 环境变量读取 API Key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Server not configured',
      hint: '请在 Vercel Dashboard 设置 DEEPSEEK_API_KEY 环境变量'
    });
  }

  try {
    const body = req.body;

    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || 'deepseek-chat',
        messages: body.messages,
        temperature: body.temperature ?? 0.8,
        max_tokens: body.max_tokens ?? 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ 
        error: `DeepSeek API Error (${response.status})`,
        detail: err 
      });
    }

    const data = await response.json();
    
    // 返回兼容格式
    return res.status(200).json({
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    });

  } catch (err) {
    return res.status(500).json({ 
      error: 'Proxy error',
      detail: err.message 
    });
  }
}
