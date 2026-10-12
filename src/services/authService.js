import { supabase } from "./supabaseClient"
import { getSystemConfig, updateSystemConfig } from "./tktService"

const SESSION_STORAGE_KEY = "itbcc_tkt_admin_session_v2"
const LEGACY_LOGGED_KEY = "itbcc_tkt_admin_logged"
const LEGACY_USER_KEY = "itbcc_tkt_admin_user"
const RATE_LIMIT_STORAGE_KEY = "itbcc_tkt_admin_rate_limit_v2"
const PASSWORD_CACHE_KEY = "itbcc_tkt_admin_pwd_hash_cache"
const LOGOUT_BROADCAST_KEY = "itbcc_tkt_admin_logout_signal"

const AUTH_HASH_SALT_PREFIX = "ITBCC_TKT_AUTH_V2::"
const AUTH_HASH_SALT_SUFFIX = "::CAREER_CENTER_ITB"
const SESSION_SIGNING_SECRET = "ITBCC_TKT_SESSION_SIG_2026_9F4A2C"

export const MAX_LOGIN_ATTEMPTS = 5
const BASE_LOCKOUT_SECONDS = 60
const MAX_LOCKOUT_SECONDS = 900
const ATTEMPT_WINDOW_RESET_MS = 15 * 60 * 1000

const STANDARD_IDLE_TIMEOUT_MS = 30 * 60 * 1000
const STANDARD_ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000
const EXTENDED_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000
const EXTENDED_ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000

const INITIAL_SEED_MASK = 42
const INITIAL_SEED_BYTES = [94, 65, 94, 67, 94, 72, 73, 73, 24, 26, 24, 28]

const ADMIN_ACCOUNTS = {
  admin: {
    username: "admin",
    displayName: "Administrator TKT",
    role: "Super Admin"
  },
  "admin@itb.ac.id": {
    username: "admin@itb.ac.id",
    displayName: "Admin ITB Career Center",
    role: "Super Admin"
  },
  itbcc: {
    username: "itbcc",
    displayName: "Petugas ITB CC",
    role: "Admin Operasional"
  },
  "itbcc-admin": {
    username: "itbcc-admin",
    displayName: "Koordinator TKT ITB CC",
    role: "Super Admin"
  }
}

const reconstructInitialSeed = () =>
  String.fromCharCode(...INITIAL_SEED_BYTES.map((byteVal) => byteVal ^ INITIAL_SEED_MASK))

const bytesToHex = (byteArray) =>
  Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

const generateCsprngHex = (byteLength = 16) => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint8Array(byteLength)
    window.crypto.getRandomValues(buffer)
    return bytesToHex(buffer)
  }
  let fallback = ""
  for (let i = 0; i < byteLength * 2; i += 1) {
    fallback += Math.floor(Math.random() * 16).toString(16)
  }
  return fallback
}

const computeKeyedDigestSync = (input) => {
  const raw = `${SESSION_SIGNING_SECRET}::${input}::${SESSION_SIGNING_SECRET}`
  let h1 = 0xdeadbeef ^ raw.length
  let h2 = 0x41c6ce57 ^ raw.length
  let h3 = 0x811c9dc5 ^ raw.length
  let h4 = 0x9e3779b9 ^ raw.length

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
    h3 = Math.imul(h3 ^ ch, 16777619)
    h4 = Math.imul(h4 ^ ch, 2246822507)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909)
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909)

  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
    .map((n) => n.toString(16).padStart(8, "0"))
    .join("")
}

export const timingSafeEqual = (strA, strB) => {
  const a = String(strA || "")
  const b = String(strB || "")
  const maxLen = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < maxLen; i += 1) {
    const codeA = i < a.length ? a.charCodeAt(i) : 0
    const codeB = i < b.length ? b.charCodeAt(i) : 0
    diff |= codeA ^ codeB
  }
  return diff === 0
}

export const computeSaltedPasswordHash = async (rawPassword) => {
  const payload = `${AUTH_HASH_SALT_PREFIX}${String(rawPassword || "")}${AUTH_HASH_SALT_SUFFIX}`
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.subtle &&
    typeof TextEncoder !== "undefined"
  ) {
    const encoded = new TextEncoder().encode(payload)
    const digestBuffer = await window.crypto.subtle.digest("SHA-256", encoded)
    return bytesToHex(new Uint8Array(digestBuffer))
  }
  return `${computeKeyedDigestSync(payload)}${computeKeyedDigestSync(payload.split("").reverse().join(""))}`
}

const getDefaultSaltedPasswordHash = async () => {
  const seed = reconstructInitialSeed()
  return computeSaltedPasswordHash(seed)
}

