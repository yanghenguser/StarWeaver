/* ============================================
   StarWeaver - luckyguide.js
   Daily Lucky Guide / 每日幸运指南
   ============================================ */

const LuckyGuide = (() => {
  'use strict';

  const DATA = [
    // en, sign, element, numbers, color, colorName, direction, crystal
    { en: 'Aries',     zh: '白羊座', el: 'Fire',  elZh: '火', numbers: [7, 19, 28], color: '#FF4444', cnameEn: 'Scarlet Red', cnameZh: '猩红', dirEn: 'East', dirZh: '东方',   crystalEn: 'Ruby',      crystalZh: '红宝石' },
    { en: 'Taurus',    zh: '金牛座', el: 'Earth', elZh: '土', numbers: [6, 15, 24], color: '#4CAF50', cnameEn: 'Emerald Green',cnameZh: '翠绿', dirEn: 'South',dirZh: '南方',   crystalEn: 'Emerald',   crystalZh: '祖母绿' },
    { en: 'Gemini',    zh: '双子座', el: 'Air',   elZh: '风', numbers: [5, 14, 23], color: '#FFD700', cnameEn: 'Golden Yellow',cnameZh: '金黄', dirEn: 'West', dirZh: '西方',   crystalEn: 'Agate',     crystalZh: '玛瑙' },
    { en: 'Cancer',    zh: '巨蟹座', el: 'Water', elZh: '水', numbers: [2, 11, 20], color: '#87CEEB', cnameEn: 'Silver Blue', cnameZh: '银蓝', dirEn: 'North',dirZh: '北方',   crystalEn: 'Moonstone', crystalZh: '月光石' },
    { en: 'Leo',       zh: '狮子座', el: 'Fire',  elZh: '火', numbers: [1, 10, 19], color: '#FF6B00', cnameEn: 'Gold',        cnameZh: '金色', dirEn: 'South',dirZh: '南方',   crystalEn: 'Citrine',   crystalZh: '黄水晶' },
    { en: 'Virgo',     zh: '处女座', el: 'Earth', elZh: '土', numbers: [5, 14, 23], color: '#8B7355', cnameEn: 'Warm Beige',  cnameZh: '暖米色',dirEn: 'West', dirZh: '西方',   crystalEn: 'Sapphire',  crystalZh: '蓝宝石' },
    { en: 'Libra',     zh: '天秤座', el: 'Air',   elZh: '风', numbers: [6, 15, 24], color: '#FF69B4', cnameEn: 'Pink',        cnameZh: '粉色', dirEn: 'East', dirZh: '东方',   crystalEn: 'Opal',      crystalZh: '蛋白石' },
    { en: 'Scorpio',   zh: '天蝎座', el: 'Water', elZh: '水', numbers: [9, 18, 27], color: '#8B0000', cnameEn: 'Deep Red',    cnameZh: '深红', dirEn: 'North',dirZh: '北方',   crystalEn: 'Obsidian',  crystalZh: '黑曜石' },
    { en: 'Sagittarius', zh: '射手座', el: 'Fire', elZh: '火', numbers: [3, 12, 21], color: '#9B59B6', cnameEn: 'Purple',    cnameZh: '紫色', dirEn: 'South',dirZh: '南方',   crystalEn: 'Turquoise', crystalZh: '绿松石' },
    { en: 'Capricorn', zh: '摩羯座', el: 'Earth', elZh: '土', numbers: [8, 17, 26], color: '#2F4F4F', cnameEn: 'Dark Slate', cnameZh: '深灰', dirEn: 'West', dirZh: '西方',   crystalEn: 'Garnet',    crystalZh: '石榴石' },
    { en: 'Aquarius',  zh: '水瓶座', el: 'Air',   elZh: '风', numbers: [4, 13, 22], color: '#00BFFF', cnameEn: 'Electric Blue',cnameZh: '电蓝', dirEn: 'East', dirZh: '东方',   crystalEn: 'Amethyst',  crystalZh: '紫水晶' },
    { en: 'Pisces',    zh: '双鱼座', el: 'Water', elZh: '水', numbers: [7, 16, 25], color: '#4169E1', cnameEn: 'Royal Blue', cnameZh: '深蓝', dirEn: 'North',dirZh: '北方',   crystalEn: 'Aquamarine',crystalZh: '海蓝宝' },
  ];

  function getData(signIndex) {
    return DATA[signIndex] || DATA[0];
  }

  function getLuckyNumber(signIndex, lang) {
    const d = getData(signIndex);
    const idx = new Date().getDate() % 3;
    return d.numbers[idx];
  }

  function getLuckyColor(signIndex, lang) {
    const d = getData(signIndex);
    return { hex: d.color, name: lang === 'zh' ? d.cnameZh : d.cnameEn };
  }

  function getLuckyDirection(signIndex, lang) {
    const d = getData(signIndex);
    return lang === 'zh' ? d.dirZh : d.dirEn;
  }

  function getLuckyCrystal(signIndex, lang) {
    const d = getData(signIndex);
    return lang === 'zh' ? d.crystalZh : d.crystalEn;
  }

  function getElement(signIndex, lang) {
    const d = getData(signIndex);
    return lang === 'zh' ? d.elZh : d.el;
  }

  return { getLuckyNumber, getLuckyColor, getLuckyDirection, getLuckyCrystal, getElement };
})();
