import { getOrCreatePlayer, saveSession } from '../firebase.js'

export class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }) }

  init(data) {
    this.finalScore    = data.score || 0
    this.sessionLength = data.sessionLength || 0
    this.version       = data.version || 'A'
  }

  create() {
    const { width, height } = this.scale

    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1)
    bg.fillRect(0, 0, width, height)

    this.add.text(width / 2, height * 0.10, 'GAME OVER', {
      fontSize: '42px', color: '#ff4444',
      fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.20, `Score: ${this.finalScore}`, {
      fontSize: '32px', color: '#ffdd00', fontFamily: 'Arial Black'
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.27,
      `เวลา: ${this.sessionLength} วินาที  |  Ver ${this.version}`, {
      fontSize: '16px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5)

    const cachedPlayer = this.registry.get('currentPlayer')
    const hasRated     = this.registry.get(`hasRated${this.version}`)

    if (cachedPlayer) {
      this.add.text(width / 2, height * 0.35, `👤 ${cachedPlayer}`, {
        fontSize: '20px', color: '#00ff88', fontFamily: 'Arial Black'
      }).setOrigin(0.5)

      if (!hasRated) {
        this.showEnjoymentRating(width, height, cachedPlayer)
      } else {
        this.autoSave(cachedPlayer)
        this.showButtons(width, height)
      }
    } else {
      this.showNameInput(width, height)
    }
  }

  // ── กรอกชื่อครั้งแรก ────────────────────────────
  showNameInput(width, height) {
    this.enjoyment = 0

    this.add.text(width / 2, height * 0.38, 'ใส่ชื่อของมึง:', {
      fontSize: '20px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.nameInput = this.add.dom(width / 2, height * 0.46).createFromHTML(`
      <input type="text" id="nameInput"
        placeholder="ชื่อผู้เล่น" maxlength="20"
        style="
          width: 220px; padding: 10px 14px;
          font-size: 17px; border-radius: 10px;
          border: 2px solid #00ff88; outline: none;
          background: #1a1a2e; color: white;
          text-align: center; font-family: Arial;
        "
      />
    `)

    this.showStars(width, height * 0.57)

    this.statusTxt = this.add.text(width / 2, height * 0.72, '', {
      fontSize: '15px', color: '#00ff88', fontFamily: 'Arial'
    }).setOrigin(0.5)

    const submitBtn = this.add.text(width / 2, height * 0.79, '✅  บันทึก', {
      fontSize: '24px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#00ff88',
      padding: { x: 32, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    submitBtn.on('pointerdown', () => this.submitNewPlayer())

    this.showRetryBtn(width, height * 0.89)
  }

  // ── มีชื่อแล้ว แต่ยังไม่ได้ให้คะแนน version นี้ ──
  showEnjoymentRating(width, height, username) {
    this.enjoyment = 0

    this.add.text(width / 2, height * 0.44, 'สนุกแค่ไหน? 😄', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.49,
      `(ให้คะแนน Ver ${this.version} ครั้งเดียวพอ)`, {
      fontSize: '14px', color: '#666688', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.showStars(width, height * 0.57)

    this.statusTxt = this.add.text(width / 2, height * 0.70, '', {
      fontSize: '15px', color: '#00ff88', fontFamily: 'Arial'
    }).setOrigin(0.5)

    const submitBtn = this.add.text(width / 2, height * 0.77, '✅  บันทึก', {
      fontSize: '24px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#00ff88',
      padding: { x: 32, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    submitBtn.on('pointerdown', () => this.submitWithRating(username))

    this.showRetryBtn(width, height * 0.87)
  }

  // ── วาดดาว 1-5 ──────────────────────────────────
  showStars(width, y) {
    this.add.text(width / 2, y - 30, 'คะแนนความสนุก:', {
      fontSize: '17px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.stars = []
    for (let i = 1; i <= 5; i++) {
      const star = this.add.text(
        width / 2 + (i - 3) * 52, y + 10,
        '⭐', { fontSize: '38px' }
      ).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0.3)

      star.on('pointerdown', () => {
        this.enjoyment = i
        this.stars.forEach((s, idx) => s.setAlpha(idx < i ? 1 : 0.3))
      })
      this.stars.push(star)
    }
  }

  // ── ปุ่มหลัง auto save ──────────────────────────
  showButtons(width, height) {
    this.showRetryBtn(width, height * 0.50)

    const lbBtn = this.add.text(width / 2, height * 0.60, '🏆 LEADERBOARD', {
      fontSize: '20px', color: '#ffffff',
      fontFamily: 'Arial', backgroundColor: '#333355',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    lbBtn.on('pointerdown', () => this.scene.start('LeaderboardScene'))

    const menuBtn = this.add.text(width / 2, height * 0.70, '🏠 หน้าหลัก', {
      fontSize: '20px', color: '#ffffff',
      fontFamily: 'Arial', backgroundColor: '#333355',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'))
  }

  showRetryBtn(width, y) {
    const btn = this.add.text(width / 2, y, '🔄  เล่นใหม่', {
      fontSize: '20px', color: '#ffffff',
      fontFamily: 'Arial', backgroundColor: '#444466',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btn.on('pointerdown', () => this.scene.start('GameScene'))
  }

  // ── submit ครั้งแรก (กรอกชื่อ + ให้คะแนน) ──────
  async submitNewPlayer() {
    const input    = document.getElementById('nameInput')
    const username = input?.value?.trim()

    if (!username) {
      this.statusTxt?.setText('⚠️ ใส่ชื่อก่อนนะ!').setColor('#ff4444')
      return
    }
    if (this.enjoyment === 0) {
      this.statusTxt?.setText('⚠️ ให้คะแนนความสนุกด้วยนะ!').setColor('#ff4444')
      return
    }

    this.statusTxt?.setText('กำลังบันทึก...').setColor('#aaaaaa')

    try {
      await getOrCreatePlayer(username)
      await saveSession(username, {
        score:         this.finalScore,
        sessionLength: this.sessionLength,
        enjoyment:     this.enjoyment,
        version:       this.version
      })

      this.registry.set('currentPlayer', username)
      this.registry.set(`hasRated${this.version}`, true)

      this.statusTxt?.setText('✅ บันทึกแล้ว!').setColor('#00ff88')
      this.time.delayedCall(1200, () => this.scene.start('LeaderboardScene'))
    } catch(e) {
      console.error(e)
      this.statusTxt?.setText('❌ เกิด error ลองใหม่').setColor('#ff4444')
    }
  }

  // ── submit พร้อม rating (มีชื่อแล้วแต่ยังไม่ได้ให้คะแนน version นี้) ──
  async submitWithRating(username) {
    if (this.enjoyment === 0) {
      this.statusTxt?.setText('⚠️ ให้คะแนนความสนุกด้วยนะ!').setColor('#ff4444')
      return
    }

    this.statusTxt?.setText('กำลังบันทึก...').setColor('#aaaaaa')

    try {
      await saveSession(username, {
        score:         this.finalScore,
        sessionLength: this.sessionLength,
        enjoyment:     this.enjoyment,
        version:       this.version
      })

      this.registry.set(`hasRated${this.version}`, true)

      this.statusTxt?.setText('✅ บันทึกแล้ว!').setColor('#00ff88')
      this.time.delayedCall(1200, () => this.scene.start('LeaderboardScene'))
    } catch(e) {
      console.error(e)
      this.statusTxt?.setText('❌ เกิด error ลองใหม่').setColor('#ff4444')
    }
  }

  // ── auto save ไม่ถามอะไร ────────────────────────
  async autoSave(username) {
    try {
      await saveSession(username, {
        score:         this.finalScore,
        sessionLength: this.sessionLength,
        enjoyment:     null,
        version:       this.version
      })
    } catch(e) {
      console.error(e)
    }
  }
}