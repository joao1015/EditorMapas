// src/components/MapEditor/types.ts

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: "rect" | "polygon";
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  nameOffset: Point;
}

export interface FreePath {
  id: string;
  name: string;
  width: number;
  color: string;
  points: Point[];
  nameOffset: Point;
}

export interface HistoryState {
  shapes: Shape[];
  paths: FreePath[];
  areaWidth: number;
  areaHeight: number;
}

export type Mode = "none" | "rect" | "polygon" | "path" | "line";
