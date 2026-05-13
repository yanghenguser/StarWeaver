// StarWeaver API — Serverless backend for user auth, usage tracking, premium & reading history
// Data stored via GitHub API commits to starweaver-data branch

const GITHUB_TOKEN = process.env.DEEPSEEK_API_KEY; // temp: also used as API key
const GITHUB_OWNER = 'yanghenguser';
const GITHUB_REPO = 'StarWeaver';
const DATA_BRANCH = 'data-store';
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${DATA_BRANCH}/`;

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

// Fetch a file from the data branch
async function fetchData(path) {
  try {
    const res = await fetch(RAW_URL + path);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Commit a file to the data branch via GitHub API
async function commitData(path, content, message) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const body = JSON.stringify(content);
  const encoded = Buffer.from(body).toString('base64');

  // Get existing file SHA if it exists
  let sha = null;
  try {
    const getRes = await fetch(url + `?ref=${DATA_BRANCH}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }
  } catch {}

  // Get or create the branch ref
  try {
    const mainRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/main`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });
    const mainData = await mainRes.json();
    const mainSha = mainData.object.sha;

    // Try to get data branch
    const branchRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/${DATA_BRANCH}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });

    if (!branchRes.ok) {
      // Create branch from main
      await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: `refs/heads/${DATA_BRANCH}`, sha: mainSha })
      });
    }
  } catch {}

  // Commit the file
  const commitBody = {
    message: message || `update ${path}`,
    content: encoded,
    branch: DATA_BRANCH,
  };
  if (sha) commitBody.sha = sha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commitBody)
  });

  return putRes.ok;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  const { action, ...params } = req.method === 'GET' ? req.query : req.body;
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
        // Save user profile
        await commitData(`users/${userId}.json`, user, `register user ${userId}`);
        return res.json({ ok: true, userId, token, user });
      }

      case 'login': {
        const { userId } = params;
        const user = await fetchData(`users/${userId}.json`);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const token = generateToken(userId);
        return res.json({ ok: true, userId, token, user });
      }

      case 'checkUsage': {
        const { userId } = params;
        const today = new Date().toISOString().slice(0, 10);
        const usage = await fetchData(`usage/${userId}_${today}.json`);
        const count = usage?.count || 0;
        const user = await fetchData(`users/${userId}.json`);
        if (user?.premium) return res.json({ ok: true, remaining: -1, premium: true });
        return res.json({ ok: true, remaining: Math.max(0, 3 - count), count, premium: false });
      }

      case 'trackUsage': {
        const { userId } = params;
        const today = new Date().toISOString().slice(0, 10);
        const key = `usage/${userId}_${today}.json`;
        const existing = await fetchData(key);
        const count = (existing?.count || 0) + 1;
        await commitData(key, { userId, date: today, count }, `track usage ${userId} ${today}`);
        return res.json({ ok: true, count, remaining: Math.max(0, 3 - count) });
      }

      case 'unlockPremium': {
        const { userId, code } = params;
        if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Code required' });
        const trimmed = code.trim().toUpperCase();
        if (!/^SW-[A-Z0-9]{8}$/.test(trimmed)) return res.status(400).json({ error: 'Invalid code format' });
        const user = await fetchData(`users/${userId}.json`);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.premium = true;
        user.premiumCode = trimmed;
        user.premiumAt = new Date().toISOString();
        await commitData(`users/${userId}.json`, user, `premium upgrade ${userId}`);
        return res.json({ ok: true, premium: true });
      }

      case 'saveReading': {
        const { userId, type, content } = params;
        if (!userId || !type || !content) return res.status(400).json({ error: 'Missing fields' });
        const id = 'reading_' + Date.now();
        const reading = { id, userId, type, content, createdAt: new Date().toISOString() };
        const history = (await fetchData(`history/${userId}.json`)) || { userId, readings: [] };
        history.readings.unshift(reading);
        if (history.readings.length > 100) history.readings = history.readings.slice(0, 100);
        await commitData(`history/${userId}.json`, history, `save reading ${id}`);
        return res.json({ ok: true, readingId: id });
      }

      case 'getHistory': {
        const { userId } = params;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const history = await fetchData(`history/${userId}.json`);
        return res.json({ ok: true, readings: history?.readings || [] });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
