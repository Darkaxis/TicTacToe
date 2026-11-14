"use client";

import React from "react";
import { motion } from "framer-motion";

interface EmblemProps {
  isWinningCell?: boolean;
  size?: "sm" | "md" | "lg";
}

// Rhodes Island Vanguard [X] Tactical Emblem
export function RhodesVanguardMark({
  isWinningCell = false,
  size = "lg",
}: EmblemProps) {
  const dimensions =
    size === "sm" ? "w-5 h-5" : size === "md" ? "w-9 h-9" : "w-16 h-16 sm:w-20 sm:h-20";

  return (
    <motion.div
      initial={{ scale: 1.35, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-center justify-center ${dimensions}`}
    >
      {/* Kinetic deployment shockwave frame */}
      {size === "lg" && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0.9 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 border border-[#00C8FF]"
        />
      )}

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Outer tactical registration brackets */}
        <motion.path
          d="M12 26 V12 H26 M74 12 H88 V26 M88 74 V88 H74 M26 88 H12 V74"
          stroke={isWinningCell ? "#ECEAE4" : "#00C8FF"}
          strokeWidth="2"
          strokeOpacity="0.55"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />

        {/* Inner rotated tactical diamond */}
        <motion.polygon
          points="50,18 82,50 50,82 18,50"
          stroke="#00C8FF"
          strokeWidth="1.25"
          strokeDasharray="4 3"
          fill="rgba(0, 200, 255, 0.05)"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.75, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        />

        {/* Primary Slash Blade (\) */}
        <motion.path
          d="M20 14 L29 14 L86 71 L86 86 L71 86 L14 29 Z"
          fill={isWinningCell ? "#ECEAE4" : "#00C8FF"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.24, ease: "circOut" }}
        />

        {/* Secondary Counter-Blade (/) */}
        <motion.path
          d="M80 14 L86 20 L86 29 L29 86 L14 86 L14 71 L71 14 Z"
          fill="#ECEAE4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.24, delay: 0.06, ease: "circOut" }}
        />

        {/* Center PRTS Lock-On Core */}
        <motion.rect
          x="43"
          y="43"
          width="14"
          height="14"
          transform="rotate(45 50 50)"
          fill="#090A0D"
          stroke="#00C8FF"
          strokeWidth="2.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.22, delay: 0.12, type: "spring", stiffness: 380 }}
        />
        <circle cx="50" cy="50" r="2.2" fill="#ECEAE4" />
      </svg>
    </motion.div>
  );
}

// Reunion / Originium [O] Tactical Sigil
export function ReunionOriginiumSigil({
  isWinningCell = false,
  size = "lg",
}: EmblemProps) {
  const dimensions =
    size === "sm" ? "w-5 h-5" : size === "md" ? "w-9 h-9" : "w-16 h-16 sm:w-20 sm:h-20";

  return (
    <motion.div
      initial={{ scale: 1.35, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-center justify-center ${dimensions}`}
    >
      {/* Kinetic deployment shockwave diamond */}
      {size === "lg" && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0.9, rotate: 45 }}
          animate={{ scale: 1.5, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="pointer-events-none absolute inset-1 border border-[#FF3B1D]"
        />
      )}

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Outer Crosshair Ticks */}
        <path
          d="M50 4 V14 M50 86 V96 M4 50 H14 M86 50 H96"
          stroke="#FF3B1D"
          strokeWidth="2"
          strokeOpacity="0.7"
        />

        {/* Segmented Outer Octagonal Ring */}
        <motion.polygon
          points="33,12 67,12 88,33 88,67 67,88 33,88 12,67 12,33"
          stroke={isWinningCell ? "#ECEAE4" : "#FF3B1D"}
          strokeWidth="6"
          fill="rgba(255, 59, 29, 0.07)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        />

        {/* Inner High-Contrast Technical Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="24"
          stroke="#ECEAE4"
          strokeWidth="3.5"
          strokeDasharray="28 8"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.36, delay: 0.05, ease: "circOut" }}
          style={{ originX: "50px", originY: "50px" }}
        />

        {/* Originium Core Hazard Diamond */}
        <motion.polygon
          points="50,36 64,50 50,64 36,50"
          fill="#FF3B1D"
          stroke="#090A0D"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.24, delay: 0.1, type: "spring", stiffness: 360 }}
        />
        <rect x="48" y="48" width="4" height="4" fill="#FFD000" />
      </svg>
    </motion.div>
  );
}

// Rhodes Island Architectural Crest for Header
export function RhodesCrestLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer angular monolith triangle */}
      <path
        d="M32 4 L58 54 H46 L32 26 L18 54 H6 L32 4 Z"
        fill="#ECEAE4"
      />
      {/* Inner tactical rook / spire cut */}
      <path
        d="M27 34 H37 L42 54 H22 L27 34 Z"
        fill="#00C8FF"
      />
      {/* Horizontal datum bar */}
      <rect x="14" y="57" width="36" height="3" fill="#ECEAE4" />
      <rect x="4" y="57" width="6" height="3" fill="#00C8FF" />
    </svg>
  );
}

// Industrial Vector Barcode Stamp
export function TacticalBarcode({
  code = "RI-PRTS // 0049-X",
  className = "",
}: {
  code?: string;
  className?: string;
}) {
  const widths = [2, 1, 3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2];
  let x = 0;

  return (
    <div className={`inline-flex flex-col gap-1 select-none ${className}`}>
      <svg
        viewBox="0 0 68 14"
        className="h-3.5 w-20 fill-current opacity-70"
        preserveAspectRatio="none"
      >
        {widths.map((w, idx) => {
          const rectX = x;
          x += w + (idx % 2 === 0 ? 1.5 : 1);
          return <rect key={idx} x={rectX} y={0} width={w} height={14} />;
        })}
      </svg>
      <span className="font-mono text-[8px] tracking-[0.22em] opacity-55 uppercase">
        {code}
      </span>
    </div>
  );
}

