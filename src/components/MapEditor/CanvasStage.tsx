// src/components/MapEditor/CanvasStage.tsx

import React from "react";
import {
  Stage,
  Layer,
  Line,
  Group,
  Rect,
  Circle,
  Text,
  Transformer,
} from "react-konva";
import { Shape, FreePath, Point } from "./shapes";
import { calculateLength } from "./mapUtils";  // função importada diretamente

interface CanvasStageProps {
  editor: any; // Você pode tipar melhor depois
}

export const CanvasStage: React.FC<CanvasStageProps> = ({ editor }) => {
  const {
    scale,
    stagePos,
    stageRef,
    trRef,
    isPanning,
    setIsPanning,
    setStagePos,
    setViewport,
    handleStageClick,
    snapToGrid,
    shapes,
    paths,
    currentPath,
    setCurrentPath,
    selectedId,
    setSelectedId,
    updatePathPoint,
    pixelsPerMeter,
    mode,
  } = editor;

  const gridSize = 10;

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth * 0.75}
      height={window.innerHeight * 0.8}
      scaleX={scale}
      scaleY={scale}
      x={stagePos.x}
      y={stagePos.y}
      draggable={isPanning}
      onMouseDown={(e) => {
        if (e.evt.button === 2) setIsPanning(true);
      }}
      onMouseUp={() => setIsPanning(false)}
      onMouseLeave={() => setIsPanning(false)}
      onClick={handleStageClick}
      onWheel={(e) => {
        e.evt.preventDefault();
        const zoomBy = 1.05;
        const newScale = e.evt.deltaY > 0 ? scale / zoomBy : scale * zoomBy;
        editor.setScale(newScale);
        setViewport((vp: any) => ({ ...vp, scale: newScale }));
      }}
      onDragMove={(e) => {
        if (isPanning) {
          const { x, y } = e.target.position();
          setStagePos({ x, y });
          setViewport((vp: any) => ({ ...vp, x: -x, y: -y }));
        }
      }}
      onContextMenu={(e) => e.evt.preventDefault()}
    >
      {/* Grid Layer */}
      <Layer>
        {Array.from({
          length: Math.ceil(window.innerWidth / (gridSize * scale)) * 2,
        }).map((_, i) => (
          <Line
            key={`v${i}`}
            points={[
              i * gridSize - window.innerWidth,
              -window.innerHeight,
              i * gridSize - window.innerWidth,
              window.innerHeight * 2,
            ]}
            stroke="#ddd"
          />
        ))}
        {Array.from({
          length: Math.ceil(window.innerHeight / (gridSize * scale)) * 2,
        }).map((_, i) => (
          <Line
            key={`h${i}`}
            points={[
              -window.innerWidth,
              i * gridSize - window.innerHeight,
              window.innerWidth * 2,
              i * gridSize - window.innerHeight,
            ]}
            stroke="#ddd"
          />
        ))}
      </Layer>

      {/* Shapes & Paths Layer */}
      <Layer>
        {shapes.map((s: Shape) => (
          <React.Fragment key={s.id}>
            <Group
              id={s.id}
              x={s.x}
              y={s.y}
              draggable
              onClick={() => setSelectedId(s.id)}
              onDragEnd={(e) => {
                if (s.type === "rect") {
                  const p = snapToGrid(e.target.x(), e.target.y());
                  editor.setShapes((prev: Shape[]) =>
                    prev.map((sh) =>
                      sh.id === s.id ? { ...sh, x: p.x, y: p.y } : sh
                    )
                  );
                } else {
                  const dx = e.target.x(),
                    dy = e.target.y();
                  editor.setShapes((prev: Shape[]) =>
                    prev.map((sh) =>
                      sh.id === s.id && sh.points
                        ? {
                            ...sh,
                            points: sh.points.map((pt: Point) => ({
                              x: pt.x + dx,
                              y: pt.y + dy,
                            })),
                          }
                        : sh
                    )
                  );
                  e.target.position({ x: 0, y: 0 });
                }
              }}
            >
              {s.type === "rect" ? (
                <Rect width={s.width} height={s.height} fill="#60a5fa" />
              ) : (
                <Line
                  points={s.points!.flatMap((p: Point) => [p.x, p.y])}
                  closed
                  fill="#facc15"
                  stroke="#eab308"
                  strokeWidth={2}
                />
              )}
            </Group>
            <Text
              x={(s.type === "rect" ? s.x : s.points![0].x) + s.nameOffset.x}
              y={(s.type === "rect" ? s.y : s.points![0].y) + s.nameOffset.y}
              text={s.name}
              fontSize={14}
              fill="#333"
              draggable
              onDragStart={(e) => (e.cancelBubble = true)}
              onDragEnd={(e) => {
                const baseX = s.type === "rect" ? s.x : s.points![0].x;
                const baseY = s.type === "rect" ? s.y : s.points![0].y;
                const offX = e.target.x() - baseX;
                const offY = e.target.y() - baseY;
                editor.setShapes((prev: Shape[]) =>
                  prev.map((sh) =>
                    sh.id === s.id
                      ? { ...sh, nameOffset: { x: offX, y: offY } }
                      : sh
                  )
                );
              }}
            />
          </React.Fragment>
        ))}

        {paths.map((p: FreePath) => (
          <React.Fragment key={p.id}>
            <Line
              id={p.id}
              points={p.points.flatMap((pt: Point) => [pt.x, pt.y])}
              stroke={p.color}
              strokeWidth={p.width}
              lineCap="round"
              lineJoin="round"
              onClick={() => setSelectedId(p.id)}
            />
            {p.points.map((pt: Point, i: number) => (
              <Circle
                key={`${p.id}-pt-${i}`}
                x={pt.x}
                y={pt.y}
                radius={5}
                fill="#f87171"
                draggable
                onDragMove={(e) =>
                  updatePathPoint(p.id, i, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
              />
            ))}
            <Text
              x={p.points[0].x + p.nameOffset.x}
              y={p.points[0].y + p.nameOffset.y}
              text={`${p.name} (~${calculateLength(p.points).toFixed(1)}m)`}
              fontSize={14}
              fill="#333"
              draggable
              onDragStart={(e) => (e.cancelBubble = true)}
              onDragEnd={(e) => {
                const offX = e.target.x() - p.points[0].x;
                const offY = e.target.y() - p.points[0].y;
                editor.setPaths((prev: FreePath[]) =>
                  prev.map((pp) =>
                    pp.id === p.id
                      ? { ...pp, nameOffset: { x: offX, y: offY } }
                      : pp
                  )
                );
              }}
            />
          </React.Fragment>
        ))}

        {currentPath.length > 0 && (
          <Line
            points={currentPath.flatMap((p: Point) => [p.x, p.y])}
            stroke="#f59e0b"
            strokeWidth={4}
            dash={[10, 5]}
            lineCap="round"
            lineJoin="round"
          />
        )}

        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
        />
      </Layer>
    </Stage>
  );
};
