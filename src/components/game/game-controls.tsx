"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, RotateCcw, Undo2, Users } from "lucide-react";
import { Difficulty, GameMode, HistoryStep, PlayerSymbol } from "@/types/game";
import { CELL_COORDINATES } from "@/lib/game-engine";
import { Button } from "@/components/ui/button";
import { MarkX, MarkO } from "./marks";

interface GameControlsProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  humanSymbol: PlayerSymbol;
  history: HistoryStep[];
  currentStep: number;
  isBotThinking: boolean;
  onChangeMode: (mode: GameMode) => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onChangeSymbol: (symbol: PlayerSymbol) => void;
  onJumpToStep: (step: number) => void;
  onUndo: () => void;
  onReset: () => void;
}

export function GameControls({
  gameMode,
  difficulty,
  humanSymbol,
  history,
  currentStep,
  isBotThinking,
  onChangeMode,
  onChangeDifficulty,
  onChangeSymbol,
  onJumpToStep,
  onUndo,
  onReset,
}: GameControlsProps) {
  return (
    <div className="space-y-4">
      {/* Match Settings */}
      <div className="border border-white/20 bg-[#0E121A]/95 p-4 clip-chamfer-md space-y-4">
        <div className="space-y-1.5">
          <span className="block font-mono text-[10px] tracking-[0.18em] text-tactical-bone/55 uppercase">
            Game Mode
          </span>
          <div className="grid grid-cols-2 bg-tactical-obsidian border border-white/15 p-0.5">
            {(
              [
                { id: "AI", label: "You vs Bot", Icon: Bot },
                { id: "PVP", label: "2 Players", Icon: Users },
              ] as { id: GameMode; label: string; Icon: typeof Bot }[]
            ).map(({ id, label, Icon }) => {
              const active = gameMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChangeMode(id)}
                  className={`relative flex items-center justify-center gap-1.5 py-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "text-tactical-obsidian font-bold"
                      : "text-tactical-bone/60 hover:text-tactical-bone"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="mode-active-pill"
                      transition={{ type: "spring", stiffness: 460, damping: 35 }}
                      className="absolute inset-0 bg-tactical-bone"
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {gameMode === "AI" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <span className="block font-mono text-[10px] tracking-[0.18em] text-tactical-bone/55 uppercase">
                Bot Difficulty
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "EASY", label: "Easy" },
                    { id: "NORMAL", label: "Normal" },
                    { id: "UNBEATABLE", label: "Unbeatable" },
                  ] as { id: Difficulty; label: string }[]
                ).map((tier) => {
                  const active = difficulty === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => onChangeDifficulty(tier.id)}
                      className={`relative border py-2 px-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                        active
                          ? "border-tactical-cyan text-tactical-cyan font-bold"
                          : "border-white/15 bg-black/40 text-tactical-bone/60 hover:border-white/35 hover:text-tactical-bone"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="difficulty-active-pill"
                          transition={{
                            type: "spring",
                            stiffness: 460,
                            damping: 35,
                          }}
                          className="absolute inset-0 bg-tactical-cyan/15"
                        />
                      )}
                      <span className="relative z-10">{tier.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block font-mono text-[10px] tracking-[0.18em] text-tactical-bone/55 uppercase">
                Play As
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeSymbol("X")}
                  className={`relative flex items-center justify-center gap-2 border py-2 px-3 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    humanSymbol === "X"
                      ? "border-tactical-cyan text-tactical-cyan font-bold"
                      : "border-white/15 bg-black/40 text-tactical-bone/60 hover:border-white/30"
                  }`}
                >
                  {humanSymbol === "X" && (
                    <motion.span
                      layoutId="side-active-pill"
                      transition={{
                        type: "spring",
                        stiffness: 460,
                        damping: 35,
                      }}
                      className="absolute inset-0 bg-tactical-cyan/15"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <MarkX size="sm" />
                    <span>X (First)</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeSymbol("O")}
                  className={`relative flex items-center justify-center gap-2 border py-2 px-3 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    humanSymbol === "O"
                      ? "border-tactical-crimson text-tactical-crimson font-bold"
                      : "border-white/15 bg-black/40 text-tactical-bone/60 hover:border-white/30"
                  }`}
                >
                  {humanSymbol === "O" && (
                    <motion.span
                      layoutId="side-active-pill"
                      transition={{
                        type: "spring",
                        stiffness: 460,
                        damping: 35,
                      }}
                      className="absolute inset-0 bg-tactical-crimson/15"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <MarkO size="sm" />
                    <span>O (Second)</span>
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Move History & Action Buttons */}
      <div className="border border-white/15 bg-[#0D1017] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em] text-tactical-bone/55 uppercase">
            Move History
          </span>
          <span className="font-mono text-[10px] text-tactical-bone/45">
            {currentStep}/9
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          {history.length === 1 ? (
            <span className="font-mono text-[10px] text-tactical-bone/35">
              Select any square to begin.
            </span>
          ) : (
            history.slice(1).map((step, idx) => {
              const stepNum = idx + 1;
              const isCurrent = stepNum === currentStep;
              const code =
                step.moveIndex !== null
                  ? CELL_COORDINATES[step.moveIndex].code
                  : "";
              return (
                <motion.button
                  key={stepNum}
                  type="button"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onClick={() => onJumpToStep(stepNum)}
                  className={`border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                    isCurrent
                      ? "border-tactical-cyan bg-tactical-cyan/20 text-tactical-bone font-bold"
                      : stepNum > currentStep
                      ? "border-white/10 bg-black/30 text-tactical-bone/30 hover:border-white/25"
                      : "border-white/15 bg-black/50 text-tactical-bone/75 hover:border-white/35"
                  }`}
                >
                  <span
                    className={
                      step.player === "X"
                        ? "text-tactical-cyan"
                        : "text-tactical-crimson"
                    }
                  >
                    {step.player}
                  </span>{" "}
                  {code}
                </motion.button>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep === 0 || isBotThinking}
            onClick={onUndo}
            className="w-full"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Undo [Z]</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onReset}
            className="w-full"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Game [R]</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