const getBrowserContextFingerprint = () => {
  if (typeof window === "undefined") return "server"
  const ua = window.navigator?.userAgent || "unknown-ua"
  const lang = window.navigator?.language || "id"
  return `${ua.slice(0, 64)}|${lang}`
}

const computeSessionSignature = (sessionPayload) => {
  if (!sessionPayload || typeof sessionPayload !== "object") return ""
  const canonical = [
    sessionPayload.sessionId || "",
    sessionPayload.username || "",
    sessionPayload.displayName || "",
    sessionPayload.role || "",
    String(sessionPayload.issuedAt || 0),
    String(sessionPayload.expiresAt || 0),
    sessionPayload.extendedMode ? "1" : "0",
    getBrowserContextFingerprint()
  ].join("|")
  return computeKeyedDigestSync(canonical)
}

export const getLoginRateLimitState = () => {
  if (typeof window === "undefined") {
    return {
      isLocked: false,
      remainingSeconds: 0,
      failedAttempts: 0,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
      maxAttempts: MAX_LOGIN_ATTEMPTS
    }
  }

  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    if (!raw) {
      return {
        isLocked: false,
        remainingSeconds: 0,
        failedAttempts: 0,
        remainingAttempts: MAX_LOGIN_ATTEMPTS,
        maxAttempts: MAX_LOGIN_ATTEMPTS
      }
    }

    const parsed = JSON.parse(raw)
    const now = Date.now()
    const lockedUntil = Number(parsed.lockedUntil || 0)
    const lastFailedAt = Number(parsed.lastFailedAt || 0)
    let failedAttempts = Number(parsed.failedAttempts || 0)
    const lockLevel = Number(parsed.lockLevel || 0)

    if (lockedUntil > now) {
      const remainingSeconds = Math.max(1, Math.ceil((lockedUntil - now) / 1000))
      return {
        isLocked: true,
        remainingSeconds,
        failedAttempts,
        remainingAttempts: 0,
        maxAttempts: MAX_LOGIN_ATTEMPTS
      }
    }

    if (lockedUntil > 0 && lockedUntil <= now) {
      failedAttempts = 0
      window.localStorage.setItem(
        RATE_LIMIT_STORAGE_KEY,
        JSON.stringify({
          failedAttempts: 0,
          lockedUntil: 0,
          lockLevel,
          lastFailedAt
        })
      )
    } else if (lastFailedAt > 0 && now - lastFailedAt > ATTEMPT_WINDOW_RESET_MS) {
      failedAttempts = 0
      window.localStorage.removeItem(RATE_LIMIT_STORAGE_KEY)
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      failedAttempts,
      remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts),
      maxAttempts: MAX_LOGIN_ATTEMPTS
    }
  } catch {
    return {
      isLocked: false,
      remainingSeconds: 0,
      failedAttempts: 0,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
      maxAttempts: MAX_LOGIN_ATTEMPTS
    }
  }
}

const recordFailedLoginAttempt = () => {
  if (typeof window === "undefined") return getLoginRateLimitState()
  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const now = Date.now()
    const prevFailed =
      parsed.lastFailedAt && now - Number(parsed.lastFailedAt) <= ATTEMPT_WINDOW_RESET_MS
        ? Number(parsed.failedAttempts || 0)
        : 0
    const nextFailed = prevFailed + 1
    let lockLevel = Number(parsed.lockLevel || 0)
    let lockedUntil = 0

    if (nextFailed >= MAX_LOGIN_ATTEMPTS) {
      lockLevel += 1
      const lockoutSeconds = Math.min(
        MAX_LOCKOUT_SECONDS,
        BASE_LOCKOUT_SECONDS * Math.pow(2, Math.max(0, lockLevel - 1))
      )
      lockedUntil = now + lockoutSeconds * 1000
    }

    window.localStorage.setItem(
      RATE_LIMIT_STORAGE_KEY,
      JSON.stringify({
        failedAttempts: nextFailed,
        lockedUntil,
        lockLevel,
        lastFailedAt: now
      })
    )
  } catch {
    return getLoginRateLimitState()
  }
  return getLoginRateLimitState()
}

export const resetLoginRateLimit = () => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(RATE_LIMIT_STORAGE_KEY)
  } catch {
    return
  }
}

const resolveActivePasswordHash = async () => {
  const defaultHash = await getDefaultSaltedPasswordHash()
  try {
    const sysConfig = await getSystemConfig()
    const serverHash = String(sysConfig?.admin_password_hash || "").trim()
    if (serverHash && serverHash.length >= 32) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PASSWORD_CACHE_KEY, serverHash)
      }
      return serverHash
    }

    if (sysConfig && !serverHash) {
      updateSystemConfig({ admin_password_hash: defaultHash }).catch(() => null)
    }
  } catch {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem(PASSWORD_CACHE_KEY)
      if (cached && cached.length >= 32) return cached
    }
  }

  if (typeof window !== "undefined") {
    const cached = window.localStorage.getItem(PASSWORD_CACHE_KEY)
    if (cached && cached.length >= 32) return cached
  }
  return defaultHash
}

