/* ============================================
   StarWeaver - iching.js
   64 Hexagrams (King Wen order) + Casting Module
   Binary: from bottom line (bit-0) to top line (bit-5)
   ============================================ */

const IChing = (() => {
  'use strict';

  // ===== 64 Hexagrams =====
  const HEXAGRAMS = [
    { num: 1,  binary: '111111', name: '乾', nameEn: 'The Creative',     meaning: '天行健，君子以自强不息', meaningEn: 'Heavenly power, strength, creativity, dynamic energy' },
    { num: 2,  binary: '000000', name: '坤', nameEn: 'The Receptive',    meaning: '地势坤，君子以厚德载物', meaningEn: 'Earthly devotion, receptivity, nurturing, humility' },
    { num: 3,  binary: '100010', name: '屯', nameEn: 'Beginning',        meaning: '万物始生，充满艰难', meaningEn: 'Birth, initial difficulty, sprouting potential' },
    { num: 4,  binary: '010001', name: '蒙', nameEn: 'Youthful Folly',   meaning: '蒙昧初开，需人启蒙', meaningEn: 'Inexperience, seeking guidance, learning' },
    { num: 5,  binary: '111010', name: '需', nameEn: 'Waiting',          meaning: '待时而动，诚信守候', meaningEn: 'Patience, timing, nourishing faith' },
    { num: 6,  binary: '010111', name: '讼', nameEn: 'Conflict',         meaning: '争辩不已，适可而止', meaningEn: 'Dispute, litigation, knowing when to yield' },
    { num: 7,  binary: '010000', name: '师', nameEn: 'The Army',         meaning: '统率众人，师出有名', meaningEn: 'Leadership, discipline, collective action' },
    { num: 8,  binary: '000010', name: '比', nameEn: 'Union',            meaning: '亲比和谐，团结互助', meaningEn: 'Affinity, alliance, mutual support' },
    { num: 9,  binary: '111011', name: '小畜', nameEn: 'Small Taming',   meaning: '小有积蓄，修身养性', meaningEn: 'Gentle restraint, accumulation, refinement' },
    { num: 10, binary: '110111', name: '履', nameEn: 'Treading',         meaning: '履虎尾，临危而惧', meaningEn: 'Caution, correct conduct, treading carefully' },
    { num: 11, binary: '111000', name: '泰', nameEn: 'Peace',            meaning: '天地交泰，万事亨通', meaningEn: 'Harmony, prosperity, free flow of energy' },
    { num: 12, binary: '000111', name: '否', nameEn: 'Standstill',       meaning: '天地不交，闭塞不通', meaningEn: 'Stagnation, obstruction, withdrawal' },
    { num: 13, binary: '101111', name: '同人', nameEn: 'Fellowship',     meaning: '与人和同，天下大同', meaningEn: 'Community, cooperation, universal kinship' },
    { num: 14, binary: '111101', name: '大有', nameEn: 'Great Possession', meaning: '丰收丰盛，富足安康', meaningEn: 'Abundance, great wealth, enlightened generosity' },
    { num: 15, binary: '001000', name: '谦', nameEn: 'Modesty',          meaning: '谦逊受益，满招损', meaningEn: 'Humility, balance, quiet strength' },
    { num: 16, binary: '000100', name: '豫', nameEn: 'Enthusiasm',       meaning: '愉悦安乐，顺势而为', meaningEn: 'Joy, spontaneity, harmonious movement' },
    { num: 17, binary: '100110', name: '随', nameEn: 'Following',        meaning: '随顺自然，择善而从', meaningEn: 'Adaptability, following the good, spontaneity' },
    { num: 18, binary: '011001', name: '蛊', nameEn: 'Decay',            meaning: '整治腐败，革故鼎新', meaningEn: 'Corruption, reform, root cause healing' },
    { num: 19, binary: '110000', name: '临', nameEn: 'Approach',         meaning: '临近督导，以德服人', meaningEn: 'Leadership, influence, approaching with care' },
    { num: 20, binary: '000011', name: '观', nameEn: 'Contemplation',    meaning: '观察入微，反躬自省', meaningEn: 'Observation, introspection, perspective' },
    { num: 21, binary: '100101', name: '噬嗑', nameEn: 'Biting Through', meaning: '以刑去恶，通畅无阻', meaningEn: 'Removing obstacles, decisive action, justice' },
    { num: 22, binary: '101001', name: '贲', nameEn: 'Grace',            meaning: '文饰美化，返璞归真', meaningEn: 'Beauty, elegance, substance over form' },
    { num: 23, binary: '000001', name: '剥', nameEn: 'Splitting Apart',  meaning: '剥落消蚀，顺势而止', meaningEn: 'Collapse, decay, knowing when to let go' },
    { num: 24, binary: '100000', name: '复', nameEn: 'Return',           meaning: '一阳来复，万象更新', meaningEn: 'Rebirth, turning point, renewal' },
    { num: 25, binary: '100111', name: '无妄', nameEn: 'Innocence',      meaning: '顺其自然，不妄作为', meaningEn: 'Spontaneity, unexpected blessing, integrity' },
    { num: 26, binary: '111001', name: '大畜', nameEn: 'Great Taming',   meaning: '积蓄力量，厚积薄发', meaningEn: 'Accumulation, cultivation, reserved power' },
    { num: 27, binary: '100001', name: '颐', nameEn: 'Nourishment',      meaning: '颐养身心，自食其力', meaningEn: 'Nourishment, mindfulness, healthy consumption' },
    { num: 28, binary: '011110', name: '大过', nameEn: 'Great Excess',   meaning: '过犹不及，持中守正', meaningEn: 'Overwhelming, radical change, crisis' },
    { num: 29, binary: '010010', name: '坎', nameEn: 'The Abyss',        meaning: '险难重重，诚心可渡', meaningEn: 'Danger, challenges, sincerity as guide' },
    { num: 30, binary: '101101', name: '离', nameEn: 'The Clinging',     meaning: '附丽光明，薪火相传', meaningEn: 'Dependence, clarity, illumination' },
    { num: 31, binary: '001110', name: '咸', nameEn: 'Influence',        meaning: '感应相通，真情互动', meaningEn: 'Attraction, receptivity, heartfelt connection' },
    { num: 32, binary: '011100', name: '恒', nameEn: 'Perseverance',     meaning: '持之以恒，恒久不变', meaningEn: 'Endurance, stability, lasting commitment' },
    { num: 33, binary: '001111', name: '遁', nameEn: 'Retreat',          meaning: '知时退避，保存实力', meaningEn: 'Strategic withdrawal, conservation' },
    { num: 34, binary: '111100', name: '大壮', nameEn: 'Great Power',    meaning: '壮盛强大，不可妄动', meaningEn: 'Strength, vitality, using power wisely' },
    { num: 35, binary: '000101', name: '晋', nameEn: 'Progress',         meaning: '积极进取，光明普照', meaningEn: 'Advancement, recognition, bright future' },
    { num: 36, binary: '101000', name: '明夷', nameEn: 'Darkening',      meaning: '韬光养晦，隐忍待时', meaningEn: 'Hidden brilliance, endurance, patience' },
    { num: 37, binary: '101011', name: '家人', nameEn: 'Family',         meaning: '家庭和睦，各尽其责', meaningEn: 'Family harmony, belonging, shared values' },
    { num: 38, binary: '110101', name: '睽', nameEn: 'Opposition',       meaning: '乖离分歧，求同存异', meaningEn: 'Divergence, paradox, finding common ground' },
    { num: 39, binary: '001010', name: '蹇', nameEn: 'Obstruction',      meaning: '前路艰难，知难而进', meaningEn: 'Adversity, perseverance through hardship' },
    { num: 40, binary: '010100', name: '解', nameEn: 'Deliverance',      meaning: '解除困境，云开雾散', meaningEn: 'Release, resolution, easing of tension' },
    { num: 41, binary: '110001', name: '损', nameEn: 'Decrease',         meaning: '损己益人，有失有得', meaningEn: 'Reduction, sacrifice, focused simplicity' },
    { num: 42, binary: '100011', name: '益', nameEn: 'Increase',         meaning: '增益福祉，利人利己', meaningEn: 'Growth, benefit, mutual improvement' },
    { num: 43, binary: '111110', name: '夬', nameEn: 'Breakthrough',     meaning: '当机立断，决断果敢', meaningEn: 'Decisiveness, resolution, clear-cut action' },
    { num: 44, binary: '011111', name: '姤', nameEn: 'Coming to Meet',   meaning: '不期而遇，机缘巧合', meaningEn: 'Encounter, unexpected meeting, opportunity' },
    { num: 45, binary: '000110', name: '萃', nameEn: 'Gathering',        meaning: '聚集荟萃，众志成城', meaningEn: 'Gathering, community, collective wisdom' },
    { num: 46, binary: '011000', name: '升', nameEn: 'Pushing Upward',   meaning: '步步高升，顺势而上', meaningEn: 'Ascending, growth, steady progress' },
    { num: 47, binary: '010110', name: '困', nameEn: 'Oppression',       meaning: '困顿穷迫，守正不移', meaningEn: 'Exhaustion, limitation, inner strength' },
    { num: 48, binary: '011010', name: '井', nameEn: 'The Well',         meaning: '井养不穷，源源不断', meaningEn: 'Source, nourishment, shared resources' },
    { num: 49, binary: '101110', name: '革', nameEn: 'Revolution',       meaning: '革故鼎新，破旧立新', meaningEn: 'Transformation, radical change, renewal' },
    { num: 50, binary: '011101', name: '鼎', nameEn: 'The Cauldron',     meaning: '鼎立天下，调和鼎鼐', meaningEn: 'Establishment, refinement, cultural foundation' },
    { num: 51, binary: '100100', name: '震', nameEn: 'Thunder',          meaning: '震惊百里，临危不乱', meaningEn: 'Shock, awakening, crisis as catalyst' },
    { num: 52, binary: '001001', name: '艮', nameEn: 'Mountain',         meaning: '知止而止，沉静自若', meaningEn: 'Stillness, meditation, knowing when to stop' },
    { num: 53, binary: '001011', name: '渐', nameEn: 'Development',      meaning: '循序渐进，稳扎稳打', meaningEn: 'Gradual progress, steady growth, patience' },
    { num: 54, binary: '110100', name: '归妹', nameEn: 'The Marrying Maiden', meaning: '依礼而行，各得其所', meaningEn: 'Union, alignment, proper timing' },
    { num: 55, binary: '101100', name: '丰', nameEn: 'Abundance',        meaning: '丰盛盈满，居安思危', meaningEn: 'Prosperity, fullness, mindful abundance' },
    { num: 56, binary: '001101', name: '旅', nameEn: 'The Wanderer',     meaning: '旅居在外，谨慎行事', meaningEn: 'Journey, seeking, adaptability' },
    { num: 57, binary: '011011', name: '巽', nameEn: 'The Gentle',       meaning: '随风潜入，柔顺谦逊', meaningEn: 'Gentleness, penetration, subtle influence' },
    { num: 58, binary: '110110', name: '兑', nameEn: 'The Joyous',       meaning: '和颜悦色，以诚相待', meaningEn: 'Joy, open communication, shared happiness' },
    { num: 59, binary: '010011', name: '涣', nameEn: 'Dispersion',       meaning: '涣散消融，聚心凝神', meaningEn: 'Scattering, release, heart-centered gathering' },
    { num: 60, binary: '110010', name: '节', nameEn: 'Regulation',       meaning: '适中有节，过犹不及', meaningEn: 'Moderation, discipline, wise boundaries' },
    { num: 61, binary: '110011', name: '中孚', nameEn: 'Inner Truth',    meaning: '诚心感召，信及豚鱼', meaningEn: 'Sincerity, trust, inner integrity' },
    { num: 62, binary: '001100', name: '小过', nameEn: 'Small Excess',   meaning: '小有过度，谨慎行事', meaningEn: 'Minor overstepping, attention to detail' },
    { num: 63, binary: '101010', name: '既济', nameEn: 'After Completion', meaning: '事已成就，守成不易', meaningEn: 'Completed, achieved, vigilance in success' },
    { num: 64, binary: '010101', name: '未济', nameEn: 'Before Completion', meaning: '事未成就，充满希望', meaningEn: 'Incomplete, ongoing, limitless potential' },
  ];

  // ===== Build lookup map =====
  const _binaryMap = {};
  HEXAGRAMS.forEach(h => { _binaryMap[h.binary] = h; });

  // ===== Coin Toss (3-coin method) =====
  // Each coin: heads(⚊) = 3, tails(⚋) = 2
  // Sum: 6=old_yin(⚋×), 7=young_yang(⚊), 8=young_yin(⚋), 9=old_yang(⚊×)
  function tossCoin() {
    return Math.random() < 0.5 ? 3 : 2; // 3=heads(yang), 2=tails(yin)
  }

  function castHexagram() {
    const lines = [];
    for (let i = 0; i < 6; i++) {
      const coins = [tossCoin(), tossCoin(), tossCoin()];
      const sum = coins.reduce((a, b) => a + b, 0);
      let type, value;
      switch (sum) {
        case 6: type = 'old_yin';    value = 0; break; // changing
        case 7: type = 'young_yang'; value = 1; break;
        case 8: type = 'young_yin';  value = 0; break;
        case 9: type = 'old_yang';   value = 1; break; // changing
      }
      lines.push({ value, type, sum, coins });
    }
    // lines[0]=bottom(l1) … lines[5]=top(l6)
    return lines;
  }

  // ===== Lookup =====
  function getHexagram(lines) {
    const binary = lines.map(l => l.value).join('');
    return _binaryMap[binary] || null;
  }

  function getChangingHexagram(lines) {
    const hasChanges = lines.some(l => l.type === 'old_yin' || l.type === 'old_yang');
    if (!hasChanges) return null;
    const binary = lines.map(l => {
      if (l.type === 'old_yin')  return 1; // yin → yang
      if (l.type === 'old_yang') return 0; // yang → yin
      return l.value;
    }).join('');
    return _binaryMap[binary] || null;
  }

  function getHexagramByBinary(binary) {
    return _binaryMap[binary] || null;
  }

  // ===== Public API =====
  return {
    HEXAGRAMS,
    castHexagram,
    getHexagram,
    getChangingHexagram,
    getHexagramByBinary,
  };
})();
