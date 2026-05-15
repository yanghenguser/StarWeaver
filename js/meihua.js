/* ============================================
   StarWeaver - meihua.js (梅花易数)
   Plum Blossom Divination Module
   ============================================ */

const MeiHua = (() => {
  'use strict';

  // ===== 入声字 reference from taibu =====
  const RUSHENG_CHARS = '一乙七八十百尺石国德福学觉角脚足目白黑日月雪血室实食识式失湿十拾什石色涩瑟舌设摄涉折哲蜇彻撤掣叶业页节结洁杰截接揭竭绝决诀说脱夺撮阔括活豁末没墨默灭蔑裂列烈劣猎热若弱月约钥药岳乐落洛络略虐掠昨凿酌灼浊卓捉桌着斫啄琢爵嚼国郭福幅腹复服伏拂弗发法乏伐罚阀筏纳衲答搭达塔踏榻沓杂匝咂合盒阖盍鸽割葛喝褐辖侠峡狭匣节劫杰结洁捷睫页业叶集辑急级极吉即疾籍习袭夕席息惜析锡吸晰敌滴狄迪笛涤的得德特职直值植殖执蛰质窒致置秩术述束树属熟赎淑俗玉谷骨滑猾核刻克客宅窄摘拆黑默北贼则责择泽册策测侧';
  const RUSHENG_SET = new Set(RUSHENG_CHARS);

  // ===== 八卦 (8 Trigrams) =====
  const TRIGRAM_DATA = {
    '乾': { num: 1, binary: '111', element: '金', symbol: '☰', nature: '天' },
    '兑': { num: 2, binary: '110', element: '金', symbol: '☱', nature: '泽' },
    '离': { num: 3, binary: '101', element: '火', symbol: '☲', nature: '火' },
    '震': { num: 4, binary: '100', element: '木', symbol: '☳', nature: '雷' },
    '巽': { num: 5, binary: '011', element: '木', symbol: '☴', nature: '风' },
    '坎': { num: 6, binary: '010', element: '水', symbol: '☵', nature: '水' },
    '艮': { num: 7, binary: '001', element: '土', symbol: '☶', nature: '山' },
    '坤': { num: 8, binary: '000', element: '土', symbol: '☷', nature: '地' },
  };

  // num 0-7 → trigram name (0=坤, 1=乾, 2=兑, 3=离, 4=震, 5=巽, 6=坎, 7=艮)
  const NUM_TO_NAME = ['坤', '乾', '兑', '离', '震', '巽', '坎', '艮'];

  // ===== Wuxing helpers =====
  const WX_CYCLE = ['木', '火', '土', '金', '水'];

  /** Map 0-mod number to trigram name (1-8 → 乾-坤) */
  function getTrigram(n) {
    return NUM_TO_NAME[((n % 8) + 8) % 8];
  }

  /** Map 0-mod number to moving line position 1-6 */
  function getMovingLinePosition(n) {
    return ((n % 6) + 6) % 6 || 6;
  }

  /** Get wuxing element for trigram name */
  function getElement(name) {
    return TRIGRAM_DATA[name] ? TRIGRAM_DATA[name].element : null;
  }

  /**
   * Determine 体用 (body/function) relationship.
   * upperName = upper trigram, lowerName = lower trigram
   * movingInUpper: whether moving line is in upper trigram
   * Returns: { text: 体用 relation description, auspicious: 吉凶 }
   */
  function getRelation(yongEl, tiEl) {
    if (!yongEl || !tiEl) return { text: '未知', auspicious: '平' };
    if (yongEl === tiEl) return { text: '比和', auspicious: '吉' };
    const yIdx = WX_CYCLE.indexOf(yongEl);
    const tIdx = WX_CYCLE.indexOf(tiEl);
    // generates: 木→火→土→金→水→木
    if ((yIdx + 1) % 5 === tIdx) return { text: '用生体', auspicious: '大吉' };
    if ((tIdx + 1) % 5 === yIdx) return { text: '体生用', auspicious: '小凶' };
    // overcomes: 木→土→水→火→金→木
    if ((yIdx + 2) % 5 === tIdx) return { text: '用克体', auspicious: '大凶' };
    if ((tIdx + 2) % 5 === yIdx) return { text: '体克用', auspicious: '小吉' };
    return { text: '比和', auspicious: '平' };
  }

  /** Build 6-char binary string from upper+lower trigrams */
  function buildHexagramBinary(upperName, lowerName) {
    const u = TRIGRAM_DATA[upperName];
    const l = TRIGRAM_DATA[lowerName];
    if (!u || !l) return null;
    return l.binary + u.binary; // bottom 3 bits + top 3 bits
  }

  /** Flip bit at position (1-indexed from bottom) */
  function changeLine(binary, pos) {
    if (!binary || binary.length !== 6) return null;
    const idx = pos - 1;
    const chars = binary.split('');
    chars[idx] = chars[idx] === '1' ? '0' : '1';
    return chars.join('');
  }

  // ===== Casting Methods =====

  /** 1. 年月日时起卦 (Date-based) */
  function fromDate(year, month, day, hour) {
    const total1 = year + month + day;
    const total2 = year + month + day + hour;
    return buildResult(getTrigram(total1), getTrigram(total2), getMovingLinePosition(total2));
  }

  /** 2. 数字起卦 (Number-based) */
  function fromNumbers(nums) {
    if (!nums || nums.length === 0) return null;
    let upper, lower, moving;
    if (nums.length === 1) {
      upper = getTrigram(nums[0]);
      lower = getTrigram(nums[0] + 1);
      moving = getMovingLinePosition(nums[0] + 2);
    } else if (nums.length === 2) {
      upper = getTrigram(nums[0]);
      lower = getTrigram(nums[1]);
      moving = getMovingLinePosition(nums[0] + nums[1]);
    } else {
      upper = getTrigram(nums[0]);
      lower = getTrigram(nums[1]);
      moving = getMovingLinePosition(nums[2]);
    }
    return buildResult(upper, lower, moving);
  }

  /** 3. 字数起卦 (Character-based) */
  function fromCharacters(text) {
    if (!text) return null;
    const clean = text.replace(/\s+/g, '');
    if (clean.length === 0) return null;
    if (clean.length === 1) {
      return fromNumbers([clean.charCodeAt(0)]);
    }
    const half = Math.ceil(clean.length / 2);
    const first = clean.substring(0, half);
    const second = clean.substring(half);
    const upperNum = toneCount(first);
    const lowerNum = toneCount(second);
    return buildResult(
      getTrigram(upperNum),
      getTrigram(lowerNum),
      getMovingLinePosition(upperNum + lowerNum)
    );
  }

  /** Count characters (入声-aware) */
  function toneCount(str) {
    let count = 0;
    for (const ch of str) {
      count += RUSHENG_SET.has(ch) ? 1 : 1;
    }
    return count;
  }

  // ===== Build result object =====
  function buildResult(upperName, lowerName, movingPosition) {
    const binary = buildHexagramBinary(upperName, lowerName);
    if (!binary) return null;
    const changedBinary = changeLine(binary, movingPosition);

    let hexagram = null, changedHexagram = null;
    if (typeof IChing !== 'undefined') {
      hexagram = IChing.getHexagramByBinary(binary);
      changedHexagram = IChing.getHexagramByBinary(changedBinary);
    }

    // 体用: moving line in upper trigram (4-6) → upper=用, lower=体
    const movingInUpper = movingPosition >= 4;
    const tiName = movingInUpper ? lowerName : upperName;
    const yongName = movingInUpper ? upperName : lowerName;
    const tiEl = getElement(tiName);
    const yongEl = getElement(yongName);
    const relation = getRelation(yongEl, tiEl);

    return {
      upperTrigram: upperName,
      lowerTrigram: lowerName,
      upperElement: getElement(upperName),
      lowerElement: getElement(lowerName),
      hexagram,
      movingLine: movingPosition,
      changedBinary,
      changedHexagram,
      tiName, yongName, tiEl, yongEl,
      relation,
      binary,
    };
  }

  // ===== Public API =====
  return {
    fromDate, fromNumbers, fromCharacters,
    buildResult, getTrigram, getElement,
    TRIGRAM_DATA, RUSHENG_CHARS,
  };
})();
