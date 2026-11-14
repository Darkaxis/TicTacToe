"use client";

import React from "react";
import { HelpCircle, Keyboard, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RhodesVanguardMark, ReunionOriginiumSigil } from "./tactical-emblems";

export function TacticalDossierModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-rhodes-cyan" />
          <span className="hidden sm:inline">GUIDE</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="clip-chamfer-lg border-white/20 bg-[#0B0E14] text-rhodes-bone max-w-lg">
        <DialogHeader className="border-b border-white/15 pb-3">
          <DialogTitle className="text-xl tracking-[0.08em]">
            HOW TO PLAY & CONTROLS
          </DialogTitle>
          <DialogDescription>
            Tactical Tic-Tac-Toe — You vs Bot or 2 Players
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-1">
          <div className="border border-rhodes-cyan/35 bg-rhodes-cyan/5 p-3 flex items-center gap-3">
            <RhodesVanguardMark size="sm" />
            <div>
              <div className="font-mono text-xs font-bold text-rhodes-cyan">
                MARK [X]
              </div>
              <div className="font-mono text-[10px] text-rhodes-bone/65">
                Plays first
              </div>
            </div>
          </div>

          <div className="border border-rhodes-reunion/35 bg-rhodes-reunion/5 p-3 flex items-center gap-3">
            <ReunionOriginiumSigil size="sm" />
            <div>
              <div className="font-mono text-xs font-bold text-rhodes-reunion">
                MARK [O]
              </div>
              <div className="font-mono text-[10px] text-rhodes-bone/65">
                Plays second
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-white/15 pt-3 font-mono text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-rhodes-cyan shrink-0 mt-0.5" />
            <div className="text-rhodes-bone/75 leading-relaxed">
              <strong className="text-rhodes-bone">Hints Toggle [H]:</strong>{" "}
              Displays live move evaluations (<code>BEST</code>,{" "}
              <code>DRAW</code>, or <code>RISK</code>) on open squares.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Keyboard className="w-4 h-4 text-rhodes-amber shrink-0 mt-0.5" />
            <div className="text-rhodes-bone/75 leading-relaxed">
              <strong className="text-rhodes-bone">Keyboard Shortcuts:</strong>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5 text-[11px]">
                <span>[1–9] Place mark</span>
                <span>[Z] Undo move</span>
                <span>[H] Toggle hints</span>
                <span>[R] New game</span>
                <span>[M] Mute / unmute</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
