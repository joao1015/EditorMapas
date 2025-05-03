"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Group,
  Rect,
  Line,
  Circle,
  Text,
  Transformer,
} from "react-konva";
import { v4 as uuidv4 } from "uuid";

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
type Mode = "none" | "rect" | "polygon" | "path" | "line";

export default function MapEditor() {
  // Área e escala
  const [areaWidth, setAreaWidth] = useState(40);
  const [areaHeight, setAreaHeight] = useState(25);
  const areaTotal = areaWidth * areaHeight;
  const pixelsPerMeter = Math.sqrt(
    (window.innerWidth * window.innerHeight) / Math.max(1, areaTotal)
  );

  // Estados principais
  const [useSnap, setUseSnap] = useState(true);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [paths, setPaths] = useState<FreePath[]>([]);
  const [mode, setMode] = useState<Mode>("none");
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Zoom e pan
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const gridSize = 10;

  const selectedShape = shapes.find((s) => s.id === selectedId) || null;
  const selectedPath = paths.find((p) => p.id === selectedId) || null;

  // Snap à grade
  function snapToGrid(x: number, y: number): Point {
    if (!useSnap) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }

  // Ativar modo e limpar desenho atual
  function activateMode(m: Mode) {
    setMode(m);
    setCurrentPath([]);
  }

  // Clique no palco (retângulo único; paths acumulam pontos)
  function handleStageClick() {
    if (isPanning) return;
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    const { x, y } = snapToGrid(pos.x, pos.y);

    if (mode === "rect") {
      setShapes((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "rect",
          name: `Área ${prev.length + 1}`,
          x,
          y,
          width: 100,
          height: 60,
          nameOffset: { x: 10, y: -20 },
        },
      ]);
      setMode("none");
    } else if (["polygon", "path", "line"].includes(mode)) {
      setCurrentPath((prev) => [...prev, { x, y }]);
    }
  }

  // Finalizar desenho de polígono ou corredor
  function finishDrawing() {
    if (currentPath.length < 2) {
      setMode("none");
      setCurrentPath([]);
      return;
    }
    if (mode === "polygon") {
      setShapes((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "polygon",
          name: `Área ${prev.length + 1}`,
          x: 0,
          y: 0,
          points: currentPath,
          nameOffset: { x: 10, y: -20 },
        },
      ]);
    } else {
      setPaths((prev) => [
        ...prev,
        {
          id: uuidv4(),
          name: `Corredor ${prev.length + 1}`,
          width: pixelsPerMeter * 0.5,
          color: "#4f46e5",
          points: currentPath,
          nameOffset: { x: 10, y: -20 },
        },
      ]);
    }
    setCurrentPath([]);
    setMode("none");
  }

  // Atualizar ponto de corredor ao arrastar
  function updatePathPoint(id: string, index: number, p: Point) {
    setPaths((prev) =>
      prev.map((pl) =>
        pl.id === id
          ? { ...pl, points: pl.points.map((pt, i) => (i === index ? p : pt)) }
          : pl
      )
    );
  }

  // Calcula comprimento do corredor em metros
  function calculateLength(pts: Point[]) {
    let tot = 0;
    for (let i = 1; i < pts.length; i++) {
      tot += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
    return tot / pixelsPerMeter;
  }

  // Atalhos de teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      switch (e.key) {
        case "r":
          activateMode("rect");
          break;
        case "p":
          activateMode("polygon");
          break;
        case "l":
          activateMode("path");
          break;
        case "Enter":
          finishDrawing();
          break;
        case "Delete":
          if (selectedId) {
            setShapes((s) => s.filter((sh) => sh.id !== selectedId));
            setPaths((p) => p.filter((pp) => pp.id !== selectedId));
            setSelectedId(null);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, mode, currentPath]);

  // Atualizar Transformer para destacar seleção
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (tr && stage) {
      const selNode = stage.findOne("#" + selectedId);
      tr.nodes(selNode ? [selNode] : []);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, shapes, paths]);

  return (
    <div>
      <h1>Radar Moto - Editor de Mapas</h1>

      {/* Controles de dimensão e botões */}
      <div style={{ background: "#f3f4f6", padding: 10 }}>
        <label>
          Largura (m):
          <input
            type="number"
            value={areaWidth}
            onChange={(e) => setAreaWidth(+e.target.value)}
            style={{ margin: "0 10px" }}
          />
        </label>
        <label>
          Altura (m):
          <input
            type="number"
            value={areaHeight}
            onChange={(e) => setAreaHeight(+e.target.value)}
            style={{ margin: "0 10px" }}
          />
        </label>
        <span>Área total: {areaTotal.toFixed(2)} m²</span>
        <label style={{ marginLeft: 20 }}>
          <input
            type="checkbox"
            checked={useSnap}
            onChange={(e) => setUseSnap(e.target.checked)}
          />{" "}
          Grade
        </label>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          {(["rect", "polygon", "path", "line"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => activateMode(m)}
              style={{ transition: "transform 0.1s" }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.95)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {m === "rect"
                ? "➕ Área Geométrica"
                : m === "polygon"
                ? "✏️ Área Livre"
                : m === "path"
                ? "🌐 Corredor Livre"
                : "📏 Corredor Reto"}
            </button>
          ))}
          <button
            onClick={finishDrawing}
            style={{
              background: "#10b981",
              color: "#fff",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            ✅ Finalizar
          </button>
        </div>
      </div>

      {/* Canvas com Zoom/Pan e Grade */}
      <div style={{ display: "flex" }}>
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
            const scaleBy = 1.05;
            const newScale =
              e.evt.deltaY > 0 ? scale / scaleBy : scale * scaleBy;
            setScale(newScale);
          }}
          onContextMenu={(e) => e.evt.preventDefault()}
        >
          {/* Grade de fundo */}
          <Layer>
            {Array.from({
              length:
                Math.ceil(window.innerWidth / (gridSize * scale)) * 2,
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
              length:
                Math.ceil(window.innerHeight / (gridSize * scale)) * 2,
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

          {/* Shapes e Paths */}
          <Layer>
            {shapes.map((s) => (
              <React.Fragment key={s.id}>
                <Group
                  id={s.id}
                  x={s.x}
                  y={s.y}
                  draggable
                  onClick={() => setSelectedId(s.id)}
                  onDragEnd={(e) => {
                    if (s.type === "rect") {
                      const p = snapToGrid(
                        e.target.x(),
                        e.target.y()
                      );
                      setShapes((prev) =>
                        prev.map((sh) =>
                          sh.id === s.id
                            ? { ...sh, x: p.x, y: p.y }
                            : sh
                        )
                      );
                    } else {
                      const dx = e.target.x(),
                        dy = e.target.y();
                      setShapes((prev) =>
                        prev.map((sh) =>
                          sh.id === s.id && sh.points
                            ? {
                                ...sh,
                                points: sh.points.map((pt) => ({
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
                    <Rect
                      width={s.width}
                      height={s.height}
                      fill="#60a5fa"
                    />
                  ) : (
                    <Line
                      points={s.points!.flatMap((p) => [p.x, p.y])}
                      closed
                      fill="#facc15"
                      stroke="#eab308"
                      strokeWidth={2}
                    />
                  )}
                </Group>
                <Text
                  x={
                    s.type === "rect"
                      ? s.x + s.nameOffset.x
                      : s.points![0].x + s.nameOffset.x
                  }
                  y={
                    s.type === "rect"
                      ? s.y + s.nameOffset.y
                      : s.points![0].y + s.nameOffset.y
                  }
                  text={s.name}
                  fontSize={14}
                  fill="#333"
                  draggable
                  onDragStart={(e) => (e.cancelBubble = true)}
                  onDragEnd={(e) => {
                    const baseX =
                      s.type === "rect" ? s.x : s.points![0].x;
                    const baseY =
                      s.type === "rect" ? s.y : s.points![0].y;
                    const newX = e.target.x() - baseX;
                    const newY = e.target.y() - baseY;
                    setShapes((prev) =>
                      prev.map((sh) =>
                        sh.id === s.id
                          ? {
                              ...sh,
                              nameOffset: { x: newX, y: newY },
                            }
                          : sh
                      )
                    );
                  }}
                />
              </React.Fragment>
            ))}
            {paths.map((p) => (
              <React.Fragment key={p.id}>
                <Line
                  id={p.id}
                  points={p.points.flatMap((pt) => [pt.x, pt.y])}
                  stroke={p.color}
                  strokeWidth={p.width}
                  lineCap="round"
                  lineJoin="round"
                  onClick={() => setSelectedId(p.id)}
                />
                {p.points.map((pt, i) => (
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
                  text={`${p.name} (~${calculateLength(
                    p.points
                  ).toFixed(1)}m)`}
                  fontSize={14}
                  fill="#333"
                  draggable
                  onDragStart={(e) => (e.cancelBubble = true)}
                  onDragEnd={(e) => {
                    const offX =
                      e.target.x() - p.points[0].x;
                    const offY =
                      e.target.y() - p.points[0].y;
                    setPaths((prev) =>
                      prev.map((pp) =>
                        pp.id === p.id
                          ? {
                              ...pp,
                              nameOffset: { x: offX, y: offY },
                            }
                          : pp
                      )
                    );
                  }}
                />
              </React.Fragment>
            ))}
            {currentPath.length > 0 && (
              <Line
                points={currentPath.flatMap((p) => [p.x, p.y])}
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

        {/* Painel lateral */}
        <div
          style={{
            padding: 16,
            background: "#f8fafc",
            width: 300,
          }}
        >
          <h2>Painel</h2>
          {(selectedShape || selectedPath) ? (
            <>
              {/* Nome */}
              <input
                type="text"
                value={
                  selectedShape?.name || selectedPath?.name || ""
                }
                onChange={(e) => {
                  const v = e.target.value;
                  setShapes((prev) =>
                    prev.map((s) =>
                      s.id === selectedId
                        ? { ...s, name: v }
                        : s
                    )
                  );
                  setPaths((prev) =>
                    prev.map((p) =>
                      p.id === selectedId
                        ? { ...p, name: v }
                        : p
                    )
                  );
                }}
                style={{
                  width: "100%",
                  marginBottom: 8,
                }}
              />

              {/* Retângulo */}
              {selectedShape?.type === "rect" && (
                <>
                  <label>
                    Largura (m):
                    <input
                      type="number"
                      value={(
                        (selectedShape.width || 0) /
                        pixelsPerMeter
                      ).toFixed(2)}
                      step={0.1}
                      onChange={(e) => {
                        const m = +e.target.value;
                        setShapes((prev) =>
                          prev.map((s) =>
                            s.id === selectedId
                              ? {
                                  ...s,
                                  width:
                                    m * pixelsPerMeter,
                                }
                              : s
                          )
                        );
                      }}
                      style={{
                        width: "100%",
                        margin: "4px 0",
                      }}
                    />
                  </label>
                  <label>
                    Altura (m):
                    <input
                      type="number"
                      value={(
                        (selectedShape.height ||
                          0) / pixelsPerMeter
                      ).toFixed(2)}
                      step={0.1}
                      onChange={(e) => {
                        const m = +e.target.value;
                        setShapes((prev) =>
                          prev.map((s) =>
                            s.id === selectedId
                              ? {
                                  ...s,
                                  height:
                                    m * pixelsPerMeter,
                                }
                              : s
                          )
                        );
                      }}
                      style={{
                        width: "100%",
                        margin: "4px 0",
                      }}
                    />
                  </label>
                </>
              )}

              {/* Área Livre (Polígono) */}
              {selectedShape?.type === "polygon" &&
                selectedShape.points && (
                  <>
                    {(() => {
                      const xs = selectedShape.points!.map(
                        (p) => p.x
                      );
                      const ys = selectedShape.points!.map(
                        (p) => p.y
                      );
                      const minX = Math.min(...xs),
                        maxX = Math.max(...xs);
                      const minY = Math.min(...ys),
                        maxY = Math.max(...ys);
                      const widthM = (
                        (maxX - minX) /
                        pixelsPerMeter
                      ).toFixed(2);
                      const heightM = (
                        (maxY - minY) /
                        pixelsPerMeter
                      ).toFixed(2);

                      return (
                        <>
                          <label>
                            Largura (m):
                            <input
                              type="number"
                              value={widthM}
                              step={0.1}
                              onChange={(e) => {
                                const newW =
                                  +e.target.value;
                                const scaleX =
                                  (newW *
                                    pixelsPerMeter) /
                                  (maxX - minX);
                                setShapes((prev) =>
                                  prev.map((s) => {
                                    if (
                                      s.id !==
                                        selectedId ||
                                      !s.points
                                    )
                                      return s;
                                    return {
                                      ...s,
                                      points: s.points.map(
                                        (pt) => ({
                                          x:
                                            minX +
                                            (pt.x -
                                              minX) *
                                              scaleX,
                                          y: pt.y,
                                        })
                                      ),
                                    };
                                  })
                                );
                              }}
                              style={{
                                width: "100%",
                                margin:
                                  "4px 0",
                              }}
                            />
                          </label>
                          <label>
                            Altura (m):
                            <input
                              type="number"
                              value={heightM}
                              step={0.1}
                              onChange={(e) => {
                                const newH =
                                  +e.target.value;
                                const scaleY =
                                  (newH *
                                    pixelsPerMeter) /
                                  (maxY - minY);
                                setShapes((prev) =>
                                  prev.map((s) => {
                                    if (
                                      s.id !==
                                        selectedId ||
                                      !s.points
                                    )
                                      return s;
                                    return {
                                      ...s,
                                      points: s.points.map(
                                        (pt) => ({
                                          x: pt.x,
                                          y:
                                            minY +
                                            (pt.y -
                                              minY) *
                                              scaleY,
                                        })
                                      ),
                                    };
                                  })
                                );
                              }}
                              style={{
                                width: "100%",
                                margin:
                                  "4px 0",
                              }}
                            />
                          </label>
                        </>
                      );
                    })()}
                  </>
                )}

              {/* Corredor */}
              {selectedPath && (
                <>
                  <label>
                    Largura (m):
                    <input
                      type="number"
                      value={(
                        selectedPath.width /
                        pixelsPerMeter
                      ).toFixed(2)}
                      step={0.1}
                      onChange={(e) => {
                        const m = +e.target.value;
                        setPaths((prev) =>
                          prev.map((p) =>
                            p.id === selectedId
                              ? {
                                  ...p,
                                  width:
                                    m * pixelsPerMeter,
                                }
                              : p
                          )
                        );
                      }}
                      style={{
                        width: "100%",
                        margin: "4px 0",
                      }}
                    />
                  </label>
                  <label>
                    Cor:
                    <input
                      type="color"
                      value={selectedPath.color}
                      onChange={(e) =>
                        setPaths((prev) =>
                          prev.map((p) =>
                            p.id === selectedId
                              ? {
                                  ...p,
                                  color:
                                    e.target.value,
                                }
                              : p
                          )
                        )
                      }
                      style={{
                        width: "100%",
                        margin: "4px 0",
                      }}
                    />
                  </label>
                </>
              )}

              <button
                onClick={() => {
                  setShapes((prev) =>
                    prev.filter(
                      (s) => s.id !== selectedId
                    )
                  );
                  setPaths((prev) =>
                    prev.filter(
                      (p) => p.id !== selectedId
                    )
                  );
                  setSelectedId(null);
                }}
                style={{
                  marginTop: 10,
                  width: "100%",
                }}
              >
                🗑️ Excluir
              </button>
            </>
          ) : (
            <p>Nenhum item selecionado</p>
          )}
        </div>
      </div>
    </div>
  );
}
