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
  let _pendingRegInfo = null;

  // Coin divination data (gua-index 8×8 lookup + gua-list 64 names)
  const GUA_INDEX = [[2,24,7,19,15,36,46,11],[16,51,40,54,62,55,32,34],[8,3,29,60,39,63,48,5],[45,17,47,58,31,49,28,43],[23,27,4,41,52,22,18,26],[35,21,64,38,56,30,50,14],[20,42,59,61,53,37,57,9],[12,25,6,10,33,13,44,1]];
  const GUA_LIST = ["乾","坤","屯","蒙","需","讼","师","比","小畜","履","泰","否","同人","大有","谦","豫","随","蛊","临","观","噬嗑","贲","剥","复","无妄","大畜","颐","大过","坎","离","咸","恒","遁","大壮","晋","明夷","家人","睽","蹇","解","损","益","夬","姤","萃","升","困","井","革","鼎","震","艮","渐","归妹","丰","旅","巽","兑","涣","节","中孚","小过","既济","未济"];

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
    initNumerology();
    initDice();
    initCoinDivination();
    initLiuYao();
    initMeihua();
    initMoonPhase();
    initCosmicWeather();
    initLuckyGuide();
    initLanguageToggle();
    initUserSystem();
    initShareButtons();
    showRandomQuote();
    populateZodiacSigns();
    initZodiacDetailOverlay();
    localizeInitialGreeting();
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
    updateLuckyGuide();
    if (typeof User !== 'undefined') User.setLanguage(lang);
    updateUserUI();
    updateUsageUI();
    localizeInitialGreeting();
  }

  function updateBottomNavLabels() {
    const labels = lang === 'zh'
      ? ['宇宙', '星盘', '运势', '合盘', '数', '占卜', '占星师']
      : ['Cosmic', 'Chart', 'Scope', 'Match', 'Num.', 'Fortune', 'Oracle'];
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
      { id: 'tab-numerology', en: '🔢 Numerology', zh: '🔢 生命灵数' },
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
    const sections = ['home', 'chart', 'horoscope', 'compatibility', 'numerology', 'fortune', 'chat'];

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

      // Hide previous AI reading when generating new chart
      const aiOutput = document.getElementById('ai-reading-output');
      if (aiOutput) { aiOutput.style.display = 'none'; aiOutput.innerHTML = ''; }
      
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
    if (typeof AstroAI === "undefined" || !AstroAI.hasApiKey()) {
      alert(t('StarWeaver AI not configured', 'StarWeaver AI 未配置'));
      switchSection('chat');
      return;
    }
    if (!chartData || !birthInfo) {
      alert(t('Please enter your birth information first', '请先填写出生信息'));
      switchSection('chart');
      return;
    }

    if (!await checkAIAccess()) return;

    const btn = document.getElementById('btn-ai-reading');
    const output = document.getElementById('ai-reading-output');
    if (btn) btn.disabled = true;
    if (output) {
      output.style.display = 'block';
      output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Consulting the stars...', '正在咨询星辰...')}</div>`;
    }

    try {
      const reading = await AstroAI.getNatalReading(birthInfo, chartData, lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, reading, 25);
      }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      if (typeof User !== 'undefined') User.saveReading('natal', reading);
      await updateUsageUI();
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
    ['horoscope-sign', 'compat-sign1', 'compat-sign2', 'lucky-sign'].forEach(id => {
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
    const sign = parseInt(document.getElementById('horoscope-sign').value);
    const output = document.getElementById('horoscope-ai-output');
    const btn = document.getElementById('btn-ai-horoscope');

    // Try pre-generated daily horoscope first
    if (typeof DailyHoro !== 'undefined') {
      const dailyText = await DailyHoro.getDaily(sign, lang);
      if (dailyText) {
        if (output) {
          output.innerHTML = '<div class="daily-badge">' + t('✦ Daily horoscope', '✦ 今日运势已生成') + '</div>' + dailyText;
          showShareButton('share-horoscope-btn', 'horoscope', dailyText);
        }
        updateUsageUI();
        return;
      }
    }

    if (typeof AstroAI === 'undefined' || !AstroAI.hasApiKey()) {
      alert(t('StarWeaver AI not configured', 'StarWeaver AI 未配置'));
      switchSection('chat');
      return;
    }

    if (!await checkAIAccess()) return;

    if (btn) btn.disabled = true;
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Reading the cosmic tides...', '正在读取宇宙潮汐...')}</div>`;

    try {
      const horoscope = await AstroAI.getHoroscope(sign, new Date(), lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, horoscope, 20, () => {
          showShareButton('share-horoscope-btn', 'horoscope', horoscope);
        });
      }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      if (typeof User !== 'undefined') User.saveReading('horoscope', horoscope);
      await updateUsageUI();
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
        if (typeof AstroAI !== "undefined" && AstroAI.hasApiKey()) {
          if (!await checkAIAccess()) { /* silently skip AI reading */ }
          else try {
            const aiReading = await AstroAI.getCompatibilityReading(name1, sign1, name2, sign2, score, lang);
            const el = document.getElementById('compat-ai-reading');
            if (el) {
              el.innerHTML = '';
              AstroAI.typewriteText(el, aiReading, 25);
            }
            if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
            await updateUsageUI();
          } catch (err) {
            // Silent fallback
          }
        }
      });
    }
  }

  // ===== Localize initial greeting =====
  function localizeInitialGreeting() {
    const el = document.getElementById('initial-greeting');
    if (el) {
      el.textContent = t(
        'Greetings, seeker. I am Stella, weaver of stars and keeper of cosmic wisdom. What questions do you bring before the celestial court tonight?',
        '你好，求问者。我是星织者斯特拉，星辰的编织者，宇宙智慧的守护者。今夜你带来了什么问题来到这星辰的殿堂？'
      );
    }
  }

  // ===== AI Chat =====
  function initAIChat() {
    // AI is auto-connected via embedded key
    const statusEl = document.getElementById('api-key-status');
    if (statusEl) {
      statusEl.textContent = t('✦ AI Oracle ready', '✦ AI 神谕已就绪');
      statusEl.className = 'api-key-status connected';
    }

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const messages = document.getElementById('chat-messages');
        const question = input.value.trim();
        
        if (!question || typeof AstroAI === "undefined" || !AstroAI.hasApiKey()) return;

        if (!await checkAIAccess()) return;

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
          if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
          await updateUsageUI();
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
            <div>${t('Greetings, seeker. I am Stella, weaver of stars and keeper of cosmic wisdom. What questions do you bring before the celestial court tonight?', '你好，求问者。我是星织者斯特拉，星辰的编织者，宇宙智慧的守护者。今夜你带来了什么问题来到这星辰的殿堂？')}</div>
          </div>
        `;
        if (typeof AstroAI !== "undefined") AstroAI.clearConversation();
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

    if (!await checkAIAccess()) return;

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
        AstroAI.typewriteText(readingOutput, reading, 25, () => {
          showShareButton('share-tarot-btn', 'tarot', reading);
        });
      }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      if (typeof User !== 'undefined') User.saveReading('tarot', reading);
      await updateUsageUI();
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
    if (typeof AstroAI === "undefined" || !AstroAI.hasApiKey()) {
      alert(t('StarWeaver AI not configured', 'StarWeaver AI 未配置'));
      return;
    }
    if (!_ichingLines) return;

    if (!await checkAIAccess()) return;

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
      const reading = await AstroAI.getIChingReading(hexagram, changingHex, question, lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, reading, 25, () => {
          showShareButton('share-iching-btn', 'iching', reading);
        });
      }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      if (typeof User !== 'undefined') User.saveReading('iching', reading);
      await updateUsageUI();
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

  // ===== Coin Divination (金钱卦) =====
  let _coinLines = null;
  let _coinData = null;

  function initCoinDivination() {
    const castBtn = document.getElementById('coin-cast-btn');
    const recastBtn = document.getElementById('coin-recast-btn');
    if (castBtn) castBtn.onclick = performCoinDivination;
    if (recastBtn) recastBtn.onclick = performCoinDivination;
  }

  function performCoinDivination() {
    const guaDict1 = ["坤", "震", "坎", "兑", "艮", "离", "巽", "乾"];
    const guaDict2 = ["地", "雷", "水", "泽", "山", "火", "风", "天"];
    const changeYang = ["初九", "九二", "九三", "九四", "九五", "上九"];
    const changeYin = ["初六", "六二", "六三", "六四", "六五", "上六"];

    const lines = IChing.castHexagram();
    _coinLines = lines;

    const changeList = [];
    lines.forEach((line, i) => {
      if (line.type === 'old_yin' || line.type === 'old_yang') {
        changeList.push(line.value ? changeYang[i] : changeYin[i]);
      }
    });

    const upIndex = (lines[5].value ? 4 : 0) + (lines[4].value ? 2 : 0) + (lines[3].value ? 1 : 0);
    const downIndex = (lines[2].value ? 4 : 0) + (lines[1].value ? 2 : 0) + (lines[0].value ? 1 : 0);
    const guaIdx = GUA_INDEX[upIndex][downIndex] - 1;
    const guaName1 = GUA_LIST[guaIdx];
    const guaName2 = upIndex === downIndex
      ? guaDict1[upIndex] + "为" + guaDict2[upIndex]
      : guaDict2[upIndex] + guaDict2[downIndex] + guaName1;
    const guaDesc = guaDict1[upIndex] + "上" + guaDict1[downIndex] + "下";

    const binary = lines.map(l => l.value).join('');
    const hexagram = IChing.getHexagramByBinary(binary);

    // Store for AI
    _coinData = {
      guaName: guaName2,
      guaIdx,
      upperGua: guaDict1[upIndex],
      lowerGua: guaDict1[downIndex],
      upperGua2: guaDict2[upIndex],
      lowerGua2: guaDict2[downIndex],
      guaDesc,
      changeList,
      hexagram,
    };

    const resultCard = document.getElementById('coin-result');
    const resultContent = document.getElementById('coin-result-content');
    if (!resultCard || !resultContent) return;
    resultCard.style.display = 'block';

    resultContent.innerHTML = `
      <div style="text-align:center;margin:1rem 0;">
        <div style="font-size:1.5rem;font-weight:bold;color:var(--gold);">
          ${String(guaIdx + 1).padStart(2, '0')}.${guaName2}
        </div>
        <div style="color:var(--text-secondary);margin:0.3rem 0;">
          ${t('Zhou Yi', '周易')}第${guaIdx + 1}${t('hexagram', '卦')}
        </div>
        <div style="color:var(--text-muted);font-size:0.9rem;">
          ${guaName1}${t('hexagram', '卦')}(${guaName2})_${guaDesc}
        </div>
        ${changeList.length > 0 ? `
        <div style="margin-top:0.5rem;color:var(--gold);font-size:0.85rem;">
          ${t('Changing lines', '变爻')}: ${changeList.join(', ')}
        </div>` : `
        <div style="margin-top:0.5rem;color:var(--text-muted);font-size:0.85rem;">
          ${t('No changing lines', '无变爻')}
        </div>`}
        ${hexagram ? `
        <hr style="border-color:var(--border-subtle);margin:0.8rem 0;">
        <div style="font-size:0.9rem;color:var(--text-secondary);text-align:left;line-height:1.6;">
          <strong>${hexagram.meaning}</strong><br>
          <span style="color:var(--text-muted);font-size:0.85rem;">${hexagram.meaningEn}</span>
        </div>` : ''}
        <button class="btn btn-purple" id="coin-ai-btn" style="margin-top:0.8rem;width:100%;">🤖 AI 解读 · AI Interpretation</button>
        <div class="reading-output" id="coin-ai-output" style="margin-top:0.8rem;"></div>
      </div>
    `;

    const aiBtn = document.getElementById('coin-ai-btn');
    if (aiBtn) aiBtn.onclick = performCoinAI;
  }

  async function performCoinAI() {
    if (typeof AstroAI === 'undefined' || !AstroAI.hasApiKey()) { alert(t('AI not configured', 'AI 未配置')); return; }
    if (!_coinData) return;
    if (!await checkAIAccess()) return;

    const question = document.getElementById('coin-question')?.value?.trim() || '';
    const output = document.getElementById('coin-ai-output');
    const btn = document.getElementById('coin-ai-btn');
    if (btn) btn.disabled = true;
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Interpreting...', '正在解读...')}</div>`;

    try {
      const upperGua = _coinData.upperGua2 + _coinData.upperGua;
      const lowerGua = _coinData.lowerGua2 + _coinData.lowerGua;
      const reading = await AstroAI.getCoinReading(_coinData.guaName, _coinData.guaIdx, upperGua, lowerGua, _coinData.changeList, _coinData.hexagram, question, lang);
      if (output) { output.innerHTML = ''; AstroAI.typewriteText(output, reading, 25); }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      await updateUsageUI();
    } catch (err) {
      if (output) output.innerHTML = `<div style="color:#ef4444;">${t('Error', '错误')}: ${err.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ===== LiuYao / 六爻 =====
  let _liuyaoAnalysis = null;

  function initLiuYao() {
    const castBtn = document.getElementById('liuyao-cast-btn');
    const recastBtn = document.getElementById('liuyao-recast-btn');
    const aiBtn = document.getElementById('liuyao-ai-btn');
    if (castBtn) castBtn.onclick = performLiuYao;
    if (recastBtn) recastBtn.onclick = performLiuYao;
    if (aiBtn) aiBtn.onclick = performLiuYaoAI;
  }

  function performLiuYao() {
    const resultCard = document.getElementById('liuyao-result');
    const resultContent = document.getElementById('liuyao-result-content');
    if (!resultCard || !resultContent) return;
    resultCard.style.display = 'block';

    const method = document.getElementById('liuyao-method')?.value || 'coin';
    const daystem = document.getElementById('liuyao-daystem')?.value || '';
    const analysis = method === 'yarrow'
      ? LiuYao.performYarrowReading(daystem)
      : LiuYao.performReading(daystem);

    if (!analysis) {
      resultContent.innerHTML = `<div style="color:#ef4444;text-align:center;">${t('Error performing reading', '起卦失败')}</div>`;
      return;
    }

    _liuyaoAnalysis = analysis;
    const binary = analysis.lines.map(l => l.value).join('');
    const hexagram = IChing.getHexagramByBinary(binary);

    let html = `
      <div style="margin:1rem 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">
          <div>
            <span style="font-weight:bold;color:var(--gold);font-size:1.2rem;">
              ${analysis.palace}${t('Palace', '宫')} ${analysis.generation}
            </span>
            ${hexagram ? `<span style="color:var(--text-secondary);margin-left:0.5rem;">${hexagram.num}. ${hexagram.name} · ${hexagram.nameEn}</span>` : ''}
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);">
            ${t('Shi', '世')}${t('Line', '爻')}: ${analysis.shiPosition} · ${t('Ying', '应')}${t('Line', '爻')}: ${analysis.yingPosition}
          </div>
        </div>

        <div class="iching-hexagram-lines" style="margin-bottom:1rem;">
          ${renderLiuYaoLines(analysis.lines)}
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
            <thead>
              <tr style="background:rgba(212,175,55,0.1);">
                <th style="padding:6px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${t('Line', '爻')}</th>
                <th style="padding:6px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${t('Wuxing', '五行')}</th>
                <th style="padding:6px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${t('Relative', '六亲')}</th>
                <th style="padding:6px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${t('Beast', '六兽')}</th>
                <th style="padding:6px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${t('Status', '状态')}</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.lines.slice().reverse().map(line => `
              <tr>
                <td style="padding:4px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">
                  ${line.isShi ? '⦿ ' : ''}${line.isYing ? '◎ ' : ''}${line.position}
                  ${line.isChanging ? '⚡' : ''}
                </td>
                <td style="padding:4px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${line.wuxing}</td>
                <td style="padding:4px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${line.sixRelative}</td>
                <td style="padding:4px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">${line.beast}</td>
                <td style="padding:4px 8px;text-align:center;border-bottom:1px solid var(--border-subtle);">
                  ${line.value === 1 ? '⚊' : '⚋'}
                  ${line.isChanging ? ' (' + t('changing', '变') + ')' : ''}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        ${analysis.changingCount > 0 ? `
        <div style="margin-top:0.8rem;font-size:0.85rem;color:var(--gold);">
          ⚡ ${t('Moving lines', '动爻')}: ${analysis.lines.filter(l => l.isChanging).map(l => l.position).join(', ')}
        </div>` : ''}

        ${hexagram ? `
        <hr style="border-color:var(--border-subtle);margin:0.8rem 0;">
        <div style="font-size:0.9rem;color:var(--text-secondary);line-height:1.6;">
          <strong>${hexagram.meaning}</strong><br>
          <span style="color:var(--text-muted);font-size:0.85rem;">${hexagram.meaningEn}</span>
        </div>` : ''}

        <button class="btn btn-purple" id="liuyao-ai-btn" style="margin-top:0.8rem;width:100%;">🤖 AI 解读 · AI Interpretation</button>
        <div class="reading-output" id="liuyao-ai-output" style="margin-top:0.8rem;"></div>
      </div>
    `;
    resultContent.innerHTML = html;

    // Re-bind AI button in the freshly injected HTML
    const aiBtn = document.getElementById('liuyao-ai-btn');
    if (aiBtn) aiBtn.onclick = performLiuYaoAI;
  }

  async function performLiuYaoAI() {
    if (typeof AstroAI === 'undefined' || !AstroAI.hasApiKey()) {
      alert(t('StarWeaver AI not configured', 'StarWeaver AI 未配置'));
      return;
    }
    if (!_liuyaoAnalysis) return;
    if (!await checkAIAccess()) return;

    const question = document.getElementById('liuyao-question')?.value?.trim() || '';
    const output = document.getElementById('liuyao-ai-output');
    const btn = document.getElementById('liuyao-ai-btn');
    if (btn) btn.disabled = true;
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Interpreting LiuYao...', '正在解读六爻...')}</div>`;

    try {
      const reading = await AstroAI.getLiuYaoReading(_liuyaoAnalysis, question, lang);
      if (output) { output.innerHTML = ''; AstroAI.typewriteText(output, reading, 25); }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      await updateUsageUI();
    } catch (err) {
      if (output) output.innerHTML = `<div style="color:#ef4444;">${t('Error', '错误')}: ${err.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function renderLiuYaoLines(lines) {
    const reversed = [...lines].reverse();
    return reversed.map(l => {
      const cls = l.value === 1 ? 'yang' : 'yin';
      if (l.value === 1) {
        return `<div class="iching-line ${cls} ${l.isChanging ? 'changing' : ''}">
          <span class="iching-line-bar yang-bar"></span>
          ${l.isChanging ? '<span class="iching-change-mark">×</span>' : ''}
          <span class="iching-line-num">${l.position}</span>
        </div>`;
      } else {
        return `<div class="iching-line ${cls} ${l.isChanging ? 'changing' : ''}">
          <span class="iching-line-bar yin-bar">
            <span class="yin-left"></span><span class="yin-gap"></span><span class="yin-right"></span>
          </span>
          ${l.isChanging ? '<span class="iching-change-mark">×</span>' : ''}
          <span class="iching-line-num">${l.position}</span>
        </div>`;
      }
    }).join('');
  }

  // ===== MeiHua / 梅花易数 =====
  let _meihuaResult = null;

  function initMeihua() {
    const methodSelect = document.getElementById('meihua-method');
    if (methodSelect) methodSelect.addEventListener('change', toggleMeihuaMethod);
    const castBtn = document.getElementById('meihua-cast-btn');
    const recastBtn = document.getElementById('meihua-recast-btn');
    if (castBtn) castBtn.onclick = performMeihua;
    if (recastBtn) recastBtn.onclick = performMeihua;
  }

  function toggleMeihuaMethod() {
    const method = document.getElementById('meihua-method')?.value || 'date';
    ['date', 'number', 'character'].forEach(m => {
      const el = document.getElementById('meihua-' + m + '-inputs');
      if (el) el.style.display = m === method ? 'block' : 'none';
    });
  }

  function performMeihua() {
    const method = document.getElementById('meihua-method')?.value || 'date';
    let result;
    switch (method) {
      case 'date': {
        const y = parseInt(document.getElementById('meihua-year')?.value) || new Date().getFullYear();
        const m = parseInt(document.getElementById('meihua-month')?.value) || (new Date().getMonth() + 1);
        const d = parseInt(document.getElementById('meihua-day')?.value) || new Date().getDate();
        const h = parseInt(document.getElementById('meihua-hour')?.value) || new Date().getHours();
        result = MeiHua.fromDate(y, m, d, h);
        break;
      }
      case 'number': {
        const text = document.getElementById('meihua-numbers')?.value || '';
        const nums = text.trim().split(/\s+/).map(Number).filter(n => !isNaN(n) && n > 0);
        if (nums.length === 0) {
          document.getElementById('meihua-result-content').innerHTML =
            `<div style="color:#ef4444;text-align:center;">${t('Please enter valid numbers', '请输入有效数字')}</div>`;
          return;
        }
        result = MeiHua.fromNumbers(nums);
        break;
      }
      case 'character': {
        const text = document.getElementById('meihua-text')?.value || '';
        if (!text.trim()) {
          document.getElementById('meihua-result-content').innerHTML =
            `<div style="color:#ef4444;text-align:center;">${t('Please enter text', '请输入文字')}</div>`;
          return;
        }
        result = MeiHua.fromCharacters(text);
        break;
      }
    }

    const resultCard = document.getElementById('meihua-result');
    const resultContent = document.getElementById('meihua-result-content');
    if (!resultCard || !resultContent) return;

    if (!result) {
      resultCard.style.display = 'block';
      resultContent.innerHTML = `<div style="color:#ef4444;text-align:center;">${t('Invalid parameters', '参数无效，请重新输入')}</div>`;
      return;
    }
    resultCard.style.display = 'block';
    _meihuaResult = result;

    const hexagram = result.hexagram;
    const changedHexagram = result.changedHexagram;
    const tri = MeiHua.TRIGRAM_DATA;

    const auspColor = result.relation.auspicious.includes('吉')
      ? 'var(--gold)'
      : result.relation.auspicious.includes('凶')
        ? '#ef4444'
        : 'var(--text-secondary)';

    let html = `
      <div style="text-align:center;margin:1rem 0;">
        <div style="display:flex;justify-content:center;align-items:center;gap:2rem;margin-bottom:1rem;">
          <div>
            <div style="font-size:2.5rem;">${tri[result.upperTrigram]?.symbol || '?'}</div>
            <div style="font-size:0.9rem;color:var(--text-muted);">${t('Upper', '上')} ${result.upperTrigram}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${result.upperElement}</div>
          </div>
          <div style="font-size:1.5rem;color:var(--gold);">☯</div>
          <div>
            <div style="font-size:2.5rem;">${tri[result.lowerTrigram]?.symbol || '?'}</div>
            <div style="font-size:0.9rem;color:var(--text-muted);">${t('Lower', '下')} ${result.lowerTrigram}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${result.lowerElement}</div>
          </div>
        </div>`;

    if (hexagram) {
      html += `<div style="font-size:1.3rem;font-weight:bold;color:var(--gold);margin-bottom:0.3rem;">
        ${hexagram.num}. ${hexagram.name} · ${hexagram.nameEn}
      </div>`;
    }

    html += `
      <div style="font-size:0.9rem;color:var(--text-secondary);margin:0.5rem 0;">
        ${t('Moving line', '动爻')}: ${t('Line', '第')}${result.movingLine}${t('from bottom', '爻 (从下往上)')}
      </div>
      <hr style="border-color:var(--border-subtle);margin:0.8rem 0;">
      <div style="display:flex;justify-content:center;gap:2rem;margin:0.5rem 0;">
        <div>
          <div style="font-size:0.85rem;color:var(--text-muted);">${t('Body trigram', '体卦')}</div>
          <div style="font-size:1.3rem;font-weight:bold;">${result.tiName}</div>
          <div style="font-size:0.85rem;color:var(--text-muted);">${result.tiEl}</div>
        </div>
        <div style="display:flex;align-items:center;font-size:1.5rem;color:${auspColor};">↕</div>
        <div>
          <div style="font-size:0.85rem;color:var(--text-muted);">${t('Function trigram', '用卦')}</div>
          <div style="font-size:1.3rem;font-weight:bold;">${result.yongName}</div>
          <div style="font-size:0.85rem;color:var(--text-muted);">${result.yongEl}</div>
        </div>
      </div>
      <div style="font-weight:bold;font-size:1rem;margin:0.5rem 0;color:${auspColor};">
        ${t('Body-Function', '体用')}: ${result.relation.text} — ${result.relation.auspicious}
      </div>`;

    if (changedHexagram) {
      html += `
        <hr style="border-color:var(--border-subtle);margin:0.8rem 0;">
        <div style="font-size:0.9rem;color:var(--gold);font-weight:600;">
          → ${t('Changing to', '变卦')}: ${changedHexagram.num}. ${changedHexagram.name} · ${changedHexagram.nameEn}
        </div>
        <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.3rem;">${changedHexagram.meaning}</div>`;
    }

    if (hexagram) {
      html += `
        <hr style="border-color:var(--border-subtle);margin:0.8rem 0;">
        <div style="font-size:0.9rem;color:var(--text-secondary);text-align:left;line-height:1.6;">
          <strong>${hexagram.meaning}</strong><br>
          <span style="color:var(--text-muted);font-size:0.85rem;">${hexagram.meaningEn}</span>
        </div>`;
    }

    html += `
        <button class="btn btn-purple" id="meihua-ai-btn" style="margin-top:0.8rem;width:100%;">🤖 AI 解读 · AI Interpretation</button>
        <div class="reading-output" id="meihua-ai-output" style="margin-top:0.8rem;"></div>
      </div>`;
    resultContent.innerHTML = html;

    // Re-bind AI button
    const aiBtn = document.getElementById('meihua-ai-btn');
    if (aiBtn) aiBtn.onclick = performMeihuaAI;
  }

  async function performMeihuaAI() {
    if (typeof AstroAI === 'undefined' || !AstroAI.hasApiKey()) {
      alert(t('StarWeaver AI not configured', 'StarWeaver AI 未配置'));
      return;
    }
    if (!_meihuaResult) return;
    if (!await checkAIAccess()) return;

    const output = document.getElementById('meihua-ai-output');
    const btn = document.getElementById('meihua-ai-btn');
    if (btn) btn.disabled = true;
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Interpreting MeiHua...', '正在解读梅花易数...')}</div>`;

    try {
      const reading = await AstroAI.getMeiHuaReading(_meihuaResult, lang);
      if (output) { output.innerHTML = ''; AstroAI.typewriteText(output, reading, 25); }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      await updateUsageUI();
    } catch (err) {
      if (output) output.innerHTML = `<div style="color:#ef4444;">${t('Error', '错误')}: ${err.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ===== Check if AI is connected (for UI feedback) =====
  function checkAIConnected() {
    return typeof AstroAI !== "undefined" && AstroAI.hasApiKey();
  }

  // ===== Astro Dice (3-dice: planet + sign + house) =====
  let _diceResult1 = null;
  let _diceResult2 = null;

  function initDice() {
    function rollOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function setupDice(btnId, prefix) {
      const btn = document.getElementById(btnId);
      const results = document.getElementById(`dice-results${prefix}`);
      const planetEl = document.getElementById(`dice-planet${prefix}`);
      const signEl = document.getElementById(`dice-sign${prefix}`);
      const houseEl = document.getElementById(`dice-house${prefix}`);
      const readingEl = document.getElementById(`dice-reading${prefix}`);
      if (!btn) return;

      btn.addEventListener('click', async () => {
        btn.classList.add('rolling');
        btn.textContent = '🎲 掷骰中...';
        btn.disabled = true;

        const pData = Astro.DICE_MEANINGS.planety[lang] || Astro.DICE_MEANINGS.planety.en;
        const sData = Astro.DICE_MEANINGS.sign[lang] || Astro.DICE_MEANINGS.sign.en;
        const hData = Astro.DICE_MEANINGS.house[lang] || Astro.DICE_MEANINGS.house.en;

        const planet = rollOne(pData);
        const sign = rollOne(sData);
        const house = rollOne(hData);

        // Store for AI
        if (prefix === '') _diceResult1 = { planet, sign, house };
        else _diceResult2 = { planet, sign, house };

        setTimeout(() => {
          btn.classList.remove('rolling');
          btn.textContent = '🎲 再掷一次';
          btn.disabled = false;

          planetEl.textContent = planet;
          signEl.textContent = sign;
          houseEl.textContent = house;
          results.style.display = 'flex';

          // Simple interpretation + AI button
          const interpretations = {
            en: `The ${planet} in ${sign} of the ${house} suggests cosmic alignment in this area of your life.`,
            zh: `${planet}落${sign}的${house}，宇宙在提醒你关注这个领域的能量流转。`
          };
          const simpleText = interpretations[lang] || interpretations.zh;

          readingEl.innerHTML = `
            <div style="margin-bottom:0.5rem;">${simpleText}</div>
            <button class="btn btn-purple dice-ai-btn" data-prefix="${prefix}" style="padding:8px 16px;font-size:0.8rem;">🤖 AI 解读</button>
            <div class="dice-ai-output" id="dice-ai-output${prefix}" style="margin-top:0.5rem;"></div>
          `;
          readingEl.style.display = 'block';

          // Bind AI button
          const aiBtn = readingEl.querySelector('.dice-ai-btn');
          if (aiBtn) {
            aiBtn.addEventListener('click', () => performDiceAI(prefix));
          }
        }, 800);
      });
    }

    setupDice('dice-btn', '');
    setupDice('dice-btn-2', '-2');
  }

  async function performDiceAI(prefix) {
    if (typeof AstroAI === 'undefined' || !AstroAI.hasApiKey()) {
      alert(t('AI not configured', 'AI 未配置'));
      return;
    }
    const result = prefix === '' ? _diceResult1 : _diceResult2;
    if (!result) return;
    if (!await checkAIAccess()) return;

    const output = document.getElementById(`dice-ai-output${prefix}`);
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Reading the dice...', '正在解读骰子...')}</div>`;

    try {
      const reading = await AstroAI.getDiceReading(result.planet, result.sign, result.house, lang);
      if (output) { output.innerHTML = ''; AstroAI.typewriteText(output, reading, 20); }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      await updateUsageUI();
    } catch (err) {
      if (output) output.innerHTML = `<div style="color:#ef4444;">${t('Error', '错误')}: ${err.message}</div>`;
    }
  }

  // ===== Moon Phase =====
  function initMoonPhase() {
    const container = document.getElementById('moon-phase-display');
    if (!container) return;

    const moon = Astro.getMoonPhase(new Date());
    const phase = lang === 'zh' ? moon.phaseZh : moon.phase;
    const illumin = (moon.illumination * 100).toFixed(0);
    const moonAge = parseFloat(moon.age);

    // SVG Moon — improved realistic rendering
    const svgSize = 160;
    const r = 62;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const litColor = '#f5ecd7';
    const darkFill = 'rgba(20, 18, 40, 0.75)';
    const glowColor = 'rgba(212,175,55,0.15)';
    const isWaxing = moonAge < 14.76;
    const i = Math.max(0, Math.min(1, moon.illumination));

    // Crater positions (static set for natural look)
    const craters = [
      { x: 20, y: 22, r: 4, a: 0.3 }, { x: 35, y: 8, r: 3, a: 0.25 },
      { x: 50, y: 20, r: 5, a: 0.2 }, { x: 15, y: 42, r: 6, a: 0.15 },
      { x: 38, y: 38, r: 3.5, a: 0.22 }, { x: 22, y: 58, r: 4.5, a: 0.18 },
      { x: 48, y: 52, r: 3, a: 0.25 }, { x: 8, y: 28, r: 2.5, a: 0.28 },
      { x: 55, y: 35, r: 2, a: 0.3 }, { x: 30, y: 50, r: 7, a: 0.1 },
    ];

    // Generate crater SVG elements
    function cratersSvg(offsetX, clipSide) {
      let svg = '';
      craters.forEach(c => {
        const cx2 = c.x + offsetX;
        // Only draw craters visible in this region
        if (clipSide === 'left' && cx2 > cx) return;
        if (clipSide === 'right' && cx2 < cx) return;
        svg += `<circle cx="${cx2}" cy="${c.y}" r="${c.r}" fill="rgba(180,170,150,${c.a})" stroke="rgba(160,150,130,${c.a * 0.6})" stroke-width="0.4"/>`;
      });
      return svg;
    }

    // Build moon SVG
    let moonSvg;
    const litWidth = i * 2 * r;

    if (i >= 0.98) {
      // Full moon — lit circle with craters
      moonSvg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${litColor}" stroke="#d4af37" stroke-width="1.2"/>`;
      moonSvg += cratersSvg(0, 'none');
    } else if (i <= 0.02) {
      // New moon — very faint outline
      moonSvg = `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${darkFill}" stroke="#d4af37" stroke-width="1.2" opacity="0.7"/>
        <circle cx="${cx}" cy="${cy}" r="3" fill="#d4af37" opacity="0.25"/>
      `;
    } else {
      // Crescent or gibbous with realistic terminator
      const termX = isWaxing ? (cx - r + litWidth) : (cx + r - litWidth);
      const dx = termX - cx;
      const arcR = Math.max(1.5, Math.abs(dx));

      // Lit base circle
      moonSvg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${litColor}" stroke="#d4af37" stroke-width="1.2"/>`;

      // Shadow overlay on unlit side
      if (isWaxing) {
        // Waxing — lit on right, shadow on left. Craters only on lit (right) side
        moonSvg += `<path d="M ${cx} ${cy - r} A ${arcR} ${r} 0 0 0 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r} Z" fill="${darkFill}"/>`;
        moonSvg += cratersSvg(0, 'right');
      } else {
        // Waning — lit on left, shadow on right. Craters only on lit (left) side
        moonSvg += `<path d="M ${cx} ${cy - r} A ${arcR} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 0 ${cx} ${cy - r} Z" fill="${darkFill}"/>`;
        moonSvg += cratersSvg(0, 'left');
      }
    }

    const moonSvgFull = `
      <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
        <defs>
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${glowColor}"/>
            <stop offset="70%" stop-color="rgba(212,175,55,0.04)"/>
            <stop offset="100%" stop-color="rgba(212,175,55,0)"/>
          </radialGradient>
          <radialGradient id="moon-surface" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stop-color="rgba(255,245,230,0.15)"/>
            <stop offset="60%" stop-color="rgba(200,190,170,0.04)"/>
            <stop offset="100%" stop-color="rgba(180,170,150,0.08)"/>
          </radialGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${r + 20}" fill="url(#moon-glow)"/>
        ${moonSvg}
        <!-- Surface shading -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#moon-surface)" pointer-events="none"/>
      </svg>
    `;

    container.innerHTML = `
      <div class="moon-svg">${moonSvgFull}</div>
      <div class="moon-name">${phase}</div>
      <div class="moon-info">
        <span class="moon-info-item">${t('Illumination', '照明度')}: ${illumin}%</span>
        <span class="moon-info-sep">|</span>
        <span class="moon-info-item">${t('Age', '月龄')}: ${moon.age}${t('days', '天')}</span>
      </div>
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

  // ===== Lucky Guide =====
  function initLuckyGuide() {
    const select = document.getElementById('lucky-sign');
    if (!select) return;

    select.addEventListener('change', updateLuckyGuide);

    // AI lucky guide button
    const aiBtn = document.getElementById('lucky-ai-btn');
    if (aiBtn) aiBtn.addEventListener('click', performLuckyAI);

    updateLuckyGuide();
  }

  function updateLuckyGuide() {
    const select = document.getElementById('lucky-sign');
    const results = document.getElementById('lucky-guide-results');
    if (!select || !results) return;

    const signIndex = parseInt(select.value);
    if (isNaN(signIndex)) return;

    results.style.display = 'grid';

    const numEl = document.getElementById('lucky-number');
    if (numEl) numEl.textContent = LuckyGuide.getLuckyNumber(signIndex);

    const color = LuckyGuide.getLuckyColor(signIndex, lang);
    const swatch = document.getElementById('lucky-color-swatch');
    const colorName = document.getElementById('lucky-color-name');
    if (swatch) swatch.style.background = color.hex;
    if (colorName) colorName.textContent = color.name;

    const dir = LuckyGuide.getLuckyDirection(signIndex);
    const dirEl = document.getElementById('lucky-direction');
    if (dirEl) dirEl.textContent = dir.emoji + ' ' + (dir[lang] || dir.en);

    const crystal = LuckyGuide.getLuckyCrystal(signIndex);
    const crystalEl = document.getElementById('lucky-crystal');
    if (crystalEl) crystalEl.textContent = crystal[lang] || crystal.en;

    const labels = results.querySelectorAll('.lucky-guide-label');
    const labelTexts = [
      t('Lucky Number', '幸运数字'),
      t('Lucky Color', '幸运颜色'),
      t('Lucky Direction', '幸运方向'),
      t('Lucky Crystal', '幸运水晶'),
    ];
    labels.forEach((el, i) => {
      if (labelTexts[i]) el.textContent = labelTexts[i];
    });
  }

  async function performLuckyAI() {
    if (typeof AstroAI === 'undefined' || !AstroAI.hasApiKey()) {
      alert(t('AI not configured', 'AI 未配置'));
      return;
    }
    if (!await checkAIAccess()) return;

    const select = document.getElementById('lucky-sign');
    const signIndex = parseInt(select?.value);
    if (isNaN(signIndex)) return;

    const sign = Astro.ZODIAC_SIGNS[lang][signIndex];
    const luckyNum = LuckyGuide.getLuckyNumber(signIndex);
    const color = LuckyGuide.getLuckyColor(signIndex, lang);
    const dir = LuckyGuide.getLuckyDirection(signIndex);
    const crystal = LuckyGuide.getLuckyCrystal(signIndex);

    const output = document.getElementById('lucky-ai-output');
    const btn = document.getElementById('lucky-ai-btn');
    if (btn) btn.disabled = true;
    if (output) output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">${t('Channeling lucky energy...', '正在感应幸运能量...')}</div>`;

    try {
      const reading = await AstroAI.getLuckyGuideReading(sign.name, luckyNum, color.name, dir[lang] || dir.en, crystal[lang] || crystal.en, lang);
      if (output) { output.innerHTML = ''; AstroAI.typewriteText(output, reading, 20); }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      await updateUsageUI();
    } catch (err) {
      if (output) output.innerHTML = `<div style="color:#ef4444;">${t('Error', '错误')}: ${err.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
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

    if (typeof AstroAI === "undefined" || !AstroAI.hasApiKey()) {
      alert(t('StarWeaver AI not configured', 'StarWeaver AI 未配置'));
      return;
    }

    if (!await checkAIAccess()) return;

    const btn = document.getElementById('dream-btn');
    if (btn) btn.disabled = true;
    if (output) {
      output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">
        ${t('Weaving the threads of your dream...', '正在编织你的梦境线索...')}
      </div>`;
    }

    try {
      const reading = await AstroAI.getDreamReading(dream, lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, reading, 25);
      }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      if (typeof User !== 'undefined') User.saveReading('dream', reading);
      await updateUsageUI();
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

  // ===== Numerology / 生命灵数 =====
  function initNumerology() {
    const form = document.getElementById('numerology-form');
    if (!form) return;

    // Populate year
    const yearSelect = document.getElementById('numerology-year');
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      const y = now.getFullYear() - i;
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
    yearSelect.value = now.getFullYear() - 30;

    // Populate month
    const monthSelect = document.getElementById('numerology-month');
    for (let i = 1; i <= 12; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      monthSelect.appendChild(opt);
    }
    monthSelect.value = now.getMonth() + 1;

    // Populate day
    const daySelect = document.getElementById('numerology-day');
    for (let i = 1; i <= 31; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      daySelect.appendChild(opt);
    }
    daySelect.value = now.getDate();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      performNumerologyCalculation();
    });

    const aiBtn = document.getElementById('numerology-ai-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', performNumerologyAI);
    }
  }

  function performNumerologyCalculation() {
    const name = document.getElementById('numerology-name').value.trim() || t('Seeker', '求问者');
    const year = parseInt(document.getElementById('numerology-year').value);
    const month = parseInt(document.getElementById('numerology-month').value);
    const day = parseInt(document.getElementById('numerology-day').value);

    if (!year || !month || !day) {
      alert(t('Please fill in your birth date', '请填写出生日期'));
      return;
    }

    const summary = Numerology.getSummary(year, month, day, name, lang);
    const resultCard = document.getElementById('numerology-result-card');
    const resultsEl = document.getElementById('numerology-results');

    if (!resultCard || !resultsEl) return;

    const orderedKeys = ['lifePath', 'expression', 'soulUrge', 'personality'];
    const labels = {
      lifePath:  { en: 'Life Path',     zh: '生命道路' },
      expression: { en: 'Expression',    zh: '表现' },
      soulUrge:  { en: 'Soul Urge',     zh: '灵魂渴望' },
      personality: { en: 'Personality',  zh: '个性' },
    };

    resultsEl.innerHTML = orderedKeys.map((key) => {
      const data = summary[key];
      const label = labels[key][lang] || labels[key].en;
      const isMaster = data.isMaster;
      const numClass = isMaster ? 'numerology-number master' : 'numerology-number';
      return `
        <div class="numerology-item">
          <div class="numerology-label">${label}</div>
          <div class="${numClass}" style="--num-color:${data.color};">
            <span class="numerology-digit">${data.number}</span>
            ${isMaster ? '<span class="numerology-master-badge">★ Master</span>' : ''}
          </div>
          <div class="numerology-icon">${data.icon}</div>
          <div class="numerology-title">${data.title}</div>
          <div class="numerology-desc">${data.desc}</div>
        </div>
      `;
    }).join('');

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function performNumerologyAI() {
    if (typeof AstroAI === "undefined" || !AstroAI.hasApiKey()) {
      alert(t('StarWeaver AI not configured', 'StarWeaver AI 未配置'));
      return;
    }

    if (!await checkAIAccess()) return;

    const name = document.getElementById('numerology-name').value.trim() || t('Seeker', '求问者');
    const year = parseInt(document.getElementById('numerology-year').value);
    const month = parseInt(document.getElementById('numerology-month').value);
    const day = parseInt(document.getElementById('numerology-day').value);

    if (!year || !month || !day) {
      alert(t('Please fill in your birth date', '请填写出生日期'));
      return;
    }

    // Ensure results are shown first
    const resultCard = document.getElementById('numerology-result-card');
    if (resultCard) resultCard.style.display = 'block';

    const summary = Numerology.getSummary(year, month, day, name, lang);
    const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const output = document.getElementById('numerology-ai-output');
    const btn = document.getElementById('numerology-ai-btn');
    if (btn) btn.disabled = true;
    if (output) {
      output.innerHTML = `<div style="text-align:center;color:var(--text-muted);">
        ${t('Reading the cosmic code...', '正在解读生命灵数...')}
      </div>`;
    }

    try {
      const reading = await AstroAI.getNumerologyReading(summary, name, birthDateStr, lang);
      if (output) {
        output.innerHTML = '';
        AstroAI.typewriteText(output, reading, 25, () => {
          showShareButton('share-numerology-btn', 'numerology', reading);
        });
      }
      if (typeof User !== 'undefined' && User.isLoggedIn()) await User.useAICredit();
      if (typeof User !== 'undefined') User.saveReading('numerology', reading);
      await updateUsageUI();
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

  // ===== User System =====
  function initUserSystem() {
    if (typeof User === 'undefined') return;

    // Update UI based on login state
    updateUserUI();
    updateUsageUI();

    // Auto-fill from profile if logged in
    autoFillFromProfile();

    // User button click
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
      userBtn.addEventListener('click', () => {
        if (User.isLoggedIn()) {
          showProfileModal();
        } else {
          showAuthModal();
        }
      });
    }

    // Auth modal close
    const authClose = document.getElementById('auth-close');
    if (authClose) authClose.addEventListener('click', hideAuthModal);

    // Auth modal overlay click to close
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) hideAuthModal();
      });
    }

    // Toggle register/login
    const toggleLink = document.getElementById('auth-toggle-link');
    if (toggleLink) {
      toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginView();
      });
    }

    const toggleRegister = document.getElementById('auth-toggle-register');
    if (toggleRegister) {
      toggleRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterView();
      });
    }

    // Auth form submit (step 1: send verification code)
    const authForm = document.getElementById('auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegisterStep1();
      });
    }

    // Verify code form submit (step 2)
    const verifyForm = document.getElementById('verify-form');
    if (verifyForm) {
      verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegisterStep2();
      });
    }

    // Resend code button
    const resendBtn = document.getElementById('resend-code-btn');
    if (resendBtn) {
      resendBtn.addEventListener('click', () => {
        handleRegisterStep1();
      });
    }

    // Back to register button
    const backRegisterBtn = document.getElementById('back-register-btn');
    if (backRegisterBtn) {
      backRegisterBtn.addEventListener('click', () => {
        showRegisterView();
      });
    }

    // Continue button (login view)
    const continueBtn = document.getElementById('auth-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        hideAuthModal();
        updateUserUI();
        updateUsageUI();
        autoFillFromProfile();
      });
    }

    // Logout button (login view)
    const logoutBtn = document.getElementById('auth-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        User.logout();
        hideAuthModal();
        updateUserUI();
        updateUsageUI();
      });
    }

    // Premium modal
    const premiumClose = document.getElementById('premium-close');
    if (premiumClose) premiumClose.addEventListener('click', hidePremiumModal);

    const premiumModal = document.getElementById('premium-modal');
    if (premiumModal) {
      premiumModal.addEventListener('click', (e) => {
        if (e.target === premiumModal) hidePremiumModal();
      });
    }

    // Premium form submit
    const premiumForm = document.getElementById('premium-form');
    if (premiumForm) {
      premiumForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlePremiumUnlock();
      });
    }

    // Populate auth birth date selects
    populateAuthDateSelects();

    // History button
    initHistoryButton();

    // History modal close
    const historyClose = document.getElementById('history-close');
    if (historyClose) historyClose.addEventListener('click', closeHistory);
    const historyCloseBtn = document.getElementById('history-close-btn');
    if (historyCloseBtn) historyCloseBtn.addEventListener('click', closeHistory);
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
      historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) closeHistory();
      });
    }

    // Profile update form
    initProfileUpdateForm();
  }

  function populateAuthDateSelects() {
    const now = new Date();
    const defaultYear = now.getFullYear() - 30;

    // Populate both register (auth-year) and login (auth-login-year) select sets
    ['', '-login'].forEach(suffix => {
      const yearSelect = document.getElementById('auth' + suffix + '-year');
      if (yearSelect) {
        for (let i = 0; i < 100; i++) {
          const y = now.getFullYear() - i;
          const opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y;
          yearSelect.appendChild(opt);
        }
        yearSelect.value = defaultYear;
      }

      const monthSelect = document.getElementById('auth' + suffix + '-month');
      if (monthSelect) {
        for (let i = 1; i <= 12; i++) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = i;
          monthSelect.appendChild(opt);
        }
        monthSelect.value = now.getMonth() + 1;
      }

      const daySelect = document.getElementById('auth' + suffix + '-day');
      if (daySelect) {
        for (let i = 1; i <= 31; i++) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = i;
          daySelect.appendChild(opt);
        }
        daySelect.value = now.getDate();
      }
    });
  }

  // ===== Auto-fill from profile =====
  function autoFillFromProfile() {
    if (typeof User === 'undefined' || !User.isLoggedIn()) return;
    const info = User.getBirthInfo();
    if (!info) return;

    // Auto-fill birth form
    if (info.name) {
      const nameEl = document.getElementById('birth-name');
      if (nameEl && !nameEl.value) nameEl.value = info.name;
    }
    if (info.year) {
      const yEl = document.getElementById('birth-year');
      if (yEl) yEl.value = info.year;
    }
    if (info.month) {
      const mEl = document.getElementById('birth-month');
      if (mEl) mEl.value = info.month;
    }
    if (info.day) {
      const dEl = document.getElementById('birth-day');
      if (dEl) dEl.value = info.day;
    }
    if (info.hour !== null && info.hour !== undefined) {
      const hEl = document.getElementById('birth-hour');
      if (hEl) hEl.value = info.hour;
    }
    if (info.birthplace) {
      const bpEl = document.getElementById('birthplace');
      if (bpEl && !bpEl.value) bpEl.value = info.birthplace;
    }

    // Auto-fill numerology
    if (info.name) {
      const nEl = document.getElementById('numerology-name');
      if (nEl) nEl.value = info.name;
    }
    if (info.year) {
      const nyEl = document.getElementById('numerology-year');
      if (nyEl) nyEl.value = info.year;
    }
    if (info.month) {
      const nmEl = document.getElementById('numerology-month');
      if (nmEl) nmEl.value = info.month;
    }
    if (info.day) {
      const ndEl = document.getElementById('numerology-day');
      if (ndEl) ndEl.value = info.day;
    }

    // Auto-fill horoscope sign
    if (info.zodiacIndex !== null && info.zodiacIndex !== undefined) {
      const hsEl = document.getElementById('horoscope-sign');
      if (hsEl) hsEl.value = info.zodiacIndex;
      const lsEl = document.getElementById('lucky-sign');
      if (lsEl) {
        lsEl.value = info.zodiacIndex;
        updateLuckyGuide();
      }
    }

    // Auto-fill compatibility sign1
    if (info.zodiacIndex !== null && info.zodiacIndex !== undefined) {
      const cs1El = document.getElementById('compat-sign1');
      if (cs1El) cs1El.value = info.zodiacIndex;
    }
  }

  // ===== Step 1: Send verification code =====
  async function handleRegisterStep1() {
    if (typeof User === 'undefined') return;

    const errorEl = document.getElementById('auth-register-error');
    if (errorEl) errorEl.style.display = 'none';

    const name = document.getElementById('auth-name')?.value?.trim();
    if (!name) {
      if (errorEl) { errorEl.textContent = User.t('Please enter your name', '请输入你的名字'); errorEl.style.display = 'block'; }
      return;
    }

    const email = document.getElementById('auth-email')?.value?.trim();
    if (!email || !email.includes('@')) {
      if (errorEl) { errorEl.textContent = User.t('Please enter a valid email', '请输入有效的邮箱'); errorEl.style.display = 'block'; }
      return;
    }

    const year = parseInt(document.getElementById('auth-year')?.value) || null;
    const month = parseInt(document.getElementById('auth-month')?.value) || null;
    const day = parseInt(document.getElementById('auth-day')?.value) || null;

    // Store birth info temporarily
    _pendingRegInfo = { name, email, year, month, day };

    const submitBtn = document.getElementById('auth-submit-btn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = User.t('Sending...', '发送中...'); }

    const result = await User.sendVerifyCode(email);

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = User.t('Send Code', '发送验证码'); }

    if (result.ok) {
      // Clear any previous error
      if (errorEl) errorEl.style.display = 'none';

      // Switch to verification view
      const registerView = document.getElementById('auth-register-view');
      const verifyView = document.getElementById('auth-verify-view');
      const codeHint = document.getElementById('verify-code-hint');
      if (registerView) registerView.style.display = 'none';
      if (verifyView) {
        verifyView.style.display = 'block';
        const verifyEmail = document.getElementById('verify-email-display');
        if (verifyEmail) verifyEmail.textContent = email;
      }
      // Show code to user (either from API fallback or if email not configured)
      if (result.code) {
        if (codeHint) {
          if (result.fallback) {
            codeHint.innerHTML = '<span style="color:#f97316;">⚠️ ' + User.t('API unavailable, using offline code', 'API不可用，使用离线验证码') + '</span><br><span style="color:#d4af37;">📋 ' + User.t('Code: ', '验证码：') + '<strong>' + result.code + '</strong></span>';
          } else {
            codeHint.innerHTML = '<span style="color:#d4af37;">📋 ' + User.t('Code: ', '验证码：') + '<strong>' + result.code + '</strong></span> ' + User.t('(displayed on screen)', '（显示在屏幕上）');
          }
          codeHint.style.display = 'block';
        }
        // Auto-fill code input
        const codeInput = document.getElementById('auth-verify-code');
        if (codeInput) codeInput.value = result.code;
      } else {
        if (codeHint) {
          codeHint.innerHTML = '<span style="color:#22c55e;">✉️ ' + User.t('Verification code sent to your email', '验证码已发送至你的邮箱') + '</span><br><small>' + User.t('Check your inbox (and spam folder)', '请检查收件箱（以及垃圾邮件箱）') + '</small>';
          codeHint.style.display = 'block';
        }
      }
      // Focus code input
      setTimeout(() => {
        const codeInput = document.getElementById('auth-verify-code');
        if (codeInput) codeInput.focus();
      }, 300);
    } else {
      // Show error inline in the register form
      const errorEl = document.getElementById('auth-register-error');
      if (errorEl) {
        errorEl.textContent = result.error || User.t('Failed to send verification code', '发送验证码失败');
        errorEl.style.display = 'block';
      }
    }
  }

  // ===== Step 2: Verify code and register =====
  async function handleRegisterStep2() {
    if (typeof User === 'undefined') return;

    const codeHint = document.getElementById('verify-code-hint');

    const code = document.getElementById('auth-verify-code')?.value?.trim();
    if (!code) {
      if (codeHint) {
        codeHint.innerHTML = '<span style="color:#ef4444;">' + User.t('Please enter verification code', '请输入验证码') + '</span>';
        codeHint.style.display = 'block';
      }
      return;
    }

    if (!_pendingRegInfo) {
      showRegisterView();
      return;
    }

    const submitBtn = document.getElementById('auth-verify-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = User.t('Verifying...', '验证中...'); }

    const result = await User.verifyEmailAndRegister(
      _pendingRegInfo.email,
      code,
      _pendingRegInfo.name,
      { year: _pendingRegInfo.year, month: _pendingRegInfo.month, day: _pendingRegInfo.day }
    );

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = User.t('Verify & Register', '验证并注册'); }

    if (result.ok) {
      _pendingRegInfo = null;
      // Reset verify view
      const verifyView = document.getElementById('auth-verify-view');
      const registerView = document.getElementById('auth-register-view');
      if (verifyView) verifyView.style.display = 'none';
      if (registerView) registerView.style.display = 'block';
      const codeInput = document.getElementById('auth-verify-code');
      if (codeInput) codeInput.value = '';
      if (codeHint) codeHint.style.display = 'none';

      hideAuthModal();
      updateUserUI();
      updateUsageUI();
      autoFillFromProfile();

      const userId = User.getProfile()?.userId || '';
      const msg = User.t('🎉 Welcome to StarWeaver! Your ID: ' + userId, '🎉 欢迎加入星织者！你的唯一ID: ' + userId);
      alert(msg);
    } else {
      if (codeHint) {
        codeHint.innerHTML = '<span style="color:#ef4444;">❌ ' + (result.error || User.t('Verification failed', '验证失败')) + '</span>';
        codeHint.style.display = 'block';
      }
    }
  }

  // ===== Init profile update form (in login view) =====
  function initProfileUpdateForm() {
    const updateBtn = document.getElementById('auth-update-profile-btn');
    if (!updateBtn) return;
    updateBtn.addEventListener('click', async () => {
      if (typeof User === 'undefined' || !User.isLoggedIn()) return;

      // Login view uses auth-login-year/month/day
      const year = parseInt(document.getElementById('auth-login-year')?.value) || null;
      const month = parseInt(document.getElementById('auth-login-month')?.value) || null;
      const day = parseInt(document.getElementById('auth-login-day')?.value) || null;

      await User.updateProfile({
        name: User.getProfile()?.name,
        birthYear: year, birthMonth: month, birthDay: day,
      });
      autoFillFromProfile();
      alert(User.t('Profile updated!', '个人信息已更新！'));
    });
  }

  async function handleRegister() {
    // Legacy: now redirects to step 1
    handleRegisterStep1();
  }

  function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    // Default to register view
    showRegisterView();
    modal.style.display = 'flex';
  }

  function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
  }

  function showRegisterView() {
    const registerView = document.getElementById('auth-register-view');
    const loginView = document.getElementById('auth-login-view');
    if (registerView) registerView.style.display = 'block';
    if (loginView) loginView.style.display = 'none';
  }

  function showLoginView() {
    const registerView = document.getElementById('auth-register-view');
    const loginView = document.getElementById('auth-login-view');
    const greeting = document.getElementById('auth-login-greeting');
    if (registerView) registerView.style.display = 'none';
    if (loginView) loginView.style.display = 'block';

    if (typeof User !== 'undefined') {
      const profile = User.isLoggedIn() ? User.getProfile() : null;
      if (greeting) {
        greeting.textContent = profile
          ? (User.t('Welcome back, ', '欢迎回来，') + profile.name)
          : (User.t('No saved profile found. Please register.', '未找到用户信息，请注册。'));
      }
    } else if (greeting) {
      greeting.textContent = 'Welcome back';
    }
  }

  function showProfileModal() {
    if (typeof User === 'undefined') return;
    showLoginView();
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'flex';
  }

  function showPremiumModal() {
    const modal = document.getElementById('premium-modal');
    if (!modal) return;
    const errorEl = document.getElementById('premium-error');
    if (errorEl) errorEl.style.display = 'none';
    modal.style.display = 'flex';
  }

  function hidePremiumModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) modal.style.display = 'none';
  }

  async function handlePremiumUnlock() {
    if (typeof User === 'undefined') return;

    const codeInput = document.getElementById('premium-code');
    const errorEl = document.getElementById('premium-error');
    if (!codeInput || !errorEl) return;

    const code = codeInput.value.trim();
    if (!code) {
      errorEl.textContent = User.t('Please enter an unlock code', '请输入解锁码');
      errorEl.style.display = 'block';
      return;
    }

    const success = await User.redeemCode(code);
    if (success) {
      errorEl.style.display = 'none';
      codeInput.value = '';
      hidePremiumModal();
      updateUserUI();
      updateUsageUI();

      // Check what type of code was redeemed
      const isPremium = await User.isPremium();
      if (isPremium) {
        alert(User.t('🎉 Premium unlocked! Enjoy unlimited AI readings.', '🎉 会员已激活！享受无限 AI 解读。'));
      } else {
        const total = await User.getTotalCredits();
        alert(User.t('🎉 Credits added! You now have ' + total + ' AI readings.', '🎉 次数已添加！你现在有 ' + total + ' 次 AI 解读。'));
      }
    } else {
      errorEl.textContent = User.t('Invalid or used code', '卡密无效或已被使用');
      errorEl.style.display = 'block';
    }
  }

  async function checkAIAccess() {
    if (typeof User === 'undefined') return true;
    if (!User.isLoggedIn()) {
      showAuthModal();
      return false;
    }
    if (!await User.canUseAI()) {
      showPremiumModal();
      return false;
    }
    return true;
  }

  function updateUserUI() {
    if (typeof User === 'undefined') return;
    const userBtn = document.getElementById('user-btn');
    if (!userBtn) return;

    const historyBtn = document.getElementById('history-btn');

    if (User.isLoggedIn()) {
      const profile = User.getProfile();
      const initial = (profile && profile.name) ? profile.name.charAt(0).toUpperCase() : '?';
      userBtn.textContent = initial;
      userBtn.className = 'user-btn logged-in';
      userBtn.style.display = 'flex';
      if (historyBtn) historyBtn.style.display = 'flex';
    } else {
      userBtn.textContent = '👤';
      userBtn.className = 'user-btn';
      userBtn.style.display = 'flex';
      if (historyBtn) historyBtn.style.display = 'none';
    }
  }

  async function updateUsageUI() {
    const counter = document.getElementById('usage-counter');
    if (typeof User === 'undefined') {
      if (counter) counter.style.display = 'none';
      return;
    }

    if (!User.isLoggedIn()) {
      if (counter) counter.style.display = 'none';
      return;
    }

    const isPremium = await User.isPremium();
    if (isPremium) {
      if (counter) {
        counter.style.display = 'flex';
        counter.innerHTML = '<span class="usage-dot premium"></span> ' + User.t('PREMIUM · 无限', 'PREMIUM · 无限');
      }
      return;
    }

    const remaining = await User.getRemainingFree();
    const total = await User.getTotalCredits();
    if (!counter) return;

    counter.style.display = 'flex';
    let dotClass = 'usage-dot';
    if (remaining <= 0) dotClass = 'usage-dot empty';
    else if (remaining <= 2) dotClass = 'usage-dot low';

    const text = Number.isFinite(total)
      ? User.t('AI: ' + remaining + '/' + total + ' left', '剩余 ' + remaining + '/' + total + ' 次')
      : User.t('AI: ' + remaining + ' left', '剩余 ' + remaining + ' 次');

    counter.innerHTML = '<span class="' + dotClass + '"></span> ' + text;
  }

  // ===== Reading History =====
  function initHistoryButton() {
    const btn = document.getElementById('history-btn');
    if (!btn) return;
    btn.addEventListener('click', openHistory);
  }

  async function openHistory() {
    if (typeof User === 'undefined') return;
    const modal = document.getElementById('history-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    const list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:2rem;">
      ${t('Loading history...', '正在加载历史记录...')}
    </div>`;

    const readings = await User.getHistory();
    renderHistoryList(readings);
  }

  function closeHistory() {
    const modal = document.getElementById('history-modal');
    if (modal) modal.style.display = 'none';
  }

  function renderHistoryList(readings) {
    const list = document.getElementById('history-list');
    if (!list) return;

    if (!readings || readings.length === 0) {
      list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:2rem;">
        ${t('No reading history yet', '暂无阅读历史')}
      </div>`;
      return;
    }

    const TYPE_ICONS = {
      horoscope: '⭐', tarot: '🃏', iching: '☯',
      numerology: '🔢', natal: '🌀', dream: '🌙',
    };
    const TYPE_NAMES = {
      horoscope: { en: 'Horoscope', zh: '运势' },
      tarot:     { en: 'Tarot', zh: '塔罗' },
      iching:    { en: 'I Ching', zh: '周易' },
      numerology:{ en: 'Numerology', zh: '生命灵数' },
      natal:     { en: 'Natal Chart', zh: '星盘' },
      dream:     { en: 'Dream', zh: '解梦' },
    };

    list.innerHTML = readings.map(r => {
      const icon = TYPE_ICONS[r.type] || '📜';
      const typeName = TYPE_NAMES[r.type]
        ? (TYPE_NAMES[r.type][lang] || TYPE_NAMES[r.type].en)
        : r.type;
      const date = r.createdAt ? r.createdAt.substring(0, 10) : '';
      const text = r.content || '';
      const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
      return `<div class="history-item">
        <span class="history-item-icon">${icon}</span>
        <div class="history-item-info">
          <span class="history-item-type">${typeName}</span>
          <span class="history-item-date">${date}</span>
          <span class="history-item-preview">${preview}</span>
        </div>
      </div>`;
    }).join('');
  }

  // ===== Share Card Integration =====
  function initShareButtons() {
    if (typeof ShareCard === 'undefined') return;

    // Wire up share button clicks
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        if (typeof ShareCard === 'undefined') return;
        const type = this.dataset.shareType;
        const text = this.dataset.shareText;
        if (!type || !text) return;
        showSharePreview(type, text);
      });
    });

    // Preview modal close
    const modal = document.getElementById('share-preview-modal');
    const closeBtn = document.getElementById('share-preview-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }

    // Download button
    const dlBtn = document.getElementById('share-preview-download');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const img = document.getElementById('share-preview-image');
        if (!img || !img.dataset.shareType || !img.dataset.shareText) return;
        ShareCard.downloadCard(img.dataset.shareType, { text: img.dataset.shareText });
      });
    }

    // Moments button
    const momentsBtn = document.getElementById('share-preview-moments');
    if (momentsBtn) {
      momentsBtn.addEventListener('click', () => {
        const img = document.getElementById('share-preview-image');
        if (!img || !img.dataset.shareType || !img.dataset.shareText) return;
        ShareCard.shareToWeChat(img.dataset.shareType, { text: img.dataset.shareText });
      });
    }
  }

  function showShareButton(btnId, type, text) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (typeof ShareCard === 'undefined') { btn.style.display = 'none'; return; }
    if (typeof User === 'undefined' || !User.isLoggedIn()) { btn.style.display = 'none'; return; }
    btn.dataset.shareType = type;
    btn.dataset.shareText = text;
    btn.style.display = 'inline-flex';
  }

  function showSharePreview(type, text) {
    const modal = document.getElementById('share-preview-modal');
    const preview = document.getElementById('share-preview-image');
    if (!modal || !preview) return;
    const dataUrl = ShareCard.getCardDataURL(type, { text });
    preview.src = dataUrl;
    preview.dataset.shareType = type;
    preview.dataset.shareText = text;
    modal.style.display = 'flex';
  }

  // ===== Public API =====
  return {
    generateAIReading,
    getAIHoroscope,
    showZodiacDetail,
    switchSection,
    performDreamReading,
    performNumerologyAI,
  };
})();
