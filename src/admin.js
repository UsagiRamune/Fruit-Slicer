import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { db } from './firebase.js'

// ─── ตัวแปรอ้างอิง DOM ───
const playersTbody = document.getElementById('players-tbody');
const feedbacksContainer = document.getElementById('feedbacks-container');
const userModal = document.getElementById('user-modal');

// ─── ตัวแปรเก็บข้อมูลเพื่อเอามา Sort & Export ───
let playersData = [];
let currentSort = 'playCountDesc';
let currentUserForExport = ""; 

// ==========================================
// 1. ระบบผู้เล่น (ดึง Realtime & เก็บเข้า Array)
// ==========================================
function listenPlayers() {
  const q = query(collection(db, 'players')); 
  
  onSnapshot(q, (snap) => {
    playersData = [];
    snap.forEach(documentSnap => {
      playersData.push({ id: documentSnap.id, ...documentSnap.data() });
    });
    renderPlayers(); 
  });
}

// ==========================================
// 2. ฟังก์ชันวาดตารางและเรียงข้อมูล (Sorting)
// ==========================================
function renderPlayers() {
  let sorted = [...playersData];
  
  if (currentSort === 'playCountDesc') {
    sorted.sort((a, b) => (b.totalPlayCount || 0) - (a.totalPlayCount || 0));
  } else if (currentSort === 'scoreBDesc') {
    sorted.sort((a, b) => (b.highScoreB || 0) - (a.highScoreB || 0));
  } else if (currentSort === 'scoreADesc') {
    sorted.sort((a, b) => (b.highScoreA || 0) - (a.highScoreA || 0));
  } else if (currentSort === 'dateDesc') {
    sorted.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  }

  let html = '';
  sorted.forEach(p => {
    const timeTotal = `${Math.floor((p.totalPlayTime || 0)/60)}m ${ (p.totalPlayTime || 0)%60 }s`;
    const regDate = p.createdAt ? p.createdAt.toDate().toLocaleDateString('th-TH') : '-';
    
    // ดึงค่าความสนุกภาคล่าสุดออกมาโชว์
    const enjoyA = p.lastEnjoymentA || '-';
    const enjoyB = p.lastEnjoymentB || '-';

    html += `
      <tr class="player-row" onclick="showUserDetail('${p.id}')">
        <td style="color:#00e5ff;"><strong>${p.displayName || p.id}</strong></td>
        <td><span style="color:#9b59b6">${p.highScoreA || 0}</span> / <span style="color:#f1c40f">${p.highScoreB || 0}</span></td>
        <td>${p.totalPlayCount || 0} รอบ</td>
        <td>${timeTotal}</td>
        <td><span style="color:#9b59b6">${enjoyA}</span> / <span style="color:#f1c40f">${enjoyB}</span></td>
        <td style="color:#888;">${regDate}</td>
        <td>
          <button onclick="event.stopPropagation(); deletePlayer('${p.id}')" 
            style="background:none; border:none; cursor:pointer; font-size:18px; filter: grayscale(1);"
            onmouseover="this.style.filter='none'" onmouseout="this.style.filter='grayscale(1)'" title="ลบผู้เล่นนี้">
            🗑️
          </button>
        </td>
      </tr>
    `;
  });
  playersTbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center;">ยังไม่มีข้อมูล</td></tr>';
}

document.getElementById('sort-players').addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderPlayers();
});

// ==========================================
// 3. ระบบดึง Feedback (Realtime)
// ==========================================
function listenFeedbacks() {
  const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
  onSnapshot(q, (snap) => {
    let html = '';
    snap.forEach(fDoc => {
      const d = fDoc.data();
      html += `
        <div style="background:#1a1a2e; padding:15px; margin-bottom:10px; border-radius:8px; border-left:4px solid #ff4488; position:relative;">
          <div style="font-size:12px; color:#888;">📅 ${d.timestamp?.toDate().toLocaleString('th-TH') || 'ไม่ทราบเวลา'}</div>
          <div style="margin:10px 0; font-size:16px;">"${d.message}"</div>
          <button onclick='console.table(${JSON.stringify(d.logs || [])})' style="padding:5px 10px; font-size:12px; background:#333; color:white; border:none; border-radius:4px; cursor:pointer;">🐞 ดู Error Logs (F12)</button>
          <button onclick="deleteFeedback('${fDoc.id}')" style="position:absolute; top:15px; right:15px; padding:5px 10px; font-size:12px; background:#ff4444; color:white; border:none; border-radius:4px; cursor:pointer;">🗑️ ลบฟีดแบค</button>
        </div>
      `;
    });
    feedbacksContainer.innerHTML = html || '<p>ไม่มีบัคโว้ยยย</p>';
  });
}

