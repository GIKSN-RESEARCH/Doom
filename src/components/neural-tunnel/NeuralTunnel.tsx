/* eslint-disable react-hooks/refs, react-hooks/immutability */
"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties,
} from "react";

import { vertexShaderSource, fragmentShaderSource } from "./shaders";
import {
  createProgram,
  getUniformLocations,
  hexToLinearRGB,
  disposeGLResources,
  type UniformLocations,
} from "./gl-utils";
import "./neural-tunnel.css";

// ─── Public prop interface ────────────────────────────────────────────────

export interface NeuralTunnelProps {
  /** Number of gyroid octave layers (1–34). */
  layers?: number;
  /** How rapidly later octaves shrink. */
  falloff?: number;
  /** Softness of octave transitions. */
  blend?: number;
  /** How strongly one octave warps the next. */
  feedback?: number;
  /** Initial octave contribution strength. */
  amplitude?: number;
  /** Overall procedural scale. */
  scale?: number;
  /** Ray depth / FOV control. Lower = wider. */
  perspective?: number;
  /** Tunnel framing zoom. */
  zoom?: number;
  /** Forward animation speed multiplier. */
  speed?: number;
  /** Number of colour cycles across the depth range. */
  bands?: number;
  /** Starting phase offset of colour cycles. */
  phase?: number;
  /** Spectral separation of RGB channels (0=aligned, 1=full). */
  spread?: number;
  /** Colour gamut / saturation clip. */
  gamut?: number;
  /** Final tone-response curve exponent. */
  contrast?: number;
  /** Edge darkening strength. */
  vignette?: number;
  /** Lower-energy base colour (hex). */
  color?: string;
  /** Brightest filament colour (hex). */
  hotColor?: string;
  /** Background colour (hex or "transparent"). */
  backgroundColor?: string;
  /** Master alpha. */
  opacity?: number;
  /** Enable pointer steering. */
  cursorInteraction?: boolean;
  /** Pointer interaction strength (0–1). */
  cursorShift?: number;
  /** Freeze time progression. */
  paused?: boolean;
  /** Auto-scale resolution when FPS drops. */
  adaptiveQuality?: boolean;
  /** Desired frame rate for adaptive quality. */
  targetFps?: number;
  /** Maximum device pixel ratio. */
  dpr?: number;
  /** Whether the panel is currently active/expanded. When false, shader execution is throttled to conserve GPU. */
  active?: boolean;
  /** Additional CSS class on the wrapper. */
  className?: string;
  /** Children rendered above the effect. */
  children?: React.ReactNode;
}

// ─── Defaults ─────────────────────────────────────────────────────────────

const DEFAULTS = {
  layers: 4,
  falloff: 1.25,
  blend: 1.5,
  feedback: 0.6,
  amplitude: 0.5,
  scale: 1,
  perspective: 0.1,
  zoom: 1,
  speed: 1,
  bands: 20,
  phase: 3.5,
  spread: 0,
  gamut: 1,
  contrast: 1.85,
  vignette: 0.3,
  color: "#160a24",
  hotColor: "#e879f9",
  backgroundColor: "#0a0a0a",
  opacity: 1,
  cursorInteraction: true,
  cursorShift: 0.25,
  paused: false,
  adaptiveQuality: true,
  targetFps: 60,
  dpr: 1.0,
  active: true,
} as const;

// ─── Uniform name list ────────────────────────────────────────────────────

