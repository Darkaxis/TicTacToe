"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RhodesCrestLogo, TacticalBarcode } from "./tactical-emblems";

export function BootShutterOverlay() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1150;
    let raf: number;

    const step = (now: number) => {
      const pct = Math.min(100, Math.floor(((now - start) / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(step);
      } else {
        setTimeout(() => setVisible(false), 180);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="prts-boot-shutter"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#090A0D] p-6 sm:p-10 cursor-pointer select-none overflow-hidden"
        >
          {/* Top Shutter Curtain */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
            className="flex items-center justify-between border-b border-white/15 pb-4"
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-rhodes-cyan animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.26em] text-rhodes-bone/75">
                PRTS // NEURAL LINK INITIALIZATION SEQUENCE
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] text-rhodes-bone/50">
              [CLICK ANYWHERE TO BYPASS]
            </span>
          </motion.div>

          {/* Center Monolith Diagnostic Block */}
          <div className="my-auto mx-auto w-full max-w-xl border border-white/20 bg-[#11141B] p-6 sm:p-8 clip-chamfer-lg relative">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <RhodesCrestLogo className="w-11 h-11" />
                <div>
                  <div className="font-mono text-[10px] tracking-[0.25em] text-rhodes-cyan uppercase">
                    RHODES ISLAND TACTICAL DIVISION
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[0.08em] text-rhodes-bone uppercase">
                    PRTS TERMINAL // V4.09
                  </h2>
                </div>
              </div>
              <TacticalBarcode code="BOOT // 09-X" />
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px] tracking-[0.2em]">
                <span className="text-rhodes-bone/70">
                  LOADING ORIGINIUM TACTICAL MATRIX...
                </span>
                <span className="text-rhodes-cyan font-bold">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-black border border-white/20 p-0.5">
                <div
                  className="h-full bg-rhodes-cyan transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-[9px] tracking-[0.16em] text-rhodes-bone/45">
                <div>MINIMAX_CORE: ONLINE</div>
                <div>SECTOR_GRID: 3x3 LOCKED</div>
                <div>AUDIO_SYNTH: READY</div>
              </div>
            </div>
          </div>

          {/* Bottom Shutter Bar */}
          <div className="flex items-center justify-between border-t border-white/15 pt-4 font-mono text-[10px] tracking-[0.22em] text-rhodes-bone/40">
            <span>STUDIO MONTAGNE // TACTICAL GRAPHICS ARCHITECTURE</span>
            <span>AUTH // DOCTOR_ID_001</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

