const VERSION_TABLE_LEVEL_M = [
  null,
  { totalCodewords: 26, ecCodewordsPerBlock: 10, blocksGroup1: 1, dataPerBlock1: 16, blocksGroup2: 0, dataPerBlock2: 0, align: [] },
  { totalCodewords: 44, ecCodewordsPerBlock: 16, blocksGroup1: 1, dataPerBlock1: 28, blocksGroup2: 0, dataPerBlock2: 0, align: [6, 18] },
  { totalCodewords: 70, ecCodewordsPerBlock: 26, blocksGroup1: 1, dataPerBlock1: 44, blocksGroup2: 0, dataPerBlock2: 0, align: [6, 22] },
  { totalCodewords: 100, ecCodewordsPerBlock: 18, blocksGroup1: 2, dataPerBlock1: 32, blocksGroup2: 0, dataPerBlock2: 0, align: [6, 26] },
  { totalCodewords: 134, ecCodewordsPerBlock: 24, blocksGroup1: 2, dataPerBlock1: 43, blocksGroup2: 0, dataPerBlock2: 0, align: [6, 30] },
  { totalCodewords: 172, ecCodewordsPerBlock: 16, blocksGroup1: 4, dataPerBlock1: 27, blocksGroup2: 0, dataPerBlock2: 0, align: [6, 34] },
  { totalCodewords: 196, ecCodewordsPerBlock: 18, blocksGroup1: 4, dataPerBlock1: 31, blocksGroup2: 0, dataPerBlock2: 0, align: [6, 22, 38] },
  { totalCodewords: 242, ecCodewordsPerBlock: 22, blocksGroup1: 2, dataPerBlock1: 38, blocksGroup2: 2, dataPerBlock2: 39, align: [6, 24, 42] },
  { totalCodewords: 292, ecCodewordsPerBlock: 22, blocksGroup1: 3, dataPerBlock1: 36, blocksGroup2: 2, dataPerBlock2: 37, align: [6, 26, 46] },
  { totalCodewords: 346, ecCodewordsPerBlock: 26, blocksGroup1: 4, dataPerBlock1: 43, blocksGroup2: 1, dataPerBlock2: 44, align: [6, 28, 50] }
]

const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100) {
      x ^= 0x11d
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255]
  }
})()

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0
  return GF_EXP[GF_LOG[a] + GF_LOG[b]]
}

function buildReedSolomonDivisor(degree) {
  let result = new Uint8Array(degree)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root)
      if (j + 1 < degree) {
        result[j] ^= result[j + 1]
      }
    }
    root = gfMul(root, 0x02)
  }
  return result
}

function computeReedSolomonRemainder(data, degree) {
  const divisor = buildReedSolomonDivisor(degree)
  const result = new Uint8Array(degree)
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0]
    for (let j = 0; j < degree - 1; j++) {
      result[j] = result[j + 1] ^ gfMul(divisor[j], factor)
    }
    result[degree - 1] = gfMul(divisor[degree - 1], factor)
  }
  return result
}

function appendBits(bitArray, value, bitLength) {
  for (let i = bitLength - 1; i >= 0; i--) {
    bitArray.push((value >>> i) & 1)
  }
}

function selectVersion(byteLength) {
  for (let v = 1; v <= 10; v++) {
    const info = VERSION_TABLE_LEVEL_M[v]
    const totalDataCodewords =
      info.blocksGroup1 * info.dataPerBlock1 + info.blocksGroup2 * info.dataPerBlock2
    const countBits = v <= 9 ? 8 : 16
    const maxBytes = Math.floor((totalDataCodewords * 8 - 4 - countBits) / 8)
    if (byteLength <= maxBytes) {
      return v
    }
  }
  return 10
}

