import React from "react"

export default function SkeletonLoader({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="liquid-neumorph-card rounded-2xl p-5 border-t border-l border-white/20 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="h-5 w-20 rounded-full bg-brand-gold/15" />
          </div>
          <div className="h-6 w-3/4 rounded-lg bg-white/10 mb-2" />
          <div className="h-4 w-1/2 rounded-md bg-white/5 mb-6" />
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/10" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-28 rounded bg-white/10" />
              <div className="h-3 w-16 rounded bg-white/5" />
            </div>
          </div>
          <div className="mt-5 h-10 w-full rounded-xl bg-white/10" />
        </div>
      ))}
    </div>
  )
}
