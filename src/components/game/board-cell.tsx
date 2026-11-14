"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CellCoordinate,
  CellEvaluation,
  CellValue,
  PlayerSymbol,
} from "@/types/game";
import { MarkX, MarkO } from "./marks";

interface BoardCellProps {
  coordinate: CellCoordinate;
  value: CellValue;
  activePlayer: PlayerSymbol;
  isWinningCell: boolean;
  isDimmed: boolean;
  isLastMove: boolean;
  isHovered: boolean;
  isNeighborPulse: boolean;
  isDisabled: boolean;
  showHints: boolean;
  evaluation?: CellEvaluation;
  entryDelay: number;
  winOrderIndex: number;
  onSelect: (index: number) => void;
  onHoverChange: (index: number | null) => void;
}

export function BoardCell({
  coordinate,
  value,
  activePlayer,
  isWinningCell,
  isDimmed,
  isLastMove,
  isHovered,
  isNeighborPulse,
  isDisabled,
  showHints,
  evaluation,
  entryDelay,
  winOrderIndex,
  onSelect,
  onHoverChange,
}: BoardCellProps) {
  const canInteract = !isDisabled && value === null;
  const accentBorder =
    activePlayer === "X" ? "border-tactical-cyan" : "border-tactical-crimson";
  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  const opacityDelay = hasMountedRef.current
    ? isDimmed
      ? 0.05
      : 0
    : entryDelay;
  const scaleDelay = hasMountedRef.current
    ? isWinningCell
      ? winOrderIndex * 0.065
      : 0
    : entryDelay;

  return (
    <motion.button
      type="button"
      disabled={!canInteract}
      onClick={() => canInteract && onSelect(coordinate.index)}
      onMouseEnter={() => canInteract && onHoverChange(coordinate.index)}
      onMouseLeave={() => onHoverChange(null)}
      onFocus={() => canInteract && onHoverChange(coordinate.index)}
      onBlur={() => onHoverChange(null)}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{
        opacity: isDimmed ? 0.36 : 1,
        scale: isDimmed ? 0.97 : isWinningCell ? 1.02 : 1,
      }}
      transition={{
        opacity: { duration: 0.26, delay: opacityDelay },
        scale: {
          duration: 0.26,
          delay: scaleDelay,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      whileTap={canInteract ? { scale: 0.955 } : undefined}
      aria-label={`Square ${coordinate.code}${value ? ` occupied by ${value}` : ""}`}
      className={`group relative aspect-square w-full border transition-colors duration-150 focus:outline-none select-none overflow-hidden ${
        isWinningCell
          ? value === "X"
            ? "bg-tactical-cyan/18 border-tactical-cyan z-10"
            : "bg-tactical-crimson/22 border-tactical-crimson z-10"
          : value !== null
          ? "bg-[#11151E] border-white/20"
          : "bg-[#0C0F16]/90 border-white/15 hover:bg-[#141924]"
      }`}
    >
      {/* Magnetic Shared-Element Hover Reticle */}
      {isHovered && canInteract && (
        <motion.div
          layoutId="grid-hover-reticle"
          transition={{
            type: "spring",
            stiffness: 560,
            damping: 38,
            mass: 0.45,
          }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <span
            className={`absolute top-1.5 left-1.5 h-3 w-3 border-t-2 border-l-2 ${accentBorder}`}
          />
          <span
            className={`absolute top-1.5 right-1.5 h-3 w-3 border-t-2 border-r-2 ${accentBorder}`}
          />
          <span
            className={`absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2 ${accentBorder}`}
          />
          <span
            className={`absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2 ${accentBorder}`}
          />
          <span
            className={`absolute inset-0 border ${
              activePlayer === "X"
                ? "border-tactical-cyan/40 bg-tactical-cyan/[0.04]"
                : "border-tactical-crimson/40 bg-tactical-crimson/[0.04]"
            }`}
          />
        </motion.div>
      )}

      {/* Adjacent square capture pulse */}
      {isNeighborPulse && (
        <motion.div
          key={`pulse-${coordinate.index}`}
          initial={{ opacity: 0.45 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 border border-white/50"
        />
      )}

      {/* Subtle diagonal stripe highlight */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
          isWinningCell
            ? value === "X"
              ? "bg-hazard-cyan opacity-100"
              : "bg-hazard-crimson opacity-100"
            : "bg-hazard-bone opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Corner ticks */}
      <span className="pointer-events-none absolute top-1.5 left-1.5 h-1.5 w-1.5 border-t border-l border-white/20" />
      <span className="pointer-events-none absolute top-1.5 right-1.5 h-1.5 w-1.5 border-t border-r border-white/20" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-1.5 w-1.5 border-b border-l border-white/20" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-1.5 w-1.5 border-b border-r border-white/20" />

      {/* Out-of-flow coordinate stamp (never shifts centered emblem) */}
      <span
        className={`pointer-events-none absolute top-2 left-2.5 z-10 font-mono text-[10px] tracking-[0.14em] transition-colors ${
          isWinningCell
            ? "text-tactical-bone font-bold"
            : value !== null
            ? "text-tactical-bone/35"
            : "text-tactical-bone/35 group-hover:text-tactical-bone/85"
        }`}
      >
        {coordinate.code}
      </span>

      {/* Last move marker */}
      {isLastMove && !isWinningCell && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`pointer-events-none absolute top-2.5 right-2.5 z-10 h-1.5 w-1.5 ${
            value === "X" ? "bg-tactical-cyan" : "bg-tactical-crimson"
          }`}
        />
      )}

      {/* Exact geometric center container for X / O / hover ghost */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        {value === "X" && <MarkX isWinningCell={isWinningCell} />}
        {value === "O" && <MarkO isWinningCell={isWinningCell} />}

        {value === null && (
          <div className="opacity-0 scale-90 transition-all duration-150 group-hover:opacity-35 group-hover:scale-100">
            {activePlayer === "X" ? (
              <MarkX size="md" />
            ) : (
              <MarkO size="md" />
            )}
          </div>
        )}
      </div>

      {/* Out-of-flow hint pill anchored at bottom edge */}
      {value === null &&
        showHints &&
        evaluation &&
        evaluation.status !== "OCCUPIED" && (
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute bottom-2 inset-x-0 z-10 flex justify-center"
          >
            <span
              className={`border px-1.5 py-0.5 font-mono text-[9px] leading-none tracking-[0.12em] ${
                evaluation.status === "BEST"
                  ? "border-tactical-cyan/60 bg-tactical-cyan/15 text-tactical-cyan font-bold"
                  : evaluation.status === "RISK"
                  ? "border-tactical-crimson/50 bg-tactical-crimson/10 text-tactical-crimson"
                  : "border-white/20 bg-black/60 text-tactical-bone/65"
              }`}
            >
              {evaluation.status === "BEST"
                ? "BEST"
                : evaluation.status === "RISK"
                ? "RISK"
                : "DRAW"}
            </span>
          </motion.div>
        )}
    </motion.button>
  );
}

