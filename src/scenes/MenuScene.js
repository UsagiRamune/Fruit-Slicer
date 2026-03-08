export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }) }

  create() {
    const { width, height } = this.scale

    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1)
    bg.fillRect(0, 0, width, height)

    this.add.text(width / 2, height * 0.18, '🍉', {
      fontSize: '80px'
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.30, 'FRUIT SLICER', {
      fontSize: '36px', color: '#ffffff',
      fontFamily: 'Arial Black', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5)

    // ── เลือก Version ──
    this.add.text(width / 2, height * 0.42, 'เลือก Version:', {
      fontSize: '20px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5)

    // Version A button
    const btnA = this.add.text(width / 2 - 70, height * 0.50, '  A  ', {
      fontSize: '26px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#aaaaaa',
      padding: { x: 24, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    // Version B button
    const btnB = this.add.text(width / 2 + 70, height * 0.50, '  B  ', {
      fontSize: '26px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#aaaaaa',
      padding: { x: 24, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    // highlight version ที่เลือกอยู่
    let selectedVersion = this.registry.get('version') || 'A'
    const highlight = (v) => {
      btnA.setStyle({ backgroundColor: v === 'A' ? '#00ff88' : '#aaaaaa' })
      btnB.setStyle({ backgroundColor: v === 'B' ? '#00ff88' : '#aaaaaa' })
      selectedVersion = v
      this.registry.set('version', v)
      versionLabel.setText(`Version ${v} ${v === 'B' ? '✨ Juicy' : '⬜ Minimal'}`)
    }

    btnA.on('pointerdown', () => highlight('A'))
    btnB.on('pointerdown', () => highlight('B'))

    // label บอก version ที่เลือก
    const versionLabel = this.add.text(width / 2, height * 0.59, '', {
      fontSize: '16px', color: '#00ff88', fontFamily: 'Arial'
    }).setOrigin(0.5)

    highlight(selectedVersion)  // set initial highlight

    // Play button
    const playBtn = this.add.text(width / 2, height * 0.69, '▶  PLAY', {
      fontSize: '28px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#00ff88',
      padding: { x: 40, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    playBtn.on('pointerover', () => playBtn.setStyle({ backgroundColor: '#00cc66' }))
    playBtn.on('pointerout',  () => playBtn.setStyle({ backgroundColor: '#00ff88' }))
    playBtn.on('pointerdown', () => {
      this.scene.start('TutorialScene')
    })

    // Leaderboard button
    const lbBtn = this.add.text(width / 2, height * 0.79, '🏆  LEADERBOARD', {
      fontSize: '20px', color: '#ffffff',
      fontFamily: 'Arial', backgroundColor: '#333355',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    lbBtn.on('pointerdown', () => this.scene.start('LeaderboardScene'))
  }
}