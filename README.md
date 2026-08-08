# Fairy Friends 🧚✨

A kids' game where you design your own magical fairy, chat with her (powered by Claude), take care of her, explore enchanted worlds, and try to win the **Grand Beauty Bloom** competition.

## Features

- **Design your fairy** — pick skin sparkle, hair color/style, wing color/style, outfit color, and a personality. Everything is drawn live as an SVG, no external art assets needed.
- **Talk to your fairy** — a chat screen backed by the Claude API (`/api/chat`) where your fairy replies in character, shaped by her personality and current mood.
- **Take care of her** — Happiness, Energy, and Beauty Glow stats drift down slowly over time and are restored with snacks.
- **Snack Shop** — spend sparkle points on treats that boost different stats.
- **5 worlds / levels** — Sparkle Meadow, Crystal Caves, Cloud Kingdom, Moonlit Forest, and Rainbow Falls, each unlocked at a points milestone and each with its own themed "catch the sparkles" mini-game plus a short Claude-narrated story beat.
- **Grand Beauty Bloom competition** — once every world is unlocked, enter your fairy in the pageant. Her score comes from her stats and care history, and Claude narrates the result.
- **Offline-friendly** — if no Claude API key is configured, the server automatically falls back to friendly canned replies so the game still fully works.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and add your ANTHROPIC_API_KEY (get one at https://console.anthropic.com/)
npm start
```

Then open **http://localhost:3000**.

Without an `ANTHROPIC_API_KEY`, the game still runs — the fairy will use pre-written sample replies instead of live Claude responses.

## Project structure

```
server.js              Express server + /api/chat proxy to the Claude API
public/
  index.html            All game screens (title, create, home, chat, shop, worlds, world/minigame, competition)
  css/style.css         Kid-friendly styling
  js/fairyRenderer.js   Procedural SVG fairy renderer
  js/worlds.js          World/level definitions
  js/state.js           Game state, stats decay, points, snack shop, competition scoring (persisted via localStorage)
  js/minigame.js        "Catch the sparkles" mini-game
  js/chat.js            Fairy chat UI + Claude narration helper
  js/app.js             Screen navigation and wiring
```

## Notes on safety

The server builds the Claude system prompt itself (the fairy's persona is never taken verbatim from client input) and instructs the model to: keep replies short and age-appropriate, avoid scary/adult topics, never ask for personal information, and stay in character as a fictional fairy. There's also basic per-IP rate limiting on `/api/chat`.
