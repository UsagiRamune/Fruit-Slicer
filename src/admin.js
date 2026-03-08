import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore'
import { db } from './firebase.js'

// ─── ตัวแปรอ้างอิง DOM ───
const playersTbody = document.getElementById('players-tbody');
const feedbacksContainer = document.getElementById('feedbacks-container');
const userModal = document.getElementById('user-modal');

// ─── 1. ระบบดึงข้อมูลผู้เล่น (Realtime) ───
function listenPlayers() {
  const q = query(collection(db, 'players'), orderBy('totalPlayCount', 'desc'));
  
  onSnapshot(q, (snap) => {
    let html = '';
    snap.forEach(documentSnap => {
      const p = documentSnap.data();
      const username = documentSnap.id; // ใช้ ID ของ doc เป็น username
      const timeTotal = `${Math.floor((p.totalPlayTime || 0)/60)}m ${ (p.totalPlayTime || 0)%60 }s`;
      
      html += `
        <tr>
          <td onclick="showUserDetail('${username}')" style="cursor:pointer; color:#00e5ff;">
            <strong>${p.displayName || username}</strong>
          </td>
          <td><span style="color:#9b59b6">${p.highScoreA || 0}</span> / <span style="color:#f1c40f">${p.highScoreB || 0}</span></td>
          <td>${p.totalPlayCount || 0} รอบ</td>
          <td>${timeTotal}</td>
          <td>
            <button onclick="deletePlayer('${username}')" 
              style="background:none; border:none; cursor:pointer; font-size:16px; filter: grayscale(1);"
              onmouseover="this.style.filter='none'" onmouseout="this.style.filter='grayscale(1)'">
              🗑️
            </button>
          </td>
        </tr>
      `;
    });
    playersTbody.innerHTML = html || '<tr><td colspan="5">ยังไม่มีข้อมูลผู้เล่น</td></tr>';
  });
}

// ─── 2. ระบบดึง Feedback (Realtime) ───
function listenFeedbacks() {
  const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
  
  onSnapshot(q, (snap) => {
    let html = '';
    snap.forEach(fDoc => {
      const d = fDoc.data();
      const fId = fDoc.id;
      
      html += `
        <div class="feedback-card" style="position:relative; border-bottom:1px solid #333; padding:15px; margin-bottom:10px; background:#1a1a2e; border-radius:8px;">
          <div style="font-size:12px; color:#888;">📅 ${d.timestamp?.toDate().toLocaleString('th-TH') || 'ไม่ทราบเวลา'}</div>
          <div style="margin:10px 0; font-size:16px; color:#fff;">"${d.message}"</div>
          
          <div style="display:flex; gap:10px;">
            <button class="tab-btn" style="padding:5px 10px; font-size:12px;" 
              onclick='console.table(${JSON.stringify(d.logs || [])})'>
              🐞 ดู Error Logs (F12)
            </button>
            
            <button onclick="deleteFeedback('${fId}')" 
              style="padding:5px 10px; font-size:12px; background:#ff4444; color:white; border:none; border-radius:4px; cursor:pointer;">
              🗑️ ลบฟีดแบค
            </button>
          </div>
        </div>
      `;
    });
    feedbacksContainer.innerHTML = html || '<p>ยังไม่มีใครบ่นอะไรในตอนนี้</p>';
  });
}

// ─── 3. ฟังก์ชันการลบข้อมูล (Global Functions) ───

window.deleteFeedback = async (id) => {
  if (confirm('จะลบฟีดแบคนี้ทิ้งจริงเหรอวะ?')) {
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      console.log("ลบฟีดแบคสำเร็จ");
    } catch (err) {
      alert("ลบไม่ได้! เช็ค Rule ใน Firebase หรือยัง?\n" + err.message);
    }
  }
};

window.deletePlayer = async (username) => {
  if (confirm(`มึงจะลบข้อมูลของ "${username}" ทั้งหมดเลยนะ? กู้คืนไม่ได้นะเว้ย!`)) {
    try {
      await deleteDoc(doc(db, 'players', username));
      console.log("ลบผู้เล่นสำเร็จ");
    } catch (err) {
      alert("ลบไม่สำเร็จ: " + err.message);
    }
  }
};

// ─── 4. เจาะดูรายละเอียดรายคน (Sessions) ───
window.showUserDetail = async function(username) {
  userModal.style.display = 'block';
  const historyDiv = document.getElementById('session-history');
  const title = document.getElementById('modal-title');
  
  historyDiv.innerHTML = '<p style="color:#ffdd00;">กำลังขุดคุ้ยข้อมูลเซสชัน...</p>';
  title.innerText = `ข้อมูลการเล่นของ: ${username}`;

  try {
    const sessionRef = collection(db, 'players', username, 'sessions');
    const q = query(sessionRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);

    let sessionHtml = '';
    snap.forEach(sDoc => {
      const s = sDoc.data();
      const versionBadge = s.version === 'B' ? 
        '<span style="background:#f1c40f; color:#000; padding:2px 5px; border-radius:4px; font-size:10px;">B (Juicy)</span>' : 
        '<span style="background:#9b59b6; color:#fff; padding:2px 5px; border-radius:4px; font-size:10px;">A (Minimal)</span>';
      
      sessionHtml += `
        <div class="session-card" style="background:#0d0d1a; padding:15px; margin-bottom:10px; border-radius:8px; border-left:4px solid #00e5ff;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:13px;">
            <div><strong>🕒 เวลา:</strong> ${s.timestamp?.toDate().toLocaleString('th-TH') || '-'}</div>
            <div><strong>🎮 โหมด:</strong> ${versionBadge}</div>
            <div style="color:#00ff88;"><strong>🏆 คะแนน:</strong> ${s.score}</div>
            <div><strong>⏱️ นาน:</strong> ${s.sessionLength}s</div>
            <div><strong>🍓 ฟันไป:</strong> ${s.fruitsSliced || 0}</div>
            <div><strong>🔥 Max Combo:</strong> ${s.maxCombo || 0}</div>
          </div>
        </div>`;
    });
    historyDiv.innerHTML = sessionHtml || '<p>ยังไม่มีประวัติการเล่นรายเซสชัน</p>';
  } catch (err) {
    historyDiv.innerHTML = '<p style="color:red;">โหลดข้อมูลล้มเหลว</p>';
    console.error(err);
  }
}

// ─── 5. ระบบสลับแท็บ ───
document.getElementById('btn-players').onclick = () => {
  document.getElementById('btn-players').classList.add('active'); 
  document.getElementById('btn-feedbacks').classList.remove('active');
  document.getElementById('tab-players').classList.add('active'); 
  document.getElementById('tab-feedbacks').classList.remove('active');
};
document.getElementById('btn-feedbacks').onclick = () => {
  document.getElementById('btn-feedbacks').classList.add('active'); 
  document.getElementById('btn-players').classList.remove('active');
  document.getElementById('tab-feedbacks').classList.add('active'); 
  document.getElementById('tab-players').classList.remove('active');
};

// 🚀 เริ่มทำงาน!
listenPlayers();
listenFeedbacks();