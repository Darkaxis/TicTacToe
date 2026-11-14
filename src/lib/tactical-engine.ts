export type PlayerSymbol = "X" | "O";
export type CellValue = PlayerSymbol | null;
export type BoardState = CellValue[];
export type GameMode = "AI" | "PVP";
export type Difficulty = "EASY" | "NORMAL" | "UNBEATABLE";

export interface SectorInfo {
  index: number;
  code: string; // A1..C3
  rowLabel: string;
  colLabel: string;
}

export const SECTORS: SectorInfo[] = [
  { index: 0, code: "A1", rowLabel: "A", colLabel: "1" },
  { index: 1, code: "A2", rowLabel: "A", colLabel: "2" },
  { index: 2, code: "A3", rowLabel: "A", colLabel: "3" },
  { index: 3, code: "B1", rowLabel: "B", colLabel: "1" },
  { index: 4, code: "B2", rowLabel: "B", colLabel: "2" },
  { index: 5, code: "B3", rowLabel: "B", colLabel: "3" },
  { index: 6, code: "C1", rowLabel: "C", colLabel: "1" },
  { index: 7, code: "C2", rowLabel: "C", colLabel: "2" },
  { index: 8, code: "C3", rowLabel: "C", colLabel: "3" },
];

export interface WinningVector {
  line: [number, number, number];
  winner: PlayerSymbol;
  label: string;
  angleType:
    | "ROW-0"
    | "ROW-1"
    | "ROW-2"
    | "COL-0"
    | "COL-1"
    | "COL-2"
    | "DIAG-MAIN"
    | "DIAG-ANTI";
}

export const WINNING_LINES: {
  line: [number, number, number];
  label: string;
  angleType: WinningVector["angleType"];
}[] = [
  { line: [0, 1, 2], label: "Row A (A1–A3)", angleType: "ROW-0" },
  { line: [3, 4, 5], label: "Row B (B1–B3)", angleType: "ROW-1" },
  { line: [6, 7, 8], label: "Row C (C1–C3)", angleType: "ROW-2" },
  { line: [0, 3, 6], label: "Column 1 (A1–C1)", angleType: "COL-0" },
  { line: [1, 4, 7], label: "Column 2 (A2–C2)", angleType: "COL-1" },
  { line: [2, 5, 8], label: "Column 3 (A3–C3)", angleType: "COL-2" },
  { line: [0, 4, 8], label: "Diagonal (A1–C3)", angleType: "DIAG-MAIN" },
  { line: [2, 4, 6], label: "Diagonal (A3–C1)", angleType: "DIAG-ANTI" },
];

export function evaluateWinner(board: BoardState): WinningVector | null {
  for (const item of WINNING_LINES) {
    const [a, b, c] = item.line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        line: item.line,
        winner: board[a] as PlayerSymbol,
        label: item.label,
        angleType: item.angleType,
      };
    }
  }
  return null;
}

export function isBoardFull(board: BoardState): boolean {
  return board.every((cell) => cell !== null);
}

export interface CellEvaluation {
  index: number;
  score: number;
  status: "BEST" | "SAFE" | "RISK" | "OCCUPIED";
}

function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  maximizingPlayer: PlayerSymbol,
  alpha: number,
  beta: number
): number {
  const minimizingPlayer: PlayerSymbol = maximizingPlayer === "X" ? "O" : "X";

  const winResult = evaluateWinner(board);
  if (winResult) {
    return winResult.winner === maximizingPlayer
      ? 100 - depth * 6
      : -100 + depth * 6;
  }

  if (isBoardFull(board)) {
    return 0;
  }

  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  if (isMaximizing) {
    let best = -Infinity;
    for (const idx of moveOrder) {
      if (board[idx] === null) {
        board[idx] = maximizingPlayer;
        const val = minimax(board, depth + 1, false, maximizingPlayer, alpha, beta);
        board[idx] = null;
        best = Math.max(best, val);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (const idx of moveOrder) {
      if (board[idx] === null) {
        board[idx] = minimizingPlayer;
        const val = minimax(board, depth + 1, true, maximizingPlayer, alpha, beta);
        board[idx] = null;
        best = Math.min(best, val);
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

export function computeSectorEvaluations(
  board: BoardState,
  activePlayer: PlayerSymbol
): CellEvaluation[] {
  const win = evaluateWinner(board);
  if (win || isBoardFull(board)) {
    return SECTORS.map((s) => ({
      index: s.index,
      score: 0,
      status: "OCCUPIED",
    }));
  }

  const evaluations: CellEvaluation[] = [];
  const workingBoard = [...board];

  for (let i = 0; i < 9; i++) {
    if (workingBoard[i] !== null) {
      evaluations.push({ index: i, score: 0, status: "OCCUPIED" });
      continue;
    }

    workingBoard[i] = activePlayer;
    const score = minimax(
      workingBoard,
      0,
      false,
      activePlayer,
      -Infinity,
      Infinity
    );
    workingBoard[i] = null;

    evaluations.push({
      index: i,
      score,
      status: "SAFE",
    });
  }

  const available = evaluations.filter((e) => e.status !== "OCCUPIED");
  if (available.length > 0) {
    const maxScore = Math.max(...available.map((e) => e.score));
    for (const ev of evaluations) {
      if (ev.status === "OCCUPIED") continue;
      if (ev.score === maxScore) {
        ev.status = "BEST";
      } else if (ev.score < 0) {
        ev.status = "RISK";
      } else {
        ev.status = "SAFE";
      }
    }
  }

  return evaluations;
}

export function selectAIMove(
  board: BoardState,
  aiSymbol: PlayerSymbol,
  difficulty: Difficulty
): number {
  const evaluations = computeSectorEvaluations(board, aiSymbol);
  const available = evaluations.filter((e) => e.status !== "OCCUPIED");

  if (available.length === 0) return -1;

  const opponentSymbol: PlayerSymbol = aiSymbol === "X" ? "O" : "X";

  const findImmediateStrike = (symbol: PlayerSymbol): number | null => {
    for (const item of WINNING_LINES) {
      const [a, b, c] = item.line;
      const vals = [board[a], board[b], board[c]];
      if (
        vals.filter((v) => v === symbol).length === 2 &&
        vals.filter((v) => v === null).length === 1
      ) {
        if (board[a] === null) return a;
        if (board[b] === null) return b;
        if (board[c] === null) return c;
      }
    }
    return null;
  };

  if (difficulty === "EASY") {
    const immediateWin = findImmediateStrike(aiSymbol);
    if (immediateWin !== null && Math.random() < 0.7) {
      return immediateWin;
    }
    const sorted = [...available].sort((a, b) => b.score - a.score);
    const pool = sorted.slice(0, Math.min(3, sorted.length));
    return pool[Math.floor(Math.random() * pool.length)].index;
  }

  if (difficulty === "NORMAL") {
    const immediateWin = findImmediateStrike(aiSymbol);
    if (immediateWin !== null) return immediateWin;

    const immediateBlock = findImmediateStrike(opponentSymbol);
    if (immediateBlock !== null) return immediateBlock;

    const bestMoves = available.filter((a) => a.status === "BEST");
    if (Math.random() < 0.78 && bestMoves.length > 0) {
      return bestMoves[0].index;
    }
    return available[Math.floor(Math.random() * available.length)].index;
  }

  // UNBEATABLE
  const priorityOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  const bestMoves = available
    .filter((a) => a.status === "BEST")
    .sort(
      (a, b) => priorityOrder.indexOf(a.index) - priorityOrder.indexOf(b.index)
    );

  return bestMoves[0]?.index ?? available[0].index;
}
