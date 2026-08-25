"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Global inertial scrolling. Wheel/touch input is eased through a lerp loop
 * so the page glides instead of stepping — the "premium" scroll feel.
 *
 * - Anchor links (#services, #pricing …) are intercepted and scrolled to
 *   smoothly via Lenis's built-in `anchors` option.
 * - Disabled entirely for prefers-reduced-motion users (native scroll kept).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.6,
      anchors: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
