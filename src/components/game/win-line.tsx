"use client";

import React from "react";
import { motion } from "framer-motion";
import { WinLineType, WinningLine } from "@/types/game";

interface WinLineProps {
  winningLine: WinningLine | null;
}

// Exact cell centers accounting for grid gap (~2.8% of grid width inside p-1.5)
const C0 = 15.73;
const C1 = 50;
const C2 = 84.27;

const COORD_MAP: Record<
  WinLineType,
  { x1: number; y1: number; x2: number; y2: number; points: [number, number][] }
> = {
  "ROW-0": {
    x1: 7,
    y1: C0,
    x2: 93,
    y2: C0,
    points: [
      [C0, C0],
      [C1, C0],
      [C2, C0],
    ],
  },
  "ROW-1": {
    x1: 7,
    y1: C1,
    x2: 93,
    y2: C1,
    points: [
      [C0, C1],
      [C1, C1],
      [C2, C1],
    ],
  },
  "ROW-2": {
    x1: 7,
    y1: C2,
    x2: 93,
    y2: C2,
    points: [
      [C0, C2],
      [C1, C2],
      [C2, C2],
    ],
  },
  "COL-0": {
    x1: C0,
    y1: 7,
    x2: C0,
    y2: 93,
    points: [
      [C0, C0],
      [C0, C1],
      [C0, C2],
    ],
  },
  "COL-1": {
    x1: C1,
    y1: 7,
    x2: C1,
    y2: 93,
    points: [
      [C1, C0],
      [C1, C1],
      [C1, C2],
    ],
  },
  "COL-2": {
    x1: C2,
    y1: 7,
    x2: C2,
    y2: 93,
    points: [
      [C2, C0],
      [C2, C1],
      [C2, C2],
    ],
  },
  "DIAG-MAIN": {
    x1: 8,
    y1: 8,
    x2: 92,
    y2: 92,
    points: [
      [C0, C0],
      [C1, C1],
      [C2, C2],
    ],
  },
  "DIAG-ANTI": {
    x1: 92,
    y1: 8,
    x2: 8,
    y2: 92,
    points: [
      [C2, C0],
      [C1, C1],
      [C0, C2],
    ],
  },
};

export function WinLine({ winningLine }: WinLineProps) {
  if (!winningLine) return null;

  const coords = COORD_MAP[winningLine.angleType];
  const color = winningLine.winner === "X" ? "#00C8FF" : "#FF3B1D";

  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-1.5 z-30 h-[calc(100%-0.75rem)] w-[calc(100%-0.75rem)] overflow-visible"
    >
      <motion.line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke="#090A0D"
        strokeWidth="3.6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.28, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke={color}
        strokeWidth="1.7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke="#ECEAE4"
        strokeWidth="0.6"
        strokeDasharray="2.5 1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, delay: 0.09, ease: "easeOut" }}
      />

      <motion.circle
        fill="#ECEAE4"
        initial={{ cx: coords.x1, cy: coords.y1, opacity: 1, r: 1.8 }}
        animate={{
          cx: coords.x2,
          cy: coords.y2,
          opacity: [1, 1, 0],
          r: [1.8, 2.6, 0.5],
        }}
        transition={{ duration: 0.36, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />

      {coords.points.map(([cx, cy], idx) => (
        <React.Fragment key={idx}>
          <motion.circle
            cx={cx}
            cy={cy}
            r="5"
            stroke={color}
            strokeWidth="0.7"
            fill="none"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{
              delay: 0.1 + idx * 0.07,
              duration: 0.55,
              ease: "easeOut",
            }}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
          />
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1 + idx * 0.07,
              type: "spring",
              stiffness: 420,
              damping: 22,
            }}
            style={{ originX: `${cx}px`, originY: `${cy}px` }}
          >
            <rect
              x={cx - 2.4}
              y={cy - 2.4}
              width="4.8"
              height="4.8"
              transform={`rotate(45 ${cx} ${cy})`}
              fill="#090A0D"
              stroke="#ECEAE4"
              strokeWidth="0.85"
            />
            <circle cx={cx} cy={cy} r="1" fill={color} />
          </motion.g>
        </React.Fragment>
      ))}
    </svg>
  );
}

