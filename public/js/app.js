/* app.js - main controller: navigation, fairy creation, home hub, shop,
 * worlds, mini-game, chat, and the Grand Beauty Bloom competition.
 */

let gameState = null;
let createConfig = randomFairyConfig();
let restyling = false;
let currentWorldId = null;
let minigameController = null;

const OPTION_FIELDS = [
  { containerId: 'opts-skin', list: FAIRY_OPTIONS.skinColors, field: 'skin', type: 'swatch' },
  { containerId: 'opts-hair-color', list: FAIRY_OPTIONS.hairColors, field: 'hairColor', type: 'swatch' },
  { containerId: 'opts-hair-style', list: FAIRY_OPTIONS.hairStyles, field: 'hairStyle', type: 'choice' },
  { containerId: 'opts-wing-style', list: FAIRY_OPTIONS.wingStyles, field: 'wingStyle', type: 'choice' },
  { containerId: 'opts-wing-color', list: FAIRY_OPTIONS.wingColors, field: 'wingColor', type: 'swatch' },
  { containerId: 'opts-outfit-color', list: FAIRY_OPTIONS.outfitColors, field: 'outfitColor', type: 'swatch' },
  { containerId: 'opts-personality', list: FAIRY_OPTIONS.personalities, field: 'personality', type: 'choice' },
];

document.addEventListener('DOMContentLoaded', init);

function init() {
  const saved = loadState();
  if (saved) {
    gameState = applyDecay(saved);
    saveState(gameState);
    document.getElementById('btn-continue').classList.remove('hidden');
  }

  wireTitleScreen();
  wireCreateScreen();
  wireGenericNav();
  wireShop();
  wireWorldScreen();
  wireChat();
  wireCompetition();

  setInterval(() => {
    if (!gameState) return;
    applyDecay(gameState);
    saveState(gameState);
    if (document.getElementById('screen-home').classList.contains('active')) {
      updatePointsDisplay();
      updateStatsBars();
      updateFairyStages();
    }
  }, 60000);

  window.addEventListener('beforeunload', () => {
    if (gameState) saveState(gameState);
  });
}

/* ---------------- Navigation ---------------- */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(`screen-${id}`).classList.add('active');
}

function wireGenericNav() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      stopMinigameIfRunning();
      navigateTo(btn.dataset.nav);
    });
  });
}

function navigateTo(target) {
  if (target === 'create') {
    restyling = !!gameState;
    createConfig = gameState ? Object.assign({}, gameState.fairy) : randomFairyConfig();
    document.getElementById('input-name').value = createConfig.name || '';
    buildCreateOptions();
    showScreen('create');
    return;
  }
  if (target === 'home') {
    refreshHome();
    showScreen('home');
    return;
  }
  if (target === 'chat') {
    openChatScreen();
    return;
  }
  if (target === 'shop') {
    refreshShop();
    showScreen('shop');
    return;
  }
  if (target === 'worlds') {
    refreshWorlds();
    showScreen('worlds');
    return;
  }
}

/* ---------------- Title screen ---------------- */

function wireTitleScreen() {
  document.getElementById('btn-new-game').addEventListener('click', () => {
    restyling = false;
    createConfig = randomFairyConfig();
    document.getElementById('input-name').value = '';
    buildCreateOptions();
    showScreen('create');
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    if (!gameState) return;
    refreshHome();
    showScreen('home');
  });
}

/* ---------------- Create screen ---------------- */

function wireCreateScreen() {
  document.getElementById('input-name').addEventListener('input', (e) => {
    createConfig.name = e.target.value;
    refreshCreatePreview();
  });

  document.getElementById('btn-randomize').addEventListener('click', () => {
    const keepName = createConfig.name;
    createConfig = Object.assign(randomFairyConfig(), { name: keepName });
    buildCreateOptions();
  });

  document.getElementById('btn-confirm-fairy').addEventListener('click', () => {
    const name = (createConfig.name || '').trim().slice(0, 16) || 'Sparkle';
    const finalConfig = Object.assign({}, createConfig, { name });

    if (restyling && gameState) {
      gameState.fairy = finalConfig;
      saveState(gameState);
      refreshHome();
      showScreen('home');
    } else {
      gameState = createNewState(finalConfig);
      saveState(gameState);
      document.getElementById('btn-continue').classList.remove('hidden');
      refreshHome();
      showScreen('home');
    }
  });
}

function buildCreateOptions() {
  OPTION_FIELDS.forEach((cfg) => {
    const container = document.getElementById(cfg.containerId);
    container.innerHTML = '';
    cfg.list.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.value = opt.id;
      if (cfg.type === 'swatch') {
        btn.className = 'swatch';
        btn.style.background = opt.hex;
        btn.setAttribute('aria-label', opt.id);
      } else {
        btn.className = 'choice-chip';
        btn.textContent = opt.label;
      }
      btn.addEventListener('click', () => {
        createConfig[cfg.field] = opt.id;
        refreshCreatePreview();
      });
      container.appendChild(btn);
    });
  });
  refreshCreatePreview();
}

