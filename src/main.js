import Phaser from 'phaser'
import { GAME_CONFIG } from './config.js'
import { BootScene }        from './scenes/BootScene.js'
import { MenuScene }        from './scenes/MenuScene.js'
import { GameScene }        from './scenes/GameScene.js'
import { ResultScene }      from './scenes/ResultScene.js'
import { LeaderboardScene } from './scenes/LeaderboardScene.js'

const params = new URLSearchParams(window.location.search)
const version = params.get('v') || 'A'

const config = {
  type: Phaser.AUTO,
  backgroundColor: GAME_CONFIG.backgroundColor,
  parent: 'game-container',
  scene: [BootScene, MenuScene, GameScene, ResultScene, LeaderboardScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: 'game-container', 
  },
   dom: { createContainer: true },
  render: {
    antialias: true,
    roundPixels: false,
  },
}

const game = new Phaser.Game(config)
game.registry.set('version', version)
game.registry.set('currentPlayer', null)