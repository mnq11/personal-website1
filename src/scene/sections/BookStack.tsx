import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Group,
  type Mesh,
} from 'three';
import { fontsReady } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { createRandom } from '../sampling';
import { FONT_FAMILY } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useMotionFactor } from '../kit/useMotion';

export interface BookData {
  code: string;
  title: string;
  credits: number;
  cycle: 1 | 2;
  distinction: boolean;
  direction: 'ltr' | 'rtl';
}

interface BookStackProps {
  books: BookData[];
  active: string | null;
  onHover: (code: string | null) => void;
}

const UNIT = 0.024; // stack height per credit
const DEPTH = 2.3;

const covers = {
  1: ['#1c4a63', '#1f5a6e', '#174257', '#22667a', '#1a5266'],
  2: ['#3b3577', '#463f8a', '#342f6b', '#504896'],
} as const;

/** Paints a book's spine: cover colour, course name, credits, and a saffron band for distinctions. */
function drawSpine(book: BookData, cover: string): CanvasTexture {
  const w = 1024;
  const h = Math.max(48, Math.round(book.credits * 12));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d');
  if (c) {
    c.fillStyle = cover;
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.06)';
    c.fillRect(0, 0, w, h * 0.18);
    if (book.distinction) {
      c.fillStyle = '#f2b544';
      c.fillRect(w * 0.06, 0, 18, h);
      c.fillRect(w * 0.06 + 28, 0, 6, h);
    }
    const size = Math.min(h * 0.58, 46);
    c.font = `500 ${size}px "${FONT_FAMILY}", sans-serif`;
    c.fillStyle = 'rgba(232,239,243,0.92)';
    c.textBaseline = 'middle';
    c.direction = book.direction;
    c.textAlign = 'center';
    let title = book.title;
    while (c.measureText(title).width > w * 0.82 && title.length > 4) title = `${title.slice(0, -2)}…`;
    c.fillText(title, w * 0.54, h / 2);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

interface BuiltBook {
  code: string;
  geometry: BoxGeometry;
  materials: MeshStandardMaterial[];
  y: number;
  yaw: number;
  width: number;
}

function Stack({ books, active, onHover }: BookStackProps) {
  const motion = useMotionFactor();
  const { state, step } = useDragRotation({ autoSpeed: 0, maxPitch: 0.3 });
  const group = useRef<Group>(null);
  const meshes = useRef<Record<string, Mesh | null>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    void fontsReady(books.map((b) => b.title).join(' ')).then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [books]);

  const built = useMemo<BuiltBook[]>(() => {
    if (!ready) return [];
    const random = createRandom(222);
    const pages = new MeshStandardMaterial({ color: new Color('#e9e2cf'), roughness: 0.95 });
    let y = 0;
    return books.map((book, i) => {
      const thickness = book.credits * UNIT;
      const width = 1.5 + random() * 0.45;
      const depth = DEPTH - random() * 0.35;
      const palette = covers[book.cycle];
      const cover = palette[i % palette.length] ?? '#1c4a63';
      const coverMaterial = new MeshStandardMaterial({ color: new Color(cover), roughness: 0.7 });
      const spine = new MeshStandardMaterial({ map: drawSpine(book, cover), roughness: 0.6 });
      // Box faces: +x, -x, +y, -y, +z, -z. The spine faces the viewer (+z); pages show on the far edges.
      const materials = [pages, pages, coverMaterial, coverMaterial, spine, pages];
      const geometry = new BoxGeometry(width, thickness, depth);
      const placed: BuiltBook = {
        code: book.code,
        geometry,
        materials,
        y: y + thickness / 2,
        yaw: (random() - 0.5) * 0.28,
        width,
      };
      y += thickness;
      return placed;
    });
  }, [books, ready]);

  useEffect(
    () => () => {
      built.forEach((book) => {
        book.geometry.dispose();
        book.materials.forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      });
    },
    [built],
  );

  const height = books.reduce((sum, book) => sum + book.credits * UNIT, 0);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = step(delta, false);
    // Drag turns the pile; with no input it settles back to face the reader with a gentle sway.
    if (!s.dragging && Math.abs(s.velocity) < 0.05) s.yaw *= Math.pow(0.5, delta);
    const sway = Math.sin(clock.elapsedTime * 0.45) * 0.22 * motion;
    if (group.current) group.current.rotation.set(0.32 + s.pitch, s.yaw + sway, 0);
    built.forEach((book) => {
      const mesh = meshes.current[book.code];
      if (!mesh) return;
      // The pointed-at book slides out of the pile towards the viewer.
      const target = active === book.code ? 0.75 : 0;
      mesh.position.z += (target - mesh.position.z) * Math.min(1, delta * 8);
    });
  });

  return (
    <group ref={group} position={[0, -height / 2, 0]}>
      {built.map((book) => (
        <mesh
          key={book.code}
          ref={(mesh) => {
            meshes.current[book.code] = mesh;
          }}
          geometry={book.geometry}
          material={book.materials}
          position={[0, book.y, 0]}
          rotation={[0, book.yaw, 0]}
          onPointerOver={(event) => {
            event.stopPropagation();
            if (!state.current.dragging) onHover(book.code);
          }}
          onPointerOut={() => onHover(null)}
        />
      ))}
    </group>
  );
}

export default function BookStack(props: BookStackProps) {
  return (
    <SceneFrame fov={36} position={[0, 0, 12.5]}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 6, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#9c8cff" />
      <Stack {...props} />
    </SceneFrame>
  );
}
