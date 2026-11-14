"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CellEvaluation,
  CellValue,
  PlayerSymbol,
  SectorInfo,
} from "@/lib/tactical-engine";
import { RhodesVanguardMark, ReunionOriginiumSigil } from "./tactical-emblems";

interface TacticalSectorCellProps {
  sector: SectorInfo;
  value: CellValue;
  activePlayer: PlayerSymbol;
  isWinningCell: boolean;
  isLastMove: boolean;
  isDisabled: boolean;
  showHints: boolean;
  evaluation?: CellEvaluation;
  onSelect: (index: number) => void;
  onHover: (hovered: boolean) => void;
}

export function TacticalSectorCell({
  sector,
  value,
  activePlayer,
  isWinningCell,
  isLastMove,
  isDisabled,
  showHints,
  evaluation,
  onSelect,
  onHover,
}: TacticalSectorCellProps) {
  const canInteract = !isDisabled && value === null;

  return (
    <motion.button
      type="button"
      disabled={!canInteract}
      onClick={() => canInteract && onSelect(sector.index)}
      onMouseEnter={() => canInteract && onHover(true)}
      onMouseLeave={() => onHover(false)}
      whileTap={canInteract ? { scale: 0.96 } : undefined}
      aria-label={`Square ${sector.code}${value ? ` occupied by ${value}` : ""}`}
      className={`group relative flex flex-col items-center justify-center aspect-square w-full border transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-rhodes-cyan select-none overflow-hidden ${
        isWinningCell
          ? value === "X"
            ? "bg-rhodes-cyan/15 border-rhodes-cyan"
            : "bg-rhodes-reunion/20 border-rhodes-reunion"
          : value !== null
          ? "bg-[#11151E] border-white/20"
          : "bg-[#0C0F16]/90 border-white/15 hover:border-rhodes-bone/55 hover:bg-[#141924]"
      }`}
    >
      {/* Subtle diagonal stripe highlight on winning cells or hover */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
          isWinningCell
            ? value === "X"
              ? "bg-hazard-cyan opacity-100"
              : "bg-hazard-reunion opacity-100"
            : "bg-hazard-bone opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Precision corner reticles */}
      <span className="pointer-events-none absolute top-1.5 left-1.5 h-2 w-2 border-t border-l border-white/25 transition-all duration-150 group-hover:top-2 group-hover:left-2 group-hover:border-rhodes-cyan" />
      <span className="pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-white/25 transition-all duration-150 group-hover:top-2 group-hover:right-2 group-hover:border-rhodes-cyan" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-white/25 transition-all duration-150 group-hover:bottom-2 group-hover:left-2 group-hover:border-rhodes-cyan" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r border-white/25 transition-all duration-150 group-hover:bottom-2 group-hover:right-2 group-hover:border-rhodes-cyan" />

      {/* Quiet Coordinate Stamp (Top-Left) */}
      <span
        className={`pointer-events-none absolute top-2 left-2.5 font-mono text-[10px] tracking-[0.14em] transition-colors ${
          isWinningCell
            ? "text-rhodes-bone font-bold"
            : value !== null
            ? "text-rhodes-bone/35"
            : "text-rhodes-bone/35 group-hover:text-rhodes-bone/80"
        }`}
      >
        {sector.code}
      </span>

      {/* Subtle Last Move Marker Dot (Top-Right) */}
      {isLastMove && !isWinningCell && (
        <span
          className={`pointer-events-none absolute top-2.5 right-2.5 h-1.5 w-1.5 ${
            value === "X" ? "bg-rhodes-cyan" : "bg-rhodes-reunion"
          }`}
        />
      )}

      {/* Center Emblem or Hover Preview */}
      <div className="relative z-10 flex items-center justify-center">
        {value === "X" && <RhodesVanguardMark isWinningCell={isWinningCell} />}
        {value === "O" && (
          <ReunionOriginiumSigil isWinningCell={isWinningCell} />
        )}

        {value === null && (
          <div className="relative flex flex-col items-center justify-center">
            <div className="opacity-0 scale-90 transition-all duration-150 group-hover:opacity-35 group-hover:scale-100">
              {activePlayer === "X" ? (
                <RhodesVanguardMark size="md" />
              ) : (
                <ReunionOriginiumSigil size="md" />
              )}
            </div>

            {showHints && evaluation && evaluation.status !== "OCCUPIED" && (
              <span
                className={`mt-1 border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] ${
                  evaluation.status === "BEST"
                    ? "border-rhodes-cyan/60 bg-rhodes-cyan/15 text-rhodes-cyan font-bold"
                    : evaluation.status === "RISK"
                    ? "border-rhodes-reunion/50 bg-rhodes-reunion/10 text-rhodes-reunion"
                    : "border-white/20 bg-black/50 text-rhodes-bone/65"
                }`}
              >
                {evaluation.status === "BEST"
                  ? "BEST"
                  : evaluation.status === "RISK"
                  ? "RISK"
                  : "DRAW"}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}
