/* state.js - game state, persistence (localStorage), stats, points, shop. */

const SAVE_KEY = 'fairyFriends.save.v1';

const SHOP_ITEMS = [
  { id: 'moonberry', name: 'Moon Berry', emoji: '🫐', cost: 10, effect: { happiness: 18 }, desc: 'A juicy berry that sparkles with joy.' },
  { id: 'nectar', name: 'Sparkle Nectar', emoji: '🍯', cost: 15, effect: { energy: 18 }, desc: 'Sweet nectar that perks up tired wings.' },
  { id: 'petalcake', name: 'Rainbow Petal Cake', emoji: '🍰', cost: 25, effect: { beauty: 14 }, desc: 'A dazzling cake that makes your fairy glow.' },
  { id: 'goldendew', name: 'Golden Dew', emoji: '✨', cost: 45, effect: { happiness: 12, energy: 12, beauty: 12 }, desc: 'Rare magical dew that boosts everything!' },
  { id: 'starcookie', name: 'Star Cookie', emoji: '🍪', cost: 8, effect: { happiness: 10 }, desc: 'A crunchy cookie shaped like a little star.' },
  { id: 'crystalpop', name: 'Crystal Pop', emoji: '🍭', cost: 20, effect: { energy: 10, beauty: 6 }, desc: 'A shimmering lollipop with a magical fizz.' },
];

const CHAT_POINT_DAILY_CAP = 10;
const DECAY_PER_MINUTE = { happiness: 0.12, energy: 0.15 };
const MAX_DECAY_PER_TICK = 40;
const STAT_FLOOR_FROM_DECAY = 15;

function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function clampStat(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || !state.fairy) return null;
    return state;
  } catch (e) {
    console.warn('Could not load save', e);
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save game', e);
  }
}

function createNewState(fairyConfig) {
  const now = Date.now();
  return {
    fairy: fairyConfig,
    stats: { happiness: 75, energy: 75, beauty: 30 },
    points: 20,
    lastTick: now,
    createdAt: now,
    chatPoints: { date: todayStr(), count: 0 },
    unlockedWorldIds: ['meadow'],
    competition: { attempts: 0, bestTier: null, lastResult: null },
  };
}

function applyDecay(state) {
  const now = Date.now();
  const elapsedMs = now - (state.lastTick || now);
  const elapsedMin = Math.max(0, elapsedMs / 60000);
  const happinessLoss = Math.min(MAX_DECAY_PER_TICK, elapsedMin * DECAY_PER_MINUTE.happiness);
  const energyLoss = Math.min(MAX_DECAY_PER_TICK, elapsedMin * DECAY_PER_MINUTE.energy);

  state.stats.happiness = clampStat(Math.max(STAT_FLOOR_FROM_DECAY, state.stats.happiness - happinessLoss));
  state.stats.energy = clampStat(Math.max(STAT_FLOOR_FROM_DECAY, state.stats.energy - energyLoss));
  state.lastTick = now;
  return state;
}

function addPoints(state, amount) {
  state.points = Math.max(0, Math.round(state.points + amount));
  refreshUnlockedWorlds(state);
  return state.points;
}

function spendPoints(state, amount) {
  if (state.points < amount) return false;
  state.points -= amount;
  return true;
}

function refreshUnlockedWorlds(state) {
  const unlocked = unlockedWorlds(state.points).map((w) => w.id);
  state.unlockedWorldIds = unlocked;
  return unlocked;
}

function buySnack(state, itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { ok: false, reason: 'unknown-item' };
  if (!spendPoints(state, item.cost)) return { ok: false, reason: 'not-enough-points' };
  Object.keys(item.effect).forEach((stat) => {
    state.stats[stat] = clampStat(state.stats[stat] + item.effect[stat]);
  });
  saveState(state);
  return { ok: true, item };
}

function getMood(state) {
  if (state.stats.happiness < 30) return 'sad';
  if (state.stats.energy < 25) return 'sleepy';
  return 'happy';
}

function canEarnChatPoint(state) {
  const today = todayStr();
  if (state.chatPoints.date !== today) return true;
  return state.chatPoints.count < CHAT_POINT_DAILY_CAP;
}

function awardChatPoint(state) {
  const today = todayStr();
  if (state.chatPoints.date !== today) {
    state.chatPoints = { date: today, count: 0 };
  }
  if (state.chatPoints.count >= CHAT_POINT_DAILY_CAP) return false;
  state.chatPoints.count += 1;
  addPoints(state, 1);
  state.stats.happiness = clampStat(state.stats.happiness + 1);
  saveState(state);
  return true;
}

function playMinigameReward(state, itemsCaught) {
  const points = Math.round(itemsCaught * 1.5);
  addPoints(state, points);
  state.stats.happiness = clampStat(state.stats.happiness + Math.min(15, itemsCaught));
  state.stats.energy = clampStat(state.stats.energy - 4);
  saveState(state);
  return points;
}

function competitionScore(state) {
  const { happiness, energy, beauty } = state.stats;
  const snackBonus = Math.min(20, Math.floor(state.points / 20));
  const raw = beauty * 1.6 + happiness * 0.6 + energy * 0.3 + snackBonus;
  return Math.round(Math.min(200, raw));
}

function competitionTier(score) {
  if (score >= 170) return { tier: 'champion', label: '👑 Grand Champion!' };
  if (score >= 125) return { tier: 'runnerup', label: '🥈 Dazzling Runner-Up!' };
  if (score >= 85) return { tier: 'honorable', label: '🎀 Honorable Mention!' };
  return { tier: 'practice', label: '🌱 Keep Practicing!' };
}
