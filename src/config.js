export const GAME_CONFIG = {
  width: 480,
  height: 854,
  backgroundColor: '#1a1a2e',

  lives: 3,
  fruitSpawnInterval: 1000,  // ← เร็วขึ้นนิดนึง
  fruitSpeedMin: 950,
  fruitSpeedMax: 1250,

  pointsPerFruit: 10,
  comboMultiplier: 1.5,
  screenShakeDuration: 100,
  screenShakeIntensity: 0.01,
  hitStopDuration: 60,
  particleCount: 15,
}

export const FRUITS = [
  { name: 'watermelon', color: 0x2d8a2d, innerColor: 0xff4444, radius: 72, emoji: '🍉', points: 10 },
  { name: 'orange',     color: 0xff8800, innerColor: 0xffaa44, radius: 60, emoji: '🍊', points: 10 },
  { name: 'lemon',      color: 0xffee00, innerColor: 0xffffaa, radius: 54, emoji: '🍋', points: 10 },
  { name: 'grape',      color: 0x8844aa, innerColor: 0xcc88ff, radius: 50, emoji: '🍇', points: 10 },
  { name: 'peach',      color: 0xffaaaa, innerColor: 0xff8888, radius: 56, emoji: '🍑', points: 10 },
  { name: 'pineapple',  color: 0xffcc00, innerColor: 0xffee88, radius: 58, emoji: '🍍', points: 15 },
]

export const BOMB = {
  name: 'bomb', color: 0x222222, radius: 55, emoji: '💣'
}