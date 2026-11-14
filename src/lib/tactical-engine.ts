export type PlayerSymbol = "X" | "O";
export type CellValue = PlayerSymbol | null;
export type BoardState = CellValue[];
export type GameMode = "PRTS_AI" | "LOCAL_PVP";
export type ThreatLevel = "RECON" | "TACTICAL" | "PRTS_OVERCLOCK";

export interface SectorMetadata {
  index: number;
  code: string;
  coord: string;
  zoneName: string;
  subLabel: string;
  originiumDensity: string;
  elevation: string;
  tacticalWeight: "CORE" | "FLANK" | "VANGUARD";
}

export const SECTORS: SectorMetadata[] = [
  {
    index: 0,
    code: "SEC-A1",
    coord: "00 // 00",
    zoneName: "CHERNOBOG N-01",
    subLabel: "NORTHWEST PERIMETER",
    originiumDensity: "14.2%",
    elevation: "118m",
    tacticalWeight: "VANGUARD",
  },
  {
    index: 1,
    code: "SEC-A2",
    coord: "00 // 01",
    zoneName: "LUNGMEN DOCK 04",
    subLabel: "NORTH TRANSIT CORRIDOR",
    originiumDensity: "08.7%",
    elevation: "092m",
    tacticalWeight: "FLANK",
  },
  {
    index: 2,
    code: "SEC-A3",
    coord: "00 // 02",
    zoneName: "URSUS CITADEL",
    subLabel: "NORTHEAST BASTION",
    originiumDensity: "19.6%",
    elevation: "145m",
    tacticalWeight: "VANGUARD",
  },
  {
    index: 3,
    code: "SEC-B1",
    coord: "01 // 00",
    zoneName: "KAZIMIERZ RING",
    subLabel: "WEST INTERCEPT LINE",
    originiumDensity: "06.4%",
    elevation: "104m",
    tacticalWeight: "FLANK",
  },
  {
    index: 4,
    code: "SEC-B2",
    coord: "01 // 01",
    zoneName: "RHODES BRIDGE",
    subLabel: "CENTRAL COMMAND NEXUS",
    originiumDensity: "24.8%",
    elevation: "160m",
    tacticalWeight: "CORE",
  },
  {
    index: 5,
    code: "SEC-B3",
    coord: "01 // 02",
    zoneName: "LATERANO SPIRE",
    subLabel: "EAST RELAY ARRAY",
    originiumDensity: "09.1%",
    elevation: "132m",
    tacticalWeight: "FLANK",
  },
  {
    index: 6,
    code: "SEC-C1",
    coord: "02 // 00",
    zoneName: "KJERAG SUMMIT",
    subLabel: "SOUTHWEST OUTPOST",
    originiumDensity: "11.5%",
    elevation: "210m",
    tacticalWeight: "VANGUARD",
  },
  {
    index: 7,
    code: "SEC-C2",
    coord: "02 // 01",
    zoneName: "SARGON WASTES",
    subLabel: "SOUTH EXTRACTION ZONE",
    originiumDensity: "16.9%",
    elevation: "076m",
    tacticalWeight: "FLANK",
  },
  {
    index: 8,
    code: "SEC-C3",
    coord: "02 // 02",
    zoneName: "VICTORIA GATE",
    subLabel: "SOUTHEAST STRONGHOLD",
    originiumDensity: "18.3%",
    elevation: "128m",
    tacticalWeight: "VANGUARD",
  },
];

export interface WinningVector {
  line: [number, number, number];
  winner: PlayerSymbol;
  vectorName: string;
  angleType: "ROW-0" | "ROW-1" | "ROW-2" | "COL-0" | "COL-1" | "COL-2" | "DIAG-MAIN" | "DIAG-ANTI";
}

export const WINNING_LINES: {
  line: [number, number, number];
  vectorName: string;
  angleType: WinningVector["angleType"];
}[] = [
  { line: [0, 1, 2], vectorName: "ALPHA HORIZONTAL AXIS [A1-A3]", angleType: "ROW-0" },
  { line: [3, 4, 5], vectorName: "BRAVO CENTRAL AXIS [B1-B3]", angleType: "ROW-1" },
  { line: [6, 7, 8], vectorName: "CHARLIE SOUTHERN AXIS [C1-C3]", angleType: "ROW-2" },
  { line: [0, 3, 6], vectorName: "WEST MERIDIAN VECTOR [A1-C1]", angleType: "COL-0" },
  { line: [1, 4, 7], vectorName: "PRIME MERIDIAN VECTOR [A2-C2]", angleType: "COL-1" },
  { line: [2, 5, 8], vectorName: "EAST MERIDIAN VECTOR [A3-C3]", angleType: "COL-2" },
  { line: [0, 4, 8], vectorName: "PRIMARY DIAGONAL SLASH [A1-C3]", angleType: "DIAG-MAIN" },
  { line: [2, 4, 6], vectorName: "COUNTER DIAGONAL SLASH [A3-C1]", angleType: "DIAG-ANTI" },
];

