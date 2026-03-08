export const GAME_CONFIG = {
  width: 480,
  height: 854,
  backgroundColor: '#1a1a2e',
  lives: 3,
  fruitSpawnInterval: 1000,
  fruitSpeedMin: 950,
  fruitSpeedMax: 1250,
  pointsPerFruit: 10,
  comboMultiplier: 1.5,
  screenShakeDuration: 100,
  screenShakeIntensity: 0.01,
  particleCount: 15,
}

export const FRUITS = [
  { name: 'watermelon', drawFn: 'watermelon', radius: 72, points: 10, innerColor: 0xff3333 },
  { name: 'orange',     drawFn: 'orange',     radius: 60, points: 10, innerColor: 0xffaa33 },
  { name: 'lemon',      drawFn: 'lemon',      radius: 54, points: 10, innerColor: 0xffff88 },
  { name: 'peach',      drawFn: 'peach',      radius: 58, points: 10, innerColor: 0xffbb77 },
  { name: 'blueberry',  drawFn: 'default',    radius: 48, points: 15, innerColor: 0x4477ff },
  { name: 'pineapple',  drawFn: 'pineapple',  radius: 60, points: 15, innerColor: 0xffee88 },
]

export const BOMB = {
  name: 'bomb', drawFn: 'bomb', radius: 52, innerColor: 0xff2200
}