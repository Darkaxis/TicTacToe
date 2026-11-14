# Tic-Tac-Toe // Tactical Grid

A tactical industrial **Tic-Tac-Toe** web application built with **React 19**, **Next.js 15 (App Router)**, **Tailwind CSS**, **shadcn/ui** (Radix UI primitives), and **Framer Motion**.

Designed with sharp chamfered geometry, high-contrast obsidian and bone-white surfaces, cyan/crimson accents, procedural Web Audio feedback, and choreographed motion graphics without sacrificing responsiveness or UX clarity.

---

## Features

- **Game Modes**
  - **You vs Bot**: Play as `X` (First) or `O` (Second) against a 3-tier AI:
    - **Easy**: Opportunistic play with room for tactical openings.
    - **Normal**: Blocks immediate threats and converts winning lines.
    - **Unbeatable**: Depth-weighted **Minimax with Alpha-Beta pruning**.
  - **2 Players**: Local pass-and-play mode (`Player 1 [X]` vs `Player 2 [O]`).
- **Live Move Hints (`[H]`)**: Optional Minimax evaluation overlay showing `BEST`, `DRAW`, or `RISK` across open squares (`A1`–`C3`).
- **Interactive Move History & Undo (`[Z]`)**: Jump back to any previous turn by clicking move pills or stepping back with Undo.
- **Choreographed Motion Graphics**:
  - Shared-element `layoutId` gliding hover reticle across grid cells.
  - Directional `clip-path` blade slashes (`X`) and `pathLength` octagonal lock-in (`O`).
  - Staggered winning vector beam with traveling flare, non-winning square focus dimming, and delayed result banner reveal.
  - Sliding active-turn scorecard plate, rolling score digits, and `<MotionConfig reducedMotion="user">` support.
- **Procedural Web Audio Synth (`[M]`)**: Zero-asset Web Audio API synthesizer for hover ticks, button latches, mark placements, and match outcomes.

---

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `1` – `9` | Place mark in squares `A1` through `C3` |
| `Z` / `Backspace` | Undo last move |
| `H` | Toggle live move hints |
| `R` | Start a new game |
| `M` | Mute / unmute sound effects |

---

## Tech Stack

- **Framework**: Next.js 15 (`^15.2.0`), React 19 (`^19.0.0`), TypeScript (`^5.7.3`)
- **Styling**: Tailwind CSS (`^3.4.17`), `tailwindcss-animate`, `class-variance-authority`
- **UI Primitives**: shadcn/ui (`@radix-ui/react-dialog`, `switch`, `tabs`, `tooltip`, `separator`, `slot`), `lucide-react`
- **Animation**: Framer Motion (`^12.4.7`)
- **Fonts**: `Rajdhani`, `Chakra Petch`, and `JetBrains Mono` via `next/font/google`

---

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**

   ```bash
   npm run build
   npm run start
   ```

---

## Project Structure

```text
src/
├── app/
│   ├── globals.css                # Theme CSS variables, chamfer clip-paths, grid utilities
│   ├── layout.tsx                 # Root layout and Google Fonts configuration
│   ├── not-found.tsx              # Custom 404 route
│   └── page.tsx                   # Entry page
├── components/
│   ├── game/                      # Feature UI components
│   │   ├── board-cell.tsx         # Individual 3x3 cell with centered marks & hover reticle
│   │   ├── game-board.tsx         # 3x3 board frame, scanline wipe, and win overlay
│   │   ├── game-controls.tsx      # Mode, difficulty, side selection, and move history
│   │   ├── guide-dialog.tsx       # How-to-play & keyboard shortcuts modal
│   │   ├── marks.tsx              # Animated X, O, and brand SVG marks
│   │   ├── result-modal.tsx       # Win / draw result modal with 3-star rating
│   │   ├── scoreboard.tsx         # Active-turn scorecards and rolling score digits
│   │   ├── scramble-text.tsx      # Glyph-scramble text reveal effect
│   │   ├── tic-tac-toe.tsx        # Top-level layout & game container
│   │   ├── topographic-bg.tsx     # Animated topographic canvas backdrop
│   │   └── win-line.tsx           # Animated SVG winning strike vector
│   └── ui/                        # Reusable shadcn/ui primitives
├── hooks/
│   └── use-tic-tac-toe.ts         # Game state, bot turn scheduling, and keyboard shortcuts
├── lib/
│   ├── audio-engine.ts            # Procedural Web Audio API sound synthesizer
│   ├── game-engine.ts             # Pure Minimax Alpha-Beta AI & board evaluation
│   └── utils.ts                   # Tailwind class-merging utility
└── types/
    └── game.ts                    # Shared TypeScript domain interfaces & types
```
