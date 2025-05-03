export type ShapeType = "rect" | "circle";

export interface ShapeData {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  name: string;
}

export interface LinkData {
  fromId: string;
  toId: string;
}
