/**
 * Particle shaders.
 *
 * Each particle carries three home positions — in the Latin name, the Arabic name and the open
 * "sky" field — and the vertex shader blends between them:
 *   uAssemble  0 → 1  sky to name, the one-off intro
 *   uMorph     0 → 1  Latin to Arabic, with a staggered, arcing flight per particle
 *   uScatter   0 → 1  name back to sky as the visitor scrolls past the hero
 *   uGreet     0 → 1  sky into a trilingual greeting when the contact section arrives
 *   uWorld     0 → 1  part of the sky gathers into the shape of the section being read (uPlace)
 * A click adds a short-lived burst (uBurst) that blows the letters apart around the click point.
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

  float hash11(float n) {
    return fract(sin(n * 127.1) * 43758.5453);
  }

  vec3 rotateY(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }

  vec3 rotateX(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
  }

  // One point of shape id (the sections, in page order), in roughly unit space.
  // a, b, c are independent per-particle random numbers; t is time for the moving shapes.
  vec3 shapeAt(float id, float a, float b, float c, float t) {
    if (id < 0.5) {
      // About: the orbit of traits, a tilted ring.
      float angle = a * 6.2831853;
      vec3 p = vec3(cos(angle), (c - 0.5) * 0.1, sin(angle)) * (1.0 + (b - 0.5) * 0.1);
      return rotateX(p, 0.7);
    }
    if (id < 1.5) {
      // Numbers: a skyline of columns.
      float slot = floor(a * 7.0);
      float height = 0.35 + 0.65 * hash11(slot * 7.3 + 1.0);
      return vec3((slot - 3.0) * 0.3 + (fract(a * 7.0) - 0.5) * 0.14, -0.5 + b * height, (c - 0.5) * 0.14);
    }
    if (id < 2.5) {
      // Skills: the globe, a thin shell of points.
      float y = 1.0 - 2.0 * a;
      float r = sqrt(max(1.0 - y * y, 0.0));
      float angle = b * 6.2831853;
      return vec3(cos(angle) * r, y, sin(angle) * r) * (0.9 + c * 0.1);
    }
    if (id < 3.5) {
      // Experience: three strands twisting upwards through the years.
      float strand = floor(c * 3.0);
      float angle = a * 6.2831853 * 2.2 + strand * 2.0944;
      return vec3(cos(angle) * 0.42, (a - 0.5) * 2.0, sin(angle) * 0.42) + (vec3(b, c, a) - 0.5) * 0.04;
    }
    if (id < 4.5) {
      // Projects: a ring of cards, each drawn as an outline.
      float slot = floor(a * 6.0);
      float angle = slot / 6.0 * 6.2831853;
      vec3 centre = vec3(cos(angle), 0.0, sin(angle)) * 0.85;
      vec3 tangent = vec3(-sin(angle), 0.0, cos(angle));
      float side = floor(c * 4.0);
      float u = (b - 0.5) * 0.62;
      float v = (fract(a * 6.0) - 0.5) * 0.42;
      if (side < 0.5) v = -0.21;
      else if (side < 1.5) v = 0.21;
      else if (side < 2.5) u = -0.31;
      else u = 0.31;
      return centre + tangent * u + vec3(0.0, v, 0.0);
    }
    if (id < 5.5) {
      // Education: a stack of slabs, like the books.
      float slot = floor(a * 9.0);
      float width = 0.6 + 0.35 * hash11(slot * 3.1 + 2.0);
      return vec3((b - 0.5) * 1.8 * width + (hash11(slot * 5.7) - 0.5) * 0.12, (slot - 4.0) * 0.2 + (fract(a * 9.0) - 0.5) * 0.05, (c - 0.5) * 0.7);
    }
    // Writing: a page turning in the wind.
    float x = (a - 0.5) * 2.0;
    float z = (b - 0.5);
    return vec3(x, sin(x * 3.2 + t * 1.2 + z * 2.0) * 0.22 + (c - 0.5) * 0.03, z);
  }

  vec3 worldAccent(float id) {
    if (id < 0.5) return vec3(0.36, 0.84, 0.75);
    if (id < 1.5) return vec3(0.95, 0.71, 0.27);
    if (id < 2.5) return vec3(0.61, 0.55, 1.0);
    if (id < 3.5) return vec3(0.36, 0.84, 0.75);
    if (id < 4.5) return vec3(0.43, 0.66, 1.0);
    if (id < 5.5) return vec3(0.95, 0.71, 0.27);
    return vec3(1.0, 0.56, 0.64);
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
  uniform float uGreet;
  uniform float uGreetScale;
  uniform vec2 uGreetOffset;
  uniform float uBurst;
  uniform vec2 uBurstPoint;
  uniform float uWorld;
  uniform float uPlace;
  uniform vec2 uWorldCenter;
  uniform float uWorldScale;
  uniform float uSpin;
  uniform float uWorldGain;

  attribute vec3 aLatin;
  attribute vec3 aGreeting;
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

    // The world: about half the sky gathers into the shape of the section being read, and flows
    // into the next shape as the visitor scrolls on. The name, while it is still there, wins.
    float member = step(hash11(aSeed * 17.31 + 0.7), 0.55);
    float worldAmt = uWorld * member * stagger(uWorld, fract(aSeed * 11.3), 0.6) * (1.0 - inName);
    float place = clamp(uPlace, 0.0, 6.0);
    float fromId = floor(place);
    float toId = min(fromId + 1.0, 6.0);
    float a = hash11(aSeed * 91.7 + 1.3);
    float b = hash11(aSeed * 57.3 + 7.1);
    float c = hash11(aSeed * 33.9 + 3.7);
    float between = stagger(fract(place), fract(aSeed * 5.77), 0.55);
    vec3 shape = mix(shapeAt(fromId, a, b, c, t * uMotion), shapeAt(toId, a, b, c, t * uMotion), between);
    shape = rotateX(rotateY(shape, uSpin), 0.22);
    vec3 world = shape * uWorldScale + vec3(uWorldCenter, 0.0);
    world += drift(world, t * 0.8, aSeed) * 0.03 * uMotion;
    position = mix(position, world, worldAmt);

    // The pointer parts the letters like a hand through sand.
    vec2 away = position.xy - uPointer;
    float distance = length(away);
    float push = smoothstep(uPointerRadius, 0.0, distance) * uPointerStrength * inName;
    position.xy += (away / max(distance, 1e-4)) * push * uPointerRadius * 0.55;
    position.z += push * 0.9;

    // Click burst: letters near the click fly outwards and towards the viewer, then drift home.
    vec2 fromBurst = position.xy - uBurstPoint;
    float burstDistance = length(fromBurst);
    float blast = uBurst * smoothstep(uPointerRadius * 9.0, 0.0, burstDistance) * inName;
    position.xy += (fromBurst / max(burstDistance, 1e-4)) * blast * uPointerRadius * 5.0 * (0.4 + aSeed);
    position.z += blast * (aSeed - 0.3) * 4.0;

    // Greeting near the contact section.
    float greet = stagger(uGreet, fract(aSeed * 5.31), 0.45);
    vec3 greeting = aGreeting * uGreetScale;
    greeting.xy += uGreetOffset;
    greeting += drift(greeting, t * 1.8, aSeed) * 0.012 * uMotion;
    position = mix(position, greeting, greet);
    float lit = max(inName, greet);

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float size = uSize * (0.55 + aSeed * 0.9) * mix(1.7, 1.0, lit) * mix(1.0, 0.8, worldAmt);
    gl_PointSize = size * uPixelRatio * (10.0 / -viewPosition.z);

    // Aurora gradient across the screen, with a rare saffron spark.
    vec3 teal = vec3(0.36, 0.84, 0.75);
    vec3 violet = vec3(0.61, 0.55, 1.0);
    vec3 saffron = vec3(0.95, 0.71, 0.27);
    float across = clamp(position.x / max(uField.x, 0.001) * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(teal, violet, smoothstep(0.1, 0.9, across));
    color = mix(color, saffron, step(0.972, aSeed));
    color = mix(color, vec3(0.93, 0.96, 0.98), push * 0.7);
    vec3 accent = mix(worldAccent(fromId), worldAccent(toId), between);
    color = mix(color, accent, worldAmt * 0.6);
    vColor = color;

    float twinkle = 0.75 + 0.25 * sin(t * (1.0 + aSeed * 2.0) + aSeed * 40.0) * uMotion;
    vAlpha = mix(0.5, 0.95, lit) * mix(uDim, 1.0, greet) * (0.5 + 0.5 * aSeed) * twinkle * mix(1.0, uWorldGain, worldAmt);
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
