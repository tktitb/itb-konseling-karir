const INDO_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
]

const INDO_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des"
]

const INDO_MONTHS_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
]

export function parseDateFromFmt(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    return null
  }

  const parts = dateStr.trim().split(" ")
  if (!parts[0]) {
    return null
  }

  const dateSub = parts[0].split("/")
  if (dateSub.length !== 3) {
    return null
  }

  const day = parseInt(dateSub[0], 10)
  const month = parseInt(dateSub[1], 10)
  const year = parseInt(dateSub[2], 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null
  }

  let hours = 0
  let minutes = 0
  let seconds = 0

  if (parts[1]) {
    const timeSub = parts[1].split(":")
    hours = parseInt(timeSub[0], 10) || 0
    minutes = parseInt(timeSub[1], 10) || 0
    seconds = parseInt(timeSub[2], 10) || 0
  }

  return new Date(year, month - 1, day, hours, minutes, seconds)
}

export function formatDatetimeText(formattedString) {
  if (!formattedString) {
    return "-"
  }

  const dateObj = parseDateFromFmt(formattedString)
  if (!dateObj || isNaN(dateObj.getTime())) {
    return formattedString
  }

  const dayName = INDO_DAYS[dateObj.getDay()]
  const dayNum = String(dateObj.getDate()).padStart(2, "0")
  const monthName = INDO_MONTHS_SHORT[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  const hours = String(dateObj.getHours()).padStart(2, "0")
  const minutes = String(dateObj.getMinutes()).padStart(2, "0")

  return `${dayName}, ${dayNum} ${monthName} ${year}, ${hours}:${minutes}`
}

export function getDayName(formattedString) {
  if (!formattedString) {
    return ""
  }

  const dateObj = parseDateFromFmt(formattedString)
  if (!dateObj || isNaN(dateObj.getTime())) {
    return ""
  }

  return INDO_DAYS[dateObj.getDay()]
}

export function getDateDetails(formattedString) {
  const dateObj = parseDateFromFmt(formattedString)
  if (!dateObj || isNaN(dateObj.getTime())) {
    return {
      dayName: "",
      dayNumber: "",
      monthName: "",
      year: "",
      time: ""
    }
  }

  return {
    dayName: INDO_DAYS[dateObj.getDay()],
    dayNumber: String(dateObj.getDate()).padStart(2, "0"),
    monthName: INDO_MONTHS_SHORT[dateObj.getMonth()],
    year: String(dateObj.getFullYear()),
    time: `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`
  }
}

export function getCurrentMonthName() {
  const now = new Date()
  return INDO_MONTHS_FULL[now.getMonth()]
}

export function getCurrentMonthIndex() {
  return new Date().getMonth()
}
