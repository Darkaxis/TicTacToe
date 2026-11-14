"use client";

import React from "react";
import { motion } from "framer-motion";
import { WinningVector } from "@/lib/tactical-engine";

interface WinningVectorOverlayProps {
  winningVector: WinningVector | null;
}

const COORD_MAP: Record<
  WinningVector["angleType"],
  { x1: number; y1: number; x2: number; y2: number; points: [number, number][] }
> = {
  "ROW-0": {
    x1: 8,
    y1: 16.66,
    x2: 92,
    y2: 16.66,
    points: [
      [16.66, 16.66],
      [50, 16.66],
      [83.33, 16.66],
    ],
  },
  "ROW-1": {
    x1: 8,
    y1: 50,
    x2: 92,
    y2: 50,
    points: [
      [16.66, 50],
      [50, 50],
      [83.33, 50],
    ],
  },
  "ROW-2": {
    x1: 8,
    y1: 83.33,
    x2: 92,
    y2: 83.33,
    points: [
      [16.66, 83.33],
      [50, 83.33],
      [83.33, 83.33],
    ],
  },
  "COL-0": {
    x1: 16.66,
    y1: 8,
    x2: 16.66,
    y2: 92,
    points: [
      [16.66, 16.66],
      [16.66, 50],
      [16.66, 83.33],
    ],
  },
  "COL-1": {
    x1: 50,
    y1: 8,
    x2: 50,
    y2: 92,
    points: [
      [50, 16.66],
      [50, 50],
      [50, 83.33],
    ],
  },
  "COL-2": {
    x1: 83.33,
    y1: 8,
    x2: 83.33,
    y2: 92,
    points: [
      [83.33, 16.66],
      [83.33, 50],
      [83.33, 83.33],
    ],
  },
  "DIAG-MAIN": {
    x1: 9,
    y1: 9,
    x2: 91,
    y2: 91,
    points: [
      [16.66, 16.66],
      [50, 50],
      [83.33, 83.33],
    ],
  },
  "DIAG-ANTI": {
    x1: 91,
    y1: 9,
    x2: 9,
    y2: 91,
    points: [
      [83.33, 16.66],
      [50, 50],
      [16.66, 83.33],
    ],
  },
};

export function WinningVectorOverlay({
  winningVector,
}: WinningVectorOverlayProps) {
  if (!winningVector) return null;

  const coords = COORD_MAP[winningVector.angleType];
  const color = winningVector.winner === "X" ? "#00C8FF" : "#FF3B1D";

  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
    >
      {/* Outer high-contrast casing line */}
      <motion.line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke="#090A0D"
        strokeWidth="3.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Primary laser strike vector */}
      <motion.line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke={color}
        strokeWidth="1.6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Inner stark white core */}
      <motion.line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke="#ECEAE4"
        strokeWidth="0.6"
        strokeDasharray="2 1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.04, ease: "easeOut" }}
      />

      {/* Target lock diamonds at each of the 3 winning sector centers */}
      {coords.points.map(([cx, cy], idx) => (
        <motion.g
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.08 + idx * 0.06,
            type: "spring",
            stiffness: 380,
          }}
        >
          <rect
            x={cx - 2.4}
            y={cy - 2.4}
            width="4.8"
            height="4.8"
            transform={`rotate(45 ${cx} ${cy})`}
            fill="#090A0D"
            stroke="#ECEAE4"
            strokeWidth="0.8"
          />
          <circle cx={cx} cy={cy} r="1" fill={color} />
        </motion.g>
      ))}
    </svg>
  );
}

