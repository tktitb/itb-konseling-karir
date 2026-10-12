import React from "react"

export default function GlassCard({
  children,
  className = "",
  variant = "default",
  hover = false,
  onClick = null
}) {
  const variantStyles = {
    default: "liquid-neumorph-card",
    gold: "liquid-neumorph-card border-amber-500/30",
    dark: "liquid-neumorph-card text-white",
    subtle: "liquid-glass-subtle",
    inset: "liquid-neumorph-inset"
  }

  const hoverStyle = hover
    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
    : ""

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 ${variantStyles[variant] || variantStyles.default} ${hoverStyle} ${className}`}
    >
      {children}
    </div>
  )
}
