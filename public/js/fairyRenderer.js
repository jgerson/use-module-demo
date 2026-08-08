/* fairyRenderer.js
 * Procedurally draws a small magical fairy as an inline SVG based on a
 * customization config, so the game needs no external image assets.
 */

const FAIRY_OPTIONS = {
  skinColors: [
    { id: 'lavender', hex: '#d9c2f0' },
    { id: 'peach', hex: '#ffd9b8' },
    { id: 'mint', hex: '#c6f0d8' },
    { id: 'sky', hex: '#c7e6ff' },
    { id: 'golden', hex: '#ffe6a3' },
    { id: 'rose', hex: '#ffc9d6' },
  ],
  hairColors: [
    { id: 'pink', hex: '#ff6fb0' },
    { id: 'purple', hex: '#8a5cf6' },
    { id: 'gold', hex: '#ffcf4d' },
    { id: 'teal', hex: '#3fd6c6' },
    { id: 'red', hex: '#ff7a59' },
    { id: 'silver', hex: '#cbd3e6' },
  ],
  wingColors: [
    { id: 'blue', hex: '#8fd8ff' },
    { id: 'pink', hex: '#ffa3d2' },
    { id: 'purple', hex: '#c6a3ff' },
    { id: 'green', hex: '#a3f0c2' },
    { id: 'gold', hex: '#ffe08a' },
  ],
  outfitColors: [
    { id: 'pink', hex: '#ff5fa2' },
    { id: 'purple', hex: '#8a5cf6' },
    { id: 'teal', hex: '#2fc4b0' },
    { id: 'sunny', hex: '#ffb02e' },
    { id: 'sky', hex: '#3fa9f5' },
  ],
  hairStyles: [
    { id: 'bun', label: 'Bun' },
    { id: 'pigtails', label: 'Pigtails' },
    { id: 'flowy', label: 'Flowy' },
  ],
  wingStyles: [
    { id: 'round', label: 'Round' },
    { id: 'pointed', label: 'Pointed' },
    { id: 'butterfly', label: 'Butterfly' },
  ],
  personalities: [
    { id: 'kind', label: 'Kind 💗' },
    { id: 'silly', label: 'Silly 😄' },
    { id: 'brave', label: 'Brave 🦁' },
    { id: 'curious', label: 'Curious 🔍' },
    { id: 'dreamy', label: 'Dreamy 🌙' },
  ],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomFairyConfig() {
  return {
    name: '',
    skin: pick(FAIRY_OPTIONS.skinColors).id,
    hairColor: pick(FAIRY_OPTIONS.hairColors).id,
    hairStyle: pick(FAIRY_OPTIONS.hairStyles).id,
    wingColor: pick(FAIRY_OPTIONS.wingColors).id,
    wingStyle: pick(FAIRY_OPTIONS.wingStyles).id,
    outfitColor: pick(FAIRY_OPTIONS.outfitColors).id,
    personality: pick(FAIRY_OPTIONS.personalities).id,
  };
}

function hexFor(list, id) {
  const found = list.find((o) => o.id === id);
  return found ? found.hex : list[0].hex;
}

function wingsSVG(style, color) {
  const shared = `fill="${color}" opacity="0.92" stroke="rgba(0,0,0,0.08)" stroke-width="1"`;
  if (style === 'pointed') {
    return `
      <path d="M75 95 C 30 70, 10 40, 30 15 C 55 30, 68 60, 75 95 Z" ${shared}/>
      <path d="M125 95 C 170 70, 190 40, 170 15 C 145 30, 132 60, 125 95 Z" ${shared}/>
      <path d="M78 105 C 40 110, 15 130, 25 155 C 50 150, 68 130, 78 105 Z" ${shared}/>
      <path d="M122 105 C 160 110, 185 130, 175 155 C 150 150, 132 130, 122 105 Z" ${shared}/>
    `;
  }
  if (style === 'butterfly') {
    return `
      <ellipse cx="55" cy="55" rx="30" ry="22" ${shared} transform="rotate(-18 55 55)"/>
      <ellipse cx="145" cy="55" rx="30" ry="22" ${shared} transform="rotate(18 145 55)"/>
      <ellipse cx="62" cy="100" rx="22" ry="16" ${shared} transform="rotate(-8 62 100)"/>
      <ellipse cx="138" cy="100" rx="22" ry="16" ${shared} transform="rotate(8 138 100)"/>
    `;
  }
  // round (default)
  return `
    <ellipse cx="58" cy="70" rx="28" ry="38" ${shared} transform="rotate(-14 58 70)"/>
    <ellipse cx="142" cy="70" rx="28" ry="38" ${shared} transform="rotate(14 142 70)"/>
  `;
}

function hairSVG(style, color, skin) {
  if (style === 'pigtails') {
    return `
      <circle cx="100" cy="66" r="30" fill="${color}"/>
      <ellipse cx="62" cy="88" rx="12" ry="20" fill="${color}"/>
      <ellipse cx="138" cy="88" rx="12" ry="20" fill="${color}"/>
      <circle cx="62" cy="70" r="8" fill="${color}"/>
      <circle cx="138" cy="70" r="8" fill="${color}"/>
    `;
  }
  if (style === 'flowy') {
    return `
      <path d="M62 60 C 40 90, 45 140, 60 165 C 68 130, 66 90, 78 62 Z" fill="${color}"/>
      <path d="M138 60 C 160 90, 155 140, 140 165 C 132 130, 134 90, 122 62 Z" fill="${color}"/>
      <circle cx="100" cy="64" r="31" fill="${color}"/>
    `;
  }
  // bun (default)
  return `
    <circle cx="100" cy="66" r="30" fill="${color}"/>
    <circle cx="100" cy="30" r="13" fill="${color}"/>
  `;
}

function faceSVG(mood) {
  if (mood === 'sad') {
    return `
      <circle cx="88" cy="72" r="4" fill="#4a3466"/>
      <circle cx="112" cy="72" r="4" fill="#4a3466"/>
      <path d="M90 92 Q100 84 110 92" stroke="#4a3466" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
  }
  if (mood === 'sleepy') {
    return `
      <path d="M83 72 Q88 76 93 72" stroke="#4a3466" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M107 72 Q112 76 117 72" stroke="#4a3466" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M92 88 Q100 92 108 88" stroke="#4a3466" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
  }
  // happy (default)
  return `
    <circle cx="88" cy="72" r="4.5" fill="#4a3466"/>
    <circle cx="112" cy="72" r="4.5" fill="#4a3466"/>
    <circle cx="76" cy="80" r="6" fill="#ff9ec9" opacity="0.6"/>
    <circle cx="124" cy="80" r="6" fill="#ff9ec9" opacity="0.6"/>
    <path d="M86 90 Q100 102 114 90" stroke="#4a3466" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  `;
}

function accessorySVG(beautyLevel) {
  if (beautyLevel >= 70) {
    return `
      <path d="M80 34 L86 44 L94 30 L100 44 L106 30 L114 44 L120 34 L118 50 L82 50 Z" fill="#ffd85e" stroke="#f5b400" stroke-width="1.5"/>
      <circle cx="70" cy="46" r="4" fill="#fff6c9"/>
      <circle cx="130" cy="46" r="4" fill="#fff6c9"/>
    `;
  }
  if (beautyLevel >= 40) {
    return `<circle cx="128" cy="52" r="7" fill="#ff9ec9"/><circle cx="128" cy="52" r="3" fill="#ffe08a"/>`;
  }
  return '';
}

function sparkleDecor(beautyLevel) {
  if (beautyLevel < 55) return '';
  const twinkles = beautyLevel >= 80 ? 5 : 3;
  let out = '';
  const positions = [[20, 30], [180, 40], [24, 150], [176, 140], [100, 10]];
  for (let i = 0; i < twinkles; i++) {
    const [x, y] = positions[i];
    out += `<text x="${x}" y="${y}" font-size="14">✨</text>`;
  }
  return out;
}

function renderFairySVG(config) {
  const skinHex = hexFor(FAIRY_OPTIONS.skinColors, config.skin);
  const hairHex = hexFor(FAIRY_OPTIONS.hairColors, config.hairColor);
  const wingHex = hexFor(FAIRY_OPTIONS.wingColors, config.wingColor);
  const outfitHex = hexFor(FAIRY_OPTIONS.outfitColors, config.outfitColor);
  const mood = config.mood || 'happy';
  const beauty = typeof config.beautyLevel === 'number' ? config.beautyLevel : 50;

  return `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${config.name || 'A magical fairy'}">
    <g>${wingsSVG(config.wingStyle, wingHex)}</g>
    ${sparkleDecor(beauty)}
    <ellipse cx="100" cy="150" rx="34" ry="26" fill="${outfitHex}"/>
    <path d="M78 122 L122 122 L132 165 Q100 178 68 165 Z" fill="${outfitHex}"/>
    <circle cx="100" cy="90" r="40" fill="${skinHex}"/>
    <g>${hairSVG(config.hairStyle, hairHex, skinHex)}</g>
    <g>${faceSVG(mood)}</g>
    <g>${accessorySVG(beauty)}</g>
  </svg>`;
}

function renderFairyInto(el, config) {
  if (!el) return;
  el.innerHTML = renderFairySVG(config);
}
