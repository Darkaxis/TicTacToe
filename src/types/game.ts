export type PlayerSymbol = "X" | "O";
export type CellValue = PlayerSymbol | null;
export type BoardState = CellValue[];
export type GameMode = "AI" | "PVP";
export type Difficulty = "EASY" | "NORMAL" | "UNBEATABLE";

export interface CellCoordinate {
  index: number;
  code: string;
  row: number;
  col: number;
}

export type WinLineType =
  | "ROW-0"
  | "ROW-1"
  | "ROW-2"
  | "COL-0"
  | "COL-1"
  | "COL-2"
  | "DIAG-MAIN"
  | "DIAG-ANTI";

export interface WinningLine {
  line: [number, number, number];
  winner: PlayerSymbol;
  label: string;
  angleType: WinLineType;
}

export interface CellEvaluation {
  index: number;
  score: number;
  status: "BEST" | "SAFE" | "RISK" | "OCCUPIED";
}

export interface HistoryStep {
  board: BoardState;
  moveIndex: number | null;
  player: PlayerSymbol | null;
}

export interface ScoreBoard {
  X: number;
  O: number;
  DRAW: number;
}

