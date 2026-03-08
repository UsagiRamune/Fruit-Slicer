import { initializeApp } from 'firebase/app'
import {
  getFirestore, doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, orderBy, limit,
  increment, serverTimestamp
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
const db  = getFirestore(app)

// ─────────────────────────────────────────────
//  GET PLAYER
// ─────────────────────────────────────────────
export async function getPlayer(username) {
  const ref  = doc(db, 'players', username)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// ─────────────────────────────────────────────
//  GET OR CREATE PLAYER
// ─────────────────────────────────────────────
export async function getOrCreatePlayer(username) {
  const ref  = doc(db, 'players', username)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const data = {
      username,
      displayName: username,
      // High scores
      highScoreA: 0,
      highScoreB: 0,
      // Play counts
      playCountA: 0,
      playCountB: 0,
      totalPlayCount: 0,
      // Play time (seconds)
      playTimeA: 0,
      playTimeB: 0,
      totalPlayTime: 0,
      // Enjoyment
      lastEnjoymentA: null,
      lastEnjoymentB: null,
      // POI bests
      bestMaxComboA: 0,
      bestMaxComboB: 0,
      bestFruitsSlicedA: 0,
      bestFruitsSlicedB: 0,
      createdAt: serverTimestamp(),
    }
    await setDoc(ref, data)
    return data
  }
  return snap.data()
}

// ─────────────────────────────────────────────
//  SAVE SESSION
//  poi: { timeToFirstSlice, maxCombo, fruitsSliced, bestStreak }
// ─────────────────────────────────────────────
export async function saveSession(username, {
  score, sessionLength, enjoyment, version,
  poi = {}
}) {
  const playerRef = doc(db, 'players', username)
  const snap      = await getDoc(playerRef)
  if (!snap.exists()) return

  const player = snap.data()
  const v      = version // 'A' or 'B'

  // ── session document ──────────────────────
  const sessionData = {
    version,
    score,
    sessionLength,          // วินาที
    enjoyment: enjoyment ?? null,
    timestamp: serverTimestamp(),

    // POI
    timeToFirstSlice: poi.timeToFirstSlice ?? null,  // ms
    maxCombo:         poi.maxCombo         ?? 0,
    fruitsSliced:     poi.fruitsSliced     ?? 0,
    bestStreak:       poi.bestStreak       ?? 0,
  }

  const sessionsRef = collection(db, 'players', username, 'sessions')
  await addDoc(sessionsRef, sessionData)

  // ── update player summary ─────────────────
  const updates = {
    [`playCount${v}`]:    increment(1),
    [`playTime${v}`]:     increment(sessionLength),
    totalPlayCount:       increment(1),
    totalPlayTime:        increment(sessionLength),
  }

  // highScore per version
  const hsKey = `highScore${v}`
  if (score > (player[hsKey] || 0)) {
    updates[hsKey] = score
  }

  // enjoyment
  if (enjoyment != null) {
    updates[`lastEnjoyment${v}`] = enjoyment
  }

  // POI bests
  const comboKey   = `bestMaxCombo${v}`
  const fruitsKey  = `bestFruitsSliced${v}`
  if ((poi.maxCombo    || 0) > (player[comboKey]  || 0)) updates[comboKey]  = poi.maxCombo
  if ((poi.fruitsSliced|| 0) > (player[fruitsKey] || 0)) updates[fruitsKey] = poi.fruitsSliced

  await updateDoc(playerRef, updates)
}

// ─────────────────────────────────────────────
//  GET LEADERBOARD
// ─────────────────────────────────────────────
export async function getLeaderboard(version = 'A', limitCount = 10) {
  const field = `highScore${version}`
  const q     = query(
    collection(db, 'players'),
    orderBy(field, 'desc'),
    limit(limitCount)
  )
  const snap  = await getDocs(q)
  return snap.docs.map((d, i) => ({
    rank:         i + 1,
    username:     d.data().username,
    displayName:  d.data().displayName || d.data().username,
    score:        d.data()[field] || 0,
    playCount:    d.data()[`playCount${version}`] || 0,
    bestMaxCombo: d.data()[`bestMaxCombo${version}`] || 0,
    bestFruits:   d.data()[`bestFruitsSliced${version}`] || 0,
  }))
}

// ─────────────────────────────────────────────
//  GET PLAYER SESSIONS (for history view)
// ─────────────────────────────────────────────
export async function getPlayerSessions(username, limitCount = 20) {
  const q    = query(
    collection(db, 'players', username, 'sessions'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d, i) => ({ id: d.id, ...d.data() }))
}