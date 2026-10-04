import { APP_CONFIG } from "../constants/config"

let feedbackCache = null
let feedbackCacheTime = 0
const CACHE_TTL_MS = 60000

function parseGvizJSON(text) {
  const marker = "google.visualization.Query.setResponse("
  const start = text.indexOf(marker)
  if (start === -1) {
    throw new Error("Respon GViz Feedback tidak valid")
  }
  const jsonStart = start + marker.length
  const jsonEnd = text.lastIndexOf(");")
  const jsonString = text.substring(jsonStart, jsonEnd)
  return JSON.parse(jsonString)
}

export async function fetchFeedback(forceRefresh = false) {
  const now = Date.now()

  if (!forceRefresh && feedbackCache && now - feedbackCacheTime < CACHE_TTL_MS) {
    return feedbackCache
  }

  const params = new URLSearchParams({
    tq: "SELECT A,B,C,F",
    headers: "1",
    tqx: "out:json",
    sheet: "Feedback"
  })

  const url = `https://docs.google.com/spreadsheets/d/${APP_CONFIG.spreadsheetId}/gviz/tq?${params.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const text = await response.text()
    const json = parseGvizJSON(text)
    const rows = json?.table?.rows || []

    const results = rows
      .map((r, idx) => {
        const name = (r.c?.[0]?.v ?? "").toString().trim()
        const feedback = (r.c?.[1]?.v ?? "").toString().trim()
        const category = (r.c?.[2]?.v ?? "").toString().trim()
        return {
          id: `fb-${idx}`,
          name: name || "Peserta Konseling",
          feedback,
          category: category || "Mahasiswa ITB"
        }
      })
      .filter(item => item.feedback.length > 5)

    feedbackCache = results
    feedbackCacheTime = now
    return results
  } catch (error) {
    return feedbackCache || []
  }
}
