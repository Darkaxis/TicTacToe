"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BoardState,
  CellEvaluation,
  PlayerSymbol,
  WinningLine,
} from "@/types/game";
import { areOrthogonalNeighbors, CELL_COORDINATES } from "@/lib/game-engine";
import { BoardCell } from "./board-cell";
import { WinLine } from "./win-line";

interface GameBoardProps {
  board: BoardState;
  activePlayer: PlayerSymbol;
  winningLine: WinningLine | null;
  lastMoveIndex: number | null;
  isGameOver: boolean;
  isBotThinking: boolean;
  isBoardShaking: boolean;
  resetSweepKey: number;
  hoveredIndex: number | null;
  pulseCenterIndex: number | null;
  showHints: boolean;
  evaluations: CellEvaluation[];
  onSelectCell: (index: number) => void;
  onHoverCell: (index: number | null) => void;
}

export function GameBoard({
  board,
  activePlayer,
  winningLine,
  lastMoveIndex,
  isGameOver,
  isBotThinking,
  isBoardShaking,
  resetSweepKey,
  hoveredIndex,
  pulseCenterIndex,
  showHints,
  evaluations,
  onSelectCell,
  onHoverCell,
}: GameBoardProps) {
  return (
    <motion.div
      animate={
        isBoardShaking
          ? { x: [0, -6, 6, -3, 3, 0], y: [0, 3, -3, 2, -2, 0] }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.28 }}
      className="relative w-full max-w-[480px] border border-white/25 bg-[#0B0E15]/95 p-3.5 sm:p-5 clip-chamfer-lg overflow-hidden"
    >
      {/* Bot thinking top progress beam */}
      <AnimatePresence>
        {isBotThinking && (
          <motion.div
            key="bot-thinking-beam"
            initial={{ scaleX: 0, opacity: 0.9 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.31, ease: "linear" }}
            style={{ originX: 0 }}
            className={`pointer-events-none absolute top-0 left-0 right-0 h-[2px] z-30 ${
              activePlayer === "X" ? "bg-tactical-cyan" : "bg-tactical-crimson"
            }`}
          />
        )}
      </AnimatePresence>

      {/* New game scanline sweep */}
      {resetSweepKey > 0 && (
        <motion.div
          key={`reset-sweep-${resetSweepKey}`}
          initial={{ x: "-100%", opacity: 0.7 }}
          animate={{ x: "120%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-y-0 w-1/3 z-30 bg-gradient-to-r from-transparent via-tactical-cyan/25 to-transparent"
        />
      )}

      <div
        onMouseLeave={() => onHoverCell(null)}
        className="relative grid grid-cols-3 gap-2.5 sm:gap-3 bg-tactical-subgrid p-1.5 border border-white/10"
      >
        {CELL_COORDINATES.map((coordinate) => {
          const cellVal = board[coordinate.index];
          const winOrderIndex = winningLine
            ? winningLine.line.indexOf(coordinate.index)
            : -1;
          const isWinCell = winOrderIndex !== -1;
          const isDimmed = winningLine !== null && !isWinCell;
          const isLastMove = lastMoveIndex === coordinate.index;
          const isNeighborPulse =
            pulseCenterIndex !== null &&
            areOrthogonalNeighbors(pulseCenterIndex, coordinate.index);

          return (
            <BoardCell
              key={coordinate.code}
              coordinate={coordinate}
              value={cellVal}
              activePlayer={activePlayer}
              isWinningCell={isWinCell}
              isDimmed={isDimmed}
              isLastMove={isLastMove}
              isHovered={hoveredIndex === coordinate.index}
              isNeighborPulse={isNeighborPulse}
              isDisabled={isGameOver || isBotThinking}
              showHints={showHints}
              evaluation={evaluations[coordinate.index]}
              entryDelay={(coordinate.row + coordinate.col) * 0.035}
              winOrderIndex={winOrderIndex}
              onSelect={onSelectCell}
              onHoverChange={onHoverCell}
            />
          );
        })}

        <WinLine winningLine={winningLine} />
      </div>
    </motion.div>
  );
}

