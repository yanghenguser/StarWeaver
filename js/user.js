/* ============================================
   StarWeaver - user.js
   User System + Premium + Usage Tracking
   localStorage-based, IIFE pattern
   ============================================ */

const User = (() => {
  'use strict';

  const KEYS = {
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

  // ===== Profile =====
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
    } catch (e) {
      // localStorage full or disabled — silently fail
    }
  }

  function register({ name, email, birthYear, birthMonth, birthDay }) {
    const profile = {
      name: (name || '').trim() || t('Seeker', '求问者'),
      email: (email || '').trim(),
      birthYear: birthYear || '',
      birthMonth: birthMonth || '',
      birthDay: birthDay || '',
      registeredAt: new Date().toISOString(),
    };
    saveProfile(profile);
    return profile;
  }

  function isLoggedIn() {
    return getProfile() !== null;
  }

  function logout() {
    try {
      localStorage.removeItem(KEYS.profile);
    } catch (e) { /* silent */ }
  }

  // ===== Usage Tracking =====
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

  function canUseAI() {
    if (isPremium()) return true;
    const usage = getUsage();
    if (!usage || usage.date !== getTodayKey()) return true;
    return usage.count < FREE_DAILY_LIMIT;
  }

  function useAICredit() {
    if (isPremium()) return;
    const today = getTodayKey();
    const usage = getUsage();
    if (!usage || usage.date !== today) {
      saveUsage({ date: today, count: 1 });
    } else {
      usage.count += 1;
      saveUsage(usage);
    }
  }

  function getRemainingFree() {
    if (isPremium()) return Infinity;
    const usage = getUsage();
    if (!usage || usage.date !== getTodayKey()) return FREE_DAILY_LIMIT;
    return Math.max(0, FREE_DAILY_LIMIT - usage.count);
  }

  // ===== Premium =====
  function isPremium() {
    try {
      return localStorage.getItem(KEYS.premium) === 'true';
    } catch (e) {
      return false;
    }
  }

  function unlockPremium(code) {
    if (!code || typeof code !== 'string') return false;
    const trimmed = code.trim().toUpperCase();
    if (!/^SW-[A-Z0-9]{8}$/.test(trimmed)) return false;
    try {
      localStorage.setItem(KEYS.premium, 'true');
    } catch (e) {
      return false;
    }
    return true;
  }

  // ===== Public API =====
  return {
    t,
    setLanguage,
    register,
    isLoggedIn,
    getProfile,
    canUseAI,
    useAICredit,
    isPremium,
    unlockPremium,
    logout,
    getRemainingFree,
  };
})();
