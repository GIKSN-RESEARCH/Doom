"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Desktop inertial scrolling. Wheel input is eased through a lerp loop while
 * mobile and coarse-pointer devices keep reliable native scrolling.
 *
 * - Same-page hashes (#services, #pricing …) scroll through Lenis only when
 *   the target id exists. Missing hashes are ignored (no "Target not found").
 * - Disabled for mobile and prefers-reduced-motion users (native scroll kept).
 */
export default function SmoothScroll() {
  useEffect(() => {
    // A refresh should always start this one-page site from the hero. Browser
    // scroll restoration runs independently of Next.js, so opt out explicitly
    // and reset again on the next frame after layout has been measured.
    window.history.scrollRestoration = "manual";

    // Homepage only: strip hash on reload so the browser doesn't jump past the hero.
    // Other routes (e.g. /reading) may use hashes as in-page tabs.
    const isHome = window.location.pathname === "/";
    if (isHome && window.location.hash) {
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
      // Handle same-page hashes ourselves so missing targets (stale nav
      // hashes) do not warn "Lenis: Target not found".
      anchors: false,
    });

    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) return;
      if (!url.hash || url.hash === "#") return;

      const id = decodeURIComponent(url.hash.slice(1));
      const node = document.getElementById(id);
      if (!node) return;

      event.preventDefault();
      lenis.scrollTo(node);
    };
    window.addEventListener("click", onAnchorClick);
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
      window.removeEventListener("click", onAnchorClick);
      window.removeEventListener("lenis:stop", handleStop);
      window.removeEventListener("lenis:start", handleStart);
      lenis.destroy();
    };
  }, []);

  return null;
}
