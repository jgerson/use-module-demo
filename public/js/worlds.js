/* worlds.js - the game's levels. Each world unlocks at a points threshold
 * and hosts a themed sparkle-collecting mini-game plus a short Claude-narrated
 * story beat.
 */

const WORLDS = [
  {
    id: 'meadow',
    name: 'Sparkle Meadow',
    emoji: '🌼',
    unlockAt: 0,
    gradient: 'linear-gradient(160deg, #ffd9ec, #ffe9a3)',
    itemEmoji: '🌸',
    intro: "Welcome to Sparkle Meadow! Fluffy clouds drift by as flower petals swirl in the warm breeze.",
    fallbackStory: "The meadow flowers open their petals and shower {name} with glittering pollen dust!",
  },
  {
    id: 'caves',
    name: 'Crystal Caves',
    emoji: '💎',
    unlockAt: 100,
    gradient: 'linear-gradient(160deg, #b8a3ff, #8fd8ff)',
    itemEmoji: '💠',
    intro: "Deep inside the Crystal Caves, gemstones glow every color of the rainbow.",
    fallbackStory: "{name} taps a giant crystal and it chimes like a magical bell, filling the cave with light!",
  },
  {
    id: 'cloud-kingdom',
    name: 'Cloud Kingdom',
    emoji: '☁️',
    unlockAt: 250,
    gradient: 'linear-gradient(160deg, #8fd8ff, #ffffff)',
    itemEmoji: '⭐',
    intro: "High above the world, the Cloud Kingdom floats among fluffy castles made of clouds.",
    fallbackStory: "{name} bounces from cloud to cloud, catching falling stardust with a happy giggle!",
  },
  {
    id: 'moonlit-forest',
    name: 'Moonlit Forest',
    emoji: '🌙',
    unlockAt: 450,
    gradient: 'linear-gradient(160deg, #6a5cad, #b28dff)',
    itemEmoji: '🍄',
    intro: "Under a silver moon, the Moonlit Forest glows with friendly fireflies and singing mushrooms.",
    fallbackStory: "Fireflies swirl around {name}, lighting a magical path deeper into the glowing forest!",
  },
  {
    id: 'rainbow-falls',
    name: 'Rainbow Falls',
    emoji: '🌈',
    unlockAt: 700,
    gradient: 'linear-gradient(160deg, #ff8fc7, #ffd85e, #8fd8ff)',
    itemEmoji: '🦋',
    intro: "Rainbow Falls sparkles with waterfalls of every color - home of the Grand Beauty Bloom!",
    fallbackStory: "{name} dances through the rainbow mist, wings shimmering brighter than ever!",
  },
];

function getWorldById(id) {
  return WORLDS.find((w) => w.id === id);
}

function unlockedWorlds(points) {
  return WORLDS.filter((w) => points >= w.unlockAt);
}
