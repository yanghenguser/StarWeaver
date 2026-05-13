// StarWeaver API — Serverless backend for user auth, usage tracking, premium & reading history
// Data stored via Upstash Redis REST API

const ADMIN_PASSWORD = 'starweaver2024';

// Verify Redis on cold start
if (process.env.UPSTASH_REDIS_REST_URL) {
  fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(['PING'])
  }).then(r => r.json()).then(d => {
    if (d.result === 'PONG') console.log('Redis connected');
    else console.warn('Redis PING unexpected:', JSON.stringify(d));
  }).catch(e => console.warn('Redis unavailable:', e.message));
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };
}

function error(status, msg) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: corsHeaders()
  });
}

function success(data) {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: 200, headers: corsHeaders()
  });
}

// Generate a simple session token
function generateToken(userId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return `sw_${userId}_${token}`;
}

// Upstash Redis REST helper — single command
async function upstashFetch(command, ...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify([command, ...args])
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// Upstash Redis REST pipeline — array of commands
async function upstashPipeline(commands) {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) throw new Error('Redis not configured');
  // Pipeline endpoint: add /pipeline to base URL
  const url = baseUrl.replace(/\/+$/, '') + '/pipeline';
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(commands)
  });
  if (!res.ok) throw new Error(`Redis pipeline error: ${res.status}`);
  return await res.json();
}

