import { APP_CONFIG } from "../constants/config"

const cache = new Map()
const CACHE_TTL_MS = 60000

const MONTH_INDEX_MAP = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11
}

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

function tableToRowsObjects(gvizJson, targetMonthIdx) {
  const rows = gvizJson?.table?.rows || []
  const result = []

  for (let index = 0; index < rows.length; index++) {
    const r = rows[index]
    const rawVal = r.c?.[0]?.v ?? ""
    const fmtVal = (r.c?.[0]?.f ?? "").toString().trim()
    const psychologist = (r.c?.[1]?.v ?? "").toString().trim()
    const mode = (r.c?.[2]?.v ?? "").toString().trim()
    const category = (r.c?.[3]?.v ?? "").toString().trim()
    const participant = (r.c?.[4]?.v ?? "").toString().trim()
    const status = (r.c?.[5]?.v ?? "").toString().trim()
    const isAvailable = !participant || participant.length === 0

    if (psychologist !== "Bu Lina" && psychologist !== "Bu Sito") {
      continue
    }

    if (typeof targetMonthIdx === "number" && targetMonthIdx >= 0 && fmtVal) {
      const dateParts = fmtVal.split(" ")[0].split("/")
      if (dateParts.length === 3) {
        const rowMonth = parseInt(dateParts[1], 10) - 1
        if (rowMonth !== targetMonthIdx) {
          continue
        }
      }
    }

    result.push({
      id: `${index}-${fmtVal}-${psychologist}`,
      datetimeRaw: rawVal,
      datetimeFmt: fmtVal,
      psychologist,
      mode,
      category,
      participant,
      status: isAvailable ? "Belum dimulai" : status || "Terpenuhi",
      isAvailable
    })
  }

  return result
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

    const targetMonthIdx = MONTH_INDEX_MAP[cleanSheetName.toLowerCase()]
    const items = tableToRowsObjects(json, targetMonthIdx)
    cache.set(cacheKey, { timestamp: now, data: items })
    return items
  } catch {
    return []
  }
}
