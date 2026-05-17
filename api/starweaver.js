// StarWeaver API — Serverless backend v2: email verification, credit system, premium codes
// Data stored via Upstash Redis REST API

const ADMIN_PASSWORD = 'starweaver2024';
const FREE_BASE_CREDITS = 3;

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
  return new Response(JSON.stringify({ error: msg }), { status, headers: corsHeaders() });
}

function success(data) {
  return new Response(JSON.stringify({ ok: true, ...data }), { status: 200, headers: corsHeaders() });
}

function generateToken(userId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return `sw_${userId}_${token}`;
}

function generateUserId() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `SW${ts}${rnd}`.toUpperCase();
}

function generateVerifyCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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

async function upstashPipeline(commands) {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) throw new Error('Redis not configured');
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

function getZodiacSignFromDate(month, day) {
  const boundaries = [
    { sign: 'Capricorn', start: [1,1], end: [1,19] },
    { sign: 'Aquarius', start: [1,20], end: [2,18] },
    { sign: 'Pisces', start: [2,19], end: [3,20] },
    { sign: 'Aries', start: [3,21], end: [4,19] },
    { sign: 'Taurus', start: [4,20], end: [5,20] },
    { sign: 'Gemini', start: [5,21], end: [6,20] },
    { sign: 'Cancer', start: [6,21], end: [7,22] },
    { sign: 'Leo', start: [7,23], end: [8,22] },
    { sign: 'Virgo', start: [8,23], end: [9,22] },
    { sign: 'Libra', start: [9,23], end: [10,22] },
    { sign: 'Scorpio', start: [10,23], end: [11,21] },
    { sign: 'Sagittarius', start: [11,22], end: [12,21] },
    { sign: 'Capricorn', start: [12,22], end: [12,31] },
  ];
  for (const b of boundaries) {
    const [sm, sd] = b.start;
    const [em, ed] = b.end;
    if ((month === sm && day >= sd) || (month === em && day <= ed)) return b.sign;
  }
  return 'Aries';
}

