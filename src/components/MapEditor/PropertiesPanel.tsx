// src/components/MapEditor/PropertiesPanel.tsx

import React from "react";
import { Shape, FreePath, Point } from "./shapes";

interface PropertiesPanelProps {
  editor: any; // Será tipado após separação total
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ editor }) => {
  const {
    selectedId,
    shapes,
    paths,
    pixelsPerMeter,
    setShapes,
    setPaths,
    setSelectedId,
  } = editor;

  const selectedShape = shapes.find((s: Shape) => s.id === selectedId) || null;
  const selectedPath = paths.find((p: FreePath) => p.id === selectedId) || null;

  return (
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
          <input
            type="text"
            value={selectedShape?.name || selectedPath?.name || ""}
            onChange={(e) => {
              const v = e.target.value;
              setShapes((prev: Shape[]) =>
                prev.map((s: Shape) => (s.id === selectedId ? { ...s, name: v } : s))
              );
              setPaths((prev: FreePath[]) =>
                prev.map((p: FreePath) => (p.id === selectedId ? { ...p, name: v } : p))
              );
            }}
            style={{ width: "100%", marginBottom: 8 }}
          />

          {selectedShape?.type === "rect" && (
            <>
              <label>
                Largura (m):
                <input
                  type="number"
                  value={((selectedShape.width || 0) / pixelsPerMeter).toFixed(2)}
                  step={0.1}
                  onChange={(e) => {
                    const m = +e.target.value;
                    setShapes((prev: Shape[]) =>
                      prev.map((s: Shape) =>
                        s.id === selectedId
                          ? { ...s, width: m * pixelsPerMeter }
                          : s
                      )
                    );
                  }}
                  style={{ width: "100%", margin: "4px 0" }}
                />
              </label>
              <label>
                Altura (m):
                <input
                  type="number"
                  value={((selectedShape.height || 0) / pixelsPerMeter).toFixed(2)}
                  step={0.1}
                  onChange={(e) => {
                    const m = +e.target.value;
                    setShapes((prev: Shape[]) =>
                      prev.map((s: Shape) =>
                        s.id === selectedId
                          ? { ...s, height: m * pixelsPerMeter }
                          : s
                      )
                    );
                  }}
                  style={{ width: "100%", margin: "4px 0" }}
                />
              </label>
            </>
          )}

          {selectedShape?.type === "polygon" && selectedShape.points && (() => {
            const xs = selectedShape.points.map((p: Point) => p.x);
            const ys = selectedShape.points.map((p: Point) => p.y);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            const widthM = ((maxX - minX) / pixelsPerMeter).toFixed(2);
            const heightM = ((maxY - minY) / pixelsPerMeter).toFixed(2);

            return (
              <>
                <label>
                  Largura (m):
                  <input
                    type="number"
                    value={widthM}
                    step={0.1}
                    onChange={(e) => {
                      const newW = +e.target.value;
                      const scaleX = (newW * pixelsPerMeter) / (maxX - minX);
                      setShapes((prev: Shape[]) =>
                        prev.map((s: Shape) =>
                          s.id !== selectedId || !s.points
                            ? s
                            : {
                                ...s,
                                points: s.points.map((pt: Point) => ({
                                  x: minX + (pt.x - minX) * scaleX,
                                  y: pt.y,
                                })),
                              }
                        )
                      );
                    }}
                    style={{ width: "100%", margin: "4px 0" }}
                  />
                </label>
                <label>
                  Altura (m):
                  <input
                    type="number"
                    value={heightM}
                    step={0.1}
                    onChange={(e) => {
                      const newH = +e.target.value;
                      const scaleY = (newH * pixelsPerMeter) / (maxY - minY);
                      setShapes((prev: Shape[]) =>
                        prev.map((s: Shape) =>
                          s.id !== selectedId || !s.points
                            ? s
                            : {
                                ...s,
                                points: s.points.map((pt: Point) => ({
                                  x: pt.x,
                                  y: minY + (pt.y - minY) * scaleY,
                                })),
                              }
                        )
                      );
                    }}
                    style={{ width: "100%", margin: "4px 0" }}
                  />
                </label>
              </>
            );
          })()}

          {selectedPath && (
            <>
              <label>
                Largura (m):
                <input
                  type="number"
                  value={(selectedPath.width / pixelsPerMeter).toFixed(2)}
                  step={0.1}
                  onChange={(e) => {
                    const m = +e.target.value;
                    setPaths((prev: FreePath[]) =>
                      prev.map((p: FreePath) =>
                        p.id === selectedId ? { ...p, width: m * pixelsPerMeter } : p
                      )
                    );
                  }}
                  style={{ width: "100%", margin: "4px 0" }}
                />
              </label>
              <label>
                Cor:
                <input
                  type="color"
                  value={selectedPath.color}
                  onChange={(e) =>
                    setPaths((prev: FreePath[]) =>
                      prev.map((p: FreePath) =>
                        p.id === selectedId ? { ...p, color: e.target.value } : p
                      )
                    )
                  }
                  style={{ width: "100%", margin: "4px 0" }}
                />
              </label>
            </>
          )}

          <button
            onClick={() => {
              setShapes((prev: Shape[]) => prev.filter((s: Shape) => s.id !== selectedId));
              setPaths((prev: FreePath[]) => prev.filter((p: FreePath) => p.id !== selectedId));
              setSelectedId(null);
            }}
            style={{ marginTop: 10, width: "100%" }}
          >
            🗑️ Excluir
          </button>
        </>
      ) : (
        <p>Nenhum item selecionado</p>
      )}
    </div>
  );
};
