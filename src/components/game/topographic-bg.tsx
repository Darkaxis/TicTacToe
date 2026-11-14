"use client";

import React, { useEffect, useRef } from "react";
import { PlayerSymbol } from "@/types/game";

interface TopographicBgProps {
  activePlayer: PlayerSymbol;
}

export function TopographicBg({ activePlayer }: TopographicBgProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 22 }, (_, i) => ({
      x: ((i * 197) % 1000) / 1000,
      y: ((i * 313) % 1000) / 1000,
      vx: ((i % 5) - 2) * 0.00005,
      vy: -0.00008 - (i % 4) * 0.00003,
      size: (i % 2) + 1.5,
      alpha: 0.08 + (i % 4) * 0.04,
    }));

    let time = 0;

    const render = () => {
      time += 0.004;
      ctx.clearRect(0, 0, width, height);

      const accentColor =
        activePlayer === "X" ? "rgba(0, 200, 255," : "rgba(255, 59, 29,";

      ctx.lineWidth = 1;
      const lineCount = 5;
      for (let l = 0; l < lineCount; l++) {
        ctx.beginPath();
        const alpha = l === 2 ? 0.055 : 0.025;
        ctx.strokeStyle =
          l === 2
            ? `${accentColor} ${alpha})`
            : `rgba(236, 234, 228, ${alpha})`;

        const baseY = (height / (lineCount + 1)) * (l + 1);
        for (let x = 0; x <= width; x += 36) {
          const wave1 = Math.sin(x * 0.0025 + time + l * 0.8) * 22;
          const wave2 = Math.cos(x * 0.006 - time * 0.5 + l) * 10;
          const y = baseY + wave1 + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      for (const p of particles) {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        const px = p.x * width;
        const py = p.y * height;

        ctx.fillStyle = `${accentColor} ${p.alpha})`;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activePlayer]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-tactical-grid">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

