"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Cpu,
  Users,
  Eye,
  Undo2,
  History,
  Activity,
  Radio,
  ShieldAlert,
  ChevronRight,
  Trash2,
} from "lucide-react";
import {
  BoardState,
  CellEvaluation,
  computeSectorTelemetry,
  evaluateWinner,
  GameMode,
  isBoardFull,
  PlayerSymbol,
  SECTORS,
  SectorMetadata,
  selectPRTSMove,
  ThreatLevel,
} from "@/lib/tactical-engine";
import { tacticalAudio } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  TacticalBarcode,
} from "./tactical-emblems";
import { ScrambleText } from "./scramble-text";
import { TacticalSectorCell } from "./tactical-sector-cell";
import { WinningVectorOverlay } from "./winning-vector-overlay";
import { OperationResultBanner } from "./operation-result-banner";
import { BootShutterOverlay } from "./boot-shutter-overlay";
import { TacticalDossierModal } from "./tactical-dossier-modal";

interface HistoryStep {
  board: BoardState;
  moveIndex: number | null;
  player: PlayerSymbol | null;
  timestamp: string;
  nodesEvaluated: number;
}

const INITIAL_BOARD: BoardState = Array(9).fill(null);

function formatCycleTimestamp(stepIndex: number): string {
  const sec = String(stepIndex * 3).padStart(2, "0");
  const ms = String((stepIndex * 37) % 100).padStart(2, "0");
  return `00:${sec}.${ms}`;
}

