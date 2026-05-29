"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

interface Particle {
  id: number;
  left: number;
  size: number;
  color: string;
  opacity: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export default function EnergyParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  const particles: Particle[] = Array.from({ length: 25 }, (_, i) => {
    const isCyan = seededRandom(i + 50) > 0.5;
    return {
      id: i,
      left: seededRandom(i + 1) * 100,
      size: Math.floor(seededRandom(i + 100) * 5) + 2,
      color: isCyan ? "#00e5ff" : "#7c4dff",
      opacity: seededRandom(i + 400) * 0.5 + 0.3,
    };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const duration = Math.floor(seededRandom(200) * 13 + 6) * 1000;
    const delay = seededRandom(300) * 12000;

    animate(".energy-particle", {
      translateY: ["-10vh", "100vh"],
      translateX: [0, 30],
      scale: [0.5, 1],
      opacity: [
        { to: 0, duration: 0 },
        { to: 0.8, duration: duration * 0.1 },
        { to: 0.3, duration: duration * 0.8 },
        { to: 0, duration: duration * 0.1 },
      ],
      delay: stagger(delay, { start: 0 }),
      duration,
      loop: true,
      ease: "linear",
    });
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="energy-particle absolute top-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: 0,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${p.color}40`,
          }}
        />
      ))}
    </div>
  );
}
