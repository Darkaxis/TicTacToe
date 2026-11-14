"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerSymbol, WinningVector, GameMode } from "@/lib/tactical-engine";
import { ScrambleText } from "./scramble-text";

interface OperationResultBannerProps {
  winner: WinningVector | null;
  isDraw: boolean;
  dismissed: boolean;
  moveCount: number;
  gameMode: GameMode;
  humanSymbol: PlayerSymbol;
  onDismissInspect: () => void;
  onNextOperation: () => void;
}

export function OperationResultBanner({
  winner,
  isDraw,
  dismissed,
  moveCount,
  gameMode,
  humanSymbol,
  onDismissInspect,
  onNextOperation,
}: OperationResultBannerProps) {
  const isOpen = (winner !== null || isDraw) && !dismissed;

  const isHumanWin =
    winner !== null && (gameMode === "PVP" || winner.winner === humanSymbol);
  const isBotWin =
    winner !== null && gameMode === "AI" && winner.winner !== humanSymbol;

  const stars = isHumanWin ? (moveCount <= 6 ? 3 : 2) : isDraw ? 1 : 0;

  const headline = isDraw
    ? "DRAW // STALEMATE"
    : gameMode === "AI"
    ? isHumanWin
      ? "YOU WIN"
      : "BOT WINS"
    : winner?.winner === "X"
    ? "PLAYER 1 WINS"
    : "PLAYER 2 WINS";

  const subtext = isDraw
    ? "Neither side completed a line of three."
    : gameMode === "AI"
    ? isBotWin
      ? `Bot (${winner?.winner}) won on ${winner?.label} in ${moveCount} moves.`
      : `You (${winner?.winner}) won on ${winner?.label} in ${moveCount} moves.`
    : `${
        winner?.winner === "X" ? "Player 1" : "Player 2"
      } (${winner?.winner}) won on ${winner?.label} in ${moveCount} moves.`;

  const accentBorder =
    winner?.winner === "X"
      ? "#00C8FF"
      : winner?.winner === "O"
      ? "#FF3B1D"
      : "#FFD000";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="operation-result-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ scaleY: 0.1, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0.1, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl border-y-2 border-x border-white/25 bg-[#0D1016] clip-chamfer-lg overflow-hidden"
            style={{
              borderTopColor: accentBorder,
              borderBottomColor: accentBorder,
            }}
          >
            {/* Top Hazard Stripe */}
            <div
              className={`h-2 w-full ${
                winner?.winner === "X"
                  ? "bg-hazard-cyan"
                  : winner?.winner === "O"
                  ? "bg-hazard-reunion"
                  : "bg-hazard-amber"
              }`}
            />

            <div className="p-6 sm:p-8 space-y-5">
              {/* Top status & 3-Star rating */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="font-mono text-[11px] tracking-[0.2em] text-rhodes-bone/65 uppercase">
                  {winner ? winner.label : "All 9 squares filled"}
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
                          delay: 0.12 + idx * 0.08,
                          type: "spring",
                          stiffness: 350,
                        }}
                        className={`inline-block h-2.5 w-2.5 border ${
                          active
                            ? "bg-rhodes-amber border-rhodes-amber"
                            : "bg-transparent border-white/25"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <h2
                  className={`font-display text-4xl sm:text-5xl font-black uppercase tracking-[0.06em] leading-none ${
                    winner?.winner === "X"
                      ? "text-rhodes-cyan"
                      : winner?.winner === "O"
                      ? "text-rhodes-reunion"
                      : "text-rhodes-amber"
                  }`}
                >
                  <ScrambleText text={headline} durationMs={360} />
                </h2>
                <p className="font-mono text-xs text-rhodes-bone/65">
                  {subtext}
                </p>
              </div>

              {/* Action Buttons */}
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
                  variant={winner?.winner === "O" ? "reunion" : "default"}
                  size="lg"
                  onClick={onNextOperation}
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