export function evaluateWinner(board: BoardState): WinningVector | null {
  for (const item of WINNING_LINES) {
    const [a, b, c] = item.line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        line: item.line,
        winner: board[a] as PlayerSymbol,
        vectorName: item.vectorName,
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
  score: number; // From perspective of active player: +10 win, 0 draw, -10 loss
  classification: "OPTIMAL" | "VIABLE" | "CRITICAL_RISK" | "OCCUPIED";
  nodesEvaluated: number;
}

// Minimax with Alpha-Beta Pruning & Depth Preference
function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  maximizingPlayer: PlayerSymbol,
  alpha: number,
  beta: number,
  counter: { nodes: number }
): number {
  counter.nodes += 1;
  const minimizingPlayer: PlayerSymbol = maximizingPlayer === "X" ? "O" : "X";

  const winResult = evaluateWinner(board);
  if (winResult) {
    if (winResult.winner === maximizingPlayer) {
      return 100 - depth * 6;
    } else {
      return -100 + depth * 6;
    }
  }

  if (isBoardFull(board)) {
    return 0;
  }

  // Prefer center then corners then edges for deterministic tie-breaking
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  if (isMaximizing) {
    let best = -Infinity;
    for (const idx of moveOrder) {
      if (board[idx] === null) {
        board[idx] = maximizingPlayer;
        const val = minimax(
          board,
          depth + 1,
          false,
          maximizingPlayer,
          alpha,
          beta,
          counter
        );
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
        const val = minimax(
          board,
          depth + 1,
          true,
          maximizingPlayer,
          alpha,
          beta,
          counter
        );
        board[idx] = null;
        best = Math.min(best, val);
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

// Compute real-time PRTS Neural Telemetry for every sector on the board
export function computeSectorTelemetry(
  board: BoardState,
  activePlayer: PlayerSymbol
): CellEvaluation[] {
  const win = evaluateWinner(board);
  if (win || isBoardFull(board)) {
    return SECTORS.map((s) => ({
      index: s.index,
      score: 0,
      classification: "OCCUPIED",
      nodesEvaluated: 0,
    }));
  }

  const evaluations: CellEvaluation[] = [];
  const workingBoard = [...board];

  for (let i = 0; i < 9; i++) {
    if (workingBoard[i] !== null) {
      evaluations.push({
        index: i,
        score: 0,
        classification: "OCCUPIED",
        nodesEvaluated: 0,
      });
      continue;
    }

    const counter = { nodes: 0 };
    workingBoard[i] = activePlayer;
    const score = minimax(
      workingBoard,
      0,
      false,
      activePlayer,
      -Infinity,
      Infinity,
      counter
    );
    workingBoard[i] = null;

    evaluations.push({
      index: i,
      score,
      classification: "VIABLE",
      nodesEvaluated: counter.nodes,
    });
  }

  const available = evaluations.filter((e) => e.classification !== "OCCUPIED");
  if (available.length > 0) {
    const maxScore = Math.max(...available.map((e) => e.score));
    for (const ev of evaluations) {
      if (ev.classification === "OCCUPIED") continue;
      if (ev.score === maxScore) {
        ev.classification = "OPTIMAL";
      } else if (ev.score < 0) {
        ev.classification = "CRITICAL_RISK";
      } else {
        ev.classification = "VIABLE";
      }
    }
  }

  return evaluations;
}

// Choose move for PRTS AI based on Threat Level
export function selectPRTSMove(
  board: BoardState,
  aiSymbol: PlayerSymbol,
  threatLevel: ThreatLevel
): { moveIndex: number; telemetry: CellEvaluation[]; totalNodes: number } {
  const telemetry = computeSectorTelemetry(board, aiSymbol);
  const available = telemetry.filter((t) => t.classification !== "OCCUPIED");
  const totalNodes = telemetry.reduce((acc, item) => acc + item.nodesEvaluated, 0);

  if (available.length === 0) {
    return { moveIndex: -1, telemetry, totalNodes: 0 };
  }

  const opponentSymbol: PlayerSymbol = aiSymbol === "X" ? "O" : "X";

  // Helper to check immediate win or immediate block
  const findImmediateStrike = (symbol: PlayerSymbol): number | null => {
    for (const item of WINNING_LINES) {
      const [a, b, c] = item.line;
      const lineVals = [board[a], board[b], board[c]];
      const countSymbol = lineVals.filter((v) => v === symbol).length;
      const countEmpty = lineVals.filter((v) => v === null).length;
      if (countSymbol === 2 && countEmpty === 1) {
        if (board[a] === null) return a;
        if (board[b] === null) return b;
        if (board[c] === null) return c;
      }
    }
    return null;
  };

  if (threatLevel === "RECON") {
    // 55% optimal/tactical, 45% exploratory flank
    const immediateWin = findImmediateStrike(aiSymbol);
    if (immediateWin !== null && Math.random() < 0.75) {
      return { moveIndex: immediateWin, telemetry, totalNodes };
    }
    const sorted = [...available].sort((a, b) => b.score - a.score);
    const pool = sorted.slice(0, Math.min(3, sorted.length));
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    return { moveIndex: chosen.index, telemetry, totalNodes };
  }

  if (threatLevel === "TACTICAL") {
    // Always takes immediate wins and blocks immediate threats
    const immediateWin = findImmediateStrike(aiSymbol);
    if (immediateWin !== null) {
      return { moveIndex: immediateWin, telemetry, totalNodes };
    }
    const immediateBlock = findImmediateStrike(opponentSymbol);
    if (immediateBlock !== null) {
      return { moveIndex: immediateBlock, telemetry, totalNodes };
    }
    const optimalMoves = available.filter((a) => a.classification === "OPTIMAL");
    if (Math.random() < 0.8 && optimalMoves.length > 0) {
      return { moveIndex: optimalMoves[0].index, telemetry, totalNodes };
    }
    return { moveIndex: available[0].index, telemetry, totalNodes };
  }

  // PRTS_OVERCLOCK: Unbeatable deterministic + tactical priority (center -> corners -> edges)
  const priorityOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  const optimalMoves = available
    .filter((a) => a.classification === "OPTIMAL")
    .sort(
      (a, b) => priorityOrder.indexOf(a.index) - priorityOrder.indexOf(b.index)
    );

  return {
    moveIndex: optimalMoves[0]?.index ?? available[0].index,
    telemetry,
    totalNodes,
  };
}