// ==========================================
// 4. ฟังก์ชันจัดการข้อมูล (ลบ & ดูรายละเอียด)
// ==========================================
window.deleteFeedback = async (id) => {
  if (confirm('จะลบฟีดแบคนี้ทิ้งจริงเหรอวะ?')) {
    await deleteDoc(doc(db, 'feedbacks', id));
  }
};

window.deletePlayer = async (username) => {
  if (confirm(`มึงจะลบข้อมูลของ "${username}" ทั้งหมดเลยนะ? กู้ไม่ได้นะ! \n(ปล. Sessions ของ user นี้จะยังค้างอยู่ในฐานข้อมูล)`)) {
    await deleteDoc(doc(db, 'players', username));
  }
};

window.showUserDetail = async function(username) {
  currentUserForExport = username; 
  userModal.style.display = 'block';
  const historyDiv = document.getElementById('session-history');
  document.getElementById('modal-title').innerText = `ข้อมูลการเล่นของ: ${username}`;
  historyDiv.innerHTML = '<p style="color:#ffdd00;">กำลังดึงข้อมูลเซสชัน...</p>';

  try {
    const snap = await getDocs(query(collection(db, 'players', username, 'sessions'), orderBy('timestamp', 'desc')));
    let sessionHtml = '';
    snap.forEach(sDoc => {
      const s = sDoc.data();
      const vBadge = s.version === 'B' ? '<span style="color:#000; background:#f1c40f; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">B (Juicy)</span>' : '<span style="color:#fff; background:#9b59b6; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">A (Minimal)</span>';
      
      // 🌟 เพิ่มฟิลด์ Enjoyment ลงไปตรงนี้ ปรับกริดเป็น 4 คอลัมน์ 🌟
      sessionHtml += `
        <div class="session-card" style="background:#0d0d1a; padding:15px; border-radius:8px; margin-bottom:10px; border-left:4px solid #00e5ff; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 13px;">
          <div><strong>🕒 เวลา:</strong><br>${s.timestamp?.toDate().toLocaleString('th-TH') || '-'}</div>
          <div><strong>🎮 โหมด:</strong><br>${vBadge}</div>
          <div style="color:#00ff88;"><strong>🏆 คะแนน:</strong><br><span style="font-size:16px; font-weight:bold;">${s.score}</span></div>
          <div><strong>⏱️ นาน:</strong><br>${s.sessionLength}s</div>
          <div><strong>🍓 ฟันไป:</strong><br>${s.fruitsSliced || 0} ลูก</div>
          <div><strong>🔥 Max Combo:</strong><br>${s.maxCombo || 0}x</div>
          <div style="color:#ff4488;"><strong>😊 Enjoy:</strong><br>${s.enjoyment || '-'}</div>
        </div>`;
    });
    historyDiv.innerHTML = sessionHtml || '<p>ยังไม่มีประวัติการเล่นรายรอบ</p>';
  } catch (err) { historyDiv.innerHTML = '<p style="color:red;">โหลดล้มเหลว</p>'; }
}

