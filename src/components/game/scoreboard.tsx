"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { GameMode, PlayerSymbol, ScoreBoard } from "@/types/game";
import { MarkX, MarkO } from "./marks";

interface ScoreboardProps {
  scores: ScoreBoard;
  activePlayer: PlayerSymbol;
  isGameOver: boolean;
  gameMode: GameMode;
  humanSymbol: PlayerSymbol;
  onResetScores: () => void;
}

function RollingDigit({ value }: { value: number }) {
  return (
    <div className="relative h-8 min-w-[1.5rem] overflow-hidden flex items-center justify-end">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl font-black leading-none block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function Scoreboard({
  scores,
  activePlayer,
  isGameOver,
  gameMode,
  humanSymbol,
  onResetScores,
}: ScoreboardProps) {
  const xLabel =
    gameMode === "AI" ? (humanSymbol === "X" ? "YOU" : "BOT") : "PLAYER 1";
  const oLabel =
    gameMode === "AI" ? (humanSymbol === "O" ? "YOU" : "BOT") : "PLAYER 2";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Mark X Card */}
        <div
          className={`relative border p-3.5 transition-colors duration-200 clip-chamfer-sm overflow-hidden ${
            activePlayer === "X" && !isGameOver
              ? "border-tactical-cyan text-[#090A0D]"
              : "border-white/20 bg-[#11151E] text-tactical-bone"
          }`}
        >
          {activePlayer === "X" && !isGameOver && (
            <motion.div
              layoutId="active-turn-card-plate"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="absolute inset-0 bg-[#ECEAE4] z-0"
            />
          )}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center bg-[#090A0D] border border-tactical-cyan/50">
                <MarkX size="sm" />
              </div>
              <div>
                <div className="font-display text-sm font-black tracking-wider uppercase leading-none">
                  {xLabel}
                </div>
                <div className="font-mono text-[9px] opacity-65 mt-0.5">
                  MARK X
                </div>
              </div>
            </div>
            <RollingDigit value={scores.X} />
          </div>
        </div>

        {/* Mark O Card */}
        <div
          className={`relative border p-3.5 transition-colors duration-200 clip-chamfer-sm overflow-hidden ${
            activePlayer === "O" && !isGameOver
              ? "border-tactical-crimson text-[#090A0D]"
              : "border-white/20 bg-[#11151E] text-tactical-bone"
          }`}
        >
          {activePlayer === "O" && !isGameOver && (
            <motion.div
              layoutId="active-turn-card-plate"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="absolute inset-0 bg-[#ECEAE4] z-0"
            />
          )}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center bg-[#090A0D] border border-tactical-crimson/50">
                <MarkO size="sm" />
              </div>
              <div>
                <div className="font-display text-sm font-black tracking-wider uppercase leading-none">
                  {oLabel}
                </div>
                <div className="font-mono text-[9px] opacity-65 mt-0.5">
                  MARK O
                </div>
              </div>
            </div>
            <RollingDigit value={scores.O} />
          </div>
        </div>
      </div>

      {/* Draws Bar */}
      <div className="flex items-center justify-between border border-white/15 bg-[#0D1017] px-3.5 py-2 font-mono text-[11px] tracking-[0.14em]">
        <span className="text-tactical-bone/60">DRAWS</span>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={scores.DRAW}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-tactical-amber font-bold inline-block"
            >
              {scores.DRAW}
            </motion.span>
          </AnimatePresence>
          {(scores.X > 0 || scores.O > 0 || scores.DRAW > 0) && (
            <button
              type="button"
              onClick={onResetScores}
              title="Reset Scores"
              className="text-tactical-bone/40 hover:text-tactical-crimson transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

