import React from "react"

export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[22rem] rounded-full bg-sky-500/18 blur-[100px]" />
      <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-amber-500/14 blur-[110px]" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-blue-600/16 blur-[120px]" />
    </div>
  )
}
