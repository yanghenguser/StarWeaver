#!/usr/bin/env node
/**
 * Generate 12 SEO-optimized zodiac sign pages
 * Run: node scripts/generate-zodiac-pages.js
 * Output: 12 HTML files in zodiac/ directory
 */

const fs = require('fs');
const path = require('path');

const signs = [
  {
    file: 'aries',
    name: '白羊座',
    english: 'Aries',
    emoji: '♈',
    dateRange: '3月21日 - 4月19日',
    element: '火象星座',
    ruler: '火星',
    personality: '白羊座的人充满活力与热情，是天生的领导者。他们勇敢果断、行动力强，总是充满冒险精神。白羊座性格直率坦诚，做事雷厉风行，不喜欢拖泥带水。他们有着强烈的竞争意识和进取心，勇于挑战自我，不断突破极限。',
    love: '在爱情中，白羊座热情奔放、主动直接。他们会毫不犹豫地追求心仪的对象，用满腔热情点燃恋情。白羊座需要同样独立自主的伴侣，能够理解他们对自由和空间的需求。在感情中，他们忠诚专一，希望能与爱人一起冒险、共同成长。',
    career: '白羊座适合从事需要勇气和决断力的职业，如创业者、军人、外科医生、运动员、消防员等。他们天生具有领导才能，在管理岗位上也能表现出色。白羊座在工作中目标明确，执行力强，但需要注意培养耐心和团队协作精神。',
    lucky: {
      numbers: '9, 18, 27, 36, 45',
      color: '红色 · Red',
      gemstone: '红宝石 · Ruby',
      day: '星期二 · Tuesday'
    }
  },
  {
    file: 'taurus',
    name: '金牛座',
    english: 'Taurus',
    emoji: '♉',
    dateRange: '4月20日 - 5月20日',
    element: '土象星座',
    ruler: '金星',
    personality: '金牛座的人以稳重踏实著称，是十二星座中最可靠的存在。他们性格温和、耐心十足，做事循序渐进，从不急功近利。金牛座有着极强的毅力和坚持精神，一旦确立目标就会坚定不移地走下去。他们对美的事物有着天生的感知力，享受生活中的美好与舒适。',
    love: '金牛座在爱情中忠诚专一，是值得托付终身的伴侣。他们表达爱意的方式务实而温暖，注重用实际行动呵护爱人。金牛座向往稳定长久的感情关系，不喜欢变动和不确定性。虽然不擅浪漫言辞，但他们的爱深沉而持久，经得起时间的考验。',
    career: '金牛座适合从事金融、会计、建筑设计、园艺、美食、艺术创作等职业。他们的耐心和细致使他们在需要长期投入的领域表现出色。金牛座对物质和财富有着敏锐的直觉，在投资理财方面往往有着独到的见解。',
    lucky: {
      numbers: '6, 15, 24, 33, 42',
      color: '绿色 · Green',
      gemstone: '翡翠 · Emerald',
      day: '星期五 · Friday'
    }
  },
  {
    file: 'gemini',
    name: '双子座',
    english: 'Gemini',
    emoji: '♊',
    dateRange: '5月21日 - 6月21日',
    element: '风象星座',
    ruler: '水星',
    personality: '双子座的人聪明机智、思维敏捷，是十二星座中最善于沟通的星座。他们好奇心旺盛，对新鲜事物充满探索欲望。双子座性格多变，拥有双重性格特质，时而活泼开朗，时而深沉内敛。他们口才出众，善于表达，是天生的社交达人。',
    love: '双子座在爱情中需要精神层面的共鸣和思想的碰撞。他们喜欢有趣、机智的伴侣，能够与对方进行深入的交流和探讨。双子座追求新鲜感，需要伴侣理解他们对自由和变化的需求。当遇到真正懂他们的人，双子座会展现出极其浪漫和专情的一面。',
    career: '双子座适合从事媒体、写作、教育、销售、编程、翻译、市场营销等需要沟通和灵活思维的工作。他们学习能力强，适应力好，能在多变的环境中游刃有余。双子座的创新思维和多才多艺使他们在创意行业也能大放异彩。',
    lucky: {
      numbers: '5, 14, 23, 32, 41',
      color: '黄色 · Yellow',
      gemstone: '黄水晶 · Citrine',
      day: '星期三 · Wednesday'
    }
  },
  {
    file: 'cancer',
    name: '巨蟹座',
    english: 'Cancer',
    emoji: '♋',
    dateRange: '6月22日 - 7月22日',
    element: '水象星座',
    ruler: '月亮',
    personality: '巨蟹座的人温柔细腻、善解人意，是十二星座中最具家庭观念的星座。他们情感丰富，直觉敏锐，总能准确感知他人的情绪变化。巨蟹座非常重视家庭和亲情，家是他们的心灵港湾。他们有着强烈的保护欲，会竭尽全力守护所爱之人。',
    love: '巨蟹座在爱情中极其温柔和体贴，他们会用心记住伴侣的每一个喜好和习惯。巨蟹座需要安全感和被需要的感觉，渴望建立一个温馨稳定的家庭。他们对感情的投入深沉而持久，一旦认定一个人就会全心全意地付出。巨蟹座的浪漫体现在日常生活的点滴关怀中。',
    career: '巨蟹座适合从事教育、护理、心理咨询、社会工作、餐饮、房地产等职业。他们的同理心和关怀能力使他们在服务行业表现出色。巨蟹座在需要细心和耐心的领域也能发挥优势，如人力资源、行政管理等。',
    lucky: {
      numbers: '2, 11, 20, 29, 38',
      color: '银色 · Silver',
      gemstone: '月光石 · Moonstone',
      day: '星期一 · Monday'
    }
  },
  {
    file: 'leo',
    name: '狮子座',
    english: 'Leo',
    emoji: '♌',
    dateRange: '7月23日 - 8月22日',
    element: '火象星座',
    ruler: '太阳',
    personality: '狮子座的人自信大方、热情洋溢，是天生的王者。他们有着与生俱来的领袖气质和强大的个人魅力，总能成为人群中的焦点。狮子座慷慨大方，重情重义，对朋友和家人极其护短。他们充满创造力和表现欲，喜欢被赞美和认可，但也能以真诚和温暖感染身边的每一个人。',
    love: '狮子座在爱情中浪漫而专一，他们会用最热烈的方式表达爱意。狮子座喜欢被崇拜和被重视，希望伴侣能够欣赏和肯定他们的价值。在感情中，狮子座极其忠诚和保护欲强，会为爱人遮风挡雨。他们渴望一段轰轰烈烈的爱情，希望与伴侣一起闪耀光芒。',
    career: '狮子座适合从事管理、演艺、设计、教育、销售、娱乐业等能够展示才华的领域。他们的领导能力和组织才能使他们在团队中自然而然地成为核心人物。狮子座在需要创造力和表现力的工作中如鱼得水，能够充分发挥自己的天赋。',
    lucky: {
      numbers: '1, 10, 19, 28, 37',
      color: '金色 · Gold',
      gemstone: '琥珀 · Amber',
      day: '星期日 · Sunday'
    }
  },
  {
    file: 'virgo',
    name: '处女座',
    english: 'Virgo',
    emoji: '♍',
    dateRange: '8月23日 - 9月22日',
    element: '土象星座',
    ruler: '水星',
    personality: '处女座的人追求完美、严谨细致，是十二星座中最具分析能力的星座。他们思维缜密，注重细节，凡事都力求做到最好。处女座有着强烈的责任感和服务精神，总是默默付出，不求回报。他们理性客观，善于逻辑分析，但也因此常常对自己和他人要求过高。',
    love: '处女座在爱情中虽然表现得较为含蓄，但他们的爱深沉而真挚。他们用行动而非言语来表达爱意，会细心地照顾伴侣的生活点滴。处女座需要能够理解他们完美主义倾向的伴侣，欣赏他们为感情付出的努力。一旦确定关系，处女座会是极其可靠和忠诚的人生伴侣。',
    career: '处女座适合从事医疗、会计、编辑、数据分析、科研、质量管理等需要精确和细致的职业。他们的分析能力和严谨态度使他们在专业技术领域表现出色。处女座在服务行业也能发挥所长，用他们的细致周到赢得客户的信任。',
    lucky: {
      numbers: '3, 12, 21, 30, 39',
      color: '蓝色 · Blue',
      gemstone: '蓝宝石 · Sapphire',
      day: '星期三 · Wednesday'
    }
  },
  {
    file: 'libra',
    name: '天秤座',
    english: 'Libra',
    emoji: '♎',
    dateRange: '9月23日 - 10月23日',
    element: '风象星座',
    ruler: '金星',
    personality: '天秤座的人优雅迷人、公平公正，是十二星座中最具魅力的外交家。他们天生懂得平衡之道，追求和谐美好的人际关系。天秤座审美品味高雅，对艺术和美有着独特的见解。他们善于倾听，处事圆融，总能在冲突中找到让各方都满意的解决方案。',
    love: '天秤座在爱情中浪漫而优雅，是极佳的恋爱对象。他们重视感情中的平等和互相尊重，希望建立健康平衡的伴侣关系。天秤座喜欢美好的约会和浪漫的仪式感，会用智慧和魅力维持感情的新鲜度。他们需要能够进行深入精神交流的伴侣，共同追求美好生活。',
    career: '天秤座适合从事法律、外交、设计、公关、咨询、艺术策展等需要社交和审美的职业。他们的协调能力和谈判技巧使他们在需要斡旋的岗位上大放异彩。天秤座在团队中是不可或缺的润滑剂，能够营造和谐的工作氛围。',
    lucky: {
      numbers: '4, 13, 22, 31, 40',
      color: '粉色 · Pink',
      gemstone: '粉晶 · Rose Quartz',
      day: '星期五 · Friday'
    }
  },
  {
    file: 'scorpio',
    name: '天蝎座',
    english: 'Scorpio',
    emoji: '♏',
    dateRange: '10月24日 - 11月22日',
    element: '水象星座',
    ruler: '冥王星',
    personality: '天蝎座的人深邃神秘、意志坚定，是十二星座中最具洞察力的星座。他们拥有强大的内在力量和惊人的专注力，一旦设定目标就会全力以赴。天蝎座直觉极其敏锐，能够看透人心和事物的本质。他们性格坚韧，在逆境中展现出惊人的毅力和复原力。',
    love: '天蝎座在爱情中极其 passionate，爱得深沉而彻底。他们渴望灵魂层面的深度连接，追求刻骨铭心的感情体验。天蝎座对伴侣极度忠诚，但也要求对方同等的专一和坦诚。他们的感情强烈而持久，一旦爱上就是一生一世。天蝎座需要能够接受他们强烈情感的伴侣。',
    career: '天蝎座适合从事研究、侦探、心理医生、投资银行、科学家、外科医生等需要深度和专注的职业。他们的洞察力和分析能力使他们在探索真相的领域中表现出色。天蝎座在危机管理和资源调配方面也有着天赋。',
    lucky: {
      numbers: '8, 17, 26, 35, 44',
      color: '深红 · Deep Red',
      gemstone: '黑曜石 · Obsidian',
      day: '星期二 · Tuesday'
    }
  },
  {
    file: 'sagittarius',
    name: '射手座',
    english: 'Sagittarius',
    emoji: '♐',
    dateRange: '11月23日 - 12月21日',
    element: '火象星座',
    ruler: '木星',
    personality: '射手座的人乐观开朗、热爱自由，是十二星座中最具冒险精神的探索者。他们心胸开阔，思想前卫，对世界充满好奇和热情。射手座诚实直率，有一说一，不喜欢虚伪和做作。他们天生乐观，总能以积极的态度面对生活中的挑战，并用自己的热情感染身边每一个人。',
    love: '射手座在爱情中追求精神共鸣和共同成长。他们希望伴侣能够理解他们对自由和探索的渴望，能够一起分享生活中的冒险和乐趣。射手座的爱情充满活力和惊喜，他们会带着伴侣一起探索世界的美好。虽然害怕被束缚，但当遇到真正懂他们的灵魂伴侣时，射手座也会展现出深情专情的一面。',
    career: '射手座适合从事旅游、教育、出版、体育、摄影、国际贸易等与探索和传播相关的职业。他们的开拓精神和乐观态度使他们在创业领域也能取得成功。射手座在需要跨文化沟通和远程工作的岗位上表现出色。',
    lucky: {
      numbers: '7, 16, 25, 34, 43',
      color: '紫色 · Purple',
      gemstone: '紫水晶 · Amethyst',
      day: '星期四 · Thursday'
    }
  },
  {
    file: 'capricorn',
    name: '摩羯座',
    english: 'Capricorn',
    emoji: '♑',
    dateRange: '12月22日 - 1月19日',
    element: '土象星座',
    ruler: '土星',
    personality: '摩羯座的人脚踏实地、坚韧不拔，是十二星座中最具事业心和责任感的星座。他们目标明确，计划周密，有着超强的自律能力和耐心。摩羯座成熟稳重，处事冷静理智，是值得信赖的依靠。他们懂得延迟满足，愿意为了长远目标付出持续的努力。',
    love: '摩羯座在爱情中虽然不擅浪漫表达，但他们的爱务实而深沉。他们会用自己的努力和成就来给伴侣提供最好的生活保障。摩羯座需要能够理解他们事业追求和支持他们目标的伴侣。在感情中，摩羯座极其忠诚可靠，虽然慢热但感情持久稳定，是值得托付终身的伴侣。',
    career: '摩羯座天生适合从事管理、金融、法律、建筑、公务员、企业高管等需要责任心和战略眼光的职业。他们的组织能力和执行力使他们在事业发展中步步为营，最终登上顶峰。摩羯座在需要长期规划和持续投入的领域能够发挥最大优势。',
    lucky: {
      numbers: '8, 17, 26, 35, 44',
      color: '棕色 · Brown',
      gemstone: '玛瑙 · Onyx',
      day: '星期六 · Saturday'
    }
  },
  {
    file: 'aquarius',
    name: '水瓶座',
    english: 'Aquarius',
    emoji: '♒',
    dateRange: '1月20日 - 2月18日',
    element: '风象星座',
    ruler: '天王星',
    personality: '水瓶座的人思想前卫、独立创新，是十二星座中最具革新精神的星座。他们思维开放，不拘泥于传统，总是以独特的视角看待世界。水瓶座崇尚自由，追求个性，不愿被世俗规则束缚。他们具有强烈的人道主义精神，关心社会进步和人类福祉。',
    love: '水瓶座在爱情中需要精神层面的契合和思想的自由。他们希望伴侣能够尊重他们的独立空间和个人追求。水瓶座的爱情理性而优雅，不喜过于黏腻的感情关系。他们需要能够进行深度思想交流的伴侣，共同探讨人生和理想。虽然看似疏离，但水瓶座的爱纯粹而真诚。',
    career: '水瓶座适合从事科技、发明、航天、社会活动、心理咨询、教育、艺术创作等创新领域。他们的前瞻性思维和创新能力使他们在推动社会进步的领域中大放异彩。水瓶座在团队中常常是提出新想法和解决方案的那个人。',
    lucky: {
      numbers: '4, 13, 22, 31, 40',
      color: '青色 · Cyan',
      gemstone: '海蓝宝石 · Aquamarine',
      day: '星期六 · Saturday'
    }
  },
  {
    file: 'pisces',
    name: '双鱼座',
    english: 'Pisces',
    emoji: '♓',
    dateRange: '2月19日 - 3月20日',
    element: '水象星座',
    ruler: '海王星',
    personality: '双鱼座的人温柔善良、富有想象力，是十二星座中最具艺术天赋的梦想家。他们有着极其丰富的情感世界和超凡的直觉力。双鱼座善解人意，富有同情心，总是愿意帮助需要帮助的人。他们极具创造力，在艺术和音乐领域有着独特的才华。',
    love: '双鱼座在爱情中浪漫至极，是十二星座中最会营造梦幻恋情的星座。他们会用心制造惊喜和浪漫，让爱情充满童话般的色彩。双鱼座需要能够理解他们敏感内心的伴侣，给予足够的情感支持和安全感。在感情中，双鱼座全情投入，愿意为爱付出一切。',
    career: '双鱼座适合从事艺术创作、音乐、舞蹈、电影、写作、慈善事业、心理咨询等需要创造力和同理心的职业。他们的想象力和感受力使他们在艺术领域能够创作出打动人心的作品。双鱼座在需要直觉和灵感的岗位上也能发挥独特优势。',
    lucky: {
      numbers: '6, 15, 24, 33, 42',
      color: '海蓝 · Sea Blue',
      gemstone: '海蓝宝 · Aquamarine',
      day: '星期四 · Thursday'
    }
  }
];

