export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // ตอนนี้ไม่มี assets ให้โหลด ใช้ Graphics ล้วนๆ
  }

  create() {
    this.scene.start('MenuScene')
  }
}