/**
 * Neural Tunnel — GLSL Shader Sources
 *
 * Stored as TypeScript string constants so no .glsl loader is required.
 * Compatible with WebGL2 (GLSL ES 3.00).
 */

// ─── Vertex Shader ───────────────────────────────────────────────────────────
export const vertexShaderSource = /* glsl */ `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  vUv = vec2(x, y) * 0.5 + 0.5;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`;

// ─── Fragment Shader ─────────────────────────────────────────────────────────
export const fragmentShaderSource = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uCursor;
uniform float uCursorShift;

uniform int uLayers;
uniform float uFalloff;
uniform float uBlend;
uniform float uFeedback;
uniform float uAmplitude;
uniform float uScale;
uniform float uPerspective;
uniform float uZoom;
uniform float uSpeed;

uniform float uBands;
uniform float uPhase;
uniform float uSpread;
uniform float uGamut;
uniform float uContrast;
uniform float uVignette;
uniform vec3 uColor;
uniform vec3 uHotColor;
uniform vec3 uBgColor;
uniform float uOpacity;
uniform float uBgAlpha;

#define MAX_LAYERS 34
#define PI  3.14159265359
#define TAU 6.28318530718
#define MARCH_STEPS 56
#define MARCH_DIST  8.0

vec3 linearToSrgb(vec3 c) {
  return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2));
}

// ─── Gyroid ──────────────────────────────────────────────────────────────
float gyroid(vec3 p) {
  return dot(sin(p), cos(p.yzx));
}

mat2 rot2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// ─── Multi-octave neural field ───────────────────────────────────────────
// Returns: x = filament density, y = weighted octave index for colouring

vec2 neuralField(vec3 p) {
  float accum  = 0.0;
  float weight = uAmplitude;
  float totalW = 0.0;
  float colIdx = 0.0;
  float prev   = 0.0;
  float freq   = 1.0;

  p *= uScale;

  for (int i = 0; i < MAX_LAYERS; i++) {
    if (i >= uLayers) break;

    float fi = float(i);

    vec3 q = p * freq;
    q += prev * uFeedback * vec3(1.3, 1.7, 2.1);

    // Per-octave rotation for organic asymmetry
    q.xy *= rot2(fi * 0.41 + 0.7);
    q.yz *= rot2(fi * 0.31 + 1.1);

    float g = gyroid(q);

    // Filament sharpness controlled by blend
    // Lower blend → sharper filaments, higher → softer glow
    float softness = 0.04 + uBlend * 0.08;
    float d = abs(g);

    // Exponential proximity to zero-crossings (the filament surfaces)
    float intensity = weight * exp(-d * d / (softness * softness));

    accum  += intensity;
    colIdx += intensity * fi;
    totalW += intensity;

    prev = g;
    freq *= (1.0 + uFalloff * 0.45);
    weight /= max(uFalloff, 0.3);
  }

  colIdx = totalW > 0.001 ? colIdx / totalW : 0.0;
  return vec2(accum, colIdx);
}

// ─── Depth-band colour ──────────────────────────────────────────────────

vec3 depthColour(float depth, float fieldStrength) {
  float t = depth * uBands + uPhase;

  vec3 ph = vec3(0.0, uSpread * 2.1, uSpread * 4.2);

  vec3 wave = vec3(
    cos(t * TAU + ph.x),
    cos(t * TAU + ph.y),
    cos(t * TAU + ph.z)
  );
  wave = wave * 0.5 + 0.5;
  wave = pow(wave, vec3(1.0 / max(uGamut, 0.01)));

  // Blend base → hot based on wave AND field strength
  // Strong filaments get pushed toward hotColor
  float hotMix = mix(0.3, 1.0, fieldStrength);
  vec3 col = mix(uColor, uHotColor, wave * hotMix);

  // Emission boost for bright filaments
  col += uHotColor * fieldStrength * fieldStrength * 0.4;

  return col;
}

