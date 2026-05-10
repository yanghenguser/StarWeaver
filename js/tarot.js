/* ============================================
   StarWeaver - tarot.js
   78-card Tarot Deck + Spreads Module
   ============================================ */

const Tarot = (() => {
  'use strict';

  // ===== 78 Cards Data =====
  const MAJOR_ARCANA = [
    { id: 0,  name: 'The Fool',        nameZh: '愚者',   symbol: '🃏', element: 'Air',  keywords: ['Beginnings', 'Innocence', 'Spontaneity'], keywordsZh: ['开始', '纯真', '自发性'] },
    { id: 1,  name: 'The Magician',    nameZh: '魔术师', symbol: '🎩', element: 'Fire', keywords: ['Manifestation', 'Power', 'Skill'], keywordsZh: ['显化', '力量', '技能'] },
    { id: 2,  name: 'The High Priestess', nameZh: '女祭司', symbol: '🌙', element: 'Water', keywords: ['Intuition', 'Mystery', 'Inner Knowledge'], keywordsZh: ['直觉', '神秘', '内在智慧'] },
    { id: 3,  name: 'The Empress',     nameZh: '女皇',   symbol: '👑', element: 'Earth', keywords: ['Abundance', 'Nature', 'Nurturing'], keywordsZh: ['丰盛', '自然', '滋养'] },
    { id: 4,  name: 'The Emperor',     nameZh: '皇帝',   symbol: '🏛️', element: 'Fire', keywords: ['Authority', 'Structure', 'Stability'], keywordsZh: ['权威', '结构', '稳定'] },
    { id: 5,  name: 'The Hierophant',  nameZh: '教皇',   symbol: '⛪', element: 'Earth', keywords: ['Tradition', 'Wisdom', 'Spiritual Guidance'], keywordsZh: ['传统', '智慧', '灵性指引'] },
    { id: 6,  name: 'The Lovers',      nameZh: '恋人',   symbol: '💑', element: 'Air', keywords: ['Love', 'Choices', 'Harmony'], keywordsZh: ['爱情', '选择', '和谐'] },
    { id: 7,  name: 'The Chariot',     nameZh: '战车',   symbol: '⚔️', element: 'Water', keywords: ['Willpower', 'Victory', 'Determination'], keywordsZh: ['意志力', '胜利', '决心'] },
    { id: 8,  name: 'Strength',        nameZh: '力量',   symbol: '🦁', element: 'Fire', keywords: ['Courage', 'Inner Strength', 'Compassion'], keywordsZh: ['勇气', '内在力量', '同情'] },
    { id: 9,  name: 'The Hermit',      nameZh: '隐士',   symbol: '🏮', element: 'Earth', keywords: ['Soul-searching', 'Solitude', 'Inner Guidance'], keywordsZh: ['内省', '独处', '内在指引'] },
    { id: 10, name: 'Wheel of Fortune', nameZh: '命运之轮', symbol: '🎡', element: 'Fire', keywords: ['Change', 'Cycles', 'Destiny'], keywordsZh: ['变化', '周期', '命运'] },
    { id: 11, name: 'Justice',         nameZh: '正义',   symbol: '⚖️', element: 'Air', keywords: ['Fairness', 'Truth', 'Balance'], keywordsZh: ['公正', '真理', '平衡'] },
    { id: 12, name: 'The Hanged Man',  nameZh: '倒吊人', symbol: '🙃', element: 'Water', keywords: ['Surrender', 'New Perspective', 'Pause'], keywordsZh: ['放下', '新视角', '暂停'] },
    { id: 13, name: 'Death',           nameZh: '死神',   symbol: '💀', element: 'Water', keywords: ['Transformation', 'Endings', 'Renewal'], keywordsZh: ['蜕变', '结束', '新生'] },
    { id: 14, name: 'Temperance',      nameZh: '节制',   symbol: '⚗️', element: 'Fire', keywords: ['Balance', 'Moderation', 'Patience'], keywordsZh: ['平衡', '适中', '耐心'] },
    { id: 15, name: 'The Devil',       nameZh: '恶魔',   symbol: '😈', element: 'Earth', keywords: ['Bondage', 'Materialism', 'Shadow Self'], keywordsZh: ['束缚', '物质主义', '阴影'] },
    { id: 16, name: 'The Tower',       nameZh: '高塔',   symbol: '🗼', element: 'Fire', keywords: ['Sudden Change', 'Revelation', 'Upheaval'], keywordsZh: ['突变', '启示', '剧变'] },
    { id: 17, name: 'The Star',        nameZh: '星星',   symbol: '⭐', element: 'Air', keywords: ['Hope', 'Inspiration', 'Serenity'], keywordsZh: ['希望', '灵感', '宁静'] },
    { id: 18, name: 'The Moon',        nameZh: '月亮',   symbol: '🌑', element: 'Water', keywords: ['Illusion', 'Fear', 'Subconscious'], keywordsZh: ['幻象', '恐惧', '潜意识'] },
    { id: 19, name: 'The Sun',         nameZh: '太阳',   symbol: '☀️', element: 'Fire', keywords: ['Joy', 'Success', 'Vitality'], keywordsZh: ['喜悦', '成功', '活力'] },
    { id: 20, name: 'Judgement',       nameZh: '审判',   symbol: '📯', element: 'Fire', keywords: ['Rebirth', 'Inner Calling', 'Absolution'], keywordsZh: ['重生', '内心召唤', '宽恕'] },
    { id: 21, name: 'The World',       nameZh: '世界',   symbol: '🌍', element: 'Earth', keywords: ['Completion', 'Wholeness', 'Achievement'], keywordsZh: ['完成', '圆满', '成就'] },
  ];

  const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
  const SUITS_ZH = ['权杖', '圣杯', '宝剑', '星币'];
  const SUIT_SYMBOLS = ['🔥', '💧', '⚔️', '🪙'];
  const SUIT_ELEMENTS = ['Fire', 'Water', 'Air', 'Earth'];
  const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
  const RANKS_ZH = ['王牌', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍从', '骑士', '王后', '国王'];

  // Generate Minor Arcana
  function generateMinorArcana() {
    const cards = [];
    const meanings = {
      en: {
        'Ace': { up: 'New beginning, creative spark', rev: 'Blocked potential, delay' },
        'Two': { up: 'Planning, decision-making', rev: 'Indecision, overthinking' },
        'Three': { up: 'Expansion, growth, progress', rev: 'Obstacles, delays' },
        'Four': { up: 'Stability, foundation, security', rev: 'Stagnation, resistance to change' },
        'Five': { up: 'Conflict, competition, challenge', rev: 'Resolution, reconciliation' },
        'Six': { up: 'Success, harmony, cooperation', rev: 'Ego, arrogance, setback' },
        'Seven': { up: 'Assessment, perseverance', rev: 'Overwhelm, giving up' },
        'Eight': { up: 'Movement, progress, speed', rev: 'Slowdown, stagnation' },
        'Nine': { up: 'Accomplishment, resilience', rev: 'Overwork, burnout' },
        'Ten': { up: 'Burden, completion, responsibility', rev: 'Release, letting go' },
        'Page': { up: 'Enthusiasm, curiosity, message', rev: 'Immaturity, lack of direction' },
        'Knight': { up: 'Action, adventure, passion', rev: 'Impulsiveness, recklessness' },
        'Queen': { up: 'Nurturing, warmth, confidence', rev: 'Jealousy, insecurity' },
        'King': { up: 'Leadership, vision, authority', rev: 'Tyranny, inflexibility' },
      },
      zh: {
        'Ace': { up: '新开始，创造火花', rev: '潜力受阻，延迟' },
        'Two': { up: '计划，决策', rev: '犹豫不决，过度思考' },
        'Three': { up: '扩展，成长，进步', rev: '障碍，延迟' },
        'Four': { up: '稳定，基础，安全感', rev: '停滞，抗拒变化' },
        'Five': { up: '冲突，竞争，挑战', rev: '和解，调停' },
        'Six': { up: '成功，和谐，合作', rev: '自负，挫折' },
        'Seven': { up: '评估，坚持', rev: ' overwhelmed，放弃' },
        'Eight': { up: '行动，进步，速度', rev: '减速，停滞' },
        'Nine': { up: '成就，韧性', rev: '过度工作，倦怠' },
        'Ten': { up: '负担，完成，责任', rev: '释放，放手' },
        'Page': { up: '热情，好奇，消息', rev: '不成熟，缺乏方向' },
        'Knight': { up: '行动，冒险，热情', rev: '冲动，鲁莽' },
        'Queen': { up: '滋养，温暖，自信', rev: '嫉妒，不安' },
        'King': { up: '领导力，远见，权威', rev: '专制，固执' },
      }
    };

    SUITS.forEach((suit, si) => {
      RANKS.forEach((rank, ri) => {
        const cardNum = 22 + si * 14 + ri;
        cards.push({
          id: cardNum,
          suit,
          suitZh: SUITS_ZH[si],
          suitSymbol: SUIT_SYMBOLS[si],
          element: SUIT_ELEMENTS[si],
          rank,
          rankZh: RANKS_ZH[ri],
          name: `${rank} of ${suit}`,
          nameZh: `${RANKS_ZH[ri]}·${SUITS_ZH[si]}`,
          meaningUp: meanings.en[rank].up,
          meaningRev: meanings.en[rank].rev,
          meaningUpZh: meanings.zh[rank].up,
          meaningRevZh: meanings.zh[rank].rev,
        });
      });
    });
    return cards;
  }

  const MINOR_ARCANA = generateMinorArcana();
  const ALL_CARDS = [...MAJOR_ARCANA.map((c, i) => ({
    id: c.id,
    type: 'major',
    suit: 'Major',
    suitZh: '大阿尔卡纳',
    suitSymbol: c.symbol,
    element: c.element,
    rank: c.name,
    rankZh: c.nameZh,
    name: c.name,
    nameZh: c.nameZh,
    meaningUp: c.keywords.join(', '),
    meaningRev: 'Blocked energy, inner reflection needed',
    meaningUpZh: c.keywordsZh.join('、'),
    meaningRevZh: '能量受阻，需要内在反思',
  })), ...MINOR_ARCANA];

  // ===== Spreads =====
  const SPREADS = {
    'three-card': {
      en: { name: 'Three-Card Spread', desc: 'Past · Present · Future' },
      zh: { name: '三张牌阵', desc: '过去 · 现在 · 未来' },
      positions: [
        { id: 'past', en: 'Past · 过去', zh: '过去 · Past' },
        { id: 'present', en: 'Present · 现在', zh: '现在 · Present' },
        { id: 'future', en: 'Future · 未来', zh: '未来 · Future' },
      ],
    },
    'celtic-cross': {
      en: { name: 'Celtic Cross', desc: 'Deep insight · 深入洞察' },
      zh: { name: '凯尔特十字', desc: 'Deep insight · 深入洞察' },
      positions: [
        { id: 'present', en: 'Present Situation', zh: '当前状况' },
        { id: 'challenge', en: 'Challenge / Crossing', zh: '挑战 / 障碍' },
        { id: 'past', en: 'Distant Past', zh: '深层过去' },
        { id: 'future', en: 'Near Future', zh: '近期未来' },
        { id: 'above', en: 'Conscious Goals', zh: '意识目标' },
        { id: 'below', en: 'Subconscious Roots', zh: '潜意识根源' },
        { id: 'advice', en: 'Advice / Self', zh: '建议 / 自我' },
        { id: 'external', en: 'External Influences', zh: '外部影响' },
        { id: 'hopes', en: 'Hopes & Fears', zh: '希望与恐惧' },
        { id: 'outcome', en: 'Final Outcome', zh: '最终结果' },
      ],
    },
    'love': {
      en: { name: 'Love Spread', desc: 'Relationship insight · 感情洞察' },
      zh: { name: '爱情牌阵', desc: 'Relationship insight · 感情洞察' },
      positions: [
        { id: 'you', en: 'You in this relationship', zh: '你在关系中的状态' },
        { id: 'partner', en: 'Your partner', zh: '对方的感受' },
        { id: 'strength', en: 'Strength of connection', zh: '关系的优势' },
        { id: 'challenge', en: 'Challenge to overcome', zh: '需要克服的挑战' },
        { id: 'outcome', en: 'Potential outcome', zh: '可能的结局' },
      ],
    },
    'career': {
      en: { name: 'Career Spread', desc: 'Work & purpose · 事业与目标' },
      zh: { name: '事业牌阵', desc: 'Work & purpose · 事业与目标' },
      positions: [
        { id: 'current', en: 'Current career state', zh: '当前事业状态' },
        { id: 'block', en: 'What blocks you', zh: '阻碍你的是什么' },
        { id: 'strength', en: 'Your professional strength', zh: '你的职业优势' },
        { id: 'next', en: 'Next step to take', zh: '下一步行动' },
      ],
    },
    'daily': {
      en: { name: 'Daily Card', desc: 'One-card guidance · 每日指引' },
      zh: { name: '每日一牌', desc: 'One-card guidance · 每日指引' },
      positions: [
        { id: 'guidance', en: "Today's guidance", zh: '今日指引' },
      ],
    },
  };

  // ===== Draw Cards =====
  function drawCards(spreadKey, count) {
    const numCards = count || SPREADS[spreadKey].positions.length;
    const deck = [...ALL_CARDS];
    const drawn = [];

    // Shuffle (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    for (let i = 0; i < numCards; i++) {
      const card = deck[i];
      const reversed = Math.random() < 0.3; // 30% chance reversed
      drawn.push({
        ...card,
        reversed,
        meaning: reversed
          ? { en: card.meaningRev, zh: card.meaningRevZh }
          : { en: card.meaningUp, zh: card.meaningUpZh },
      });
    }

    return drawn;
  }

  function getSpreadPositions(spreadKey, lang) {
    const spread = SPREADS[spreadKey];
    return spread.positions.map(p => ({
      id: p.id,
      label: lang === 'zh' ? p.zh : p.en,
    }));
  }

  function getSpreadInfo(spreadKey, lang) {
    const s = SPREADS[spreadKey];
    return lang === 'zh' ? s.zh : s.en;
  }

  // ===== Public API =====
  return {
    ALL_CARDS,
    MAJOR_ARCANA,
    SPREADS,
    drawCards,
    getSpreadPositions,
    getSpreadInfo,
  };
})();
