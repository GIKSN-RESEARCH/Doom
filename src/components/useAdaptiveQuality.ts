/* eslint-disable react-hooks/refs */
"use client";

import { useCallback, useRef, useState } from "react";

export interface AdaptiveQualityOptions {
  enabled: boolean;
  targetFps: number;
  maxDpr: number;
}

// DPR stepping. Steps are 0.125 apart so we always move in a predictable
// increment and never thrash between two adjacent values.
const DPR_STEP = 0.125;
const MIN_DPR = 0.5;

// Hysteresis bands. Drop a step when fps falls below 85% of target, only
// raise a step after ~1s of fps above 115% of target. The asymmetry keeps
// the resolution stable near the target instead of oscillating.
const FPS_DROP_RATIO = 0.85;
const FPS_RAISE_RATIO = 1.15;
const STABLE_FRAMES_NEEDED = 60;

// Anything bigger than this in one frame usually means the tab was hidden
// or the system was asleep — exclude it from the EMA so it doesn't pollute
// the rolling average.
const DT_OUTLIER_CAP_MS = 200;

export interface AdaptiveQualityResult {
  /** The dpr the canvas should currently render at. Already clamped to maxDpr. */
  dpr: number;
  /** Call once per frame with the frame delta in ms. No-op when disabled. */
  update: (dtMs: number) => void;
}

export function useAdaptiveQuality({
  enabled,
  targetFps,
  maxDpr,
}: AdaptiveQualityOptions): AdaptiveQualityResult {
  // Start at a sensible mid-range step rather than maxDpr so the first
  // second of adaptation can either ramp up (good device) or stay put
  // (slow device) without an initial overshoot.
  const [dpr, setDpr] = useState(() =>
    clampDpr(Math.min(maxDpr, 1.0)),
  );

  // Refs mirror the latest props/state so the per-frame callback can stay
  // stable (empty deps) and the rAF closure never needs to be rebuilt.
  const dprRef = useRef(dpr);
   
  dprRef.current = dpr;

  const enabledRef = useRef(enabled);
  const targetFpsRef = useRef(targetFps);
  const maxDprRef = useRef(maxDpr);
  enabledRef.current = enabled;
  targetFpsRef.current = targetFps;
  maxDprRef.current = maxDpr;

  const frameTimeAvg = useRef(1000 / Math.max(targetFps, 1));
  const stableFrames = useRef(0);

  const update = useCallback((dtMs: number) => {
    if (!enabledRef.current) return;

    const dt = Math.min(dtMs, DT_OUTLIER_CAP_MS);
    // Exponential moving average. The 0.92/0.08 split gives a ~12-frame
    // smoothing window, which is responsive enough to catch real slowdowns
    // without reacting to single-frame hiccups.
    frameTimeAvg.current = frameTimeAvg.current * 0.92 + dt * 0.08;
    const fps = 1000 / Math.max(frameTimeAvg.current, 1e-3);
    const target = targetFpsRef.current;
    const cap = maxDprRef.current;

    const current = Math.min(dprRef.current, cap);
    let next = current;

    if (fps < target * FPS_DROP_RATIO) {
      next = clampDpr(current - DPR_STEP);
      stableFrames.current = 0;
    } else if (fps > target * FPS_RAISE_RATIO) {
      stableFrames.current += 1;
      if (stableFrames.current > STABLE_FRAMES_NEEDED) {
        next = clampDpr(Math.min(current + DPR_STEP, cap));
        stableFrames.current = 0;
      }
    } else {
      // Inside the hysteresis band — reset the "stable" counter so a
      // momentary spike doesn't immediately qualify for an upstep.
      stableFrames.current = 0;
    }

    if (next !== current) {
      dprRef.current = next;
      setDpr(next);
    }
  }, []);

  // When disabled, the canvas should always render at maxDpr.
  const effectiveDpr = enabled ? Math.min(dpr, maxDpr) : maxDpr;
  return { dpr: effectiveDpr, update };
}

function clampDpr(value: number): number {
  // Snap to the nearest step so we don't accumulate float drift.
  const snapped = Math.round(value / DPR_STEP) * DPR_STEP;
  return Math.max(MIN_DPR, snapped);
}
