/* ============================================
   StarWeaver - app.js
   Main Application Logic
   ============================================ */

const App = (() => {
  'use strict';

  let lang = navigator.language.startsWith('zh') ? 'zh' : 'en';
  let currentSection = 'home';
  let birthInfo = null;
  let chartData = null;
  let selectedZodiac = null;

  // ===== DOM Ready =====
  document.addEventListener('DOMContentLoaded', () => {
    initStarCanvas();
    initLoading();
    initNavigation();
    initBottomNav();
    initSwipeNavigation();
    initForms();
    initCompatibility();
    initAIChat();
    initTarot();
    initIChing();
    initDreamWeaver();
    initDice();
    initMoonPhase();
    initCosmicWeather();
    initLanguageToggle();
    showRandomQuote();
    populateZodiacSigns();
    initZodiacDetailOverlay();
  });

  // ===== Language =====
  function t(en, zh) {
    return lang === 'zh' ? zh : en;
  }

  function setLanguage(newLang) {
    lang = newLang;
    document.documentElement.lang = lang;
    document.querySelector('.language-toggle').textContent = lang === 'zh' ? 'EN' : '中文';
    
    // Update all localized content
    updateLocalizedContent();
    updateBottomNavLabels();
    showRandomQuote();
    if (birthInfo) {
      renderNatalChart(chartData);
    }
    populateZodiacSigns();
    initMoonPhase();
    initCosmicWeather();
  }

  function updateBottomNavLabels() {
    const labels = lang === 'zh'
      ? ['宇宙', '星盘', '运势', '合盘', '占卜', '占星师']
      : ['Cosmic', 'Chart', 'Scope', 'Match', 'Fortune', 'Oracle'];
    document.querySelectorAll('.bottom-nav-item .nav-label').forEach((el, i) => {
      if (labels[i]) el.textContent = labels[i];
    });
  }

  function updateLocalizedContent() {
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.dataset.lang;
      const parts = key.split('.');
      // Simple data-lang="key" attribute translation
    });
    
    // Update tab labels
    const tabs = [
      { id: 'tab-home', en: '🌌 Cosmic', zh: '🌌 宇宙' },
      { id: 'tab-chart', en: '🔮 My Chart', zh: '🔮 我的星盘' },
      { id: 'tab-horoscope', en: '⭐ Horoscope', zh: '⭐ 运势' },
      { id: 'tab-compatibility', en: '💞 Love Match', zh: '💞 合盘' },
      { id: 'tab-fortune', en: '🎴 Divination', zh: '🎴 占卜' },
      { id: 'tab-chat', en: '🌙 AI Oracle', zh: '🌙 AI 占星师' },
    ];
    tabs.forEach(({ id, en, zh }) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = lang === 'zh' ? zh : en;
    });

    // Update section titles
    document.querySelectorAll('.card-title, h2').forEach(el => {
      const key = el.dataset.key;
      if (!key) return;
      // Simple key-based translation
    });
  }

  // ===== Loading Screen =====
  function initLoading() {
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
  }

  // ===== Star Canvas Background =====
  function initStarCanvas() {
    const canvas = document.getElementById('star-canvas');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let meteors = [];
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 3000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.8 + 0.2,
          alpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.005,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    }

    function addMeteor() {
      if (Math.random() < 0.005 && meteors.length < 3) {
        meteors.push({
          x: Math.random() * canvas.width,
          y: 0,
          len: Math.random() * 80 + 40,
          speed: Math.random() * 4 + 3,
          alpha: 0.8,
        });
      }
    }

    function drawStars(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.3, 0,
        canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.8
      );
      if (isNight) {
        gradient.addColorStop(0, '#0f0a2a');
        gradient.addColorStop(0.5, '#0a0a1a');
        gradient.addColorStop(1, '#050510');
      } else {
        gradient.addColorStop(0, '#1a1a3a');
        gradient.addColorStop(0.5, '#0e0e28');
        gradient.addColorStop(1, '#080818');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
        ctx.fill();

        // Glow for bright stars
        if (star.r > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 180, 255, ${star.alpha * twinkle * 0.1})`;
          ctx.fill();
        }
      });

      // Meteors
      meteors = meteors.filter(m => {
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.len * 0.3, m.y + m.len);
        ctx.strokeStyle = `rgba(255, 255, 255, ${m.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Meteor glow
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha * 0.6})`;
        ctx.fill();

        m.x -= m.speed * 0.5;
        m.y += m.speed;
        m.alpha -= 0.008;
        return m.alpha > 0 && m.x > -100 && m.y < canvas.height + 100;
      });
    }

    function animate(time) {
      drawStars(time);
      addMeteor();
      animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate(0);
  }

  // ===== Navigation =====
  function initNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.section;
        switchSection(target);
      });
    });
  }

  function switchSection(sectionId) {
    currentSection = sectionId;
    
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    const tab = document.querySelector(`.nav-tab[data-section="${sectionId}"]`);
    const section = document.getElementById(`section-${sectionId}`);
    
    if (tab) tab.classList.add('active');
    if (section) section.classList.add('active');

    // Update bottom nav
    updateBottomNav(sectionId);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== Bottom Navigation =====
  function initBottomNav() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.section;
        switchSection(target);
        updateBottomNav(target);
      });
    });
  }

  function updateBottomNav(sectionId) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionId);
    });
  }

  // ===== Touch Swipe Navigation =====
  function initSwipeNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;
    const sections = ['home', 'chart', 'horoscope', 'compatibility', 'fortune', 'chat'];

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 80;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) < threshold) return;

      const currentIdx = sections.indexOf(currentSection);
      if (currentIdx === -1) return;

      let nextIdx;
      if (diff > 0) {
        // Swipe left → next section
        nextIdx = Math.min(currentIdx + 1, sections.length - 1);
      } else {
        // Swipe right → previous section
        nextIdx = Math.max(currentIdx - 1, 0);
      }

      if (nextIdx !== currentIdx) {
        switchSection(sections[nextIdx]);
      }
    }
  }

  // ===== Random Quote =====
  function showRandomQuote() {
    const quotes = Astro.QUOTES[lang];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const el = document.getElementById('cosmic-quote-text');
    const authorEl = document.getElementById('cosmic-quote-author');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = q.text;
        el.style.opacity = '1';
      }, 300);
    }
    if (authorEl) {
      authorEl.textContent = `— ${q.author}`;
    }
  }

  // ===== Forms =====
  function initForms() {
    const form = document.getElementById('birth-form');
    if (!form) return;

    // Populate select options
    const yearSelect = document.getElementById('birth-year');
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      const y = now.getFullYear() - i;
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
    yearSelect.value = now.getFullYear() - 30;

    const monthSelect = document.getElementById('birth-month');
    for (let i = 1; i <= 12; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      monthSelect.appendChild(opt);
    }
    monthSelect.value = now.getMonth() + 1;

    const daySelect = document.getElementById('birth-day');
    for (let i = 1; i <= 31; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      daySelect.appendChild(opt);
    }
    daySelect.value = now.getDate();

    const hourSelect = document.getElementById('birth-hour');
    for (let i = 0; i < 24; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${String(i).padStart(2, '0')}:00`;
      hourSelect.appendChild(opt);
    }
    hourSelect.value = now.getHours();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('birth-name').value || t('Seeker', '求问者');
      const year = parseInt(document.getElementById('birth-year').value);
      const month = parseInt(document.getElementById('birth-month').value);
      const day = parseInt(document.getElementById('birth-day').value);
      const hour = parseInt(document.getElementById('birth-hour').value) || 12;
      const minute = 0;
      const birthplace = document.getElementById('birthplace').value;

      if (!year || !month || !day) {
        alert(t('Please fill in date of birth', '请填写出生日期'));
        return;
      }

      birthInfo = { name, year, month, day, hour, minute, birthplace };
      chartData = Astro.generateNatalChart(year, month, day, hour, 0, 0);

      renderNatalChart(chartData);
      showChartReading(chartData);
      document.getElementById('chart-card').style.display = 'block';
      document.getElementById('chart-reading-card').style.display = 'block';
      document.querySelector('.chart-controls').style.display = 'flex';
      
      // Switch to chart section
      switchSection('chart');
    });

    // Set default values — already set above in populate section
    /* const now = new Date();
    document.getElementById('birth-year').value = now.getFullYear() - 30;
    document.getElementById('birth-month').value = now.getMonth() + 1;
    document.getElementById('birth-day').value = now.getDate();
    document.getElementById('birth-hour').value = now.getHours(); */
  }

  // ===== Natal Chart Rendering =====
  function renderNatalChart(data) {
    const container = document.getElementById('natal-chart-svg');
    if (!container) return;

    const size = container.clientWidth || 400;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.42;
    const innerR = size * 0.28;
    const houseR = (outerR + innerR) / 2;

    let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background circle
    svg += `<circle cx="${cx}" cy="${cy}" r="${outerR + 5}" fill="rgba(10,10,30,0.3)" stroke="#d4af37" stroke-width="1.5"/>`;

    // Houses (12 slices)
    for (let i = 0; i < 12; i++) {
      const startAngle = (i * 30 - 90) * Math.PI / 180;
      const endAngle = ((i + 1) * 30 - 90) * Math.PI / 180;
      
      const x1 = cx + outerR * Math.cos(startAngle);
      const y1 = cy + outerR * Math.sin(startAngle);
      const x2 = cx + innerR * Math.cos(startAngle);
      const y2 = cy + innerR * Math.sin(startAngle);
      
      // House arc
      const largeArc = 30 > 180 ? 1 : 0;
      svg += `<path d="M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${cx + outerR * Math.cos(endAngle)} ${cy + outerR * Math.sin(endAngle)} L ${cx + innerR * Math.cos(endAngle)} ${cy + innerR * Math.sin(endAngle)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2} ${y2} Z" 
        fill="${i % 2 === 0 ? 'rgba(212,175,55,0.03)' : 'rgba(155,89,182,0.03)'}" 
        stroke="rgba(212,175,55,0.15)" stroke-width="0.5"/>`;

      // House number
      const midAngle = (startAngle + endAngle) / 2;
      const lx = cx + houseR * Math.cos(midAngle);
      const ly = cy + houseR * Math.sin(midAngle);
      svg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" 
        fill="rgba(212,175,55,0.4)" font-size="14" font-weight="bold">${data.houses[i].sign.symbol}</text>`;
      
      const numR = outerR - 14;
      const nx = cx + numR * Math.cos(midAngle);
      const ny = cy + numR * Math.sin(midAngle);
      svg += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" 
        fill="rgba(255,255,255,0.3)" font-size="10">${data.houses[i].number}</text>`;
    }

    // Inner circles
    svg += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="rgba(212,175,55,0.15)" stroke-width="1"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="15" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="1"/>`;
    svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#d4af37" font-size="12">${data.sunSign.symbol}</text>`;

    // Planets
    const planetR = innerR - 5;
    data.planets.forEach(p => {
      const angle = (p.position * Math.PI * 2 / 360) - Math.PI / 2;
      const px = cx + planetR * 0.6 * Math.cos(angle);
      const py = cy + planetR * 0.6 * Math.sin(angle);
      
      // Planet glow
      svg += `<circle cx="${px}" cy="${py}" r="10" fill="rgba(0,0,0,0.3)" stroke="${p.color}" stroke-width="1"/>`;
      svg += `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="central" fill="${p.color}" font-size="12">${p.symbol}</text>`;
    });

    // Aspects lines
    data.aspects.slice(0, 5).forEach(a => {
      const p1 = data.planets.find(p => p.name === a.p1);
      const p2 = data.planets.find(p => p.name === a.p2);
      if (p1 && p2) {
        const a1 = (p1.position * Math.PI * 2 / 360) - Math.PI / 2;
        const a2 = (p2.position * Math.PI * 2 / 360) - Math.PI / 2;
        const r = innerR * 0.6;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        
        const aspectColors = { Conjunction: '#d4af37', Sextile: '#22c55e', Square: '#ef4444', Trine: '#3b82f6', Opposition: '#f97316' };
        const color = aspectColors[a.name] || 'rgba(255,255,255,0.2)';
        
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.5"/>`;
      }
    });

    // Degree marks
    for (let i = 0; i < 360; i += 30) {
      const angle = (i * Math.PI / 180) - Math.PI / 2;
      const r1 = outerR - 2;
      const r2 = outerR - 6;
      svg += `<line x1="${cx + r1 * Math.cos(angle)}" y1="${cy + r1 * Math.sin(angle)}" 
        x2="${cx + r2 * Math.cos(angle)}" y2="${cy + r2 * Math.sin(angle)}" 
        stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`;
    }

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ===== Chart Reading =====
  function showChartReading(data) {
    const s = Astro.ZODIAC_SIGNS[lang];
    const result = document.getElementById('chart-reading-text');
    if (!result) return;
    
    result.innerHTML = `
      <div style="text-align:center;margin-bottom:1rem;font-size:1.2rem;color:var(--gold);">
        ${t('Your Cosmic Blueprint', '你的宇宙蓝图')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
        <div><strong>${t('Sun Sign', '太阳星座')}:</strong> ${data.sunSign.symbol} ${data.sunSign.name}</div>
        <div><strong>${t('Ascendant', '上升星座')}:</strong> ${data.ascendantSign.symbol} ${data.ascendantSign.name}</div>
        <div><strong>${t('Moon Sign', '月亮星座')}:</strong> ${s[data.moonSignIndex].symbol} ${s[data.moonSignIndex].name}</div>
        <div><strong>${t('Chinese Zodiac', '生肖')}:</strong> ${Astro.getChineseZodiac(birthInfo.year)[lang]}</div>
      </div>
      <hr style="border-color:var(--border-subtle);margin:1rem 0;">
      <div style="font-size:0.9rem;color:var(--text-secondary);">
        <strong>${t('Planets', '行星位置')}:</strong><br>
        ${data.planets.map(p => `${p.symbol} ${p.name}: ${p.sign.name} (${t('House', '宫位')} ${p.house})`).join('<br>')}
      </div>
      ${data.aspects.length > 0 ? `
        <hr style="border-color:var(--border-subtle);margin:1rem 0;">
        <div style="font-size:0.85rem;color:var(--text-secondary);">
          <strong>${t('Aspects', '相位')}:</strong><br>
          ${data.aspects.slice(0, 8).map(a => `${a.p1} ${a.symbol} ${a.p2} (${a.name}, ${a.orb}°)`).join('<br>')}
        </div>
      ` : ''}
    `;
  }

  // ===== AI Chart Reading =====
  async function generateAIReading() {
    if (!AstroAI.hasApiKey()) {
      alert(t('Please set your DeepSeek API Key first', '请先设置 DeepSeek API Key'));
      switchSection('chat');
      return;
    }
    if (!chartData || !birthInfo) {
      alert(t('Please enter your birth information first', '请先填写出生信息'));
      switchSection('chart');
      return;
    }

    const btn = document.getElementById('btn-ai-reading');
    const output = document.getElementById('ai-reading-output');
    if (btn) btn.disabled = true;
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Consulting the stars...', '正在咨询星辰...')}</div>`;

    try {
      const reading = await AstroAI.getNatalReading(birthInfo, chartData, lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, reading, 25);
      }
    } catch (err) {
      if (output) output.innerHTML = `<div style="color:#ef4444;">${t('Error', '错误')}: ${err.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ===== Zodiac Signs Display =====
  function populateZodiacSigns() {
    const grid = document.getElementById('zodiac-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const signs = Astro.ZODIAC_SIGNS[lang];
    
    // Also populate all sign selects
    const signNames = signs.map(s => `${s.name} ${s.symbol}`);
    ['horoscope-sign', 'compat-sign1', 'compat-sign2'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '';
      signNames.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = name;
        sel.appendChild(opt);
      });
    });

    // Build zodiac cards
    signs.forEach((sign, i) => {
      const card = document.createElement('div');
      card.className = 'zodiac-card';
      card.innerHTML = `
        <div class="zodiac-icon">${sign.symbol}</div>
        <div class="zodiac-name">${sign.name}</div>
        <div class="zodiac-dates">${sign.dates}</div>
        <div class="zodiac-horoscope">${t('Tap to see details', '点击查看详情')}</div>
      `;
      card.addEventListener('click', () => showZodiacDetail(i));
      grid.appendChild(card);
    });
  }

  function showZodiacDetail(index) {
    const overlay = document.getElementById('zodiac-detail');
    const content = document.getElementById('zodiac-detail-content');
    const sign = Astro.ZODIAC_SIGNS[lang][index];
    
    content.innerHTML = `
      <button class="close-btn" onclick="document.getElementById('zodiac-detail').classList.remove('active')">&times;</button>
      <div style="text-align:center;font-size:3rem;margin-bottom:0.5rem;">${sign.symbol}</div>
      <h2>${sign.name}</h2>
      <div class="info-row"><span class="info-label">${t('Dates', '日期')}</span><span class="info-value">${sign.dates}</span></div>
      <div class="info-row"><span class="info-label">${t('Element', '元素')}</span><span class="info-value">${sign.element}</span></div>
      <div class="info-row"><span class="info-label">${t('Ruling Planet', '守护星')}</span><span class="info-value">${sign.ruler}</span></div>
      <div class="info-row"><span class="info-label">${t('Quality', '特质')}</span><span class="info-value">${sign.quality}</span></div>
      <div style="margin-top:1rem;">
        <strong>${t('Traits', '性格特点')}:</strong>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.5rem;">
          ${sign.traits.map(t => `<span style="background:rgba(212,175,55,0.1);padding:4px 12px;border-radius:20px;font-size:0.85rem;border:1px solid rgba(212,175,55,0.2);">${t}</span>`).join('')}
        </div>
      </div>
    `;
    overlay.classList.add('active');
  }

  function initZodiacDetailOverlay() {
    const overlay = document.getElementById('zodiac-detail');
    if (!overlay) return;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  }

  // ===== AI Horoscope =====
  async function getAIHoroscope() {
    if (!AstroAI.hasApiKey()) {
      alert(t('Please set your DeepSeek API Key first', '请先设置 DeepSeek API Key'));
      switchSection('chat');
      return;
    }

    const sign = parseInt(document.getElementById('horoscope-sign').value);
    const output = document.getElementById('horoscope-ai-output');
    const btn = document.getElementById('btn-ai-horoscope');
    
    if (btn) btn.disabled = true;
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Reading the cosmic tides...', '正在读取宇宙潮汐...')}</div>`;

    try {
      const horoscope = await AstroAI.getHoroscope(sign, new Date(), lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, horoscope, 20);
      }
    } catch (err) {
      if (output) output.innerHTML = `<div style="color:#ef4444;">${t('Error', '错误')}: ${err.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ===== Compatibility =====
  function initCompatibility() {
    const compatForm = document.getElementById('compatibility-form');
    if (compatForm) {
      compatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sign1 = parseInt(document.getElementById('compat-sign1').value);
        const sign2 = parseInt(document.getElementById('compat-sign2').value);
        const name1 = document.getElementById('compat-name1').value || t('Person A', 'TA');
        const name2 = document.getElementById('compat-name2').value || t('Person B', 'TA');
        
        const score = Astro.calculateCompatibility(sign1, sign2);
        const desc = Astro.getCompatibilityDescription(score, lang);
        
        document.getElementById('compat-result').style.display = 'block';
        document.getElementById('compat-score').textContent = score + '%';
        document.getElementById('compat-label').textContent = desc;
        
        const names = `${Astro.ZODIAC_SIGNS[lang][sign1].name} & ${Astro.ZODIAC_SIGNS[lang][sign2].name}`;
        document.getElementById('compat-names').textContent = names;
        
        // AI reading if key available
        if (AstroAI.hasApiKey()) {
          try {
            const aiReading = await AstroAI.getCompatibilityReading(name1, sign1, name2, sign2, score, lang);
            const el = document.getElementById('compat-ai-reading');
            if (el) {
              el.innerHTML = '';
              AstroAI.typewriteText(el, aiReading, 25);
            }
          } catch (err) {
            // Silent fallback
          }
        }
      });
    }
  }

  // ===== AI Chat =====
  function initAIChat() {
    // AI is auto-connected via embedded key
    const statusEl = document.getElementById('api-key-status');
    if (statusEl) {
      statusEl.textContent = '✦ AI Oracle ready';
      statusEl.className = 'api-key-status connected';
    }

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const messages = document.getElementById('chat-messages');
        const question = input.value.trim();
        
        if (!question || !AstroAI.hasApiKey()) return;
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.innerHTML = `<div>${question}</div>`;
        messages.appendChild(userMsg);
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
        
        // AI thinking indicator
        const aiThinking = document.createElement('div');
        aiThinking.className = 'ai-message';
        aiThinking.innerHTML = `<span class="msg-sender">✦ ${t('Stella', '星织者')}</span><div>${t('Consulting the cosmic wisdom...', '正在查询宇宙智慧...')}</div>`;
        messages.appendChild(aiThinking);
        messages.scrollTop = messages.scrollHeight;
        
        try {
          const answer = await AstroAI.askQuestion(question, lang);
          aiThinking.innerHTML = `<span class="msg-sender">✦ ${t('Stella', '星织者')}</span><div class="typing-cursor"></div>`;
          const textDiv = aiThinking.querySelector('div');
          AstroAI.typewriteText(textDiv, answer, 20, () => {
            messages.scrollTop = messages.scrollHeight;
          });
        } catch (err) {
          aiThinking.innerHTML = `<span class="msg-sender">✦ ${t('Stella', '星织者')}</span><div style="color:#ef4444;">${t('The cosmic connection faltered', '宇宙连接中断')}: ${err.message}</div>`;
        }
        messages.scrollTop = messages.scrollHeight;
      });
    }

    // Clear chat
    const clearBtn = document.getElementById('btn-clear-chat');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        document.getElementById('chat-messages').innerHTML = `
          <div class="ai-message">
            <span class="msg-sender">✦ ${t('Stella', '星织者')}</span>
            <div>${t('Greetings, seeker. I am Stella, weaver of stars and keeper of cosmic wisdom. What questions do you bring before the celestial court tonight?', '你好，求问者。我是星织者斯特拉，星辰的编织者，宇宙智慧的守护者。今夜你带来了什么问题来到这 celestial 的殿堂？')}</div>
          </div>
        `;
        AstroAI.clearConversation();
      });
    }
  }

  // ===== Tarot Reading =====
  const SUIT_SYMBOLS = ['🔥', '💧', '⚔️', '🪙'];
  let _tarotDrawnCards = [];

  function initTarot() {
    let currentSpread = 'three-card';

    // Spread selector
    document.querySelectorAll('.spread-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSpread = btn.dataset.spread;
        document.getElementById('tarot-result').style.display = 'none';
      });
    });

    // Direct binding (more reliable than addEventListener for async functions)
    const drawBtn = document.getElementById('tarot-draw-btn');
    const redrawBtn = document.getElementById('tarot-redraw-btn');
    if (drawBtn) drawBtn.onclick = performTarotReading;
    if (redrawBtn) redrawBtn.onclick = performTarotReading;
  }

  async function performTarotReading() {
    const resultCard = document.getElementById('tarot-result');
    const cardsDisplay = document.getElementById('tarot-cards-display');
    const readingOutput = document.getElementById('tarot-reading-output');
    const spreadName = document.getElementById('tarot-spread-name');
    const question = document.getElementById('tarot-question').value.trim();

    if (!resultCard || !cardsDisplay) return;

    resultCard.style.display = 'block';
    const spreadKey = document.querySelector('.spread-btn.active')?.dataset.spread || 'three-card';
    const spreadInfo = Tarot.getSpreadInfo(spreadKey, lang);

    if (spreadName) {
      spreadName.textContent = `${spreadInfo.name} · 塔罗占卜`;
    }

    // Draw cards
    const drawn = Tarot.drawCards(spreadKey);
    const positions = Tarot.getSpreadPositions(spreadKey, lang);

    // Animate deal
    cardsDisplay.innerHTML = '';
    readingOutput.innerHTML = `<div style="text-align:center;color:var(--text-muted);font-size:0.9rem;">
      ${t('Consulting the cards...', '正在解读卡牌...')}
    </div>`;

    drawn.forEach((card, i) => {
      const pos = positions[i] || { label: t('Position', '位置') + ' ' + (i + 1) };
      // Use suit symbol for minor, card symbol for major
      const symbol = card.type === 'major' ? card.suitSymbol : (SUIT_SYMBOLS && SUIT_SYMBOLS[['Wands','Cups','Swords','Pentacles'].indexOf(card.suit)] || card.suitSymbol);
      
      const cardEl = document.createElement('div');
      cardEl.className = 'tarot-card' + (card.reversed ? ' reversed' : '');
      cardEl.innerHTML = `
        <div class="card-position">${pos.label}</div>
        <div class="card-symbol">${symbol}</div>
        <div class="card-name">${lang === 'zh' ? card.nameZh : card.name}${card.reversed ? ' ↕' : ''}</div>
        <div class="card-meaning">${card.meaning[lang]}</div>
        ${card.reversed ? '<div class="card-rev-badge">REVERSED</div>' : ''}
      `;
      cardsDisplay.appendChild(cardEl);
    });

    // Store for AI
    _tarotDrawnCards = drawn;

    // Get AI reading
    try {
      const reading = await AstroAI.getTarotReading(spreadInfo, drawn.map((c, i) => ({
        position: positions[i]?.label || (i + 1).toString(),
        name: lang === 'zh' ? c.nameZh : c.name,
        reversed: c.reversed,
        meaning: c.meaning[lang]
      })), question, lang);

      if (readingOutput) {
        readingOutput.innerHTML = '';
        AstroAI.typewriteText(readingOutput, reading, 25);
      }
    } catch (err) {
      if (readingOutput) {
        readingOutput.innerHTML = `<div style="text-align:center;color:var(--text-muted);font-size:0.9rem;">
          ${t('The cards are drawn... Here is your reading:', '卡牌已抽... 以下是你的解读:')}
        </div><div style="margin-top:0.8rem;padding:1rem;background:rgba(10,10,30,0.3);border-radius:8px;line-height:1.8;">
          ${drawn.map((c, i) => {
            const pos = positions[i] || { label: '' };
            return `<strong>${pos.label}:</strong> ${lang === 'zh' ? c.nameZh : c.name}${c.reversed ? t(' (Reversed)', ' (逆位)') : ''} — ${c.meaning[lang]}`;
          }).join('<br>')}
        </div>`;
      }
    }
  }

  // ===== IChing / 周易 =====
  let _ichingLines = null;

  function initIChing() {
    const castBtn = document.getElementById('iching-cast-btn');
    const recastBtn = document.getElementById('iching-recast-btn');
    const aiBtn = document.getElementById('iching-ai-btn');

    if (castBtn) castBtn.onclick = performIChingCast;
    if (recastBtn) recastBtn.onclick = performIChingCast;
    if (aiBtn) aiBtn.onclick = performIChingAIReading;
  }

  function performIChingCast() {
    const lines = IChing.castHexagram();
    _ichingLines = lines;

    const hexagram = IChing.getHexagram(lines);
    const changingHex = IChing.getChangingHexagram(lines);
    const hasChanges = changingHex !== null;

    // Show result card
    const resultCard = document.getElementById('iching-result');
    if (resultCard) resultCard.style.display = 'block';

    // Primary hexagram
    const primaryLabel = document.getElementById('iching-primary-label');
    const primaryLines = document.getElementById('iching-primary-lines');
    const primaryName = document.getElementById('iching-primary-name');

    if (primaryLabel) primaryLabel.textContent = t('Primary Hexagram', '本卦');
    if (primaryName && hexagram) {
      primaryName.textContent = `☯ ${hexagram.num}. ${hexagram.name} · ${hexagram.nameEn}`;
    }
    if (primaryLines) {
      primaryLines.innerHTML = renderHexagramLines(lines);
    }

    // Changing hexagram
    const changeArrow = document.getElementById('iching-change-arrow');
    const changingBox = document.getElementById('iching-changing-box');
    const changingLabel = document.getElementById('iching-changing-label');
    const changingLines = document.getElementById('iching-changing-lines');
    const changingName = document.getElementById('iching-changing-name');

    if (hasChanges) {
      if (changeArrow) changeArrow.style.display = 'block';
      if (changingBox) changingBox.style.display = 'block';
      if (changingLabel) changingLabel.textContent = t('Changing Hexagram', '变卦');
      if (changingName && changingHex) {
        changingName.textContent = `☯ ${changingHex.num}. ${changingHex.name} · ${changingHex.nameEn}`;
      }
      if (changingLines) {
        changingLines.innerHTML = renderHexagramLinesFromBinary(changingHex.binary);
      }

      // Show moving lines info
      const movingEl = document.getElementById('iching-moving-lines');
      if (movingEl) {
        movingEl.style.display = 'block';
        const movingNums = [];
        lines.forEach((l, i) => {
          if (l.type === 'old_yin' || l.type === 'old_yang') {
            movingNums.push(t(`Line ${i + 1} (from bottom)`, `第${i + 1}爻 (从下往上)`));
          }
        });
        movingEl.innerHTML = `<span style="color:var(--gold);font-size:0.85rem;">
          ⚡ ${t('Moving lines', '动爻')}: ${movingNums.join(', ')}
        </span>`;
      }
    } else {
      if (changeArrow) changeArrow.style.display = 'none';
      if (changingBox) changingBox.style.display = 'none';
      const movingEl = document.getElementById('iching-moving-lines');
      if (movingEl) movingEl.style.display = 'none';
    }

    // Show brief meaning
    const readingOutput = document.getElementById('iching-reading-output');
    if (readingOutput && hexagram) {
      readingOutput.innerHTML = `<div style="margin-bottom:0.5rem;font-weight:600;color:var(--gold);">
        ${hexagram.name} — ${hexagram.nameEn}
      </div>
      <div style="margin-bottom:0.3rem;color:var(--text-secondary);font-size:0.9rem;">
        ${hexagram.meaning}
      </div>
      <div style="color:var(--text-muted);font-size:0.85rem;">
        ${hexagram.meaningEn}
      </div>`;
      if (hasChanges && changingHex) {
        readingOutput.innerHTML += `<hr style="border-color:var(--border-subtle);margin:0.8rem 0;">
        <div style="font-weight:600;color:var(--gold);font-size:0.9rem;">
          → ${t('Changing to', '变为')}: ${changingHex.name} — ${changingHex.nameEn}
        </div>
        <div style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.3rem;">
          ${changingHex.meaning}
        </div>`;
      }
    }
  }

  // Render hexagram lines from a lines array
  function renderHexagramLines(lines) {
    // Display from top (line 6) to bottom (line 1) for visual
    const reversed = [...lines].reverse();
    return reversed.map((l, i) => {
      const isChanging = l.type === 'old_yin' || l.type === 'old_yang';
      const lineNum = 6 - i; // top to bottom
      if (l.value === 1) {
        // Yang line (solid)
        return `<div class="iching-line yang ${isChanging ? 'changing' : ''}">
          <span class="iching-line-bar yang-bar"></span>
          ${isChanging ? '<span class="iching-change-mark">×</span>' : ''}
          <span class="iching-line-num">${lineNum}</span>
        </div>`;
      } else {
        // Yin line (broken)
        return `<div class="iching-line yin ${isChanging ? 'changing' : ''}">
          <span class="iching-line-bar yin-bar">
            <span class="yin-left"></span><span class="yin-gap"></span><span class="yin-right"></span>
          </span>
          ${isChanging ? '<span class="iching-change-mark">×</span>' : ''}
          <span class="iching-line-num">${lineNum}</span>
        </div>`;
      }
    }).join('');
  }

  // Render hexagram lines from a binary string
  function renderHexagramLinesFromBinary(binary) {
    const lines = binary.split('').map(v => ({
      value: parseInt(v),
      type: 'young_yang',
    }));
    // Invert yin/yang types for display only — all non-changing
    const displayLines = lines.map(l => ({
      ...l,
      type: l.value === 1 ? 'young_yang' : 'young_yin',
    }));
    return renderHexagramLines(displayLines);
  }

  async function performIChingAIReading() {
    if (!AstroAI.hasApiKey()) {
      alert(t('Please set your DeepSeek API Key first', '请先设置 DeepSeek API Key'));
      return;
    }
    if (!_ichingLines) return;

    const hexagram = IChing.getHexagram(_ichingLines);
    const changingHex = IChing.getChangingHexagram(_ichingLines);
    const question = document.getElementById('iching-question')?.value?.trim() || '';

    const output = document.getElementById('iching-reading-output');
    const btn = document.getElementById('iching-ai-btn');
    if (btn) btn.disabled = true;
    if (output) {
      output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">
        ${t('Consulting the I Ching wisdom...', '正在解读卦象...')}
      </div>`;
    }

    try {
      const hexDesc = `Primary: ${hexagram.name} (${hexagram.nameEn}) — ${hexagram.meaning}`;
      const changeDesc = changingHex
        ? `\nChanging to: ${changingHex.name} (${changingHex.nameEn}) — ${changingHex.meaning}`
        : '\nNo moving lines — stable hexagram';

      const prompt = lang === 'zh'
        ? `你是一位精通《周易》的智慧占卜师。请为我解读以下卦象：

卦象信息：
${hexDesc}${changeDesc}

我的问题：${question || '请给我一些人生指引'}

请解读：
1. 本卦的含义和象征
2. 各爻位对当前处境的启示
${changingHex ? '3. 变卦的含义和转变方向' : '3. 如何运用这个卦象的智慧'}
4. 针对求问者的具体建议

用中文回答，语言优美深刻，200-400字。`
        : `You are a wise I Ching oracle. Please interpret this hexagram for me:

Hexagram:
${hexDesc}${changeDesc}

My question: ${question || 'Please give me general guidance'}

Please include:
1. The meaning and symbolism of the hexagram
2. What the lines reveal about the current situation
${changingHex ? '3. The meaning of the changing hexagram and transformation' : '3. How to apply this wisdom'}
4. Practical advice for the seeker

Write poetically and wisely, 200-400 words.`;

      const reading = await AstroAI.askQuestion(prompt, lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, reading, 25);
      }
    } catch (err) {
      if (output) {
        output.innerHTML = `<div style="color:#ef4444;">
          ${t('Error', '错误')}: ${err.message}
        </div>`;
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ===== Check if AI is connected (for UI feedback) =====
  function checkAIConnected() {
    return AstroAI.hasApiKey();
  }

  // ===== Astro Dice =====
  function initDice() {
    const btn = document.getElementById('dice-btn');
    const result = document.getElementById('dice-result');
    if (!btn || !result) return;

    btn.addEventListener('click', () => {
      btn.classList.add('rolling');
      const meanings = Astro.DICE_MEANINGS[lang];
      const meaning = meanings[Math.floor(Math.random() * meanings.length)];
      
      setTimeout(() => {
        btn.classList.remove('rolling');
        result.textContent = `🎲 ${meaning}`;
      }, 600);
    });
  }

  // ===== Moon Phase =====
  function initMoonPhase() {
    const container = document.getElementById('moon-phase-display');
    if (!container) return;

    const moon = Astro.getMoonPhase(new Date());
    const phase = lang === 'zh' ? moon.phaseZh : moon.phase;
    const illumin = (moon.illumination * 100).toFixed(0);

    // SVG Moon
    const svgSize = 120;
    const r = 50;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    
    let moonSvg;
    if (moon.illumination < 0.05 || moon.illumination > 0.95) {
      // New or Full Moon
      const fill = moon.illumination < 0.05 ? '#1a1a2e' : '#f0e6d0';
      moonSvg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#d4af37" stroke-width="1"/>`;
    } else {
      // Crescent/gibbous
      const isWaxing = moon.illumination < 0.5;
      const litSide = isWaxing ? 'right' : 'left';
      const litColor = '#f0e6d0';
      const darkColor = '#1a1a2e';
      
      moonSvg = `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${darkColor}" stroke="#d4af37" stroke-width="1"/>
        <path d="M ${cx} ${cy - r} A ${r * (1 - moon.illumination)} ${r} 0 0 ${litSide === 'right' ? 1 : 0} ${cx} ${cy + r} A ${r * 0.1} ${r} 0 0 ${litSide === 'right' ? 0 : 1} ${cx} ${cy - r} Z" fill="${litColor}" opacity="0.9"/>
      `;
    }

    const moonSvgFull = `
      <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
        <defs>
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(212,175,55,0.15)"/>
            <stop offset="100%" stop-color="rgba(212,175,55,0)"/>
          </radialGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${r + 15}" fill="url(#moon-glow)"/>
        ${moonSvg}
      </svg>
    `;

    container.innerHTML = `
      <div class="moon-svg">${moonSvgFull}</div>
      <div class="moon-name">${phase}</div>
      <div class="moon-date">${t('Illumination', '照明度')}: ${illumin}% | ${t('Age', '月龄')}: ${moon.age}${t('days', '天')}</div>
    `;
  }

  // ===== Cosmic Weather =====
  function initCosmicWeather() {
    const container = document.getElementById('cosmic-weather');
    if (!container) return;

    const now = new Date();
    const zodiac = Astro.getZodiacSign(now.getMonth() + 1, now.getDate());
    const moon = Astro.getMoonPhase(now);
    const chineseZodiac = Astro.getChineseZodiac(now.getFullYear());

    const items = [
      { icon: '☀️', label: t('Sun Sign', '太阳星座'), value: zodiac[lang].symbol + ' ' + zodiac[lang].name },
      { icon: '🌙', label: t('Moon Phase', '月相'), value: lang === 'zh' ? moon.phaseZh : moon.phase },
      { icon: '🌏', label: t('Chinese Zodiac', '生肖'), value: chineseZodiac[lang] },
      { icon: '🔮', label: t('Lucky Element', '幸运元素'), value: zodiac[lang].element },
      { icon: '⭐', label: t('Ruling Planet', '守护星'), value: zodiac[lang].ruler },
      { icon: '🌈', label: t('Quality', '特质'), value: zodiac[lang].quality },
    ];

    container.innerHTML = items.map(item => `
      <div class="weather-item">
        <div class="weather-icon">${item.icon}</div>
        <div class="weather-label">${item.label}</div>
        <div class="weather-value">${item.value}</div>
      </div>
    `).join('');
  }

  // ===== Language Toggle =====
  function initLanguageToggle() {
    const btn = document.querySelector('.language-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        setLanguage(lang === 'zh' ? 'en' : 'zh');
      });
    }
  }

  // ===== Dream Weaver / 梦境解梦 =====
  function initDreamWeaver() {
    const dreamBtn = document.getElementById('dream-btn');
    if (!dreamBtn) return;

    dreamBtn.addEventListener('click', performDreamReading);

    // Allow Enter to submit (but Shift+Enter for newline in textarea)
    const dreamInput = document.getElementById('dream-input');
    if (dreamInput) {
      dreamInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          performDreamReading();
        }
      });
    }
  }

  async function performDreamReading() {
    const input = document.getElementById('dream-input');
    const output = document.getElementById('dream-output');
    const dream = input?.value?.trim();

    if (!dream) {
      alert(t('Please describe your dream first', '请先描述你的梦境'));
      return;
    }

    if (!AstroAI.hasApiKey()) {
      alert(t('Please set your DeepSeek API Key first', '请先设置 DeepSeek API Key'));
      return;
    }

    const btn = document.getElementById('dream-btn');
    if (btn) btn.disabled = true;
    if (output) {
      output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">
        ${t('Weaving the threads of your dream...', '正在编织你的梦境线索...')}
      </div>`;
    }

    try {
      const prompt = lang === 'zh'
        ? `你是一位精通符号学与心理学的梦境解梦师。请为以下梦境提供深刻、有洞察力的解读。

梦境描述：${dream}

请从以下角度解读：
1. 梦境中的核心象征符号及其含义
2. 梦境可能反映的心理状态或情感
3. 梦境对现实生活的启示
4. 给做梦者的建议

请用温暖、富有诗意的语言回应，200-400字。`
        : `You are a wise dream interpreter with deep knowledge of symbolism, psychology, and mystical traditions. Please interpret the following dream with insight and depth.

Dream description: ${dream}

Please include in your interpretation:
1. Key symbols in the dream and their meanings
2. What the dream may reveal about the dreamer's inner state
3. Guidance and messages the dream carries
4. Practical advice for the dreamer

Speak warmly and poetically, 200-400 words.`;

      const reading = await AstroAI.askQuestion(prompt, lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, reading, 25);
      }
    } catch (err) {
      if (output) {
        output.innerHTML = `<div style="color:#ef4444;">
          ${t('Error', '错误')}: ${err.message}
        </div>`;
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ===== Public API =====
  return {
    generateAIReading,
    getAIHoroscope,
    showZodiacDetail,
    switchSection,
    performDreamReading,
  };
})();