const UNIFORM_NAMES = [
  "uResolution",
  "uTime",
  "uCursor",
  "uCursorShift",
  "uLayers",
  "uFalloff",
  "uBlend",
  "uFeedback",
  "uAmplitude",
  "uScale",
  "uPerspective",
  "uZoom",
  "uSpeed",
  "uBands",
  "uPhase",
  "uSpread",
  "uGamut",
  "uContrast",
  "uVignette",
  "uColor",
  "uHotColor",
  "uBgColor",
  "uOpacity",
  "uBgAlpha",
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function clampInt(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

function clampFloat(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function isTransparent(bg: string): boolean {
  return bg.toLowerCase() === "transparent";
}

// ─── Component ────────────────────────────────────────────────────────────

export const NeuralTunnel: React.FC<NeuralTunnelProps> = (props) => {
  // Merge with defaults
  const layers = clampInt(props.layers ?? DEFAULTS.layers, 1, 34);
  const falloff = Math.max(0.01, props.falloff ?? DEFAULTS.falloff);
  const blend = Math.max(0, props.blend ?? DEFAULTS.blend);
  const feedback = clampFloat(props.feedback ?? DEFAULTS.feedback, 0, 2);
  const amplitude = Math.max(0.01, props.amplitude ?? DEFAULTS.amplitude);
  const scale = Math.max(0.01, props.scale ?? DEFAULTS.scale);
  const perspective = clampFloat(props.perspective ?? DEFAULTS.perspective, 0, 1);
  const zoom = Math.max(0.1, props.zoom ?? DEFAULTS.zoom);
  const speed = props.speed ?? DEFAULTS.speed;
  const bands = Math.max(1, props.bands ?? DEFAULTS.bands);
  const phase = props.phase ?? DEFAULTS.phase;
  const spread = clampFloat(props.spread ?? DEFAULTS.spread, 0, 1);
  const gamut = Math.max(0.01, props.gamut ?? DEFAULTS.gamut);
  const contrast = Math.max(0.1, props.contrast ?? DEFAULTS.contrast);
  const vignette = clampFloat(props.vignette ?? DEFAULTS.vignette, 0, 1);
  const color = props.color ?? DEFAULTS.color;
  const hotColor = props.hotColor ?? DEFAULTS.hotColor;
  const backgroundColor = props.backgroundColor ?? DEFAULTS.backgroundColor;
  const opacity = clampFloat(props.opacity ?? DEFAULTS.opacity, 0, 1);
  const cursorInteraction = props.cursorInteraction ?? DEFAULTS.cursorInteraction;
  const cursorShift = clampFloat(props.cursorShift ?? DEFAULTS.cursorShift, 0, 2);
  const paused = props.paused ?? DEFAULTS.paused;
  const adaptiveQuality = props.adaptiveQuality ?? DEFAULTS.adaptiveQuality;
  const targetFps = Math.max(10, props.targetFps ?? DEFAULTS.targetFps);
  const dpr = Math.max(0.25, props.dpr ?? DEFAULTS.dpr);
  const active = props.active ?? DEFAULTS.active;
  const className = props.className;
  const children = props.children;

  // ── Refs ─────────────────────────────────────────────────────────────
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
  const uniformsRef = useRef<UniformLocations>({});
  const rafRef = useRef<number>(0);

  // Animation time (accumulated, frame-independent)
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const pausedRef = useRef(paused);

  // Pointer state (mutated in event handlers, read in render loop — no React state)
  const pointerRef = useRef({ x: 0, y: 0 });
  const smoothPointerRef = useRef({ x: 0, y: 0 });
  const pointerActiveRef = useRef(false);

  // Visibility
  const isVisibleRef = useRef(true);
  const docVisibleRef = useRef(true);

  // Context lost state
  const contextLostRef = useRef(false);

  // Adaptive quality state
  const renderScaleRef = useRef(1.0);
  const frameTimesRef = useRef<number[]>([]);
  const qualityCooldownRef = useRef(0);

  // Reduced motion
  const reducedMotionRef = useRef(false);

  // Dirty flag for re-render while paused
  const dirtyRef = useRef(false);

  // ── Prop refs (avoid closures over stale values) ─────────────────────
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
    adaptiveQuality,
    targetFps,
    dpr,
    active,
  });

  // Update prop ref on every render
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
    adaptiveQuality,
    targetFps,
    dpr,
    active,
  };

  // Track paused state in ref
  useEffect(() => {
    const wasPaused = pausedRef.current;
    pausedRef.current = paused;
    if (wasPaused && !paused) {
      // Resuming: reset lastFrame so we don't get a huge dt
      lastFrameRef.current = performance.now();
    }
    if (!wasPaused && paused) {
      // Just paused; nothing special needed
    }
    // If any visual prop changed while paused, mark dirty
    if (paused) {
      dirtyRef.current = true;
    }
  });

  // ── Reduced motion check ─────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Resize handler (called ONLY on container resize, NEVER in rAF) ──
  const handleResize = useCallback((w?: number, h?: number) => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl || contextLostRef.current) return;

    const p = propsRef.current;
    const cssW = w !== undefined ? w : (canvas.clientWidth || 320);
    const cssH = h !== undefined ? h : (canvas.clientHeight || 460);
    if (cssW === 0 || cssH === 0) return;

    const effectiveDpr = Math.min(window.devicePixelRatio || 1, p.dpr);
    const adScale = p.adaptiveQuality ? renderScaleRef.current : 1.0;
    const pixelW = Math.max(1, Math.round(cssW * effectiveDpr * adScale));
    const pixelH = Math.max(1, Math.round(cssH * effectiveDpr * adScale));

    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
      gl.viewport(0, 0, pixelW, pixelH);
    }
  }, []);

  // ── Upload uniforms (called every frame) ────────────────────────────
  const uploadUniforms = useCallback(
    (gl: WebGL2RenderingContext, locs: UniformLocations) => {
      const p = propsRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Resolution
      gl.uniform2f(locs.uResolution!, canvas.width, canvas.height);

      // Time
      gl.uniform1f(locs.uTime!, timeRef.current);

      // Cursor
      gl.uniform2f(
        locs.uCursor!,
        smoothPointerRef.current.x,
        smoothPointerRef.current.y
      );
      gl.uniform1f(
        locs.uCursorShift!,
        p.cursorInteraction ? p.cursorShift : 0
      );

      // Structural
      gl.uniform1i(locs.uLayers!, p.layers);
      gl.uniform1f(locs.uFalloff!, p.falloff);
      gl.uniform1f(locs.uBlend!, p.blend);
      gl.uniform1f(locs.uFeedback!, p.feedback);
      gl.uniform1f(locs.uAmplitude!, p.amplitude);
      gl.uniform1f(locs.uScale!, p.scale);
      gl.uniform1f(locs.uPerspective!, p.perspective);
      gl.uniform1f(locs.uZoom!, p.zoom);
      gl.uniform1f(locs.uSpeed!, p.speed);

      // Colour
      gl.uniform1f(locs.uBands!, p.bands);
      gl.uniform1f(locs.uPhase!, p.phase);
      gl.uniform1f(locs.uSpread!, p.spread);
      gl.uniform1f(locs.uGamut!, p.gamut);
      gl.uniform1f(locs.uContrast!, p.contrast);
      gl.uniform1f(locs.uVignette!, p.vignette);

      const [cr, cg, cb] = hexToLinearRGB(p.color);
      gl.uniform3f(locs.uColor!, cr, cg, cb);

      const [hr, hg, hb] = hexToLinearRGB(p.hotColor);
      gl.uniform3f(locs.uHotColor!, hr, hg, hb);

      const transparent = isTransparent(p.backgroundColor);
      if (transparent) {
        gl.uniform3f(locs.uBgColor!, 0, 0, 0);
        gl.uniform1f(locs.uBgAlpha!, 0);
      } else {
        const [br, bg, bb] = hexToLinearRGB(p.backgroundColor);
        gl.uniform3f(locs.uBgColor!, br, bg, bb);
        gl.uniform1f(locs.uBgAlpha!, 1);
      }

      gl.uniform1f(locs.uOpacity!, p.opacity);
    },
    []
  );

  // ── Adaptive quality ────────────────────────────────────────────────
  const updateAdaptiveQuality = useCallback((dt: number) => {
    const p = propsRef.current;
    if (!p.adaptiveQuality) {
      renderScaleRef.current = 1.0;
      return;
    }

    const frameTimes = frameTimesRef.current;
    frameTimes.push(dt);
    if (frameTimes.length > 60) frameTimes.shift();

    // Cooldown between quality changes
    qualityCooldownRef.current = Math.max(0, qualityCooldownRef.current - dt);
    if (qualityCooldownRef.current > 0) return;

    if (frameTimes.length < 20) return;

    const avgDt =
      frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const avgFps = 1000 / avgDt;
    const target = p.targetFps;
    const current = renderScaleRef.current;

    if (avgFps < target * 0.85 && current > 0.4) {
      // Reduce resolution gradually
      renderScaleRef.current = Math.max(0.4, current - 0.05);
      qualityCooldownRef.current = 500;
      handleResize();
    } else if (avgFps > target * 1.1 && current < 1.0) {
      // Restore resolution gradually
      renderScaleRef.current = Math.min(1.0, current + 0.025);
      qualityCooldownRef.current = 1000;
      handleResize();
    }
  }, [handleResize]);

  // ── Render loop ─────────────────────────────────────────────────────
  const renderFrame = useCallback(
    (now: number) => {
      const gl = glRef.current;
      const program = programRef.current;
      const vao = vaoRef.current;
      const locs = uniformsRef.current;

      if (!gl || !program || !vao || contextLostRef.current) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // Skip rendering and pause rAF loop when offscreen
      if (!isVisibleRef.current || !docVisibleRef.current) {
        return;
      }

      const p = propsRef.current;

      // Delta time with clamp (prevent jump after tab suspension)
      const rawDt = lastFrameRef.current > 0 ? now - lastFrameRef.current : 16.67;
      const dt = Math.min(rawDt, 100); // max ~6fps equivalent
      lastFrameRef.current = now;

      // Update time (unless paused or reduced motion)
      const isPaused = pausedRef.current;
      if (!isPaused) {
        const speedMult = reducedMotionRef.current ? 0.05 : 1.0;
        timeRef.current += (dt / 1000) * speedMult;
      }

      // Smooth pointer (time-based damping)
      const dampFactor = 1 - Math.pow(0.001, dt / 1000);
      if (p.cursorInteraction && pointerActiveRef.current) {
        smoothPointerRef.current.x +=
          (pointerRef.current.x - smoothPointerRef.current.x) * dampFactor;
        smoothPointerRef.current.y +=
          (pointerRef.current.y - smoothPointerRef.current.y) * dampFactor;
      } else {
        // Return to center
        smoothPointerRef.current.x += (0 - smoothPointerRef.current.x) * dampFactor * 0.5;
        smoothPointerRef.current.y += (0 - smoothPointerRef.current.y) * dampFactor * 0.5;
      }

      // If paused and not dirty, skip draw
      if (isPaused && !dirtyRef.current) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }
      dirtyRef.current = false;

      // Adaptive quality
      if (!isPaused) {
        updateAdaptiveQuality(rawDt);
      }

      // Set up GL state
      const transparent = isTransparent(p.backgroundColor);
      if (transparent) {
        gl.clearColor(0, 0, 0, 0);
      } else {
        const [br, bg, bb] = hexToLinearRGB(p.backgroundColor);
        // Convert linear to sRGB for clear colour
        gl.clearColor(
          Math.pow(br, 1 / 2.2),
          Math.pow(bg, 1 / 2.2),
          Math.pow(bb, 1 / 2.2),
          1
        );
      }
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Enable blending for transparent mode
      if (transparent) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.disable(gl.BLEND);
      }

      gl.useProgram(program);
      uploadUniforms(gl, locs);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);

      rafRef.current = requestAnimationFrame(renderFrame);
    },
    [uploadUniforms, updateAdaptiveQuality]
  );

  // ── WebGL initialisation ────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL2
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
      });
    } catch {
      // WebGL2 unavailable
    }

    if (!gl) {
      if (process.env.NODE_ENV === "development") {
        console.warn("NeuralTunnel: WebGL2 is not available.");
      }
      return;
    }

    glRef.current = gl;

    // Compile shaders and create program
    let program: WebGLProgram;
    try {
      program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("NeuralTunnel: Shader compilation failed:", e);
      }
      return;
    }
    programRef.current = program;

    // Create empty VAO (fullscreen triangle uses gl_VertexID)
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindVertexArray(null);
    vaoRef.current = vao;

    // Cache uniform locations
    uniformsRef.current = getUniformLocations(gl, program, UNIFORM_NAMES);

    // Initial resize
    handleResize();

    // Start render loop
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(renderFrame);

    // Context lost / restored handlers
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      contextLostRef.current = true;
      cancelAnimationFrame(rafRef.current);
    };

    const handleContextRestored = () => {
      contextLostRef.current = false;
      // Re-initialise
      try {
        const newProgram = createProgram(
          gl!,
          vertexShaderSource,
          fragmentShaderSource
        );
        programRef.current = newProgram;
        const newVao = gl!.createVertexArray();
        gl!.bindVertexArray(newVao);
        gl!.bindVertexArray(null);
        vaoRef.current = newVao;
        uniformsRef.current = getUniformLocations(
          gl!,
          newProgram,
          UNIFORM_NAMES
        );
        handleResize();
        lastFrameRef.current = performance.now();
        rafRef.current = requestAnimationFrame(renderFrame);
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error("NeuralTunnel: Context restore failed:", e);
        }
      }
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      disposeGLResources(gl, programRef.current, vaoRef.current);
      glRef.current = null;
      programRef.current = null;
      vaoRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── ResizeObserver ──────────────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        handleResize(width, height);
      } else {
        handleResize();
      }
      dirtyRef.current = true;
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [handleResize]);

  // ── IntersectionObserver (viewport visibility) ──────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const io = new IntersectionObserver(
      (entries) => {
        const isNowVisible = entries[0]?.isIntersecting ?? true;
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = isNowVisible;
        if (!wasVisible && isNowVisible && docVisibleRef.current) {
          lastFrameRef.current = performance.now();
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(renderFrame);
        }
      },
      { threshold: 0 }
    );
    io.observe(wrapper);
    return () => io.disconnect();
  }, [renderFrame]);

  // ── Document visibility ─────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      const isDocVisible = document.visibilityState === "visible";
      docVisibleRef.current = isDocVisible;
      if (isDocVisible && isVisibleRef.current) {
        lastFrameRef.current = performance.now();
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(renderFrame);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [renderFrame]);

  // ── Pointer events ─────────────────────────────────────────────────
  useEffect(() => {
    if (!cursorInteraction) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      // Normalise to [-1, 1]
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerActiveRef.current = true;
    };

    const handlePointerLeave = () => {
      pointerActiveRef.current = false;
    };

    // Use passive so we never block scrolling
    wrapper.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    wrapper.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });

    return () => {
      wrapper.removeEventListener("pointermove", handlePointerMove);
      wrapper.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [cursorInteraction]);

  // ── Mark dirty when visual props change (for paused re-render) ─────
  useEffect(() => {
    dirtyRef.current = true;
  }, [
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
    cursorShift,
  ]);

  const childStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      zIndex: 1,
      width: "100%",
      height: "100%",
    }),
    []
  );

  // ── Fallback background ─────────────────────────────────────────────
  const fallbackBg = useMemo(() => {
    if (isTransparent(backgroundColor)) return "transparent";
    return backgroundColor;
  }, [backgroundColor]);

  const wrapperClassName = className
    ? `neural-tunnel ${className}`
    : "neural-tunnel";

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{ backgroundColor: fallbackBg }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {children && <div style={childStyle}>{children}</div>}
    </div>
  );
};

NeuralTunnel.displayName = "NeuralTunnel";

export default NeuralTunnel;
