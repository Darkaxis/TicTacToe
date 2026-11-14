"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Eye, ShieldCheck, AlertTriangle, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WinningVector, PlayerSymbol } from "@/lib/tactical-engine";
import { ScrambleText } from "./scramble-text";

interface OperationResultBannerProps {
  winner: WinningVector | null;
  isDraw: boolean;
  dismissed: boolean;
  moveCount: number;
  gameMode: "PRTS_AI" | "LOCAL_PVP";
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

  // Determine operation rating stars (3 stars for fast win, 2 stars standard win, 1 star draw, 0 stars loss)
  const isPlayerVictory =
    winner !== null &&
    (gameMode === "LOCAL_PVP" || winner.winner === humanSymbol);
  const isAIDefeat =
    winner !== null &&
    gameMode === "PRTS_AI" &&
    winner.winner !== humanSymbol;

  const stars = isPlayerVictory ? (moveCount <= 6 ? 3 : 2) : isDraw ? 1 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="operation-result-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
        >
          {/* Full-width angled tactical slab */}
          <motion.div
            initial={{ scaleY: 0.05, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0.05, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl border-y-2 border-x border-white/25 bg-[#0D1016] shadow-none overflow-hidden clip-chamfer-lg"
            style={{
              borderTopColor:
                winner?.winner === "X"
                  ? "#00C8FF"
                  : winner?.winner === "O"
                  ? "#FF3B1D"
                  : "#FFD000",
              borderBottomColor:
                winner?.winner === "X"
                  ? "#00C8FF"
                  : winner?.winner === "O"
                  ? "#FF3B1D"
                  : "#FFD000",
            }}
          >
            {/* Top Hazard Stripe Bar */}
            <div
              className={`h-2.5 w-full ${
                winner?.winner === "X"
                  ? "bg-hazard-cyan"
                  : winner?.winner === "O"
                  ? "bg-hazard-reunion"
                  : "bg-hazard-amber"
              }`}
            />

            {/* Giant Background Watermark Typography */}
            <div className="pointer-events-none select-none absolute -right-4 -bottom-6 font-display text-[88px] sm:text-[130px] font-black leading-none tracking-tighter text-white/[0.03] uppercase">
              {isDraw
                ? "STALEMATE"
                : isAIDefeat
                ? "BREACHED"
                : "CLEARED"}
            </div>

            <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-6">
              {/* Top Row: Classification & Star Rating */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      winner?.winner === "X"
                        ? "rhodes"
                        : winner?.winner === "O"
                        ? "reunion"
                        : "caution"
                    }
                  >
                    {winner
                      ? `SECTOR LOCK // ${winner.vectorName}`
                      : "ORIGINIUM EQUILIBRIUM // 9/9 SECTORS SATURATED"}
                  </Badge>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-rhodes-bone/50">
                    CYCLES ELAPSED: 0{moveCount}
                  </span>
                </div>

                {/* Arknights 3-Star Operation Rating */}
                <div className="flex items-center gap-2 bg-black/60 border border-white/15 px-3 py-1">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/60 mr-1">
                    RATING
                  </span>
                  {[1, 2, 3].map((idx) => {
                    const active = idx <= stars;
                    return (
                      <motion.span
                        key={idx}
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 45 }}
                        transition={{
                          delay: 0.15 + idx * 0.09,
                          type: "spring",
                          stiffness: 350,
                        }}
                        className={`inline-block h-3 w-3 border ${
                          active
                            ? "bg-rhodes-amber border-rhodes-amber"
                            : "bg-transparent border-white/25"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Main Operation Title & Sub-Readout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs tracking-[0.24em] text-rhodes-bone/65">
                    {isDraw ? (
                      <AlertTriangle className="w-4 h-4 text-rhodes-amber" />
                    ) : isAIDefeat ? (
                      <Crosshair className="w-4 h-4 text-rhodes-reunion" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-rhodes-cyan" />
                    )}
                    <span>
                      {isDraw
                        ? "// 战局僵持 — TACTICAL DEADLOCK RECORDED"
                        : isAIDefeat
                        ? "// 行动失败 — PRTS NEURAL COUNTER-STRIKE"
                        : "// 作战结束 — MISSION ACCOMPLISHED"}
                    </span>
                  </div>

                  <h2
                    className={`font-display text-4xl sm:text-6xl font-black uppercase tracking-[0.06em] leading-none ${
                      winner?.winner === "X"
                        ? "text-rhodes-cyan"
                        : winner?.winner === "O"
                        ? "text-rhodes-reunion"
                        : "text-rhodes-amber"
                    }`}
                  >
                    <ScrambleText
                      text={
                        isDraw
                          ? "OPERATION STALEMATE"
                          : winner?.winner === "X"
                          ? "RHODES ISLAND VICTORY"
                          : "REUNION FORCE VICTORY"
                      }
                      durationMs={450}
                    />
                  </h2>

                  <p className="font-mono text-xs text-rhodes-bone/70 max-w-xl leading-relaxed pt-1">
                    {isDraw
                      ? "All nine Originium matrix sectors reached full tactical saturation without a contiguous 3-sector strike vector. Recommend immediate re-deployment."
                      : winner?.winner === "X"
                      ? `Operator Vanguard [X] established contiguous dominance across ${winner.vectorName} in ${moveCount} tactical cycles.`
                      : `Originium Hostile Sigil [O] secured ${winner?.vectorName} in ${moveCount} tactical cycles. Defense perimeter compromised.`}
                  </p>
                </div>

                {/* Right Column: Arknights Combat Rewards / Telemetry Box */}
                <div className="lg:col-span-4 border border-white/15 bg-black/50 p-4 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-[10px] tracking-[0.18em] text-rhodes-bone/50 border-b border-white/10 pb-1.5">
                    <span>COMBAT TELEMETRY</span>
                    <span>PRTS // VERIFIED</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-rhodes-bone/60">TRUST GAIN</span>
                      <span className="text-rhodes-cyan font-bold">
                        {isPlayerVictory ? "+100% [MAX]" : isDraw ? "+45%" : "+15%"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rhodes-bone/60">LMD BOUNTY</span>
                      <span className="text-rhodes-bone font-bold">
                        {isPlayerVictory ? "+1,800 LMD" : isDraw ? "+600 LMD" : "+0 LMD"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rhodes-bone/60">SANITY DELTA</span>
                      <span className="text-rhodes-amber font-bold">0 // SANDBOX</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
                <Button
                  variant="outline"
                  onClick={onDismissInspect}
                  className="gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>INSPECT TACTICAL GRID</span>
                </Button>

                <Button
                  variant={winner?.winner === "O" ? "reunion" : "default"}
                  size="lg"
                  onClick={onNextOperation}
                  className="gap-2.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>INITIALIZE NEXT OPERATION [R]</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

