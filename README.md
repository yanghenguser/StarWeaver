# ✦ StarWeaver · 星织者 ✦

**AI-Powered Astrology & Divination Web App**

StarWeaver is a beautifully designed, feature-rich astrology web application with integrated AI capabilities. It combines traditional astrological calculations with the power of DeepSeek AI for personalized readings.

## ✨ Features

### 🔮 Natal Chart
- Enter birth information (date, time, birthplace)
- Interactive SVG natal chart wheel with 12 houses, planets, and zodiac symbols
- Planetary positions, aspects, and house cusps
- Chinese zodiac integration
- **AI natal chart reading** powered by DeepSeek

### ⭐ Horoscope
- Daily horoscope for all 12 zodiac signs
- Detailed zodiac sign information (element, ruler, quality, traits)
- **AI daily horoscope** with poetic, personalized readings

### 💞 Love Compatibility
- Calculate compatibility scores between two signs
- Element and quality analysis
- **AI compatibility reading** with detailed insights

### 🎴 Divination
- **Wheel of Fortune** — tarot-style card draw for guidance
- **Astro Dice** — random cosmic wisdom
- Random astrological quotes on every page load

### 🌙 AI Oracle Chat
- Conversational AI astrologer ("Stella the Star Weaver")
- Typewriter text effect for mystical feel
- Multi-turn conversation with context memory
- Switchable AI models (DeepSeek Chat / DeepSeek Reasoner)

### 🌌 Cosmic Dashboard
- Current moon phase display (SVG rendering)
- Today's celestial weather overview
- Dynamic star particle background
- Time-aware color themes
- Bilingual support (Chinese / English)

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in any modern browser
2. No server required — pure frontend application

### AI Setup
1. Go to the **AI Oracle** tab
2. Enter your DeepSeek API Key (sk-...)
3. Select model: `deepseek-chat` (fast) or `deepseek-reasoner` (deep thinking)
4. Click Connect — you're ready! Your key stays in memory only

### Getting an API Key
- Visit [platform.deepseek.com](https://platform.deepseek.com)
- Sign up and create an API key
- DeepSeek offers very affordable pricing

## 🛠️ Technical Details

### Architecture
- **Pure frontend** — no backend, no database, no build tools
- **ES6 modules** using IIFE pattern for clean namespace
- **Canvas API** for dynamic star background
- **SVG** for natal chart visualization
- **CSS3** animations, transitions, glassmorphism

### File Structure
```
StarWeaver/
├── index.html          # Main application page
├── css/
│   └── style.css       # Dark starry sky theme
├── js/
│   ├── astro.js        # Astronomical calculations
│   ├── ai.js           # DeepSeek AI integration
│   └── app.js          # UI logic and interactions
├── assets/             # (reserved for future assets)
└── README.md           # This file
```

### AI Module (`ai.js`)
- Direct API calls to DeepSeek via `fetch()`
- Configurable endpoint, model, and parameters
- System prompts for different reading types
- Conversation history management
- Typewriter text animation

### Astronomical Calculations (`astro.js`)
- Zodiac sign determination
- Simplified planetary positions
- House cusp calculation
- Aspect detection (conjunction, sextile, square, trine, opposition)
- Moon phase calculation (Metonic cycle)
- Compatibility scoring algorithm
- Chinese zodiac and element calculation

## 📱 Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (responsive design)

## 🔒 Privacy
- **No data collection** — everything runs in your browser
- **API key stays in memory** — never stored or transmitted except to DeepSeek
- **No cookies, no tracking**

## 🎨 Design Credits
- Starry sky theme inspired by the cosmos
- Color palette: Gold (#D4AF37), Purple (#9B59B6), Deep Navy (#0A0A1A)
- Typography: System fonts with Chinese support

## 🐱 Made with love
Built with ✨ DeepSeek AI by Hermes Agent / 小爪
