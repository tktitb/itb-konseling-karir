import { APP_CONFIG } from "../constants/config"

const cache = new Map()
const CACHE_TTL_MS = 60000

function parseGvizJSON(text) {
  const marker = "google.visualization.Query.setResponse("
  const start = text.indexOf(marker)
  if (start === -1) {
    throw new Error("Respon GViz tidak valid")
  }
  const jsonStart = start + marker.length
  const jsonEnd = text.lastIndexOf(");")
  const jsonString = text.substring(jsonStart, jsonEnd)
  return JSON.parse(jsonString)
}

function tableToRowsObjects(gvizJson) {
  const rows = gvizJson?.table?.rows || []
  return rows.map((r, index) => {
    const rawVal = r.c?.[0]?.v ?? ""
    const fmtVal = r.c?.[0]?.f ?? ""
    const psychologist = (r.c?.[1]?.v ?? "").toString().trim()
    const mode = (r.c?.[2]?.v ?? "").toString().trim()
    const category = (r.c?.[3]?.v ?? "").toString().trim()
    const participant = (r.c?.[4]?.v ?? "").toString().trim()
    const status = (r.c?.[5]?.v ?? "").toString().trim()
    const isAvailable = !participant || participant.length === 0

    return {
      id: `${index}-${fmtVal}-${psychologist}`,
      datetimeRaw: rawVal,
      datetimeFmt: fmtVal,
      psychologist,
      mode,
      category,
      participant,
      status: isAvailable ? "Belum dimulai" : status || "Terpenuhi",
      isAvailable
    }
  })
}

export async function fetchMonthlySchedule(sheetName, forceRefresh = false) {
  const cleanSheetName = (sheetName || "").trim()
  if (!cleanSheetName) {
    return []
  }

  const cacheKey = `schedule_${cleanSheetName.toLowerCase()}`
  const now = Date.now()

  if (!forceRefresh && cache.has(cacheKey)) {
    const cachedItem = cache.get(cacheKey)
    if (now - cachedItem.timestamp < CACHE_TTL_MS) {
      return cachedItem.data
    }
  }

  const params = new URLSearchParams({
    tq: "SELECT A,B,C,D,E,F",
    headers: "1",
    tqx: "out:json",
    sheet: cleanSheetName
  })

  const url = `https://docs.google.com/spreadsheets/d/${APP_CONFIG.spreadsheetId}/gviz/tq?${params.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const text = await response.text()
    const json = parseGvizJSON(text)

    const actualSheetHeader = json.table?.cols?.[0]?.label || ""
    if (
      !text.toLowerCase().includes(cleanSheetName.toLowerCase()) &&
      actualSheetHeader.toLowerCase().includes("januari") &&
      cleanSheetName.toLowerCase() !== "januari"
    ) {
      cache.set(cacheKey, { timestamp: now, data: [] })
      return []
    }

    const items = tableToRowsObjects(json)
    cache.set(cacheKey, { timestamp: now, data: items })
    return items
  } catch (error) {
    return []
  }
}
