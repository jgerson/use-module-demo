/* chat.js - fairy chat UI + Claude-backed narration helper. */

const fairyChatHistory = [];

async function callChatAPI(payload) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Something went wrong.' }));
    throw new Error(err.error || 'Something went wrong.');
  }
  return res.json();
}

function appendBubble(logEl, role, text) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role === 'user' ? 'kid' : 'fairy'}`;
  div.textContent = text;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function appendSystemNote(logEl, text) {
  const div = document.createElement('div');
  div.className = 'chat-msg system-note';
  div.textContent = text;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function renderChatLog(logEl) {
  logEl.innerHTML = '';
  fairyChatHistory.forEach((m) => appendBubble(logEl, m.role, m.content));
  logEl.scrollTop = logEl.scrollHeight;
}

function seedChatGreeting(logEl, fairyName) {
  if (fairyChatHistory.length === 0) {
    appendSystemNote(logEl, `${fairyName || 'Your fairy'} flutters over happily!`);
  }
}

async function sendFairyChat({ text, state, worldName, logEl, noteEl }) {
  const userText = text.trim();
  if (!userText) return { pointsEarned: false };

  fairyChatHistory.push({ role: 'user', content: userText });
  appendBubble(logEl, 'user', userText);
  noteEl.textContent = `${state.fairy.name || 'Your fairy'} is thinking...`;

  try {
    const data = await callChatAPI({
      mode: 'fairy',
      fairy: { name: state.fairy.name, personality: state.fairy.personality, stats: state.stats },
      context: { worldName: worldName || 'the Fairy Garden' },
      messages: fairyChatHistory.slice(-8),
    });

    fairyChatHistory.push({ role: 'assistant', content: data.reply });
    appendBubble(logEl, 'assistant', data.reply);
    noteEl.textContent = data.offline
      ? 'Offline mode: showing sample fairy replies (set ANTHROPIC_API_KEY on the server for real chat).'
      : '';

    let pointsEarned = false;
    if (canEarnChatPoint(state)) {
      awardChatPoint(state);
      pointsEarned = true;
    }
    return { pointsEarned };
  } catch (e) {
    appendSystemNote(logEl, 'Oops, the fairy magic fizzled for a moment. Try again!');
    noteEl.textContent = '';
    return { pointsEarned: false, error: true };
  }
}

async function fetchNarration(eventType, extraContext) {
  try {
    const data = await callChatAPI({
      mode: 'narrator',
      context: Object.assign({ eventType }, extraContext),
      messages: [{ role: 'user', content: 'Please narrate this moment for the fairy.' }],
    });
    return data.reply;
  } catch (e) {
    return null;
  }
}
