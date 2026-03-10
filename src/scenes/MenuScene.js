import { submitFeedback } from '../firebase.js'

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }) }

  create() {
    const { width, height } = this.scale

    // ── พื้นหลัง ──
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1)
    bg.fillRect(0, 0, width, height)

    // ── โลโก้ & ชื่อเกม ──
    this.add.text(width / 2, height * 0.16, '🍉', {
      fontSize: '80px'
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.28, 'FRUIT SLICER', {
      fontSize: '36px', color: '#ffffff',
      fontFamily: "'Fredoka One', 'Arial Black'", stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5)

    // ── เลือก Version ──
    this.add.text(width / 2, height * 0.40, 'เลือก Version:', {
      fontSize: '20px', color: '#aaaaaa', fontFamily: "'Nunito', Arial"
    }).setOrigin(0.5)

    // ปุ่ม Version A
    const btnA = this.add.text(width / 2 - 70, height * 0.48, '  A  ', {
      fontSize: '26px', color: '#1a1a2e',
      fontFamily: "'Fredoka One', 'Arial Black'", backgroundColor: '#aaaaaa',
      padding: { x: 24, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    // ปุ่ม Version B
    const btnB = this.add.text(width / 2 + 70, height * 0.48, '  B  ', {
      fontSize: '26px', color: '#1a1a2e',
      fontFamily: "'Fredoka One', 'Arial Black'", backgroundColor: '#aaaaaa',
      padding: { x: 24, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    // Label บอกเวอร์ชันที่เลือก
    let selectedVersion = this.registry.get('version') || 'A'
    const versionLabel = this.add.text(width / 2, height * 0.56, '', {
      fontSize: '16px', color: '#00ff88', fontFamily: "'Nunito', Arial"
    }).setOrigin(0.5)

    const highlight = (v) => {
      btnA.setStyle({ backgroundColor: v === 'A' ? '#00ff88' : '#aaaaaa' })
      btnB.setStyle({ backgroundColor: v === 'B' ? '#00ff88' : '#aaaaaa' })
      selectedVersion = v
      this.registry.set('version', v)
      versionLabel.setText(`Version ${v} ${v === 'B' ? '✨ Juicy' : '⬜ Minimal'}`)
    }

    btnA.on('pointerdown', () => highlight('A'))
    btnB.on('pointerdown', () => highlight('B'))
    highlight(selectedVersion) // เซ็ตค่าเริ่มต้นตอนเปิดหน้า

    // ── ปุ่ม PLAY ──
    const playBtn = this.add.text(width / 2, height * 0.66, '▶  PLAY', {
      fontSize: '28px', color: '#1a1a2e',
      fontFamily: "'Fredoka One', 'Arial Black'", backgroundColor: '#00ff88',
      padding: { x: 40, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    playBtn.on('pointerover', () => playBtn.setStyle({ backgroundColor: '#00cc66' }))
    playBtn.on('pointerout',  () => playBtn.setStyle({ backgroundColor: '#00ff88' }))
    playBtn.on('pointerdown', () => {
      // ให้มันไปเข้าฉาก Tutorial ก่อน แล้วค่อยไป GameScene (ตามระบบเดิมมึง)
      this.scene.start('TutorialScene')
    })

    // ── ปุ่ม LEADERBOARD ──
    const lbBtn = this.add.text(width / 2, height * 0.76, '🏆  LEADERBOARD', {
      fontSize: '18px', color: '#ffffff',
      fontFamily: "'Nunito', Arial", fontStyle: 'bold', backgroundColor: '#333355',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    lbBtn.on('pointerover', () => lbBtn.setStyle({ backgroundColor: '#4a4a7a' }))
    lbBtn.on('pointerout', () => lbBtn.setStyle({ backgroundColor: '#333355' }))
    lbBtn.on('pointerdown', () => this.scene.start('LeaderboardScene', { version: selectedVersion }))

    // ── 🌟 ปุ่ม GALLERY (ใหม่!) 🌟 ──
    const galBtn = this.add.text(width / 2, height * 0.85, '🎨  SPRITE GALLERY', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: "'Nunito', Arial", fontStyle: 'bold', backgroundColor: '#8e44ad',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    galBtn.on('pointerover', () => galBtn.setStyle({ backgroundColor: '#9b59b6' }))
    galBtn.on('pointerout', () => galBtn.setStyle({ backgroundColor: '#8e44ad' }))
    galBtn.on('pointerdown', () => this.scene.start('GalleryScene'))

    // ── ปุ่ม แจ้งบัค / แนะนำ ──
    const fbBtn = this.add.text(width / 2, height * 0.93, '🐛  แจ้งบัค / แนะนำ', {
      fontSize: '14px', color: '#ffffff',
      fontFamily: "'Nunito', Arial", backgroundColor: '#2c3e50',
      padding: { x: 16, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    fbBtn.on('pointerover', () => fbBtn.setStyle({ backgroundColor: '#34495e' }))
    fbBtn.on('pointerout', () => fbBtn.setStyle({ backgroundColor: '#2c3e50' }))
    fbBtn.on('pointerdown', () => {
      this.showFeedbackForm()
    })
  }

  // ── ฟังก์ชันเสกหน้าต่างแจ้งบัค (HTML Overlay) ──
  showFeedbackForm() {
    // กันคนกดเบิ้ลจนหน้าต่างซ้อนกัน
    if (document.getElementById('feedback-overlay')) return

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
        alert('เชี่ย ส่งไม่ผ่านว่ะ ลองเช็คเน็ตหรือ Database Rules ดูอีกทีนะ')
      }
      
      document.getElementById('feedback-overlay').remove()
    }
  }
}