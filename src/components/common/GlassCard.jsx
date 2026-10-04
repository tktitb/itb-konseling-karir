import React from "react"

export default function GlassCard({
  children,
  className = "",
  variant = "default",
  hover = false,
  onClick = null
}) {
  const variantStyles = {
    default: "liquid-glass",
    gold: "liquid-glass-gold",
    dark: "liquid-glass-dark text-white",
    subtle: "liquid-glass-subtle"
  }

  const hoverStyle = hover
    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glass-lg cursor-pointer"
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
