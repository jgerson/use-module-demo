/* minigame.js - a simple "catch the sparkles" mini-game reused (with
 * different theming) across every world to earn points.
 */

function runMinigame({ fieldEl, timeEl, scoreEl, itemEmoji, durationSec = 20, onComplete }) {
  let score = 0;
  let timeLeft = durationSec;
  let stopped = false;
  fieldEl.innerHTML = '';
  timeEl.textContent = timeLeft;
  scoreEl.textContent = score;

  function spawnItem() {
    if (stopped) return;
    const rect = fieldEl.getBoundingClientRect();
    const maxX = Math.max(20, rect.width - 44);
    const maxY = Math.max(20, rect.height - 44);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sparkle-item';
    btn.textContent = itemEmoji;
    btn.style.left = `${Math.random() * maxX}px`;
    btn.style.top = `${Math.random() * maxY}px`;
    btn.setAttribute('aria-label', 'Catch it!');

    const removeSelf = () => { if (btn.isConnected) btn.remove(); };
    btn.addEventListener('click', () => {
      score += 1;
      scoreEl.textContent = score;
      removeSelf();
    });
    fieldEl.appendChild(btn);
    setTimeout(removeSelf, 1400);
  }

  const spawnTimer = setInterval(spawnItem, 600);
  spawnItem();

  const countdownTimer = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = Math.max(0, timeLeft);
    if (timeLeft <= 0) {
      finish();
    }
  }, 1000);

  function finish() {
    if (stopped) return;
    stopped = true;
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);
    fieldEl.innerHTML = '';
    onComplete(score);
  }

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      clearInterval(spawnTimer);
      clearInterval(countdownTimer);
      fieldEl.innerHTML = '';
    },
  };
}
