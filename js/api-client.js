/* ============================================
   StarWeaver - api-client.js
   Backend API Client — IIFE pattern
   ============================================ */

const Api = (() => {
  'use strict';

  const BASE = 'https://starweaver-app.vercel.app/api/starweaver';

  let lang = navigator.language.startsWith('zh') ? 'zh' : 'en';

  function t(en, zh) {
    return lang === 'zh' ? zh : en;
  }

  async function request(action, data = {}) {
    const body = JSON.stringify({ action, ...data });
    let response;
    try {
      response = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (e) {
      throw new Error(t('Network error — please check your connection', '网络错误 — 请检查网络连接'));
    }

    let json;
    try {
      json = await response.json();
    } catch (e) {
      throw new Error(t('Invalid server response', '服务器响应异常'));
    }

    if (!json || json.ok !== true) {
      throw new Error(json && json.error ? json.error : t('Request failed', '请求失败'));
    }

    return json;
  }

  // ===== Public API Methods =====

  async function sendVerifyCode(email) {
    return request('sendVerifyCode', { email });
  }

  async function verifyEmail(email, code) {
    return request('verifyEmail', { email, code });
  }

  async function register(name, email, birthInfo) {
    return request('register', {
      name,
      email: email || '',
      birthYear: birthInfo?.year || null,
      birthMonth: birthInfo?.month || null,
      birthDay: birthInfo?.day || null,
      birthHour: birthInfo?.hour || null,
      birthplace: birthInfo?.birthplace || '',
    });
  }

  async function login(userId) {
    return request('login', { userId });
  }

  async function loginByEmail(email) {
    return request('login', { email });
  }

  async function updateProfile(userId, profile) {
    return request('updateProfile', {
      userId,
      name: profile.name,
      birthYear: profile.birthYear,
      birthMonth: profile.birthMonth,
      birthDay: profile.birthDay,
      birthHour: profile.birthHour,
      birthplace: profile.birthplace,
    });
  }

  async function checkUsage(userId) {
    return request('checkUsage', { userId });
  }

  async function trackUsage(userId) {
    return request('trackUsage', { userId });
  }

  async function unlockPremium(userId, code) {
    return request('unlockPremium', { userId, code });
  }

  async function redeemCode(userId, code) {
    return request('redeemCode', { userId, code });
  }

  async function saveReading(userId, type, content) {
    return request('saveReading', { userId, type, content });
  }

  async function getHistory(userId) {
    return request('getHistory', { userId });
  }

  return {
    BASE,
    sendVerifyCode,
    verifyEmail,
    register,
    login,
    loginByEmail,
    updateProfile,
    checkUsage,
    trackUsage,
    unlockPremium,
    redeemCode,
    saveReading,
    getHistory,
  };
})();
