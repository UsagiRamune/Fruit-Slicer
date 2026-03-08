import { getLeaderboard } from '../firebase.js'

export class LeaderboardScene extends Phaser.Scene {
  constructor() { super({ key: 'LeaderboardScene' }) }

  async create() {
    const { width, height } = this.scale
    this.currentVersion = 'A'

    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1)
    bg.fillRect(0, 0, width, height)

    this.add.text(width / 2, 35, '🏆 LEADERBOARD', {
      fontSize: '28px', color: '#ffdd00',
      fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5)

    // Tab A/B
    this.tabA = this.add.text(width / 2 - 60, 80, ' Ver A ', {
      fontSize: '18px', color: '#1a1a2e',
      fontFamily: 'Arial Black', backgroundColor: '#00ff88',
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.tabB = this.add.text(width / 2 + 60, 80, ' Ver B ', {
      fontSize: '18px', color: '#ffffff',
      fontFamily: 'Arial Black', backgroundColor: '#333355',
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.tabA.on('pointerdown', () => this.switchTab('A'))
    this.tabB.on('pointerdown', () => this.switchTab('B'))

    // container สำหรับ rows
    this.rowContainer = this.add.container(0, 0)

    this.loadingTxt = this.add.text(width / 2, height / 2, 'กำลังโหลด...', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5)

    // Back button
    const backBtn = this.add.text(width / 2, height - 45, '← กลับหน้าหลัก', {
      fontSize: '18px', color: '#ffffff',
      fontFamily: 'Arial', backgroundColor: '#333355',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    backBtn.on('pointerdown', () => this.scene.start('MenuScene'))

    this.loadLeaderboard('A')
  }

  async switchTab(version) {
    this.currentVersion = version
    this.tabA.setStyle({
      color: version === 'A' ? '#1a1a2e' : '#ffffff',
      backgroundColor: version === 'A' ? '#00ff88' : '#333355'
    })
    this.tabB.setStyle({
      color: version === 'B' ? '#1a1a2e' : '#ffffff',
      backgroundColor: version === 'B' ? '#00ff88' : '#333355'
    })
    this.loadLeaderboard(version)
  }

  async loadLeaderboard(version) {
    this.rowContainer.removeAll(true)
    this.loadingTxt.setVisible(true)

    try {
      const data = await getLeaderboard(version, 10)
      this.loadingTxt.setVisible(false)
      this.showRows(data)
    } catch(e) {
      this.loadingTxt.setText('❌ โหลดไม่ได้').setColor('#ff4444')
    }
  }

  showRows(data) {
    const { width } = this.scale
    const medals = ['🥇', '🥈', '🥉']

    data.forEach((p, i) => {
      const y = 130 + i * 50

      const rowBg = this.add.graphics()
      rowBg.fillStyle(i % 2 === 0 ? 0x1e1e3e : 0x16163a, 1)
      rowBg.fillRoundedRect(20, y - 16, width - 40, 42, 6)

      const medal = this.add.text(38, y, medals[i] || `${i+1}.`, {
        fontSize: '20px', fontFamily: 'Arial'
      }).setOrigin(0, 0.5)

      const name = this.add.text(80, y, p.displayName || p.username, {
        fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0, 0.5)

      const score = this.add.text(width - 35, y, `${p.score}`, {
        fontSize: '18px', color: '#ffdd00', fontFamily: 'Arial Black'
      }).setOrigin(1, 0.5)

      // เวลาเล่นรวม
      const playTime = p[`playTime${this.currentVersion}`] || 0
      const mins = Math.floor(playTime / 60)
      const secs = playTime % 60
      const timeTxt = this.add.text(width - 35, y + 14, 
        `⏱ ${mins}m ${secs}s`, {
        fontSize: '12px', color: '#888888', fontFamily: 'Arial'
      }).setOrigin(1, 0.5)

      this.rowContainer.add([rowBg, medal, name, score, timeTxt])
    })
  }
}