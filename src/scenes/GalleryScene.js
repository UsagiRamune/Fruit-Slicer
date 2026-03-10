import { FRUITS, BOMB } from '../config.js'
import { drawFruitShape } from '../fruitRenderer.js'

export class GalleryScene extends Phaser.Scene {
  constructor() { super({ key: 'GalleryScene' }) }

  create() {
    const { width, height } = this.scale

    // ── Background ──────────────────────────────
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1)
    bg.fillRect(0, 0, width, height)

    // ── Title ────────────────────────────────────
    this.add.text(width / 2, 44, 'SPRITE GALLERY', {
      fontSize: '28px', color: '#00e5ff',
      fontFamily: "'Fredoka One', 'Arial Black', sans-serif",
      stroke: '#000033', strokeThickness: 5,
    }).setOrigin(0.5)

    // ── Back button ──────────────────────────────
    const backBtn = this.add.text(20, 16, '◀ BACK', {
      fontSize: '14px', color: '#fff',
      fontFamily: "'Nunito', Arial, sans-serif",
      fontStyle: 'bold',
      backgroundColor: '#ff4488',
      padding: { x: 12, y: 8 }
    }).setInteractive({ useHandCursor: true })
    backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: '#ff1166' }))
    backBtn.on('pointerout',  () => backBtn.setStyle({ backgroundColor: '#ff4488' }))
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'))

    // ── Grid config ──────────────────────────────
    const allItems = [...FRUITS, BOMB]
    const cols     = 3

    // card size
    const CARD_W = (width - 40) / cols - 8   // ~138px สำหรับจอ 480
    const CARD_H = CARD_W * 1.25             // ratio 4:5

    // sprite scale — ลดขนาดผลไม้ให้พอดีการ์ด
    // radius ของผลไม้ใน config อยู่ที่ 48-72px
    // เราต้องการให้ผลไม้กว้างไม่เกิน 60% ของ card
    const MAX_SPRITE_R = CARD_W * 0.30       // ~41px

    const GAP   = 8
    const startX = 20 + CARD_W / 2
    const startY = 88

    allItems.forEach((item, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)

      // ตัวสุดท้าย (bomb) ถ้าเป็น row ที่เหลืออยู่คนเดียว → จัดกลาง
      const isLastAlone = index === allItems.length - 1 && allItems.length % cols !== 0
      const colOffset   = isLastAlone
        ? Math.floor(cols / 2)  // กลาง
        : col

      const cx = 20 + colOffset * (CARD_W + GAP) + CARD_W / 2
      const cy = startY + row * (CARD_H + GAP) + CARD_H / 2

      const isBomb      = item.name === 'bomb'
      const cardColor   = isBomb ? 0x330000 : 0x0f1a2e
      const strokeColor = isBomb ? 0xff0055 : 0x00e5ff

      // Card
      const card = this.add.graphics()
      card.fillStyle(cardColor, 0.9)
      card.lineStyle(1.5, strokeColor, 0.6)
      card.fillRoundedRect(cx - CARD_W / 2, cy - CARD_H / 2, CARD_W, CARD_H, 12)
      card.strokeRoundedRect(cx - CARD_W / 2, cy - CARD_H / 2, CARD_W, CARD_H, 12)

      // คำนวณ scale ให้ผลไม้ไม่เกินขนาด card
      const spriteR  = item.radius || 48
      const scale    = Math.min(MAX_SPRITE_R / spriteR, 1.0)
      const spriteY  = cy - CARD_H * 0.10   // เลื่อนขึ้นนิดให้มีที่ข้อความ

      // Sprite
      const gfx = this.add.graphics()
      drawFruitShape(gfx, item, 0, 0)
      gfx.setPosition(cx, spriteY)
      gfx.setScale(scale)

      // Shadow ใต้ผลไม้
      const shadow = this.add.graphics()
      shadow.fillStyle(0x000000, 0.3)
      shadow.fillEllipse(cx, spriteY + spriteR * scale + 4, spriteR * scale * 1.4, 8)

      // Interactive bounce
      const hitArea = new Phaser.Geom.Circle(0, 0, spriteR)
      gfx.setInteractive(hitArea, Phaser.Geom.Circle.Contains)
      gfx.input.cursor = 'pointer'
      gfx.on('pointerdown', () => {
        this.tweens.add({
          targets: gfx, scaleX: scale * 1.25, scaleY: scale * 0.75,
          duration: 80, yoyo: true,
          onComplete: () => {
            this.tweens.add({
              targets: gfx, scaleX: scale, scaleY: scale,
              duration: 400, ease: 'Elastic.easeOut'
            })
          }
        })
      })

      // ชื่อ
      const nameY = cy + CARD_H / 2 - 34
      this.add.text(cx, nameY, item.name.toUpperCase(), {
        fontSize: '12px', color: '#ffffff',
        fontFamily: "'Fredoka One', 'Arial Black', sans-serif"
      }).setOrigin(0.5)

      // คะแนน
      const ptsText  = isBomb ? 'INSTANT DEATH' : `+${item.points} PTS`
      const ptsColor = isBomb ? '#ff4444' : '#00ff88'
      this.add.text(cx, nameY + 18, ptsText, {
        fontSize: '10px', color: ptsColor,
        fontFamily: "'Nunito', Arial, sans-serif", fontStyle: 'bold'
      }).setOrigin(0.5)
    })
  }
}