export function PRTStacticalHUD() {
  // Core Game State
  const [history, setHistory] = useState<HistoryStep[]>([
    {
      board: INITIAL_BOARD,
      moveIndex: null,
      player: null,
      timestamp: "00:00.00",
      nodesEvaluated: 0,
    },
  ]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>("PRTS_AI");
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>("PRTS_OVERCLOCK");
  const [humanSymbol, setHumanSymbol] = useState<PlayerSymbol>("X");

  // HUD & Telemetry Toggles
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [hoveredSector, setHoveredSector] = useState<SectorMetadata | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [boardShake, setBoardShake] = useState<number>(0);
  const [operationNumber, setOperationNumber] = useState<number>(1);

  // Subtle 3D Tactical Tilt State for the Matrix Frame
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  // Scoreboard State
  const [scores, setScores] = useState<{ X: number; O: number; DRAW: number }>({
    X: 0,
    O: 0,
    DRAW: 0,
  });

  const currentSnapshot = history[currentStep];
  const board = currentSnapshot.board;

  // Determine whose turn it is
  const activePlayer: PlayerSymbol = currentStep % 2 === 0 ? "X" : "O";

  // Evaluate winner & draw
  const winningVector = useMemo(() => evaluateWinner(board), [board]);
  const isDraw = useMemo(
    () => !winningVector && isBoardFull(board),
    [board, winningVector]
  );
  const isOperationOver = winningVector !== null || isDraw;

  // Compute live PRTS Minimax Telemetry for current board
  const sectorTelemetry: CellEvaluation[] = useMemo(
    () => computeSectorTelemetry(board, activePlayer),
    [board, activePlayer]
  );

  const totalSimulatedNodes = useMemo(
    () => sectorTelemetry.reduce((sum, item) => sum + item.nodesEvaluated, 0),
    [sectorTelemetry]
  );

  // Compute map of move index -> cycle number (1..9)
  const moveOrderMap = useMemo(() => {
    const map = new Map<number, number>();
    for (let i = 1; i <= currentStep; i++) {
      const step = history[i];
      if (step && step.moveIndex !== null) {
        map.set(step.moveIndex, i);
      }
    }
    return map;
  }, [history, currentStep]);

  // Calculate overall tactical advantage bar (-100 to +100 from X's perspective)
  const advantagePercent = useMemo(() => {
    if (winningVector) {
      return winningVector.winner === "X" ? 100 : 0;
    }
    if (isDraw) return 50;
    const available = sectorTelemetry.filter(
      (t) => t.classification !== "OCCUPIED"
    );
    if (available.length === 0) return 50;
    const bestForActive = Math.max(...available.map((a) => a.score));
    const xPerspective =
      activePlayer === "X" ? bestForActive : -bestForActive;
    return Math.max(8, Math.min(92, Math.round(50 + xPerspective * 0.42)));
  }, [winningVector, isDraw, sectorTelemetry, activePlayer]);

  // Execute a deployment on a sector
  const deployToSector = useCallback(
    (index: number, triggeredByAI = false) => {
      if (board[index] !== null || isOperationOver) return;
      if (
        gameMode === "PRTS_AI" &&
        !triggeredByAI &&
        activePlayer !== humanSymbol
      ) {
        return;
      }

      const nextBoard = [...board];
      nextBoard[index] = activePlayer;

      // Play faction-specific tactical audio
      if (activePlayer === "X") {
        tacticalAudio.playDeployRhodes();
      } else {
        tacticalAudio.playDeployReunion();
      }

      const nextStepIndex = currentStep + 1;
      const newStep: HistoryStep = {
        board: nextBoard,
        moveIndex: index,
        player: activePlayer,
        timestamp: formatCycleTimestamp(nextStepIndex),
        nodesEvaluated: totalSimulatedNodes,
      };

      const nextHistory = [...history.slice(0, currentStep + 1), newStep];
      setHistory(nextHistory);
      setCurrentStep(nextStepIndex);
      setBannerDismissed(false);

      // Check if this move ended the operation
      const winCheck = evaluateWinner(nextBoard);
      const drawCheck = !winCheck && isBoardFull(nextBoard);

      if (winCheck) {
        setBoardShake((prev) => prev + 1);
        setScores((prev) => ({
          ...prev,
          [winCheck.winner]: prev[winCheck.winner] + 1,
        }));
        setTimeout(() => tacticalAudio.playOperationEnd(winCheck.winner), 140);
      } else if (drawCheck) {
        setScores((prev) => ({
          ...prev,
          DRAW: prev.DRAW + 1,
        }));
        setTimeout(() => tacticalAudio.playOperationEnd("DRAW"), 140);
      }
    },
    [
      board,
      isOperationOver,
      gameMode,
      activePlayer,
      humanSymbol,
      currentStep,
      totalSimulatedNodes,
      history,
    ]
  );

  // Trigger PRTS Neural AI Move when it's AI's turn
  useEffect(() => {
    if (gameMode !== "PRTS_AI" || isOperationOver) {
      setIsAIThinking(false);
      return;
    }

    const aiSymbol: PlayerSymbol = humanSymbol === "X" ? "O" : "X";
    if (activePlayer !== aiSymbol) {
      setIsAIThinking(false);
      return;
    }

    setIsAIThinking(true);
    const timer = setTimeout(() => {
      const { moveIndex } = selectPRTSMove(board, aiSymbol, threatLevel);
      setIsAIThinking(false);
      if (moveIndex !== -1) {
        deployToSector(moveIndex, true);
      }
    }, 340);

    return () => clearTimeout(timer);
  }, [
    gameMode,
    isOperationOver,
    humanSymbol,
    activePlayer,
    board,
    threatLevel,
    deployToSector,
  ]);

  // Reset / Initialize Next Operation
  const handleResetOperation = useCallback(() => {
    tacticalAudio.playLatchClick();
    setIsAIThinking(false);
    setBannerDismissed(false);
    setOperationNumber((n) => n + 1);
    setHistory([
      {
        board: INITIAL_BOARD,
        moveIndex: null,
        player: null,
        timestamp: "00:00.00",
        nodesEvaluated: 0,
      },
    ]);
    setCurrentStep(0);
  }, []);

  // Toggle Audio
  const handleToggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      tacticalAudio.setEnabled(next);
      if (next) tacticalAudio.playLatchClick();
      return next;
    });
  }, []);

  // Keyboard Shortcuts: [1-9] deploy, [R] reset, [V] telemetry, [M] audio
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
        const idx = parseInt(key, 10) - 1;
        deployToSector(idx, false);
      } else if (key === "R") {
        handleResetOperation();
      } else if (key === "V") {
        tacticalAudio.playLatchClick();
        setShowTelemetry((prev) => !prev);
      } else if (key === "M") {
        handleToggleAudio();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deployToSector, handleResetOperation, handleToggleAudio]);

  // Handle 3D Tactical Board Mouse Move
  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = boardContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -ny * 5.5,
      ry: nx * 5.5,
    });
  };

  const handleBoardMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setHoveredSector(null);
  };

  // Inspected sector (either hovered or most recently deployed or center SEC-B2)
  const inspectedSector: SectorMetadata = useMemo(() => {
    if (hoveredSector) return hoveredSector;
    if (currentSnapshot.moveIndex !== null) {
      return SECTORS[currentSnapshot.moveIndex];
    }
    return SECTORS[4]; // Default SEC-B2 Rhodes Bridge
  }, [hoveredSector, currentSnapshot.moveIndex]);

  const inspectedEval = sectorTelemetry[inspectedSector.index];

  return (
    <TooltipProvider delayDuration={120}>
      <div className="relative min-h-screen w-full bg-[#090A0D] text-[#ECEAE4] flex flex-col justify-between overflow-x-hidden">
        {/* Initial Choreographed PRTS Shutter Boot Sequence */}
        <BootShutterOverlay />

        {/* Interactive Originium Topographic & Telemetry Canvas */}
        <TopographicCanvas
          activePlayer={activePlayer}
          isOverclock={threatLevel === "PRTS_OVERCLOCK"}
        />

        {/* Operation Cleared / Breach / Stalemate Overlay Banner */}
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
          onNextOperation={handleResetOperation}
        />

        {/* ==================== TOP PRTS COMMAND HEADER ==================== */}
        <header className="relative z-20 border-b border-white/15 bg-[#0B0E14]/90">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            {/* Left Brand & Terminal Identity */}
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-10 w-10 items-center justify-center border border-white/20 bg-[#12161F]">
                <RhodesCrestLogo className="h-7 w-7" />
                <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 bg-rhodes-cyan" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold tracking-[0.24em] text-rhodes-cyan">
                    PRTS // NEURAL LINK v4.09
                  </span>
                  <span className="hidden md:inline-block border border-white/15 bg-white/5 px-1.5 py-0.2 font-mono text-[9px] tracking-[0.18em] text-rhodes-bone/60">
                    OP-S09 // #{String(operationNumber).padStart(3, "0")}
                  </span>
                </div>
                <h1 className="font-display text-lg sm:text-xl font-black tracking-[0.1em] text-rhodes-bone uppercase leading-tight">
                  RHODES ISLAND // TACTICAL MATRIX
                </h1>
              </div>
            </div>

            {/* Center Live Status Strip */}
            <div className="hidden xl:flex items-center gap-6 border border-white/15 bg-[#0F131C] px-4 py-1.5 clip-chamfer-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 ${
                    isOperationOver
                      ? "bg-rhodes-amber"
                      : activePlayer === "X"
                      ? "bg-rhodes-cyan animate-pulse"
                      : "bg-rhodes-reunion animate-pulse"
                  }`}
                />
                <span className="font-mono text-[10px] tracking-[0.2em] text-rhodes-bone/60">
                  PHASE:
                </span>
                <ScrambleText
                  text={
                    isOperationOver
                      ? winningVector
                        ? `LOCKED // ${winningVector.winner} VICTORY`
                        : "ORIGINIUM STALEMATE"
                      : isAIThinking
                      ? "PRTS COMPUTING VECTOR..."
                      : activePlayer === "X"
                      ? "RHODES VANGUARD [X] TURN"
                      : "REUNION SIGIL [O] TURN"
                  }
                  className={`font-mono text-[11px] font-bold tracking-[0.16em] ${
                    activePlayer === "X"
                      ? "text-rhodes-cyan"
                      : "text-rhodes-reunion"
                  }`}
                />
              </div>

              <div className="h-3.5 w-[1px] bg-white/15" />

              <div className="font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/55">
                CYCLE:{" "}
                <span className="text-rhodes-bone font-bold">
                  0{currentStep}/09
                </span>
              </div>
            </div>

            {/* Right Controls: Neural Vision, Audio Synth, Dossier */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* PRTS Neural Vision Switch */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 border border-white/15 bg-[#12161F] px-2.5 py-1.5">
                    <Eye
                      className={`h-3.5 w-3.5 ${
                        showTelemetry
                          ? "text-rhodes-cyan"
                          : "text-rhodes-bone/45"
                      }`}
                    />
                    <span className="hidden md:inline font-mono text-[10px] tracking-[0.16em] text-rhodes-bone/80">
                      PRTS VISION [V]
                    </span>
                    <Switch
                      checked={showTelemetry}
                      onCheckedChange={(val) => {
                        tacticalAudio.playLatchClick();
                        setShowTelemetry(val);
                      }}
                      aria-label="Toggle PRTS Neural Telemetry Overlay"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  DISPLAY REAL-TIME MINIMAX EVALUATION MATRIX ON SECTORS [KEY: V]
                </TooltipContent>
              </Tooltip>

              {/* Audio Synth Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleAudio}
                    className="gap-1.5"
                  >
                    {audioEnabled ? (
                      <Volume2 className="h-3.5 w-3.5 text-rhodes-cyan" />
                    ) : (
                      <VolumeX className="h-3.5 w-3.5 text-rhodes-bone/40" />
                    )}
                    <span className="hidden sm:inline">
                      {audioEnabled ? "SFX: ON" : "SFX: MUTE"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  TOGGLE PROCEDURAL TACTICAL AUDIO SYNTH [KEY: M]
                </TooltipContent>
              </Tooltip>

              {/* PRTS Classified Dossier Modal */}
              <TacticalDossierModal />
            </div>
          </div>
        </header>

        {/* ==================== MAIN 12-COL TACTICAL WORKSPACE ==================== */}
        <main className="relative z-10 mx-auto my-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:py-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ---------- LEFT COLUMN (3 COLS): FACTION & AI PARAMETERS ---------- */}
            <section className="lg:col-span-3 flex flex-col gap-4">
              {/* Panel 1: Operation Parameters */}
              <div className="border border-white/20 bg-[#0E121A]/95 p-4 clip-chamfer-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-rhodes-cyan" />
                    <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase text-rhodes-bone">
                      COMBAT PARAMETERS
                    </h2>
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-rhodes-bone/40">
                    // CFG-01
                  </span>
                </div>

                {/* Combat Mode Selector */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/55">
                    OPERATION LINK MODE
                  </label>
                  <Tabs
                    value={gameMode}
                    onValueChange={(val) => {
                      tacticalAudio.playLatchClick();
                      setGameMode(val as GameMode);
                      handleResetOperation();
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="PRTS_AI" className="gap-1.5">
                        <Cpu className="h-3 w-3" />
                        <span>PRTS AI</span>
                      </TabsTrigger>
                      <TabsTrigger value="LOCAL_PVP" className="gap-1.5">
                        <Users className="h-3 w-3" />
                        <span>2P LINK</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Threat Level Selector (Only in PRTS_AI Mode) */}
                {gameMode === "PRTS_AI" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em]">
                      <span className="text-rhodes-bone/55">
                        AI THREAT MATRIX
                      </span>
                      <span className="text-rhodes-cyan">
                        {threatLevel === "PRTS_OVERCLOCK"
                          ? "UNBEATABLE"
                          : threatLevel === "TACTICAL"
                          ? "INTERCEPT"
                          : "RECON"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: "RECON", label: "LV.01", sub: "RECON" },
                          { id: "TACTICAL", label: "LV.02", sub: "ELITE" },
                          {
                            id: "PRTS_OVERCLOCK",
                            label: "LV.03",
                            sub: "OVERCLOCK",
                          },
                        ] as { id: ThreatLevel; label: string; sub: string }[]
                      ).map((tier) => {
                        const active = threatLevel === tier.id;
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => {
                              tacticalAudio.playLatchClick();
                              setThreatLevel(tier.id);
                              handleResetOperation();
                            }}
                            className={`flex flex-col items-start border p-2 text-left transition-colors ${
                              active
                                ? "border-rhodes-cyan bg-rhodes-cyan/15 text-rhodes-bone"
                                : "border-white/15 bg-black/40 text-rhodes-bone/55 hover:border-white/35"
                            }`}
                          >
                            <span className="font-mono text-[10px] font-bold tracking-[0.15em]">
                              {tier.label}
                            </span>
                            <span className="font-mono text-[8px] tracking-[0.12em] opacity-75">
                              {tier.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Commander Faction Selector (Only in PRTS_AI Mode) */}
                {gameMode === "PRTS_AI" && (
                  <div className="space-y-1.5">
                    <span className="block font-mono text-[10px] tracking-[0.18em] text-rhodes-bone/55">
                      COMMANDER DEPLOYMENT FACTION
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (humanSymbol !== "X") {
                            tacticalAudio.playLatchClick();
                            setHumanSymbol("X");
                            handleResetOperation();
                          }
                        }}
                        className={`flex items-center gap-2 border p-2 transition-colors ${
                          humanSymbol === "X"
                            ? "border-rhodes-cyan bg-rhodes-cyan/15 text-rhodes-cyan"
                            : "border-white/15 bg-black/40 text-rhodes-bone/55 hover:border-white/30"
                        }`}
                      >
                        <RhodesVanguardMark size="sm" />
                        <div className="text-left font-mono">
                          <div className="text-[10px] font-bold tracking-wider">
                            RHODES [X]
                          </div>
                          <div className="text-[8px] opacity-70">
                            1ST STRIKE
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (humanSymbol !== "O") {
                            tacticalAudio.playLatchClick();
                            setHumanSymbol("O");
                            handleResetOperation();
                          }
                        }}
                        className={`flex items-center gap-2 border p-2 transition-colors ${
                          humanSymbol === "O"
                            ? "border-rhodes-reunion bg-rhodes-reunion/15 text-rhodes-reunion"
                            : "border-white/15 bg-black/40 text-rhodes-bone/55 hover:border-white/30"
                        }`}
                      >
                        <ReunionOriginiumSigil size="sm" />
                        <div className="text-left font-mono">
                          <div className="text-[10px] font-bold tracking-wider">
                            REUNION [O]
                          </div>
                          <div className="text-[8px] opacity-70">
                            2ND STRIKE
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel 2: Faction Dossier Scorecards (Authentic Arknights Bone-White vs Obsidian Contrast) */}
              <div className="space-y-3">
                {/* Faction X Card: Stark Rhodes Bone-White Slab when Active */}
                <div
                  className={`relative border p-4 transition-all duration-200 clip-chamfer-sm ${
                    activePlayer === "X" && !isOperationOver
                      ? "border-rhodes-cyan bg-[#ECEAE4] text-[#090A0D]"
                      : "border-white/20 bg-[#11151E] text-rhodes-bone"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#090A0D] border border-rhodes-cyan/50">
                        <RhodesVanguardMark size="sm" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-[9px] font-bold tracking-[0.2em] ${
                              activePlayer === "X" && !isOperationOver
                                ? "text-[#007799]"
                                : "text-rhodes-cyan"
                            }`}
                          >
                            UNIT // VANGUARD [X]
                          </span>
                          {activePlayer === "X" && !isOperationOver && (
                            <span className="bg-[#090A0D] text-[#00C8FF] px-1.5 py-0.2 font-mono text-[8px] tracking-widest uppercase">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-black tracking-[0.06em] uppercase">
                          RHODES ISLAND
                        </h3>
                        <p className="font-mono text-[9px] tracking-[0.14em] opacity-65">
                          {gameMode === "PRTS_AI"
                            ? humanSymbol === "X"
                              ? "COMMANDER // DOCTOR"
                              : `PRTS AI // ${threatLevel}`
                            : "COMMANDER 01 // LOCAL"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="block text-[9px] tracking-[0.16em] opacity-60">
                        VICTORIES
                      </span>
                      <span className="font-display text-3xl font-black leading-none">
                        {String(scores.X).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Faction O Card: Reunion Tactical Unit */}
                <div
                  className={`relative border p-4 transition-all duration-200 clip-chamfer-sm ${
                    activePlayer === "O" && !isOperationOver
                      ? "border-rhodes-reunion bg-[#ECEAE4] text-[#090A0D]"
                      : "border-white/20 bg-[#11151E] text-rhodes-bone"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#090A0D] border border-rhodes-reunion/50">
                        <ReunionOriginiumSigil size="sm" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-[9px] font-bold tracking-[0.2em] ${
                              activePlayer === "O" && !isOperationOver
                                ? "text-[#C82209]"
                                : "text-rhodes-reunion"
                            }`}
                          >
                            UNIT // ORIGINIUM [O]
                          </span>
                          {activePlayer === "O" && !isOperationOver && (
                            <span className="bg-[#090A0D] text-[#FF3B1D] px-1.5 py-0.2 font-mono text-[8px] tracking-widest uppercase">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-black tracking-[0.06em] uppercase">
                          REUNION FORCE
                        </h3>
                        <p className="font-mono text-[9px] tracking-[0.14em] opacity-65">
                          {gameMode === "PRTS_AI"
                            ? humanSymbol === "O"
                              ? "COMMANDER // DOCTOR"
                              : `PRTS AI // ${threatLevel}`
                            : "COMMANDER 02 // LOCAL"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="block text-[9px] tracking-[0.16em] opacity-60">
                        VICTORIES
                      </span>
                      <span className="font-display text-3xl font-black leading-none">
                        {String(scores.O).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stalemate / Draw Counter Strip */}
                <div className="flex items-center justify-between border border-white/15 bg-[#0D1017] px-3.5 py-2 font-mono text-[10px] tracking-[0.18em]">
                  <span className="text-rhodes-bone/55">
                    ORIGINIUM EQUILIBRIUM (STALEMATES)
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-rhodes-amber font-bold text-xs">
                      {String(scores.DRAW).padStart(2, "0")}
                    </span>
                    {(scores.X > 0 || scores.O > 0 || scores.DRAW > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          tacticalAudio.playLatchClick();
                          setScores({ X: 0, O: 0, DRAW: 0 });
                        }}
                        title="Reset Session Tallies"
                        className="text-rhodes-bone/40 hover:text-rhodes-reunion transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- CENTER COLUMN (6 COLS): 3×3 ORIGINIUM TACTICAL MATRIX ---------- */}
            <section className="lg:col-span-6 flex flex-col items-center">
              {/* Outer Architectural Matrix Chassis */}
              <motion.div
                key={boardShake}
                animate={
                  boardShake > 0
                    ? {
                        x: [0, -7, 7, -4, 4, 0],
                        y: [0, 4, -4, 2, -2, 0],
                      }
                    : undefined
                }
                transition={{ duration: 0.32 }}
                ref={boardContainerRef}
                onMouseMove={handleBoardMouseMove}
                onMouseLeave={handleBoardMouseLeave}
                style={{
                  transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transition: "transform 140ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                className="relative w-full max-w-[540px] border border-white/25 bg-[#0B0E15]/95 p-4 sm:p-6 clip-chamfer-lg"
              >
                {/* Top Matrix Frame Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Radio
                      className={`h-3.5 w-3.5 ${
                        activePlayer === "X"
                          ? "text-rhodes-cyan"
                          : "text-rhodes-reunion"
                      }`}
                    />
                    <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-rhodes-bone/80">
                      SECTOR MATRIX // 3×3 GRID
                    </span>
                  </div>

                  {/* Coordinate Axis Legend */}
                  <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-rhodes-bone/45">
                    <span>LAT: 32.04°N</span>
                    <span>//</span>
                    <span>LON: 118.78°E</span>
                  </div>
                </div>

                {/* Top Column Coordinate Ruler (00 - 01 - 02) */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-1.5 px-1 font-mono text-[9px] tracking-[0.24em] text-rhodes-bone/40 text-center">
                  <div>AXIS // COL-00</div>
                  <div>AXIS // COL-01</div>
                  <div>AXIS // COL-02</div>
                </div>

                {/* The 3x3 Tactical Grid + Winning Vector Laser Strike */}
                <div className="relative grid grid-cols-3 gap-2.5 sm:gap-3 bg-tactical-subgrid p-1.5 border border-white/15">
                  {SECTORS.map((sector) => {
                    const cellVal = board[sector.index];
                    const isWinCell =
                      winningVector?.line.includes(sector.index) ?? false;
                    const isLastMove =
                      currentSnapshot.moveIndex === sector.index;
                    const moveNum = moveOrderMap.get(sector.index) ?? null;

                    return (
                      <TacticalSectorCell
                        key={sector.code}
                        sector={sector}
                        value={cellVal}
                        activePlayer={activePlayer}
                        isWinningCell={isWinCell}
                        isLastMove={isLastMove}
                        isDisabled={isOperationOver || isAIThinking}
                        showTelemetry={showTelemetry}
                        telemetry={sectorTelemetry[sector.index]}
                        moveOrderNumber={moveNum}
                        onSelect={(idx) => deployToSector(idx, false)}
                        onHover={(sec) => {
                          if (sec) tacticalAudio.playHoverTick();
                          setHoveredSector(sec);
                        }}
                      />
                    );
                  })}

                  {/* Animated Laser Strike Line on Victory */}
                  <WinningVectorOverlay winningVector={winningVector} />
                </div>

                {/* Bottom Live Sector Telemetry Inspector Readout */}
                <div className="mt-4 border border-white/15 bg-[#07090D] p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-rhodes-cyan/40 bg-rhodes-cyan/10 font-mono text-xs font-bold text-rhodes-cyan">
                      {inspectedSector.code.split("-")[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-rhodes-bone">
                          {inspectedSector.zoneName}
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.16em] text-rhodes-bone/45">
                          [{inspectedSector.coord}]
                        </span>
                      </div>
                      <div className="font-mono text-[9px] tracking-[0.15em] text-rhodes-bone/55">
                        ORIGINIUM: {inspectedSector.originiumDensity} // ELEV:{" "}
                        {inspectedSector.elevation} // CLASS:{" "}
                        {inspectedSector.tacticalWeight}
                      </div>
                    </div>
                  </div>

                  {/* Live Minimax Sector Evaluation Pill */}
                  <div className="text-right font-mono">
                    <div className="text-[8px] tracking-[0.18em] text-rhodes-bone/45">
                      PRTS SECTOR EVAL
                    </div>
                    <div
                      className={`text-[10px] font-bold tracking-[0.16em] ${
                        inspectedEval?.classification === "OPTIMAL"
                          ? "text-rhodes-cyan"
                          : inspectedEval?.classification === "CRITICAL_RISK"
                          ? "text-rhodes-reunion"
                          : "text-rhodes-amber"
                      }`}
                    >
                      {inspectedEval?.classification === "OCCUPIED"
                        ? "SECTOR OCCUPIED"
                        : `${inspectedEval?.classification} (${
                            (inspectedEval?.score ?? 0) > 0
                              ? `+${inspectedEval?.score}`
                              : inspectedEval?.score ?? 0
                          })`}
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* ---------- RIGHT COLUMN (3 COLS): PRTS NEURAL TELEMETRY & CHRONO LOG ---------- */}
            <section className="lg:col-span-3 flex flex-col gap-4">
              {/* Panel 1: PRTS Neural Dominance & Decision Tree Telemetry */}
              <div className="border border-white/20 bg-[#0E121A]/95 p-4 clip-chamfer-md space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-rhodes-cyan" />
                    <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase text-rhodes-bone">
                      PRTS NEURAL TELEMETRY
                    </h2>
                  </div>
                  <Badge variant="outline">ALPHA-BETA</Badge>
                </div>

                {/* Dominance Equilibrium Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px] tracking-[0.16em]">
                    <span className="text-rhodes-cyan font-bold">
                      RHODES [X] {advantagePercent}%
                    </span>
                    <span className="text-rhodes-reunion font-bold">
                      {100 - advantagePercent}% REUNION [O]
                    </span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden border border-white/20 bg-black p-0.5">
                    <div
                      className="h-full bg-rhodes-cyan transition-all duration-300"
                      style={{ width: `${advantagePercent}%` }}
                    />
                    <div
                      className="h-full bg-rhodes-reunion transition-all duration-300"
                      style={{ width: `${100 - advantagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Simulated Nodes & Threat Status Readout */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="border border-white/10 bg-black/45 p-2">
                    <div className="text-[8px] tracking-[0.18em] text-rhodes-bone/45">
                      NODES EVALUATED
                    </div>
                    <div className="text-sm font-bold text-rhodes-bone">
                      <ScrambleText
                        text={String(totalSimulatedNodes).padStart(4, "0")}
                        triggerKey={currentStep}
                      />
                    </div>
                  </div>
                  <div className="border border-white/10 bg-black/45 p-2">
                    <div className="text-[8px] tracking-[0.18em] text-rhodes-bone/45">
                      MATRIX SATURATION
                    </div>
                    <div className="text-sm font-bold text-rhodes-amber">
                      {Math.round((currentStep / 9) * 100)}% [{currentStep}/9]
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: Chrono-Cycle Combat Log (Interactive Time-Travel Scrubbing) */}
              <div className="border border-white/20 bg-[#0E121A]/95 p-4 clip-chamfer-md flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-rhodes-amber" />
                    <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase text-rhodes-bone">
                      CHRONO-CYCLE LOG
                    </h2>
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.16em] text-rhodes-bone/45">
                    CLICK TO REWIND
                  </span>
                </div>

                {/* Scrollable Timeline Steps */}
                <div className="max-h-[230px] overflow-y-auto space-y-1.5 pr-1">
                  {history.map((step, idx) => {
                    const isCurrent = idx === currentStep;
                    const sector =
                      step.moveIndex !== null ? SECTORS[step.moveIndex] : null;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          tacticalAudio.playLatchClick();
                          setCurrentStep(idx);
                          setBannerDismissed(false);
                        }}
                        className={`w-full flex items-center justify-between border px-2.5 py-1.5 text-left font-mono text-[10px] transition-colors ${
                          isCurrent
                            ? "border-rhodes-cyan bg-rhodes-cyan/15 text-rhodes-bone"
                            : "border-white/10 bg-black/40 text-rhodes-bone/55 hover:border-white/30 hover:text-rhodes-bone"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ChevronRight
                            className={`h-3 w-3 shrink-0 ${
                              isCurrent
                                ? "text-rhodes-cyan"
                                : "text-transparent"
                            }`}
                          />
                          <span className="opacity-50">
                            [{step.timestamp}]
                          </span>
                          {idx === 0 ? (
                            <span className="tracking-wider">
                              CYC.00 // MATRIX READY
                            </span>
                          ) : (
                            <span className="tracking-wider truncate">
                              <strong
                                className={
                                  step.player === "X"
                                    ? "text-rhodes-cyan"
                                    : "text-rhodes-reunion"
                                }
                              >
                                [{step.player}]
                              </strong>{" "}
                              → {sector?.code} ({sector?.zoneName.split(" ")[0]})
                            </span>
                          )}
                        </div>

                        <span className="text-[8px] tracking-widest opacity-55 shrink-0 ml-1">
                          #{idx}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tactical Action Buttons */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/15 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0 || isAIThinking}
                    onClick={() => {
                      tacticalAudio.playLatchClick();
                      const stepBack =
                        gameMode === "PRTS_AI" && currentStep >= 2
                          ? currentStep - 2
                          : Math.max(0, currentStep - 1);
                      setCurrentStep(stepBack);
                      setBannerDismissed(false);
                    }}
                    className="w-full"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>STEP BACK</span>
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleResetOperation}
                    className="w-full"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>RE-DEPLOY [R]</span>
                  </Button>
                </div>
              </div>

              {/* Decorative Industrial Barcode & Caution Footer Box */}
              <div className="border border-white/15 bg-[#0B0E14] p-3 flex items-center justify-between">
                <TacticalBarcode code="RI-PRTS // 2026-ARK" />
                <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-rhodes-amber/80">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>ORIGINIUM ZONE</span>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* ==================== BOTTOM TELEMETRY TICKER BAR ==================== */}
        <footer className="relative z-20 border-t border-white/15 bg-[#07090D] py-2 px-4 sm:px-6">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 font-mono text-[9px] tracking-[0.22em] text-rhodes-bone/45">
            <div className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 bg-rhodes-cyan" />
              <span>
                RHODES ISLAND TACTICAL COMMAND // STUDIO MONTAGNE GRAPHIC SYSTEM
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span>HOTKEYS: [1-9] DEPLOY SECTOR</span>
              <span>//</span>
              <span>[V] NEURAL OVERLAY</span>
              <span>//</span>
              <span>[R] RE-INITIALIZE</span>
              <span>//</span>
              <span>[M] AUDIO SYNTH</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

