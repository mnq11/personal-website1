import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

export interface DragState {
  /** Accumulated rotation around the vertical axis, in radians. */
  yaw: number;
  /** Tilt around the horizontal axis, clamped to `maxPitch`. */
  pitch: number;
  velocity: number;
  dragging: boolean;
  /** Pixels moved during the current press; lets click handlers ignore drags. */
  travel: number;
}

interface DragOptions {
  autoSpeed?: number;
  maxPitch?: number;
  sensitivity?: number;
  enabled?: boolean;
}

/**
 * Pointer-drag rotation with inertia for a scene. Horizontal drags spin, vertical drags tilt a
 * little; when released the scene coasts, then settles back into a slow idle spin.
 * Call `step(delta)` from useFrame and read `state.current`.
 */
export function useDragRotation({ autoSpeed = 0.12, maxPitch = 0.45, sensitivity = 0.006, enabled = true }: DragOptions = {}) {
  const element = useThree((s) => s.gl.domElement);
  const state = useRef<DragState>({ yaw: 0, pitch: 0, velocity: 0, dragging: false, travel: 0 });

  useEffect(() => {
    if (!enabled) return;
    const target = element.parentElement ?? element;
    let lastX = 0;
    let lastY = 0;
    let pointerId: number | null = null;

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      state.current.dragging = true;
      state.current.travel = 0;
      state.current.velocity = 0;
    };
    const move = (event: PointerEvent) => {
      if (!state.current.dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      state.current.travel += Math.abs(dx) + Math.abs(dy);
      const turn = dx * sensitivity;
      state.current.yaw += turn;
      state.current.velocity = turn * 60;
      state.current.pitch = Math.max(-maxPitch, Math.min(maxPitch, state.current.pitch + dy * sensitivity * 0.6));
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      state.current.dragging = false;
      pointerId = null;
    };

    target.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      target.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [element, enabled, maxPitch, sensitivity]);

  /** Advances inertia and idle spin; returns the current state. */
  const step = (delta: number, idle = true): DragState => {
    const s = state.current;
    if (!s.dragging) {
      s.yaw += s.velocity * delta;
      s.velocity *= Math.pow(0.04, delta);
      if (idle && Math.abs(s.velocity) < autoSpeed) s.yaw += autoSpeed * delta;
      s.pitch *= Math.pow(0.35, delta);
    }
    return s;
  };

  return { state, step };
}
