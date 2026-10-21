import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, type Group } from 'three';
import { fontsReady } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { FONT_FAMILY, css } from '../kit/theme';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

export interface ArticleCard {
  id: number;
  title: string;
  meta: string;
  tag: string;
  url: string;
}

interface ArticleDeckProps {
  cards: ArticleCard[];
}

const W = 2.6;
const H = 1.7;

function wrap(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1] ?? ''}…`;
    return kept;
  }
  return lines;
}

/** Paints one article as a card: accent bar, tag, wrapped title and the date / reading time. */
function drawCard(card: ArticleCard, accent: string): CanvasTexture {
  const w = 900;
  const h = Math.round((w * H) / W);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d');
  if (c) {
    const gradient = c.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#12304a');
    gradient.addColorStop(1, '#0a1826');
    c.fillStyle = gradient;
    c.beginPath();
    c.roundRect(0, 0, w, h, 32);
    c.fill();
    c.strokeStyle = 'rgba(158,190,214,0.3)';
    c.lineWidth = 3;
    c.stroke();
    c.fillStyle = accent;
    c.fillRect(56, 56, 72, 8);

    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    c.direction = 'ltr';
    c.fillStyle = accent;
    c.font = `500 34px "${FONT_FAMILY}", sans-serif`;
    c.fillText(`#${card.tag}`, 56, 120);

    c.fillStyle = css.snow;
    c.font = `600 56px "${FONT_FAMILY}", sans-serif`;
    wrap(c, card.title, w - 112, 3).forEach((line, i) => c.fillText(line, 56, 206 + i * 68));

    c.fillStyle = css.mist;
    c.font = `400 32px "${FONT_FAMILY}", sans-serif`;
    c.fillText(card.meta, 56, h - 52);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const ACCENTS = [css.saffron, css.teal, css.violet, css.sky, css.rose];

/** Articles fanned like a hand of cards. Move across the deck to bring one forward; click to read it. */
function Deck({ cards }: ArticleDeckProps) {
  useFitCamera(4.8, 2.3);
  const motion = useMotionFactor();
  const slots = useRef<(Group | null)[]>([]);
  const [textures, setTextures] = useState<CanvasTexture[] | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const smooth = useRef<number>((cards.length - 1) / 2);

  useEffect(() => {
    let live = true;
    let built: CanvasTexture[] = [];
    void fontsReady(cards.map((card) => card.title).join(' ')).then(() => {
      if (!live) return;
      built = cards.map((card, i) => drawCard(card, ACCENTS[i % ACCENTS.length] ?? css.saffron));
      setTextures(built);
    });
    return () => {
      live = false;
      built.forEach((texture) => texture.dispose());
    };
  }, [cards]);

  useFrame(({ clock, pointer }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const middle = (cards.length - 1) / 2;
    // Pointer x picks which card leads; with no pointer the lead drifts slowly through the deck.
    const wanted =
      focus !== null ? focus : motion === 0 ? middle : middle + Math.sin(clock.elapsedTime * 0.5) * Math.min(middle, 1.2);
    smooth.current += (wanted - smooth.current) * Math.min(1, delta * 5);
    slots.current.forEach((slot, i) => {
      if (!slot) return;
      const d = i - smooth.current;
      const near = Math.max(0, 1 - Math.abs(d));
      const spread = cards.length > 1 ? 1.45 : 0;
      slot.position.set(d * spread, -Math.abs(d) * 0.05 + near * 0.18, near * 0.9 - Math.abs(d) * 0.08);
      slot.rotation.set(-pointer.y * 0.12 * near, -d * 0.2 + pointer.x * 0.12 * near, -d * 0.05);
      const scale = 0.9 + near * 0.18;
      slot.scale.setScalar(scale);
    });
  });

  if (!textures) return null;

  return (
    <group position={[0, -0.1, 0]}>
      {cards.map((card, i) => {
        const texture = textures[i];
        if (!texture) return null;
        return (
          <group
            key={card.id}
            ref={(slot) => {
              slots.current[i] = slot;
            }}
          >
            <mesh
              onPointerOver={(event) => {
                event.stopPropagation();
                setFocus(i);
              }}
              onPointerOut={() => setFocus((current) => (current === i ? null : current))}
              onClick={(event) => {
                event.stopPropagation();
                window.open(card.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <planeGeometry args={[W, H]} />
              <meshBasicMaterial map={texture} transparent toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function ArticleDeck(props: ArticleDeckProps) {
  return (
    <SceneFrame fov={36} position={[0, 0, 4.8]}>
      <Deck {...props} />
    </SceneFrame>
  );
}
