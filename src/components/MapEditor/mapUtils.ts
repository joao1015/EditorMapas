// src/components/MapEditor/utils.ts

import { Point } from "./shapes";

export function snapToGrid(x: number, y: number, useSnap: boolean, gridSize: number = 10): Point {
  if (!useSnap) return { x, y };
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

export function calculateLength(pts: Point[]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return total;
}
