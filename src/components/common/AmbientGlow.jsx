import React from "react"

export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full ambient-blob-1 blur-3xl opacity-70 animate-pulse duration-1000" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full ambient-blob-2 blur-3xl opacity-60" />
      <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] rounded-full ambient-blob-3 blur-3xl opacity-50" />
    </div>
  )
}
