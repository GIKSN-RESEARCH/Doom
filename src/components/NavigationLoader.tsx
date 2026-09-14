"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SpinningText } from "@/components/magicui/spinning-text";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const currentPathnameRef = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentPathnameRef.current = pathname;

    // When pathname changes, hold for a smooth moment then fade out
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 650);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  // Click interceptor on all internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Same-page hash links (e.g. #services, #pricing, #approach)
      if (href.startsWith("#")) return;

      // Ignore mailto, tel, javascript, etc.
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      // Ignore new tabs or modified clicks
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);

        // Ignore external domains
        if (url.origin !== window.location.origin) return;

        // If target pathname is different from current pathname, show loader
        if (url.pathname !== currentPathnameRef.current) {
          setIsLoading(true);

          // Safety fallback: if navigation fails or hangs, hide after 6s
          if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
          safetyTimerRef.current = setTimeout(() => {
            setIsLoading(false);
          }, 6000);
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    const handlePopState = () => {
      setIsLoading(true);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 6000);
    };

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="navigation-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fff2f2] pointer-events-auto select-none"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative flex items-center justify-center">
            <SpinningText
              className="font-logo text-sm sm:text-base tracking-[0.2em] uppercase text-[#120408] select-none size-40 sm:size-48"
              duration={prefersReducedMotion ? 0 : 3}
              radius={5.2}
            >
              DOOM STUDIO • DOOM STUDIO •
            </SpinningText>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NavigationLoader;
