/* ============================================
   StarWeaver - numerology.js
   Numerology / 生命灵数 Module
   ============================================ */

const Numerology = (() => {
  'use strict';

  // ===== Letter to Number Mapping (A=1, B=2, ..., Z=26) =====
  function letterToNumber(ch) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return code - 64;       // A-Z
    if (code >= 97 && code <= 122) return code - 96;      // a-z
    return 0;
  }

  // ===== Reduce Number (recursive digit sum, preserving master numbers) =====
  function reduceNumber(n) {
    if (n === 0) return 0;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
  }

  // ===== Calculate Life Path Number =====
  function calculateLifePath(year, month, day) {
    const ySum = reduceNumber(String(year).split('').reduce((s, d) => s + parseInt(d), 0));
    const mSum = reduceNumber(month);
    const dSum = reduceNumber(day);
    return reduceNumber(ySum + mSum + dSum);
  }

  // ===== Calculate Expression/Destiny Number =====
  function calculateExpression(name) {
    const clean = name.replace(/[^a-zA-Z]/g, '');
    const total = clean.split('').reduce((sum, ch) => sum + letterToNumber(ch), 0);
    return reduceNumber(total);
  }

  // ===== Calculate Soul Urge Number (vowels only) =====
  function calculateSoulUrge(name) {
    const vowels = name.replace(/[^a-zA-Z]/g, '').split('').filter(ch => 'aeiouAEIOU'.includes(ch));
    const total = vowels.reduce((sum, ch) => sum + letterToNumber(ch), 0);
    return total === 0 ? 0 : reduceNumber(total);
  }

  // ===== Calculate Personality Number (consonants only) =====
  function calculatePersonality(name) {
    const consonants = name.replace(/[^a-zA-Z]/g, '').split('').filter(ch => !'aeiouAEIOU'.includes(ch));
    const total = consonants.reduce((sum, ch) => sum + letterToNumber(ch), 0);
    return total === 0 ? 0 : reduceNumber(total);
  }

  // ===== Number Meanings =====
  const MEANINGS = {
    en: {
      1: {
        title: 'The Pioneer',
        desc: 'Independent, creative, and ambitious. You possess strong leadership qualities and the drive to carve your own path. Natural innovator with original ideas.',
      },
      2: {
        title: 'The Peacemaker',
        desc: 'Diplomatic, sensitive, and cooperative. You excel at building bridges and creating harmony. Your intuitive nature makes you a natural partner and mediator.',
      },
      3: {
        title: 'The Communicator',
        desc: 'Expressive, optimistic, and charismatic. You shine through creativity and self-expression. Your enthusiasm and wit inspire those around you.',
      },
      4: {
        title: 'The Builder',
        desc: 'Practical, disciplined, and reliable. You create solid foundations through hard work and dedication. Your methodical approach builds lasting structures.',
      },
      5: {
        title: 'The Adventurer',
        desc: 'Versatile, curious, and freedom-loving. You thrive on change and new experiences. Your magnetic personality draws others to your adventurous spirit.',
      },
      6: {
        title: 'The Nurturer',
        desc: 'Compassionate, responsible, and harmonious. You are devoted to family and community. Your nurturing nature creates beauty and balance wherever you go.',
      },
      7: {
        title: 'The Seeker',
        desc: 'Analytical, introspective, and spiritual. You delve deep into life\'s mysteries. Your wisdom comes from quiet contemplation and inner knowing.',
      },
      8: {
        title: 'The Achiever',
        desc: 'Ambitious, authoritative, and goal-oriented. You have the power to manifest abundance. Your executive ability turns visions into reality.',
      },
      9: {
        title: 'The Humanitarian',
        desc: 'Compassionate, artistic, and wise. You are guided by universal love and understanding. Your generosity and tolerance inspire global consciousness.',
      },
      11: {
        title: 'The Intuitive (Master Number)',
        desc: 'A spiritual messenger with heightened intuition. You possess deep insight and the power to inspire others through visionary ideas. Your challenge is to manage emotional sensitivity while embracing your role as a light-worker.',
      },
      22: {
        title: 'The Master Builder (Master Number)',
        desc: 'The most powerful of all numbers. You have the vision of the 11 and the practicality of the 4, enabling you to turn grand dreams into reality. Your challenge is to ground your enormous potential into tangible achievements.',
      },
      33: {
        title: 'The Master Teacher (Master Number)',
        desc: 'The pinnacle of spiritual evolution. Your unconditional love and compassion uplift humanity. As a Master Teacher, you inspire others through selfless service and enlightenment.',
      },
    },
    zh: {
      1: {
        title: '开创者',
        desc: '独立、创新、有抱负。你拥有强大的领导能力和开拓自己道路的驱动力。天生的创新者，想法独特而前瞻。',
      },
      2: {
        title: '和平使者',
        desc: '外交、敏感、善于合作。你擅长搭建桥梁、创造和谐。你的直觉天性使你成为天生的伙伴和调停者。',
      },
      3: {
        title: '沟通者',
        desc: '表达力强、乐观、有魅力。你通过创造力和自我表达闪耀光芒。你的热情和智慧激励着身边的人。',
      },
      4: {
        title: '建设者',
        desc: '务实、自律、可靠。你通过勤奋和奉献奠定坚实基础。你条理分明的方法创造持久的成就。',
      },
      5: {
        title: '冒险家',
        desc: '多才多艺、好奇、热爱自由。你在变化和新体验中茁壮成长。你迷人的个性吸引他人跟随你的冒险精神。',
      },
      6: {
        title: '守护者',
        desc: '富有同情心、负责任、和谐。你致力于家庭和社群。你的养育天性在你所到之处创造美与平衡。',
      },
      7: {
        title: '探索者',
        desc: '善于分析、内省、灵性。你深入探索生命的奥秘。你的智慧来自于安静的沉思和内在的觉知。',
      },
      8: {
        title: '成就者',
        desc: '雄心勃勃、权威、目标明确。你拥有显化丰盛的力量。你的执行力能将愿景转化为现实。',
      },
      9: {
        title: '人道主义者',
        desc: '富有同情心、艺术天赋、智慧。你被普世的爱与理解所指引。你的慷慨和包容激发全球意识。',
      },
      11: {
        title: '直觉者（大师数）',
        desc: '拥有高度直觉的灵性使者。你具备深刻的洞察力，能通过远见卓识激励他人。你的挑战是在管理情感敏感度的同时，拥抱你作为光之工作者的使命。',
      },
      22: {
        title: '大师建设者（大师数）',
        desc: '所有数字中最强大的存在。你拥有11的远见和4的务实，能将宏伟梦想变为现实。你的挑战是将巨大的潜力落地为切实的成就。',
      },
      33: {
        title: '大师导师（大师数）',
        desc: '灵性进化的巅峰。你无条件的爱与慈悲提升着整个人类。作为大师导师，你通过无私的服务和启迪激励他人。',
      },
    },
  };

  // ===== Number Colors =====
  const NUMBER_COLORS = {
    1: '#ff6b6b',   // Red
    2: '#ffd93d',   // Yellow
    3: '#6bcb77',   // Green
    4: '#4d96ff',   // Blue
    5: '#ff8e53',   // Orange
    6: '#c084fc',   // Purple
    7: '#22d3ee',   // Cyan
    8: '#f472b6',   // Pink
    9: '#a78bfa',   // Indigo
    11: '#fbbf24',  // Gold
    22: '#34d399',  // Emerald
    33: '#818cf8',  // Periwinkle
  };

  // ===== Number Icons (esoteric symbols) =====
  const NUMBER_ICONS = {
    1: '☀️',  2: '🌙',  3: '✨',  4: '🔺',  5: '⭐',
    6: '💫',  7: '🔮',  8: '♾️',  9: '🌈',
    11: '👁️', 22: '🏛️', 33: '🕊️',
  };

  // ===== Public API: Calculate all numbers =====
  function calculate(birthYear, birthMonth, birthDay, name) {
    const lifePath = calculateLifePath(birthYear, birthMonth, birthDay);
    const expression = calculateExpression(name);
    const soulUrge = calculateSoulUrge(name);
    const personality = calculatePersonality(name);

    return { lifePath, expression, soulUrge, personality };
  }

  // ===== Public API: Get meaning for a number =====
  function getMeaning(num, lang) {
    const langData = MEANINGS[lang] || MEANINGS.en;
    return langData[num] || null;
  }

  // ===== Public API: Get color for a number =====
  function getColor(num) {
    return NUMBER_COLORS[num] || NUMBER_COLORS[reduceNumber(num)];
  }

  // ===== Public API: Get icon for a number =====
  function getIcon(num) {
    return NUMBER_ICONS[num] || NUMBER_ICONS[reduceNumber(num)] || '🔢';
  }

  // ===== Public API: Check if master number =====
  function isMasterNumber(num) {
    return [11, 22, 33].includes(num);
  }

  // ===== Public API: Generate description summary for all numbers =====
  function getSummary(birthYear, birthMonth, birthDay, name, lang) {
    const nums = calculate(birthYear, birthMonth, birthDay, name);
    const result = {};
    for (const [key, val] of Object.entries(nums)) {
      const meaning = getMeaning(val, lang);
      result[key] = {
        number: val,
        title: meaning ? meaning.title : '',
        desc: meaning ? meaning.desc : '',
        color: getColor(val),
        icon: getIcon(val),
        isMaster: isMasterNumber(val),
      };
    }
    return result;
  }

  // ===== Public API =====
  return {
    calculate,
    getMeaning,
    getColor,
    getIcon,
    isMasterNumber,
    getSummary,
  };
})();
