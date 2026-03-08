export function drawFruitShape(gfx, data, x, y) {
  gfx.clear()
  const r = data.radius

  switch(data.drawFn) {

    case 'watermelon': {
    // เปลือกเขียวเข้ม
    gfx.fillStyle(0x1a7a1a, 1)
    gfx.fillCircle(x, y, r)
    // แถบเขียวอ่อน 6 แถบ ผอมๆ
    gfx.fillStyle(0x55dd55, 1)
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        // วาดเป็นเส้นหนาๆ แทนการ fillPath
        gfx.lineStyle(r * 0.12, 0x55dd55, 1)
        gfx.beginPath()
        gfx.moveTo(x, y)
        gfx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
        gfx.strokePath()
    }
    // เนื้อแดงด้านใน
    gfx.fillStyle(0xff3333, 1)
    gfx.fillCircle(x, y, r * 0.75)
    // เมล็ด
    gfx.fillStyle(0x111111, 1)
    const seeds = [
        [-0.2, -0.1], [0.15, -0.25],
        [0.25, 0.15], [-0.1, 0.22], [0.02, 0.02]
    ]
    seeds.forEach(([sx, sy]) => {
        gfx.fillEllipse(x + sx * r, y + sy * r, 5, 8)
    })
    // outline
    gfx.lineStyle(4, 0x0d4d0d, 1)
    gfx.strokeCircle(x, y, r)
    // highlight
    gfx.fillStyle(0xffffff, 0.15)
    gfx.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.22)
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
      // ── วงรีเหลือง มีปลายแหลมสองข้าง ──
      gfx.fillStyle(0xffee22, 1)
      gfx.fillEllipse(x, y, r * 2.2, r * 1.6)
      // เนื้อด้านใน
      gfx.fillStyle(0xffff88, 1)
      gfx.fillEllipse(x, y, r * 1.7, r * 1.2)
      // เส้นกลาง
      gfx.lineStyle(2, 0xddcc00, 0.7)
      gfx.beginPath()
      gfx.moveTo(x - r * 1.0, y)
      gfx.lineTo(x + r * 1.0, y)
      gfx.strokePath()
      // เส้น segment
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue
        gfx.lineStyle(1.5, 0xddcc00, 0.5)
        gfx.beginPath()
        gfx.moveTo(x, y)
        gfx.lineTo(x + i * r * 0.4, y - r * 0.7)
        gfx.strokePath()
        gfx.beginPath()
        gfx.moveTo(x, y)
        gfx.lineTo(x + i * r * 0.4, y + r * 0.7)
        gfx.strokePath()
      }
      // outline
      gfx.lineStyle(3, 0xbbaa00, 1)
      gfx.strokeEllipse(x, y, r * 2.2, r * 1.6)
      // ไฮไลต์
      gfx.fillStyle(0xffffff, 0.25)
      gfx.fillEllipse(x - r * 0.3, y - r * 0.3, r * 0.6, r * 0.4)
      break
    }

    case 'peach': {
      // ── วงกลมชมพูอมส้ม ──
      gfx.fillStyle(0xff9955, 1)
      gfx.fillCircle(x, y, r)
      // ไล่สีจากกลาง
      gfx.fillStyle(0xffbb77, 1)
      gfx.fillCircle(x, y, r * 0.75)
      gfx.fillStyle(0xffddaa, 1)
      gfx.fillCircle(x, y, r * 0.45)
      // เส้นกลางพีช
      gfx.lineStyle(3, 0xff7744, 0.7)
      gfx.beginPath()
      gfx.moveTo(x, y - r * 0.9)
      gfx.lineTo(x, y + r * 0.9)
      gfx.strokePath()
      // ก้าน
      gfx.lineStyle(3, 0x664400, 1)
      gfx.beginPath()
      gfx.moveTo(x, y - r)
      gfx.lineTo(x + 5, y - r - 14)
      gfx.strokePath()
      // ใบ
      gfx.fillStyle(0x33aa33, 1)
      gfx.fillEllipse(x + 10, y - r - 10, 18, 10)
      // outline
      gfx.lineStyle(3, 0xdd6633, 1)
      gfx.strokeCircle(x, y, r)
      // ไฮไลต์
      gfx.fillStyle(0xffffff, 0.25)
      gfx.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.2)
      break
    }

    case 'pineapple': {
    const bodyW = r * 1.3
    const bodyH = r * 1.7

    // ตัวสับปะรดสีเหลืองทอง
    gfx.fillStyle(0xddaa00, 1)
    gfx.fillEllipse(x, y + r * 0.1, bodyW, bodyH)

    // ลายสับปะรด — วาดเป็น X pattern ไม่ใช่ grid
    gfx.lineStyle(2, 0xaa7700, 0.9)
    // เส้นทแยงซ้าย → ขวา
    for (let i = -4; i <= 4; i++) {
        const offset = i * r * 0.22
        gfx.beginPath()
        gfx.moveTo(x - bodyW * 0.5, y + offset - bodyH * 0.1)
        gfx.lineTo(x + bodyW * 0.5, y + offset + bodyH * 0.1)
        gfx.strokePath()
    }
    // เส้นทแยงขวา → ซ้าย
    for (let i = -4; i <= 4; i++) {
        const offset = i * r * 0.22
        gfx.beginPath()
        gfx.moveTo(x + bodyW * 0.5, y + offset - bodyH * 0.1)
        gfx.lineTo(x - bodyW * 0.5, y + offset + bodyH * 0.1)
        gfx.strokePath()
    }

    // outline
    gfx.lineStyle(3, 0x996600, 1)
    gfx.strokeEllipse(x, y + r * 0.1, bodyW, bodyH)

    // highlight
    gfx.fillStyle(0xffffff, 0.15)
    gfx.fillEllipse(x - r * 0.2, y - r * 0.3, r * 0.5, r * 0.8)

    // ใบ — เรียบง่ายขึ้น
    const leafData = [
        { angle: -90, len: r * 0.95, w: 9 },
        { angle: -130, len: r * 0.75, w: 7 },
        { angle: -50,  len: r * 0.75, w: 7 },
        { angle: -155, len: r * 0.55, w: 5 },
        { angle: -25,  len: r * 0.55, w: 5 },
    ]
    const baseY = y - bodyH * 0.48
    leafData.forEach((leaf, i) => {
        const rad = Phaser.Math.DegToRad(leaf.angle)
        const ex  = x + Math.cos(rad) * leaf.len
        const ey  = baseY + Math.sin(rad) * leaf.len
        const col = i % 2 === 0 ? 0x2ecc2e : 0x22aa22
        gfx.fillStyle(col, 1)
        gfx.fillTriangle(
        x - leaf.w / 2, baseY,
        x + leaf.w / 2, baseY,
        ex, ey
        )
        // เส้นกลางใบ
        gfx.lineStyle(1, 0x116611, 1)
        gfx.beginPath()
        gfx.moveTo(x, baseY)
        gfx.lineTo(ex, ey)
        gfx.strokePath()
    })
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