// ==========================================
// 5. ระบบ Export เป็นไฟล์ CSV
// ==========================================
function downloadCSV(csvContent, filename) {
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const btnExportSummary = document.getElementById('btn-export-csv');
if(btnExportSummary) {
  btnExportSummary.addEventListener('click', () => {
    if (playersData.length === 0) return alert('ไม่มีข้อมูลให้โหลดว่ะเพื่อน!');

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "Username,Display Name,High Score A,High Score B,Total Plays,Total Time (s),Last Enjoyment A,Last Enjoyment B,Registered At\n";

    playersData.forEach(p => {
      const regDate = p.createdAt ? p.createdAt.toDate().toLocaleString('th-TH') : '';
      const row = [ p.id, p.displayName || p.id, p.highScoreA || 0, p.highScoreB || 0, p.totalPlayCount || 0, p.totalPlayTime || 0, p.lastEnjoymentA || '-', p.lastEnjoymentB || '-', regDate ].map(e => `"${e}"`).join(",");
      csvContent += row + "\n";
    });
    downloadCSV(csvContent, `fruit_slicer_summary_${new Date().getTime()}.csv`);
  });
}

const btnExportAll = document.getElementById('btn-export-all-sessions');
if(btnExportAll) {
  btnExportAll.addEventListener('click', async () => {
    if (playersData.length === 0) return alert('ไม่มีข้อมูลเลยว่ะ!');
    btnExportAll.innerText = "⏳ กำลังกวาดข้อมูล...";
    btnExportAll.disabled = true;

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "Username,Display Name,Session Date,Version,Score,Session Length (s),Fruits Sliced,Max Combo,Enjoyment\n";

    try {
      for (const p of playersData) {
        const snap = await getDocs(query(collection(db, 'players', p.id, 'sessions'), orderBy('timestamp', 'desc')));
        snap.forEach(sDoc => {
          const s = sDoc.data();
          const sDate = s.timestamp ? s.timestamp.toDate().toLocaleString('th-TH') : '';
          const row = [ p.id, p.displayName || p.id, sDate, s.version || '', s.score || 0, s.sessionLength || 0, s.fruitsSliced || 0, s.maxCombo || 0, s.enjoyment || '' ].map(e => `"${e}"`).join(",");
          csvContent += row + "\n";
        });
      }
      downloadCSV(csvContent, `all_sessions_kpi_${new Date().getTime()}.csv`);
    } catch (err) { alert("เกิดข้อผิดพลาดตอนดึงข้อมูลว่ะ"); }

    btnExportAll.innerText = "📥 โหลด All Sessions (แบบละเอียด)";
    btnExportAll.disabled = false;
  });
}

const btnExportUser = document.getElementById('btn-export-user');
if(btnExportUser) {
  btnExportUser.addEventListener('click', async () => {
    if (!currentUserForExport) return;
    btnExportUser.innerText = "⏳ กำลังโหลด...";
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "Session Date,Version,Score,Session Length (s),Fruits Sliced,Max Combo,Enjoyment\n";

    try {
      const snap = await getDocs(query(collection(db, 'players', currentUserForExport, 'sessions'), orderBy('timestamp', 'desc')));
      snap.forEach(sDoc => {
        const s = sDoc.data();
        const sDate = s.timestamp ? s.timestamp.toDate().toLocaleString('th-TH') : '';
        const row = [ sDate, s.version || '', s.score || 0, s.sessionLength || 0, s.fruitsSliced || 0, s.maxCombo || 0, s.enjoyment || '' ].map(e => `"${e}"`).join(",");
        csvContent += row + "\n";
      });
      downloadCSV(csvContent, `player_${currentUserForExport}_sessions.csv`);
    } catch (err) { console.error(err); }
    
    btnExportUser.innerText = "📥 โหลดข้อมูลคนนี้ (CSV)";
  });
}

// ==========================================
// 6. ระบบสลับแท็บ
// ==========================================
document.getElementById('btn-players').onclick = () => {
  document.getElementById('btn-players').classList.add('active'); document.getElementById('btn-feedbacks').classList.remove('active');
  document.getElementById('tab-players').classList.add('active'); document.getElementById('tab-feedbacks').classList.remove('active');
};
document.getElementById('btn-feedbacks').onclick = () => {
  document.getElementById('btn-feedbacks').classList.add('active'); document.getElementById('btn-players').classList.remove('active');
  document.getElementById('tab-feedbacks').classList.add('active'); document.getElementById('tab-players').classList.remove('active');
};

// เริ่มต้นทำงาน!
listenPlayers();
listenFeedbacks();