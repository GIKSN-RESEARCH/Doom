"use client";

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import './DesignCompositionField.css';

/* ---------------------------------------------------------------------------
   DesignCompositionField — living parametric composition for the Design card.

   Same rendering family as PrismaticBurst: OGL fullscreen fragment shader,
   additive luminous energy, gradient-texture colour flow, layered film grain,
   quintic edge dissolve, smoothed pointer physics, mix-blend lighten.

   Content: drifting cubic Bézier paths rendered as SDFs, anchor diamonds,
   control handles, open composition frames, translucent planes and a faint
   modular grid. One accent path acts as the focal point and samples the
   palette gradient along its length, echoing PB's spectral flow.
--------------------------------------------------------------------------- */

const vertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform float uActive;       // 0 collapsed .. 1 expanded (smoothed on CPU)
uniform vec2  uMouse;        // smoothed 0..1
uniform float uInteractive;
uniform int   uCurveCount;   // 5..7
uniform vec3  uBg;
uniform vec3  uAccent;
uniform vec3  uInk;
uniform vec3  uDeep;
uniform sampler2D uGradient;
uniform int   uColorCount;

const float CYCLE = 16.0;
const float TAU = 6.283185307179586;
const int   NODES = 12;
const int   MAX_CURVES = 7;

/* Asymmetric editorial layout, uv space, y-up */
const vec2 REST[NODES] = vec2[NODES](
    vec2(0.08, 0.18), vec2(0.22, 0.34), vec2(0.36, 0.62), vec2(0.52, 0.80),
    vec2(0.68, 0.30), vec2(0.78, 0.55), vec2(0.90, 0.74), vec2(0.46, 0.40),
    vec2(0.62, 0.14), vec2(0.14, 0.62), vec2(0.30, 0.86), vec2(0.86, 0.16)
);

/* Snapped lattice the field eases toward during alignment moments */
const vec2 ALIGNED[NODES] = vec2[NODES](
    vec2(0.125000, 0.166667), vec2(0.250000, 0.333333), vec2(0.375000, 0.666667), vec2(0.500000, 0.833333),
    vec2(0.666667, 0.291667), vec2(0.750000, 0.583333), vec2(0.875000, 0.750000), vec2(0.500000, 0.416667),
    vec2(0.625000, 0.166667), vec2(0.125000, 0.625000), vec2(0.250000, 0.875000), vec2(0.875000, 0.166667)
);

/* Cubic curves as node indices: [start, ctrl, ctrl, end]. Curve 0 = focal */
const ivec4 CURVES[MAX_CURVES] = ivec4[MAX_CURVES](
    ivec4(0, 1, 2, 3),
    ivec4(9, 7, 5, 6),
    ivec4(0, 8, 4, 6),
    ivec4(10, 2, 7, 4),
    ivec4(11, 5, 3, 10),
    ivec4(1, 9, 10, 3),
    ivec4(8, 11, 6, 5)
);

const int HANDLE_OF[3] = int[3](0, 1, 3);
const int ANCHOR_NODES[10] = int[10](0, 1, 2, 3, 5, 7, 8, 9, 10, 11);

const vec4 FRAME_RECTS[3] = vec4[3](
    vec4(0.56, 0.10, 0.36, 0.34),
    vec4(0.06, 0.52, 0.26, 0.36),
    vec4(0.40, 0.62, 0.24, 0.26)
);
const int FRAME_OPEN[3] = int[3](0, 1, 2); /* 0 left, 1 top, 2 bottom */

const vec4 PLANES[2] = vec4[2](
    vec4(0.50, 0.42, 0.30, 0.16),
    vec4(0.16, 0.30, 0.20, 0.13)
);
const float PLANE_ROT[2] = float[2](-0.14, 0.10);

float hash21(vec2 p) {
    p = floor(p);
    return fract(52.9829189 * fract(dot(p, vec2(0.063, 0.008))));
}

float layeredNoise(vec2 p) {
    float n = 0.0;
    n += 0.40 * hash21(p);
    n += 0.25 * hash21(p * 2.0 + 17.0);
    n += 0.20 * hash21(p * 4.0 + 47.0);
    n += 0.10 * hash21(p * 8.0 + 113.0);
    n += 0.05 * hash21(p * 16.0 + 191.0);
    return n;
}

