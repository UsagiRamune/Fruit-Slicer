import { submitFeedback } from '../firebase.js' // อย่าลืม import ละ

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

    lbBtn.on('pointerdown', () => this.scene.start('LeaderboardScene', { version: selectedVersion }))

    // เพิ่มปุ่มแจ้งบัค
    const fbBtn = this.add.text(width / 2, height * 0.88, '🐛  แจ้งบัค / แนะนำ', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: 'Arial', backgroundColor: '#2c3e50',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    fbBtn.on('pointerdown', () => {
      this.showFeedbackForm()
    })
  }

  showFeedbackForm() {
    // กันคนกดเบิ้ล
    if (document.getElementById('feedback-overlay')) return

    // เสก HTML Overlay ขึ้นมากลางจอ
    const htmlString = `
      <div id="feedback-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999;">
        <div style="background: #1a1a2e; padding: 25px; border-radius: 15px; width: 85%; max-width: 400px; text-align: center; border: 2px solid #ff4488; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <h2 style="color: #fff; margin-bottom: 15px; font-family: 'Fredoka One', 'Arial Black', sans-serif; font-size: 24px;">🐛 แจ้งปัญหา</h2>
          <p style="color: #aaa; font-family: 'Nunito', Arial, sans-serif; font-size: 14px; margin-bottom: 15px;">เจอบัคตรงไหน หรืออยากให้ปรับอะไร พิมพ์มาได้เลย (แนบ Error Log ให้อัตโนมัติ)</p>
          <textarea id="feedback-msg" rows="4" placeholder="พิมพ์ข้อความที่นี่..." style="width: 100%; padding: 12px; border-radius: 8px; border: none; outline: none; resize: none; font-family: 'Nunito', Arial, sans-serif; font-size: 16px; background: #0a1f3c; color: #fff; box-sizing: border-box;"></textarea>
          <div style="margin-top: 20px; display: flex; justify-content: space-between; gap: 10px;">
            <button id="fb-cancel" style="flex: 1; padding: 12px; background: #4a4a6a; border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: bold; font-family: 'Nunito', Arial, sans-serif;">ยกเลิก</button>
            <button id="fb-submit" style="flex: 1; padding: 12px; background: #ff4488; border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: bold; font-family: 'Nunito', Arial, sans-serif;">ส่งข้อมูล 🚀</button>
          </div>
        </div>
      </div>
    `
    const wrapper = document.createElement('div')
    wrapper.innerHTML = htmlString
    document.body.appendChild(wrapper.firstElementChild)

    // จัดการปุ่มยกเลิก
    document.getElementById('fb-cancel').onclick = () => {
      document.getElementById('feedback-overlay').remove()
    }

    // จัดการปุ่มส่ง
    document.getElementById('fb-submit').onclick = async () => {
      const msg = document.getElementById('feedback-msg').value
      if (!msg.trim()) {
        alert('พิมพ์อะไรมาก่อนดิวะ จะส่งกระดาษเปล่ารึไง!')
        return
      }

      const btn = document.getElementById('fb-submit')
      btn.innerText = 'กำลังส่ง...'
      btn.disabled = true
      btn.style.background = '#666'

      // ยิงข้อมูลเข้า Firebase
      const success = await submitFeedback(msg)

      if (success) {
        alert('ส่งรีพอร์ตเรียบร้อยแล้ว แต๊งกิ้วมากเพื่อน!')
      } else {
        alert('เชี่ย ส่งไม่ผ่านว่ะ ลองเช็คเน็ตดูอีกทีนะ')
      }
      
      document.getElementById('feedback-overlay').remove()
    }
  }
}