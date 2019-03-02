const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// https://www.shadertoy.com/view/Mt2XDV
const scanlinesGlsl = `
uniform float uTime;
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float scanline = sin(vUv.y * uResolution.y * 1.4) * 0.04 * 2.0;
  gl_FragColor = color - scanline;
}
`;

// https://www.shadertoy.com/view/Ms3XWH
const colorBleedGlsl = `
uniform float uTime;
uniform sampler2D tDiffuse;
varying vec2 vUv;

const float colorOffsetIntensity = 2.3;

void main() {
  vec2 offsetR = vec2(0.006 * sin(uTime), 0.0) * colorOffsetIntensity;
  vec2 offsetG = vec2(0.0073 * (cos(uTime * 0.97)), 0.0) * colorOffsetIntensity;

  float r = texture2D(tDiffuse, vUv + offsetR).r;
  float g = texture2D(tDiffuse, vUv + offsetG).g;
  float b = texture2D(tDiffuse, vUv).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

// https://github.com/mattdesl/lwjgl-basics/wiki/ShaderLesson3
const vignetteGlsl = `
uniform float uTime;
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
varying vec2 vUv;

const float radius = 0.75;
const float softness = 0.45;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
	vec2 position = (gl_FragCoord.xy / uResolution.xy) - vec2(0.5);
	float len = length(position);
	float vignette = smoothstep(radius, radius - softness, len);

  gl_FragColor = vec4(mix(color.rgb, color.rgb * vignette, 0.5).rgb, 1.0);
}
`;

// https://www.shadertoy.com/view/4lB3Dc
const interlaceGlsl = `
uniform float uTime;
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
varying vec2 vUv;

const float radius = 0.75;
const float softness = 0.45;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  // vec2 offsetUv = vec2(vUv.x + (rand(vec2(uTime, gl_FragCoord.y)) - 0.5) / 64.0, vUv.y);
  vec2 offsetUv = vec2(vUv.x + mod(gl_FragCoord.y, 2.0) * .01, vUv.y);
  gl_FragColor = texture2D(tDiffuse, offsetUv);
}
`;

const ScanlinesShader = {
	uniforms: uniforms(),
	vertexShader,
	fragmentShader: scanlinesGlsl,
};

const ColorBleedShader = {
  uniforms: uniforms(),
	vertexShader,
	fragmentShader: colorBleedGlsl,
}

const VignetteShader = {
  uniforms: uniforms(),
	vertexShader,
	fragmentShader: vignetteGlsl,
}

const InterlaceShader = {
  uniforms: uniforms(),
	vertexShader,
	fragmentShader: interlaceGlsl,
}

function uniforms() {
  return {
    tDiffuse: new THREE.Uniform(new THREE.Texture()),
    uTime: new THREE.Uniform(new Number()),
    uResolution: new THREE.Uniform(new THREE.Vector2()),
  };
}