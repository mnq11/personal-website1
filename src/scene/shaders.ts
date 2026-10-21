/**
 * Particle shaders.
 *
 * Each particle carries three home positions — in the Latin name, the Arabic name and the open
 * "sky" field — and the vertex shader blends between them:
 *   uAssemble  0 → 1  sky to name, the one-off intro
 *   uMorph     0 → 1  Latin to Arabic, with a staggered, arcing flight per particle
 *   uScatter   0 → 1  name back to sky as the visitor scrolls past the hero
 */

const noise = /* glsl */ `
  // Cheap, smooth pseudo-curl drift; enough for ambient motion without a texture lookup.
  vec3 drift(vec3 p, float t, float seed) {
    return vec3(
      sin(t * 0.31 + seed * 6.2831 + p.y * 1.7),
      cos(t * 0.27 + seed * 4.1 + p.x * 1.3),
      sin(t * 0.22 + seed * 9.7 + p.x * 0.7)
    );
  }

  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  // Maps a global 0..1 progress to a per-particle eased progress that starts after a seeded delay.
  float stagger(float progress, float seed, float spread) {
    return easeInOutCubic(clamp((progress - seed * spread) / (1.0 - spread), 0.0, 1.0));
  }
`;

export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMotion;
  uniform float uAssemble;
  uniform float uMorph;
  uniform float uScatter;
  uniform float uScale;
  uniform vec2 uTextOffset;
  uniform vec3 uField;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uPointerRadius;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uDim;

  attribute vec3 aLatin;
  attribute vec3 aArabic;
  attribute vec3 aField;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vAlpha;

  ${noise}

  void main() {
    float t = uTime;

    // Name: Latin <-> Arabic, each particle lifting off the page plane while in flight.
    float morph = stagger(uMorph, aSeed, 0.4);
    vec3 name = mix(aLatin, aArabic, morph) * uScale;
    name.xy += uTextOffset;
    float flight = sin(morph * 3.14159265);
    name.z += flight * (aSeed - 0.5) * 2.2;
    name += drift(name, t * 1.6, aSeed) * flight * 0.18 * uMotion;
    name += drift(name, t * 2.0, aSeed) * 0.012 * uMotion;

    // Sky: wide, slow and deep.
    vec3 sky = aField * uField + drift(aField, t * 0.6, aSeed) * 0.28 * uMotion;

    float assembled = stagger(uAssemble, fract(aSeed * 7.13), 0.55);
    float scattered = stagger(uScatter, fract(aSeed * 3.71), 0.5);
    float inName = assembled * (1.0 - scattered);
    vec3 position = mix(sky, name, inName);

    // The pointer parts the letters like a hand through sand.
    vec2 away = position.xy - uPointer;
    float distance = length(away);
    float push = smoothstep(uPointerRadius, 0.0, distance) * uPointerStrength * inName;
    position.xy += (away / max(distance, 1e-4)) * push * uPointerRadius * 0.55;
    position.z += push * 0.9;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float size = uSize * (0.55 + aSeed * 0.9) * mix(1.7, 1.0, inName);
    gl_PointSize = size * uPixelRatio * (10.0 / -viewPosition.z);

    // Aurora gradient across the screen, with a rare saffron spark.
    vec3 teal = vec3(0.36, 0.84, 0.75);
    vec3 violet = vec3(0.61, 0.55, 1.0);
    vec3 saffron = vec3(0.95, 0.71, 0.27);
    float across = clamp(position.x / max(uField.x, 0.001) * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(teal, violet, smoothstep(0.1, 0.9, across));
    color = mix(color, saffron, step(0.972, aSeed));
    color = mix(color, vec3(0.93, 0.96, 0.98), push * 0.7);
    vColor = color;

    float twinkle = 0.75 + 0.25 * sin(t * (1.0 + aSeed * 2.0) + aSeed * 40.0) * uMotion;
    vAlpha = mix(0.5, 0.95, inName) * uDim * (0.5 + 0.5 * aSeed) * twinkle;
  }
`;

export const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = pow(smoothstep(0.5, 0.0, d), 1.7);
    if (disc < 0.01) discard;
    gl_FragColor = vec4(vColor, disc * vAlpha);
  }
`;
