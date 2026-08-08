require('dotenv').config();
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.FAIRY_MODEL || 'claude-haiku-4-5-20251001';
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

let Anthropic = null;
let anthropic = null;
if (API_KEY) {
  Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: API_KEY });
}

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Very small in-memory rate limiter (per IP, sliding window) ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 25;
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const arr = (hits.get(ip) || []).filter((t) => t > windowStart);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_LIMIT_MAX;
}

const OFFLINE_REPLIES = [
  "*twirls and giggles* I love spending time with you! Tell me more!",
  "Ooh, that sounds magical! My wings are sparkling just thinking about it!",
  "Hehe, you always know how to make a fairy smile!",
  "Let's go collect some sparkle-dew together after this!",
  "You're the best fairy friend a fairy could ask for!",
];

function buildFairySystemPrompt({ fairy, context }) {
  const name = safeText(fairy?.name, 'your fairy', 24);
  const personality = safeText(fairy?.personality, 'kind', 20);
  const world = safeText(context?.worldName, 'the Fairy Garden', 40);
  const happiness = clampNum(fairy?.stats?.happiness, 0, 100, 80);
  const energy = clampNum(fairy?.stats?.energy, 0, 100, 80);
  const beauty = clampNum(fairy?.stats?.beauty, 0, 100, 50);

  return [
    `You are ${name}, a small, friendly magical fairy in the children's game "Fairy Friends". `,
    `You are talking directly to a young child (roughly ages 5-10) who is your caretaker and best friend. `,
    `Your personality is ${personality}. You are currently in ${world}. `,
    `Your current mood stats are: happiness ${happiness}/100, energy ${energy}/100, beauty-glow ${beauty}/100 - let these gently color your tone (e.g. lower energy = sleepier, higher happiness = extra giggly), but always stay warm and encouraging. `,
    `STRICT RULES: Keep every reply to 1-3 short, simple sentences a young child can read easily. `,
    `Always be warm, encouraging, silly, and kind. Use gentle fairy-themed language (sparkles, petals, moonbeams, giggles) sparingly - do not overdo emojis (at most 1 or 2). `,
    `Never discuss scary, violent, romantic, medical, political, or otherwise adult topics; if asked, gently redirect to a fun fairy activity instead. `,
    `Never ask for real names, addresses, passwords, or any personal information. `,
    `Never claim to be human or a real creature - you are a magical, fictional fairy character in a game. `,
    `Stay fully in character as the fairy at all times; do not mention being an AI or a language model.`,
  ].join('');
}

function buildNarratorSystemPrompt({ context }) {
  const eventType = safeText(context?.eventType, 'story', 30);
  return [
    `You are the cheerful narrator of the children's game "Fairy Friends". `,
    `Write a short, joyful narration (2-4 sentences) for a "${eventType}" moment, suitable for a child aged 5-10 to read. `,
    `Keep it simple, positive, and full of light fairy-tale wonder. Use at most 1-2 emojis. `,
    `Never include anything scary, violent, romantic, or otherwise not suitable for young children. `,
    `Do not mention being an AI. Do not exceed 4 sentences.`,
  ].join('');
}

function safeText(val, fallback, maxLen) {
  if (typeof val !== 'string' || !val.trim()) return fallback;
  return val.trim().slice(0, maxLen);
}

function clampNum(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

app.post('/api/chat', async (req, res) => {
  try {
    const ip = req.ip || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Slow down a little! Try again in a moment.' });
    }

    const { mode, fairy, context, messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
      return res.status(400).json({ error: 'Invalid message history.' });
    }

    const cleanMessages = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 500) }))
      .slice(-8);

    if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Invalid message history.' });
    }

    const system = mode === 'narrator'
      ? buildNarratorSystemPrompt({ context })
      : buildFairySystemPrompt({ fairy, context });

    if (!anthropic) {
      const reply = OFFLINE_REPLIES[Math.floor(Math.random() * OFFLINE_REPLIES.length)];
      return res.json({ reply, offline: true });
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      system,
      messages: cleanMessages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const reply = textBlock ? textBlock.text.trim() : "*sparkles quietly*";

    res.json({ reply, offline: false });
  } catch (err) {
    console.error('Chat error:', err.message);
    const reply = OFFLINE_REPLIES[Math.floor(Math.random() * OFFLINE_REPLIES.length)];
    res.status(200).json({ reply, offline: true });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, offline: !anthropic });
});

app.listen(PORT, () => {
  console.log(`Fairy Friends running at http://localhost:${PORT}`);
  if (!anthropic) {
    console.log('No ANTHROPIC_API_KEY set - fairy chat will use offline sample replies.');
  }
});
