"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Desktop inertial scrolling. Wheel input is eased through a lerp loop while
 * mobile and coarse-pointer devices keep reliable native scrolling.
 *
 * - Anchor links (#services, #pricing …) are intercepted and scrolled to
 *   smoothly via Lenis's built-in `anchors` option.
 * - Disabled for mobile and prefers-reduced-motion users (native scroll kept).
 */
export default function SmoothScroll() {
  useEffect(() => {
    // A refresh should always start this one-page site from the hero. Browser
    // scroll restoration runs independently of Next.js, so opt out explicitly
    // and reset again on the next frame after layout has been measured.
    window.history.scrollRestoration = "manual";

    // Strip hash on reload so browser doesn't anchor-jump down the page
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    const resetScrollPosition = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    resetScrollPosition();

    // Ensure browser snapshot records top on reload
    const onBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    let resetFrame = requestAnimationFrame(() => {
      resetScrollPosition();
      resetFrame = requestAnimationFrame(resetScrollPosition);
    });

    window.addEventListener("pageshow", resetScrollPosition);

    const cleanupScrollReset = () => {
      cancelAnimationFrame(resetFrame);
      window.removeEventListener("pageshow", resetScrollPosition);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return cleanupScrollReset;
    }

    // Use native scrolling for the entire mobile layout, including desktop
    // responsive emulation where touch APIs are not exposed. Lenis can keep an
    // old scroll target while responsive sections resize, which makes the page
    // feel stuck or continue moving after an anchor click.
    const usesMobileScrolling = window.matchMedia(
      "(max-width: 767px), (pointer: coarse)"
    ).matches;
    if (usesMobileScrolling) return cleanupScrollReset;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false,
      anchors: true,
    });
    lenis.scrollTo(0, { immediate: true });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const handleStop = () => lenis.stop();
    const handleStart = () => lenis.start();
    window.addEventListener("lenis:stop", handleStop);
    window.addEventListener("lenis:start", handleStart);

    return () => {
      cleanupScrollReset();
      cancelAnimationFrame(raf);
      window.removeEventListener("lenis:stop", handleStop);
      window.removeEventListener("lenis:start", handleStart);
      lenis.destroy();
    };
  }, []);

  return null;
}
