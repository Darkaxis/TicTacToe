"use client";

import React from "react";
import { Terminal, Shield, Cpu, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RhodesVanguardMark, ReunionOriginiumSigil } from "./tactical-emblems";

export function TacticalDossierModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-rhodes-cyan" />
          <span className="hidden sm:inline">PRTS DOSSIER</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="clip-chamfer-lg border-white/25 bg-[#0B0E14] text-rhodes-bone max-w-2xl">
        <DialogHeader className="border-b border-white/15 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="rhodes">CLASSIFIED // LEVEL 04</Badge>
            <span className="font-mono text-[10px] tracking-[0.2em] text-rhodes-bone/50">
              DOC-ID // RI-PRTS-3X3
            </span>
          </div>
          <DialogTitle className="text-2xl tracking-[0.08em]">
            ORIGINIUM TACTICAL MATRIX // OPERATION BRIEFING
          </DialogTitle>
          <DialogDescription>
            RHODES ISLAND NEURAL TACTICAL SIMULATION SYSTEM (PRTS V4.09)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {/* Faction 1: Rhodes Island */}
          <div className="border border-rhodes-cyan/40 bg-rhodes-cyan/5 p-3.5 flex items-start gap-3">
            <div className="shrink-0 pt-1">
              <RhodesVanguardMark size="sm" />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-xs font-bold tracking-[0.15em] text-rhodes-cyan">
                RHODES ISLAND // VANGUARD [X]
              </div>
              <p className="font-mono text-[11px] text-rhodes-bone/70 leading-relaxed">
                Primary tactical deployment unit. Strikes first on initial cycle unless reassigned via Faction Switch.
              </p>
            </div>
          </div>

          {/* Faction 2: Reunion Movement */}
          <div className="border border-rhodes-reunion/40 bg-rhodes-reunion/5 p-3.5 flex items-start gap-3">
            <div className="shrink-0 pt-1">
              <ReunionOriginiumSigil size="sm" />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-xs font-bold tracking-[0.15em] text-rhodes-reunion">
                REUNION // ORIGINIUM SIGIL [O]
              </div>
              <p className="font-mono text-[11px] text-rhodes-bone/70 leading-relaxed">
                Counter-deployment insurgent vector. Controlled by PRTS Neural AI or a second local commander.
              </p>
            </div>
          </div>
        </div>

        {/* System Capabilities */}
        <div className="space-y-3 border-t border-white/15 pt-4 font-mono text-xs">
          <div className="flex items-start gap-3">
            <Cpu className="w-4 h-4 text-rhodes-cyan shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rhodes-bone tracking-wider">
                PRTS NEURAL OVERCLOCK (MINIMAX ALPHA-BETA):
              </span>{" "}
              <span className="text-rhodes-bone/70">
                Enable the PRTS Telemetry Overlay to inspect real-time minimax decision tree evaluations (+OPTIMAL, VIABLE, -CRITICAL RISK) across all 9 sectors.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-rhodes-amber shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rhodes-bone tracking-wider">
                CHRONO-CYCLE TIMELINE SCRUBBING:
              </span>{" "}
              <span className="text-rhodes-bone/70">
                Click any historical entry in the Combat Log to rewind the tactical matrix to that exact deployment cycle and branch into an alternate timeline.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Keyboard className="w-4 h-4 text-rhodes-cyan shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rhodes-bone tracking-wider">
                DIRECT HOTKEY MATRIX:
              </span>{" "}
              <span className="text-rhodes-bone/70">
                Press keys [1]–[9] to deploy into SEC-A1 through SEC-C3, [V] to toggle PRTS Neural Vision, [M] to mute/unmute audio, and [R] to reset the operation.
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

