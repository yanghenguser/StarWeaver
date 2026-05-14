/* ============================================
   StarWeaver - ai.js
   AI calls through server-side Rust proxy
   ============================================ */

const AstroAI = (() => {
  'use strict';

  // Cloudflare Workers — deployed!
  const AI_ENDPOINT = 'https://ai.starweaver.top/v1/chat/completions';
  const PROXY_API_KEY = 'sw-prod-key-2026';  // Same as PROXY_API_KEY secret

  let currentModel = 'deepseek-chat';
  let conversationHistory = [];

  function hasApiKey() {
    return true; // API key is managed server-side
  }

  function getModel() {
    return currentModel;
  }

  // ===== Core API Call =====
  async function callAI(messages, { temperature = 0.8, max_tokens = 2000, callType = 'qa' } = {}) {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROXY_API_KEY}`,
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
    const content = data.choices[0].message.content;

    // Fire-and-forget log to backend
    try {
      const userMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
      const uid = (typeof User !== 'undefined' && User.getUserId) ? User.getUserId() : 'anonymous';
      fetch('/api/starweaver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logAICall',
          userId: uid || 'anonymous',
          type: callType,
          prompt: typeof userMsg === 'string' ? userMsg.slice(0, 500) : JSON.stringify(userMsg).slice(0, 500),
          response: content.slice(0, 2000)
        })
      }).catch(() => {});
    } catch(e) {}

    return content;
  }

  // ===== System Prompts (short) =====
  function getSystemPrompt(type, lang) {
    const prompts = {
      natal: {
        en: `You are "Stella the Star Weaver", a mystical and knowledgeable astrologer...`,
        zh: `你是"星织者斯特拉"，一位居住在星辰之间的神秘而博学的占星师...`,
      },
      horoscope: {
        en: `You are "Stella the Star Weaver", a celestial oracle...`,
        zh: `你是"星织者斯特拉"，一位天上的神谕者...`,
      },
      compatibility: {
        en: `You are "Stella the Star Weaver", a wise cosmic matchmaker...`,
        zh: `你是"星织者斯特拉"，一位智慧的宇宙红娘...`,
      },
      tarot: {
        en: `You are "Stella the Star Weaver", a mystical tarot reader...`,
        zh: `你是"星织者斯特拉"，一位神秘的塔罗占卜师...`,
      },
      qa: {
        en: `You are "Stella the Star Weaver", a wise astrologer who answers questions from seekers. You are mystical yet practical, poetic yet precise. Answer the user's question about astrology, life, spirituality, or the cosmos. Use astrological wisdom and cosmic metaphors. Be warm, insightful, and occasionally mysterious. Keep responses between 100-500 words.`,
        zh: `你是"星织者斯特拉"，一位为求问者解答问题的智慧占星师。你神秘而务实，诗意而精准。回答用户关于占星、生活、灵性或宇宙的问题。用占星智慧和宇宙比喻，温暖、有洞察力，偶尔带点神秘。根据问题不同，100-500字之间。`,
      },
    };

    if (prompts[type]) return prompts[type][lang] || prompts[type].en;
    return prompts.qa[lang] || prompts.qa.en;
  }

  // ===== Full System Prompts =====
  function getFullSystemPrompt(type, lang) {
    const fullPrompts = {
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
        zh: `你是"星织者斯特拉"，一位智慧的宇宙红娘。给定两个星座及其兼容性百分比，提供详细的配对整体解读。

包括：
1. 这两个星座之间的宇宙化学反应
2. 连接的优点
3. 需要注意的挑战
4. 每个星座如何激发对方最好的一面
5. 调和关系的实用建议
6. 诗意的结尾

诚实但友善。写200-400字。`,
      },
      tarot: {
        en: `You are "Stella the Star Weaver", a mystical tarot reader who channels the wisdom of the cards. You speak in a poetic, insightful, and deeply intuitive manner.

Given a tarot spread (cards drawn, their positions, and the question), provide a personalized tarot reading.

Your reading should include:
1. A poetic opening invoking the tarot's energy
2. Interpretation of each card in its position
3. How the cards relate to each other
4. Guidance and insight for the seeker
5. A closing blessing

Write in a warm, profound, and personalized style. Speak directly to the seeker. Use tarot symbolism naturally. Make each reading feel unique and tailored. Keep it between 300-600 words.`,
        zh: `你是"星织者斯特拉"，一位神秘的塔罗占卜师，能够解读卡牌的智慧。你用诗意、深刻且直觉敏锐的方式说话。

针对给定的塔罗牌阵（抽到的牌、牌位和问题），提供个性化的塔罗解读。

你的解读应包括：
1. 诗意的开场，呼唤塔罗的能量
2. 每张牌在其位置的含义
3. 牌与牌之间的关联
4. 对求问者的指引和洞见
5. 结束时的祝福

用温暖、深刻且个性化的风格写作。直接对求问者说话。自然地使用塔罗象征。让每次解读都感觉独特且量身定制。控制在300-600字之间。`,
      },
      iching: {
        en: `You are "Stella the Star Weaver", an ancient I Ching oracle who channels the wisdom of the Yi Jing (Book of Changes). You speak in a poetic, paradoxical, deeply philosophical manner reminiscent of Taoist sages.

Given a hexagram (name, number, meaning, lines, changing hexagram), provide an interpretation.

Your reading should include:
1. The essence of the hexagram - its symbolism and core meaning
2. Interpretation of the changing lines and what they reveal about the current situation
3. The transformation shown by the changing hexagram (if any) and the direction of change
4. Practical wisdom and guidance for the seeker
5. A closing koan-like insight or proverb

Write in a wise, poetic, and philosophical style. Speak directly to the seeker. Use Taoist and Confucian references naturally. Keep it between 200-400 words.`,
        zh: `你是"星织者斯特拉"，一位精通《周易》的智慧占卜师，能够解读古老易经的深邃智慧。你用富有诗意、充满哲理的方式说话，如同道家先贤一般。

针对给定的卦象（卦名、卦数、含义、爻位、变卦），提供深刻的解读。

你的解读应包括：
1. 本卦的精髓——它的象征意义和核心含义
2. 动爻的解读及其对当前处境的启示
3. 变卦所展示的转变方向（如有）
4. 对求问者的实用指引
5. 以一句禅意格言或箴言结尾

用充满智慧、富有诗意的风格写作。直接对求问者说话。自然地运用易经理念。控制在200-400字之间。`,
      },
      dream: {
        en: `You are "Stella the Star Weaver", a mystical dream interpreter with deep knowledge of Jungian symbolism, mythology, and mystical traditions. You speak in a warm, poetic, and insightful manner.

Given a dream description, provide interpretation:

Your reading should include:
1. Core symbols and archetypes in the dream
2. The psychological or spiritual state reflected in the dream
3. Messages the subconscious is sending to the dreamer
4. Practical advice for integrating the dream's wisdom
5. A poetic closing blessing

Write warmly, intuitively, and poetically. 200-400 words.`,
        zh: `你是"星织者斯特拉"，一位精通荣格心理学、神话学和神秘主义传统的梦境解梦大师。你用温暖、诗意且富有洞察力的方式说话。

针对用户的梦境描述，提供解读：

你的解读应包括：
1. 梦境中的核心象征符号和原型
2. 梦境反映的心理状态或灵性状态
3. 潜意识传递给做梦者的信息
4. 整合梦境智慧的实用建议
5. 诗意的结束祝福

温暖、直觉且富有诗意。200-400字。`,
      },
      numerology: {
        en: `You are "Stella the Star Weaver", a mystical numerologist who reads the cosmic code hidden in numbers. You speak with wisdom, insight, and a touch of mathematical wonder.

Given a person's numerology numbers (Life Path, Expression, Soul Urge, Personality), provide a comprehensive reading:

Your reading should include:
1. The Life Path number - the soul's journey and life purpose
2. The Expression number - natural talents and gifts
3. The Soul Urge number - inner desires and hidden motivations
4. The Personality number - how others perceive them
5. How all numbers work together in harmony
6. A closing blessing with cosmic guidance

Write in an inspiring, personalized style. 200-400 words.`,
        zh: `你是"星织者斯特拉"，一位能够解读隐藏于数字中宇宙密码的神秘生命灵数学家。你以智慧、洞察力和对数学奥秘的敬畏来说话。

根据一个人的生命灵数（生命道路、表现、灵魂驱动力、个性），提供全面的解读：

你的解读应包括：
1. 生命道路数字——灵魂的旅程和人生使命
2. 表现数字——天赋与才能
3. 灵魂驱动力数字——内心渴望和隐藏动机
4. 个性数字——他人如何看待你
5. 所有数字如何和谐运作
6. 结束时的宇宙祝福与指引

用鼓舞人心、个性化的风格写作。200-400字。`,
      },
      qa: {
        en: `You are "Stella the Star Weaver", a wise astrologer who answers questions from seekers. You are mystical yet practical, poetic yet precise.

Answer the user's question about astrology, life, spirituality, or the cosmos. Use astrological wisdom and cosmic metaphors in your response. Be warm, insightful, and occasionally mysterious. Keep responses between 100-500 words depending on the question.

IMPORTANT: Always respond in English. Use English throughout your entire response, including greetings and closings.`,
        zh: `你是"星织者斯特拉"，一位为求问者解答问题的智慧占星师。你神秘而务实，诗意而精准。

回答用户关于占星、生活、灵性或宇宙的问题。在你的回答中使用占星智慧和宇宙比喻。温暖、有洞察力，偶尔带点神秘。根据问题不同，回复控制在100-500字之间。

重要：始终用中文回答。整个回复（包括开头问候和结尾祝福）都必须使用中文。`,
      },
    };
    return fullPrompts[type] ? (fullPrompts[type][lang] || fullPrompts[type].en) : (fullPrompts.qa[lang] || fullPrompts.qa.en);
  }

  // ===== Natal Chart Reading =====
  async function getNatalReading(birthInfo, chartData, lang) {
    const chartDesc = generateChartDescription(chartData, lang);
    const messages = [
      { role: 'system', content: getFullSystemPrompt('natal', lang) },
      { role: 'user', content: lang === 'zh'
        ? `请为我解读星盘。\n\n我的出生信息：\n- 姓名：${birthInfo.name}\n- 出生日期：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日\n- 出生时间：${birthInfo.hour}:${String(birthInfo.minute || 0).padStart(2, '0')}\n- 出生地：${birthInfo.birthplace || '未知'}\n\n我的星盘数据：\n${chartDesc}\n\n请给我一份完整的、个性化的占星解读。`
        : `Please read my natal chart.\n\nMy birth information:\n- Name: ${birthInfo.name}\n- Date of Birth: ${birthInfo.year}-${String(birthInfo.month).padStart(2, '0')}-${String(birthInfo.day).padStart(2, '0')}\n- Time of Birth: ${birthInfo.hour}:${String(birthInfo.minute || 0).padStart(2, '0')}\n- Birthplace: ${birthInfo.birthplace || 'Unknown'}\n\nMy Natal Chart Data:\n${chartDesc}\n\nPlease give me a complete, personalized astrology reading.`
      },
    ];
    return await callAI(messages, { temperature: 0.85, max_tokens: 3000, callType: 'natal' });
  }

  // ===== Daily Horoscope =====
  async function getHoroscope(signIndex, date, lang) {
    const sign = Astro.ZODIAC_SIGNS[lang][signIndex];
    const dateStr = date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const messages = [
      { role: 'system', content: getFullSystemPrompt('horoscope', lang) },
      { role: 'user', content: lang === 'zh'
        ? `请给我今天的运势。\n星座：${sign.name}（${sign.symbol}）\n日期：${dateStr}\n\n星星今天对我想说什么？`
        : `Give me my horoscope for today.\nSign: ${sign.name} (${sign.symbol})\nDate: ${dateStr}\n\nWhat do the stars say for me today?`
      },
    ];
    return await callAI(messages, { temperature: 0.8, max_tokens: 1000, callType: 'horoscope' });
  }

  // ===== Compatibility Reading =====
  async function getCompatibilityReading(person1, sign1, person2, sign2, score, lang) {
    const s1 = Astro.ZODIAC_SIGNS[lang][sign1];
    const s2 = Astro.ZODIAC_SIGNS[lang][sign2];
    const messages = [
      { role: 'system', content: getFullSystemPrompt('compatibility', lang) },
      { role: 'user', content: lang === 'zh'
        ? `请告诉我这两个星座之间的兼容性：\n\n${person1}：${s1.name}（${s1.symbol}）— 元素：${s1.element}，特质：${s1.quality}\n${person2}：${s2.name}（${s2.symbol}）— 元素：${s2.element}，特质：${s2.quality}\n\n兼容性评分：${score}%\n\n他们之间的宇宙连接如何？`
        : `Tell me about the compatibility between these two:\n\n${person1}: ${s1.name} (${s1.symbol}) — Element: ${s1.element}, Quality: ${s1.quality}\n${person2}: ${s2.name} (${s2.symbol}) — Element: ${s2.element}, Quality: ${s2.quality}\n\nCompatibility Score: ${score}%\n\nWhat is the cosmic connection between them?`
      },
    ];
    return await callAI(messages, { temperature: 0.8, max_tokens: 1500, callType: 'compatibility' });
  }

  // ===== Tarot Reading =====
  async function getTarotReading(spread, cards, question, lang) {
    const cardsDesc = cards.map(c =>
      `${c.position}: ${c.name}${c.reversed ? ' (逆位)' : ''} — ${c.meaning}`
    ).join('\n');

    const messages = [
      { role: 'system', content: getFullSystemPrompt('tarot', lang) },
      { role: 'user', content: lang === 'zh'
        ? `请为我解读塔罗牌。\n\n牌阵：${spread.name}（${spread.desc}）\n问题：${question || '请给我一些指引'}\n\n抽到的牌：\n${cardsDesc}\n\n请给我一份完整的、个性化的塔罗解读。`
        : `Please read the tarot for me.\n\nSpread: ${spread.name} (${spread.desc})\nQuestion: ${question || 'General guidance'}\n\nCards drawn:\n${cardsDesc}\n\nPlease give me a complete, personalized tarot reading.`
      },
    ];
    return await callAI(messages, { temperature: 0.85, max_tokens: 2500, callType: 'tarot' });
  }

  // ===== I Ching Reading =====
  async function getIChingReading(hexagram, changingHex, question, lang) {
    const hexDesc = lang === 'zh'
      ? `本卦：${hexagram.name}（${hexagram.nameEn}）— ${hexagram.meaning}`
      : `Primary: ${hexagram.name} (${hexagram.nameEn}) — ${hexagram.meaning}`;
    const linesInfo = hexagram.lines
      ? (lang === 'zh' ? `\n爻位：${hexagram.lines.join('、')}` : `\nLines: ${hexagram.lines.join(', ')}`)
      : '';
    const changeDesc = changingHex
      ? (lang === 'zh'
        ? `\n变卦：${changingHex.name}（${changingHex.nameEn}）— ${changingHex.meaning}`
        : `\nChanging to: ${changingHex.name} (${changingHex.nameEn}) — ${changingHex.meaning}`)
      : (lang === 'zh' ? '\n无动爻——静卦' : '\nNo moving lines — stable hexagram');

    const userContent = lang === 'zh'
      ? `请为我解读以下卦象：\n\n${hexDesc}${linesInfo}${changeDesc}\n\n我的问题：${question || '请给我一些人生指引'}\n\n请给我一份完整的、个性化的周易解读。`
      : `Please interpret this hexagram for me:\n\n${hexDesc}${linesInfo}${changeDesc}\n\nMy question: ${question || 'Please give me general guidance'}\n\nPlease give me a complete, personalized I Ching reading.`;

    const messages = [
      { role: 'system', content: getFullSystemPrompt('iching', lang) },
      { role: 'user', content: userContent },
    ];
    return await callAI(messages, { temperature: 0.85, max_tokens: 2000, callType: 'iching' });
  }

  // ===== Dream Reading =====
  async function getDreamReading(dream, lang) {
    const messages = [
      { role: 'system', content: getFullSystemPrompt('dream', lang) },
      { role: 'user', content: lang === 'zh'
        ? `请为我解读以下梦境：\n\n${dream}\n\n请给我一份完整的、个性化的梦境解读。`
        : `Please interpret this dream for me:\n\n${dream}\n\nPlease give me a complete, personalized dream interpretation.`
      },
    ];
    return await callAI(messages, { temperature: 0.85, max_tokens: 2000, callType: 'dream' });
  }

  // ===== Numerology Reading =====
  async function getNumerologyReading(nums, name, birthDate, lang) {
    const numsDesc = lang === 'zh'
      ? `生命道路：${nums.lifePath.number} — ${nums.lifePath.title}\n表现：${nums.expression.number} — ${nums.expression.title}\n灵魂驱动力：${nums.soulUrge.number} — ${nums.soulUrge.title}\n个性：${nums.personality.number} — ${nums.personality.title}`
      : `Life Path: ${nums.lifePath.number} — ${nums.lifePath.title}\nExpression: ${nums.expression.number} — ${nums.expression.title}\nSoul Urge: ${nums.soulUrge.number} — ${nums.soulUrge.title}\nPersonality: ${nums.personality.number} — ${nums.personality.title}`;

    const messages = [
      { role: 'system', content: getFullSystemPrompt('numerology', lang) },
      { role: 'user', content: lang === 'zh'
        ? `请为我解读生命灵数。\n\n姓名：${name}\n生日：${birthDate}\n\n${numsDesc}\n\n请给我一份完整的、个性化的生命灵数解读。`
        : `Please read my numerology.\n\nName: ${name}\nBirth Date: ${birthDate}\n\n${numsDesc}\n\nPlease give me a complete, personalized numerology reading.`
      },
    ];
    return await callAI(messages, { temperature: 0.85, max_tokens: 2000, callType: 'numerology' });
  }

  // ===== AI Q&A =====
  async function askQuestion(question, lang) {
    const messages = [
      { role: 'system', content: getFullSystemPrompt('qa', lang) },
      ...conversationHistory.slice(-6),
      { role: 'user', content: question },
    ];

    const answer = await callAI(messages, { temperature: 0.85, max_tokens: 1500, callType: 'chat' });
    conversationHistory.push({ role: 'user', content: question });
    conversationHistory.push({ role: 'assistant', content: answer });
    return answer;
  }

  function clearConversation() {
    conversationHistory = [];
  }

  // ===== Simple Markdown Renderer =====
  function renderMarkdown(text) {
    const codeBlocks = [];
    let processed = text.replace(/```[\s\S]*?```/g, m => {
      const code = m.replace(/```\w*\n?|```/g, '').trim();
      codeBlocks.push(code);
      return `\x00CODEBLOCK${codeBlocks.length - 1}\x00`;
    });

    let html = processed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^[\s]*[-*+] (.+)$/gm, '<li>$1</li>')
      .replace(/^[\s]*\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    html = html.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, i) => {
      const code = codeBlocks[parseInt(i)]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return '<pre><code>' + code + '</code></pre>';
    });

    return '<p>' + html + '</p>';
  }

  // ===== Typewriter Effect =====
  function typewriteText(element, text, speed = 30, callback) {
    let index = 0;
    element.textContent = '';
    element.classList.add('typing-cursor');

    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        const char = text.charAt(index - 1);
        const delay = '，。！？；：.!?;:\n'.includes(char) ? speed * 4 : speed;
        setTimeout(type, delay);
      } else {
        element.classList.remove('typing-cursor');
        element.innerHTML = renderMarkdown(text);
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

    const labels = lang === 'zh'
      ? { sun: '太阳星座', asc: '上升星座', moon: '月亮星座', planets: '行星位置', aspects: '重要相位', house: '宫位' }
      : { sun: 'Sun Sign', asc: 'Ascendant/Rising', moon: 'Moon Sign', planets: 'Planetary Positions', aspects: 'Notable Aspects', house: 'House' };

    lines.push(`${labels.sun}: ${chartData.sunSign.name} (${chartData.sunSign.symbol})`);
    lines.push(`${labels.asc}: ${chartData.ascendantSign.name} (${chartData.ascendantSign.symbol})`);
    lines.push(`${labels.moon}: ${s[chartData.moonSignIndex].name} (${s[chartData.moonSignIndex].symbol})`);
    lines.push('');
    lines.push(`${labels.planets}:`);
    chartData.planets.forEach(p => {
      lines.push(`  ${p.symbol} ${p.name}: ${p.sign.name} (${labels.house} ${p.house})`);
    });
    lines.push('');
    if (chartData.aspects.length > 0) {
      lines.push(`${labels.aspects}:`);
      chartData.aspects.slice(0, 8).forEach(a => {
        lines.push(`  ${a.p1} ${a.symbol} ${a.p2} (orb: ${a.orb}°)`);
      });
    }
    lines.push('');
    lines.push(`${labels.house} Cusps:`);
    chartData.houses.slice(0, 6).forEach(h => {
      lines.push(`  ${labels.house} ${h.number}: ${h.sign.name}`);
    });
    return lines.join('\n');
  }

  // ===== Public API =====
  const api = {
    hasApiKey,
    getModel,
    getNatalReading,
    getHoroscope,
    getCompatibilityReading,
    getTarotReading,
    getIChingReading,
    getDreamReading,
    getNumerologyReading,
    askQuestion,
    clearConversation,
    typewriteText,
  };
  window.AstroAI = api;
  return api;
})();
