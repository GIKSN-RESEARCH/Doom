"use client";

import React from "react";
import { useReducedMotion } from "motion/react";
import { SpinningText } from "@/components/magicui/spinning-text";

export interface PageLoaderProps {
  className?: string;
  duration?: number;
}

export function PageLoader({ className, duration = 3 }: PageLoaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fff2f2] ${className ?? ""}`}
    >
      <div className="relative flex items-center justify-center">
        <SpinningText
          className="font-logo text-sm sm:text-base tracking-[0.2em] uppercase text-[#120408] select-none size-40 sm:size-48"
          duration={prefersReducedMotion ? 0 : duration}
          radius={5.2}
        >
          DOOM STUDIO • DOOM STUDIO •
        </SpinningText>
      </div>
    </div>
  );
}

export default PageLoader;
