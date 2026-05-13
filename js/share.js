/* ============================================
   StarWeaver - share.js
   Canvas-based Fortune Card Generator
   Download & Share to WeChat Moments
   IIFE pattern
   ============================================ */

const ShareCard = (() => {
  'use strict';

  const CANVAS_W = 600;
  const CANVAS_H = 900;

  const TYPE_CONFIG = {
    horoscope: { titleEn: 'Daily Horoscope', titleZh: '每日运势', icon: '⭐' },
    tarot:     { titleEn: 'Tarot Reading',   titleZh: '塔罗占卜',   icon: '🃏' },
    iching:    { titleEn: 'I Ching',          titleZh: '周易占卜',   icon: '☯' },
    numerology:{ titleEn: 'Numerology',       titleZh: '生命灵数',   icon: '🔢' },
    natal:     { titleEn: 'Natal Chart',      titleZh: '星盘解读',   icon: '🌀' },
  };

  let lang = navigator.language.startsWith('zh') ? 'zh' : 'en';

  function t(en, zh) {
    return lang === 'zh' ? zh : en;
  }

  // ===== Text Wrapping =====
  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    const paras = text.split('\n');
    for (const para of paras) {
      if (!para.trim()) { lines.push(''); continue; }
      // Detect CJK text
      const isCJK = /[一-鿿　-ヿ㐀-䶿＀-￯]/.test(para);
      if (isCJK) {
        let line = '';
        for (const ch of para) {
          const test = line + ch;
          if (ctx.measureText(test).width > maxWidth && line.length > 0) {
            lines.push(line);
            line = ch;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
      } else {
        const words = para.split(' ');
        let line = '';
        for (const word of words) {
          const test = line ? line + ' ' + word : word;
          if (ctx.measureText(test).width > maxWidth && line.length > 0) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
      }
    }
    return lines;
  }

  // ===== Draw Stars on Canvas =====
  function drawStars(ctx, count, w, h) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.5 + 0.3;
      const alpha = Math.random() * 0.5 + 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
  }

  // ===== Generate Fortune Card =====
  function generateFortuneCard(type, data) {
    if (!data) data = {};
    const text = data.text || '';
    const langOverride = data.lang;
    lang = langOverride || lang;

    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.horoscope;
    const title = lang === 'zh' ? config.titleZh : config.titleEn;
    const icon = config.icon;

    // ---- Background ----
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#0f0a2e');
    grad.addColorStop(0.4, '#0a0a1e');
    grad.addColorStop(0.7, '#080818');
    grad.addColorStop(1, '#050510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Star dots
    drawStars(ctx, 100, CANVAS_W, CANVAS_H);

    // ---- Subtle border glow ----
    ctx.strokeStyle = 'rgba(212,175,55,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, CANVAS_W - 20, CANVAS_H - 20);

    // ---- Top: Logo + Date ----
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('✦ StarWeaver ✦', CANVAS_W / 2, 50);

    ctx.fillStyle = '#6b5f7a';
    ctx.font = '14px sans-serif';
    const dateStr = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    ctx.fillText(dateStr, CANVAS_W / 2, 78);

    // Divider
    ctx.strokeStyle = 'rgba(212,175,55,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 98);
    ctx.lineTo(CANVAS_W - 60, 98);
    ctx.stroke();

    // ---- Center: Icon + Title ----
    ctx.font = '72px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icon, CANVAS_W / 2, 200);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(title, CANVAS_W / 2, 260);

    // ---- Fortune Text ----
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e8e0f0';
    ctx.font = '18px sans-serif';
    const maxTextW = CANVAS_W - 90;
    const lineH = 30;
    const lines = wrapText(ctx, text, maxTextW);
    const maxLines = 14;
    const displayLines = lines.slice(0, maxLines);
    let textY = 320;

    displayLines.forEach(line => {
      ctx.fillText(line, 45, textY);
      textY += lineH;
    });
    if (lines.length > maxLines) {
      ctx.fillStyle = '#6b5f7a';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('(continued...)', 45, textY);
    }

    // ---- Footer ----
    ctx.strokeStyle = 'rgba(212,175,55,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, CANVAS_H - 110);
    ctx.lineTo(CANVAS_W - 60, CANVAS_H - 110);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b5f7a';
    ctx.font = '12px sans-serif';
    const footerText = t(
      'Scan for daily fortune · 扫码关注星织者',
      '扫码关注星织者 · Scan for daily fortune'
    );
    ctx.fillText(footerText, CANVAS_W / 2, CANVAS_H - 78);

    // ---- QR placeholder ----
    const qrX = CANVAS_W / 2 - 24;
    const qrY = CANVAS_H - 60;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(qrX, qrY, 48, 48);
    ctx.strokeStyle = 'rgba(212,175,55,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX, qrY, 48, 48);

    // Simple QR-like pattern inside the box
    ctx.fillStyle = 'rgba(212,175,55,0.3)';
    const dotSize = 4;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(qrX + 8 + c * 12, qrY + 8 + r * 12, dotSize, dotSize);
        }
      }
    }

    return canvas;
  }

  // ===== Download =====
  function downloadCard(type, data) {
    const canvas = generateFortuneCard(type, data);
    const link = document.createElement('a');
    const timestamp = Date.now();
    link.download = `StarWeaver-${type}-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ===== Share to WeChat Moments (clipboard fallback) =====
  function shareToWeChat(type, data) {
    const canvas = generateFortuneCard(type, data);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        downloadCard(type, data);
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        alert(t(
          '✨ Image copied! Share to WeChat Moments ✦\n✨ 图片已复制！分享到朋友圈 ✦',
          '✨ 图片已复制！分享到朋友圈 ✦\n✨ Image copied! Share to WeChat Moments ✦'
        ));
      } catch (err) {
        // Clipboard not supported — download instead
        downloadCard(type, data);
      }
    });
  }

  // ===== Get Data URL for Preview =====
  function getCardDataURL(type, data) {
    const canvas = generateFortuneCard(type, data);
    return canvas.toDataURL('image/png');
  }

  // ===== Public API =====
  return {
    generateFortuneCard,
    downloadCard,
    shareToWeChat,
    getCardDataURL,
  };
})();
