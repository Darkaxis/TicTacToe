"use client";

import React, { useEffect, useState } from "react";

const GLYPHS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ//[]#-+=_";

interface ScrambleTextProps {
  text: string;
  className?: string;
  durationMs?: number;
  triggerKey?: string | number;
}

export function ScrambleText({
  text,
  className,
  durationMs = 360,
  triggerKey,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let frameId: number;
    const start = performance.now();
    const length = text.length;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const revealCount = Math.floor(progress * length);

      let out = "";
      for (let i = 0; i < length; i++) {
        const ch = text[i];
        if (ch === " " || i < revealCount) {
          out += ch;
        } else {
          const glyphIndex =
            (i * 13 + Math.floor(elapsed / 25)) % GLYPHS.length;
          out += GLYPHS[glyphIndex];
        }
      }
      setDisplay(out);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [text, durationMs, triggerKey]);

  return <span className={className}>{display}</span>;
}

