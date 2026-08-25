/* eslint-disable react-hooks/refs */
"use client";

import React, { useEffect, useRef } from "react";
import { fragmentShaderSource, vertexShaderSource } from "./shader2";
import { useAdaptiveQuality } from "./useAdaptiveQuality";

export interface NeuralTunnelProps {
  /** Octave count. 1–34, default 24. (Loop bound is a compile-time constant in GLSL.) */
  layers?: number;
  /** Per-octave domain & amplitude shrink. Above 1, default 1.25. */
  falloff?: number;
  /** smin softness. Default 1.5. */
  blend?: number;
  /** Domain warp strength. Default 0.6. */
  feedback?: number;
  /** First octave scale. Default 0.5. */
  amplitude?: number;
  /** Overall structure size. Default 1. */
  scale?: number;
  /** Ray depth component (inverse FOV). Lower = wider. Default 0.1. */
  perspective?: number;
  /** Tunnel mouth framing. Default 1. */
  zoom?: number;
  /** Forward travel speed. Default 1. */
  speed?: number;
  /** Color cycle frequency across depth. Default 20. */
  bands?: number;
  /** Palette phase offset. Default 3.5. */
  phase?: number;
  /** Per-channel hue separation (0 = monochrome, 1 = full rainbow). Default 0. */
  spread?: number;
  /** Palette amplitude before clamp. Default 1. */
  gamut?: number;
  /** Tone curve exponent. Above 1 deepens shadows. Default 1.85. */
  contrast?: number;
  /** Corner falloff strength. Default 0.3. */
  vignette?: number;
  /** Base tone. Default "#160a24". */
  color?: string;
  /** Bright filament color. Default "#e879f9". */
  hotColor?: string;
  /** Panel backdrop. Default "#0a0a0a". Pass "transparent" to composite over the page. */
  backgroundColor?: string;
  /** Master alpha. Default 1. */
  opacity?: number;
  /** Attach pointer listeners and steer the ray. Default true. */
  cursorInteraction?: boolean;
  /** How strongly the pointer steers rd. Default 0.25. */
  cursorShift?: number;
  /** Freeze motion (canvas still redraws on resize). Default false. */
  paused?: boolean;
  /** Adaptive backing-store resolution. Default true. */
  adaptiveQuality?: boolean;
  /** Target FPS for adaptive stepping. Default 60. */
  targetFps?: number;
  /** Max device pixel ratio. Default 1.5. */
  dpr?: number;
  /** className applied to the container. */
  className?: string;
  /** Overlay content rendered above the canvas. */
  children?: React.ReactNode;
}

interface Vec2 {
  x: number;
  y: number;
}

// Must stay in sync with the shader's PERIOD constant (1000 * 2π, in ms).
const TIME_WRAP_MS = 6283.18530718 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Color parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseColor(hex: string): [number, number, number] {
  if (hex === "transparent") return [0, 0, 0];
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    // Fallback rather than NaN the uniform.
    return [0, 0, 0];
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

// ─────────────────────────────────────────────────────────────────────────────
// WebGL helpers
// ─────────────────────────────────────────────────────────────────────────────

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("gl.createShader returned null");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${info ?? "unknown"}`);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vs: string,
  fs: string,
): WebGLProgram {
  const v = compileShader(gl, gl.VERTEX_SHADER, vs);
  const f = compileShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram();
  if (!program) throw new Error("gl.createProgram returned null");
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${info ?? "unknown"}`);
  }
  return program;
}

interface Uniforms {
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  mouseSmoothed: WebGLUniformLocation | null;
  cursorInteraction: WebGLUniformLocation | null;
  cursorShift: WebGLUniformLocation | null;
  layers: WebGLUniformLocation | null;
  falloff: WebGLUniformLocation | null;
  blend: WebGLUniformLocation | null;
  feedback: WebGLUniformLocation | null;
  amplitude: WebGLUniformLocation | null;
  scale: WebGLUniformLocation | null;
  perspective: WebGLUniformLocation | null;
  zoom: WebGLUniformLocation | null;
  speed: WebGLUniformLocation | null;
  bands: WebGLUniformLocation | null;
  phase: WebGLUniformLocation | null;
  spread: WebGLUniformLocation | null;
  gamut: WebGLUniformLocation | null;
  contrast: WebGLUniformLocation | null;
  vignette: WebGLUniformLocation | null;
  color: WebGLUniformLocation | null;
  hotColor: WebGLUniformLocation | null;
  backgroundColor: WebGLUniformLocation | null;
  opacity: WebGLUniformLocation | null;
  transparent: WebGLUniformLocation | null;
}

function collectUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): Uniforms {
  return {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    time: gl.getUniformLocation(program, "u_time"),
    mouseSmoothed: gl.getUniformLocation(program, "u_mouseSmoothed"),
    cursorInteraction: gl.getUniformLocation(program, "u_cursorInteraction"),
    cursorShift: gl.getUniformLocation(program, "u_cursorShift"),
    layers: gl.getUniformLocation(program, "u_layers"),
    falloff: gl.getUniformLocation(program, "u_falloff"),
    blend: gl.getUniformLocation(program, "u_blend"),
    feedback: gl.getUniformLocation(program, "u_feedback"),
    amplitude: gl.getUniformLocation(program, "u_amplitude"),
    scale: gl.getUniformLocation(program, "u_scale"),
    perspective: gl.getUniformLocation(program, "u_perspective"),
    zoom: gl.getUniformLocation(program, "u_zoom"),
    speed: gl.getUniformLocation(program, "u_speed"),
    bands: gl.getUniformLocation(program, "u_bands"),
    phase: gl.getUniformLocation(program, "u_phase"),
    spread: gl.getUniformLocation(program, "u_spread"),
    gamut: gl.getUniformLocation(program, "u_gamut"),
    contrast: gl.getUniformLocation(program, "u_contrast"),
    vignette: gl.getUniformLocation(program, "u_vignette"),
    color: gl.getUniformLocation(program, "u_color"),
    hotColor: gl.getUniformLocation(program, "u_hotColor"),
    backgroundColor: gl.getUniformLocation(program, "u_backgroundColor"),
    opacity: gl.getUniformLocation(program, "u_opacity"),
    transparent: gl.getUniformLocation(program, "u_transparent"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const NeuralTunnel: React.FC<NeuralTunnelProps> = ({
  layers = 24,
  falloff = 1.25,
  blend = 1.5,
  feedback = 0.6,
  amplitude = 0.5,
  scale = 1,
  perspective = 0.1,
  zoom = 1,
  speed = 1,
  bands = 20,
  phase = 3.5,
  spread = 0,
  gamut = 1,
  contrast = 1.85,
  vignette = 0.3,
  color = "#160a24",
  hotColor = "#e879f9",
  backgroundColor = "#0a0a0a",
  opacity = 1,
  cursorInteraction = true,
  cursorShift = 0.25,
  paused = false,
  adaptiveQuality = true,
  targetFps = 60,
  dpr = 1.5,
  className,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mirror every prop into a ref so the render loop closure can read the
  // latest values without being rebuilt on every render. The rAF loop is
  // created once on mount and reads from these refs.
  const propsRef = useRef({
    layers,
    falloff,
    blend,
    feedback,
    amplitude,
    scale,
    perspective,
    zoom,
    speed,
    bands,
    phase,
    spread,
    gamut,
    contrast,
    vignette,
    color,
    hotColor,
    backgroundColor,
    opacity,
    cursorInteraction,
    cursorShift,
    paused,
  });
  propsRef.current = {
    layers,
    falloff,
    blend,
    feedback,
    amplitude,
    scale,
    perspective,
    zoom,
    speed,
    bands,
    phase,
    spread,
    gamut,
    contrast,
    vignette,
    color,
    hotColor,
    backgroundColor,
    opacity,
    cursorInteraction,
    cursorShift,
    paused,
  };

  const { dpr: effectiveDpr, update: updateAdaptive } = useAdaptiveQuality({
    enabled: adaptiveQuality,
    targetFps,
    maxDpr: dpr,
  });
  const effectiveDprRef = useRef(effectiveDpr);
  effectiveDprRef.current = effectiveDpr;

  // Pointer state lives in refs — pointer moves should never trigger re-renders.
  const mouseTarget = useRef<Vec2>({ x: 0, y: 0 });
  const mouseSmoothed = useRef<Vec2>({ x: 0, y: 0 });

  // Time accumulator in ms, wrapped to TIME_WRAP_MS to keep float32 healthy.
  const timeRef = useRef(0);

  // ─── WebGL setup + render loop ────────────────────────────────────────────
  // Runs once. `updateAdaptive` is a stable useCallback (empty deps) so the
  // effect doesn't re-run on every render.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      if (typeof console !== "undefined") {
        console.error("[NeuralTunnel] WebGL2 is not available in this browser.");
      }
      return;
    }

    let program: WebGLProgram;
    try {
      program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    } catch (err) {
      console.error(err);
      return;
    }
    gl.useProgram(program);

    const u = collectUniforms(gl, program);

    // Empty VAO — we draw a fullscreen triangle via gl_VertexID with no
    // vertex attributes, but WebGL2 still wants a bound VAO.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // ── Resize: syncs CSS size (always full container) with the backing
    //    store size (container * effectiveDpr). Called every frame so dpr
    //    changes from adaptive quality are picked up immediately.
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const d = effectiveDprRef.current;
      const w = Math.max(1, Math.floor(rect.width * d));
      const h = Math.max(1, Math.floor(rect.height * d));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    // ── Render loop
    let rafId = 0;
    let last = performance.now();
    let firstFrame = true;

    const frame = (now: number) => {
      const p = propsRef.current;

      let dt = now - last;
      last = now;
      // Tab was hidden or system was asleep — clamp so we don't explode the
      // time accumulator or the fps EMA.
      if (dt > 200) dt = 1000 / 60;

      if (!p.paused) {
        timeRef.current = (timeRef.current + dt) % TIME_WRAP_MS;
      }

      // Smooth the mouse target. Fixed lerp factor (per spec) — frame-rate
      // dependent, but the effect is "subtle steering" so it reads fine.
      const ms = mouseSmoothed.current;
      const mt = mouseTarget.current;
      ms.x += (mt.x - ms.x) * 0.08;
      ms.y += (mt.y - ms.y) * 0.08;

      // Adaptive quality: skip the very first frame so the EMA has a real
      // baseline before we start judging fps.
      if (!firstFrame) updateAdaptive(dt);
      firstFrame = false;

      // Pick up any dpr change from the adaptive hook.
      resize();

      // ── Upload uniforms
      gl.useProgram(program);
      gl.uniform2f(u.resolution, canvas.width, canvas.height);
      gl.uniform1f(u.time, timeRef.current / 1000);
      gl.uniform2f(u.mouseSmoothed, ms.x, ms.y);
      gl.uniform1i(u.cursorInteraction, p.cursorInteraction ? 1 : 0);
      gl.uniform1f(u.cursorShift, p.cursorShift);

      gl.uniform1i(u.layers, Math.max(1, Math.min(34, p.layers | 0)));
      gl.uniform1f(u.falloff, p.falloff);
      gl.uniform1f(u.blend, p.blend);
      gl.uniform1f(u.feedback, p.feedback);
      gl.uniform1f(u.amplitude, p.amplitude);
      gl.uniform1f(u.scale, p.scale);

      gl.uniform1f(u.perspective, p.perspective);
      gl.uniform1f(u.zoom, p.zoom);
      gl.uniform1f(u.speed, p.speed);

      gl.uniform1f(u.bands, p.bands);
      gl.uniform1f(u.phase, p.phase);
      gl.uniform1f(u.spread, p.spread);
      gl.uniform1f(u.gamut, p.gamut);
      gl.uniform1f(u.contrast, p.contrast);
      gl.uniform1f(u.vignette, p.vignette);

      const [cr, cg, cb] = parseColor(p.color);
      gl.uniform3f(u.color, cr, cg, cb);
      const [hr, hg, hb] = parseColor(p.hotColor);
      gl.uniform3f(u.hotColor, hr, hg, hb);

      const isTransparent = p.backgroundColor === "transparent";
      if (isTransparent) {
        gl.uniform3f(u.backgroundColor, 0, 0, 0);
        gl.uniform1f(u.transparent, 1);
      } else {
        const [br, bg, bb] = parseColor(p.backgroundColor);
        gl.uniform3f(u.backgroundColor, br, bg, bb);
        gl.uniform1f(u.transparent, 0);
      }
      gl.uniform1f(u.opacity, p.opacity);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
    };
  }, [updateAdaptive]);

  // ─── Pointer listeners — gated entirely by cursorInteraction ──────────────
  // When the prop is false, no listeners are attached, so it costs nothing.
  useEffect(() => {
    if (!cursorInteraction) {
      // Reset target so the smoothed value drifts back to center if the
      // prop is toggled off mid-session.
      mouseTarget.current.x = 0;
      mouseTarget.current.y = 0;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const update = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      // Normalized to [-1, 1] on both axes, y flipped so "up" on screen
      // maps to +y in clip space (matches gl_FragCoord orientation).
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      mouseTarget.current.x = x;
      mouseTarget.current.y = y;
    };

    const onPointerMove = (e: PointerEvent) => update(e.clientX, e.clientY);
    const onPointerLeave = () => {
      mouseTarget.current.x = 0;
      mouseTarget.current.y = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerLeave);
    };
  }, [cursorInteraction]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        // If the user passes no className, default to filling the parent.
        // If they pass one (e.g. "fixed inset-0"), their className wins
        // for layout but we still need position:relative for the canvas
        // and children to stack correctly.
        ...(className ? {} : { width: "100%", height: "100%" }),
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          // The canvas itself must not capture pointer events; children
          // above it should be the ones receiving clicks.
          pointerEvents: "none",
        }}
      />
      {children != null && (
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      )}
    </div>
  );
};

export default NeuralTunnel;