function encodeCodewords(utf8Bytes, version) {
  const info = VERSION_TABLE_LEVEL_M[version]
  const totalDataCodewords =
    info.blocksGroup1 * info.dataPerBlock1 + info.blocksGroup2 * info.dataPerBlock2
  const countBits = version <= 9 ? 8 : 16
  const maxBytes = Math.floor((totalDataCodewords * 8 - 4 - countBits) / 8)
  const payload = utf8Bytes.slice(0, maxBytes)

  const bits = []
  appendBits(bits, 0b0100, 4)
  appendBits(bits, payload.length, countBits)
  for (let i = 0; i < payload.length; i++) {
    appendBits(bits, payload[i], 8)
  }

  const capacityBits = totalDataCodewords * 8
  const terminatorLen = Math.min(4, capacityBits - bits.length)
  appendBits(bits, 0, terminatorLen)

  while (bits.length % 8 !== 0) {
    bits.push(0)
  }

  const dataCodewords = new Uint8Array(totalDataCodewords)
  const filledBytes = bits.length / 8
  for (let i = 0; i < filledBytes; i++) {
    let b = 0
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j]
    }
    dataCodewords[i] = b
  }

  const padBytes = [0xec, 0x11]
  for (let i = filledBytes; i < totalDataCodewords; i++) {
    dataCodewords[i] = padBytes[(i - filledBytes) % 2]
  }

  const dataBlocks = []
  const ecBlocks = []
  let offset = 0

  for (let b = 0; b < info.blocksGroup1; b++) {
    const block = dataCodewords.slice(offset, offset + info.dataPerBlock1)
    offset += info.dataPerBlock1
    dataBlocks.push(block)
    ecBlocks.push(computeReedSolomonRemainder(block, info.ecCodewordsPerBlock))
  }

  for (let b = 0; b < info.blocksGroup2; b++) {
    const block = dataCodewords.slice(offset, offset + info.dataPerBlock2)
    offset += info.dataPerBlock2
    dataBlocks.push(block)
    ecBlocks.push(computeReedSolomonRemainder(block, info.ecCodewordsPerBlock))
  }

  const interleaved = []
  const maxDataBlockLen = Math.max(info.dataPerBlock1, info.dataPerBlock2)
  for (let i = 0; i < maxDataBlockLen; i++) {
    for (let b = 0; b < dataBlocks.length; b++) {
      if (i < dataBlocks[b].length) {
        interleaved.push(dataBlocks[b][i])
      }
    }
  }

  for (let i = 0; i < info.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < ecBlocks.length; b++) {
      interleaved.push(ecBlocks[b][i])
    }
  }

  return interleaved
}

function computeFormatBits(maskIndex) {
  const data = (0b00 << 3) | maskIndex
  let rem = data
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  }
  return ((data << 10) | rem) ^ 0x5412
}

function computeVersionBits(version) {
  let rem = version
  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  }
  return (version << 12) | rem
}

function shouldInvertModule(maskIndex, r, c) {
  switch (maskIndex) {
    case 0:
      return (r + c) % 2 === 0
    case 1:
      return r % 2 === 0
    case 2:
      return c % 3 === 0
    case 3:
      return (r + c) % 3 === 0
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0
    case 7:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
    default:
      return false
  }
}

function evaluateMaskPenalty(modules) {
  const size = modules.length
  let penalty = 0

  for (let r = 0; r < size; r++) {
    let runColor = modules[r][0]
    let runLen = 1
    for (let c = 1; c < size; c++) {
      if (modules[r][c] === runColor) {
        runLen++
        if (runLen === 5) penalty += 3
        else if (runLen > 5) penalty += 1
      } else {
        runColor = modules[r][c]
        runLen = 1
      }
    }
  }

  for (let c = 0; c < size; c++) {
    let runColor = modules[0][c]
    let runLen = 1
    for (let r = 1; r < size; r++) {
      if (modules[r][c] === runColor) {
        runLen++
        if (runLen === 5) penalty += 3
        else if (runLen > 5) penalty += 1
      } else {
        runColor = modules[r][c]
        runLen = 1
      }
    }
  }

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const color = modules[r][c]
      if (
        color === modules[r][c + 1] &&
        color === modules[r + 1][c] &&
        color === modules[r + 1][c + 1]
      ) {
        penalty += 3
      }
    }
  }

  let darkCount = 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) darkCount++
    }
  }
  const total = size * size
  const k = Math.ceil(Math.abs(darkCount * 20 - total * 10) / total) - 1
  if (k > 0) penalty += k * 10

  return penalty
}

