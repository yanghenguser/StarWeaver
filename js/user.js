/* ============================================
   StarWeaver - user.js
   User System + Premium + Usage Tracking
   API-first with localStorage fallback, IIFE pattern
   ============================================ */

const User = (() => {
  'use strict';

  const KEYS = {
    userId: 'starweaver_userId',
    token: 'starweaver_token',
    profile: 'starweaver_user',
    usage: 'starweaver_usage',
    premium: 'starweaver_premium',
  };

  const FREE_DAILY_LIMIT = 3;

  let lang = navigator.language.startsWith('zh') ? 'zh' : 'en';

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

  function getUsage() {
    try {
      const data = localStorage.getItem(KEYS.usage);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveUsage(usage) {
    try {
      localStorage.setItem(KEYS.usage, JSON.stringify(usage));
    } catch (e) { /* silent */ }
  }

  function getTodayKey() {
    const d = new Date();
    return d.getFullYear() + '-'
      + String(d.getMonth() + 1).padStart(2, '0')
      + '-'
      + String(d.getDate()).padStart(2, '0');
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

  // ===== Register =====
  async function register(name, email) {
    // Validate
    const displayName = (name || '').trim() || t('Seeker', '求问者');
    const emailVal = (email || '').trim();

    // Try API first
    if (typeof Api !== 'undefined') {
      try {
        const result = await Api.register(displayName, emailVal);
        if (result.userId) {
          try {
            localStorage.setItem(KEYS.userId, result.userId);
            if (result.token) localStorage.setItem(KEYS.token, result.token);
            if (result.user) localStorage.setItem(KEYS.profile, JSON.stringify(result.user));
          } catch (e) { /* silent */ }
          return result.user || { name: displayName };
        }
      } catch (e) {
        // API failed — fall through to localStorage fallback
      }
    }

    // Fallback: localStorage-only registration (backwards-compatible)
    const profile = {
      name: displayName,
      email: emailVal,
      registeredAt: new Date().toISOString(),
    };
    saveProfile(profile);
    try {
      localStorage.setItem(KEYS.userId, 'local_' + Date.now());
    } catch (e) { /* silent */ }
    return profile;
  }

  // ===== Login (verify existing session) =====
  async function login(userId) {
    if (typeof Api === 'undefined') return null;
    if (!userId || userId.startsWith('local_')) return null;
    try {
      const result = await Api.login(userId);
      if (result.token) {
        try { localStorage.setItem(KEYS.token, result.token); } catch (e) { /* silent */ }
      }
      if (result.user) {
        try { localStorage.setItem(KEYS.profile, JSON.stringify(result.user)); } catch (e) { /* silent */ }
      }
      return result.user || null;
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return getUserId() !== null;
  }

  // ===== Usage / AI Access =====
  async function canUseAI() {
    // Fast path: premium from localStorage cache
    if (isPremiumSync()) return true;

    const userId = getUserId();
    // Try API for real-time check
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.checkUsage(userId);
        // Sync premium status from server
        if (result.premium) {
          try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          return true;
        }
        return (result.remaining || 0) > 0;
      } catch (e) {
        // API unreachable — fall through to localStorage fallback
      }
    }

    // Fallback: localStorage usage counter
    if (isPremiumSync()) return true;
    const usage = getUsage();
    if (!usage || usage.date !== getTodayKey()) return true;
    return usage.count < FREE_DAILY_LIMIT;
  }

  async function useAICredit() {
    if (isPremiumSync()) return;

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        await Api.trackUsage(userId);
        return;
      } catch (e) {
        // API unreachable — fall through to localStorage fallback
      }
    }

    // Fallback: localStorage usage counter
    const today = getTodayKey();
    const usage = getUsage();
    if (!usage || usage.date !== today) {
      saveUsage({ date: today, count: 1 });
    } else {
      usage.count += 1;
      saveUsage(usage);
    }
  }

  async function getRemainingFree() {
    // Fast path: premium from localStorage cache
    if (isPremiumSync()) return Infinity;

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.checkUsage(userId);
        if (result.premium) {
          try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          return Infinity;
        }
        return result.remaining || 0;
      } catch (e) {
        // API unreachable — fall through
      }
    }

    // Fallback: localStorage
    if (isPremiumSync()) return Infinity;
    const usage = getUsage();
    if (!usage || usage.date !== getTodayKey()) return FREE_DAILY_LIMIT;
    return Math.max(0, FREE_DAILY_LIMIT - usage.count);
  }

  // ===== Premium =====
  async function isPremium() {
    // Fast path: localStorage cache
    if (isPremiumSync()) return true;

    // Check API to sync
    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.checkUsage(userId);
        if (result.premium) {
          try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          return true;
        }
      } catch (e) {
        // API unreachable
      }
    }

    return false;
  }

  async function unlockPremium(code) {
    if (!code || typeof code !== 'string') return false;
    const trimmed = code.trim().toUpperCase();

    const userId = getUserId();
    if (userId && typeof Api !== 'undefined' && !userId.startsWith('local_')) {
      try {
        const result = await Api.unlockPremium(userId, trimmed);
        if (result.premium) {
          try { localStorage.setItem(KEYS.premium, 'true'); } catch (e) { /* silent */ }
          return true;
        }
        return false;
      } catch (e) {
        // API unreachable — fall through to localStorage validation
      }
    }

    // Fallback: old local validation
    if (!/^SW-[A-Z0-9]{8}$/.test(trimmed)) return false;
    try {
      localStorage.setItem(KEYS.premium, 'true');
    } catch (e) {
      return false;
    }
    return true;
  }

  // ===== History =====
  async function saveReading(type, content) {
    const userId = getUserId();
    if (!userId || userId.startsWith('local_') || typeof Api === 'undefined') return;
    try {
      await Api.saveReading(userId, type, content);
    } catch (e) {
      // Non-critical — silent fail
    }
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
      localStorage.removeItem(KEYS.usage);
      localStorage.removeItem(KEYS.premium);
    } catch (e) { /* silent */ }
  }

  // ===== Session refresh on load =====
  // Fire-and-forget: if we have a cached userId, try to refresh the session
  (function init() {
    const cachedId = getUserId();
    if (cachedId && !cachedId.startsWith('local_') && typeof Api !== 'undefined') {
      Api.login(cachedId).then(result => {
        if (result.token) {
          try { localStorage.setItem(KEYS.token, result.token); } catch (e) { /* silent */ }
        }
        if (result.user) {
          try { localStorage.setItem(KEYS.profile, JSON.stringify(result.user)); } catch (e) { /* silent */ }
        }
      }).catch(() => {
        // API unreachable — use cached data
      });
    }
  })();

  // ===== Public API =====
  return {
    t,
    setLanguage,
    register,
    login,
    isLoggedIn,
    getProfile,
    canUseAI,
    useAICredit,
    isPremium,
    unlockPremium,
    logout,
    getRemainingFree,
    saveReading,
    getHistory,
  };
})();
