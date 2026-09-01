"use client";

import React, { useEffect, useState, useRef } from "react";

interface IntroRevealProps {
  onStartExit?: () => void;
  onComplete?: () => void;
}

const LETTERS = ["D", "O", "O", "M"];

export default function IntroReveal({ onStartExit, onComplete }: IntroRevealProps) {
  const [visibleLetters, setVisibleLetters] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const onStartExitRef = useRef(onStartExit);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onStartExitRef.current = onStartExit;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    // Lock scroll at (0, 0) during initial load animation
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.body.style.overflow = "hidden";
    }

    // Safety watchdog: guarantee that scroll is NEVER permanently locked
    const watchdogTimer = window.setTimeout(() => {
      document.body.style.overflow = "";
      onCompleteRef.current?.();
    }, 3500);

    // Stagger letters sequentially: D -> O -> O -> M
    const t1 = window.setTimeout(() => setVisibleLetters(1), 120); // D
    const t2 = window.setTimeout(() => setVisibleLetters(2), 360); // O
    const t3 = window.setTimeout(() => setVisibleLetters(3), 600); // O
    const t4 = window.setTimeout(() => setVisibleLetters(4), 840); // M

    // Progress counter (0 -> 100% over 1300ms)
    const startTime = performance.now();
    const duration = 1300;
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        frameId = requestAnimationFrame(tick);
      } else {
        // Hold full DOOM wordmark at 100% before starting upward push
        window.setTimeout(() => {
          setIsExiting(true);
          onStartExitRef.current?.();
        }, 280);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(watchdogTimer);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      cancelAnimationFrame(frameId);
      document.body.style.overflow = "";
    };
  }, []); // Run ONCE reliably on mount

  return (
    <div
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && isExiting) {
          document.body.style.overflow = "";
          onCompleteRef.current?.();
        }
      }}
      className="fixed inset-x-0 top-0 h-svh z-[9999] flex flex-col items-center justify-center bg-[#120408] border-b border-[#4b1426]/30 overflow-hidden select-none will-change-transform"
      style={{
        transform: isExiting ? "translateY(-100%)" : "translateY(0%)",
        transition: isExiting
          ? "transform 1.35s cubic-bezier(0.76, 0, 0.24, 1)"
          : "none",
      }}
    >
      {/* Central Logo & Letter Reveal */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* DOOM wordmark revealed letter by letter: D -> O -> O -> M */}
        <div className="relative flex items-center justify-center overflow-hidden px-4">
          {LETTERS.map((letter, index) => (
            <div key={index} className="overflow-hidden">
              <span
                className="inline-block font-logo text-7xl sm:text-9xl tracking-[0.06em] text-[#fff2f2] leading-none text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  fontFamily: "var(--font-boxing), sans-serif",
                  transform:
                    index < visibleLetters
                      ? "translateY(0%)"
                      : "translateY(115%)",
                  opacity: index < visibleLetters ? 1 : 0,
                }}
              >
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* High-tech Loading Bar & Counter */}
        <div
          className="flex flex-col items-center gap-3 w-56 sm:w-64 transition-all duration-500 ease-out"
          style={{
            opacity: visibleLetters > 0 ? 1 : 0,
            transform:
              visibleLetters > 0 ? "translateY(0px)" : "translateY(12px)",
          }}
        >
          {/* Progress bar track */}
          <div className="relative w-full h-[2px] bg-white/15 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#fff2f2] rounded-full shadow-[0_0_8px_rgba(255,242,242,0.8)] transition-[width] duration-75 ease-linear"
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
        </div>
      </div>
    </div>
  );
}