export const createAdminSession = ({ username, displayName, role, extendedMode = false }) => {
  if (typeof window === "undefined") return null
  const now = Date.now()
  const sessionId = generateCsprngHex(16)
  const absoluteTimeoutMs = extendedMode
    ? EXTENDED_ABSOLUTE_TIMEOUT_MS
    : STANDARD_ABSOLUTE_TIMEOUT_MS

  const sessionObj = {
    sessionId,
    username: String(username || "admin").toLowerCase().trim(),
    displayName: displayName || "Administrator TKT",
    role: role || "Super Admin",
    issuedAt: now,
    lastActivityAt: now,
    expiresAt: now + absoluteTimeoutMs,
    extendedMode: Boolean(extendedMode)
  }

  sessionObj.signature = computeSessionSignature(sessionObj)
  const serialized = JSON.stringify(sessionObj)

  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized)
    window.localStorage.setItem(SESSION_STORAGE_KEY, serialized)
    window.sessionStorage.setItem(LEGACY_LOGGED_KEY, "true")
    window.sessionStorage.setItem(LEGACY_USER_KEY, sessionObj.displayName)
  } catch {
    return sessionObj
  }

  return sessionObj
}

export const clearAdminSession = (broadcastLogout = false) => {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    window.sessionStorage.removeItem(LEGACY_LOGGED_KEY)
    window.sessionStorage.removeItem(LEGACY_USER_KEY)
    if (broadcastLogout) {
      window.localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()))
    }
  } catch {
    return
  }
}

export const verifyAdminSession = () => {
  if (typeof window === "undefined") {
    return { valid: false, reason: "unauthenticated", session: null }
  }

  try {
    const rawSession =
      window.sessionStorage.getItem(SESSION_STORAGE_KEY) ||
      window.localStorage.getItem(SESSION_STORAGE_KEY)

    if (!rawSession) {
      if (window.sessionStorage.getItem(LEGACY_LOGGED_KEY)) {
        clearAdminSession(false)
      }
      return { valid: false, reason: "unauthenticated", session: null }
    }

    const session = JSON.parse(rawSession)
    if (
      !session ||
      typeof session !== "object" ||
      typeof session.sessionId !== "string" ||
      !/^[0-9a-f]{32}$/i.test(session.sessionId) ||
      !session.username ||
      !session.signature
    ) {
      clearAdminSession(false)
      return { valid: false, reason: "invalid_token", session: null }
    }

    const expectedSignature = computeSessionSignature(session)
    if (!timingSafeEqual(session.signature, expectedSignature)) {
      clearAdminSession(false)
      return { valid: false, reason: "tampered_token", session: null }
    }

    const now = Date.now()
    const expiresAt = Number(session.expiresAt || 0)
    const lastActivityAt = Number(session.lastActivityAt || session.issuedAt || 0)
    const idleTimeoutMs = session.extendedMode
      ? EXTENDED_IDLE_TIMEOUT_MS
      : STANDARD_IDLE_TIMEOUT_MS

    if (now >= expiresAt) {
      clearAdminSession(false)
      return { valid: false, reason: "session_expired", session: null }
    }

    if (now - lastActivityAt >= idleTimeoutMs) {
      clearAdminSession(false)
      return { valid: false, reason: "idle_timeout", session: null }
    }

    if (!window.sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      window.sessionStorage.setItem(LEGACY_LOGGED_KEY, "true")
      window.sessionStorage.setItem(LEGACY_USER_KEY, session.displayName || session.username)
    }

    return {
      valid: true,
      reason: null,
      session
    }
  } catch {
    clearAdminSession(false)
    return { valid: false, reason: "corrupted_session", session: null }
  }
}

export const touchAdminSessionActivity = () => {
  const check = verifyAdminSession()
  if (!check.valid || !check.session || typeof window === "undefined") return false

  const now = Date.now()
  if (now - Number(check.session.lastActivityAt || 0) < 20 * 1000) {
    return true
  }

  const updatedSession = {
    ...check.session,
    lastActivityAt: now
  }
  updatedSession.signature = computeSessionSignature(updatedSession)
  const serialized = JSON.stringify(updatedSession)

  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized)
    window.localStorage.setItem(SESSION_STORAGE_KEY, serialized)
  } catch {
    return true
  }
  return true
}

