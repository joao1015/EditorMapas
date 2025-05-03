import React, { useRef } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";

// Tipos compartilhados com MapEditor
interface Point { x: number; y: number; }
interface Shape {
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
interface FreePath {
  id: string;
  name: string;
  width: number;
  color: string;
  points: Point[];
  nameOffset: Point;
}

interface MiniMapProps {
  width: number;
  height: number;
  shapes: Shape[];
  paths: FreePath[];
  viewport: {
    x: number;
    y: number;
    scale: number;
    stageSize: { w: number; h: number };
  };
  onViewportChange: (x: number, y: number) => void;
}

export function MiniMap({
  width,
  height,
  shapes,
  paths,
  viewport,
  onViewportChange,
}: MiniMapProps) {
  const miniRef = useRef<any>(null);

  const handleClick = (e: any) => {
    const pos = miniRef.current.getPointerPosition();
    if (!pos) return;
    // converte coordenadas do mini para reais
    const realX = (pos.x / width) * viewport.stageSize.w;
    const realY = (pos.y / height) * viewport.stageSize.h;
    onViewportChange(realX, realY);
  };

  return (
    <Stage
      ref={miniRef}
      width={width}
      height={height}
      scaleX={width / viewport.stageSize.w}
      scaleY={height / viewport.stageSize.h}
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        border: "1px solid #333",
        background: "#fafafa",
      }}
      onClick={handleClick}
    >
      <Layer>
        {shapes.map((s) =>
          s.type === "rect" ? (
            <Rect
              key={s.id}
              x={s.x}
              y={s.y}
              width={s.width}
              height={s.height}
              fill="#60a5fa33"
              stroke="#60a5fa"
            />
          ) : (
            <Line
              key={s.id}
              points={s.points!.flatMap((p) => [p.x, p.y])}
              closed
              fill="#facc1533"
              stroke="#eab308"
            />
          )
        )}
        {paths.map((p) => (
          <Line
            key={p.id}
            points={p.points.flatMap((pt) => [pt.x, pt.y])}
            stroke={p.color}
            strokeWidth={p.width / (width / viewport.stageSize.w)}
            lineCap="round"
            lineJoin="round"
          />
        ))}
        <Rect
          x={viewport.x}
          y={viewport.y}
          width={viewport.stageSize.w / viewport.scale}
          height={viewport.stageSize.h / viewport.scale}
          stroke="#ff0000"
          strokeWidth={2}
          dash={[4, 2]}
        />
      </Layer>
    </Stage>
  );
}
