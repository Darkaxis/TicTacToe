"use client";

import React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Volume2, VolumeX, Lightbulb } from "lucide-react";
import { useTicTacToe } from "@/hooks/use-tic-tac-toe";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopographicBg } from "./topographic-bg";
import { BrandLogo } from "./marks";
import { ScrambleText } from "./scramble-text";
import { Scoreboard } from "./scoreboard";
import { GameControls } from "./game-controls";
import { GameBoard } from "./game-board";
import { ResultModal } from "./result-modal";
import { GuideDialog } from "./guide-dialog";

export function TicTacToe() {
  const {
    board,
    history,
    currentStep,
    lastMoveIndex,
    activePlayer,
    winningLine,
    isDraw,
    isGameOver,
    gameMode,
    difficulty,
    humanSymbol,
    showHints,
    audioEnabled,
    showResultBanner,
    bannerDismissed,
    isBotThinking,
    isBoardShaking,
    resetSweepKey,
    hoveredIndex,
    pulseCenterIndex,
    scores,
    evaluations,
    statusText,
    makeMove,
    resetGame,
    undoMove,
    jumpToStep,
    toggleAudio,
    toggleHints,
    changeMode,
    changeDifficulty,
    changeHumanSymbol,
    resetScores,
    dismissBanner,
    handleCellHover,
  } = useTicTacToe();

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={150}>
        <div className="relative min-h-screen w-full bg-[#090A0D] text-[#ECEAE4] flex flex-col justify-between overflow-x-hidden">
          <TopographicBg activePlayer={activePlayer} />

          <ResultModal
            isOpen={showResultBanner}
            winningLine={winningLine}
            isDraw={isDraw}
            moveCount={currentStep}
            gameMode={gameMode}
            humanSymbol={humanSymbol}
            onDismissInspect={dismissBanner}
            onPlayAgain={resetGame}
          />

          {/* Header */}
          <motion.header
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 border-b border-white/15 bg-[#0B0E14]/90"
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-white/20 bg-[#12161F]">
                  <BrandLogo className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.22em] text-tactical-cyan uppercase">
                    TACTICAL GRID
                  </div>
                  <h1 className="font-display text-lg sm:text-xl font-black tracking-[0.08em] text-tactical-bone uppercase leading-none">
                    TIC-TAC-TOE
                  </h1>
                </div>
              </div>

              <motion.div
                layout
                className="hidden sm:flex items-center gap-2.5 border border-white/15 bg-[#0F131C] px-3.5 py-1.5 clip-chamfer-sm"
              >
                <span
                  className={`h-2 w-2 transition-colors duration-200 ${
                    isGameOver
                      ? "bg-tactical-amber"
                      : activePlayer === "X"
                      ? "bg-tactical-cyan animate-pulse"
                      : "bg-tactical-crimson animate-pulse"
                  }`}
                />
                <ScrambleText
                  text={statusText}
                  triggerKey={statusText}
                  durationMs={260}
                  className={`font-mono text-xs font-bold tracking-[0.16em] ${
                    isGameOver
                      ? "text-tactical-amber"
                      : activePlayer === "X"
                      ? "text-tactical-cyan"
                      : "text-tactical-crimson"
                  }`}
                />
              </motion.div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 border border-white/15 bg-[#12161F] px-2.5 py-1.5">
                      <Lightbulb
                        className={`h-3.5 w-3.5 transition-colors ${
                          showHints
                            ? "text-tactical-cyan"
                            : "text-tactical-bone/45"
                        }`}
                      />
                      <span className="hidden md:inline font-mono text-[10px] tracking-[0.14em] text-tactical-bone/80">
                        HINTS
                      </span>
                      <Switch
                        checked={showHints}
                        onCheckedChange={(val) => toggleHints(val)}
                        aria-label="Toggle Move Hints"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Show best move hints [H]</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleAudio}
                      aria-label={audioEnabled ? "Mute sound" : "Unmute sound"}
                    >
                      {audioEnabled ? (
                        <Volume2 className="h-4 w-4 text-tactical-cyan" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-tactical-bone/45" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {audioEnabled ? "Mute SFX [M]" : "Unmute SFX [M]"}
                  </TooltipContent>
                </Tooltip>

                <GuideDialog />
              </div>
            </div>
          </motion.header>

          {/* Main Centered Workspace */}
          <main className="relative z-10 mx-auto my-auto w-full max-w-5xl px-4 py-6 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <motion.section
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="lg:col-span-5 flex flex-col gap-4"
              >
                <Scoreboard
                  scores={scores}
                  activePlayer={activePlayer}
                  isGameOver={isGameOver}
                  gameMode={gameMode}
                  humanSymbol={humanSymbol}
                  onResetScores={resetScores}
                />

                <GameControls
                  gameMode={gameMode}
                  difficulty={difficulty}
                  humanSymbol={humanSymbol}
                  history={history}
                  currentStep={currentStep}
                  isBotThinking={isBotThinking}
                  onChangeMode={changeMode}
                  onChangeDifficulty={changeDifficulty}
                  onChangeSymbol={changeHumanSymbol}
                  onJumpToStep={jumpToStep}
                  onUndo={undoMove}
                  onReset={resetGame}
                />
              </motion.section>

              <motion.section
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.42,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="lg:col-span-7 flex flex-col items-center justify-center"
              >
                <div className="sm:hidden mb-3 flex w-full max-w-[480px] items-center justify-between border border-white/15 bg-[#0F131C] px-3.5 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 ${
                        isGameOver
                          ? "bg-tactical-amber"
                          : activePlayer === "X"
                          ? "bg-tactical-cyan animate-pulse"
                          : "bg-tactical-crimson animate-pulse"
                      }`}
                    />
                    <span className="font-mono text-xs font-bold tracking-[0.14em]">
                      {statusText}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-tactical-bone/50">
                    {currentStep}/9
                  </span>
                </div>

                <GameBoard
                  board={board}
                  activePlayer={activePlayer}
                  winningLine={winningLine}
                  lastMoveIndex={lastMoveIndex}
                  isGameOver={isGameOver}
                  isBotThinking={isBotThinking}
                  isBoardShaking={isBoardShaking}
                  resetSweepKey={resetSweepKey}
                  hoveredIndex={hoveredIndex}
                  pulseCenterIndex={pulseCenterIndex}
                  showHints={showHints}
                  evaluations={evaluations}
                  onSelectCell={(idx) => makeMove(idx, false)}
                  onHoverCell={handleCellHover}
                />

                <AnimatePresence>
                  {isGameOver && bannerDismissed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.22 }}
                      className="mt-4 flex w-full max-w-[480px] items-center justify-between border border-white/20 bg-[#11151E] px-4 py-2.5"
                    >
                      <span className="font-mono text-xs tracking-wider text-tactical-bone/80">
                        {winningLine
                          ? gameMode === "AI"
                            ? winningLine.winner === humanSymbol
                              ? `You won (${winningLine.label})`
                              : `Bot won (${winningLine.label})`
                            : `${winningLine.winner} wins (${winningLine.label})`
                          : "Match ended in a draw"}
                      </span>
                      <Button size="sm" onClick={resetGame}>
                        Play Again
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-20 border-t border-white/10 bg-[#07090D] py-2.5 px-4 sm:px-6">
            <div className="mx-auto flex max-w-5xl items-center justify-between font-mono text-[10px] tracking-[0.16em] text-tactical-bone/40">
              <span>TACTICAL TIC-TAC-TOE</span>
              <span className="hidden sm:inline">
                [1-9] PLACE · [Z] UNDO · [H] HINTS · [R] NEW GAME
              </span>
            </div>
          </footer>
        </div>
      </TooltipProvider>
    </MotionConfig>
  );
}

