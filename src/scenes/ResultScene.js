import { getOrCreatePlayer, saveSession } from '../firebase.js'

export class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }) }

  init(data) {
    this.finalScore    = data.score         || 0
    this.sessionLength = data.sessionLength || 0
    this.version       = data.version       || 'A'
    this.poi           = data.poi           || {}
    this._saved        = data._saved        || false
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    this.W  = W
    this.H  = H

    // Background
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x0a1f3c, 0x0a1f3c, 1)
    bg.fillRect(0, 0, W, H)

    const PAD = 24
    const CW  = W - PAD * 2
    let   Y   = H * 0.06

    // ── TITLE ─────────────────────────────────────
    this.add.text(W / 2, Y, 'GAME OVER', {
      fontSize: '40px', color: '#ffffff',
      fontFamily: "'Fredoka One', 'Arial Black'",
      stroke: '#000033', strokeThickness: 5
    }).setOrigin(0.5, 0)
    Y += 58

    // ── SCORE CARD ────────────────────────────────
    const scoreCardH = 120
    this.drawCard(PAD, Y, CW, scoreCardH)

    this.add.text(W / 2, Y + 18, 'SCORE', {
      fontSize: '11px', color: '#8888bb',
      fontFamily: "'Nunito', Arial", letterSpacing: 4
    }).setOrigin(0.5, 0)

    this.add.text(W / 2, Y + 36, this.finalScore.toLocaleString(), {
      fontSize: '52px', color: '#ffe100',
      fontFamily: "'Fredoka One', 'Arial Black'",
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0)

    const vColor = this.version === 'B' ? '#00e5ff' : '#888888'
    const vLabel = this.version === 'B' ? 'Version B — Juicy' : 'Version A — Minimal'
    this.add.text(W / 2, Y + scoreCardH - 14, vLabel, {
      fontSize: '11px', color: vColor, fontFamily: "'Nunito', Arial"
    }).setOrigin(0.5, 1)
    Y += scoreCardH + 10

    // ── POI STATS ─────────────────────────────────
    const stats = [
      { icon: '🍉', label: 'ผลไม้ที่หั่น',   value: `${this.poi.fruitsSliced || 0} ผล` },
      { icon: '🔥', label: 'Combo สูงสุด',    value: `${this.poi.maxCombo || 0}×` },
      { icon: '⚡', label: 'สตรีคยาวสุด',     value: `${this.poi.bestStreak || 0} ติด` },
      { icon: '⏱', label: 'เวลาสไลซ์แรก',   value: this.poi.timeToFirstSlice
                                               ? `${(this.poi.timeToFirstSlice/1000).toFixed(1)}s`
                                               : '—' },
    ]
    const ROW_H = 44
    const ROW_G = 6
    stats.forEach((s) => {
      this.drawCard(PAD, Y, CW, ROW_H, 0xffffff, 0.05)
      this.add.text(PAD + 14, Y + ROW_H / 2, `${s.icon}  ${s.label}`, {
        fontSize: '14px', color: '#aaaacc', fontFamily: "'Nunito', Arial"
      }).setOrigin(0, 0.5)
      this.add.text(W - PAD - 14, Y + ROW_H / 2, s.value, {
        fontSize: '15px', color: '#ffffff',
        fontFamily: "'Fredoka One', 'Arial Black'"
      }).setOrigin(1, 0.5)
      Y += ROW_H + ROW_G
    })
    Y += 10

    // ── FLOW ──────────────────────────────────────
    if (this._saved) {
      this.showPostSave(PAD, CW, W, Y)
    } else {
      const cachedPlayer = this.registry.get('currentPlayer')
      const hasRated     = this.registry.get(`hasRated${this.version}`)
      if (!cachedPlayer)  this.showNameInput(PAD, CW, W, Y)
      else if (!hasRated) this.showEnjoymentRating(cachedPlayer, PAD, CW, W, Y)
      else {
        this.autoSave(cachedPlayer)
        this.showPostSave(PAD, CW, W, Y)
      }
    }
  }

  // ─── NAME INPUT ────────────────────────────────
  showNameInput(PAD, CW, W, Y) {
    this.add.text(W / 2, Y, 'ใส่ชื่อของคุณ', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: "'Nunito', Arial", fontStyle: 'bold'
    }).setOrigin(0.5, 0)
    Y += 34

    const inputEl = this.add.dom(W / 2, Y + 22).createFromHTML(`
      <input id="nameInput" type="text"
        placeholder="ชื่อผู้เล่น..."
        maxlength="20"
        style="
          width:${CW}px; padding:11px 0;
          border-radius:10px; border:2px solid #00e5ff;
          background:#0a1f3c; color:#fff;
          font-size:16px; font-family:'Nunito',Arial;
          outline:none; text-align:center; display:block;
        "
      />
    `)
    Y += 52

    this.add.text(W / 2, Y, 'ความสนุก', {
      fontSize: '12px', color: '#8888bb', fontFamily: "'Nunito', Arial"
    }).setOrigin(0.5, 0)
    Y += 26

    this.starRating  = 0
    this.starObjects = []
    this.buildStars(W, Y)
    Y += 46

    this.buildBtn(W, PAD, CW, Y, 'บันทึกคะแนน', '#00e5ff', '#0a1f3c', async () => {
      const el       = document.getElementById('nameInput')
      const username = el?.value?.trim()
      if (!username) { el.style.borderColor = '#ff4466'; return }
      el.disabled = true
      await getOrCreatePlayer(username)
      await saveSession(username, {
        score: this.finalScore, sessionLength: this.sessionLength,
        enjoyment: this.starRating || null,
        version: this.version, poi: this.poi,
      })
      this.registry.set('currentPlayer', username)
      this.registry.set(`hasRated${this.version}`, true)
      this.scene.start('ResultScene', {
        score: this.finalScore, sessionLength: this.sessionLength,
        version: this.version, poi: this.poi, _saved: true,
      })
    })
  }

  // ─── ENJOYMENT RATING ──────────────────────────
  showEnjoymentRating(username, PAD, CW, W, Y) {
    this.add.text(W / 2, Y, 'รอบนี้สนุกแค่ไหน?', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: "'Nunito', Arial", fontStyle: 'bold'
    }).setOrigin(0.5, 0)
    Y += 34

    this.starRating  = 0
    this.starObjects = []
    this.buildStars(W, Y)
    Y += 50

    this.buildBtn(W, PAD, CW, Y, 'บันทึกคะแนน', '#00e5ff', '#0a1f3c', async () => {
      await saveSession(username, {
        score: this.finalScore, sessionLength: this.sessionLength,
        enjoyment: this.starRating || null,
        version: this.version, poi: this.poi,
      })
      this.registry.set(`hasRated${this.version}`, true)
      this.scene.start('ResultScene', {
        score: this.finalScore, sessionLength: this.sessionLength,
        version: this.version, poi: this.poi, _saved: true,
      })
    })
  }

  // ─── AUTO SAVE ─────────────────────────────────
  async autoSave(username) {
    try {
      await saveSession(username, {
        score: this.finalScore, sessionLength: this.sessionLength,
        enjoyment: null, version: this.version, poi: this.poi,
      })
    } catch(e) { console.warn('autoSave failed', e) }
  }

  // ─── POST SAVE ─────────────────────────────────
  showPostSave(PAD, CW, W, Y) {
    this.add.text(W / 2, Y, '✅ บันทึกแล้ว!', {
      fontSize: '16px', color: '#00e5ff',
      fontFamily: "'Nunito', Arial", fontStyle: 'bold'
    }).setOrigin(0.5, 0)
    Y += 42

    this.buildBtn(W, PAD, CW, Y, '▶  เล่นอีกครั้ง', '#00e5ff', '#0a1f3c', () => {
      this.scene.start('TutorialScene')
    })
    Y += 75

    this.buildBtn(W, PAD, CW, Y, '🏆  Leaderboard', '#1a1a3a', '#ffe100', () => {
      this.scene.start('LeaderboardScene', { version: this.version })
    }, '#ffe100')
    Y += 70

    this.add.text(W / 2, Y, 'หน้าหลัก', {
      fontSize: '14px', color: '#555577', fontFamily: "'Nunito', Arial"
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.scene.start('MenuScene'))
  }

  // ─── HELPERS ───────────────────────────────────
  buildBtn(W, PAD, CW, Y, label, bgColor, textColor, onClick, borderColor = null) {
    const btn = this.add.text(W / 2, Y, label, {
      fontSize: '19px',
      color: textColor,
      fontFamily: "'Nunito', Arial",
      fontStyle: 'bold',
      backgroundColor: bgColor,
      fixedWidth: CW,
      align: 'center',
      padding: { top: 14, bottom: 14, left: 0, right: 0 },
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true })

    btn.on('pointerover', () => btn.setAlpha(0.85))
    btn.on('pointerout',  () => btn.setAlpha(1))
    btn.on('pointerdown', onClick)
    return btn
  }

  buildStars(W, Y) {
    const gap = 44
    for (let i = 1; i <= 5; i++) {
      const sx   = W / 2 - gap * 2 + gap * (i - 1)
      const star = this.add.text(sx, Y, '★', {
        fontSize: '34px', color: '#333366', fontFamily: 'Arial'
      }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true })
      star.on('pointerdown', () => { this.starRating = i; this.updateStars() })
      star.on('pointerover', () => this.previewStars(i))
      star.on('pointerout',  () => this.updateStars())
      this.starObjects.push(star)
    }
  }

  updateStars() {
    this.starObjects?.forEach((s, i) => {
      s.setStyle({ color: i < this.starRating ? '#ffe100' : '#333366' })
    })
  }

  previewStars(n) {
    this.starObjects?.forEach((s, i) => {
      s.setStyle({ color: i < n ? '#ffee88' : '#333366' })
    })
  }

  drawCard(x, y, w, h, color = 0xffffff, alpha = 0.07, radius = 12) {
    const g = this.add.graphics()
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, radius)
  }
}