const SITE_URL = 'https://starweaver.vercel.app';

function generatePage(sign) {
  const canonical = `${SITE_URL}/${sign.file}`;
  const title = `${sign.name}(${sign.english})全解析 - 性格特点、爱情运势、事业指南 | StarWeaver · 星织者`;
  const description = `${sign.name}（${sign.english}）完整指南：了解${sign.name}的性格特点、爱情运势、事业发展、幸运数字和幸运宝石。${sign.dateRange}出生的人属于${sign.name}，守护星为${sign.ruler}。StarWeaver AI为你深度解析星座奥秘。`;
  const keywords = `${sign.name},${sign.english},${sign.name}性格,${sign.name}爱情,${sign.name}运势,${sign.name}事业,星座,占星,StarWeaver,星织者,AI占星`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>">

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="StarWeaver · 星织者">
  <meta property="og:locale" content="zh_CN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">

  <!-- JSON-LD Schema -->
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ZodiacSign",
  "name": "${sign.name}",
  "alternateName": "${sign.english}",
  "description": "${sign.name}（${sign.english}）是${sign.element}，守护星为${sign.ruler}，日期范围为${sign.dateRange}。",
  "url": "${canonical}"
}
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
      background: #0a0a1a;
      color: #e0dcd0;
      min-height: 100vh;
      line-height: 1.8;
    }
    .stars-bg {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: radial-gradient(ellipse at 20% 50%, #0f0f2e 0%, #0a0a1a 70%);
      z-index: -1;
      overflow: hidden;
    }
    .stars-bg::before {
      content: '';
      position: absolute;
      width: 2px; height: 2px;
      background: #fff;
      border-radius: 50%;
      box-shadow:
        100px 200px 0 0 rgba(255,255,255,0.5),
        300px 400px 0 0 rgba(255,255,255,0.3),
        500px 100px 0 0 rgba(255,255,255,0.4),
        700px 500px 0 0 rgba(255,255,255,0.3),
        200px 600px 0 0 rgba(255,255,255,0.2),
        600px 300px 0 0 rgba(255,255,255,0.5),
        800px 200px 0 0 rgba(255,255,255,0.3),
        400px 700px 0 0 rgba(255,255,255,0.4),
        900px 600px 0 0 rgba(255,255,255,0.2),
        150px 800px 0 0 rgba(255,255,255,0.3);
      animation: twinkle 4s ease-in-out infinite alternate;
    }
    @keyframes twinkle {
      0% { opacity: 0.3; }
      100% { opacity: 1; }
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }
    header {
      text-align: center;
      padding: 3rem 0 2rem;
    }
    .sign-emoji {
      font-size: 4rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 2.2rem;
      color: #d4af37;
      letter-spacing: 0.08em;
      margin-bottom: 0.3rem;
    }
    .sign-subtitle {
      font-size: 1rem;
      color: #a09070;
      letter-spacing: 0.15em;
    }
    .meta-bar {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
      margin: 1.5rem 0;
      padding: 1rem;
      background: rgba(212, 175, 55, 0.06);
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 12px;
    }
    .meta-item {
      text-align: center;
    }
    .meta-label {
      font-size: 0.75rem;
      color: #7a7050;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .meta-value {
      font-size: 1rem;
      color: #d4af37;
      font-weight: 600;
    }
    .section-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(212, 175, 55, 0.1);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      transition: border-color 0.3s;
    }
    .section-card:hover {
      border-color: rgba(212, 175, 55, 0.25);
    }
    .section-title {
      font-size: 1.3rem;
      color: #d4af37;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-title .icon { font-size: 1.4rem; }
    .section-card p {
      color: #c8c4b8;
      font-size: 0.95rem;
      text-indent: 2em;
    }
    .lucky-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 480px) {
      .lucky-grid { grid-template-columns: 1fr; }
    }
    .lucky-item {
      background: rgba(212, 175, 55, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.1);
      border-radius: 10px;
      padding: 1rem;
      text-align: center;
    }
    .lucky-item-label {
      font-size: 0.8rem;
      color: #7a7050;
      letter-spacing: 0.05em;
    }
    .lucky-item-value {
      font-size: 1.1rem;
      color: #d4af37;
      font-weight: 600;
      margin-top: 0.3rem;
    }
    .cta-section {
      text-align: center;
      padding: 3rem 0;
      margin-top: 1rem;
      border-top: 1px solid rgba(212, 175, 55, 0.15);
    }
    .cta-title {
      font-size: 1.5rem;
      color: #d4af37;
      margin-bottom: 0.8rem;
    }
    .cta-text {
      color: #a09070;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }
    .cta-btn {
      display: inline-block;
      padding: 0.9rem 2.5rem;
      background: linear-gradient(135deg, #d4af37, #b8962e);
      color: #0a0a1a;
      font-size: 1.05rem;
      font-weight: 700;
      text-decoration: none;
      border-radius: 50px;
      transition: all 0.3s;
      letter-spacing: 0.05em;
    }
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3);
    }
    .back-link {
      display: inline-block;
      margin-top: 2rem;
      color: #7a7050;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s;
    }
    .back-link:hover { color: #d4af37; }
    footer {
      text-align: center;
      padding: 2rem 0 0;
      color: #5a5040;
      font-size: 0.8rem;
      border-top: 1px solid rgba(212, 175, 55, 0.08);
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="stars-bg"></div>
  <div class="container">

    <header>
      <span class="sign-emoji">${sign.emoji}</span>
      <h1>${sign.name} · ${sign.english}</h1>
      <p class="sign-subtitle">${sign.dateRange} · ${sign.element} · 守护星 ${sign.ruler}</p>
    </header>

    <div class="meta-bar">
      <div class="meta-item">
        <div class="meta-label">星座符号</div>
        <div class="meta-value">${sign.emoji}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">日期范围</div>
        <div class="meta-value">${sign.dateRange}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">星座属性</div>
        <div class="meta-value">${sign.element}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">守护星</div>
        <div class="meta-value">${sign.ruler}</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title"><span class="icon">📋</span> 性格特点 · Personality</div>
      <p>${sign.personality}</p>
    </div>

    <div class="section-card">
      <div class="section-title"><span class="icon">💕</span> 爱情运势 · Love</div>
      <p>${sign.love}</p>
    </div>

    <div class="section-card">
      <div class="section-title"><span class="icon">💼</span> 事业发展 · Career</div>
      <p>${sign.career}</p>
    </div>

    <div class="section-card">
      <div class="section-title"><span class="icon">🍀</span> 幸运指南 · Lucky Guide</div>
      <div class="lucky-grid">
        <div class="lucky-item">
          <div class="lucky-item-label">幸运数字</div>
          <div class="lucky-item-value">${sign.lucky.numbers}</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-item-label">幸运颜色</div>
          <div class="lucky-item-value">${sign.lucky.color}</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-item-label">幸运宝石</div>
          <div class="lucky-item-value">${sign.lucky.gemstone}</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-item-label">幸运日</div>
          <div class="lucky-item-value">${sign.lucky.day}</div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="cta-title">✨ 获取你的专属 AI 解读</div>
      <p class="cta-text">让 StarWeaver AI 为你深度解析命盘，揭示宇宙的奥秘与指引</p>
      <a href="${SITE_URL}" class="cta-btn">Get Your Free AI Reading at StarWeaver</a>
      <br>
      <a href="${SITE_URL}" class="back-link">← 返回 StarWeaver 首页</a>
    </div>

    <footer>
      <p>✦ StarWeaver · 星织者 ✦</p>
      <p style="margin-top:0.3rem;">Powered by DeepSeek AI · 以星辰之名编织命运</p>
    </footer>

  </div>
</body>
</html>`;
}

// Generate all pages
const outputDir = path.join(__dirname, '..', 'zodiac');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

signs.forEach(sign => {
  const html = generatePage(sign);
  const filePath = path.join(outputDir, `${sign.file}.html`);
  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✓ Generated zodiac/${sign.file}.html — ${sign.name} (${sign.english})`);
});

console.log(`\n✨ Done! Generated ${signs.length} zodiac sign pages in zodiac/`);
