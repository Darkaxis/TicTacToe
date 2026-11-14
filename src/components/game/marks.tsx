"use client";

import React from "react";
import { motion } from "framer-motion";

interface MarkProps {
  isWinningCell?: boolean;
  size?: "sm" | "md" | "lg";
}

export function MarkX({ isWinningCell = false, size = "lg" }: MarkProps) {
  const dimensions =
    size === "sm"
      ? "w-5 h-5"
      : size === "md"
      ? "w-9 h-9"
      : "w-14 h-14 sm:w-20 sm:h-20";

  return (
    <div className={`relative flex items-center justify-center ${dimensions}`}>
      {size === "lg" && (
        <>
          <motion.div
            initial={{ scale: 0.45, opacity: 0.85 }}
            animate={{ scale: 1.48, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 border border-[#00C8FF]"
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0.5, rotate: 45 }}
            animate={{ scale: 1.32, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.4, delay: 0.04, ease: "easeOut" }}
            className="pointer-events-none absolute inset-2 border border-[#ECEAE4]"
          />
        </>
      )}

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <motion.path
          d="M12 26 V12 H26 M74 12 H88 V26 M88 74 V88 H74 M26 88 H12 V74"
          stroke={isWinningCell ? "#ECEAE4" : "#00C8FF"}
          strokeWidth="2"
          strokeOpacity="0.55"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.polygon
          points="50,18 82,50 50,82 18,50"
          stroke="#00C8FF"
          strokeWidth="1.25"
          strokeDasharray="4 3"
          fill="rgba(0, 200, 255, 0.05)"
          initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
          animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
          transition={{ duration: 0.32, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: "50px", originY: "50px" }}
        />

        <motion.path
          d="M20 14 L29 14 L86 71 L86 86 L71 86 L14 29 Z"
          fill={isWinningCell ? "#ECEAE4" : "#00C8FF"}
          initial={{ clipPath: "inset(0 100% 100% 0)", opacity: 0.4 }}
          animate={{ clipPath: "inset(0 0% 0% 0)", opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.path
          d="M80 14 L86 20 L86 29 L29 86 L14 86 L14 71 L71 14 Z"
          fill="#ECEAE4"
          initial={{ clipPath: "inset(0 0% 100% 100%)", opacity: 0.4 }}
          animate={{ clipPath: "inset(0 0% 0% 0)", opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.055, ease: [0.16, 1, 0.3, 1] }}
        />

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
          animate={{ scale: isWinningCell ? [1, 1.18, 1] : 1 }}
          transition={
            isWinningCell
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.22, delay: 0.1, type: "spring", stiffness: 460, damping: 24 }
          }
          style={{ originX: "50px", originY: "50px" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="2.2"
          fill="#ECEAE4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.14, duration: 0.15 }}
        />
      </svg>
    </div>
  );
}

export function MarkO({ isWinningCell = false, size = "lg" }: MarkProps) {
  const dimensions =
    size === "sm"
      ? "w-5 h-5"
      : size === "md"
      ? "w-9 h-9"
      : "w-14 h-14 sm:w-20 sm:h-20";

  return (
    <div className={`relative flex items-center justify-center ${dimensions}`}>
      {size === "lg" && (
        <>
          <motion.div
            initial={{ scale: 0.45, opacity: 0.85, rotate: 45 }}
            animate={{ scale: 1.45, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-1 border border-[#FF3B1D]"
          />
          <motion.div
            initial={{ scale: 0.55, opacity: 0.5 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 0.38, delay: 0.04, ease: "easeOut" }}
            className="pointer-events-none absolute inset-1 border border-[#ECEAE4]"
          />
        </>
      )}

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <motion.path
          d="M50 4 V14 M50 86 V96 M4 50 H14 M86 50 H96"
          stroke="#FF3B1D"
          strokeWidth="2"
          strokeOpacity="0.75"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        />

        <motion.polygon
          points="33,12 67,12 88,33 88,67 67,88 33,88 12,67 12,33"
          stroke={isWinningCell ? "#ECEAE4" : "#FF3B1D"}
          strokeWidth="6"
          fill="rgba(255, 59, 29, 0.08)"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.circle
          cx="50"
          cy="50"
          r="24"
          stroke="#ECEAE4"
          strokeWidth="3.5"
          strokeDasharray="28 8"
          initial={{ rotate: -120, scale: 0.75, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.34, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: "50px", originY: "50px" }}
        />

        <motion.polygon
          points="50,36 64,50 50,64 36,50"
          fill="#FF3B1D"
          stroke="#090A0D"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: isWinningCell ? [1, 1.18, 1] : 1 }}
          transition={
            isWinningCell
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.22, delay: 0.1, type: "spring", stiffness: 460, damping: 24 }
          }
          style={{ originX: "50px", originY: "50px" }}
        />
        <motion.rect
          x="48"
          y="48"
          width="4"
          height="4"
          fill="#FFD000"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.14, duration: 0.15 }}
        />
      </svg>
    </div>
  );
}

export function BrandLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M32 4 L58 54 H46 L32 26 L18 54 H6 L32 4 Z" fill="#ECEAE4" />
      <path d="M27 34 H37 L42 54 H22 L27 34 Z" fill="#00C8FF" />
      <rect x="14" y="57" width="36" height="3" fill="#ECEAE4" />
      <rect x="4" y="57" width="6" height="3" fill="#00C8FF" />
    </svg>
  );
}