function adminCheck(token) {
  return token && typeof token === 'string' && token.startsWith('admin_token_');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  // Parse action from query (GET) or body (POST)
  let action, params = {};
  if (req.method === 'GET') {
    action = req.query?.action;
    params = req.query || {};
  } else if (req.body && typeof req.body === 'object') {
    action = req.body.action;
    params = req.body;
  } else {
    return res.status(400).json({ error: 'Invalid request body. Send JSON with action field.' });
  }
  if (!action) {
    return res.json({
      ok: true, service: 'StarWeaver API', version: '1.0.0',
      endpoints: ['register', 'login', 'checkUsage', 'trackUsage', 'unlockPremium', 'redeemCode', 'generateCode', 'listCodes', 'saveReading', 'getHistory'],
      usage: 'POST JSON with {action, ...params} to this endpoint'
    });
  }
  const headers = corsHeaders();
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    switch (action) {
      case 'register': {
        const { name, email } = params;
        if (!name) return res.status(400).json({ error: 'Name required' });
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const user = { userId, name, email: email || '', createdAt: new Date().toISOString(), premium: false };
        const token = generateToken(userId);
        await upstashPipeline([
          ['SET', `user:${userId}`, JSON.stringify(user)],
          ['SADD', 'users:set', userId]
        ]);
        return res.json({ ok: true, userId, token, user });
      }

      case 'login': {
        const { userId } = params;
        const userJson = await upstashFetch('GET', `user:${userId}`);
        if (!userJson) return res.status(404).json({ error: 'User not found' });
        const user = JSON.parse(userJson);
        const token = generateToken(userId);
        return res.json({ ok: true, userId, token, user });
      }

      case 'checkUsage': {
        const { userId } = params;
        const usageJson = await upstashFetch('GET', `usage:${userId}:total`);
        const count = usageJson ? (JSON.parse(usageJson).count || 0) : 0;
        const userJson = await upstashFetch('GET', `user:${userId}`);
        const user = userJson ? JSON.parse(userJson) : null;
        if (user?.premium) return res.json({ ok: true, remaining: -1, used: 0, premium: true });
        return res.json({ ok: true, remaining: Math.max(0, 3 - count), used: count, premium: false });
      }

      case 'trackUsage': {
        const { userId } = params;
        const key = `usage:${userId}:total`;
        const usageJson = await upstashFetch('GET', key);
        const count = usageJson ? (JSON.parse(usageJson).count || 0) : 0;
        const userJson = await upstashFetch('GET', `user:${userId}`);
        const user = userJson ? JSON.parse(userJson) : null;
        if (user?.premium) return res.json({ ok: true, count, remaining: -1, premium: true });
        if (count >= 3) return res.status(403).json({ error: 'free_used' });
        const newCount = count + 1;
        await upstashFetch('SET', key, JSON.stringify({ userId, count: newCount }));
        return res.json({ ok: true, count: newCount, remaining: Math.max(0, 3 - newCount) });
      }

      case 'unlockPremium': {
        const { userId, code } = params;
        if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Code required' });
        const trimmed = code.trim().toUpperCase();
        if (!/^SW-[A-Z0-9]{8}$/.test(trimmed)) return res.status(400).json({ error: 'Invalid code format' });
        const userJson = await upstashFetch('GET', `user:${userId}`);
        if (!userJson) return res.status(404).json({ error: 'User not found' });
        const user = JSON.parse(userJson);
        user.premium = true;
        user.premiumCode = trimmed;
        user.premiumAt = new Date().toISOString();
        await upstashFetch('SET', `user:${userId}`, JSON.stringify(user));
        return res.json({ ok: true, premium: true });
      }

      case 'redeemCode': {
        const { userId, code } = params;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Code required' });
        const trimmed = code.trim().toUpperCase();
        const codeJson = await upstashFetch('GET', `codes:${trimmed}`);
        if (!codeJson || codeJson !== 'active') return res.status(400).json({ error: 'Invalid or used code' });
        const userJson = await upstashFetch('GET', `user:${userId}`);
        if (!userJson) return res.status(404).json({ error: 'User not found' });
        const user = JSON.parse(userJson);
        user.premium = true;
        user.premiumCode = trimmed;
        user.premiumAt = new Date().toISOString();
        const now = Date.now();
        await upstashPipeline([
          ['SET', `user:${userId}`, JSON.stringify(user)],
          ['SET', `codes:${trimmed}`, `${userId}:${now}`]
        ]);
        return res.json({ ok: true, premium: true });
      }

      case 'generateCode': {
        if (!adminCheck(params.adminToken)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        await upstashPipeline([
          ['SADD', 'codes:set', code],
          ['SET', `codes:${code}`, 'active']
        ]);
        return res.json({ ok: true, code });
      }

      case 'listCodes': {
        if (!adminCheck(params.adminToken)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const allCodes = await upstashFetch('SMEMBERS', 'codes:set');
        if (!allCodes || !Array.isArray(allCodes)) return res.json({ ok: true, codes: [] });
        const pipelineCmds = allCodes.map(c => ['GET', `codes:${c}`]);
        const results = await upstashPipeline(pipelineCmds);
        const codes = allCodes.map((c, i) => ({
          code: c,
          status: results[i]?.result || 'unknown'
        }));
        return res.json({ ok: true, codes });
      }

      case 'saveReading': {
        const { userId, type, content } = params;
        if (!userId || !type || !content) return res.status(400).json({ error: 'Missing fields' });
        const id = 'reading_' + Date.now();
        const reading = { id, userId, type, content, createdAt: new Date().toISOString() };
        await upstashPipeline([
          ['LPUSH', `history:${userId}`, JSON.stringify(reading)],
          ['LTRIM', `history:${userId}`, '0', '99']
        ]);
        return res.json({ ok: true, readingId: id });
      }

      case 'getHistory': {
        const { userId } = params;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const readings = await upstashFetch('LRANGE', `history:${userId}`, '0', '-1');
        return res.json({ ok: true, readings: readings ? readings.map(r => JSON.parse(r)) : [] });
      }

      case 'adminLogin': {
        const { password } = params;
        if (password === ADMIN_PASSWORD) {
          const token = 'admin_token_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
          return res.json({ ok: true, token });
        }
        return res.status(401).json({ error: 'Invalid password' });
      }

      case 'adminGetUsers': {
        if (!adminCheck(params.adminToken)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const userIds = await upstashFetch('SMEMBERS', 'users:set');
        if (!userIds || !Array.isArray(userIds)) return res.json({ ok: true, users: [] });
        const pipelineCmds = userIds.map(uid => ['GET', `user:${uid}`]);
        const userResults = await upstashPipeline(pipelineCmds);
        const userList = userResults
          .map(r => { try { return r.result ? JSON.parse(r.result) : null; } catch { return null; } })
          .filter(Boolean);
        userList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return res.json({ ok: true, users: userList });
      }

      case 'logAICall': {
        const { userId, type, prompt, response } = params;
        if (!type || !prompt) return res.status(400).json({ error: 'type and prompt required' });
        const ts = Date.now();
        const uid = userId || 'anonymous';
        const log = { userId: uid, type, prompt, response: response || '', timestamp: new Date().toISOString() };
        await upstashPipeline([
          ['SET', `ailog:${ts}:${uid}`, JSON.stringify(log)],
          ['ZADD', 'ailogs:zset', String(ts), `${ts}:${uid}`]
        ]);
        return res.json({ ok: true });
      }

      case 'adminGetLogs': {
        if (!adminCheck(params.adminToken)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const logEntries = await upstashFetch('ZREVRANGE', 'ailogs:zset', '0', '49');
        if (!logEntries || !Array.isArray(logEntries)) return res.json({ ok: true, logs: [] });
        const pipelineCmds = logEntries.map(entry => ['GET', `ailog:${entry}`]);
        const logResults = await upstashPipeline(pipelineCmds);
        const allLogs = logResults
          .map(r => { try { return r.result ? JSON.parse(r.result) : null; } catch { return null; } })
          .filter(Boolean);
        allLogs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        return res.json({ ok: true, logs: allLogs });
      }

      case 'getCompatibility': {
        const { sign1, sign2, name1, name2 } = params;
        if (!sign1 || !sign2) return res.status(400).json({ error: 'Two signs required' });

        const elementMap = {
          '白羊': 'fire', '狮子': 'fire', '射手': 'fire',
          '金牛': 'earth', '处女': 'earth', '摩羯': 'earth',
          '双子': 'air', '天秤': 'air', '水瓶': 'air',
          '巨蟹': 'water', '天蝎': 'water', '双鱼': 'water'
        };
        const complementMap = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };

        const el1 = elementMap[sign1];
        const el2 = elementMap[sign2];
        if (!el1 || !el2) return res.status(400).json({ error: 'Invalid sign names' });

        let score;
        let label;
        if (el1 === el2) {
          score = 75 + Math.floor(Math.random() * 21);
          label = 'Same element - natural harmony';
        } else if (complementMap[el1] === el2) {
          score = 55 + Math.floor(Math.random() * 26);
          label = 'Complementary elements - balanced';
        } else {
          score = 25 + Math.floor(Math.random() * 36);
          label = 'Dynamic tension - growth opportunity';
        }

        const description = `${name1 || sign1} (${sign1}) + ${name2 || sign2} (${sign2}) — ${label}`;

        let reading = '';
        try {
          const apiKey = process.env.DEEPSEEK_API_KEY;
          if (apiKey) {
            const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
              body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                  { role: 'system', content: '你是一位专业的星座配对占星师。用中文提供详细的星座配对分析，包括性格契合度、优势、挑战和相处建议。语气温暖富有洞察力。' },
                  { role: 'user', content: `分析${sign1}（${name1 || 'Person 1'}）和${sign2}（${name2 || 'Person 2'}）的爱情配对兼容性。` }
                ],
                temperature: 0.7,
                max_tokens: 800
              })
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              reading = aiData.choices?.[0]?.message?.content || '';
            }
          }
        } catch (e) { /* AI reading optional */ }

        return res.json({ ok: true, score, description, reading });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
