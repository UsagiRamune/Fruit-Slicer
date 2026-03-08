export function drawFruitShape(gfx, data, x, y) {
  gfx.clear()
  const r = data.radius

  switch(data.drawFn) {

    case 'watermelon': {
      // เปลือกชั้นนอกสุด เขียวเข้ม
      gfx.fillStyle(0x1a7a1a, 1)
      gfx.fillCircle(x, y, r)
      
      // เปลือกชั้นใน เขียวสว่าง
      gfx.fillStyle(0x2ecc71, 1)
      gfx.fillCircle(x, y, r * 0.9)
      
      // ขอบขาวบางๆ (ส่วนเปลือกที่ติดเนื้อ)
      gfx.fillStyle(0xecf0f1, 1)
      gfx.fillCircle(x, y, r * 0.8)
      
      // เนื้อแดง
      gfx.fillStyle(0xff4757, 1)
      gfx.fillCircle(x, y, r * 0.75)
      
      // เมล็ด (จัดเรียงใหม่ให้ดูเป็นธรรมชาติ ไม่แข็งเกินไป)
      gfx.fillStyle(0x111111, 1)
      const seeds = [
          [-0.2, 0.2], [0.2, 0.2], [0, -0.2], [-0.3, -0.1], [0.3, -0.1]
      ]
      seeds.forEach(([sx, sy]) => {
          gfx.fillEllipse(x + sx * r, y + sy * r, 5, 8)
      })
      
      // ไฮไลต์แสงตกกระทบ
      gfx.fillStyle(0xffffff, 0.2)
      gfx.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.2)
      break
    }

    case 'orange': {
      // ── ตัวผล วงกลมส้ม ──
      gfx.fillStyle(0xff8800, 1)
      gfx.fillCircle(x, y, r)
      // เนื้อส้มด้านใน
      gfx.fillStyle(0xffaa33, 1)
      gfx.fillCircle(x, y, r * 0.85)
      // เส้น segment
      gfx.lineStyle(2, 0xff7700, 0.8)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        gfx.beginPath()
        gfx.moveTo(x, y)
        gfx.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85)
        gfx.strokePath()
      }
      // วงกลมกลาง
      gfx.fillStyle(0xffcc66, 1)
      gfx.fillCircle(x, y, r * 0.15)
      // outline
      gfx.lineStyle(4, 0xcc5500, 1)
      gfx.strokeCircle(x, y, r)
      // จุดไฮไลต์
      gfx.fillStyle(0xffffff, 0.3)
      gfx.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.18)
      break
    }

    case 'lemon': {
      // ใช้สมการคณิตศาสตร์คำนวณจุดรอบวงรี แล้วดึงจุกหัวท้ายให้แหลมออกแบบเลมอน
      const lemonPoints = []
      for(let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          let px = Math.cos(angle) * r * 0.95
          let py = Math.sin(angle) * r * 0.6
          
          // เติมจุกแหลมซ้ายขวา
          if (Math.cos(angle) > 0.5) {
              px += Math.pow(Math.cos(angle) - 0.5, 2) * r * 1.2
          }
          if (Math.cos(angle) < -0.5) {
              px -= Math.pow(Math.abs(Math.cos(angle)) - 0.5, 2) * r * 1.2
          }
          lemonPoints.push(new Phaser.Math.Vector2(x + px, y + py))
      }
      
      // วาดเนื้อเลมอนและขอบ
      gfx.fillStyle(0xffe600, 1)
      gfx.fillPoints(lemonPoints, true)
      gfx.lineStyle(4, 0xcca300, 1)
      gfx.strokePoints(lemonPoints, true, true)

      // รูขุมขนเปลือกเลมอน
      gfx.fillStyle(0xd4c800, 0.6)
      const pores = [
        [-0.4, -0.2], [0.3, -0.4], [0.5, 0.2], [-0.2, 0.4], [0.1, 0.5],
        [-0.5, 0.2], [0.2, -0.2], [-0.1, 0.1], [0.4, 0.4], [-0.6, -0.3]
      ]
      pores.forEach(([px, py]) => {
        gfx.fillCircle(x + px * r, y + py * r, r * 0.04)
      })

      // ไฮไลต์แสงตกกระทบ
      gfx.fillStyle(0xffffff, 0.3)
      gfx.fillEllipse(x, y - r * 0.35, r * 0.6, r * 0.15)
      break
    }

    case 'peach': {
      // ตัวลูกพีช
      gfx.fillStyle(0xff8c69, 1)
      gfx.fillCircle(x, y, r)

      // แก้มพีช
      gfx.fillStyle(0xff5e62, 0.6)
      gfx.fillCircle(x - r * 0.2, y + r * 0.1, r * 0.6)

      // ก้านพีช
      gfx.lineStyle(4, 0x5c4033, 1)
      gfx.beginPath()
      gfx.moveTo(x + r * 0.1, y - r * 0.9)
      gfx.lineTo(x + r * 0.2, y - r * 1.2)
      gfx.strokePath()

      // วาดใบไม้ (ใช้คณิตศาสตร์สร้างจุดโพลีกอนทรงใบไม้เอียง -45 องศา)
      const leafPoints = []
      for(let angle = 0; angle < Math.PI * 2; angle += 0.2) {
          let lx = Math.cos(angle) * r * 0.4
          let ly = Math.sin(angle) * r * 0.15
          let rot = -Math.PI / 4 // หมุนองศา
          let rx = lx * Math.cos(rot) - ly * Math.sin(rot)
          let ry = lx * Math.sin(rot) + ly * Math.cos(rot)
          leafPoints.push(new Phaser.Math.Vector2(x + r*0.2 + rx, y - r*1.2 + ry))
      }
      gfx.fillStyle(0x2ecc71, 1)
      gfx.fillPoints(leafPoints, true)
      gfx.lineStyle(2, 0x27ae60, 1)
      gfx.strokePoints(leafPoints, true, true)

      // เส้นขอบลูกพีช
      gfx.lineStyle(4, 0xdc7633, 1)
      gfx.strokeCircle(x, y, r)

      // ร่องพีช (ใช้ส่วนโค้งวงกลมใหญ่ตีโค้งเข้ามาตื้นๆ แทน)
      gfx.lineStyle(4, 0xd94e53, 0.8)
      gfx.beginPath()
      // ลากจากมุม 135 องศา ไป 225 องศา โดยจุดศูนย์กลางเยื้องไปทางขวา
      gfx.arc(x + r * 0.8, y, r * 1.2, Math.PI * 0.75, Math.PI * 1.25, false)
      gfx.strokePath()

      // ไฮไลต์
      gfx.fillStyle(0xffffff, 0.2)
      gfx.fillCircle(x + r * 0.35, y - r * 0.35, r * 0.2)
      break
    }

    case 'pineapple': {
      const bodyW = r * 1.3
      const bodyH = r * 1.7
      const cy = y + r * 0.1 // จุดศูนย์กลางแกน Y ของตัวผล
      
      // ใบไม้
      const leafAngles = [-120, -105, -90, -75, -60]
      leafAngles.forEach(angle => {
          const rad = Phaser.Math.DegToRad(angle)
          const ex = x + Math.cos(rad) * r * 1.3
          const ey = y + Math.sin(rad) * r * 1.3
          gfx.lineStyle(8, 0x2ecc71, 1) 
          gfx.beginPath()
          gfx.moveTo(x, y - bodyH * 0.35)
          gfx.lineTo(ex, ey)
          gfx.strokePath()
      })
      
      // ตัวผลสีเหลืองทอง
      gfx.fillStyle(0xf1c40f, 1)
      gfx.fillEllipse(x, cy, bodyW, bodyH)
      gfx.lineStyle(4, 0xd35400, 1)
      gfx.strokeEllipse(x, cy, bodyW, bodyH)
      
      // ลายตาสับปะรด (ใช้สมการวงรีคุมขอบเขต)
      gfx.lineStyle(3, 0xd35400, 0.7)
      const a = bodyW / 2 // รัศมีแกน X
      const b = bodyH / 2 // รัศมีแกน Y
      
      for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
              let px = x + i * r * 0.3
              let py = cy + j * r * 0.4
              
              // เช็คสมการวงรี: (x-h)^2 / a^2 + (y-k)^2 / b^2 <= 1
              // กูตั้งค่าไว้ที่ < 0.65 เพื่อให้ลายมันอยู่แค่เนื้อใน ไม่ทับเส้นขอบ
              if (Math.pow((px - x) / a, 2) + Math.pow((py - cy) / b, 2) < 0.65) {
                  gfx.beginPath()
                  gfx.moveTo(px - 5, py - 4)
                  gfx.lineTo(px, py + 4)
                  gfx.lineTo(px + 5, py - 4)
                  gfx.strokePath()
              }
          }
      }
      
      // ไฮไลต์แสงให้ดูนูนๆ
      gfx.fillStyle(0xffffff, 0.2)
      gfx.fillEllipse(x - r * 0.2, y - r * 0.1, r * 0.4, r * 0.7)
      break
    }

    case 'bomb': {
      // ── ระเบิด ── (เหมือนเดิม โอเคแล้ว)
      gfx.fillStyle(0x111111, 1)
      gfx.fillCircle(x, y, r)
      gfx.fillStyle(0x444444, 1)
      gfx.fillCircle(x - r * 0.25, y - r * 0.25, r * 0.25)
      gfx.lineStyle(3, 0xaaaaaa, 1)
      gfx.beginPath()
      gfx.moveTo(x + r * 0.5, y - r * 0.7)
      gfx.lineTo(x + r * 0.8, y - r * 1.1)
      gfx.strokePath()
      gfx.fillStyle(0xffcc00, 1)
      gfx.fillCircle(x + r * 0.8, y - r * 1.1, 5)
      gfx.lineStyle(3, 0xff2200, 1)
      gfx.strokeCircle(x, y, r)
      break
    }

    default: { // blueberry
      gfx.fillStyle(0x2255ff, 1)
      gfx.fillCircle(x, y, r)
      gfx.fillStyle(0x4477ff, 1)
      gfx.fillCircle(x, y, r * 0.8)
      // จุดขาว highlight
      gfx.fillStyle(0xffffff, 0.5)
      gfx.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.22)
      // มงกุฎเล็กๆ ด้านบน
      gfx.fillStyle(0x4444aa, 1)
      for (let i = -1; i <= 1; i++) {
        gfx.fillTriangle(
          x + i * 8 - 4, y - r * 0.85,
          x + i * 8 + 4, y - r * 0.85,
          x + i * 8,     y - r * 1.05
        )
      }
      gfx.lineStyle(3, 0x1133cc, 1)
      gfx.strokeCircle(x, y, r)
      break
    }
  }
}

// ── Heart shape ด้วย bezier curve ──────────────
export function drawHeart(gfx, x, y, size, color) {
  gfx.clear()
  gfx.fillStyle(color, 1)

  // วาด heart ด้วย 2 วงกลม + 1 สามเหลี่ยม
  const r = size * 0.55

  // วงกลมซ้าย
  gfx.fillCircle(x - r * 0.5, y - size * 0.1, r)
  // วงกลมขวา
  gfx.fillCircle(x + r * 0.5, y - size * 0.1, r)
  // สามเหลี่ยมด้านล่าง
  gfx.fillTriangle(
    x - size * 0.95, y - size * 0.1,
    x + size * 0.95, y - size * 0.1,
    x,               y + size * 0.9
  )

  // highlight
  gfx.fillStyle(0xffffff, 0.3)
  gfx.fillCircle(x - r * 0.5, y - size * 0.2, r * 0.45)
}