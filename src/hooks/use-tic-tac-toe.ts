"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BoardState,
  CellEvaluation,
  Difficulty,
  GameMode,
  HistoryStep,
  PlayerSymbol,
  ScoreBoard,
} from "@/types/game";
import {
  CELL_COORDINATES,
  computeCellEvaluations,
  evaluateWinner,
  isBoardFull,
  selectBotMove,
} from "@/lib/game-engine";
import { soundEngine } from "@/lib/audio-engine";

const INITIAL_BOARD: BoardState = Array(9).fill(null);

export function useTicTacToe() {
  const [history, setHistory] = useState<HistoryStep[]>([
    { board: INITIAL_BOARD, moveIndex: null, player: null },
  ]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>("AI");
  const [difficulty, setDifficulty] = useState<Difficulty>("UNBEATABLE");
  const [humanSymbol, setHumanSymbol] = useState<PlayerSymbol>("X");

  const [showHints, setShowHints] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [showResultBanner, setShowResultBanner] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [isBoardShaking, setIsBoardShaking] = useState<boolean>(false);
  const [resetSweepKey, setResetSweepKey] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pulseCenterIndex, setPulseCenterIndex] = useState<number | null>(null);

  const [scores, setScores] = useState<ScoreBoard>({
    X: 0,
    O: 0,
    DRAW: 0,
  });

  const currentSnapshot = history[currentStep];
  const board = currentSnapshot.board;
  const activePlayer: PlayerSymbol = currentStep % 2 === 0 ? "X" : "O";

  const winningLine = useMemo(() => evaluateWinner(board), [board]);
  const isDraw = useMemo(
    () => !winningLine && isBoardFull(board),
    [board, winningLine]
  );
  const isGameOver = winningLine !== null || isDraw;

  // Delay result modal slightly after win so the winning line beam animates cleanly first
  useEffect(() => {
    if (!isGameOver || bannerDismissed) {
      setShowResultBanner(false);
      return;
    }
    const delayMs = winningLine ? 460 : 220;
    const timer = setTimeout(() => {
      setShowResultBanner(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isGameOver, bannerDismissed, winningLine]);

  const evaluations: CellEvaluation[] = useMemo(
    () =>
      showHints
        ? computeCellEvaluations(board, activePlayer)
        : CELL_COORDINATES.map((cell) => ({
            index: cell.index,
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
        soundEngine.playDeployX();
      } else {
        soundEngine.playDeployO();
      }

      setHoveredIndex(null);
      setPulseCenterIndex(index);

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
        setIsBoardShaking(true);
        setTimeout(() => setIsBoardShaking(false), 300);
        setScores((prev) => ({
          ...prev,
          [winCheck.winner]: prev[winCheck.winner] + 1,
        }));
        setTimeout(() => soundEngine.playMatchEnd(winCheck.winner), 130);
      } else if (drawCheck) {
        setScores((prev) => ({ ...prev, DRAW: prev.DRAW + 1 }));
        setTimeout(() => soundEngine.playMatchEnd("DRAW"), 130);
      }
    },
    [board, isGameOver, gameMode, activePlayer, humanSymbol, currentStep, history]
  );

  useEffect(() => {
    if (pulseCenterIndex === null) return;
    const timer = setTimeout(() => setPulseCenterIndex(null), 320);
    return () => clearTimeout(timer);
  }, [pulseCenterIndex]);

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
      const moveIdx = selectBotMove(board, botSymbol, difficulty);
      setIsBotThinking(false);
      if (moveIdx !== -1) {
        makeMove(moveIdx, true);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [gameMode, isGameOver, humanSymbol, activePlayer, board, difficulty, makeMove]);

  const resetGame = useCallback(() => {
    soundEngine.playLatchClick();
    setIsBotThinking(false);
    setBannerDismissed(false);
    setShowResultBanner(false);
    setHoveredIndex(null);
    setPulseCenterIndex(null);
    setResetSweepKey((k) => k + 1);
    setHistory([{ board: INITIAL_BOARD, moveIndex: null, player: null }]);
    setCurrentStep(0);
  }, []);

  const undoMove = useCallback(() => {
    if (currentStep === 0 || isBotThinking) return;
    soundEngine.playLatchClick();
    const stepBack =
      gameMode === "AI" && currentStep >= 2
        ? currentStep - 2
        : Math.max(0, currentStep - 1);
    setCurrentStep(stepBack);
    setBannerDismissed(false);
    setShowResultBanner(false);
  }, [currentStep, isBotThinking, gameMode]);

  const jumpToStep = useCallback((step: number) => {
    soundEngine.playLatchClick();
    setCurrentStep(step);
    setBannerDismissed(false);
    setShowResultBanner(false);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      soundEngine.setEnabled(next);
      if (next) soundEngine.playLatchClick();
      return next;
    });
  }, []);

  const toggleHints = useCallback((next?: boolean) => {
    soundEngine.playLatchClick();
    setShowHints((prev) => (typeof next === "boolean" ? next : !prev));
  }, []);

  const changeMode = useCallback(
    (mode: GameMode) => {
      if (gameMode === mode) return;
      soundEngine.playLatchClick();
      setGameMode(mode);
      resetGame();
    },
    [gameMode, resetGame]
  );

  const changeDifficulty = useCallback(
    (level: Difficulty) => {
      if (difficulty === level) return;
      soundEngine.playLatchClick();
      setDifficulty(level);
      resetGame();
    },
    [difficulty, resetGame]
  );

  const changeHumanSymbol = useCallback(
    (symbol: PlayerSymbol) => {
      if (humanSymbol === symbol) return;
      soundEngine.playLatchClick();
      setHumanSymbol(symbol);
      resetGame();
    },
    [humanSymbol, resetGame]
  );

  const resetScores = useCallback(() => {
    soundEngine.playLatchClick();
    setScores({ X: 0, O: 0, DRAW: 0 });
  }, []);

  const dismissBanner = useCallback(() => {
    soundEngine.playLatchClick();
    setBannerDismissed(true);
  }, []);

  const handleCellHover = useCallback(
    (idx: number | null) => {
      if (idx !== null && idx !== hoveredIndex) {
        soundEngine.playHoverTick();
      }
      setHoveredIndex(idx);
    },
    [hoveredIndex]
  );

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
        resetGame();
      } else if (key === "H") {
        toggleHints();
      } else if (key === "Z" || e.key === "Backspace") {
        undoMove();
      } else if (key === "M") {
        toggleAudio();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [makeMove, resetGame, toggleHints, undoMove, toggleAudio]);

  const statusText = isGameOver
    ? winningLine
      ? gameMode === "AI"
        ? winningLine.winner === humanSymbol
          ? "YOU WIN"
          : "BOT WINS"
        : winningLine.winner === "X"
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

  return {
    board,
    history,
    currentStep,
    lastMoveIndex: currentSnapshot.moveIndex,
    activePlayer,
    winningLine,
    isDraw,
    isGameOver,
    gameMode,
    difficulty,
    humanSymbol,
    showHints,
    audioEnabled,
    showResultBanner: showResultBanner && !bannerDismissed,
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
  };
}