vec2 rot2(vec2 v, float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c) * v;
}

/* Periodic ease toward the lattice — the "alignment moment" */
float alignPulse(float t) {
    return pow(0.5 + 0.5 * sin(t * TAU / CYCLE), 10.0);
}

vec2 nodePos(int i, float t, float amp) {
    float fi = float(i);
    float ph = fi * 1.73;
    float ax = 0.020 + 0.004 * sin(fi * 2.31);
    float ay = 0.017 + 0.004 * cos(fi * 1.87);
    vec2 d = vec2(
        ax * sin(t + ph) + 0.009 * sin(t * 2.31 + ph * 1.6),
        ay * cos(t * 0.83 + ph * 1.3) + 0.010 * sin(t * 1.97 + ph * 0.8)
    );
    vec2 drifted = REST[i] + d * amp;
    return mix(drifted, mix(REST[i], ALIGNED[i], 0.65), alignPulse(t) * 0.85);
}

vec2 bezPoint(vec2 a, vec2 b, vec2 c, vec2 d, float u) {
    float v = 1.0 - u;
    return v * v * v * a + 3.0 * v * v * u * b + 3.0 * v * u * u * c + u * u * u * d;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
}

float sdBox(vec2 p, vec2 b) {
    vec2 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

/* Quintic dissolve toward the card edges — PB signature */
float edgeFade(vec2 frag, vec2 res) {
    vec2 toC = frag - 0.5 * res;
    toC.x *= res.y / max(res.x, 1.0);
    float r = length(toC) / (0.60 * res.y);
    float x = clamp(r, 0.0, 1.0);
    float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
    return 1.0 - q;
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    float aa = 1.5 / max(uResolution.y, 1.0);

    float t = uTime * uSpeed * mix(0.45, 1.0, uActive);
    float amp = mix(0.85, 1.25, uActive);
    float detail = 0.45 + 0.55 * uActive;
    float I = uIntensity;

    vec2 m = (uMouse - 0.5) * 2.0;
    float par = uInteractive * uActive;
    vec2 parS = m * vec2(9.0, 7.0) * par;

    vec3 col = uBg;
    vec3 acc = vec3(0.0);

    /* ---- modular grid, deepest layer ------------------------------------ */
    {
        vec2 gp = (frag + parS * 0.25);
        float cell = uResolution.y / 11.0;
        vec2 g = fract(gp / cell) - 0.5;
        float gdist = min(abs(g.x), abs(g.y)) * cell;
        float line = 1.0 - smoothstep(0.0, aa * 1.7, gdist - 0.5);
        float grainMask = 0.55 + 0.45 * layeredNoise(floor(gp / cell) * 0.35 + 3.0);
        acc += uInk * line * 0.045 * I * detail * grainMask;
    }

    /* ---- translucent planes --------------------------------------------- */
    for (int i = 0; i < 2; i++) {
        vec2 c = PLANES[i].xy * uResolution + parS * 0.5;
        c += vec2(sin(t * 0.27 + float(i) * 2.4), cos(t * 0.23 + float(i) * 1.8)) * 4.0;
        vec2 q = rot2(frag - c, PLANE_ROT[i]);
        float d = sdBox(q, PLANES[i].zw * 0.5 * uResolution);
        float fillv = 1.0 - smoothstep(-aa, aa, d);
        vec3 tint = mix(uDeep, uAccent, 0.22);
        acc += tint * fillv * 0.09 * I * detail;
    }

    /* ---- open composition frames ----------------------------------------- */
    for (int f = 0; f < 3; f++) {
        vec2 org = FRAME_RECTS[f].xy * uResolution + parS * 0.7;
        org += vec2(sin(t * 0.33 + float(f) * 2.1), cos(t * 0.29 + float(f) * 1.7)) * 3.0;
        vec2 hs = FRAME_RECTS[f].zw * 0.5 * uResolution;
        vec2 c0 = org - hs, c1 = org + vec2(hs.x, hs.y), c2 = org + hs, c3 = org + vec2(-hs.x, hs.y);
        int open = FRAME_OPEN[f];
        float dmin = 1e9;
        for (int s = 0; s < 4; s++) {
            if (s == open) continue;
            vec2 a = c0, b = c1;
            if (s == 1) { a = c1; b = c2; }
            else if (s == 2) { a = c2; b = c3; }
            else if (s == 3) { a = c3; b = c0; }
            dmin = min(dmin, sdSegment(frag, a, b));
        }
        float line = 1.0 - smoothstep(0.5 + aa, 0.5 + aa * 2.2, dmin);
        acc += uInk * line * 0.16 * I * detail;
    }

    /* ---- Bézier paths ----------------------------------------------------- */
    int nc = clamp(uCurveCount, 5, MAX_CURVES);
    vec2 pF = frag + parS;

    for (int ci = 0; ci < MAX_CURVES; ci++) {
        if (ci >= nc) break;
        ivec4 nd = CURVES[ci];
        vec2 P0 = nodePos(nd.x, t, amp);
        vec2 P1 = nodePos(nd.y, t, amp);
        vec2 P2 = nodePos(nd.z, t, amp);
        vec2 P3 = nodePos(nd.w, t, amp);

        float best = 1e9;
        float bt = 0.0;
        vec2 prev = P0;
        for (int k = 1; k <= 20; k++) {
            float u = float(k) / 20.0;
            vec2 q = bezPoint(P0, P1, P2, P3, u);
            float dd = sdSegment(pF, prev, q);
            if (dd < best) { best = dd; bt = u; }
            prev = q;
        }

        if (ci == 0) {
            /* Focal path — gradient-flowing accent with restrained bloom */
            float hw = mix(1.35, 1.8, uActive) * 0.5 + aa;
            float core = 1.0 - smoothstep(hw, hw + aa * 1.6, best);
            float sigma = mix(9.0, 15.0, uActive);
            float halo = exp(-(best * best) / (2.0 * sigma * sigma));
            vec3 tint = uColorCount > 0 ? texture(uGradient, vec2(bt, 0.5)).rgb : uAccent;
            tint = mix(tint, uAccent, 0.35);
            acc += tint * core * (0.85 + 0.35 * uActive) * I;
            acc += tint * halo * 0.30 * I * (0.55 + 0.45 * uActive);
        } else {
            float hw = 0.5 + aa;
            float core = 1.0 - smoothstep(hw, hw + aa * 1.4, best);
            float aI = (ci == 1 ? 0.34 : 0.20) * I * (0.55 + 0.45 * uActive);
            acc += uInk * core * aI;
            if (ci == 1) {
                acc += uInk * exp(-(best * best) / 180.0) * 0.05 * I * uActive;
            }
        }

        /* Control handles on selected curves */
        for (int hh = 0; hh < 3; hh++) {
            if (HANDLE_OF[hh] != ci) continue;
            acc += uInk * (1.0 - smoothstep(0.5 + aa, 0.5 + aa * 2.0, sdSegment(pF, P0, P1))) * 0.16 * I * detail;
            acc += uInk * (1.0 - smoothstep(0.5 + aa, 0.5 + aa * 2.0, sdSegment(pF, P3, P2))) * 0.16 * I * detail;
            for (int cc = 0; cc < 2; cc++) {
                vec2 cpt = cc == 0 ? P1 : P2;
                float cd = length(pF - cpt);
                acc += uInk * (1.0 - smoothstep(1.6, 1.6 + aa * 2.0, cd)) * 0.30 * I * detail;
            }
        }
    }

    /* ---- anchor diamonds --------------------------------------------------- */
    for (int a = 0; a < 10; a++) {
        int idx = ANCHOR_NODES[a];
        vec2 pos = nodePos(idx, t, amp) * uResolution + parS * 1.3;
        float sz = mix(3.0, 3.6, uActive);
        float d = sdBox(rot2(pF - pos, 0.7853981634), vec2(sz));
        bool accentNode = (idx == 0 || idx == 3);
        vec3 tint = accentNode ? uAccent : uInk;
        float strokeA = accentNode ? 0.90 : 0.45;
        float fillA = accentNode ? 0.35 : 0.12;
        float ring = 1.0 - smoothstep(aa, aa * 2.2, abs(d) - 0.6);
        float fill = 1.0 - smoothstep(-aa, aa, d);
        acc += tint * ring * strokeA * I * (0.6 + 0.4 * uActive);
        if (a < 3) acc += tint * fill * fillA * I * (0.6 + 0.4 * uActive);
    }

    acc *= edgeFade(frag, uResolution);
    acc += (layeredNoise(frag) - 0.5) * 0.028;

    fragColor = vec4(clamp(col + acc, 0.0, 1.0), 1.0);
}`;

const hexToRgb01 = hex => {
  let h = String(hex ?? '').trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const intVal = parseInt(h.slice(0, 6), 16);
  if (isNaN(intVal)) return [0, 0, 0];
  return [((intVal >> 16) & 255) / 255, ((intVal >> 8) & 255) / 255, (intVal & 255) / 255];
};

const DESIGN_BG_STATIC_FRAME = 16 * 0.25;

const DesignCompositionField = ({
  colors = ['#150509', '#e07a93', '#fff2f2'],
  speed = 0.5,
  intensity = 1.6,
  curveCount = 6,
  active = false,
  paused = false,
  interactive = true,
  mixBlendMode = 'lighten',
  className
}) => {
  const containerRef = useRef(null);
  const programRef = useRef(null);
  const rendererRef = useRef(null);
  const gradTexRef = useRef(null);
  const meshRef = useRef(null);
  const triRef = useRef(null);
  const canvasRef = useRef(null);
  const isVisibleRef = useRef(true);
  const pausedRef = useRef(paused);
  const activeTargetRef = useRef(active ? 1 : 0);
  const activeSmoothRef = useRef(active ? 1 : 0);
  const interactiveRef = useRef(interactive);
  const mouseTargetRef = useRef([0.5, 0.5]);
  const mouseSmoothRef = useRef([0.5, 0.5]);
  const renderOnceRef = useRef(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    activeTargetRef.current = active ? 1 : 0;
  }, [active]);

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: false,
        antialias: false
      });
    } catch (err) {
      console.error('DesignCompositionField: WebGL unavailable', err);
      return;
    }
    if (disposed) return;
    rendererRef.current = renderer;

    const gl = renderer.gl;
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.mixBlendMode =
      mixBlendMode && mixBlendMode !== 'none' ? mixBlendMode : '';
    canvasRef.current = gl.canvas;
    container.appendChild(gl.canvas);

    /* Palette ramp for the focal path: ink -> accent -> deep */
    const ramp = [
      hexToRgb01('#fff2f2'),
      hexToRgb01('#e07a93'),
      hexToRgb01('#4b1426')
    ];
    const rampData = new Uint8Array(ramp.length * 4);
    ramp.forEach(([r, g, b], i) => {
      rampData[i * 4 + 0] = Math.round(r * 255);
      rampData[i * 4 + 1] = Math.round(g * 255);
      rampData[i * 4 + 2] = Math.round(b * 255);
      rampData[i * 4 + 3] = 255;
    });
    const gradientTex = new Texture(gl, {
      image: rampData,
      width: ramp.length,
      height: 1,
      generateMipmaps: false,
      flipY: false
    });
    gradientTex.minFilter = gl.LINEAR;
    gradientTex.magFilter = gl.LINEAR;
    gradientTex.wrapS = gl.CLAMP_TO_EDGE;
    gradientTex.wrapT = gl.CLAMP_TO_EDGE;
    gradTexRef.current = gradientTex;

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: DESIGN_BG_STATIC_FRAME },
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
        uActive: { value: active ? 1 : 0 },
        uMouse: { value: [0.5, 0.5] },
        uInteractive: { value: interactive ? 1 : 0 },
        uCurveCount: { value: Math.min(7, Math.max(5, Math.round(curveCount || 6))) },
        uBg: { value: hexToRgb01(colors?.[0] ?? '#150509') },
        uAccent: { value: hexToRgb01(colors?.[1] ?? '#e07a93') },
        uInk: { value: hexToRgb01(colors?.[2] ?? '#fff2f2') },
        uDeep: { value: hexToRgb01('#4b1426') },
        uGradient: { value: gradientTex },
        uColorCount: { value: ramp.length }
      }
    });
    programRef.current = program;

    const triangle = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry: triangle, program });
    triRef.current = triangle;
    meshRef.current = mesh;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderFrame = () => {
      if (!program?.uniformLocations || !mesh) return;
      try {
        renderer.render({ scene: mesh });
      } catch (err) {
        console.error(err);
      }
    };

    const rafRef = { current: 0 };

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      if (reduced || !rafRef.current) renderFrame();
    };

    let ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(resize);
      ro.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    const onPointer = e => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
      mouseTargetRef.current = [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)];
    };
    container.addEventListener('pointermove', onPointer, { passive: true });

    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        entries => {
          if (entries[0]) isVisibleRef.current = entries[0].isIntersecting;
        },
        { root: null, threshold: 0.01 }
      );
      io.observe(container);
    }

    const onVis = () => {};
    document.addEventListener('visibilitychange', onVis);

    let last = performance.now();
    let accumTime = DESIGN_BG_STATIC_FRAME;
    renderOnceRef.current = () => {
      program.uniforms.uTime.value = accumTime;
      renderFrame();
    };

    const update = now => {
      rafRef.current = requestAnimationFrame(update);
      const dt = Math.max(0, now - last) * 0.001;
      last = now;
      if (!isVisibleRef.current || document.hidden) return;
      if (!pausedRef.current) accumTime += dt;

      const tau = 0.35;
      const ease = 1 - Math.exp(-dt / tau);
      activeSmoothRef.current +=
        (activeTargetRef.current - activeSmoothRef.current) * ease;
      const tgt = mouseTargetRef.current;
      const sm = mouseSmoothRef.current;
      sm[0] += (tgt[0] - sm[0]) * ease;
      sm[1] += (tgt[1] - sm[1]) * ease;

      program.uniforms.uTime.value = accumTime;
      program.uniforms.uActive.value = activeSmoothRef.current;
      program.uniforms.uMouse.value = sm;
      program.uniforms.uInteractive.value = interactiveRef.current ? 1 : 0;

      renderer.render({ scene: mesh });
    };

    if (!program.uniformLocations) {
      const infoLog = [
        gl.getShaderInfoLog?.(program.vertexShader),
        gl.getShaderInfoLog?.(program.fragmentShader),
        gl.getProgramInfoLog?.(program.program)
      ]
        .filter(Boolean)
        .join('\n');
      console.error('DesignCompositionField: shader failed to compile\n', infoLog || '(no details available)');
    } else if (reduced) {
      renderOnceRef.current();
    } else {
      rafRef.current = requestAnimationFrame(update);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('pointermove', onPointer);
      ro?.disconnect();
      if (!ro) window.removeEventListener('resize', resize);
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      try {
        container.removeChild(gl.canvas);
      } catch {
        /* canvas already removed */
      }
      try {
        meshRef.current?.remove?.();
        triRef.current?.remove?.();
        programRef.current?.remove?.();
      } catch {
        /* ignore dispose errors */
      }
      try {
        const glCtx = rendererRef.current?.gl;
        if (glCtx && gradTexRef.current?.texture) {
          glCtx.deleteTexture(gradTexRef.current.texture);
        }
      } catch {
        /* ignore */
      }
      programRef.current = null;
      rendererRef.current = null;
      gradTexRef.current = null;
      meshRef.current = null;
      triRef.current = null;
      canvasRef.current = null;
      renderOnceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Live uniform updates without rebuilding the context */
  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    program.uniforms.uIntensity.value = intensity;
    program.uniforms.uSpeed.value = speed;
    program.uniforms.uCurveCount.value = Math.min(7, Math.max(5, Math.round(curveCount || 6)));
    program.uniforms.uBg.value = hexToRgb01(colors?.[0] ?? '#150509');
    program.uniforms.uAccent.value = hexToRgb01(colors?.[1] ?? '#e07a93');
    program.uniforms.uInk.value = hexToRgb01(colors?.[2] ?? '#fff2f2');
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderOnceRef.current?.();
    }
  }, [intensity, speed, curveCount, colors]);

  return (
    <div
      className={`design-composition-field${className ? ` ${className}` : ''}`}
      ref={containerRef}
      aria-hidden="true"
    />
  );
};

export default DesignCompositionField;
