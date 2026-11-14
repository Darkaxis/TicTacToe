"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  Users,
  Lightbulb,
  Undo2,
  Trash2,
} from "lucide-react";
import {
  BoardState,
  CellEvaluation,
  computeSectorEvaluations,
  Difficulty,
  evaluateWinner,
  GameMode,
  isBoardFull,
  PlayerSymbol,
  SECTORS,
  selectAIMove,
} from "@/lib/tactical-engine";
import { tacticalAudio } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopographicCanvas } from "./topographic-canvas";
import {
  RhodesCrestLogo,
  RhodesVanguardMark,
  ReunionOriginiumSigil,
} from "./tactical-emblems";
import { ScrambleText } from "./scramble-text";
import { TacticalSectorCell } from "./tactical-sector-cell";
import { WinningVectorOverlay } from "./winning-vector-overlay";
import { OperationResultBanner } from "./operation-result-banner";
import { TacticalDossierModal } from "./tactical-dossier-modal";

interface HistoryStep {
  board: BoardState;
  moveIndex: number | null;
  player: PlayerSymbol | null;
}

const INITIAL_BOARD: BoardState = Array(9).fill(null);

export function PRTStacticalHUD() {
  const [history, setHistory] = useState<HistoryStep[]>([
    { board: INITIAL_BOARD, moveIndex: null, player: null },
  ]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>("AI");
  const [difficulty, setDifficulty] = useState<Difficulty>("UNBEATABLE");
  const [humanSymbol, setHumanSymbol] = useState<PlayerSymbol>("X");

  const [showHints, setShowHints] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [boardShake, setBoardShake] = useState<number>(0);

  const [scores, setScores] = useState<{ X: number; O: number; DRAW: number }>({
    X: 0,
    O: 0,
    DRAW: 0,
  });

  const currentSnapshot = history[currentStep];
  const board = currentSnapshot.board;
  const activePlayer: PlayerSymbol = currentStep % 2 === 0 ? "X" : "O";

  const winningVector = useMemo(() => evaluateWinner(board), [board]);
  const isDraw = useMemo(
    () => !winningVector && isBoardFull(board),
    [board, winningVector]
  );
  const isGameOver = winningVector !== null || isDraw;

  const evaluations: CellEvaluation[] = useMemo(
    () =>
      showHints
        ? computeSectorEvaluations(board, activePlayer)
        : SECTORS.map((s) => ({
            index: s.index,
            score: 0,
            status: "OCCUPIED",
          })),
    [board, activePlayer, showHints]
  );

  const makeMove = useCallback(
    (index: number, triggeredByBot = false) => {
      if (board[index] !== null || isGameOver) return;
      if (
        gameMode === "AI" &&
        !triggeredByBot &&
        activePlayer !== humanSymbol
      ) {
        return;
      }

      const nextBoard = [...board];
      nextBoard[index] = activePlayer;

      if (activePlayer === "X") {
        tacticalAudio.playDeployRhodes();
      } else {
        tacticalAudio.playDeployReunion();
      }

      const nextStepIndex = currentStep + 1;
      const nextHistory = [
        ...history.slice(0, currentStep + 1),
        { board: nextBoard, moveIndex: index, player: activePlayer },
      ];
      setHistory(nextHistory);
      setCurrentStep(nextStepIndex);
      setBannerDismissed(false);

      const winCheck = evaluateWinner(nextBoard);
      const drawCheck = !winCheck && isBoardFull(nextBoard);

      if (winCheck) {
        setBoardShake((prev) => prev + 1);
        setScores((prev) => ({
          ...prev,
          [winCheck.winner]: prev[winCheck.winner] + 1,
        }));
        setTimeout(() => tacticalAudio.playOperationEnd(winCheck.winner), 130);
      } else if (drawCheck) {
        setScores((prev) => ({ ...prev, DRAW: prev.DRAW + 1 }));
        setTimeout(() => tacticalAudio.playOperationEnd("DRAW"), 130);
      }
    },
    [
      board,
      isGameOver,
      gameMode,
      activePlayer,
      humanSymbol,
      currentStep,
      history,
    ]
  );

  // Trigger Bot turn automatically
  useEffect(() => {
    if (gameMode !== "AI" || isGameOver) {
      setIsBotThinking(false);
      return;
    }

    const botSymbol: PlayerSymbol = humanSymbol === "X" ? "O" : "X";
    if (activePlayer !== botSymbol) {
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);
    const timer = setTimeout(() => {
      const moveIdx = selectAIMove(board, botSymbol, difficulty);
      setIsBotThinking(false);
      if (moveIdx !== -1) {
        makeMove(moveIdx, true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [gameMode, isGameOver, humanSymbol, activePlayer, board, difficulty, makeMove]);

  const handleResetGame = useCallback(() => {
    tacticalAudio.playLatchClick();
    setIsBotThinking(false);
    setBannerDismissed(false);
    setHistory([{ board: INITIAL_BOARD, moveIndex: null, player: null }]);
    setCurrentStep(0);
  }, []);

  const handleUndo = useCallback(() => {
    if (currentStep === 0 || isBotThinking) return;
    tacticalAudio.playLatchClick();
    const stepBack =
      gameMode === "AI" && currentStep >= 2
        ? currentStep - 2
        : Math.max(0, currentStep - 1);
    setCurrentStep(stepBack);
    setBannerDismissed(false);
  }, [currentStep, isBotThinking, gameMode]);

  const handleToggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      tacticalAudio.setEnabled(next);
      if (next) tacticalAudio.playLatchClick();
      return next;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const key = e.key.toUpperCase();
      if (key >= "1" && key <= "9") {
        makeMove(parseInt(key, 10) - 1, false);
      } else if (key === "R") {
        handleResetGame();
      } else if (key === "H") {
        tacticalAudio.playLatchClick();
        setShowHints((prev) => !prev);
      } else if (key === "Z" || e.key === "Backspace") {
        handleUndo();
      } else if (key === "M") {
        handleToggleAudio();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [makeMove, handleResetGame, handleUndo, handleToggleAudio]);

  const statusText = isGameOver
    ? winningVector
      ? gameMode === "AI"
        ? winningVector.winner === humanSymbol
          ? "YOU WIN"
          : "BOT WINS"
        : winningVector.winner === "X"
        ? "PLAYER 1 WINS"
        : "PLAYER 2 WINS"
      : "DRAW // STALEMATE"
    : isBotThinking
    ? "BOT THINKING..."
    : gameMode === "AI"
    ? activePlayer === humanSymbol
      ? `YOUR TURN [${activePlayer}]`
      : `BOT TURN [${activePlayer}]`
    : activePlayer === "X"
    ? "PLAYER 1 TURN [X]"
    : "PLAYER 2 TURN [O]";

  const xLabel = gameMode === "AI" ? (humanSymbol === "X" ? "YOU" : "BOT") : "PLAYER 1";
  const oLabel = gameMode === "AI" ? (humanSymbol === "O" ? "YOU" : "BOT") : "PLAYER 2";

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative min-h-screen w-full bg-[#090A0D] text-[#ECEAE4] flex flex-col justify-between overflow-x-hidden">
        <TopographicCanvas activePlayer={activePlayer} />

        <OperationResultBanner
          winner={winningVector}
          isDraw={isDraw}
          dismissed={bannerDismissed}
          moveCount={currentStep}
          gameMode={gameMode}
          humanSymbol={humanSymbol}
          onDismissInspect={() => {
            tacticalAudio.playLatchClick();
            setBannerDismissed(true);
          }}
          onNextOperation={handleResetGame}
        />

        {/* ==================== HEADER ==================== */}
        <header className="relative z-20 border-b border-white/15 bg-[#0B0E14]/90">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-white/20 bg-[#12161F]">
                <RhodesCrestLogo className="h-6 w-6" />
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-rhodes-cyan uppercase">
                  TACTICAL GRID
                </div>
                <h1 className="font-display text-lg sm:text-xl font-black tracking-[0.08em] text-rhodes-bone uppercase leading-none">
                  TIC-TAC-TOE
                </h1>
              </div>
            </div>

            {/* Live Turn Indicator */}
            <div className="hidden sm:flex items-center gap-2.5 border border-white/15 bg-[#0F131C] px-3.5 py-1.5 clip-chamfer-sm">
              <span
                className={`h-2 w-2 ${
                  isGameOver
                    ? "bg-rhodes-amber"
                    : activePlayer === "X"
                    ? "bg-rhodes-cyan animate-pulse"
                    : "bg-rhodes-reunion animate-pulse"
                }`}
              />
              <ScrambleText
                text={statusText}
                className={`font-mono text-xs font-bold tracking-[0.16em] ${
                  isGameOver
                    ? "text-rhodes-amber"
                    : activePlayer === "X"
                    ? "text-rhodes-cyan"
                    : "text-rhodes-reunion"
                }`}
              />
            </div>

            {/* Right Utility Controls */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 border border-white/15 bg-[#12161F] px-2.5 py-1.5">
                    <Lightbulb
                      className={`h-3.5 w-3.5 ${
                        showHints ? "text-rhodes-cyan" : "text-rhodes-bone/45"
                      }`}
                    />
                    <span className="hidden md:inline font-mono text-[10px] tracking-[0.14em] text-rhodes-bone/80">
                      HINTS
                    </span>
                    <Switch
                      checked={showHints}
                      onCheckedChange={(val) => {
                        tacticalAudio.playLatchClick();
                        setShowHints(val);
                      }}
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
                    onClick={handleToggleAudio}
                    aria-label={audioEnabled ? "Mute sound" : "Unmute sound"}
                  >
                    {audioEnabled ? (
                      <Volume2 className="h-4 w-4 text-rhodes-cyan" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-rhodes-bone/45" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {audioEnabled ? "Mute SFX [M]" : "Unmute SFX [M]"}
                </TooltipContent>
              </Tooltip>

              <TacticalDossierModal />
            </div>
          </div>
        </header>

        {/* ==================== MAIN STAGE ==================== */}
        <main className="relative z-10 mx-auto my-auto w-full max-w-5xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL: Scoreboard & Controls */}
            <section className="lg:col-span-5 flex flex-col gap-4">
              {/* Scoreboard Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Mark X Card */}
                <div
                  className={`border p-3.5 transition-all duration-200 clip-chamfer-sm ${
                    activePlayer === "X" && !isGameOver
                      ? "border-rhodes-cyan bg-[#ECEAE4] text-[#090A0D]"
                      : "border-white/20 bg-[#11151E] text-rhodes-bone"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center bg-[#090A0D] border border-rhodes-cyan/50">
                        <RhodesVanguardMark size="sm" />
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
                    <span className="font-display text-3xl font-black leading-none">
                      {scores.X}
                    </span>
                  </div>
                </div>

                {/* Mark O Card */}
                <div
                  className={`border p-3.5 transition-all duration-200 clip-chamfer-sm ${
                    activePlayer === "O" && !isGameOver
                      ? "border-rhodes-reunion bg-[#ECEAE4] text-[#090A0D]"
                      : "border-white/20 bg-[#11151E] text-rhodes-bone"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center bg-[#090A0D] border border-rhodes-reunion/50">
                        <ReunionOriginiumSigil size="sm" />
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
                    <span className="font-display text-3xl font-black leading-none">
                      {scores.O}
                    </span>
                  </div>
                </div>
              </div>

              {/* Draws Strip */}
              <div className="flex items-center justify-between border border-white/15 bg-[#0D1017] px-3.5 py-2 font-mono text-[11px] tracking-[0.14em]">
                <span className="text-rhodes-bone/60">DRAWS</span>
                <div className="flex items-center gap-3">
                  <span className="text-rhodes-amber font-bold">
                    {scores.DRAW}
                  </span>
                  {(scores.X > 0 || scores.O > 0 || scores.DRAW > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        tacticalAudio.playLatchClick();
                        setScores({ X: 0, O: 0, DRAW: 0 });
                      }}
                      title="Reset Scores"
                      className="text-rhodes-bone/40 hover:text-rhodes-reunion transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Match Configuration Box */}
              <div className="border border-white/20 bg-[#0E121A]/95 p-4 clip-chamfer-md space-y-4">
                <div className="space-y-1.5">
                  <span className="block font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/55 uppercase">
                    Game Mode
                  </span>
                  <Tabs
                    value={gameMode}
                    onValueChange={(val) => {
                      tacticalAudio.playLatchClick();
                      setGameMode(val as GameMode);
                      handleResetGame();
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="AI" className="gap-1.5">
                        <Bot className="h-3.5 w-3.5" />
                        <span>You vs Bot</span>
                      </TabsTrigger>
                      <TabsTrigger value="PVP" className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>2 Players</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {gameMode === "AI" && (
                  <>
                    <div className="space-y-1.5">
                      <span className="block font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/55 uppercase">
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
                              onClick={() => {
                                tacticalAudio.playLatchClick();
                                setDifficulty(tier.id);
                                handleResetGame();
                              }}
                              className={`border py-2 px-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                                active
                                  ? "border-rhodes-cyan bg-rhodes-cyan/15 text-rhodes-cyan font-bold"
                                  : "border-white/15 bg-black/40 text-rhodes-bone/60 hover:border-white/35 hover:text-rhodes-bone"
                              }`}
                            >
                              {tier.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/55 uppercase">
                        Play As
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (humanSymbol !== "X") {
                              tacticalAudio.playLatchClick();
                              setHumanSymbol("X");
                              handleResetGame();
                            }
                          }}
                          className={`flex items-center justify-center gap-2 border py-2 px-3 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                            humanSymbol === "X"
                              ? "border-rhodes-cyan bg-rhodes-cyan/15 text-rhodes-cyan font-bold"
                              : "border-white/15 bg-black/40 text-rhodes-bone/60 hover:border-white/30"
                          }`}
                        >
                          <RhodesVanguardMark size="sm" />
                          <span>X (First)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (humanSymbol !== "O") {
                              tacticalAudio.playLatchClick();
                              setHumanSymbol("O");
                              handleResetGame();
                            }
                          }}
                          className={`flex items-center justify-center gap-2 border py-2 px-3 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                            humanSymbol === "O"
                              ? "border-rhodes-reunion bg-rhodes-reunion/15 text-rhodes-reunion font-bold"
                              : "border-white/15 bg-black/40 text-rhodes-bone/60 hover:border-white/30"
                          }`}
                        >
                          <ReunionOriginiumSigil size="sm" />
                          <span>O (Second)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Compact Move History Pills + Quick Actions */}
              <div className="border border-white/15 bg-[#0D1017] p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/55 uppercase">
                    Move History
                  </span>
                  <span className="font-mono text-[10px] text-rhodes-bone/45">
                    {currentStep}/9
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {history.length === 1 ? (
                    <span className="font-mono text-[10px] text-rhodes-bone/35">
                      Select any square to begin.
                    </span>
                  ) : (
                    history.slice(1).map((step, idx) => {
                      const stepNum = idx + 1;
                      const isCurrent = stepNum === currentStep;
                      const code =
                        step.moveIndex !== null
                          ? SECTORS[step.moveIndex].code
                          : "";
                      return (
                        <button
                          key={stepNum}
                          type="button"
                          onClick={() => {
                            tacticalAudio.playLatchClick();
                            setCurrentStep(stepNum);
                            setBannerDismissed(false);
                          }}
                          className={`border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                            isCurrent
                              ? "border-rhodes-cyan bg-rhodes-cyan/20 text-rhodes-bone font-bold"
                              : stepNum > currentStep
                              ? "border-white/10 bg-black/30 text-rhodes-bone/30 hover:border-white/25"
                              : "border-white/15 bg-black/50 text-rhodes-bone/75 hover:border-white/35"
                          }`}
                        >
                          <span
                            className={
                              step.player === "X"
                                ? "text-rhodes-cyan"
                                : "text-rhodes-reunion"
                            }
                          >
                            {step.player}
                          </span>{" "}
                          {code}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0 || isBotThinking}
                    onClick={handleUndo}
                    className="w-full"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>Undo [Z]</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleResetGame}
                    className="w-full"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>New Game [R]</span>
                  </Button>
                </div>
              </div>
            </section>

            {/* RIGHT / HERO PANEL: 3x3 Board */}
            <section className="lg:col-span-7 flex flex-col items-center">
              {/* Mobile Turn Status */}
              <div className="sm:hidden mb-3 flex w-full max-w-[480px] items-center justify-between border border-white/15 bg-[#0F131C] px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 ${
                      isGameOver
                        ? "bg-rhodes-amber"
                        : activePlayer === "X"
                        ? "bg-rhodes-cyan animate-pulse"
                        : "bg-rhodes-reunion animate-pulse"
                    }`}
                  />
                  <span className="font-mono text-xs font-bold tracking-[0.14em]">
                    {statusText}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-rhodes-bone/50">
                  {currentStep}/9
                </span>
              </div>

              <motion.div
                key={boardShake}
                animate={
                  boardShake > 0
                    ? { x: [0, -6, 6, -3, 3, 0], y: [0, 3, -3, 2, -2, 0] }
                    : undefined
                }
                transition={{ duration: 0.28 }}
                className="relative w-full max-w-[480px] border border-white/25 bg-[#0B0E15]/95 p-3.5 sm:p-5 clip-chamfer-lg"
              >
                <div className="relative grid grid-cols-3 gap-2.5 sm:gap-3 bg-tactical-subgrid p-1.5 border border-white/10">
                  {SECTORS.map((sector) => {
                    const cellVal = board[sector.index];
                    const isWinCell =
                      winningVector?.line.includes(sector.index) ?? false;
                    const isLastMove =
                      currentSnapshot.moveIndex === sector.index;

                    return (
                      <TacticalSectorCell
                        key={sector.code}
                        sector={sector}
                        value={cellVal}
                        activePlayer={activePlayer}
                        isWinningCell={isWinCell}
                        isLastMove={isLastMove}
                        isDisabled={isGameOver || isBotThinking}
                        showHints={showHints}
                        evaluation={evaluations[sector.index]}
                        onSelect={(idx) => makeMove(idx, false)}
                        onHover={(hovered) => {
                          if (hovered) tacticalAudio.playHoverTick();
                        }}
                      />
                    );
                  })}

                  <WinningVectorOverlay winningVector={winningVector} />
                </div>
              </motion.div>

              {/* Post-game quick banner if user clicked "View Board" */}
              {isGameOver && bannerDismissed && (
                <div className="mt-4 flex w-full max-w-[480px] items-center justify-between border border-white/20 bg-[#11151E] px-4 py-2.5">
                  <span className="font-mono text-xs tracking-wider text-rhodes-bone/80">
                    {winningVector
                      ? gameMode === "AI"
                        ? winningVector.winner === humanSymbol
                          ? `You won (${winningVector.label})`
                          : `Bot won (${winningVector.label})`
                        : `${winningVector.winner} wins (${winningVector.label})`
                      : "Match ended in a draw"}
                  </span>
                  <Button size="sm" onClick={handleResetGame}>
                    Play Again
                  </Button>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* ==================== MINIMAL FOOTER ==================== */}
        <footer className="relative z-20 border-t border-white/10 bg-[#07090D] py-2.5 px-4 sm:px-6">
          <div className="mx-auto flex max-w-5xl items-center justify-between font-mono text-[10px] tracking-[0.16em] text-rhodes-bone/40">
            <span>TACTICAL TIC-TAC-TOE</span>
            <span className="hidden sm:inline">
              [1-9] PLACE · [Z] UNDO · [H] HINTS · [R] NEW GAME
            </span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
