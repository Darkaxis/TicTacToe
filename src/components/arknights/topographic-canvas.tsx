"use client";

import React, { useEffect, useRef, useState } from "react";

interface TopographicCanvasProps {
  activePlayer: "X" | "O";
  isOverclock: boolean;
}

export function TopographicCanvas({
  activePlayer,
  isOverclock,
}: TopographicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cursorCoords, setCursorCoords] = useState({ x: 512, y: 384 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      setCursorCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

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

    // Generate deterministic Originium dust particles & survey crosses
    const particles = Array.from({ length: 34 }, (_, i) => ({
      x: ((i * 197) % 1000) / 1000,
      y: ((i * 313) % 1000) / 1000,
      vx: (((i % 7) - 3) * 0.00008),
      vy: -0.00012 - (i % 5) * 0.00005,
      size: (i % 3) + 1.5,
      type: i % 4 === 0 ? "cross" : "diamond",
      alpha: 0.12 + (i % 5) * 0.06,
    }));

    let time = 0;

    const render = () => {
      time += 0.006;
      ctx.clearRect(0, 0, width, height);

      const accentColor =
        activePlayer === "X"
          ? "rgba(0, 200, 255,"
          : "rgba(255, 59, 29,";

      // 1. Draw subtle topographic elevation isolines
      ctx.lineWidth = 1;
      const lineCount = 7;
      for (let l = 0; l < lineCount; l++) {
        ctx.beginPath();
        const alpha = l === 3 ? 0.075 : 0.035;
        ctx.strokeStyle =
          l === 3 ? `${accentColor} ${alpha})` : `rgba(236, 234, 228, ${alpha})`;

        const baseY = (height / (lineCount + 1)) * (l + 1);
        for (let x = 0; x <= width; x += 28) {
          const wave1 = Math.sin(x * 0.003 + time + l * 0.7) * 26;
          const wave2 = Math.cos(x * 0.007 - time * 0.6 + l) * 14;
          const y = baseY + wave1 + wave2;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 2. Draw Originium motes & survey registration marks
      for (const p of particles) {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;

        const px = p.x * width;
        const py = p.y * height;

        if (p.type === "cross") {
          ctx.strokeStyle = `rgba(236, 234, 228, ${p.alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - 3.5, py);
          ctx.lineTo(px + 3.5, py);
          ctx.moveTo(px, py - 3.5);
          ctx.lineTo(px, py + 3.5);
          ctx.stroke();
        } else {
          ctx.fillStyle = `${accentColor} ${p.alpha * 1.25})`;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activePlayer, isOverclock]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-tactical-grid">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Subtle reactive cursor datum hairlines */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 w-[1px] bg-white/[0.03] transition-transform duration-75 ease-out"
        style={{ transform: `translateX(${cursorCoords.x}px)` }}
      />
      <div
        className="hidden lg:block absolute left-0 right-0 h-[1px] bg-white/[0.03] transition-transform duration-75 ease-out"
        style={{ transform: `translateY(${cursorCoords.y}px)` }}
      />

      {/* Live cursor coordinate telemetry tag in bottom-left peripheral margin */}
      <div className="hidden xl:flex fixed bottom-9 left-5 items-center gap-3 font-mono text-[9px] tracking-[0.2em] text-rhodes-bone/35">
        <span className="inline-block h-1.5 w-1.5 bg-rhodes-cyan/60" />
        <span>
          CURSOR_LOC // X:{String(cursorCoords.x).padStart(4, "0")} Y:
          {String(cursorCoords.y).padStart(4, "0")}
        </span>
      </div>

      {/* Peripheral Vertical Telemetry Strip (Left) */}
      <div className="hidden xl:flex fixed left-3 top-1/2 -translate-y-1/2 flex-col items-center gap-4 text-rhodes-bone/20 select-none">
        <div className="h-16 w-[1px] bg-white/15" />
        <span className="writing-vertical font-mono text-[9px] tracking-[0.32em] uppercase">
          RHODES ISLAND PHARMACEUTICAL INC. // PRTS NEURAL SANDBOX
        </span>
        <div className="h-16 w-[1px] bg-white/15" />
      </div>

      {/* Peripheral Vertical Telemetry Strip (Right) */}
      <div className="hidden xl:flex fixed right-3 top-1/2 -translate-y-1/2 flex-col items-center gap-4 text-rhodes-bone/20 select-none">
        <div className="h-16 w-[1px] bg-white/15" />
        <span className="writing-vertical font-mono text-[9px] tracking-[0.32em] uppercase">
          ORIGINIUM TACTICAL MATRIX // SECTOR 09 SIMULATION
        </span>
        <div className="h-16 w-[1px] bg-white/15" />
      </div>
    </div>
  );
}

