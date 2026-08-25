/**
 * Neural Tunnel — WebGL2 helpers
 *
 * Thin, allocation-free utilities for shader compilation, uniform upload,
 * and hex→linear-RGB conversion.
 */

// ─── Shader compilation ────────────────────────────────────────────────────

export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error(`Program link error: ${info}`);
  }
  // Shaders can be detached after linking
  gl.detachShader(program, vs);
  gl.detachShader(program, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

// ─── Uniform location cache ───────────────────────────────────────────────

export type UniformLocations = Record<string, WebGLUniformLocation | null>;

export function getUniformLocations(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: string[]
): UniformLocations {
  const locs: UniformLocations = {};
  for (const name of names) {
    locs[name] = gl.getUniformLocation(program, name);
  }
  return locs;
}

// ─── Hex colour → linear RGB ──────────────────────────────────────────────

const _hexCache = new Map<string, [number, number, number]>();

export function hexToLinearRGB(hex: string): [number, number, number] {
  const cached = _hexCache.get(hex);
  if (cached) return cached;

  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  const num = parseInt(cleaned, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  // sRGB → linear
  const toLinear = (c: number) => Math.pow(c, 2.2);
  const result: [number, number, number] = [toLinear(r), toLinear(g), toLinear(b)];
  _hexCache.set(hex, result);
  return result;
}

// ─── Full disposal ────────────────────────────────────────────────────────

export function disposeGLResources(
  gl: WebGL2RenderingContext | null,
  program: WebGLProgram | null,
  vao: WebGLVertexArrayObject | null
) {
  if (!gl) return;
  if (vao) {
    gl.deleteVertexArray(vao);
  }
  if (program) {
    gl.deleteProgram(program);
  }
}
