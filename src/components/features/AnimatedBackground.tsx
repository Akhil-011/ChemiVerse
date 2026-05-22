// ============================================================
// ChemFusion AI — Animated Particle Background
// Uses pure CSS + React for a floating molecule effect
// ============================================================
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
  symbol: string;
}

const COLORS = ["#00d4ff", "#8b5cf6", "#10b981", "#f97316", "#e63946", "#4361ee"];
const SYMBOLS = ["H", "C", "O", "N", "S", "Fe", "Na", "Cl", "P", "Mg", "⬡", "○"];

export default function AnimatedBackground({ count = 25 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 28 + 16,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.15 + 0.05,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Radial glows */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, #00d4ff, transparent 70%)",
          top: "10%",
          left: "-10%",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
          top: "40%",
          right: "-5%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-8 blur-3xl"
        style={{
          background: "radial-gradient(circle, #10b981, transparent 70%)",
          bottom: "5%",
          left: "30%",
        }}
      />

      {/* Floating atom symbols */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute flex items-center justify-center rounded-full font-display font-bold border"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            fontSize: p.size * 0.38,
            color: p.color,
            borderColor: p.color,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            backgroundColor: `${p.color}08`,
          }}
        >
          {p.symbol}
        </div>
      ))}

      {/* Connecting lines (SVG bonds) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        {particles.slice(0, 8).map((p, i) => {
          const next = particles[(i + 1) % 8];
          return (
            <line
              key={`bond-${i}`}
              x1={`${p.x}%`}
              y1={`${p.y}%`}
              x2={`${next.x}%`}
              y2={`${next.y}%`}
              stroke="#00d4ff"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
          );
        })}
      </svg>
    </div>
  );
}
