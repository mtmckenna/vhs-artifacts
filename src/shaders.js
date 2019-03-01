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
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float scanline = sin(vUv.y * 240.0) * 0.04 * 2.0;
  gl_FragColor = color - scanline;
}
`;

const ScanlinesShader = {
	uniforms: uniforms(),
	vertexShader,
	fragmentShader: scanlinesGlsl,
};

// https://www.shadertoy.com/view/Ms3XWH
const colorBleedGlsl = `
uniform float uTime;
uniform sampler2D tDiffuse;
varying vec2 vUv;
const float colorOffsetIntensity = 1.3;

void main() {
  vec2 offsetR = vec2(0.006 * sin(uTime), 0.0) * colorOffsetIntensity;
  vec2 offsetG = vec2(0.0073 * (cos(uTime * 0.97)), 0.0) * colorOffsetIntensity;

  float r = texture2D(tDiffuse, vUv + offsetR).r;
  float g = texture2D(tDiffuse, vUv + offsetG).g;
  float b = texture2D(tDiffuse, vUv).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

const ColorBleedShader = {
  uniforms: uniforms(),
	vertexShader,
	fragmentShader: colorBleedGlsl,
}

function uniforms() {
  return {
    uTime: new THREE.Uniform(new Number()),
    tDiffuse: new THREE.Uniform(new THREE.Texture()),
  };
}