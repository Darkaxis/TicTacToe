"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Eye } from "lucide-react";
import { GameMode, PlayerSymbol, WinningLine } from "@/types/game";
import { Button } from "@/components/ui/button";
import { ScrambleText } from "./scramble-text";

interface ResultModalProps {
  isOpen: boolean;
  winningLine: WinningLine | null;
  isDraw: boolean;
  moveCount: number;
  gameMode: GameMode;
  humanSymbol: PlayerSymbol;
  onDismissInspect: () => void;
  onPlayAgain: () => void;
}

export function ResultModal({
  isOpen,
  winningLine,
  isDraw,
  moveCount,
  gameMode,
  humanSymbol,
  onDismissInspect,
  onPlayAgain,
}: ResultModalProps) {
  const isHumanWin =
    winningLine !== null &&
    (gameMode === "PVP" || winningLine.winner === humanSymbol);
  const isBotWin =
    winningLine !== null &&
    gameMode === "AI" &&
    winningLine.winner !== humanSymbol;

  const stars = isHumanWin ? (moveCount <= 6 ? 3 : 2) : isDraw ? 1 : 0;

  const headline = isDraw
    ? "DRAW // STALEMATE"
    : gameMode === "AI"
    ? isHumanWin
      ? "YOU WIN"
      : "BOT WINS"
    : winningLine?.winner === "X"
    ? "PLAYER 1 WINS"
    : "PLAYER 2 WINS";

  const subtext = isDraw
    ? "Neither side completed a line of three."
    : gameMode === "AI"
    ? isBotWin
      ? `Bot (${winningLine?.winner}) won on ${winningLine?.label} in ${moveCount} moves.`
      : `You (${winningLine?.winner}) won on ${winningLine?.label} in ${moveCount} moves.`
    : `${
        winningLine?.winner === "X" ? "Player 1" : "Player 2"
      } (${winningLine?.winner}) won on ${winningLine?.label} in ${moveCount} moves.`;

  const accentBorder =
    winningLine?.winner === "X"
      ? "#00C8FF"
      : winningLine?.winner === "O"
      ? "#FF3B1D"
      : "#FFD000";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="match-result-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/68 backdrop-blur-[2px] p-4"
        >
          <motion.div
            initial={{ clipPath: "inset(48% 0% 48% 0%)", opacity: 0, y: 8 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0 }}
            exit={{ clipPath: "inset(48% 0% 48% 0%)", opacity: 0, y: 6 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl border-y-2 border-x border-white/25 bg-[#0D1016] clip-chamfer-lg overflow-hidden"
            style={{
              borderTopColor: accentBorder,
              borderBottomColor: accentBorder,
            }}
          >
            <div
              className={`h-2 w-full ${
                winningLine?.winner === "X"
                  ? "bg-hazard-cyan"
                  : winningLine?.winner === "O"
                  ? "bg-hazard-crimson"
                  : "bg-hazard-amber"
              }`}
            />

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="font-mono text-[11px] tracking-[0.2em] text-tactical-bone/65 uppercase">
                  {winningLine ? winningLine.label : "All 9 squares filled"}
                </span>

                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((idx) => {
                    const active = idx <= stars;
                    return (
                      <motion.span
                        key={idx}
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 45 }}
                        transition={{
                          delay: 0.14 + idx * 0.08,
                          type: "spring",
                          stiffness: 380,
                          damping: 20,
                        }}
                        className={`inline-block h-2.5 w-2.5 border ${
                          active
                            ? "bg-tactical-amber border-tactical-amber"
                            : "bg-transparent border-white/25"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <h2
                  className={`font-display text-4xl sm:text-5xl font-black uppercase tracking-[0.06em] leading-none ${
                    winningLine?.winner === "X"
                      ? "text-tactical-cyan"
                      : winningLine?.winner === "O"
                      ? "text-tactical-crimson"
                      : "text-tactical-amber"
                  }`}
                >
                  <ScrambleText text={headline} durationMs={380} />
                </h2>
                <p className="font-mono text-xs text-tactical-bone/65">
                  {subtext}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onDismissInspect}
                  className="gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Board</span>
                </Button>

                <Button
                  variant={winningLine?.winner === "O" ? "crimson" : "default"}
                  size="lg"
                  onClick={onPlayAgain}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again [R]</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

