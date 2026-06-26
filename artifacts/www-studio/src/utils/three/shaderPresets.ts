export interface ShaderPreset {
  id: string;
  name: string;
  description: string;
  vertexGLSL: string;
  fragmentGLSL: string;
  uniforms: Array<{ name: string; type: 'float' | 'vec3' | 'vec2'; default: number | number[] }>;
}

export const shaderPresets: ShaderPreset[] = [
  {
    id: 'wave',
    name: 'Sine Wave',
    description: 'Vertex displacement + colour sweep',
    vertexGLSL: `varying vec2 vUv;
varying float vElevation;
uniform float time;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(pos.x * 3.0 + time) * 0.2;
  pos.z += sin(pos.y * 2.0 + time * 0.8) * 0.15;
  vElevation = pos.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`,
    fragmentGLSL: `varying vec2 vUv;
varying float vElevation;
uniform float intensity;
void main() {
  vec3 color = mix(vec3(0.1, 0.3, 0.8), vec3(0.8, 0.2, 0.6), vElevation * 2.0 + 0.5);
  color *= intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
    uniforms: [{ name: 'time', type: 'float', default: 0 }, { name: 'intensity', type: 'float', default: 1.0 }],
  },
  {
    id: 'hologram',
    name: 'Hologram',
    description: 'Scan lines + transparency flicker',
    vertexGLSL: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentGLSL: `varying vec2 vUv;
uniform float time;
void main() {
  float scanline = sin(vUv.y * 80.0 + time * 5.0) * 0.5 + 0.5;
  float flicker = sin(time * 30.0) * 0.05 + 0.95;
  vec3 color = vec3(0.4, 0.8, 1.0) * scanline * flicker;
  float alpha = 0.6 + scanline * 0.3;
  gl_FragColor = vec4(color, alpha);
}`,
    uniforms: [{ name: 'time', type: 'float', default: 0 }],
  },
  {
    id: 'lava',
    name: 'Lava',
    description: 'Animated noise colour',
    vertexGLSL: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentGLSL: `varying vec2 vUv;
uniform float time;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
void main() {
  float n = noise(vUv * 4.0 + vec2(time * 0.3, time * 0.2));
  vec3 color = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 1.0, 0.0), n);
  gl_FragColor = vec4(color, 1.0);
}`,
    uniforms: [{ name: 'time', type: 'float', default: 0 }],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Layered sine waves in fragment',
    vertexGLSL: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentGLSL: `varying vec2 vUv;
uniform float time;
void main() {
  float wave1 = sin(vUv.x * 6.0 + time) * 0.5 + 0.5;
  float wave2 = sin(vUv.x * 8.0 - time * 1.3) * 0.5 + 0.5;
  float wave3 = sin(vUv.x * 12.0 + time * 0.7) * 0.5 + 0.5;
  vec3 color = mix(vec3(0.1, 0.8, 0.4), vec3(0.3, 0.2, 0.9), wave1 * wave2);
  color += vec3(0.2, 0.4, 0.8) * wave3 * 0.3;
  gl_FragColor = vec4(color, 1.0);
}`,
    uniforms: [{ name: 'time', type: 'float', default: 0 }],
  },
  {
    id: 'glitch',
    name: 'Glitch',
    description: 'Block noise UV distortion',
    vertexGLSL: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentGLSL: `varying vec2 vUv;
uniform float time;
float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  float block = floor(vUv.y * 20.0);
  float glitch = step(0.95, rand(vec2(block, floor(time * 10.0))));
  vec2 offset = vec2(glitch * 0.05, 0.0);
  vec3 color = vec3(rand(vUv + offset), rand(vUv + offset + 0.3), rand(vUv + offset + 0.6));
  gl_FragColor = vec4(color, 1.0);
}`,
    uniforms: [{ name: 'time', type: 'float', default: 0 }],
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    description: 'Emissive pulse + bloom-friendly output',
    vertexGLSL: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentGLSL: `varying vec2 vUv;
uniform float time;
void main() {
  float pulse = sin(time * 3.0) * 0.5 + 0.5;
  vec3 color = vec3(1.0, 0.2, 0.8) * (0.5 + pulse * 0.5);
  color += vec3(0.2, 0.8, 1.0) * (1.0 - pulse) * 0.3;
  gl_FragColor = vec4(color, 1.0);
}`,
    uniforms: [{ name: 'time', type: 'float', default: 0 }],
  },
  {
    id: 'matrix',
    name: 'Matrix Rain',
    description: 'Falling character-like strips',
    vertexGLSL: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentGLSL: `varying vec2 vUv;
uniform float time;
float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  float column = floor(vUv.x * 15.0);
  float speed = rand(vec2(column, 0.0)) * 2.0 + 1.0;
  float y = fract(vUv.y * 5.0 + time * speed);
  float char = step(0.7, rand(vec2(column, floor(vUv.y * 20.0 - time * speed * 2.0))));
  vec3 color = vec3(0.0, 1.0, 0.0) * char * (1.0 - y);
  gl_FragColor = vec4(color, 1.0);
}`,
    uniforms: [{ name: 'time', type: 'float', default: 0 }],
  },
  {
    id: 'iridescent',
    name: 'Iridescent',
    description: 'View-angle dependent colour shift',
    vertexGLSL: `varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}`,
    fragmentGLSL: `varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
  vec3 color = mix(vec3(0.2, 0.5, 1.0), vec3(1.0, 0.3, 0.8), fresnel);
  color += vec3(0.1, 1.0, 0.5) * (1.0 - fresnel) * 0.3;
  gl_FragColor = vec4(color, 1.0);
}`,
    uniforms: [],
  },
];

export function getShaderPreset(id: string): ShaderPreset | undefined {
  return shaderPresets.find((p) => p.id === id);
}
