import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import { fontsReady } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { FONT_FAMILY, css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';

export interface PanelData {
  id: string;
  name: string;
  kind: string;
  years: string;
  stack: string[];
  accent: string;
  direction: 'ltr' | 'rtl';
}

interface ProjectRingProps {
  panels: PanelData[];
  active: number;
  onSelect: (index: number) => void;
}

const PANEL_W = 3.2;
const PANEL_H = 2;

/** Draws one project card: accent edge, kind, name, years and a row of stack chips. */
function drawPanel(panel: PanelData): CanvasTexture {
  const w = 1024;
  const h = 640;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d');
  if (c) {
    const gradient = c.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#102a3f');
    gradient.addColorStop(1, '#0a1826');
    c.fillStyle = gradient;
    c.beginPath();
    c.roundRect(0, 0, w, h, 36);
    c.fill();
    c.strokeStyle = 'rgba(158,190,214,0.28)';
    c.lineWidth = 3;
    c.stroke();

    // Accent glow in the corner, coloured by project type.
    const glow = c.createRadialGradient(w * 0.9, h * 0.1, 0, w * 0.9, h * 0.1, w * 0.6);
    glow.addColorStop(0, `${panel.accent}55`);
    glow.addColorStop(1, `${panel.accent}00`);
    c.fillStyle = glow;
    c.fillRect(0, 0, w, h);

    const rtl = panel.direction === 'rtl';
    const x = rtl ? w - 72 : 72;
    c.direction = panel.direction;
    c.textAlign = rtl ? 'right' : 'left';
    c.textBaseline = 'alphabetic';

    c.fillStyle = panel.accent;
    c.font = `500 40px "${FONT_FAMILY}", sans-serif`;
    c.fillText(panel.kind, x, 120);

    c.fillStyle = css.snow;
    let size = 104;
    c.font = `600 ${size}px "${FONT_FAMILY}", sans-serif`;
    while (c.measureText(panel.name).width > w - 144 && size > 56) {
      size -= 4;
      c.font = `600 ${size}px "${FONT_FAMILY}", sans-serif`;
    }
    c.fillText(panel.name, x, 300);

    c.fillStyle = css.mist;
    c.font = `400 40px "${FONT_FAMILY}", sans-serif`;
    c.fillText(panel.years, x, 370);

    // Stack chips along the bottom, laid out in reading direction.
    c.font = `500 32px "${FONT_FAMILY}", sans-serif`;
    c.direction = 'ltr';
    let cursor = rtl ? w - 72 : 72;
    for (const item of panel.stack.slice(0, 4)) {
      const width = c.measureText(item).width + 44;
      const left = rtl ? cursor - width : cursor;
      if (left < 60 || left + width > w - 60) break;
      c.fillStyle = 'rgba(158,190,214,0.12)';
      c.beginPath();
      c.roundRect(left, 480, width, 64, 32);
      c.fill();
      c.fillStyle = css.snow;
      c.textAlign = 'left';
      c.fillText(item, left + 22, 524);
      cursor = rtl ? left - 14 : left + width + 14;
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function Ring({ panels, active, onSelect }: ProjectRingProps) {
  const { state, step } = useDragRotation({ autoSpeed: 0, maxPitch: 0.15, sensitivity: 0.005 });
  const group = useRef<Group>(null);
  const meshes = useRef<(Mesh | null)[]>([]);
  const [textures, setTextures] = useState<CanvasTexture[] | null>(null);
  const forced = useRef<number | null>(null);
  const reported = useRef(active);

  const count = panels.length;
  const stepAngle = (Math.PI * 2) / count;
  const radius = (count * (PANEL_W + 0.5)) / (Math.PI * 2);

  useEffect(() => {
    let live = true;
    void fontsReady(panels.map((p) => p.name + p.kind).join(' ')).then(() => {
      if (live) setTextures(panels.map(drawPanel));
    });
    return () => {
      live = false;
    };
  }, [panels]);
  useEffect(() => () => textures?.forEach((t) => t.dispose()), [textures]);

  // External selection (buttons, list, keyboard) turns the ring the shortest way round.
  useEffect(() => {
    if (active === reported.current) return;
    const s = state.current;
    const current = -s.yaw / stepAngle;
    let diff = (active - current) % count;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    forced.current = -(current + diff) * stepAngle;
    reported.current = active;
  }, [active, count, stepAngle, state]);

  const panelIndexAtFront = (yaw: number) => {
    const raw = Math.round(-yaw / stepAngle);
    return ((raw % count) + count) % count;
  };

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = step(delta, false);
    if (s.dragging) forced.current = null;

    if (forced.current !== null) {
      s.velocity = 0;
      s.yaw += (forced.current - s.yaw) * Math.min(1, delta * 7);
      if (Math.abs(forced.current - s.yaw) < 0.002) {
        s.yaw = forced.current;
        forced.current = null;
      }
    } else if (!s.dragging && Math.abs(s.velocity) < 0.6) {
      const snap = Math.round(s.yaw / stepAngle) * stepAngle;
      s.yaw += (snap - s.yaw) * Math.min(1, delta * 6);
      const front = panelIndexAtFront(s.yaw);
      if (front !== reported.current) {
        reported.current = front;
        onSelect(front);
      }
    }

    if (group.current) group.current.rotation.set(s.pitch * 0.5, s.yaw, 0);
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const facing = Math.cos(i * stepAngle + s.yaw);
      const material = mesh.material as MeshBasicMaterial;
      material.opacity = 0.15 + Math.max(0, facing) ** 2 * 0.85;
    });
  });

  if (!textures) return null;

  return (
    <group ref={group} position={[0, 0, -radius]}>
      {panels.map((panel, i) => {
        const angle = i * stepAngle;
        return (
          <mesh
            key={panel.id}
            ref={(mesh) => {
              meshes.current[i] = mesh;
            }}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, angle, 0]}
            onClick={(event) => {
              event.stopPropagation();
              if (state.current.travel < 8) onSelect(i);
            }}
          >
            <planeGeometry args={[PANEL_W, PANEL_H]} />
            <meshBasicMaterial map={textures[i] ?? null} transparent toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ProjectRing(props: ProjectRingProps) {
  return (
    <SceneFrame fov={36} position={[0, 0.35, 6.4]}>
      <Ring {...props} />
    </SceneFrame>
  );
}