export function generateQrMatrix(text) {
  const safeText = String(text || "").trim() || "https://karir.itb.ac.id"
  const utf8Bytes = new TextEncoder().encode(safeText)
  const version = selectVersion(utf8Bytes.length)
  const info = VERSION_TABLE_LEVEL_M[version]
  const size = version * 4 + 17

  const modules = Array.from({ length: size }, () => Array(size).fill(false))
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false))

  const setFunctionModule = (r, c, isDark) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = Boolean(isDark)
      isFunction[r][c] = true
    }
  }

  const drawFinderPattern = (topRow, leftCol) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = topRow + dr
        const c = leftCol + dc
        if (r < 0 || r >= size || c < 0 || c >= size) continue
        const isBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6
        const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        const isSeparator = dr === -1 || dr === 7 || dc === -1 || dc === 7
        setFunctionModule(r, c, !isSeparator && (isBorder || isInner))
      }
    }
  }

  drawFinderPattern(0, 0)
  drawFinderPattern(0, size - 7)
  drawFinderPattern(size - 7, 0)

  for (let i = 8; i < size - 8; i++) {
    setFunctionModule(6, i, i % 2 === 0)
    setFunctionModule(i, 6, i % 2 === 0)
  }

  const alignCoords = info.align
  for (let i = 0; i < alignCoords.length; i++) {
    for (let j = 0; j < alignCoords.length; j++) {
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === alignCoords.length - 1) ||
        (i === alignCoords.length - 1 && j === 0)
      ) {
        continue
      }
      const centerR = alignCoords[i]
      const centerC = alignCoords[j]
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dist = Math.max(Math.abs(dr), Math.abs(dc))
          setFunctionModule(centerR + dr, centerC + dc, dist !== 1)
        }
      }
    }
  }

  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      setFunctionModule(8, i, false)
      setFunctionModule(i, 8, false)
    }
  }
  for (let i = 0; i < 8; i++) {
    setFunctionModule(8, size - 1 - i, false)
  }
  for (let i = 0; i < 7; i++) {
    setFunctionModule(size - 1 - i, 8, false)
  }
  setFunctionModule(size - 8, 8, true)

  if (version >= 7) {
    const vBits = computeVersionBits(version)
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >>> i) & 1) !== 0
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      setFunctionModule(a, b, bit)
      setFunctionModule(b, a, bit)
    }
  }

  const codewords = encodeCodewords(utf8Bytes, version)
  let bitIndex = 0
  const totalBits = codewords.length * 8

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const c = right - j
        const upward = ((right + 1) & 2) === 0
        const r = upward ? size - 1 - vert : vert
        if (!isFunction[r][c] && bitIndex < totalBits) {
          const byteVal = codewords[bitIndex >>> 3]
          const bitVal = ((byteVal >>> (7 - (bitIndex & 7))) & 1) !== 0
          modules[r][c] = bitVal
          bitIndex++
        }
      }
    }
  }

  const writeFormatBits = (targetGrid, maskIndex) => {
    const bits = computeFormatBits(maskIndex)
    for (let i = 0; i <= 5; i++) {
      targetGrid[i][8] = ((bits >>> i) & 1) !== 0
    }
    targetGrid[7][8] = ((bits >>> 6) & 1) !== 0
    targetGrid[8][8] = ((bits >>> 7) & 1) !== 0
    targetGrid[8][7] = ((bits >>> 8) & 1) !== 0
    for (let i = 9; i < 15; i++) {
      targetGrid[8][14 - i] = ((bits >>> i) & 1) !== 0
    }
    for (let i = 0; i < 8; i++) {
      targetGrid[8][size - 1 - i] = ((bits >>> i) & 1) !== 0
    }
    for (let i = 8; i < 15; i++) {
      targetGrid[size - 15 + i][8] = ((bits >>> i) & 1) !== 0
    }
    targetGrid[size - 8][8] = true
  }

  let bestGrid = null
  let bestPenalty = Infinity

  for (let m = 0; m < 8; m++) {
    const candidate = modules.map((row, r) =>
      row.map((val, c) =>
        isFunction[r][c] ? val : shouldInvertModule(m, r, c) ? !val : val
      )
    )
    writeFormatBits(candidate, m)
    const penalty = evaluateMaskPenalty(candidate)
    if (penalty < bestPenalty) {
      bestPenalty = penalty
      bestGrid = candidate
    }
  }

  return bestGrid
}