// ─── Main ────────────────────────────────────────────────────────────────

void main() {
  vec2 res = uResolution;
  float aspect = res.x / res.y;
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= aspect;

  // Ray: perspective controls FOV (low=wide, as documented)
  float fov = mix(0.4, 3.0, clamp(uPerspective, 0.0, 1.0));
  vec2 steer = uCursor * uCursorShift;

  vec3 rd = normalize(vec3(uv / uZoom + steer * 0.6, fov));
  vec3 ro = vec3(steer * 0.35, 0.0);

  float motion = uTime * uSpeed * 0.5;

  // ── Volumetric march ──────────────────────────────────────────────────
  vec3  totalCol   = vec3(0.0);
  float totalAlpha = 0.0;
  float stepLen    = MARCH_DIST / float(MARCH_STEPS);

  // Jitter start to reduce banding
  float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  float startT = jitter * stepLen * 0.5;

  for (int i = 0; i < MARCH_STEPS; i++) {
    float t = startT + float(i) * stepLen;

    vec3 pos = ro + rd * t;
    pos.z += motion;

    // Cursor parallax (nearby filaments react more)
    float parallax = 1.0 / (1.0 + t * 1.5);
    pos.xy += steer * parallax * 0.25;

    // Subtle organic breathing
    float breathe = sin(uTime * 0.3 + pos.z * 0.15) * 0.12;
    pos.x += breathe * sin(pos.z * 0.35);
    pos.y += breathe * cos(pos.z * 0.25);

    // Sample field
    vec2 field = neuralField(pos);
    float density = field.x;
    float octIdx  = field.y;

    // Gentle depth fade (linear, not quadratic — keeps deep structure visible)
    float depthFade = 1.0 / (1.0 + t * 0.3);

    // Radial tunnel mask — open center, dense walls
    float r = length(pos.xy - steer * 0.3);
    float tunnelMask = smoothstep(0.05, 1.2, r);

    float d = density * depthFade * tunnelMask;

    // Step opacity — much more generous to make filaments visible
    float stepAlpha = clamp(d * stepLen * 0.6, 0.0, 1.0);

    if (stepAlpha > 0.001) {
      // Colour tied to z-depth (moves with tunnel)
      float depthT = fract(pos.z * 0.06 + octIdx * 0.08);
      float strength = clamp(d * 0.5, 0.0, 1.0);
      vec3 col = depthColour(depthT, strength);

      // Front-to-back compositing
      totalCol   += col * stepAlpha * (1.0 - totalAlpha);
      totalAlpha += stepAlpha * (1.0 - totalAlpha);
    }

    if (totalAlpha > 0.97) break;
  }

  // ── Post-processing ───────────────────────────────────────────────────

  vec3 result = totalCol;

  // Contrast: applied gently so it deepens shadows without crushing colour
  // Use a centered power curve rather than raw pow to preserve midtones
  result = pow(max(result, vec3(0.0)), vec3(mix(1.0, uContrast, 0.6)));

  // Vignette
  float vigDist = length(vUv - 0.5) * 2.0;
  float vig = 1.0 - smoothstep(0.3, 1.5, vigDist) * uVignette;
  result *= vig;

  // Soft tonemap — prevents harsh clipping, preserves colour
  result = result / (result + vec3(0.6));
  result *= 2.2;

  // ── Final composite ───────────────────────────────────────────────────

  float finalAlpha = clamp(totalAlpha * uOpacity, 0.0, 1.0);

  vec3 srgb   = linearToSrgb(result);
  vec3 srgbBg = linearToSrgb(uBgColor);

  if (uBgAlpha > 0.5) {
    vec3 comp = mix(srgbBg, srgb, finalAlpha);
    fragColor = vec4(comp, uOpacity);
  } else {
    fragColor = vec4(srgb * finalAlpha, finalAlpha);
  }
}
`;
