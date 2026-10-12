import React, { useMemo } from "react"
import { generateQrMatrix } from "../../utils/qrCodeGenerator"

export default function TktQrCodeSvg({
  value = "",
  size = 180,
  quietZone = 3,
  fgColor = "#07131e",
  bgColor = "#ffffff",
  className = ""
}) {
  const matrix = useMemo(() => generateQrMatrix(value), [value])
  const moduleCount = matrix.length
  const totalModules = moduleCount + quietZone * 2

  const pathData = useMemo(() => {
    const segments = []
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          const x = c + quietZone
          const y = r + quietZone
          segments.push(`M${x},${y}h1v1h-1z`)
        }
      }
    }
    return segments.join("")
  }, [matrix, moduleCount, quietZone])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalModules} ${totalModules}`}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={`QR Code ${value}`}
    >
      <rect width={totalModules} height={totalModules} fill={bgColor} />
      <path d={pathData} fill={fgColor} />
    </svg>
  )
}