export const authenticateAdmin = async ({ username, password, extendedMode = false }) => {
  const rateState = getLoginRateLimitState()
  if (rateState.isLocked) {
    return {
      success: false,
      locked: true,
      remainingSeconds: rateState.remainingSeconds,
      error: `Terlalu banyak percobaan gagal. Silakan tunggu ${rateState.remainingSeconds} detik sebelum mencoba kembali.`
    }
  }

  const normalizedUser = String(username || "")
    .trim()
    .toLowerCase()
  const rawPass = String(password || "")

  if (!normalizedUser || !rawPass) {
    return {
      success: false,
      locked: false,
      error: "ID Pengguna dan Kata Sandi wajib diisi."
    }
  }

  const matchedAccount = ADMIN_ACCOUNTS[normalizedUser] || null
  const [candidateHash, targetHash] = await Promise.all([
    computeSaltedPasswordHash(rawPass),
    resolveActivePasswordHash()
  ])

  const isHashMatch = timingSafeEqual(candidateHash, targetHash)

  if (matchedAccount && isHashMatch) {
    resetLoginRateLimit()
    const session = createAdminSession({
      username: matchedAccount.username,
      displayName: matchedAccount.displayName,
      role: matchedAccount.role,
      extendedMode
    })
    return {
      success: true,
      session
    }
  }

  if (normalizedUser.includes("@")) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedUser,
        password: rawPass
      })
      if (!error && data?.user) {
        resetLoginRateLimit()
        const session = createAdminSession({
          username: data.user.email || normalizedUser,
          displayName: data.user.user_metadata?.full_name || "Admin ITB Career Center",
          role: "Super Admin",
          extendedMode
        })
        return {
          success: true,
          session
        }
      }
    } catch {
      void 0
    }
  }

  const updatedRate = recordFailedLoginAttempt()
  if (updatedRate.isLocked) {
    return {
      success: false,
      locked: true,
      remainingSeconds: updatedRate.remainingSeconds,
      remainingAttempts: 0,
      error: `Batas percobaan login terlampaui. Akses dikunci sementara selama ${updatedRate.remainingSeconds} detik demi keamanan.`
    }
  }

  return {
    success: false,
    locked: false,
    remainingAttempts: updatedRate.remainingAttempts,
    error: `ID Pengguna atau Kata Sandi yang Anda masukkan tidak sesuai. (Sisa percobaan: ${updatedRate.remainingAttempts}x)`
  }
}

export const logoutAdminSession = async () => {
  clearAdminSession(true)
  try {
    await supabase.auth.signOut()
  } catch {
    return
  }
}

export const changeAdminPassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  const sessionCheck = verifyAdminSession()
  if (!sessionCheck.valid) {
    return {
      success: false,
      error: "Sesi Anda telah berakhir. Silakan login kembali terlebih dahulu."
    }
  }

  const curr = String(currentPassword || "")
  const next = String(newPassword || "")
  const conf = String(confirmPassword || "")

  if (!curr || !next || !conf) {
    return {
      success: false,
      error: "Seluruh kolom kata sandi wajib diisi."
    }
  }

  if (next.length < 8) {
    return {
      success: false,
      error: "Kata sandi baru minimal harus terdiri dari 8 karakter."
    }
  }

  if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
    return {
      success: false,
      error: "Kata sandi baru wajib mengandung kombinasi huruf dan angka."
    }
  }

  if (next !== conf) {
    return {
      success: false,
      error: "Konfirmasi kata sandi baru tidak cocok."
    }
  }

  const [currHash, activeHash] = await Promise.all([
    computeSaltedPasswordHash(curr),
    resolveActivePasswordHash()
  ])

  if (!timingSafeEqual(currHash, activeHash)) {
    return {
      success: false,
      error: "Kata sandi saat ini yang Anda masukkan tidak sesuai."
    }
  }

  const nextHash = await computeSaltedPasswordHash(next)
  if (timingSafeEqual(currHash, nextHash)) {
    return {
      success: false,
      error: "Kata sandi baru tidak boleh sama dengan kata sandi lama."
    }
  }

  await updateSystemConfig({
    admin_password_hash: nextHash,
    admin_password_updated_at: new Date().toISOString()
  })

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PASSWORD_CACHE_KEY, nextHash)
    } catch {
      void 0
    }
  }

  touchAdminSessionActivity()
  return {
    success: true
  }
}

export const subscribeAdminAuthSync = (onSessionInvalidated) => {
  if (typeof window === "undefined") return () => {}

  const handleStorageChange = (event) => {
    if (
      event.key === LOGOUT_BROADCAST_KEY ||
      (event.key === SESSION_STORAGE_KEY && !event.newValue)
    ) {
      clearAdminSession(false)
      if (typeof onSessionInvalidated === "function") {
        onSessionInvalidated("logged_out")
      }
    }
  }

  window.addEventListener("storage", handleStorageChange)
  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}