function refreshCreatePreview() {
  OPTION_FIELDS.forEach((cfg) => {
    const container = document.getElementById(cfg.containerId);
    Array.from(container.children).forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.value === createConfig[cfg.field]);
    });
  });
  const previewEl = document.getElementById('create-fairy-preview');
  renderFairyInto(previewEl, Object.assign({}, createConfig, { mood: 'happy', beautyLevel: 30 }));
}

/* ---------------- Home hub ---------------- */

function refreshHome() {
  if (!gameState) return;
  applyDecay(gameState);
  saveState(gameState);
  updatePointsDisplay();
  updateStatsBars();
  updateFairyStages();
}

function updatePointsDisplay() {
  const val = gameState ? gameState.points : 0;
  document.querySelectorAll('#points-display, .points-display').forEach((el) => {
    el.textContent = val;
  });
}

function updateStatsBars() {
  if (!gameState) return;
  document.getElementById('bar-happiness').style.width = `${gameState.stats.happiness}%`;
  document.getElementById('bar-energy').style.width = `${gameState.stats.energy}%`;
  document.getElementById('bar-beauty').style.width = `${gameState.stats.beauty}%`;
}

function updateFairyStages() {
  if (!gameState) return;
  const cfg = Object.assign({}, gameState.fairy, {
    mood: getMood(gameState),
    beautyLevel: gameState.stats.beauty,
  });
  ['home-fairy-stage', 'chat-fairy-stage', 'competition-fairy-stage'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) renderFairyInto(el, cfg);
  });
  document.querySelectorAll('.fairy-name-inline').forEach((el) => {
    el.textContent = gameState.fairy.name;
  });
  const homeName = document.getElementById('home-fairy-name');
  if (homeName) homeName.textContent = gameState.fairy.name;
  const chatName = document.getElementById('chat-fairy-name');
  if (chatName) chatName.textContent = gameState.fairy.name;
}

/* ---------------- Snack shop ---------------- */

function wireShop() {
  document.getElementById('shop-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-btn');
    if (!btn || !gameState) return;
    const result = buySnack(gameState, btn.dataset.item);
    if (result.ok) {
      updatePointsDisplay();
      updateStatsBars();
      updateFairyStages();
      btn.textContent = 'Yum! 💖';
      setTimeout(() => { btn.textContent = 'Give Treat'; }, 900);
    } else {
      btn.textContent = 'Need more ✨';
      setTimeout(() => { btn.textContent = 'Give Treat'; }, 900);
    }
  });
}

function refreshShop() {
  const grid = document.getElementById('shop-grid');
  grid.innerHTML = '';
  SHOP_ITEMS.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `
      <div class="emoji">${item.emoji}</div>
      <h4>${escapeHtml(item.name)}</h4>
      <div class="desc">${escapeHtml(item.desc)}</div>
      <div class="price">✨ ${item.cost}</div>
      <button type="button" class="btn btn-primary buy-btn" data-item="${item.id}">Give Treat</button>
    `;
    grid.appendChild(div);
  });
  updatePointsDisplay();
}

/* ---------------- Worlds + mini-game ---------------- */

function wireWorldScreen() {
  document.getElementById('btn-start-minigame').addEventListener('click', startCurrentMinigame);
}

function refreshWorlds() {
  const grid = document.getElementById('worlds-grid');
  grid.innerHTML = '';
  WORLDS.forEach((world) => {
    const locked = gameState.points < world.unlockAt;
    const card = document.createElement('div');
    card.className = `world-card${locked ? ' locked' : ''}`;
    card.style.background = world.gradient;
    card.innerHTML = `
      <div class="world-emoji">${world.emoji}</div>
      <h3>${escapeHtml(world.name)}</h3>
      <div class="lock-note">${locked ? `🔒 Unlocks at ${world.unlockAt} points` : 'Tap to explore!'}</div>
    `;
    if (!locked) {
      card.addEventListener('click', () => openWorld(world.id));
    }
    grid.appendChild(card);
  });
  updatePointsDisplay();
}

function openWorld(id) {
  currentWorldId = id;
  const world = getWorldById(id);
  document.getElementById('world-title').textContent = `${world.emoji} ${world.name}`;
  document.getElementById('world-story').textContent = world.intro;
  document.getElementById('mg-time').textContent = '20';
  document.getElementById('mg-score').textContent = '0';
  document.getElementById('minigame-field').innerHTML = '';
  const startBtn = document.getElementById('btn-start-minigame');
  startBtn.classList.remove('hidden');
  startBtn.disabled = false;
  startBtn.textContent = 'Start Collecting!';
  updatePointsDisplay();
  showScreen('world');
}

function startCurrentMinigame() {
  if (!currentWorldId) return;
  const world = getWorldById(currentWorldId);
  const startBtn = document.getElementById('btn-start-minigame');
  startBtn.disabled = true;
  startBtn.textContent = 'Collecting...';

  minigameController = runMinigame({
    fieldEl: document.getElementById('minigame-field'),
    timeEl: document.getElementById('mg-time'),
    scoreEl: document.getElementById('mg-score'),
    itemEmoji: world.itemEmoji,
    durationSec: 20,
    onComplete: (score) => onMinigameComplete(world, score),
  });
}

