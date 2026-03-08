export class TutorialScene extends Phaser.Scene {
  constructor() { super({ key: 'TutorialScene' }) }

  create() {
    const { width, height } = this.scale
    const version = this.registry.get('version')

    // Background
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1)
    bg.fillRect(0, 0, width, height)

    // Title
    this.add.text(width / 2, height * 0.06, '📖 วิธีเล่น', {
      fontSize: '32px', color: '#ffdd00',
      fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5)

    // ── Rules ──────────────────────────────────
    const rules = [
      {
        icon: '✂️',
        title: 'ลากนิ้วหั่นผลไม้',
        desc: 'ลากนิ้ว (หรือเมาส์) ผ่านผลไม้เพื่อหั่น\nได้คะแนนทุกครั้งที่หั่นโดน'
      },
      {
        icon: '💣',
        title: 'หลีกเลี่ยงระเบิด!',
        desc: 'ระเบิดสีดำ outline แดง\nถ้าหั่นโดนจะเสียชีวิต 1 ครั้ง'
      },
      {
        icon: '❤️',
        title: 'มีชีวิต 3 ครั้ง',
        desc: 'ผลไม้หลุดออกนอกจอ = เสียชีวิต 1 ครั้ง\nชีวิตหมด = Game Over'
      },
      {
        icon: '🔥',
        title: 'Combo คะแนนเพิ่ม!',
        desc: 'หั่นหลายอันติดกันเร็วๆ\n3+ Combo = x2 | 5+ Combo = x3'
      },
      {
        icon: '⚡',
        title: 'เกมยากขึ้นเรื่อยๆ',
        desc: 'ทุก 10 วินาที ผลไม้จะเร็วขึ้น\nและเกิดมากขึ้นเรื่อยๆ'
      },
    ]

    rules.forEach((rule, i) => {
      const y = height * 0.17 + i * (height * 0.145)

      // card bg
      const card = this.add.graphics()
      card.fillStyle(0xffffff, 0.07)
      card.fillRoundedRect(20, y - 10, width - 40, height * 0.13, 12)

      // icon
      this.add.text(52, y + height * 0.032, rule.icon, {
        fontSize: '28px'
      }).setOrigin(0.5)

      // title
      this.add.text(78, y + 4, rule.title, {
        fontSize: '17px', color: '#ffdd00',
        fontFamily: 'Arial Black'
      }).setOrigin(0, 0.5)

      // desc
      this.add.text(78, y + height * 0.058, rule.desc, {
        fontSize: '13px', color: '#cccccc',
        fontFamily: 'Arial', lineSpacing: 4
      }).setOrigin(0, 0.5)
    })

    // ── Version badge ──────────────────────────
    const vColor = version === 'B' ? '#00ff88' : '#aaaaaa'
    const vLabel = version === 'B' ? '✨ Version B — Juicy Mode' : '⬜ Version A — Minimal Mode'
    this.add.text(width / 2, height * 0.90, vLabel, {
      fontSize: '15px', color: vColor, fontFamily: 'Arial'
    }).setOrigin(0.5)

    // ── Start button ───────────────────────────
    const startBtn = this.add.text(width / 2, height * 0.95, '▶  เริ่มเลย!', {
      fontSize: '26px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#00ff88',
      padding: { x: 44, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    startBtn.on('pointerover', () => startBtn.setStyle({ backgroundColor: '#00cc66' }))
    startBtn.on('pointerout',  () => startBtn.setStyle({ backgroundColor: '#00ff88' }))
    startBtn.on('pointerdown', () => this.scene.start('GameScene'))

    // ── Skip ───────────────────────────────────
    // ถ้าเคยเล่นแล้ว → ข้ามได้
    const hasPlayed = this.registry.get('hasPlayed')
    if (hasPlayed) {
      const skipTxt = this.add.text(width / 2, height * 0.88, 'แตะที่ไหนก็ได้เพื่อข้าม', {
        fontSize: '13px', color: '#555577', fontFamily: 'Arial'
      }).setOrigin(0.5)

      this.input.once('pointerdown', () => this.scene.start('GameScene'))
    }
  }
}