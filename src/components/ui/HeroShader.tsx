"use client";

import React, { useEffect, useRef, useState } from "react";

interface HeroShaderProps {
  className?: string;
  isHovered?: boolean;
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mouse_active;
uniform float u_aspect;

// Simplex-based 2D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(cos(0.54), sin(0.54), -sin(0.54), cos(0.54));
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p = rot * p * 2.04 + vec2(1.7, 9.2);
    a *= 0.48;
  }
  return v;
}

// Doom Studio Animation Palette — core wine-maroon #4B1426
// Deep base: #150509 -> vec3(0.082, 0.020, 0.035)
// Dark burgundy: #2A0C15 -> vec3(0.165, 0.047, 0.082)
// Deep wine: #3A1020 -> vec3(0.227, 0.063, 0.125)
// Core wine-maroon: #4B1426 -> vec3(0.294, 0.078, 0.149)
// Mulled wine: #6E2740 -> vec3(0.431, 0.153, 0.251)
// Rose wine: #96455F -> vec3(0.588, 0.271, 0.373)
// Soft rose highlight: #C47E93 -> vec3(0.769, 0.494, 0.576)

vec3 palette(float t) {
  vec3 c0 = vec3(0.082, 0.020, 0.035); // #150509
  vec3 c1 = vec3(0.165, 0.047, 0.082); // #2A0C15
  vec3 c2 = vec3(0.227, 0.063, 0.125); // #3A1020
  vec3 c3 = vec3(0.294, 0.078, 0.149); // #4B1426
  vec3 c4 = vec3(0.431, 0.153, 0.251); // #6E2740
  vec3 c5 = vec3(0.588, 0.271, 0.373); // #96455F
  vec3 c6 = vec3(0.769, 0.494, 0.576); // #C47E93

  t = clamp(t, 0.0, 1.0);

  if (t < 0.16) {
    return mix(c0, c1, t / 0.16);
  } else if (t < 0.36) {
    return mix(c1, c2, (t - 0.16) / 0.20);
  } else if (t < 0.56) {
    return mix(c2, c3, (t - 0.36) / 0.20);
  } else if (t < 0.74) {
    return mix(c3, c4, (t - 0.56) / 0.18);
  } else if (t < 0.88) {
    return mix(c4, c5, (t - 0.74) / 0.14);
  } else {
    return mix(c5, c6, (t - 0.88) / 0.12);
  }
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  // Aspect-ratio-corrected UV coordinates
  vec2 p = uv;
  p.x *= u_aspect;

  vec2 m = u_mouse;
  m.x *= u_aspect;

  // Broad, soft Gaussian cursor interaction
  float distToMouse = length(p - m);
  float mouseInfluence = exp(-distToMouse * distToMouse * 3.2);
  vec2 mouseDisp = normalize(p - m + vec2(0.0001)) * mouseInfluence * 0.12 * u_mouse_active;

  // Slow atmospheric drift (~16 second full cycle)
  float t = u_time * 0.055;

  vec2 coord = p * 1.3 + mouseDisp;

  // Domain warping
  vec2 q = vec2(
    fbm(coord + vec2(0.0, t * 0.28)),
    fbm(coord + vec2(5.2, 1.3 - t * 0.22))
  );

  vec2 r = vec2(
    fbm(coord + 1.35 * q + vec2(1.7, 9.2 + t * 0.35)),
    fbm(coord + 1.15 * q + vec2(8.3, 2.8 - t * 0.28))
  );

  float f = fbm(coord + 1.75 * r);

  // Field composition
  float baseGradient = 0.5 + 0.5 * sin(uv.x * 2.1 + uv.y * 1.7 + t * 0.4);
  float val = (f + 0.5) * 0.58 + baseGradient * 0.32;

  // Balanced vignette for deep corners and luminous central-upper region
  float vignette = smoothstep(1.35, 0.15, length(uv - vec2(0.62, 0.48)));
  val = clamp(val * (0.62 + 0.48 * vignette), 0.0, 1.0);

  vec3 color = palette(val);

  // Subtle dither to prevent 8-bit banding on smooth gradients
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * (1.0 / 255.0);
  color += dither;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

export default function HeroShader({ className = "" }: HeroShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
    };
    motionQuery.addEventListener("change", handleMotionChange);

    // Initialize WebGL context
    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
      }) || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    // Compile shader helper
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vertShader || !fragShader) {
      setHasWebGL(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setHasWebGL(false);
      return;
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setHasWebGL(false);
      return;
    }

    gl.useProgram(program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uMouseActiveLoc = gl.getUniformLocation(program, "u_mouse_active");
    const uAspectLoc = gl.getUniformLocation(program, "u_aspect");

    // Pointer state tracking
    const mouse = {
      targetX: 0.55,
      targetY: 0.5,
      currentX: 0.55,
      currentY: 0.5,
      targetActive: 0.0,
      currentActive: 0.0,
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const x = (clientX - rect.left) / rect.width;
        const y = 1.0 - (clientY - rect.top) / rect.height; // Invert for WebGL UV coords
        mouse.targetX = Math.max(0, Math.min(1, x));
        mouse.targetY = Math.max(0, Math.min(1, y));
        mouse.targetActive = 1.0;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isReducedMotion) return;
      updatePointer(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      mouse.targetActive = 0.0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isReducedMotion || e.touches.length === 0) return;
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      mouse.targetActive = 0.0;
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Handle canvas resizing
    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const displayWidth = Math.round(width * dpr);
      const displayHeight = Math.round(height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);
    resize();

    // Intersection observer to pause rendering when offscreen
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse interpolation (lerp)
      const lerpSpeed = isReducedMotion ? 0.01 : 0.06;
      mouse.currentX += (mouse.targetX - mouse.currentX) * lerpSpeed;
      mouse.currentY += (mouse.targetY - mouse.currentY) * lerpSpeed;
      mouse.currentActive += (mouse.targetActive - mouse.currentActive) * 0.04;

      const effectiveTime = isReducedMotion ? 1.0 : elapsed;
      const aspect = width > 0 && height > 0 ? width / height : 1.0;

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, effectiveTime);
      gl.uniform2f(uMouseLoc, mouse.currentX, mouse.currentY);
      gl.uniform1f(uMouseActiveLoc, isReducedMotion ? 0.0 : mouse.currentActive);
      gl.uniform1f(uAspectLoc, aspect);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      motionQuery.removeEventListener("change", handleMotionChange);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
          style={{ imageRendering: "auto" }}
          aria-hidden="true"
        />
      ) : (
        /* CSS Gradient Fallback */
        <div
          className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_70%_40%,#C47E93_0%,#6E2740_30%,#3A1020_55%,#2A0C15_80%,#150509_100%)]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}