"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CellValue,
  CellEvaluation,
  PlayerSymbol,
  SectorMetadata,
} from "@/lib/tactical-engine";
import { RhodesVanguardMark, ReunionOriginiumSigil } from "./tactical-emblems";

interface TacticalSectorCellProps {
  sector: SectorMetadata;
  value: CellValue;
  activePlayer: PlayerSymbol;
  isWinningCell: boolean;
  isLastMove: boolean;
  isDisabled: boolean;
  showTelemetry: boolean;
  telemetry?: CellEvaluation;
  moveOrderNumber: number | null;
  onSelect: (index: number) => void;
  onHover: (sector: SectorMetadata | null) => void;
}

export function TacticalSectorCell({
  sector,
  value,
  activePlayer,
  isWinningCell,
  isLastMove,
  isDisabled,
  showTelemetry,
  telemetry,
  moveOrderNumber,
  onSelect,
  onHover,
}: TacticalSectorCellProps) {
  const canInteract = !isDisabled && value === null;

  // Determine PRTS telemetry badge color
  const telemetryColor =
    telemetry?.classification === "OPTIMAL"
      ? "text-rhodes-cyan border-rhodes-cyan/60 bg-rhodes-cyan/10"
      : telemetry?.classification === "CRITICAL_RISK"
      ? "text-rhodes-reunion border-rhodes-reunion/60 bg-rhodes-reunion/10"
      : "text-rhodes-amber border-rhodes-amber/50 bg-rhodes-amber/10";

  return (
    <motion.button
      type="button"
      disabled={!canInteract}
      onClick={() => canInteract && onSelect(sector.index)}
      onMouseEnter={() => onHover(sector)}
      onMouseLeave={() => onHover(null)}
      whileTap={canInteract ? { scale: 0.975 } : undefined}
      className={`group relative flex flex-col justify-between aspect-square w-full p-2.5 sm:p-3.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-rhodes-cyan select-none overflow-hidden border ${
        isWinningCell
          ? value === "X"
            ? "bg-rhodes-cyan/20 border-rhodes-cyan"
            : "bg-rhodes-reunion/25 border-rhodes-reunion"
          : value !== null
          ? "bg-[#12161F] border-white/20"
          : "bg-[#0D1017]/90 border-white/15 hover:border-rhodes-bone/60 hover:bg-[#151A24]"
      }`}
    >
      {/* Subtle diagonal hazard shutter on hover or winning state */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
          isWinningCell
            ? value === "X"
              ? "bg-hazard-cyan opacity-100"
              : "bg-hazard-reunion opacity-100"
            : "bg-hazard-bone opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Corner Precision Reticle Ticks (Snap inward on hover) */}
      <span className="pointer-events-none absolute top-1 left-1 h-2 w-2 border-t border-l border-white/30 transition-all duration-150 group-hover:top-1.5 group-hover:left-1.5 group-hover:border-rhodes-cyan" />
      <span className="pointer-events-none absolute top-1 right-1 h-2 w-2 border-t border-r border-white/30 transition-all duration-150 group-hover:top-1.5 group-hover:right-1.5 group-hover:border-rhodes-cyan" />
      <span className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 border-b border-l border-white/30 transition-all duration-150 group-hover:bottom-1.5 group-hover:left-1.5 group-hover:border-rhodes-cyan" />
      <span className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 border-b border-r border-white/30 transition-all duration-150 group-hover:bottom-1.5 group-hover:right-1.5 group-hover:border-rhodes-cyan" />

      {/* Top Row: Sector Code & Coordinate / Move Cycle Stamp */}
      <div className="relative z-10 flex items-center justify-between w-full gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.16em] ${
              isWinningCell
                ? "text-rhodes-bone"
                : value === "X"
                ? "text-rhodes-cyan"
                : value === "O"
                ? "text-rhodes-reunion"
                : "text-rhodes-bone/70 group-hover:text-rhodes-bone"
            }`}
          >
            {sector.code}
          </span>
          {sector.tacticalWeight === "CORE" && value === null && (
            <span className="hidden sm:inline-block border border-rhodes-amber/40 bg-rhodes-amber/10 px-1 text-[8px] font-mono text-rhodes-amber tracking-widest">
              NEXUS
            </span>
          )}
        </div>

        {moveOrderNumber !== null ? (
          <span
            className={`px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] border ${
              isLastMove
                ? "border-rhodes-amber bg-rhodes-amber text-rhodes-obsidian font-bold"
                : "border-white/15 bg-black/60 text-rhodes-bone/60"
            }`}
          >
            CYC.0{moveOrderNumber}
          </span>
        ) : (
          <span className="font-mono text-[9px] tracking-[0.15em] text-rhodes-bone/35 group-hover:text-rhodes-bone/70">
            [{sector.index + 1}]
          </span>
        )}
      </div>

      {/* Center Stage: Deployed Emblem OR Hover Target Reticle / PRTS Telemetry */}
      <div className="relative z-10 my-auto flex items-center justify-center w-full">
        {value === "X" && <RhodesVanguardMark isWinningCell={isWinningCell} />}
        {value === "O" && (
          <ReunionOriginiumSigil isWinningCell={isWinningCell} />
        )}

        {value === null && (
          <div className="relative flex flex-col items-center justify-center">
            {/* Ghost preview on hover */}
            <div className="opacity-0 scale-90 transition-all duration-150 group-hover:opacity-35 group-hover:scale-100">
              {activePlayer === "X" ? (
                <RhodesVanguardMark size="md" />
              ) : (
                <ReunionOriginiumSigil size="md" />
              )}
            </div>

            {/* Idle center crosshair */}
            <span className="pointer-events-none absolute font-mono text-xs text-white/15 group-hover:opacity-0 transition-opacity">
              +
            </span>

            {/* PRTS Neural Evaluation Overlay Badge */}
            {showTelemetry &&
              telemetry &&
              telemetry.classification !== "OCCUPIED" && (
                <div
                  className={`mt-1 border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] uppercase ${telemetryColor}`}
                >
                  {telemetry.classification === "OPTIMAL"
                    ? "OPT"
                    : telemetry.classification === "CRITICAL_RISK"
                    ? "RISK"
                    : "NEUT"}{" "}
                  {telemetry.score > 0 ? `+${telemetry.score}` : telemetry.score}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Bottom Row: Zone Name & Originium Density */}
      <div className="relative z-10 flex items-end justify-between w-full gap-1 border-t border-white/10 pt-1.5">
        <span className="truncate font-mono text-[8px] sm:text-[9px] tracking-[0.14em] text-rhodes-bone/45 group-hover:text-rhodes-bone/80">
          {sector.zoneName}
        </span>
        <span className="hidden sm:inline font-mono text-[8px] tracking-[0.12em] text-rhodes-bone/35">
          {sector.originiumDensity}
        </span>
      </div>
    </motion.button>
  );
}