async function onMinigameComplete(world, score) {
  minigameController = null;
  const earned = playMinigameReward(gameState, score);
  updatePointsDisplay();

  const startBtn = document.getElementById('btn-start-minigame');
  startBtn.disabled = false;
  startBtn.textContent = 'Play Again';

  const storyEl = document.getElementById('world-story');
  const fallback = world.fallbackStory.replace('{name}', gameState.fairy.name || 'Your fairy');
  storyEl.textContent = `You collected ${score} treasures and earned ${earned} points! ✨`;

  const narration = await fetchNarration('world-visit', { worldName: world.name });
  storyEl.textContent = `You collected ${score} treasures and earned ${earned} points! ${narration || fallback}`;
  updateFairyStages();
  updateStatsBars();
}

function stopMinigameIfRunning() {
  if (minigameController) {
    minigameController.stop();
    minigameController = null;
  }
}

/* ---------------- Chat ---------------- */

function wireChat() {
  document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!gameState) return;
    const input = document.getElementById('chat-input');
    const text = input.value;
    if (!text.trim()) return;
    input.value = '';
    input.disabled = true;

    const logEl = document.getElementById('chat-log');
    const noteEl = document.getElementById('chat-note');
    const world = currentWorldId ? getWorldById(currentWorldId) : null;

    await sendFairyChat({
      text,
      state: gameState,
      worldName: world ? world.name : 'the Fairy Garden',
      logEl,
      noteEl,
    });

    saveState(gameState);
    updatePointsDisplay();
    updateStatsBars();
    updateFairyStages();
    input.disabled = false;
    input.focus();
  });
}

function openChatScreen() {
  if (!gameState) return;
  updateFairyStages();
  const logEl = document.getElementById('chat-log');
  renderChatLog(logEl);
  seedChatGreeting(logEl, gameState.fairy.name);
  document.getElementById('chat-note').textContent = '';
  showScreen('chat');
}

/* ---------------- Beauty competition ---------------- */

function wireCompetition() {
  document.getElementById('btn-competition').addEventListener('click', () => {
    refreshCompetitionScreen();
    showScreen('competition');
  });
  document.getElementById('btn-enter-competition').addEventListener('click', enterCompetition);
}

function refreshCompetitionScreen() {
  document.getElementById('competition-result').classList.add('hidden');
  document.getElementById('competition-intro').classList.remove('hidden');
  updateFairyStages();

  const nextLocked = WORLDS.find((w) => gameState.points < w.unlockAt);
  const enterBtn = document.getElementById('btn-enter-competition');
  const note = document.getElementById('competition-locked-note');

  if (nextLocked) {
    enterBtn.disabled = true;
    enterBtn.textContent = '🎀 Enter the Competition!';
    note.textContent = `Explore more worlds to unlock the Grand Beauty Bloom! Reach ${nextLocked.unlockAt} points to open ${nextLocked.name}.`;
  } else {
    enterBtn.disabled = false;
    note.textContent = '';
  }
  updatePointsDisplay();
}

async function enterCompetition() {
  const enterBtn = document.getElementById('btn-enter-competition');
  enterBtn.disabled = true;
  enterBtn.textContent = 'Judging...';

  const score = competitionScore(gameState);
  const { tier, label } = competitionTier(score);

  gameState.competition.attempts += 1;
  gameState.competition.lastResult = { score, tier, at: Date.now() };
  if (!gameState.competition.bestTier || tierRank(tier) > tierRank(gameState.competition.bestTier)) {
    gameState.competition.bestTier = tier;
  }
  saveState(gameState);

  const narration = await fetchNarration('beauty-competition-result', {
    worldName: 'Rainbow Falls',
    resultTier: tier,
    resultLabel: label,
  });

  document.getElementById('result-banner').textContent = label;
  document.getElementById('result-narration').textContent = narration || defaultCompetitionNarration(tier, gameState.fairy.name);
  document.getElementById('result-score').textContent = `Beauty Bloom Score: ${score} / 200`;
  document.getElementById('competition-intro').classList.add('hidden');
  document.getElementById('competition-result').classList.remove('hidden');

  enterBtn.disabled = false;
  enterBtn.textContent = '🎀 Enter the Competition!';
}

function tierRank(tier) {
  return { practice: 0, honorable: 1, runnerup: 2, champion: 3 }[tier] ?? 0;
}

function defaultCompetitionNarration(tier, name) {
  const n = name || 'Your fairy';
  const map = {
    champion: `${n} twirled across the stage in a shower of sparkles and was crowned the Grand Champion of the Beauty Bloom!`,
    runnerup: `${n} dazzled the judges with a beautiful glow and took home a shining Runner-Up ribbon!`,
    honorable: `${n} performed a lovely dance and earned a sweet Honorable Mention ribbon from the judges!`,
    practice: `${n} had a wonderful time on stage! With a bit more care and practice, next season's crown could be yours!`,
  };
  return map[tier] || map.practice;
}

/* ---------------- Utils ---------------- */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
