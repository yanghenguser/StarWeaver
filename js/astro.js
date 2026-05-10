/* ============================================
   StarWeaver - Astro.js
   Astronomical Calculations Module
   ============================================ */

const Astro = (() => {
  'use strict';

  // ===== Zodiac Signs =====
  const ZODIAC_SIGNS = {
    en: [
      { name: 'Aries',       symbol: '♈', element: 'Fire',    ruler: 'Mars',     quality: 'Cardinal',   dates: 'Mar 21 – Apr 19', traits: ['Courageous', 'Determined', 'Confident', 'Enthusiastic'] },
      { name: 'Taurus',      symbol: '♉', element: 'Earth',   ruler: 'Venus',    quality: 'Fixed',      dates: 'Apr 20 – May 20', traits: ['Reliable', 'Patient', 'Practical', 'Devoted'] },
      { name: 'Gemini',      symbol: '♊', element: 'Air',     ruler: 'Mercury',  quality: 'Mutable',    dates: 'May 21 – Jun 20', traits: ['Adaptable', 'Curious', 'Communicative', 'Intellectual'] },
      { name: 'Cancer',      symbol: '♋', element: 'Water',   ruler: 'Moon',     quality: 'Cardinal',   dates: 'Jun 21 – Jul 22', traits: ['Intuitive', 'Emotional', 'Protective', 'Tenacious'] },
      { name: 'Leo',         symbol: '♌', element: 'Fire',    ruler: 'Sun',      quality: 'Fixed',      dates: 'Jul 23 – Aug 22', traits: ['Creative', 'Generous', 'Warm', 'Dramatic'] },
      { name: 'Virgo',       symbol: '♍', element: 'Earth',   ruler: 'Mercury',  quality: 'Mutable',    dates: 'Aug 23 – Sep 22', traits: ['Analytical', 'Practical', 'Modest', 'Detail-oriented'] },
      { name: 'Libra',       symbol: '♎', element: 'Air',     ruler: 'Venus',    quality: 'Cardinal',   dates: 'Sep 23 – Oct 22', traits: ['Diplomatic', 'Charming', 'Fair-minded', 'Social'] },
      { name: 'Scorpio',     symbol: '♏', element: 'Water',   ruler: 'Pluto',    quality: 'Fixed',      dates: 'Oct 23 – Nov 21', traits: ['Passionate', 'Resourceful', 'Brave', 'Mysterious'] },
      { name: 'Sagittarius', symbol: '♐', element: 'Fire',    ruler: 'Jupiter',  quality: 'Mutable',    dates: 'Nov 22 – Dec 21', traits: ['Optimistic', 'Adventurous', 'Honest', 'Independent'] },
      { name: 'Capricorn',   symbol: '♑', element: 'Earth',   ruler: 'Saturn',   quality: 'Cardinal',   dates: 'Dec 22 – Jan 19', traits: ['Disciplined', 'Responsible', 'Ambitious', 'Patient'] },
      { name: 'Aquarius',    symbol: '♒', element: 'Air',     ruler: 'Uranus',   quality: 'Fixed',      dates: 'Jan 20 – Feb 18', traits: ['Innovative', 'Progressive', 'Humanitarian', 'Independent'] },
      { name: 'Pisces',      symbol: '♓', element: 'Water',   ruler: 'Neptune',  quality: 'Mutable',    dates: 'Feb 19 – Mar 20', traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'] },
    ],
    zh: [
      { name: '白羊座', symbol: '♈', element: '火', ruler: '火星', quality: '本位',   dates: '3月21日 – 4月19日', traits: ['勇敢', '坚定', '自信', '热情'] },
      { name: '金牛座', symbol: '♉', element: '土', ruler: '金星', quality: '固定',   dates: '4月20日 – 5月20日', traits: ['可靠', '耐心', '务实', '忠诚'] },
      { name: '双子座', symbol: '♊', element: '风', ruler: '水星', quality: '变动',   dates: '5月21日 – 6月20日', traits: ['适应力强', '好奇', '健谈', '聪慧'] },
      { name: '巨蟹座', symbol: '♋', element: '水', ruler: '月亮', quality: '本位',   dates: '6月21日 – 7月22日', traits: ['直觉强', '感性', '保护欲', '执着'] },
      { name: '狮子座', symbol: '♌', element: '火', ruler: '太阳', quality: '固定',   dates: '7月23日 – 8月22日', traits: ['创造', '慷慨', '温暖', '戏剧化'] },
      { name: '处女座', symbol: '♍', element: '土', ruler: '水星', quality: '变动',   dates: '8月23日 – 9月22日', traits: ['分析力', '务实', '谦逊', '注重细节'] },
      { name: '天秤座', symbol: '♎', element: '风', ruler: '金星', quality: '本位',   dates: '9月23日 – 10月22日', traits: ['外交', '魅力', '公正', '社交'] },
      { name: '天蝎座', symbol: '♏', element: '水', ruler: '冥王星', quality: '固定', dates: '10月23日 – 11月21日', traits: ['激情', '足智多谋', '勇敢', '神秘'] },
      { name: '射手座', symbol: '♐', element: '火', ruler: '木星', quality: '变动',   dates: '11月22日 – 12月21日', traits: ['乐观', '冒险', '诚实', '独立'] },
      { name: '摩羯座', symbol: '♑', element: '土', ruler: '土星', quality: '本位',   dates: '12月22日 – 1月19日', traits: ['自律', '负责', '雄心', '耐心'] },
      { name: '水瓶座', symbol: '♒', element: '风', ruler: '天王星', quality: '固定', dates: '1月20日 – 2月18日', traits: ['创新', '进步', '人道', '独立'] },
      { name: '双鱼座', symbol: '♓', element: '水', ruler: '海王星', quality: '变动', dates: '2月19日 – 3月20日', traits: ['同情', '艺术', '直觉', '温柔'] },
    ],
  };

  // ===== Chinese Zodiac =====
  const CHINESE_ZODIAC = ['🐭 Rat', '🐮 Ox', '🐯 Tiger', '🐰 Rabbit', '🐲 Dragon', '🐍 Snake', '🐴 Horse', '🐏 Goat', '🐵 Monkey', '🐔 Rooster', '🐶 Dog', '🐷 Pig'];
  const CHINESE_ZODIAC_ZH = ['🐭 鼠', '🐮 牛', '🐯 虎', '🐰 兔', '🐲 龙', '🐍 蛇', '🐴 马', '🐏 羊', '🐵 猴', '🐔 鸡', '🐶 狗', '🐷 猪'];
  const CHINESE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

  // ===== Planet Data (simplified positions) =====
  const PLANETS = [
    { name: 'Sun',      symbol: '☉', color: '#FFD700' },
    { name: 'Moon',     symbol: '☽', color: '#C0C0C0' },
    { name: 'Mercury',  symbol: '☿', color: '#B5A642' },
    { name: 'Venus',    symbol: '♀', color: '#FF69B4' },
    { name: 'Mars',     symbol: '♂', color: '#FF4500' },
    { name: 'Jupiter',  symbol: '♃', color: '#DAA520' },
    { name: 'Saturn',   symbol: '♄', color: '#8B7355' },
    { name: 'Uranus',   symbol: '♅', color: '#00CED1' },
    { name: 'Neptune',  symbol: '♆', color: '#4169E1' },
    { name: 'Pluto',    symbol: '♇', color: '#8B0000' },
  ];

  // ===== House meanings =====
  const HOUSES = {
    en: [
      'Self & Identity', 'Money & Values', 'Communication & Siblings',
      'Home & Family', 'Pleasure & Creativity', 'Health & Daily Work',
      'Partnerships & Marriage', 'Transformation & Shared Resources',
      'Philosophy & Travel', 'Career & Public Image',
      'Friendships & Hopes', 'Subconscious & Spirituality',
    ],
    zh: [
      '自我与个性', '财富与价值观', '沟通与兄弟姐妹',
      '家庭与根源', '享乐与创造', '健康与日常工作',
      '伴侣与婚姻', '蜕变与共有资源',
      '哲学与旅行', '事业与社会地位',
      '友谊与希望', '潜意识与灵性',
    ],
  };

  // ===== Cosmic Quotes =====
  const QUOTES = {
    en: [
      { text: 'The stars incline, they do not compel.', author: 'Ptolemy' },
      { text: 'Astrology is a language. If you understand it, the sky speaks to you.', author: 'Dane Rudhyar' },
      { text: 'As above, so below; as within, so without.', author: 'Hermes Trismegistus' },
      { text: 'We are all in the gutter, but some of us are looking at the stars.', author: 'Oscar Wilde' },
      { text: 'The cosmos is within us. We are made of star-stuff.', author: 'Carl Sagan' },
      { text: 'Astrology is a map of the soul\'s potential.', author: 'Unknown' },
      { text: 'A wise man rules his stars, a fool follows them.', author: 'Claudius' },
      { text: 'The stars are the street lights of eternity.', author: 'Unknown' },
      { text: 'Every star is a mirror that reflects the truth within you.', author: 'Unknown' },
      { text: 'Your birth chart is not your destiny — it is your potential.', author: 'Unknown' },
    ],
    zh: [
      { text: '星辰指引，而非驱使。', author: '托勒密' },
      { text: '占星是一种语言。如果你懂得它，天空就会对你说话。', author: '丹恩·鲁德希尔' },
      { text: '如其在上，如其在下；如其在内，如其在外。', author: '赫尔墨斯·特里斯墨吉斯忒斯' },
      { text: '我们都身在井隅，但总有人在仰望星空。', author: '奥斯卡·王尔德' },
      { text: '宇宙在我们之内。我们由星辰构成。', author: '卡尔·萨根' },
      { text: '占星是灵魂潜能的图谱。', author: '佚名' },
      { text: '智者主宰星辰，愚者追随星辰。', author: '克劳狄乌斯' },
      { text: '星辰是永恒的路灯。', author: '佚名' },
    ],
  };

  // ===== Fortune Cards =====
  const FORTUNE_CARDS = {
    en: [
      { name: 'The Star',        meaning: 'Hope, inspiration, serenity. The universe guides you.' },
      { name: 'The Moon',        meaning: 'Intuition, dreams, the unknown. Trust your inner voice.' },
      { name: 'The Sun',         meaning: 'Success, vitality, joy. A time of radiance.' },
      { name: 'The World',       meaning: 'Completion, achievement, wholeness. A cycle ends.' },
      { name: 'The Fool',        meaning: 'New beginnings, spontaneity, free spirit. Take the leap.' },
      { name: 'The Magician',    meaning: 'Manifestation, power, skill. You have all you need.' },
      { name: 'The High Priestess', meaning: 'Mystery, inner knowledge, intuition. Look within.' },
      { name: 'The Empress',     meaning: 'Abundance, nature, nurturing. Growth is coming.' },
      { name: 'The Emperor',     meaning: 'Authority, structure, stability. Build your foundation.' },
      { name: 'The Lovers',      meaning: 'Partnership, choices, harmony. Follow your heart.' },
      { name: 'Justice',         meaning: 'Fairness, truth, balance. What you sow, you reap.' },
      { name: 'Temperance',      meaning: 'Balance, moderation, patience. Find your center.' },
    ],
    zh: [
      { name: '星星', meaning: '希望、灵感、宁静。宇宙在指引你。' },
      { name: '月亮', meaning: '直觉、梦境、未知。相信内心的声音。' },
      { name: '太阳', meaning: '成功、活力、喜悦。光芒四射的时刻。' },
      { name: '世界', meaning: '完成、成就、圆满。一个周期结束了。' },
      { name: '愚者', meaning: '新开始、自发性、自由灵魂。勇敢一跃。' },
      { name: '魔术师', meaning: '显化、力量、技能。你已拥有所需一切。' },
      { name: '女祭司', meaning: '神秘、内在知识、直觉。向内求索。' },
      { name: '女皇', meaning: '丰盛、自然、滋养。成长即将到来。' },
      { name: '皇帝', meaning: '权威、结构、稳定。打好你的根基。' },
      { name: '恋人', meaning: '伴侣、选择、和谐。追随内心。' },
      { name: '正义', meaning: '公平、真理、平衡。种瓜得瓜。' },
      { name: '节制', meaning: '平衡、适中、耐心。找到你的中心。' },
    ],
  };

  // ===== Astro Dice meanings =====
  const DICE_MEANINGS = {
    en: [
      'A new opportunity is approaching — keep your eyes open.',
      'Trust your intuition today; it will not lead you astray.',
      'Release what no longer serves you. Make space for the new.',
      'A conversation will change your perspective this week.',
      'The universe is aligning in your favor. Be patient.',
      'Look to the past for a lesson, not a dwelling place.',
      'Your creative energy is at a peak — express yourself.',
      'A relationship is about to deepen. Open your heart.',
      'Financial insight is coming your way. Pay attention.',
      'Travel or movement is in your stars. Embrace the journey.',
      'A secret will be revealed. Handle it with wisdom.',
      'Your inner strength is greater than you know. Trust yourself.',
    ],
    zh: [
      '新的机遇正在靠近——保持警觉。',
      '今天相信你的直觉，它不会让你走错路。',
      '放下不再属于你的东西，为新事物腾出空间。',
      '本周一次对话将改变你的视角。',
      '宇宙正在为你铺路。请耐心等待。',
      '回顾过去是为了吸取教训，而非驻留。',
      '你的创造力正处于高峰——尽情表达吧。',
      '一段关系即将深化。敞开心扉。',
      '财务方面的启示即将到来。请留意。',
      '旅行或变动出现在你的星象中。拥抱这段旅程。',
      '一个秘密将被揭示。以智慧对待它。',
      '你的内在力量远超你的想象。相信自己。',
    ],
  };

  // ===== Zodiac Calculation =====
  function getZodiac(month, day) {
    const dates = [
      { sign: 0, month: 3, day: 21 },  // Aries
      { sign: 1, month: 4, day: 20 },  // Taurus
      { sign: 2, month: 5, day: 21 },  // Gemini
      { sign: 3, month: 6, day: 21 },  // Cancer
      { sign: 4, month: 7, day: 23 },  // Leo
      { sign: 5, month: 8, day: 23 },  // Virgo
      { sign: 6, month: 9, day: 23 },  // Libra
      { sign: 7, month: 10, day: 23 }, // Scorpio
      { sign: 8, month: 11, day: 22 }, // Sagittarius
      { sign: 9, month: 12, day: 22 }, // Capricorn
      { sign: 10, month: 1, day: 20 }, // Aquarius
      { sign: 11, month: 2, day: 19 }, // Pisces
    ];

    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      if ((month === d.month && day >= d.day) || 
          (i < dates.length - 1 && month > d.month && month < dates[i + 1].month) ||
          (i === dates.length - 1 && (month > d.month || (month === 1 && day >= 20) || (month === 2 && day <= 19)))) {
        if (i === dates.length - 1 && month >= 1 && month <= 2) {
          if ((month === 1 && day >= 20) || (month === 2 && day <= 19)) {
            return 10; // Aquarius
          }
          return 11; // Pisces (or more logic needed)
        }
        if (i === 0 && month === 3 && day < 21) return 11; // Pisces
        if (i === 0 && month < 3) return i === 10 ? 10 : (month === 1 ? 10 : 11);
        return d.sign;
      }
    }
    // Fallback
    if (month === 1) return day >= 20 ? 10 : 9;
    if (month === 2) return day >= 19 ? 11 : 10;
    if (month === 3) return day >= 21 ? 0 : 11;
    return 0;
  }

  function getZodiacSign(month, day) {
    const idx = getZodiac(month, day);
    return { en: ZODIAC_SIGNS.en[idx], zh: ZODIAC_SIGNS.zh[idx], index: idx };
  }

  // ===== Chinese Zodiac =====
  function getChineseZodiac(year) {
    const idx = (year - 4) % 12;
    return { en: CHINESE_ZODIAC[idx], zh: CHINESE_ZODIAC_ZH[idx], element: CHINESE_ELEMENTS[Math.floor(((year - 4) % 10) / 2)], index: idx };
  }

  // ===== Moon Phase =====
  function getMoonPhase(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified lunar calculation based on the 19-year Metonic cycle
    const knownNewMoon = new Date(2000, 0, 6, 18, 14); // Known new moon
    const diff = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
    const lunations = diff / 29.53058867;
    const age = (lunations - Math.floor(lunations)) * 29.53058867;
    
    let phase, illumination;
    if (age < 1.84566) { phase = 'New Moon'; illumination = age / 29.53; }
    else if (age < 5.53699) { phase = 'Waxing Crescent'; illumination = age / 29.53; }
    else if (age < 9.22831) { phase = 'First Quarter'; illumination = 0.5 + (age - 5.53699) / 29.53; }
    else if (age < 12.91963) { phase = 'Waxing Gibbous'; illumination = 0.5 + (age - 5.53699) / 29.53; }
    else if (age < 16.61096) { phase = 'Full Moon'; illumination = 1; }
    else if (age < 20.30228) { phase = 'Waning Gibbous'; illumination = 1 - (age - 16.61096) / 29.53; }
    else if (age < 23.9936) { phase = 'Last Quarter'; illumination = 0.5 - (age - 20.30228) / 29.53; }
    else { phase = 'Waning Crescent'; illumination = 0; }

    const phaseZh = {
      'New Moon': '新月', 'Waxing Crescent': '蛾眉月', 'First Quarter': '上弦月',
      'Waxing Gibbous': '盈凸月', 'Full Moon': '满月', 'Waning Gibbous': '亏凸月',
      'Last Quarter': '下弦月', 'Waning Crescent': '残月',
    };

    return {
      phase,
      phaseZh: phaseZh[phase] || phase,
      illumination: Math.max(0, Math.min(1, illumination)),
      age: age.toFixed(1),
      nextFullMoon: new Date(date.getTime() + (29.53 - age) * 24 * 60 * 60 * 1000),
    };
  }

  // ===== Natal Chart (simplified) =====
  function generateNatalChart(year, month, day, hour, lat, lng) {
    const zodiacIdx = getZodiac(month, day);
    const sunSign = ZODIAC_SIGNS.en[zodiacIdx];
    
    // Simplified house cusps (each house = 30°, starting from the ascendant)
    const ascendant = (zodiacIdx * 30 + (hour / 24) * 30 + (day % 30) * 1) % 360;
    const houses = [];
    for (let i = 0; i < 12; i++) {
      const cusp = (ascendant + i * 30) % 360;
      houses.push({
        number: i + 1,
        cusp: cusp,
        signIndex: Math.floor(cusp / 30),
        sign: ZODIAC_SIGNS.en[Math.floor(cusp / 30)],
      });
    }

    // Simplified planetary positions (based on sun sign with offsets)
    const planetPositions = PLANETS.map((planet, i) => {
      const basePos = (zodiacIdx * 30 + i * 27 + (hour * 0.5)) % 360;
      return {
        ...planet,
        position: basePos,
        signIndex: Math.floor(basePos / 30),
        sign: ZODIAC_SIGNS.en[Math.floor(basePos / 30)],
        house: Math.floor(((basePos - ascendant + 360) % 360) / 30) + 1,
      };
    });

    // Aspects
    const aspects = [];
    for (let i = 0; i < planetPositions.length; i++) {
      for (let j = i + 1; j < planetPositions.length; j++) {
        const diff = Math.abs(planetPositions[i].position - planetPositions[j].position);
        const orb = Math.min(diff, 360 - diff);
        let aspect = null;
        if (orb < 8) aspect = { name: 'Conjunction', symbol: '☌', orb: orb.toFixed(1) };
        else if (Math.abs(orb - 60) < 6) aspect = { name: 'Sextile', symbol: '⚹', orb: Math.abs(orb - 60).toFixed(1) };
        else if (Math.abs(orb - 90) < 6) aspect = { name: 'Square', symbol: '□', orb: Math.abs(orb - 90).toFixed(1) };
        else if (Math.abs(orb - 120) < 6) aspect = { name: 'Trine', symbol: '△', orb: Math.abs(orb - 120).toFixed(1) };
        else if (Math.abs(orb - 180) < 6) aspect = { name: 'Opposition', symbol: '☍', orb: Math.abs(orb - 180).toFixed(1) };
        if (aspect) {
          aspects.push({
            p1: planetPositions[i].name,
            p2: planetPositions[j].name,
            ...aspect,
          });
        }
      }
    }

    return {
      sunSign: sunSign,
      ascendant: Math.floor(ascendant / 30),
      ascendantSign: ZODIAC_SIGNS.en[Math.floor(ascendant / 30)],
      moonSignIndex: Math.floor((zodiacIdx * 30 + 135) % 360 / 30),
      houses,
      planets: planetPositions,
      aspects,
    };
  }

  // ===== Compatibility =====
  function calculateCompatibility(sign1, sign2) {
    const elements = { Fire: 0, Earth: 1, Air: 2, Water: 3 };
    const qualities = { Cardinal: 0, Fixed: 1, Mutable: 2 };
    
    const s1 = ZODIAC_SIGNS.en[sign1];
    const s2 = ZODIAC_SIGNS.en[sign2];
    
    const el1 = elements[s1.element];
    const el2 = elements[s2.element];
    const ql1 = qualities[s1.quality];
    const ql2 = qualities[s2.quality];
    
    let score = 50; // Base
    
    // Element compatibility
    if (el1 === el2) score += 20; // Same element
    else if ((el1 === 0 && el2 === 2) || (el1 === 2 && el2 === 0)) score += 10; // Fire + Air
    else if ((el1 === 1 && el2 === 3) || (el1 === 3 && el2 === 1)) score += 10; // Earth + Water
    else if ((el1 === 0 && el2 === 3) || (el1 === 3 && el2 === 0)) score += 5;  // Fire + Water
    else if ((el1 === 1 && el2 === 2) || (el1 === 2 && el2 === 1)) score += 5;  // Earth + Air
    else score -= 5; // Fire + Earth or Water + Air
    
    // Quality
    if (ql1 === ql2) score += 5;
    else if ((ql1 === 0 && ql2 === 2) || (ql1 === 2 && ql2 === 0)) score += 10;
    
    // Opposition harmony
    if (Math.abs(sign1 - sign2) === 6 || Math.abs(sign1 - sign2) === 3 || Math.abs(sign1 - sign2) === 9) score += 10;
    
    // Same sign
    if (sign1 === sign2) score -= 5;
    
    // Signs 2 apart
    if (Math.abs(sign1 - sign2) === 2 || Math.abs(sign1 - sign2) === 10) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  function getCompatibilityDescription(score, lang) {
    if (score >= 85) return lang === 'zh' ? '🌟 天作之合！你们之间有很强的宇宙共鸣。' : '🌟 Cosmic match! Strong universal resonance between you.';
    if (score >= 70) return lang === 'zh' ? '✨ 非常合拍！彼此理解，相辅相成。' : '✨ Great harmony! Mutual understanding and complement each other.';
    if (score >= 55) return lang === 'zh' ? '🌙 和谐相处。有差异，但能互相学习。' : '🌙 Harmonious. Differences exist but you can learn from each other.';
    if (score >= 40) return lang === 'zh' ? '☁️ 需要磨合。不同的能量在碰撞。' : '☁️ Needs work. Different energies colliding.';
    return lang === 'zh' ? '⚡ 充满挑战。需要极大的耐心和理解。' : '⚡ Challenging. Requires great patience and understanding.';
  }

  // ===== Public API =====
  return {
    ZODIAC_SIGNS,
    CHINESE_ZODIAC,
    PLANETS,
    QUOTES,
    FORTUNE_CARDS,
    DICE_MEANINGS,
    HOUSES,
    getZodiacSign,
    getChineseZodiac,
    getMoonPhase,
    generateNatalChart,
    calculateCompatibility,
    getCompatibilityDescription,
  };
})();
