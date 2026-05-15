/* ============================================
   StarWeaver - liuyao.js (六爻)
   6-Line Divination Module
   Based on ichingshifa algorithm + Bagua theory
   ============================================ */

const LiuYao = (() => {
  'use strict';

  // ===== 8 Trigrams (八卦) =====
  const BAGUA = {
    '111': { name: '乾', element: '金', direction: '西北', animal: '马', family: '父', body: '首' },
    '000': { name: '坤', element: '土', direction: '西南', animal: '牛', family: '母', body: '腹' },
    '100': { name: '震', element: '木', direction: '东',   animal: '龙', family: '长男', body: '足' },
    '010': { name: '坎', element: '水', direction: '北',   animal: '豕', family: '中男', body: '耳' },
    '001': { name: '艮', element: '土', direction: '东北', animal: '狗', family: '少男', body: '手' },
    '101': { name: '离', element: '火', direction: '南',   animal: '雉', family: '中女', body: '目' },
    '011': { name: '巽', element: '木', direction: '东南', animal: '鸡', family: '长女', body: '股' },
    '110': { name: '兑', element: '金', direction: '西',   animal: '羊', family: '少女', body: '口' },
  };

  // Reverse lookup by name
  const BAGUA_BY_NAME = {};
  Object.keys(BAGUA).forEach(k => { BAGUA_BY_NAME[BAGUA[k].name] = k; });

  // ===== Eight Palaces (八宫) =====
  // Each hexagram number (1-64) belongs to one palace
  // Palace order: 乾, 坎, 艮, 震, 巽, 离, 坤, 兑
  const PALACE_MAP = {
    // 乾宫 (金): 乾, 姤, 遁, 否, 观, 剥, 晋, 大有
    1:'乾', 44:'乾', 33:'乾', 12:'乾', 20:'乾', 23:'乾', 35:'乾', 14:'乾',
    // 坎宫 (水): 坎, 节, 屯, 既济, 革, 丰, 明夷, 师
    29:'坎', 60:'坎', 3:'坎', 63:'坎', 49:'坎', 55:'坎', 36:'坎', 7:'坎',
    // 艮宫 (土): 艮, 贲, 大畜, 损, 睽, 履, 中孚, 渐
    52:'艮', 22:'艮', 26:'艮', 41:'艮', 38:'艮', 10:'艮', 61:'艮', 53:'艮',
    // 震宫 (木): 震, 豫, 解, 恒, 升, 井, 大过, 随
    51:'震', 16:'震', 40:'震', 32:'震', 46:'震', 48:'震', 28:'震', 17:'震',
    // 巽宫 (木): 巽, 小畜, 家人, 益, 无妄, 噬嗑, 颐, 蛊
    57:'巽', 9:'巽', 37:'巽', 42:'巽', 25:'巽', 21:'巽', 27:'巽', 18:'巽',
    // 离宫 (火): 离, 旅, 鼎, 未济, 蒙, 涣, 讼, 同人
    30:'离', 56:'离', 50:'离', 64:'离', 4:'离', 59:'离', 6:'离', 13:'离',
    // 坤宫 (土): 坤, 复, 临, 泰, 大壮, 夬, 需, 比
    2:'坤', 24:'坤', 19:'坤', 11:'坤', 34:'坤', 43:'坤', 5:'坤', 8:'坤',
    // 兑宫 (金): 兑, 困, 萃, 咸, 蹇, 谦, 小过, 归妹
    58:'兑', 47:'兑', 45:'兑', 31:'兑', 39:'兑', 15:'兑', 62:'兑', 54:'兑',
  };

  // Generation type within palace
  const GENERATION_TYPE = {
    1:'本宫',44:'一世',33:'二世',12:'三世',20:'四世',23:'五世',35:'游魂',14:'归魂',
    29:'本宫',60:'一世',3:'二世',63:'三世',49:'四世',55:'五世',36:'游魂',7:'归魂',
    52:'本宫',22:'一世',26:'二世',41:'三世',38:'四世',10:'五世',61:'游魂',53:'归魂',
    51:'本宫',16:'一世',40:'二世',32:'三世',46:'四世',48:'五世',28:'游魂',17:'归魂',
    57:'本宫',9:'一世',37:'二世',42:'三世',25:'四世',21:'五世',27:'游魂',18:'归魂',
    30:'本宫',56:'一世',50:'二世',64:'三世',4:'四世',59:'五世',6:'游魂',13:'归魂',
    2:'本宫',24:'一世',19:'二世',11:'三世',34:'四世',43:'五世',5:'游魂',8:'归魂',
    58:'本宫',47:'一世',45:'二世',31:'三世',39:'四世',15:'五世',62:'游魂',54:'归魂',
  };

  // Shi (世) position by generation type (1-indexed line position)
  const SHI_POSITION = {
    '本宫': 6, '一世': 1, '二世': 2, '三世': 3,
    '四世': 4, '五世': 5, '游魂': 4, '归魂': 3,
  };

  // ===== Najia (纳甲) line wuxing per pure trigram =====
  // Each trigram's 6 lines (line1-bottom ... line6-top) have fixed wuxing
  const NAJIA_WUXING = {
    '乾': ['水', '木', '土', '火', '金', '土'],
    '坤': ['土', '火', '木', '土', '水', '金'],
    '震': ['水', '木', '土', '火', '金', '土'], // same as 乾 in some systems
    '巽': ['土', '水', '金', '土', '火', '木'],
    '坎': ['木', '土', '火', '金', '土', '水'],
    '离': ['木', '土', '水', '金', '土', '火'],
    '艮': ['土', '火', '金', '土', '水', '木'],
    '兑': ['火', '木', '土', '金', '水', '土'],
  };

  // ===== Wuxing cycle relationships =====
  const WUXING_CYCLE = ['木', '火', '土', '金', '水'];
  function getWuxingRelation(target, reference) {
    if (target === reference) return '比和';
    const tIdx = WUXING_CYCLE.indexOf(target);
    const rIdx = WUXING_CYCLE.indexOf(reference);
    // 生: 木→火→土→金→水→木
    const generates = (WUXING_CYCLE[tIdx] === WUXING_CYCLE[(rIdx + 1) % 5]);
    const generatedBy = (WUXING_CYCLE[(tIdx + 1) % 5] === WUXING_CYCLE[rIdx]);
    if (generates) return '我生';
    if (generatedBy) return '生我';
    // 克: 木→土→水→火→金→木
    const overcomes = (WUXING_CYCLE[tIdx] === WUXING_CYCLE[(rIdx + 2) % 5]);
    const overcomeBy = (WUXING_CYCLE[(tIdx + 2) % 5] === WUXING_CYCLE[rIdx]);
    if (overcomes) return '我克';
    if (overcomeBy) return '克我';
    return '比和';
  }

  function getSixRelative(targetWx, palaceWx) {
    const rel = getWuxingRelation(targetWx, palaceWx);
    switch (rel) {
      case '比和': return '兄弟';
      case '生我': return '父母';
      case '我生': return '子孙';
      case '克我': return '官鬼';
      case '我克': return '妻财';
      default: return '兄弟';
    }
  }

  // ===== Six Beasts (六兽) =====
  const SIX_BEASTS = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];

  // Day stem groups determine beast starting position
  function getSixBeasts(dayStem) {
    const gan = dayStem || '甲';
    let startIdx;
    if ('甲乙'.includes(gan)) startIdx = 0;
    else if ('丙丁'.includes(gan)) startIdx = 1;
    else if (gan === '戊') startIdx = 2;
    else if (gan === '己') startIdx = 3;
    else if ('庚辛'.includes(gan)) startIdx = 4;
    else if ('壬癸'.includes(gan)) startIdx = 5;
    else startIdx = 0;

    const result = [];
    for (let i = 0; i < 6; i++) {
      result.push(SIX_BEASTS[(startIdx + i) % 6]);
    }
    return result; // [line1, line2, ..., line6]
  }

  // ===== Coin toss (3-coin method) =====
  function tossCoin() {
    return Math.random() < 0.5 ? 3 : 2;
  }

  function castLines() {
    const lines = [];
    for (let i = 0; i < 6; i++) {
      const coins = [tossCoin(), tossCoin(), tossCoin()];
      const sum = coins.reduce((a, b) => a + b, 0);
      let type, value;
      switch (sum) {
        case 6: type = 'old_yin';    value = 0; break;
        case 7: type = 'young_yang'; value = 1; break;
        case 8: type = 'young_yin';  value = 0; break;
        case 9: type = 'old_yang';   value = 1; break;
      }
      lines.push({ position: i + 1, value, type, sum, coins });
    }
    return lines;
  }

  // ===== Yarrow stalk casting (reusing IChing algorithm pattern) =====
  function yarrowLine() {
    let remaining = 49;
    function transform(numStalks) {
      const left = Math.floor(Math.random() * (numStalks - 2)) + 1;
      let right = numStalks - left;
      const guaYi = 1;
      right -= guaYi;
      let leftRem = left % 4;
      if (leftRem === 0) leftRem = 4;
      let rightRem = right % 4;
      if (rightRem === 0) rightRem = 4;
      return leftRem + rightRem + guaYi;
    }
    const t1 = transform(remaining); remaining -= t1;
    const t2 = transform(remaining); remaining -= t2;
    const t3 = transform(remaining); remaining -= t3;
    return remaining / 4;
  }

  function castYarrowLines() {
    const lines = [];
    for (let i = 0; i < 6; i++) {
      const v = yarrowLine();
      let type, value;
      switch (v) {
        case 6: type = 'old_yin';    value = 0; break;
        case 7: type = 'young_yang'; value = 1; break;
        case 8: type = 'young_yin';  value = 0; break;
        case 9: type = 'old_yang';   value = 1; break;
      }
      lines.push({ position: i + 1, value, type, sum: v, method: 'yarrow' });
    }
    return lines;
  }

  // ===== Palace identification =====
  function getHexagramNum(binary) {
    if (typeof IChing === 'undefined' || !IChing.getHexagramByBinary) return null;
    const h = IChing.getHexagramByBinary(binary);
    return h ? h.num : null;
  }

  function getPalaceInfo(binary) {
    const num = getHexagramNum(binary);
    if (!num) return null;
    const palaceName = PALACE_MAP[num];
    if (!palaceName) return null;
    const trigramBin = BAGUA_BY_NAME[palaceName];
    const trigram = BAGUA[trigramBin];
    const genType = GENERATION_TYPE[num] || '本宫';
    const shiPos = SHI_POSITION[genType] || 6;
    const yingPos = shiPos <= 3 ? shiPos + 3 : shiPos - 3;
    return {
      hexagramNum: num,
      palace: palaceName,
      palaceElement: trigram.element,
      generation: genType,
      shiPosition: shiPos,
      yingPosition: yingPos,
    };
  }

  // ===== Line analysis =====
  function analyzeLines(lines, dayStem) {
    const binary = lines.map(l => l.value).join('');
    const palace = getPalaceInfo(binary);
    if (!palace) return null;

    const palaceWx = palace.palaceElement;
    const beasts = getSixBeasts(dayStem || '甲');
    const lineWuxing = [];
    const najia = NAJIA_WUXING[palace.palace];
    if (!najia) return null;

    // Build line analysis
    const analyzed = lines.map((line, i) => {
      const wx = najia[i]; // line wuxing from najia
      const relative = getSixRelative(wx, palaceWx);
      return {
        position: line.position,
        value: line.value,
        type: line.type,
        sum: line.sum,
        wuxing: wx,
        sixRelative: relative,
        beast: beasts[i] || '青龙',
        isChanging: line.type === 'old_yin' || line.type === 'old_yang',
        isShi: palace.shiPosition === line.position,
        isYing: palace.yingPosition === line.position,
      };
    });

    return {
      lines: analyzed,
      palace: palace.palace,
      palaceElement: palaceWx,
      generation: palace.generation,
      shiPosition: palace.shiPosition,
      yingPosition: palace.yingPosition,
      dayStem: dayStem || '甲',
      changingCount: analyzed.filter(l => l.isChanging).length,
    };
  }

  // ===== Complete reading =====
  function performReading(dayStem) {
    const lines = castLines();
    const analysis = analyzeLines(lines, dayStem);
    return analysis;
  }

  function performYarrowReading(dayStem) {
    const lines = castYarrowLines();
    const analysis = analyzeLines(lines, dayStem);
    return analysis;
  }

  function readFromLines(lines, dayStem) {
    return analyzeLines(lines, dayStem);
  }

  // ===== Utilities =====
  function getPalette() {
    const names = Object.keys(BAGUA_BY_NAME);
    return names.map(n => ({
      name: n,
      ...BAGUA[BAGUA_BY_NAME[n]],
      binary: BAGUA_BY_NAME[n],
    }));
  }

  // ===== Public API =====
  return {
    BAGUA,
    NAJIA_WUXING,
    PALACE_MAP,
    getPalette,
    castLines,
    castYarrowLines,
    getPalaceInfo,
    analyzeLines,
    performReading,
    performYarrowReading,
    readFromLines,
    getSixBeasts,
    getSixRelative,
  };
})();
