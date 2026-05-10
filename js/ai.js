/* ============================================
   StarWeaver - ai.js
   DeepSeek AI Astrology Integration Module
   ============================================ */

const AstroAI = (() => {
  'use strict';

  const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

  let apiKey = '';
  let currentModel = 'deepseek-chat';
  let conversationHistory = [];

  // ===== API Key Management =====
  function setApiKey(key) {
    apiKey = key.trim();
    return apiKey.length > 0;
  }

  function setModel(model) {
    currentModel = model;
  }

  function hasApiKey() {
    return apiKey.length > 0;
  }

  // ===== Core API Call =====
  async function callDeepSeek(messages, { temperature = 0.8, max_tokens = 2000 } = {}) {
    if (!apiKey) {
      throw new Error(lang === 'zh' ? '请先设置 DeepSeek API Key' : 'Please set your DeepSeek API Key first');
    }

    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: currentModel,
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // ===== System Prompts =====
  function getSystemPrompt(type, lang) {
    const prompts = {
      natal: {
        en: `You are "Stella the Star Weaver", a mystical and knowledgeable astrologer who lives among the stars. You speak in a poetic, wise, and slightly enigmatic manner. 

Given a person's birth information (date, time, place) and their calculated natal chart data, provide a personalized astrology reading.

Your reading should include:
1. A poetic opening invoking the cosmos
2. Sun sign interpretation and its influence
3. Moon sign (emotional nature)
4. Ascendant/Rising sign (outer personality)
5. Key planetary influences
6. Notable aspects (conjunctions, oppositions, trines, etc.)
7. House placements of significance
8. Life themes and lessons indicated
9. A closing blessing or guidance

Write in a warm, profound, and personalized style. Speak directly to the person. Use astrological terminology naturally. Make each reading feel unique and tailored. Keep the reading between 400-800 words.`,

        zh: `你是"星织者斯特拉"，一位居住在星辰之间的神秘而博学的占星师。你用诗意、智慧且略带神秘的风格说话。

根据一个人的出生信息（日期、时间、地点）及其计算出的星盘数据，提供个性化的占星解读。

你的解读应包括：
1. 诗意的开场，呼唤宇宙的力量
2. 太阳星座解读及其影响
3. 月亮星座（情感本质）
4. 上升星座（外在个性）
5. 关键行星影响
6. 重要相位（合相、对冲、三分相等）
7. 有意义的宫位
8. 人生主题和功课提示
9. 结束时的祝福或指引

用温暖、深刻且个性化的风格写作。直接对这个人说话。自然地使用占星术语。让每次解读都感觉独特且量身定制。控制在400-800字之间。`,
      },
      horoscope: {
        en: `You are "Stella the Star Weaver", a celestial oracle. For a given zodiac sign and the current date, write a poetic daily horoscope.

Your horoscope should:
1. Address the person by their zodiac sign
2. Describe the current cosmic energies affecting them
3. Give practical guidance for the day
4. Mention an area of life (love, career, creativity, health)
5. End with an inspiring one-line mantra

Keep it between 100-200 words. Make it feel personal and magical.`,

        zh: `你是"星织者斯特拉"，一位天上的神谕者。针对给定的星座和当前日期，写一首诗意的每日运势。

你的运势应该：
1. 以星座名称称呼对方
2. 描述当前影响他们的宇宙能量
3. 给出当天的实用指引
4. 提及一个生活领域（爱情、事业、创造、健康）
5. 以一句激励性的短句结尾

控制在100-200字之间。让它感觉个人化且充满魔力。`,
      },
      compatibility: {
        en: `You are "Stella the Star Weaver", a wise cosmic matchmaker. Given two zodiac signs and their compatibility percentage, provide a detailed compatibility reading.

Include:
1. The cosmic chemistry between these two signs
2. Strengths of the connection
3. Challenges to be aware of
4. How each sign brings out the best in the other
5. Practical advice for harmonizing the relationship
6. A poetic closing

Be honest but kind. Write 200-400 words.`,

        zh: `你是"星织者斯特拉"，一位智慧的宇宙红娘。给定两个星座及其兼容性百分比，提供详细的配对整个读。

包括：
1. 这两个星座之间的宇宙化学反应
2. 连接的优点
3. 需要注意的挑战
4. 每个星座如何激发对方最好的一面
5. 调和关系的实用建议
6. 诗意的结尾

诚实但友善。写200-400字。`,
      },
      qa: {
        en: `You are "Stella the Star Weaver", a wise astrologer who answers questions from seekers. You are mystical yet practical, poetic yet precise.

Answer the user's question about astrology, life, spirituality, or the cosmos. Use astrological wisdom and cosmic metaphors in your response. Be warm, insightful, and occasionally mysterious. Keep responses between 100-500 words depending on the question.`,

        zh: `你是"星织者斯特拉"，一位为求问者解答问题的智慧占星师。你神秘而务实，诗意而精准。

回答用户关于占星、生活、灵性或宇宙的问题。在你的回答中使用占星智慧和宇宙隐喻。温暖、有洞察力，偶尔带点神秘。根据问题不同，回复控制在100-500字之间。`,
      },
    };

    return prompts[type] ? prompts[type][lang] : prompts.qa.en;
  }

  // ===== Natal Chart Reading =====
  async function getNatalReading(birthInfo, chartData, lang) {
    const chartDesc = generateChartDescription(chartData, lang);
    const messages = [
      { role: 'system', content: getSystemPrompt('natal', lang) },
      { role: 'user', content: `Please read my natal chart.

My birth information:
- Name: ${birthInfo.name}
- Date of Birth: ${birthInfo.year}-${String(birthInfo.month).padStart(2, '0')}-${String(birthInfo.day).padStart(2, '0')}
- Time of Birth: ${birthInfo.hour}:${String(birthInfo.minute || 0).padStart(2, '0')}
- Birthplace: ${birthInfo.birthplace || 'Unknown'}

My Natal Chart Data:
${chartDesc}

Please give me a complete, personalized astrology reading.` },
    ];

    return await callDeepSeek(messages, { temperature: 0.85, max_tokens: 3000 });
  }

  // ===== Daily Horoscope =====
  async function getHoroscope(signIndex, date, lang) {
    const sign = Astro.ZODIAC_SIGNS[lang][signIndex];
    const dateStr = date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const messages = [
      { role: 'system', content: getSystemPrompt('horoscope', lang) },
      { role: 'user', content: `Give me my horoscope for today.
Sign: ${sign.name} (${sign.symbol})
Date: ${dateStr}

What do the stars say for me today?` },
    ];

    return await callDeepSeek(messages, { temperature: 0.8, max_tokens: 1000 });
  }

  // ===== Compatibility Reading =====
  async function getCompatibilityReading(person1, sign1, person2, sign2, score, lang) {
    const s1 = Astro.ZODIAC_SIGNS[lang][sign1];
    const s2 = Astro.ZODIAC_SIGNS[lang][sign2];

    const messages = [
      { role: 'system', content: getSystemPrompt('compatibility', lang) },
      { role: 'user', content: `Tell me about the compatibility between these two:

${person1}: ${s1.name} (${s1.symbol}) — Element: ${s1.element}, Quality: ${s1.quality}
${person2}: ${s2.name} (${s2.symbol}) — Element: ${s2.element}, Quality: ${s2.quality}

Compatibility Score: ${score}%

What is the cosmic connection between them?` },
    ];

    return await callDeepSeek(messages, { temperature: 0.8, max_tokens: 1500 });
  }

  // ===== AI Q&A =====
  async function askQuestion(question, lang) {
    const messages = [
      { role: 'system', content: getSystemPrompt('qa', lang) },
      ...conversationHistory.slice(-6), // Keep last 3 exchanges for context
      { role: 'user', content: question },
    ];

    const answer = await callDeepSeek(messages, { temperature: 0.85, max_tokens: 1500 });
    
    conversationHistory.push({ role: 'user', content: question });
    conversationHistory.push({ role: 'assistant', content: answer });
    
    return answer;
  }

  function clearConversation() {
    conversationHistory = [];
  }

  // ===== Chat with Typewriter =====
  function typewriteText(element, text, speed = 30, callback) {
    let index = 0;
    element.textContent = '';
    element.classList.add('typing-cursor');

    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        // Variable speed: pause at punctuation
        const char = text.charAt(index - 1);
        const delay = '，。！？；：.!?;:\n'.includes(char) ? speed * 4 : speed;
        setTimeout(type, delay);
      } else {
        element.classList.remove('typing-cursor');
        if (callback) callback();
      }
    }

    type();
  }

  // ===== Chart Description Helper =====
  function generateChartDescription(chartData, lang) {
    const L = lang;
    const lines = [];
    const s = Astro.ZODIAC_SIGNS[L];

    lines.push(`Sun Sign: ${chartData.sunSign.name} (${chartData.sunSign.symbol})`);
    lines.push(`Ascendant/Rising: ${chartData.ascendantSign.name} (${chartData.ascendantSign.symbol})`);
    lines.push(`Moon Sign: ${s[chartData.moonSignIndex].name} (${s[chartData.moonSignIndex].symbol})`);
    lines.push('');
    lines.push('Planetary Positions:');
    chartData.planets.forEach(p => {
      lines.push(`  ${p.symbol} ${p.name}: ${p.sign.name} (House ${p.house})`);
    });
    lines.push('');
    if (chartData.aspects.length > 0) {
      lines.push('Notable Aspects:');
      chartData.aspects.slice(0, 8).forEach(a => {
        lines.push(`  ${a.p1} ${a.symbol} ${a.p2} (orb: ${a.orb}°)`);
      });
    }
    lines.push('');
    lines.push('House Cusps:');
    chartData.houses.slice(0, 6).forEach(h => {
      lines.push(`  House ${h.number}: ${h.sign.name}`);
    });

    return lines.join('\n');
  }

  // ===== Public API =====
  return {
    setApiKey,
    setModel,
    hasApiKey,
    getNatalReading,
    getHoroscope,
    getCompatibilityReading,
    askQuestion,
    clearConversation,
    typewriteText,
    get currentModel() { return currentModel; },
  };
})();