// Also return zodiac index (0-11) for frontend use
function getZodiacIndex(month, day) {
  const sign = getZodiacSignFromDate(month, day);
  const map = { 'Aries':0,'Taurus':1,'Gemini':2,'Cancer':3,'Leo':4,'Virgo':5,'Libra':6,'Scorpio':7,'Sagittarius':8,'Capricorn':9,'Aquarius':10,'Pisces':11 };
  return map[sign] !== undefined ? map[sign] : 0;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

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
      ok: true, service: 'StarWeaver API', version: '2.0.0',
      endpoints: ['sendVerifyCode','verifyEmail','register','login','updateProfile','checkUsage','trackUsage','redeemCode','generateCode','listCodes','saveReading','getHistory'],
      usage: 'POST JSON with {action, ...params} to this endpoint'
    });
  }
  const headers = corsHeaders();
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    switch (action) {

      // ===== Send Email Verification Code =====
      case 'sendVerifyCode': {
        const { email } = params;
        if (!email || typeof email !== 'string' || !email.includes('@'))
          return res.status(400).json({ error: 'Valid email required' });
        const emailKey = email.trim().toLowerCase();
        // Check if already registered
        const existing = await upstashFetch('GET', `email:${emailKey}`);
        if (existing) return res.status(409).json({ error: 'Email already registered' });
        // Rate limit: 3 per 10 min
        const rateKey = `verify:rate:${emailKey}`;
        const rateCount = await upstashFetch('GET', rateKey);
        if (rateCount && parseInt(rateCount) >= 3)
          return res.status(429).json({ error: 'Too many attempts. Please wait 10 minutes.' });
        const code = generateVerifyCode();
        const verifyKey = `verify:${emailKey}`;
        await upstashPipeline([
          ['SET', verifyKey, JSON.stringify({ code, createdAt: Date.now() })],
          ['EXPIRE', verifyKey, '300'],
          ['INCR', rateKey],
          ['EXPIRE', rateKey, '600']
        ]);
        // Try sending email via Resend if configured
        let emailSent = false;
        if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
          try {
            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM,
                to: emailKey,
                subject: 'StarWeaver - Verification Code / 验证码',
                html: `<div style="text-align:center;font-family:sans-serif;background:#0a0a1a;color:#e8e0f0;padding:40px;border-radius:16px;">
                  <h2 style="color:#d4af37;">✦ StarWeaver · 星织者 ✦</h2>
                  <p style="margin:20px 0;">Your verification code / 你的验证码:</p>
                  <h1 style="font-size:2.5rem;letter-spacing:0.3em;color:#d4af37;margin:20px 0;">${code}</h1>
                  <p style="color:#888;font-size:0.85rem;">Valid for 5 minutes / 5分钟内有效</p>
                </div>`
              })
            });
            if (emailRes.ok) emailSent = true;
            else console.warn('Resend email failed:', await emailRes.text());
          } catch (e) { console.warn('Email service unavailable:', e.message); }
        }
        // Return code if email not sent (no Resend configured or send failed)
        return res.json({ ok: true, message: emailSent ? 'Verification code sent to email' : 'Verification code generated (check Resend config)', code: emailSent ? undefined : code, emailSent });
      }

      // ===== Verify Email Code =====
      case 'verifyEmail': {
        const { email, code } = params;
        if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
        const emailKey = email.trim().toLowerCase();
        const dataJson = await upstashFetch('GET', `verify:${emailKey}`);
        if (!dataJson) return res.status(400).json({ error: 'Code expired or not found' });
        let data;
        try { data = JSON.parse(dataJson); } catch { return res.status(400).json({ error: 'Invalid data' }); }
        if (data.code !== String(code).trim()) return res.status(400).json({ error: 'Incorrect code' });
        await upstashFetch('DEL', `verify:${emailKey}`);
        return res.json({ ok: true, verified: true });
      }

      // ===== Register (after email verification) =====
      case 'register': {
        const { name, email, birthYear, birthMonth, birthDay, birthHour, birthplace } = params;
        if (!name) return res.status(400).json({ error: 'Name required' });
        const emailKey = (email || '').trim().toLowerCase();
        // Check if email already registered
        if (emailKey) {
          const existUid = await upstashFetch('GET', `email:${emailKey}`);
          if (existUid) return res.status(409).json({ error: 'Email already registered' });
        }
        const userId = generateUserId();
        let zodiacSign = null;
        let zodiacIndex = null;
        if (birthMonth && birthDay) {
          zodiacSign = getZodiacSignFromDate(parseInt(birthMonth), parseInt(birthDay));
          zodiacIndex = getZodiacIndex(parseInt(birthMonth), parseInt(birthDay));
        }
        const user = {
          userId, name: name.trim(), email: emailKey,
          birthYear: birthYear || null, birthMonth: birthMonth || null,
          birthDay: birthDay || null, birthHour: birthHour || null,
          birthplace: birthplace || '',
          zodiacSign, zodiacIndex,
          freeCredits: FREE_BASE_CREDITS, premium: false,
          createdAt: new Date().toISOString(),
        };
        const token = generateToken(userId);
        const pipelineCmds = [
          ['SET', `user:${userId}`, JSON.stringify(user)],
          ['SADD', 'users:set', userId]
        ];
        if (emailKey) pipelineCmds.push(['SET', `email:${emailKey}`, userId]);
        await upstashPipeline(pipelineCmds);
        return res.json({ ok: true, userId, token, user });
      }

      // ===== Login =====
      case 'login': {
        const { userId, email, name } = params;
        let uid = userId;
        if (!uid && email) {
          const emailKey = email.trim().toLowerCase();
          uid = await upstashFetch('GET', `email:${emailKey}`);
          if (!uid) return res.status(404).json({ error: 'EMAIL_NOT_FOUND' });
        }
        if (!uid) return res.status(400).json({ error: 'userId or email required' });
        const userJson = await upstashFetch('GET', `user:${uid}`);
        if (!userJson) return res.status(404).json({ error: 'User not found' });
        const user = JSON.parse(userJson);

        // If name provided, verify it matches
        if (name && typeof name === 'string' && name.trim()) {
          const storedName = (user.name || '').trim().toLowerCase();
          const inputName = name.trim().toLowerCase();
          if (storedName !== inputName) {
            return res.status(401).json({ error: 'NAME_MISMATCH', message: 'Name does not match our records' });
          }
        }

        const token = generateToken(uid);
        return res.json({ ok: true, userId: uid, token, user });
      }

      // ===== Update Profile =====
      case 'updateProfile': {
        const { userId, name, birthYear, birthMonth, birthDay, birthHour, birthplace } = params;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const userJson = await upstashFetch('GET', `user:${userId}`);
        if (!userJson) return res.status(404).json({ error: 'User not found' });
        const user = JSON.parse(userJson);
        if (name !== undefined) user.name = name;
        if (birthYear !== undefined) user.birthYear = birthYear;
        if (birthMonth !== undefined) user.birthMonth = birthMonth;
        if (birthDay !== undefined) user.birthDay = birthDay;
        if (birthHour !== undefined) user.birthHour = birthHour;
        if (birthplace !== undefined) user.birthplace = birthplace;
        if (user.birthMonth && user.birthDay) {
          user.zodiacSign = getZodiacSignFromDate(parseInt(user.birthMonth), parseInt(user.birthDay));
          user.zodiacIndex = getZodiacIndex(parseInt(user.birthMonth), parseInt(user.birthDay));
        }
        user.updatedAt = new Date().toISOString();
        await upstashFetch('SET', `user:${userId}`, JSON.stringify(user));
        return res.json({ ok: true, user });
      }

      // ===== Check AI Usage =====
      case 'checkUsage': {
        const { userId } = params;
        const userJson = await upstashFetch('GET', `user:${userId}`);
        const user = userJson ? JSON.parse(userJson) : null;
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.premium) return res.json({ ok: true, remaining: -1, used: 0, premium: true, totalCredits: -1 });
        const usageJson = await upstashFetch('GET', `usage:${userId}:count`);
        const used = usageJson ? parseInt(usageJson) : 0;
        const totalCredits = (user.freeCredits || FREE_BASE_CREDITS);
        const remaining = Math.max(0, totalCredits - used);
        return res.json({ ok: true, remaining, used, premium: false, totalCredits });
      }

      // ===== Track AI Usage =====
      case 'trackUsage': {
        const { userId } = params;
        const userJson = await upstashFetch('GET', `user:${userId}`);
        const user = userJson ? JSON.parse(userJson) : null;
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.premium) return res.json({ ok: true, used: -1, remaining: -1, premium: true });
        const usageKey = `usage:${userId}:count`;
        const usedStr = await upstashFetch('GET', usageKey);
        const used = usedStr ? parseInt(usedStr) : 0;
        const totalCredits = (user.freeCredits || FREE_BASE_CREDITS);
        if (used >= totalCredits) return res.status(403).json({ error: 'free_used', used, totalCredits, remaining: 0 });
        const newCount = used + 1;
        await upstashFetch('SET', usageKey, String(newCount));
        return res.json({ ok: true, used: newCount, remaining: Math.max(0, totalCredits - newCount), totalCredits, premium: false });
      }

      // ===== Redeem Code (premium or credits) =====
      case 'redeemCode': {
        const { userId, code } = params;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Code required' });
        const trimmed = code.trim().toUpperCase();
        const raw = await upstashFetch('GET', `codes:${trimmed}`);
        if (!raw) return res.status(400).json({ error: 'Invalid code' });
        let codeData;
        try { codeData = JSON.parse(raw); } catch {
          if (raw === 'active') { codeData = { type: 'premium' }; }
          else return res.status(400).json({ error: 'Code already used' });
        }
        if (codeData.status === 'used') return res.status(400).json({ error: 'Code already used' });
        if (codeData.type === 'credits') {
          if ((codeData.usageCount || 0) >= (codeData.maxUses || 1))
            return res.status(400).json({ error: 'Code fully used' });
        }
        const userJson = await upstashFetch('GET', `user:${userId}`);
        if (!userJson) return res.status(404).json({ error: 'User not found' });
        const user = JSON.parse(userJson);
        const now = Date.now();
        if (codeData.type === 'premium') {
          user.premium = true; user.premiumCode = trimmed; user.premiumAt = new Date().toISOString();
          codeData.status = 'used'; codeData.usedBy = `${userId}:${now}`; codeData.usedAt = new Date().toISOString();
          await upstashPipeline([['SET', `user:${userId}`, JSON.stringify(user)], ['SET', `codes:${trimmed}`, JSON.stringify(codeData)]]);
          return res.json({ ok: true, premium: true, type: 'premium', message: 'Premium unlocked!' });
        } else if (codeData.type === 'credits') {
          const creditsToAdd = codeData.credits || 10;
          user.freeCredits = (user.freeCredits || FREE_BASE_CREDITS) + creditsToAdd;
          codeData.usageCount = (codeData.usageCount || 0) + 1;
          codeData.usedByList = codeData.usedByList || [];
          codeData.usedByList.push({ userId, at: new Date().toISOString() });
          if (codeData.usageCount >= (codeData.maxUses || 1)) codeData.status = 'used';
          await upstashPipeline([['SET', `user:${userId}`, JSON.stringify(user)], ['SET', `codes:${trimmed}`, JSON.stringify(codeData)]]);
          return res.json({ ok: true, type: 'credits', creditsAdded: creditsToAdd, totalCredits: user.freeCredits, message: `${creditsToAdd} AI credits added!` });
        }
        return res.status(400).json({ error: 'Unknown code type' });
      }

      // ===== Generate Code (Admin) =====
      case 'generateCode': {
        if (!adminCheck(params.adminToken)) return res.status(401).json({ error: 'Unauthorized' });
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        const codeType = params.codeType || 'premium';
        const credits = parseInt(params.credits) || 10;
        const maxUses = parseInt(params.maxUses) || 1;
        const codeData = { type: codeType, status: 'active', createdAt: new Date().toISOString() };
        if (codeType === 'credits') {
          codeData.credits = credits;
          codeData.maxUses = maxUses > 0 ? maxUses : 999999;
          codeData.usageCount = 0;
          codeData.usedByList = [];
        }
        await upstashPipeline([['SADD', 'codes:set', code], ['SET', `codes:${code}`, JSON.stringify(codeData)]]);
        return res.json({ ok: true, code, codeData });
      }

      // ===== List Codes (Admin) =====
      case 'listCodes': {
        if (!adminCheck(params.adminToken)) return res.status(401).json({ error: 'Unauthorized' });
        const allCodes = await upstashFetch('SMEMBERS', 'codes:set');
        if (!allCodes || !Array.isArray(allCodes)) return res.json({ ok: true, codes: [] });
        const pipelineCmds = allCodes.map(c => ['GET', `codes:${c}`]);
        const results = await upstashPipeline(pipelineCmds);
        const codes = allCodes.map((c, i) => {
          const raw = results[i]?.result;
          let data = {};
          try { if (raw) data = JSON.parse(raw); else data = { status: 'unknown' }; }
          catch { data = { status: raw || 'unknown' }; }
          return {
            code: c, type: data.type || 'premium', status: data.status || 'unknown',
            credits: data.credits, maxUses: data.maxUses, usageCount: data.usageCount || 0,
            usedBy: data.usedBy || '', usedAt: data.usedAt || '', createdAt: data.createdAt || '',
          };
        });
        return res.json({ ok: true, codes });
      }

      // ===== Save Reading =====
      case 'saveReading': {
        const { userId, type, content } = params;
        if (!userId || !type || !content) return res.status(400).json({ error: 'Missing fields' });
        const id = 'reading_' + Date.now();
        const reading = { id, userId, type, content, createdAt: new Date().toISOString() };
        await upstashPipeline([['LPUSH', `history:${userId}`, JSON.stringify(reading)], ['LTRIM', `history:${userId}`, '0', '99']]);
        return res.json({ ok: true, readingId: id });
      }

      // ===== Get History =====
      case 'getHistory': {
        const { userId } = params;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const readings = await upstashFetch('LRANGE', `history:${userId}`, '0', '-1');
        return res.json({ ok: true, readings: readings ? readings.map(r => JSON.parse(r)) : [] });
      }

      // ===== Admin Login =====
      case 'adminLogin': {
        if (params.password === ADMIN_PASSWORD)
          return res.json({ ok: true, token: 'admin_token_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) });
        return res.status(401).json({ error: 'Invalid password' });
      }

      // ===== Admin: Get Users =====
      case 'adminGetUsers': {
        if (!adminCheck(params.adminToken)) return res.status(401).json({ error: 'Unauthorized' });
        const userIds = await upstashFetch('SMEMBERS', 'users:set');
        if (!userIds || !Array.isArray(userIds)) return res.json({ ok: true, users: [] });
        const pipelineCmds = userIds.map(uid => ['GET', `user:${uid}`]);
        const userResults = await upstashPipeline(pipelineCmds);
        const userList = userResults.map(r => { try { return r.result ? JSON.parse(r.result) : null; } catch { return null; } }).filter(Boolean);
        userList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return res.json({ ok: true, users: userList });
      }

      // ===== Log AI Call =====
      case 'logAICall': {
        const { userId, type, prompt, response } = params;
        if (!type || !prompt) return res.status(400).json({ error: 'type and prompt required' });
        const ts = Date.now();
        const uid = userId || 'anonymous';
        const log = { userId: uid, type, prompt, response: response || '', timestamp: new Date().toISOString() };
        await upstashPipeline([['SET', `ailog:${ts}:${uid}`, JSON.stringify(log)], ['ZADD', 'ailogs:zset', String(ts), `${ts}:${uid}`]]);
        return res.json({ ok: true });
      }

      // ===== Admin: Get Logs =====
      case 'adminGetLogs': {
        if (!adminCheck(params.adminToken)) return res.status(401).json({ error: 'Unauthorized' });
        const logEntries = await upstashFetch('ZREVRANGE', 'ailogs:zset', '0', '49');
        if (!logEntries || !Array.isArray(logEntries)) return res.json({ ok: true, logs: [] });
        const pipelineCmds = logEntries.map(entry => ['GET', `ailog:${entry}`]);
        const logResults = await upstashPipeline(pipelineCmds);
        const allLogs = logResults.map(r => { try { return r.result ? JSON.parse(r.result) : null; } catch { return null; } }).filter(Boolean);
        allLogs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        return res.json({ ok: true, logs: allLogs });
      }

      // ===== Legacy compatibility =====
      case 'getCompatibility':
      case 'unlockPremium': {
        return res.json({ ok: true, score: 50, description: 'Use redeemCode instead' });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error', detail: e.message });
  }
}