export function maskParticipantName(fullName) {
  const raw = String(fullName || "").trim()
  if (!raw) return "-"

  const words = raw.split(/\s+/).filter(Boolean)
  return words
    .map((word) => {
      const chars = Array.from(word)
      if (chars.length <= 2) {
        return chars[0] + "*"
      }
      if (chars.length === 3) {
        return chars.slice(0, 2).join("") + "*"
      }
      const visiblePrefix = chars.slice(0, 2).join("")
      const maskedCount = Math.min(Math.max(chars.length - 2, 2), 5)
      return visiblePrefix + "*".repeat(maskedCount)
    })
    .join(" ")
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export function downloadHighResQrPng({
  url,
  title = "Titian Karir Terpadu ITB",
  subtitle = "Scan QR Code Menggunakan Kamera Smartphone",
  badgeText = "ITB CAREER CENTER",
  filename = "qrcode-tkt-itb.png",
  mode = "poster"
}) {
  const matrix = generateQrMatrix(url)
  const moduleCount = matrix.length
  const quietZone = 4
  const totalModules = moduleCount + quietZone * 2

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (mode === "square") {
    const pixelPerModule = Math.max(24, Math.floor(1400 / totalModules))
    const canvasSize = totalModules * pixelPerModule
    canvas.width = canvasSize
    canvas.height = canvasSize
    ctx.imageSmoothingEnabled = false

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    ctx.fillStyle = "#07131e"
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(
            (c + quietZone) * pixelPerModule,
            (r + quietZone) * pixelPerModule,
            pixelPerModule,
            pixelPerModule
          )
        }
      }
    }
  } else {
    const width = 1600
    const height = 2100
    canvas.width = width
    canvas.height = height
    ctx.imageSmoothingEnabled = false

    const bgGrad = ctx.createLinearGradient(0, 0, width, height)
    bgGrad.addColorStop(0, "#0a2748")
    bgGrad.addColorStop(0.5, "#0d3663")
    bgGrad.addColorStop(1, "#071930")
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = "rgba(245, 158, 11, 0.35)"
    ctx.lineWidth = 6
    drawRoundedRect(ctx, 48, 48, width - 96, height - 96, 56)
    ctx.stroke()

    ctx.fillStyle = "rgba(245, 158, 11, 0.16)"
    drawRoundedRect(ctx, width / 2 - 260, 115, 520, 68, 34)
    ctx.fill()
    ctx.strokeStyle = "rgba(245, 158, 11, 0.55)"
    ctx.lineWidth = 3
    drawRoundedRect(ctx, width / 2 - 260, 115, 520, 68, 34)
    ctx.stroke()

    ctx.fillStyle = "#f59e0b"
    ctx.font = "bold 28px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(badgeText.toUpperCase(), width / 2, 149)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 60px Inter, system-ui, sans-serif"
    ctx.fillText(title, width / 2, 265)

    ctx.fillStyle = "#cbd5e1"
    ctx.font = "500 32px Inter, system-ui, sans-serif"
    ctx.fillText(subtitle, width / 2, 335)

    const qrBoxTarget = 1140
    const pixelPerModule = Math.floor(qrBoxTarget / totalModules)
    const actualQrSize = totalModules * pixelPerModule
    const qrX = Math.floor((width - actualQrSize) / 2)
    const qrY = 420

    ctx.save()
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)"
    ctx.shadowBlur = 48
    ctx.shadowOffsetY = 20
    ctx.fillStyle = "#ffffff"
    drawRoundedRect(ctx, qrX - 24, qrY - 24, actualQrSize + 48, actualQrSize + 48, 44)
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = "#07131e"
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(
            qrX + (c + quietZone) * pixelPerModule,
            qrY + (r + quietZone) * pixelPerModule,
            pixelPerModule,
            pixelPerModule
          )
        }
      }
    }

    const footerY = qrY + actualQrSize + 115
    ctx.fillStyle = "rgba(8, 18, 28, 0.72)"
    drawRoundedRect(ctx, 130, footerY, width - 260, 140, 32)
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)"
    ctx.lineWidth = 2
    drawRoundedRect(ctx, 130, footerY, width - 260, 140, 32)
    ctx.stroke()

    ctx.fillStyle = "#f59e0b"
    ctx.font = "bold 24px Inter, system-ui, sans-serif"
    ctx.fillText("TAUTAN LANGSUNG (URL)", width / 2, footerY + 46)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 32px monospace"
    ctx.fillText(url, width / 2, footerY + 96)

    ctx.fillStyle = "#94a3b8"
    ctx.font = "500 24px Inter, system-ui, sans-serif"
    ctx.fillText(
      "Layanan Konseling Karier • Titian Karir Terpadu ITB",
      width / 2,
      height - 95
    )
  }

  const dataUrl = canvas.toDataURL("image/png")
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
