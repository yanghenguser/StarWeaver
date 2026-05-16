/* ============================================
   StarWeaver - user.js v2
   User System + Email Verify + Profile Auto-fill + Credit Tracking
   API-first with localStorage cache, IIFE pattern
   ============================================ */

const User = (() => {
  'use strict';

  const KEYS = {
    userId: 'starweaver_userId',
    token: 'starweaver_token',
    profile: 'starweaver_user',
    premium: 'starweaver_premium',
    credits: 'starweaver_credits',  // Store total credits locally
  };

  const FREE_TOTAL_LIMIT = 3;

  let lang = navigator.language.startsWith('zh') ? 'zh' : 'en';
  let _pendingEmail = null;
  let _pendingVerifyCode = null;

  // ===== Bilingual Helper =====
  function t(en, zh) {
    return lang === 'zh' ? zh : en;
  }

  function setLanguage(l) {
    lang = l;
  }

  // ===== Internal Helpers =====
  function getUserId() {
    try { return localStorage.getItem(KEYS.userId); } catch (e) { return null; }
  }

  function getToken() {
    try { return localStorage.getItem(KEYS.token); } catch (e) { return null; }
  }

  function isPremiumSync() {
    try { return localStorage.getItem(KEYS.premium) === 'true'; } catch (e) { return false; }
  }

  function getCachedCredits() {
    try { const v = localStorage.getItem(KEYS.credits); return v ? parseInt(v) : FREE_TOTAL_LIMIT; } catch (e) { return FREE_TOTAL_LIMIT; }
  }

  function setCachedCredits(n) {
    try { localStorage.setItem(KEYS.credits, String(n)); } catch (e) { /* silent */ }
  }

  // ===== Profile (localStorage cache) =====
  function getProfile() {
    try {
      const data = localStorage.getItem(KEYS.profile);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(KEYS.profile, JSON.stringify(profile));
    } catch (e) { /* silent */ }
  }

  // ===== Get birth info from profile for auto-fill =====
  function getBirthInfo() {
    const profile = getProfile();
    if (!profile) return null;
    return {
      name: profile.name || '',
      year: profile.birthYear || null,
      month: profile.birthMonth || null,
      day: profile.birthDay || null,
      hour: profile.birthHour || null,
      birthplace: profile.birthplace || '',
      zodiacSign: profile.zodiacSign || null,
      zodiacIndex: profile.zodiacIndex !== undefined ? profile.zodiacIndex : null,
    };
  }

  // ===== Email Verification =====
  async function sendVerifyCode(email) {
    const emailKey = email.trim().toLowerCase();

    // Offline / local mode — always simulate
    if (typeof Api === 'undefined') {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      _pendingEmail = emailKey;
      _pendingVerifyCode = code;
      return { ok: true, code, fallback: true };
    }

    try {
      // Add timeout: if API doesn't respond in 8s, fall back to simulated code
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const result = await Api.sendVerifyCode(email, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (result.ok) {
        _pendingEmail = emailKey;
        if (result.code) _pendingVerifyCode = result.code;
        return result;
      }
      return { ok: false, error: result.error || 'Failed to send code' };
    } catch (e) {
      // API unreachable — fall back to simulated code
      console.warn('API sendVerifyCode failed, using fallback:', e.message);
      const code = String(Math.floor(100000 + Math.random() * 900000));
      _pendingEmail = emailKey;
      _pendingVerifyCode = code;
      return { ok: true, code, fallback: true, message: 'Using offline code (API unreachable)' };
    }
  }

  async function verifyEmailAndRegister(email, code, name, birthInfo) {
    // If we have a pending local code (offline/fallback), verify locally
    if (_pendingVerifyCode && code === _pendingVerifyCode) {
      const result = await doLocalRegister(name, email, birthInfo);
      _pendingVerifyCode = null;
      return result;
    }

    if (typeof Api === 'undefined') {
      // Offline mode: skip verification
      _pendingVerifyCode = null;
      return await doLocalRegister(name, email, birthInfo);
    }

    try {
      const verifyResult = await Api.verifyEmail(email, code);
      if (!verifyResult.ok) return { ok: false, error: verifyResult.error || 'Verification failed' };
      _pendingVerifyCode = null;
      return await doRegister(name, email, birthInfo);
    } catch (e) {
      // If API is unreachable but we have a fallback code, still allow registration
      if (_pendingVerifyCode && code === _pendingVerifyCode) {
        const result = await doLocalRegister(name, email, birthInfo);
        _pendingVerifyCode = null;
        return result;
      }
      return { ok: false, error: e.message };
    }
  }

  // ===== Register =====
  async function doRegister(name, email, birthInfo) {
    try {
      const result = await Api.register(name, email, birthInfo);
      if (result.userId) {
        try {
          localStorage.setItem(KEYS.userId, result.userId);
          if (result.token) localStorage.setItem(KEYS.token, result.token);
          if (result.user) {
            localStorage.setItem(KEYS.profile, JSON.stringify(result.user));
            setCachedCredits(result.user.freeCredits || FREE_TOTAL_LIMIT);
          }
        } catch (e) { /* silent */ }
        return { ok: true, user: result.user };
      }
      return { ok: false, error: 'Registration failed' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function doLocalRegister(name, email, birthInfo) {
    const profile = {
      name: (name || '').trim() || t('Seeker', '求问者'),
      email: (email || '').trim().toLowerCase(),
      birthYear: birthInfo?.year || null,
      birthMonth: birthInfo?.month || null,
      birthDay: birthInfo?.day || null,
      birthHour: birthInfo?.hour || null,
      birthplace: birthInfo?.birthplace || '',
      freeCredits: FREE_TOTAL_LIMIT,
      premium: false,
      registeredAt: new Date().toISOString(),
    };
    saveProfile(profile);
    try {
      localStorage.setItem(KEYS.userId, 'local_' + Date.now());
      setCachedCredits(FREE_TOTAL_LIMIT);
    } catch (e) { /* silent */ }
    return { ok: true, user: profile };
  }

  // Legacy register (kept for backwards compat)
  async function register(name, email) {
    return await doLocalRegister(name, email, null);
  }

  // ===== Login =====
  async function login(userId) {
    if (typeof Api === 'undefined') return null;
    if (!userId || userId.startsWith('local_')) return null;
    try {
      const result = await Api.login(userId);
      if (result.token) {
        try { localStorage.setItem(KEYS.token, result.token); } catch (e) { /* silent */ }
      }
      if (result.user) {
        try {
          localStorage.setItem(KEYS.profile, JSON.stringify(result.user));
          setCachedCredits(result.user.freeCredits || FREE_TOTAL_LIMIT);
          if (result.user.premium) localStorage.setItem(KEYS.premium, 'true');
        } catch (e) { /* silent */ }
      }
      return result.user || null;
    } catch (e) {
      return null;
    }
  }

  async function loginByEmail(email) {
    if (typeof Api === 'undefined') return null;
    try {
      const result = await Api.loginByEmail(email);
      if (result.userId) {
        try { localStorage.setItem(KEYS.userId, result.userId); } catch (e) { /* silent */ }
      }
      if (result.token) {
        try { localStorage.setItem(KEYS.token, result.token); } catch (e) { /* silent */ }
      }
      if (result.user) {
        try {
          localStorage.setItem(KEYS.profile, JSON.stringify(result.user));
          setCachedCredits(result.user.freeCredits || FREE_TOTAL_LIMIT);
          if (result.user.premium) localStorage.setItem(KEYS.premium, 'true');
        } catch (e) { /* silent */ }
      }
      return result.user || null;
    } catch (e) {
      return null;
    }
  }

  async function updateProfile(profileData) {
    const userId = getUserId();
    if (!userId || userId.startsWith('local_')) {
      // Local: just update cache
      const existing = getProfile() || {};
      Object.assign(existing, profileData);
      saveProfile(existing);
      return true;
    }
    try {
      const result = await Api.updateProfile(userId, profileData);
      if (result.user) {
        saveProfile(result.user);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function isLoggedIn() {
    return getUserId() !== null;
  }

  // ===== Usage / AI Access =====
  async function canUseAI() {
    if (isPremiumSync()) return true;

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.checkUsage(userId);
        if (result.premium) {
          try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          return true;
        }
        setCachedCredits(result.totalCredits || FREE_TOTAL_LIMIT);
        return result.remaining > 0;
      } catch (e) { /* API unreachable — allow offline use */ }
    }
    return true;
  }

  async function useAICredit() {
    if (isPremiumSync()) return;

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      await Api.trackUsage(userId);
      return;
    }
  }

  async function getRemainingFree() {
    if (isPremiumSync()) return Infinity;

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.checkUsage(userId);
        if (result.premium) {
          try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          return Infinity;
        }
        setCachedCredits(result.totalCredits || FREE_TOTAL_LIMIT);
        return result.remaining || 0;
      } catch (e) { /* offline */ }
    }
    return Infinity;
  }

  async function getTotalCredits() {
    if (isPremiumSync()) return Infinity;

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.checkUsage(userId);
        if (result.premium) return Infinity;
        return result.totalCredits || FREE_TOTAL_LIMIT;
      } catch (e) { /* offline */ }
    }
    return getCachedCredits();
  }

  // ===== Premium =====
  async function isPremium() {
    if (isPremiumSync()) return true;

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.checkUsage(userId);
        if (result.premium) {
          try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          return true;
        }
      } catch (e) { /* offline */ }
    }
    return false;
  }

  async function unlockPremium(code) {
    return await redeemCode(code);
  }

  async function redeemCode(code) {
    if (!code || typeof code !== 'string') return false;
    const trimmed = code.trim().toUpperCase();

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.redeemCode(userId, trimmed);
        if (result.ok) {
          if (result.premium || result.type === 'premium') {
            try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          }
          if (result.type === 'credits' && result.totalCredits) {
            setCachedCredits(result.totalCredits);
          }
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // ===== History =====
  async function saveReading(type, content) {
    const userId = getUserId();
    if (!userId || userId.startsWith('local_') || typeof Api === 'undefined') return;
    try {
      await Api.saveReading(userId, type, content);
    } catch (e) { /* silent */ }
  }

  async function getHistory() {
    const userId = getUserId();
    if (!userId || userId.startsWith('local_') || typeof Api === 'undefined') return [];
    try {
      const result = await Api.getHistory(userId);
      return result.readings || [];
    } catch (e) {
      return [];
    }
  }

  // ===== Logout =====
  function logout() {
    try {
      localStorage.removeItem(KEYS.userId);
      localStorage.removeItem(KEYS.token);
      localStorage.removeItem(KEYS.profile);
      localStorage.removeItem(KEYS.premium);
      localStorage.removeItem(KEYS.credits);
    } catch (e) { /* silent */ }
  }

  // ===== Session refresh on load =====
  (function init() {
    const cachedId = getUserId();
    if (cachedId && !cachedId.startsWith('local_') && typeof Api !== 'undefined') {
      Api.login(cachedId).then(result => {
        if (result.token) {
          try { localStorage.setItem(KEYS.token, result.token); } catch (e) { /* silent */ }
        }
        if (result.user) {
          try {
            localStorage.setItem(KEYS.profile, JSON.stringify(result.user));
            setCachedCredits(result.user.freeCredits || FREE_TOTAL_LIMIT);
            if (result.user.premium) localStorage.setItem(KEYS.premium, 'true');
          } catch (e) { /* silent */ }
        }
      }).catch(() => { /* API unreachable — use cached data */ });
    }
  })();

  // ===== Public API =====
  return {
    t,
    setLanguage,
    // Email verification flow
    sendVerifyCode,
    verifyEmailAndRegister,
    // Auth
    register,
    login,
    loginByEmail,
    isLoggedIn,
    logout,
    // Profile
    getProfile,
    updateProfile,
    getBirthInfo,
    // AI usage / credits
    canUseAI,
    useAICredit,
    isPremium,
    getRemainingFree,
    getTotalCredits,
    // Codes
    unlockPremium,
    redeemCode,
    // History
    saveReading,
    getHistory,
  };
})();
