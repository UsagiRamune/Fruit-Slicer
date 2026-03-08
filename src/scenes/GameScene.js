import { GAME_CONFIG, FRUITS, BOMB } from '../config.js'
import { drawFruitShape, drawHeart } from '../fruitRenderer.js'

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }) }

  create() {
    const { width, height } = this.scale
    this.version    = this.registry.get('version')
    this.score      = 0
    this.lives      = GAME_CONFIG.lives
    this.startTime  = Date.now()
    this.pausedTime = 0
    this.pauseStart = null
    this.slicing    = false
    this.fruits     = []
    this.halves     = []
    this.combo      = 0
    this.comboTimer = null
    this.isPaused   = false
    this.difficulty = 1
    this.isGameOver = false

    this.drawBackground()
    this.createHUD()
    this.createTrail()
    this.startSpawning()
    this.setupInput()
    this.createPauseButton()
  }

  // ─── BACKGROUND ───────────────────────────────
  drawBackground() {
    const { width, height } = this.scale
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1)
    bg.fillRect(0, 0, width, height)
  }

  // ─── HUD ──────────────────────────────────────
  createHUD() {
    const { width } = this.scale

    this.scoreTxt = this.add.text(width / 2, 44, '0', {
      fontSize: '44px', color: '#ffffff',
      fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(10)

    // Hearts วาดด้วย Graphics
    this.heartsGfx = []
    for (let i = 0; i < GAME_CONFIG.lives; i++) {
      const hgfx = this.add.graphics().setDepth(10)
      drawHeart(hgfx, 28 + i * 38, 32, 13, 0xff2244)
      this.heartsGfx.push(hgfx)
    }

    this.diffTxt = this.add.text(width - 20, 60, 'Lv.1', {
      fontSize: '14px', color: '#666688', fontFamily: 'Arial'
    }).setOrigin(1, 0).setDepth(10)
  }

  updateHearts() {
    this.heartsGfx.forEach((hgfx, i) => {
      drawHeart(hgfx, 28 + i * 38, 32, 13, i < this.lives ? 0xff2244 : 0x444444)
    })
  }

  // ─── PAUSE ────────────────────────────────────
  createPauseButton() {
    const { width, height } = this.scale

    this.pauseBtn = this.add.text(width - 20, 20, '⏸', {
      fontSize: '30px'
    }).setOrigin(1, 0).setDepth(30).setInteractive({ useHandCursor: true })
    this.pauseBtn.on('pointerdown', () => this.togglePause())

    this.pauseOverlay = this.add.graphics().setDepth(40).setVisible(false)
    this.pauseOverlay.fillStyle(0x000000, 0.7)
    this.pauseOverlay.fillRect(0, 0, width, height)

    this.pauseLabel = this.add.text(width / 2, height / 2 - 80, '⏸ PAUSED', {
      fontSize: '42px', color: '#ffffff',
      fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(41).setVisible(false)

    this.resumeBtn = this.add.text(width / 2, height / 2, '▶  RESUME', {
      fontSize: '28px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#00ff88',
      padding: { x: 36, y: 12 }
    }).setOrigin(0.5).setDepth(41).setVisible(false)
      .setInteractive({ useHandCursor: true })
    this.resumeBtn.on('pointerdown', () => this.togglePause())

    this.quitBtn = this.add.text(width / 2, height / 2 + 80, '🚪  QUIT', {
      fontSize: '22px', color: '#ffffff',
      fontFamily: 'Arial', backgroundColor: '#663333',
      padding: { x: 28, y: 10 }
    }).setOrigin(0.5).setDepth(41).setVisible(false)
      .setInteractive({ useHandCursor: true })
    this.quitBtn.on('pointerdown', () => {
      this.cleanup()
      this.scene.start('MenuScene')
    })
  }

  togglePause() {
    this.isPaused = !this.isPaused
    if (this.isPaused) {
      this.pauseStart        = Date.now()
      this.spawnTimer.paused = true
      this.pauseOverlay.setVisible(true)
      this.pauseLabel.setVisible(true)
      this.resumeBtn.setVisible(true)
      this.quitBtn.setVisible(true)
      this.pauseBtn.setText('▶')
    } else {
      if (this.pauseStart) {
        this.pausedTime += Date.now() - this.pauseStart
        this.pauseStart  = null
      }
      this.spawnTimer.paused = false
      this.pauseOverlay.setVisible(false)
      this.pauseLabel.setVisible(false)
      this.resumeBtn.setVisible(false)
      this.quitBtn.setVisible(false)
      this.pauseBtn.setText('⏸')
    }
  }

  // ─── TRAIL ────────────────────────────────────
  createTrail() {
    this.trailPoints   = []
    this.trailGraphics = this.add.graphics().setDepth(20)
  }

  // ─── INPUT ────────────────────────────────────
  setupInput() {
    this.input.on('pointerdown', () => {
      if (this.isPaused || this.isGameOver) return
      this.slicing     = true
      this.trailPoints = []
    })
    this.input.on('pointermove', (p) => {
      if (!this.slicing || this.isPaused || this.isGameOver) return
      this.trailPoints.push({ x: p.x, y: p.y, t: Date.now() })
      if (this.trailPoints.length > 24) this.trailPoints.shift()
      this.checkSlice(p.x, p.y)
    })
    this.input.on('pointerup', () => {
      this.slicing     = false
      this.trailPoints = []
    })
  }

  // ─── SPAWNING ─────────────────────────────────
  startSpawning() {
    this.spawnTimer = this.time.addEvent({
      delay: GAME_CONFIG.fruitSpawnInterval,
      callback: () => {
        if (this.isGameOver) return
        const count = this.difficulty >= 3 ? Phaser.Math.Between(1, 2) : 1
        for (let i = 0; i < count; i++) {
          this.time.delayedCall(i * 200, this.spawnFruit, [], this)
        }
      },
      loop: true
    })

    this.time.addEvent({
      delay: 10000,
      callback: () => {
        if (this.isGameOver) return
        this.difficulty++
        if (this.spawnTimer.delay > 400) {
          this.spawnTimer.delay = Math.max(400, this.spawnTimer.delay - 150)
        }
        this.diffTxt.setText(`Lv.${this.difficulty}`)
      },
      loop: true
    })
  }

  spawnFruit() {
    if (this.isGameOver) return
    const { width, height } = this.scale
    const isBomb = Phaser.Math.Between(1, 7) === 1
    const data   = isBomb ? BOMB : Phaser.Utils.Array.GetRandom(FRUITS)

    const x     = Phaser.Math.Between(width * 0.15, width * 0.85)
    const speed = Phaser.Math.Between(
      GAME_CONFIG.fruitSpeedMin + this.difficulty * 30,
      GAME_CONFIG.fruitSpeedMax + this.difficulty * 30
    )

    // vx บังคับเข้าหากลางจอเสมอ
    const side  = x < width / 2 ? 1 : -1
    const vxMag = speed * Phaser.Math.FloatBetween(0.05, 0.30)
    const vx    = side * vxMag

    const fruit = {
      data,
      x, y: height + 80,
      vx, vy: -speed,
      rotation: 0,
      rotSpeed: Phaser.Math.FloatBetween(-2.5, 2.5),
      radius: data.radius,
      sliced: false,
      removing: false,
      gfx: null,
    }

    fruit.gfx = this.add.graphics().setDepth(6)
    drawFruitShape(fruit.gfx, data, 0, 0)
    fruit.gfx.setPosition(x, height + 80)
    this.fruits.push(fruit)
  }

  drawFruit(fruit) {
    if (fruit.gfx) {
      fruit.gfx.setPosition(fruit.x, fruit.y)
      fruit.gfx.setRotation(fruit.rotation)
    }
  }

  // ─── SLICE ────────────────────────────────────
  checkSlice(px, py) {
    this.fruits.forEach(fruit => {
      if (fruit.sliced || fruit.removing) return
      const dist = Phaser.Math.Distance.Between(px, py, fruit.x, fruit.y)
      if (dist < fruit.radius + 12) this.sliceFruit(fruit)
    })
  }

  sliceFruit(fruit) {
    if (fruit.sliced || fruit.removing) return
    fruit.sliced   = true
    fruit.removing = true

    if (fruit.data.name === 'bomb') {
      this.hitBomb(fruit)
      return
    }

    this.combo++
    clearTimeout(this.comboTimer)
    this.comboTimer = setTimeout(() => { this.combo = 0 }, 1200)

    const multiplier = this.combo >= 5 ? 3 : this.combo >= 3 ? 2 : 1
    const pts        = fruit.data.points * multiplier
    this.score      += pts
    this.scoreTxt.setText(this.score)

    this.spawnHalves(fruit)

    if (this.version === 'B') {
      this.juicySlice(fruit, pts)
    } else {
      this.plainSlice(fruit, pts)
    }

    fruit.gfx?.destroy()
    this.fruits = this.fruits.filter(f => f !== fruit)
  }

  // ─── VERSION A ────────────────────────────────
  plainSlice(fruit, pts) {
    const txt = this.add.text(fruit.x, fruit.y - 20, `+${pts}`, {
      fontSize: '22px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(15)
    this.time.delayedCall(700, () => txt.destroy())
  }

  // ─── VERSION B ────────────────────────────────
  juicySlice(fruit, pts) {
    // ตัวเลขเด้ง
    const txt = this.add.text(fruit.x, fruit.y - 20, `+${pts}`, {
      fontSize: '36px', color: '#ffdd00',
      fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(15)
    this.tweens.add({
      targets: txt,
      y: fruit.y - 100, scaleX: 1.6, scaleY: 1.6, alpha: 0,
      duration: 700, ease: 'Back.easeOut',
      onComplete: () => txt.destroy()
    })

    // Particles
    this.spawnJuiceParticles(fruit)

    // Screen shake
    this.cameras.main.shake(60, 0.006)

    // Flash
    const flash = this.add.graphics().setDepth(50)
    flash.fillStyle(0xffffff, 0.18)
    flash.fillRect(0, 0, this.scale.width, this.scale.height)
    this.tweens.add({
      targets: flash, alpha: 0, duration: 80,
      onComplete: () => flash.destroy()
    })

    // Combo text
    if (this.combo >= 2) {
      const colors = ['', '', '#ffdd00', '#ff8800', '#ff4400', '#ff0000']
      const color  = colors[Math.min(this.combo, 5)] || '#ff0000'
      const ct = this.add.text(this.scale.width / 2, 130,
        `${this.combo}x COMBO! 🔥`, {
        fontSize: '28px', color,
        fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(20)
      this.tweens.add({
        targets: ct, y: 95, alpha: 0, scaleX: 1.2, scaleY: 1.2,
        duration: 900, ease: 'Power2',
        onComplete: () => ct.destroy()
      })
    }
  }

  spawnJuiceParticles(fruit) {
    const color = fruit.data.innerColor || 0xffffff
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2
      const spd   = Phaser.Math.Between(100, 220)
      const p     = this.add.graphics().setDepth(15)
      const r     = Phaser.Math.Between(5, 10)
      let px = fruit.x, py = fruit.y
      const vx = Math.cos(angle) * spd
      const vy = Math.sin(angle) * spd
      let life = 0

      const update = () => {
        life += 16
        px += vx * 0.016
        py += vy * 0.016 + 100 * 0.016
        const alpha = 1 - life / 450
        p.clear()
        p.fillStyle(color, Math.max(0, alpha))
        p.fillCircle(px, py, r * Math.max(0, 1 - life / 500))
        if (life >= 450) { p.destroy(); this.events.off('update', update) }
      }
      this.events.on('update', update)
    }
  }

  // ─── HALVES ───────────────────────────────────
  spawnHalves(fruit) {
    const leftGfx  = this.add.graphics().setDepth(7)
    const rightGfx = this.add.graphics().setDepth(7)
    const r = fruit.data.radius
    const c = fruit.data.innerColor || 0xffffff

    leftGfx.fillStyle(c, 1)
    leftGfx.slice(0, 0, r, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false)
    leftGfx.fillPath()
    leftGfx.lineStyle(2, 0xffffff, 0.4)
    leftGfx.beginPath()
    leftGfx.moveTo(0, -r)
    leftGfx.lineTo(0, r)
    leftGfx.strokePath()

    rightGfx.fillStyle(c, 1)
    rightGfx.slice(0, 0, r, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false)
    rightGfx.fillPath()
    rightGfx.lineStyle(2, 0xffffff, 0.4)
    rightGfx.beginPath()
    rightGfx.moveTo(0, -r)
    rightGfx.lineTo(0, r)
    rightGfx.strokePath()

    leftGfx.setPosition(fruit.x, fruit.y)
    rightGfx.setPosition(fruit.x, fruit.y)

    this.halves.push({
      left: leftGfx, right: rightGfx,
      lx: fruit.x, ly: fruit.y,
      rx: fruit.x, ry: fruit.y,
      lvx: -Phaser.Math.Between(100, 200),
      rvx:  Phaser.Math.Between(100, 200),
      lvy: Phaser.Math.Between(-300, -150),
      rvy: Phaser.Math.Between(-300, -150),
      lrot: Phaser.Math.FloatBetween(-4, -2),
      rrot: Phaser.Math.FloatBetween(2, 4),
      alpha: 1,
      life: 0
    })
  }

  // ─── BOMB ─────────────────────────────────────
  hitBomb(fruit) {
    this.lives--
    this.updateHearts()
    this.combo = 0

    if (this.version === 'B') {
      this.cameras.main.shake(400, 0.025)
      const flash = this.add.graphics().setDepth(50)
      flash.fillStyle(0xff2200, 0.5)
      flash.fillRect(0, 0, this.scale.width, this.scale.height)
      this.tweens.add({
        targets: flash, alpha: 0, duration: 400,
        onComplete: () => flash.destroy()
      })
    }

    this.spawnHalves(fruit)
    fruit.gfx?.destroy()
    this.fruits = this.fruits.filter(f => f !== fruit)
    if (this.lives <= 0) this.endGame()
  }

  // ─── UPDATE ───────────────────────────────────
  update(time, delta) {
    if (this.isPaused || this.isGameOver) return
    const { height } = this.scale
    const dt = delta / 1000

    // Trail
    this.trailGraphics.clear()
    if (this.slicing && this.trailPoints.length > 1) {
      const now = Date.now()
      for (let i = 1; i < this.trailPoints.length; i++) {
        const age   = now - this.trailPoints[i].t
        const alpha = Math.max(0, 1 - age / 250)
        if (alpha <= 0) continue
        const col = this.version === 'B' ? 0x00eeff : 0xffffff
        const lw  = this.version === 'B' ? 5 * alpha : 3 * alpha
        this.trailGraphics.lineStyle(lw, col, alpha)
        this.trailGraphics.beginPath()
        this.trailGraphics.moveTo(this.trailPoints[i - 1].x, this.trailPoints[i - 1].y)
        this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y)
        this.trailGraphics.strokePath()
      }
    }

    // Fruits physics
    const fruitsToRemove = []
    for (const fruit of [...this.fruits]) {
      if (fruit.sliced || fruit.removing) continue

      fruit.vy += 1400 * dt
      fruit.x  += fruit.vx * dt
      fruit.y  += fruit.vy * dt
      fruit.rotation += fruit.rotSpeed * dt
      this.drawFruit(fruit)

      if (fruit.y > height + 120) {
        fruit.removing = true
        fruitsToRemove.push(fruit)

        if (fruit.data.name !== 'bomb') {
          this.lives--
          this.updateHearts()
          if (this.lives <= 0) {
            fruitsToRemove.forEach(f => f.gfx?.destroy())
            this.fruits = this.fruits.filter(f => !fruitsToRemove.includes(f))
            this.endGame()
            return
          }
        }
      }
    }

    if (fruitsToRemove.length > 0) {
      fruitsToRemove.forEach(f => f.gfx?.destroy())
      this.fruits = this.fruits.filter(f => !fruitsToRemove.includes(f))
    }

    // Halves physics
    for (let i = this.halves.length - 1; i >= 0; i--) {
      const h = this.halves[i]
      h.life += delta
      h.lvy  += 1400 * dt
      h.rvy  += 1400 * dt
      h.lx   += h.lvx * dt
      h.ly   += h.lvy * dt
      h.rx   += h.rvx * dt
      h.ry   += h.rvy * dt
      h.alpha = Math.max(0, 1 - h.life / 600)

      h.left.setPosition(h.lx, h.ly)
        .setRotation(h.lrot * h.life * 0.001)
        .setAlpha(h.alpha)
      h.right.setPosition(h.rx, h.ry)
        .setRotation(h.rrot * h.life * 0.001)
        .setAlpha(h.alpha)

      if (h.life > 600) {
        h.left.destroy()
        h.right.destroy()
        this.halves.splice(i, 1)
      }
    }
  }

  // ─── CLEANUP / END ────────────────────────────
  cleanup() {
    this.isGameOver = true
    this.spawnTimer?.remove()
    this.fruits.forEach(f => f.gfx?.destroy())
    this.halves.forEach(h => { h.left?.destroy(); h.right?.destroy() })
    this.fruits = []
    this.halves = []
  }

  endGame() {
    if (this.isGameOver) return
    this.isGameOver = true
    this.cleanup()

    const sessionLength = Math.floor(
      (Date.now() - this.startTime - this.pausedTime) / 1000
    )
    this.scene.start('ResultScene', {
      score: this.score,
      sessionLength,
      version: this.version
    })
  }
}