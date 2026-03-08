import { initializeApp } from 'firebase/app'
import {
  getFirestore, doc, getDoc, setDoc,
  addDoc, collection, query, orderBy,
  limit, getDocs, increment, serverTimestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export async function getPlayer(username) {
  const ref = doc(db, 'players', username.toLowerCase())
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export async function getOrCreatePlayer(username) {
  const key = username.toLowerCase()
  let player = await getPlayer(key)
  if (!player) {
    player = {
      username: key,
      displayName: username,

      // แยก highScore A/B
      highScoreA: 0,
      highScoreB: 0,

      // แยก playCount A/B + รวม
      totalPlayCount: 0,
      playCountA: 0,
      playCountB: 0,

      // เวลาสะสม (วินาที) แยก A/B + รวม
      totalPlayTime: 0,
      playTimeA: 0,
      playTimeB: 0,

      createdAt: serverTimestamp()
    }
    await setDoc(doc(db, 'players', key), player)
  }
  return player
}

export async function saveSession(username, sessionData) {
  const key     = username.toLowerCase()
  const version = sessionData.version

  const sessionDoc = {
    score:         sessionData.score,
    sessionLength: sessionData.sessionLength,
    version:       version,
    timestamp:     serverTimestamp()
  }

  if (sessionData.enjoyment != null) {
    sessionDoc.enjoyment = sessionData.enjoyment
  }

  await addDoc(collection(db, 'players', key, 'sessions'), sessionDoc)

  const player     = await getPlayer(key)
  const updateData = {
    totalPlayCount: increment(1),
    totalPlayTime:  increment(sessionData.sessionLength),
  }

  if (version === 'A') {
    updateData.playCountA = increment(1)
    updateData.playTimeA  = increment(sessionData.sessionLength)
    if (sessionData.score > (player?.highScoreA || 0)) {
      updateData.highScoreA = sessionData.score
    }
    // ← enjoyment A อยู่ใน block A
    if (sessionData.enjoyment != null) {
      updateData.lastEnjoymentA = sessionData.enjoyment
    }
  } else {
    updateData.playCountB = increment(1)
    updateData.playTimeB  = increment(sessionData.sessionLength)
    if (sessionData.score > (player?.highScoreB || 0)) {
      updateData.highScoreB = sessionData.score
    }
    // ← enjoyment B อยู่ใน block B
    if (sessionData.enjoyment != null) {
      updateData.lastEnjoymentB = sessionData.enjoyment
    }
  }

  await setDoc(doc(db, 'players', key), updateData, { merge: true })
}

// Leaderboard แยกตาม version
export async function getLeaderboard(version = 'A', limitCount = 10) {
  const scoreField = version === 'A' ? 'highScoreA' : 'highScoreB'
  const q = query(
    collection(db, 'players'),
    orderBy(scoreField, 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d, i) => ({
    rank: i + 1,
    ...d.data(),
    highScore: d.data()[scoreField] || 0  // normalize ให้ LeaderboardScene ใช้ง่าย
  }))
}