import React from "react"
import GlassCard from "../common/GlassCard"

export default function SkeletonLoader({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <GlassCard key={idx} className="p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-brand-navy/10 rounded-full" />
            <div className="h-5 w-20 bg-brand-gold/15 rounded-full" />
          </div>
          <div className="h-6 w-3/4 bg-brand-navy/15 rounded-lg mb-2" />
          <div className="h-4 w-1/2 bg-brand-navy/10 rounded-md mb-6" />
          <div className="flex items-center gap-3 pt-4 border-t border-black/5">
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-28 bg-brand-navy/15 rounded" />
              <div className="h-3 w-16 bg-brand-navy/10 rounded" />
            </div>
          </div>
          <div className="mt-5 h-10 w-full bg-brand-navy/10 rounded-xl" />
        </GlassCard>
      ))}
    </div>
  )
}
