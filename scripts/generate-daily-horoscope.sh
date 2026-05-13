#!/bin/bash
# StarWeaver - 每日运势自动生成脚本
# 由 cron 每天早上6点执行，调用 DeepSeek API 生成12星座运势
# 结果写入 data/daily-horoscope.json

set -e
cd "$(dirname "$0")/.."

# 加密的 DeepSeek API key (XOR+Base64)
ENCRYPTED_KEY="IB9MFGcEVEYEFgcECwE1QFFDZVxQQgZGAQMKDTBNBUM0XFY="
XOR_KEY="StarWeaver2024"

# 生成中英文运势
python3 << 'PYEOF'
import base64, urllib.request, json, datetime, os, sys

ENCRYPTED_KEY = "IB9MFGcEVEYEFgcECwE1QFFDZVxQQgZGAQMKDTBNBUM0XFY="
XOR_KEY = "StarWeaver2024"
decoded = base64.b64decode(ENCRYPTED_KEY)
api_key = "".join(chr(decoded[i] ^ ord(XOR_KEY[i % len(XOR_KEY)])) for i in range(len(decoded)))

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(PROJECT_DIR, "..", "data", "daily-horoscope.json")

signs = [
    ("aries","白羊座"), ("taurus","金牛座"), ("gemini","双子座"),
    ("cancer","巨蟹座"), ("leo","狮子座"), ("virgo","处女座"),
    ("libra","天秤座"), ("scorpio","天蝎座"), ("sagittarius","射手座"),
    ("capricorn","摩羯座"), ("aquarius","水瓶座"), ("pisces","双鱼座")
]

today = datetime.date.today()
date_str = today.strftime("%Y年%m月%d日")

# 生成中文运势
zh_prompt = f"""你是星座运势作家。为{today}（{date_str}）的12星座各写一段中文每日运势。
要求：50-80字，包含运势关键词和诗意星象描述，各有特色不要雷同。
格式：星座名：运势内容

星座：白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座"""

# 生成英文运势
en_prompt = f"""You are a horoscope writer. Write poetic daily horoscopes for {today.strftime('%B %d, %Y')} for all 12 zodiac signs.
Each: 2-3 sentences, unique per sign, with specific astrological references.
Format: SignName: horoscope text

Signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces"""

def call_deepseek(prompt, temp=0.9):
    data = json.dumps({"model":"deepseek-chat","messages":[{"role":"user","content":prompt}],"temperature":temp,"max_tokens":2000}).encode()
    req = urllib.request.Request(
        "https://api.deepseek.com/v1/chat/completions",
        data=data,
        headers={"Content-Type":"application/json","Authorization":f"Bearer {api_key}"}
    )
    resp = urllib.request.urlopen(req, timeout=120)
    return json.loads(resp.read())["choices"][0]["message"]["content"]

# 生成
print("生成中文运势...")
zh_raw = call_deepseek(zh_prompt)

print("生成英文运势...")
en_raw = call_deepseek(en_prompt)

# 解析
zh_map = {}
for line in zh_raw.strip().split("\n"):
    line = line.strip()
    if "：" in line:
        n, t = line.split("：", 1)
        m = {"白羊座":"aries","金牛座":"taurus","双子座":"gemini","巨蟹座":"cancer","狮子座":"leo","处女座":"virgo","天秤座":"libra","天蝎座":"scorpio","射手座":"sagittarius","摩羯座":"capricorn","水瓶座":"aquarius","双鱼座":"pisces"}
        k = m.get(n)
        if k: zh_map[k] = t.strip()

en_map = {}
for line in en_raw.strip().split("\n"):
    line = line.strip()
    if ":" in line:
        n, t = line.split(":", 1)
        k = n.strip().lower()
        en_map[k] = t.strip()

sign_keys = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"]
horoscopes = {}
for k in sign_keys:
    horoscopes[k] = {"zh": zh_map.get(k, ""), "en": en_map.get(k, "")}

output = {
    "date": today.isoformat(),
    "generated_at": datetime.datetime.now().isoformat(),
    "horoscopes": horoscopes
}

os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
with open(DATA_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

zh_count = sum(1 for k in horoscopes if horoscopes[k]["zh"])
en_count = sum(1 for k in horoscopes if horoscopes[k]["en"])
print(f"✅ 运势已生成: 中文{zh_count}/12 + 英文{en_count}/12")
PYEOF
