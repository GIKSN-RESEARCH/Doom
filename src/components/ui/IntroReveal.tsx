"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface IntroRevealProps {
  onStartExit?: () => void;
  onComplete?: () => void;
}

const LETTERS = ["D", "O", "O", "M"];

export default function IntroReveal({ onStartExit, onComplete }: IntroRevealProps) {
  const prefersReduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Lock scroll at (0, 0) during initial load animation
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.body.style.overflow = "hidden";
    }

    if (prefersReduced) {
      document.body.style.overflow = "";
      onComplete?.();
      return;
    }

    // Deliberate, cinematic counter sequence (0 -> 100% over ~1400ms)
    const startTime = performance.now();
    const duration = 1400;

    let frameId: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        frameId = requestAnimationFrame(tick);
      } else {
        // Hold at 100% with full wordmark visible before smooth upward glide
        setTimeout(() => {
          setIsExiting(true);
          onStartExit?.();
        }, 300);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = "";
    };
  }, [prefersReduced, onStartExit, onComplete]);

  if (prefersReduced) return null;

  return (
    <motion.div
      initial={{ y: "0%" }}
      animate={{ y: isExiting ? "-100%" : "0%" }}
      transition={{
        duration: 1.35,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={() => {
        if (isExiting) {
          document.body.style.overflow = "";
          onComplete?.();
        }
      }}
      className="fixed inset-x-0 top-0 h-svh z-[9999] flex flex-col items-center justify-center bg-[#120408] border-b border-[#4b1426]/30 overflow-hidden select-none"
    >
      {/* Central Logo & Letter Reveal */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* DOOM wordmark revealed letter by letter: D -> O -> O -> M */}
        <div className="relative flex items-center justify-center overflow-hidden px-4">
          {LETTERS.map((letter, index) => (
            <div key={index} className="overflow-hidden">
              <motion.span
                initial={{ y: "115%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.12 + index * 0.24,
                }}
                className="inline-block font-logo text-7xl sm:text-9xl tracking-[0.06em] text-[#fff2f2] leading-none text-center"
                style={{ fontFamily: "var(--font-boxing), sans-serif" }}
              >
                {letter}
              </motion.span>
            </div>
          ))}
        </div>

        {/* High-tech Loading Bar & Counter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-3 w-56 sm:w-64"
        >
          {/* Progress bar track */}
          <div className="relative w-full h-[2px] bg-white/15 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-[#fff2f2] rounded-full shadow-[0_0_8px_rgba(255,242,242,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status and percentage */}
          <div className="flex w-full items-center justify-between text-[11px] font-mono tracking-wider text-[#fff2f2]/70">
            <span className="uppercase tracking-[0.25em] text-[10px] text-[#fff2f2]/50">
              KILLING BOTTLENECKS
            </span>
            <span className="font-semibold text-[#fff2f2]">
              {progress.toString().padStart(2, "0")}%
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
