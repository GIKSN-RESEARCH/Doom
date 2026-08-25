// Vertex + fragment shader source for NeuralTunnel.
// GLSL ES 3.00 (WebGL2). All tunable values are uniforms, so prop changes
// never trigger a shader recompile.

export const vertexShaderSource = `#version 300 es
// Fullscreen triangle via gl_VertexID. No vertex attributes needed.
void main() {
  vec2 pos = vec2((gl_VertexID == 2) ? 3.0 : -1.0,
                  (gl_VertexID == 1) ? 3.0 : -1.0);
  gl_Position = vec4(pos, 0.0, 1.0);
}`;

export const fragmentShaderSource = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

#define MAX_LAYERS 34
// 1000 * 2*PI. The gyroid is exactly 2π-periodic on every axis, so wrapping
// the camera's z position to a multiple of 2π produces an invisible reset
// regardless of u_speed. 1000x keeps float32 precision healthy for hours.
#define PERIOD 6283.18530718
#define TAU 6.28318530718

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouseSmoothed;
uniform int   u_cursorInteraction;
uniform float u_cursorShift;

uniform int   u_layers;
uniform float u_falloff;
uniform float u_blend;
uniform float u_feedback;
uniform float u_amplitude;
uniform float u_scale;

uniform float u_perspective;
uniform float u_zoom;
uniform float u_speed;

uniform float u_bands;
uniform float u_phase;
uniform float u_spread;
uniform float u_gamut;
uniform float u_contrast;
uniform float u_vignette;
uniform vec3  u_color;
uniform vec3  u_hotColor;
uniform vec3  u_backgroundColor;
uniform float u_opacity;
uniform float u_transparent; // 1.0 if backgroundColor === "transparent", else 0.0

float gyroid(vec3 p) {
  return dot(sin(p), cos(p.yzx));
}

float smin(float a, float b, float k) {
  k = max(k, 1e-4);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float tunnelField(vec3 p) {
  float d = 1e5;
  float amp = u_amplitude;
  vec3 q = p * u_scale;

  for (int i = 0; i < MAX_LAYERS; i++) {
    if (i >= u_layers) break;
    float g = gyroid(q) * amp;
    d = smin(d, g, u_blend);
    q = q * u_falloff + g * u_feedback;
    amp /= u_falloff;
  }
  return d;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  uv *= u_zoom;

  // Wrap camera z to a multiple of 2π. Field state matches exactly at the
  // wrap, so the reset is invisible for any value of u_speed.
  float z = mod(u_time * u_speed, PERIOD);
  vec3 ro = vec3(0.0, 0.0, z);

  vec3 rd = normalize(vec3(uv, u_perspective));
  if (u_cursorInteraction == 1) {
    rd.xy += u_mouseSmoothed * u_cursorShift;
    rd = normalize(rd);
  }

  float t = 0.0;
  float glowAccum = 0.0;

  for (int i = 0; i < 96; i++) {
    vec3 p = ro + rd * t;
    float d = tunnelField(p);
    glowAccum += 0.02 / (0.02 + d * d);
    if (abs(d) < 0.001 || t > 40.0) break;
    t += d * 0.5;
  }

  float depth = t;
  // Energy pulses travel FORWARD through the tunnel, locked to camera z and
  // hit-depth (not wall-clock time), so they read as motion along the flight
  // path instead of a global brighten/fade of the whole frame.
  float pulse = 0.58 + 0.42 * sin(z * 0.9 - depth * 1.4);
  float glow = clamp(glowAccum * pulse, 0.0, 1.0);

  vec3 spreadOffset = u_spread * vec3(0.0, 0.33, 0.67);
  vec3 pal = 0.5 + 0.5 * cos(TAU * (u_bands * depth * 0.02 + u_phase + spreadOffset));
  pal = clamp(pal * u_gamut, 0.0, 1.0);

  vec3 col = mix(u_color, u_hotColor, glow);
  col *= mix(vec3(1.0), pal, 0.6);
  col = pow(max(col, 0.0), vec3(u_contrast));

  float vig = smoothstep(1.3, 0.2, length(uv));
  col *= mix(1.0, vig, u_vignette);

  vec3 finalColor = mix(u_backgroundColor, col, u_opacity);
  // When transparent, the framebuffer alpha carries u_opacity so the page
  // shows through; otherwise alpha is 1 and the canvas is opaque.
  float alpha = mix(1.0, u_opacity, u_transparent);
  fragColor = vec4(finalColor, alpha);
}`;
